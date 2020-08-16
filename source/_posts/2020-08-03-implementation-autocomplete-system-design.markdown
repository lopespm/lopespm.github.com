---
layout: post
title: "Implementation: Autocomplete System Design for Large Scale"
comments: true
#categories: games
tags: [system design]
description: "Implementation of Autocomplete / Typeahead System Design for Google Large Scale - using Docker Compose"
ogp_image: "/files/autocomplete/pintro_image_1200.png"
ogp_image_twitter: "/files/autocomplete/pintro_image_1200.png"
published: true
---

This article will go through my implementation/design of a large scale autocomplete/typeahead suggestions system design, like the suggestions one gets when typing a Google search.

This design was implemented using Docker Compose[^10], and you can find the source code here: [https://github.com/lopespm/autocomplete](https://github.com/lopespm/autocomplete)



<div style="margin-bottom: 20px">
    <div class="youtube-player" data-id="UFr5Mb7YXRg"/>
</div>
<p class="media-caption media-caption-one">YouTube video overview of this implementation</p>



<!--more-->



# Requirements

The design has to accommodate a Google-like scale of about 5 billion daily searches, which translates to about 58 thousand queries per second. We can expect 20% of these searches to be unique, this is, 1 billion queries per day.

If we choose to index 1 billion queries, with 15 characters on average per query[^12] and 2 bytes per character (we will only support the english locale), then we will need about 30GB of storage to host these queries.

## Functional Requirements

- Get a list of top phrase suggestions based on the user input (a prefix)
- Suggestions ordered by weighting the frequency and recency of a given phrase/query[^11]

The main two APIs will be:

 - *top-phrases(prefix)*: returns the list of top phrases for a given prefix
 - *collect-phrase(phrase)*: submits the searched phrase to the system. This phrase will later be used by the assembler to build a data structure which maps a prefix to a list of top phrases


## Non-Functional Requirements

- *Highly Available*
- *Performant* - response time for the top phrases should be quicker than the user's type speed (< 200ms)
- *Scalable* - the system should accommodate a large number of requests, while still maintaining its performance
- *Durable* - previously searched phrases (for a given timespan) should be available, even if there is a hardware fault or crash


# Design & Implementation

## High-level Design

<div style="margin-bottom: 7px">
{% imgopt /files/autocomplete/phigh_level_design %}
</div>

The two main sub-systems are: 

- the distributor, which handles the user's requests for the top phrases of a given prefix
- the assembler, which collects user searches and assembles them into a data structure that will later be used by the distributor


## Detailed Design

<div style="margin-top: 25px">
{% imgopt /files/autocomplete/psystem_design_diagram %}
</div>

This implementation uses off-the-shelf components like kafka (message broker), hadoop (map reduce and distributed file system), redis (distributed cache) and nginx (load balancing, gateway, reverse proxy), but also has custom services built in python, namely the trie distribution and building services. The trie data structure is custom made as well.

The backend services in this implementation are built to be self sustainable and don't require much orchestration. For example, if an active backend host stops responding, it's corresponding ephemeral znode registry eventually disappears, and another standby backend node takes its place by attempting to claim the position via an [ephemeral](https://zookeeper.apache.org/doc/r3.1.2/zookeeperProgrammers.html#Ephemeral+Nodes) [sequential](https://zookeeper.apache.org/doc/r3.1.2/zookeeperProgrammers.html#Sequence+Nodes+--+Unique+Naming) znode on zookeeper.

### Trie: the bedrock data structure

The data structure used by, and provided to the distributor is a [trie](https://en.wikipedia.org/wiki/Trie), with each of its prefix nodes having a list of top phrases. The top phrases are referenced using the [flyweight pattern](https://en.wikipedia.org/wiki/Flyweight_pattern), meaning that the string literal of a phrase is stored only once. Each prefix node has a list of top phrases, which are a list of references to string literals.

As we've seen before, we will need about 30GB to index 1 billion queries, which is about the memory we would need for the above mentioned trie to store 1 billion queries. Since we want to keep the trie in memory to enable fast lookup times for a given query, we are going to partition the trie into multiple tries, each one on a different machine. This relieves the memory load on any given machine.

For increased availability, the services hosting these tries will also have multiple replicas. For increased durability, the serialized version of the tries will be available in a distributed file system (HDFS), and these can be rebuilt via map reduce tasks in a predictable, deterministic way.


## Information Flow

### Assembler: collect data and assemble the tries

1. Client submits the searched phrase to the gateway via `http://localhost:80/search?phrase="a user query"`
2. Since the search service is outside the scope of this implementation, the gateway directly sends the searched phrase to the collector's load balancer via `http://assembler.collector-load-balancer:6000/collect-phrase?phrase="a user query"`
3. The collector's load balancer forwards the request to one of the collector backends via `http://assembler.collector:7000/collect-phrase?phrase="a user query"`
4. The collector backend sends a message to the *phrases* topic to the message broker (kafka). The key and value are the phrase itself [^1]
5. The Kafka Connect HDFS Connector `assembler.kafka-connect` dumps the messages from the *phrases* topic into the `/phrases/1_sink/phrases/{30 minute window timestamp}`[^2] folder [^3]
6. Map Reduce jobs are triggered [^4]: they will reduce the searched phrases into a single HDFS file, by weighting the recency and frequency of each phrase [^5]
	1. A `TARGET_ID` is generated, according to the current time, for example `TARGET_ID=20200807_1517`
	2. The first map reduce job is executed for the *K* [^6] most recent `/phrases/1_sink/phrases/{30 minute window timestamp}` folders, and attributes a base weight for each of these (the more recent, the higher the base weight). This job will also sum up the weights for the same phrase in a given folder. The resulting files will be stored in the `/phrases/2_with_weight/2_with_weight/{TARGET_ID}` HDFS folder
	3. The second map reduce job will sum up all the weights of a given phrase from `/phrases/2_with_weight/2_with_weight/{TARGET_ID}` into `/phrases/3_with_weight_merged/{TARGET_ID}`
	4. The third map reduce job will order the entries by descending weight, and pass them through a single reducer, in order to produce a single file. This file is placed in `/phrases/4_with_weight_ordered/{TARGET_ID}`
	5. The zookeper znode `/phrases/assembler/last_built_target` is set to the `TARGET_ID`
7. The Trie Builder service, which was listening to changes in the `/phrases/assembler/last_built_target` znode, builds a trie for each partition[^7], based on the `/phrases/4_with_weight_ordered/{TARGET_ID}` file. For example, one trie may cover the prefixes until *mod*, another from *mod* to *racke*, and another from *racke* onwards.
	1. Each trie is serialized and written into the `/phrases/5_tries/{TARGET_ID}/{PARTITION}` HDFS file (e.g. `/phrases/5_tries/20200807_1517/mod\|racke`), and the zookeeper znode `/phrases/distributor/{TARGET_ID}/partitions/{PARTITION}/trie_data_hdfs_path` is set to the previously mentioned HDFS file path.
	2. The service sets the zookeper znode `/phrases/distributor/next_target` to the `TARGET_ID`

### Transfering the tries to the Distributor sub-system

1. The distributor backend nodes can either be in active mode (serving requests) or standby mode. The nodes in standby mode will fetch the most recent tries, load them into memory, and mark themselves as ready to take over the active position. In detail:
	1. The standby nodes, while listening to changes to the znode `/phrases/distributor/next_target`, detect its modification and create an [ephemeral](https://zookeeper.apache.org/doc/r3.1.2/zookeeperProgrammers.html#Ephemeral+Nodes) [sequential](https://zookeeper.apache.org/doc/r3.1.2/zookeeperProgrammers.html#Sequence+Nodes+--+Unique+Naming) znode, for each partition, one at a time, inside the `/phrases/distributor/{TARGET_ID}/partitions/{PARTITION}/nodes/` znode. If the created znode is one of the first R znodes (R being the number of replica nodes per partition [^8]), proceed to the next step. Otherwise, remove the znode from this partition and try to join the next partition.
	2. The standby backend node fetches the serialized trie file from `/phrases/5_tries/{TARGET_ID}/{PARTITION}`, and starts loading the trie into memory.
	3. When the trie is loaded into memory, the standby backend node marks itself as ready by setting the `/phrases/distributor/{TARGET_ID}/partitions/{PARTITION}/nodes/{CREATED_ZNODE}` znode to the backend's hostname.
2. The Trie Backend Applier service polls the `/phrases/distributor/{TARGET_ID}/` sub-znodes (the `TARGET_ID` is the one defined in `/phrases/distributor/next_target`), and checks if all the nodes in all partitions are marked as ready
	1. If all of them are ready for this next `TARGET_ID`, the service, in a single transaction, changes the value of the `/phrases/distributor/next_target` znode to empty, and sets the `/phrases/distributor/current_target` znode to the new `TARGET_ID`. With this single step, all of the standby backend nodes which were marked as ready will now be active, and will be used for the following Distributor requests.


### Distributor: handling the requests for Top Phrases

With the distributor's backend nodes active and loaded with their respective tries, we can start serving top phrases requests for a given prefix:

1. Client requests the gateway for the top phrases for a given prefix via `http://localhost:80/top-phrases?prefix="some prefix"`
2. The gateway sends this request to the distributor's load balancer via `http://distributor.load-balancer:5000/top-phrases?prefix="some prefix"`
3. The load balancer forwards the request to one of the frontends via `http://distributor.frontend:8000/top-phrases?prefix="some prefix"`
4. The frontend service handles the request:
	1. The frontend service checks if the distributed cache (redis) has an entry for this prefix [^9]. If it does, return these cached top phrases. Otherwise, continue to next step
	2. The frontend service gets the partitions for the current `TARGET_ID` from zookeeper (`/phrases/distributor/{TARGET_ID}/partitions/` znode), and picks the one that matches the provided prefix
	3. The frontend service chooses a random znode from the `/phrases/distributor/{TARGET_ID}/partitions/{PARTITION}/nodes/` znode, and gets its hostname
	4. The frontend service requests the top phrases, for the given prefix, from the selected backend via `http://{BACKEND_HOSTNAME}:8001/top-phrases="some prefix"`
		1. The backend returns the list of top phrases for the given prefix, using its corresponding loaded trie
	5. The frontend service inserts the list of top phrases into the distributed cache (cache aside pattern), and returns the top phrases
5. The top phrases response bubbles up to the client


## Zookeper Znodes structure

Note: Execute the shell command `docker exec -it zookeeper ./bin/zkCli.sh` while the system is running to explore the current zookeeper's znodes.

- phrases
	- distributor
	- assembler
		- last_built_target *- set to a `TARGET_ID`*
	- distributor
		- current_target *- set to a `TARGET_ID`*
		- next_target *- set to a `TARGET_ID`*
		- `{TARGET_ID}` *- e.g. 20200728_2241*
			- partitions
				- \|*{partition 1 end}*
					- trie_data_hdfs_path *- HDFS path where the serialized trie is saved*
					- nodes
						- 0000000000
						- 0000000001
						- 0000000002
						- ...
				- *{partition 2 start}*\|*{partition 2 end}*
					- ...
				- *{partition 3 start}*\|
					- ...


## HDFS folder structure

Note: Access `http://localhost:9870/explorer.html` in your browse while the system is running to browse the current HDFS files and folders.

- phrases
	- 1_sink *- the searched phrases are dumped here, partitioned into 30min time blocks, *
		- *{e.g 20200728_2230}*
		- *{e.g 20200728_2300}*
	- 2_with_weight *- phrases with their initial weight applied, divided by time block*
		- `{TARGET_ID}`
	- 3_with_weight_merged *- consolidation of all the time blocks: phrases with their final weight*
		- `{TARGET_ID}`
	- 4_with_weight_ordered *- single file of phrases ordered by descending weight*
		- `{TARGET_ID}`
	- 5_tries *- storage of serialized tries*
		- `{TARGET_ID}`
			- \|*{partition 1 end}*
			- *{partition 2 start}*\|*{partition 2 end}*
			- *{partition 3 start}*\|


## Client interaction

You can interact with the system by accessing `http://localhost` in your browser. The search suggestions will be provided by the system as you write a query, and you can feed more queries/phrases into the system by submitting more searches.

{% imgopt /files/autocomplete/pclient_web_705 %}


# Source Code

You can get the full source code at [https://github.com/lopespm/autocomplete](https://github.com/lopespm/autocomplete). I would be happy to know your thoughts about this implementation and design.

<br/>
<hr/>
<br/>

[^1]: In this implementation, only one instance of the broker is used, for clarity. However, for a large number of incoming requests it would be best to partition this topic along multiple instances (the messages would be partitioned according to the *phrase* key), in order to distribute the load.
[^2]: */phrases/1_sink/phrases/{30 minute window timestamp} folder*: For example, provided the messages A[time: 19h02m], B[time: 19h25m], C[time: 19h40m], the messages A and B would be placed into folder */phrases/1_sink/phrases/20200807_1900*, and message C into folder */phrases/1_sink/phrases/20200807_1930*
[^3]: We could additionally pre-aggregate these messages into another topic (using Kafka Streams), before handing them to Hadoop
[^4]: For clarity, the map reduce tasks are triggered manually in this implementation via *make do_mapreduce_tasks*, but in a production setting they could be triggered via cron job every 30 minutes for example.
[^5]: An additional map reduce could be added to aggregate the */phrases/1_sink/phrases/* folders into larger timespan aggregations (e.g. 1-day, 5-week, 10-day, etc)
[^6]: Configurable in *assembler/hadoop/mapreduce-tasks/do_tasks.sh*, by the variable MAX_NUMBER_OF_INPUT_FOLDERS
[^7]: Partitions are defined in *assembler/trie-builder/triebuilder.py*
[^8]: The number of replica nodes per partition is configured via the environment variable NUMBER_NODES_PER_PARTITION in docker-compose.yml
[^9]: The distributed cache is disabled by default in this implementation, so that it is clearer for someone using this codebase for the first time to understand what is happening on each update/step. The distributed cache can be enabled via the environment variable DISTRIBUTED_CACHE_ENABLED in docker-compose.yml
[^10]: Docker compose was used instead of a container orchestrator tool like Kubernetes or Docker Swarm, since the main objective of this implementation was to build and share a system in simple manner.
[^11]: *Phrase* and *Query* are used interchangeably in this article. Inside the system though, only the term *Phrase* is used.
[^12]: The average length of a search query was [2.4 terms](https://en.wikipedia.org/wiki/Web_search_query), and the average word length in English language is [4.7 characters](https://medium.com/@wolfgarbe/the-average-word-length-in-english-language-is-4-7-35750344870f)