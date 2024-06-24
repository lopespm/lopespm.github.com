---
layout: post
title: "Personal Local (Llama3 8B) LLM extended with WhatsApp + Obsidian Data"
comments: true
categories: [machine_learning]
tags: [machine learning]
description: "Fully offline assistant using RAG / PostgreSQL vector database to augment its knowledge from personal WhatsApp messages and Obsidian notes"
ogp_image: "/files/personal_llm/pthumb.png"
ogp_image_twitter: "/files/personal_llm/pthumb.png"
published: true
---

This blog article will describe the implementation of a fully offline Llama3 8B LLM agent with access to WhatsApp Messages and Obsidian notes (or any other data sources), making it able to hold conversations about any of the topics present there. All data stays local, including the data from WhatsApp and Obsidian - it is in fact a _personal_ assistant.

Source code for this project is [available on GitHub]({% post_url 2024-06-24-personal-llm %}#source-code).

{% imgopt /files/personal_llm/showcase_interaction3 Header image of Personal LLM %}

<!--more-->

<br/>

# Motivation & Objective

## Why was this project assembled in the first place?

- I've built up a considerable personal database:
  - For more than 15 years I've been journaling and writing several notes, keeping them aggregated in the same place as I changed their hosting platform. From simple text files, passing by Evernote, and more recently into [Obsidian](https://obsidian.md/), into which I migrated all of my written notes [^1]
  - Most of my relevant correspondence for almost 10 years has been made via WhatsApp, which stores all messages locally
- I've realized how powerful it is to reflect on past events and approach them with the lenses of the new experiences and lessons I've been accumulating throughout life, but due to the considerable amount of content present in the above data stores, sometimes it is hard to reach and associate the relevant information I am looking for, even though I try to keep the above relatively organized.
- And of course, how great would it be to have a personal assistant with access to all of these, in a self-contained offline fashion?
  - Currently, state of the art Large Language Models (LLMs) such as [Llama3](https://ai.meta.com/blog/meta-llama-3/) are feasible to be run locally on a laptop, which is something that still blows my mind.
  - Pre-trained LLMs can have their capabilities augmented (as we will see below) to serve different custom purposes

All of this combined meant that it would be feasible to host a state of the art LLM in my laptop, with potential access to my personal files, without requiring this sensitive information to be hosted or processed elsewhere, which was something that had quite an appeal for me.

## Objective

Build an offline assistant with access to WhatsApp messages and Obsidian notes (or any other data sources), using components that don't fully abstract the process (similar to the approach I took when [creating a deep reinforcement learning agent to play a racing game]({% post_url 2016-10-06-deep-reinforcement-learning-racing-game %})), to learn more about how LLMs and their infrastructures work.

<br/>

# Building Blocks

## Running an offline LLM

One of the crucial pieces is actually being able to run an LLM locally. Below we will explore the hardware requirements, and software we can use.

### The more GPU cores and VRAM, the better

When running LLMs on a personal computer, there are two main factors that influence its inference performance and overall capability to even being able to run them: number of GPU cores, and available VRAM (video RAM, this is, memory available to the GPU).

- The more GPU cores available, the more operations can be processed, and machine learning algorithms are all about just finding patterns in numbers
- The more (VRAM) memory available, the bigger the model can be stored in memory and be efficiently processed. For example, if we consider Llama3 with 8 billion parameters (more information in [this video](https://www.youtube.com/watch?v=cpYqED1q6ro)) [^2]:
  - One 32 bit float value = 32 bits of memory, this is, 4 bytes (1 byte = 8 bits)
  - 8 billion parameters = 8.000.000.000 * 4 bytes = 32.000.000.000 bytes ≈ 32GB VRAM, for a full precision model (32 bit float)
  - If we would use a quantized model, this is, using lower precision floats to represent the parameters:
  - Using half precision 16 bit float parameters: 16 GB VRAM
  - Using quarter precision, 8 bit float parameters: 8 GB VRAM
  - And if we would use Llama 70 billion parameters, it would amount to 280 GB VRAM (float32), 140 GB VRAM (float16), 70 GB VRAM (float8), 35 GB VRAM(float4)

I personally own a MacBook Pro M3 Max with 40 GPU cores and 128GB of unified RAM (meaning that this memory is available to the CPU and GPU), and it just so happens that Apple Silicon computers (M1, M2, M3 chips) are very capable machines to run inference on LLMs, such as Llama3 8B (full precision), or even 70B models (I've personally tested the 70B 4bit model [^3] on this machine, and can attest that it runs well and in bounds of memory available, as seen on the calculations above)

### Running the inference

There are several methods or libraries that can be used for running a LLM in a personal computer. One of the most approachable ones is [ollama](https://www.ollama.com/), which effortlessly allows you (after a quick installation step), to run Llama 3, Phi 3, Mistral, Gemma offline on your computer.

Another possible way is to load the model's definition from Hugging Face (think of it roughly as a GitHub for machine learning models), and run them via the [transformers](https://pypi.org/project/transformers/) library, which vividly encourage you to explore. The amount of freely available pre-trained models to perform tasks on different modalities such as text, vision, and audio is inspiring, to say the least.

For this project, a third option was picked, which was using [mlx_lm](https://pypi.org/project/mlx-lm/) library, that essentially still leverages the Hugging Face Hub to provide the models, but optimizes execution by leveraging [MLX](https://unfoldai.com/mlx-ml-on-apple-silicon/), an array framework crafted specifically for harnessing the power of Apple silicon, which was developed by Apple’s machine learning research team.


## Augmenting the LLM's Knowledge

Now that our LLM is running locally, the question that follows is: how to make it aware of all the contents present in Obsidian notes and WhatsApp messages? We have a few options:

### 1. Retrain / fine tune a pre-trained LLM

The idea here is to retrain / fine tune the entire model, or parts of it, to make it knowledgeable about our contents.

A pre-trained LLM comes with the advantage of common probabilistic knowledge about a language or set of languages that can be leveraged upon, which was a result of a long and costly training process. As such, a full retraining of the model that would not retain information about its trained parameters would be out of the question. Instead, there are several ways we can leverage it:

- Freeze the existing LLM layers (all or a selection of them), add also add new trainable layer layers on top of the existing LLM layers, and only train the trainable and unfreezed ones.
- [Fine tune](https://llama.meta.com/docs/how-to-guides/fine-tuning/) the existing pre-trained LLM, which essentially modifies all parameters of the model with a low training rate, in order to retain as much existing knowledge and capabilities as much as possible, and avoid [catastrophic forgetting](https://arxiv.org/html/2402.18865v1). Because these models are so massive, they are not particularly sensitive to any given parameters being off by a lot, or a little. Their overall size and complexity make up for it, so we can mostly get away with rough updates. To fine tune a model, there are essentially two ways to go about it:
  - Load all of the model's parameters into memory, and modify them directly during the learning process
  - Take advantage of the fact that you can multiply two small matrices to get a larger matrix (which is the main bread and butter of deep learning models), so we can try to find out the two smaller matrices instead, meaning that we only need to maintain those in memory. All the parameters of the model are still modified during training, but we don't need to hold them all in memory at once. That's what Low-Rank Adaptation ([LoRA](https://www.entrypointai.com/blog/lora-fine-tuning/)) fine-tuning method does, and it is one of the most popular ways to fine tune LLMs, along with its QLoRA counterpart (which uses a data type that reduces by 4x the already lower LoRA memory footprint).

Some important aspects of these techniques:

- We are compressing our documents into the LLMs internal knowledge, and we have less control of how precisely these models retain the most accurate information. These could lead to hallucinations.
- If the data we want to augment our LLM with is dynamic in nature (which for our case, I would prefer it to be, so that the assistant can have access to the most relevant information when used), this would mean that the model would need to be fine tuned every time an update should be made.
- The training data needs to be structured in a way that makes sense for the model to be used. For example, WhatsApp messages and Obsidian notes would need to be transformed into a sensible training set that would fit the tone I would aim to have for the assistant.

Given that I would want to experiment with different types of assistants and different ways to leverage and explore the data in a conversational way, and have access to the most up to date information available, which could be available in several different formats (for example, let's say I would like to augment the LLMs knowledge with historical CO2 readings of my apartment), retraining / fine tuning the model was not a very inviting approach.


### 2. Insert all documents into the prompt, as context

The idea here is to provide all the context that LLM needs, in the [prompt's context](https://llama.meta.com/docs/how-to-guides/prompting/). For example:

~~~

<|begin_of_text|><|start_header_id|>system<|end_header_id|>

You are a AI assistant which answers the user's question based on your prior knowledge
and a collection of the user's documents.

Each of the documents has the format <<document:||document_name||>>||content||.
||document_name|| represents the document name. ||content|| represents the
document's content. Don't show the <<document:||document_name||>> portion to the user.

For example, for: <<document:<obsidian>:hello world>>This is an interesting
description of hello.
- ||document_name|| is <obsidian>:hello world
- ||content|| This is an interesting description of hello.

These are the user's documents:
----------
<<document:<obsidian>:lamas running down the street>>The content for lamas
going down the street
<<document:<obsidian>:alpacas running down the street>>That time when I saw a
alpaca running down the street.
----------

<|start_header_id|>user<|end_header_id|>Tell me about that time I've seen animals
running down the street<|eot_id|>

~~~
{:lang="text"}

<br/>
This would be the most convenient approach, but the context window available to a LLM, the number of tokens it can use at one time to generate a response, is limited.

Llama3 8B for example, allows for a 8K token context window, and there have been attempts to extend it further to [80K](https://arxiv.org/pdf/2404.19553) or [262K](https://huggingface.co/gradientai/Llama-3-8B-Instruct-262k), and Google's Gemini 1.5 Pro can handle a [1 million token context window](https://blog.google/technology/ai/google-gemini-next-generation-model-february-2024/#architecture), for example.

Given that my Obsidian notes total around 8M characters in content, and my WhatsApp messages around 16M, even if we assume that an average of 1 [token](https://x.com/karpathy/status/1789590397749957117) per 4 characters, just the Obsidian notes would clock around 2M tokens, which makes this method infeasible


### 3. RAG (Retrieval Augmented Generation)

To navigate around the context window limitation, instead of inserting all the documents into the prompt's context in one go, we can instead be selective on the information we want to provide on the prompt, depending on the user's request(s).

For example, if the user asks the AI assistant "what do you think about that gaming project I did 4 years ago?", behind the scenes we can query a database, and ask it the most relevant results about gaming projects that happened about 4 years ago, and then use those documents content into the prompt's context.

That's the overall idea of RAG.

Now, many questions come up:

1. *Transforming a conversation into a query:* How do we transform the user's prompt + the context of the conversation, into a query that asks our database exactly what the main LLM needs to provide a contextual reply?
2. *Fetching contents related to a query:* How can the content database know which are the most relevant content related to a given query?

Let's explore these in the next section.

## What makes RAG tick?

### 1. Transforming a conversation into a query

In order to produce a query that transforms an entire conversation into a concise sentence that can be used to get the documents in the database that are most similar to it, we can feed in the conversation into a LLM specialized in creating summarized queries. Here is an example of prompt we can use for it:

~~~
<|begin_of_text|><|start_header_id|>system<|end_header_id|>   
You are the user's document keeper that has access to all the documents for the user.
Based on the entire conversation only, you will only reply with the question you
will ask to query the appropriate user documents, in order to get all the relevant
user's documents related to the conversation.
<|eot_id|>

<< entire conversation >>

<|start_header_id|>document keeper<|end_header_id|>
~~~
{:lang="text"}

<br/>
This is how it would it would look like with actual information about the conversation:

~~~
<|begin_of_text|><|start_header_id|>system<|end_header_id|>   
You are the user's document keeper that has access to all the documents for the user.
Based on the entire conversation only, you will only reply with the question you
will ask to query the appropriate user documents, in order to get all the relevant
user's documents related to the conversation.
<|eot_id|>

<|start_header_id|>assistant<|end_header_id|>
Hi there! I\'m a helpful AI assistant with access to your documents. What can I do for you today?
<|eot_id|>
<|start_header_id|>user<|end_header_id|>
What is the name of the first steam game I developed?
<|eot_id|>
<|start_header_id|>assistant<|end_header_id|>
Survival Ball, which you published in 2018
<|eot_id|>
<|start_header_id|>user<|end_header_id|>
which interesting things could you tell me about it?
<|eot_id|>

<|start_header_id|>document keeper<|end_header_id|>
~~~
{:lang="text"}

<br/>
This LLM's reply would be `Which are interesting facts about Survival Ball, a game developed in 2008?`.


### 2. Fetching contents related to a query

Now that we have a query, such as "Which are interesting facts about Survival Ball, a game developed in 2008?", how can we get the documents (Obsidian notes and/or WhatsApp messages) that are most relevant with that query?

One possible way would be to perform a custom decomposition of the query phrase, and attempt to look for documents that most referenced similar words to the query. This custom search would be brittle, require careful heuristics to match these, and would not completely take into account what that sentence means, and therefore the matching between query and documents would be likely unreliable.

Instead, we have a much more powerful concept at our disposal, which will help us perform this matching: text embeddings.

#### Text embeddings

The idea behind text embeddings is that if we transform a given piece of text into a vector that is in close proximity to other vectors that have a similar meaning, then from a given query text we can get the most conceptually similar pieces of text to it. [^4]

For example, if the vectors representing our text were trained to be closer together when they rhyme, then close to the word "dog", we might have the word "fog" closer to it, but "cat" further away; and conversely, if we trained these to represent their conceptual meaning, then for the word "dog", we might see the word "cat" nearer to it, but "floor" further away [^5]

A mind-boggling implication is that we can perform algebraic expressions on these vectors. For example, if our vectors were trained to represent the meaning of the text we could have the following:

- The classical example is that if grab the vectors for king, woman and man, and perform this operation: `(king + woman) - man`, the closest vector could be `queen`
- `(London + Japan) - England -> Tokyo`
- `(boat - fly) - airplane -> sail`
- `(cow - oink) - pig -> moos`

Likewise, if we probe which are the closest pieces of text related to `dog`, we could get `dogs, puppy, pit_bull, pooch`

These examples were takes from an actual working [word2vec](https://en.wikipedia.org/wiki/Word2vec) model that was trained on a google news dataset, which I invite you to explore in this [Google Colab notebook](https://colab.research.google.com/drive/1qxnNUojAzIniOXwFZi4y7NlWk4cTzIMZ?usp=sharing).

<center>
  <div class="image-mosaic">
  <div
  class="image-mosaic-card image-mosaic-card-tall image-mosaic-card-wide"
  style="background-image: url('{{ root_url }}/files/personal_llm/google_colab_word2vec.png')"
  ></div>
  </div>
  <figcaption class='media-caption' style="margin-top: -7px; margin-bottom: 24px;"> Exploring the above examples using a <a href="https://colab.research.google.com/drive/1qxnNUojAzIniOXwFZi4y7NlWk4cTzIMZ?usp=sharing">word2vec model in Google Colab</a></figcaption>
</center>

For our project's objective, the most relevant property is the latter one. Given query text, we would transform it into a vector, and get the closest vectors in our document (vector) database, which in our project will be supported by a PostgreSQL database using the [pgvector](https://github.com/pgvector/pgvector) extension. More about this below.


# Putting it all together

With the prior knowledge for the previous section, we are now in a position to build an system architecture that would best fit our objective:

{% imgcap /files/personal_llm/architecture.png Personal LLM Architecture %}

The overall idea is that we have a Llama3 8B LLM powering the main AI assistant, which has its knowledge augmented via RAG (Retrieval Augmented Generation) by using another Llama3 8B LLM to generate queries used to retrieve documents from a vector database powered by PostgreSQL. These retrieved documents are then added to the main LLM's context, and the LLM generates a response based on the retrieved documents + user's prompt + ongoing conversation. Below are further details for these.

1. First *prepare documents and store them* in a vector database.
2. and then, when using the chat interface, *evaluate the user's input and conversation*, query the vector database for relevant documents, add them as context into the main LLMs prompt, which will output the response that the user will see.




## Document preparation and storage

Before anything else, all Obsidian notes and WhatsApp messages are exported, parsed, transformed into text embeddings, and inserted into the vector database.

### 1. Exporting the data sources

No export procedure is required for Obsidian, since it stores its text contents inside markdown (`.md`) files, we just need to point directly to the folder we want to target, which can be a vault's root folder, for example.

For WhatsApp messages, a `result.json` holding a structured JSON dump of all messages and their respective metadata, is generated via an open source exporting utility which extracts all messages from the local WhatsApp database present in the mobile device; and a `contacts.csv` is exported from all Google contacts, in order to enrich the context of the aforementioned messages. A step-by-step process to generate these is described [in the repo's Readme](https://github.com/lopespm/personal_llm?tab=readme-ov-file#setup-of-data-sources)

### 2. Parse, vectorize and persist

With our data sources ready, we can now start extracting relevant information, transforming the relevant content into a vector, and then persist into a vector database. The entire process is made by running:

~~~
$ python create_and_persist_embeddings.py
~~~
{:lang="bash"}
<br/>

Each of the separate Obsidian note paragraphs and WhatsApp messages are accumulated into a single entry, so that locally close contextual content can be readily available and provided to the main LLM AI assistant, when retrieved, so that it has better immediately relevant contextual information about a given topic. It was chosen to accumulate a set of note paragraphs / messages that in total would not surpass the maximum content length of the model used to vectorize the content, which in this case has a maximum content length of 514 (see how to get the maximum content length [here](https://gist.github.com/lopespm/342bd297f0cd6a2819f69a1ea10e7777)).

All of these are [batch processed](https://github.com/lopespm/personal_llm/blob/main/create_and_persist_embeddings.py#L7), so that vector embedding creation can be done much more efficiently. Given that in total there were 25M characters worth of content across these two data sources, these optimizations make a substantial change in the processing run time. Further optimizations could be made in optimizing [DB insertion commits](https://github.com/lopespm/personal_llm/blob/main/create_and_persist_embeddings.py#L33-L36) and streaming each of the data sources contents, instead of storing them entirely into memory.

#### Obsidian

The python script calls into a [custom module](https://github.com/lopespm/personal_llm/blob/main/obsidian_to_embeddings.py) that traverses through all the markdown (`.md`) files inside Obsidian's root folder and its respective descendent folders, and accumulate a group of lines in a given file into a distinct entry.

For example, a Obsidian note called `Survival Ball TV.md` with this content

~~~
Only had to take OUYA project, change some resources to match Android TV controllers, detect Nexus Remote.
Test on the Nexus Player
Delete all OUYA related resources
Most of the time was spent (...)
~~~
{:lang="bash"}
<br/>

Would be broken down into to two separate database entries [^6]:

- Entry 1.
  - DB ID of the entry
  - Content: `Only had to take OUYA project, change some resource (...)` - these would be first lines of the note
  - Source: `<obsidian>:Survival Ball TV`
  - Embedding: the vector representation the content text (content attribute above)
- Entry 2.
  - DB ID of the entry
  - Content: `Unity is pretty great, and has tons of really great stuff (...)` - the lines coming after the ones in Entry 1. above
  - Source: `<obsidian>:Survival Ball TV`
  - Embedding: the vector representation of the content text (content attribute above)

{% imgcap /files/personal_llm/obsidian_db_entry2.png Sample Obsidian entries in the vector database <sup>6</sup> %}


#### WhatsApp

Likewise, the script also calls into a [custom module](https://github.com/lopespm/personal_llm/blob/main/whatsapp_to_embeddings.py) that traverses all the messages, and similarly to the approach taken above for Obsidian notes, a set of messages are aggregated into a single entry.

For example, a WhatsApp conversation on the "Deeper Conversations" chat group would be broken down into several different entries, such as [^6]:

- Entry 1.
  - DB ID of the entry
  - Content: `message from "Deeper Conversations 💭" to me, on 2021-06-26 10:15:44: And that’s absolutely normal (...)` - several lines of the conversation would be aggregated here
  - Source: `<whatsapp>:xxxxxxxx-yyyyyyyy@t.as` (the numbers were redacted)
  - Embedding: the vector representation of the content text (content attribute above)
- Entry 2.
  - DB ID of the entry
  - Content: `message from "Deeper Conversations 💭" to me, on 2021-07-04 18:37:54: Challenge yourself (...)` - another group of several lines of the conversation would be aggregated here
  - Source: `<whatsapp>:xxxxxxxx-yyyyyyyy@t.as` (the numbers were redacted)
  - Embedding: the vector representation of the content text (content attribute above)
- Entry 3., 4., etc would have a similar structure to the ones above

{% imgcap /files/personal_llm/whatsapp_db_entry.png Sample WhatsApp entries in the vector database <sup>6</sup> %}

### 3. Storage (Vector Database)

The storage of the above entries is handled by a PostgreSQL database using the [pgvector](https://github.com/pgvector/pgvector) extension, which allows PostgreSQL to store and query vector attributes, and notably for our project, it provides tha capability to query for the closest vectors / entries related to a given query vector via [cosine similarity](https://en.wikipedia.org/wiki/Cosine_similarity) [^7].

The database is hosted via a docker container, which makes it easily encapsulated and quick to set up and run.

## Embedding model

As we [discussed above]({% post_url 2024-06-24-personal-llm %}#text-embeddings), embedding models can be trained have their embedding representation to be optimized and better suit the problem at hand. In general, there are several types of tasks a embedding can be better or worse at, so testing each single model against our problem would certainly inefficient.

Fortunately, a Massive Text Embedding Benchmark was been made and its results are freely available [in this dashboard](https://huggingface.co/spaces/mteb/leaderboard), which compares several models against capabilities such as classification, clustering and reranking.

{% imgcap /files/personal_llm/text_embedding_model_leaderboard.png Massive Text Embedding Benchmark (MTEB) Leaderboard %}

The model used for this project is [`intfloat/multilingual-e5-large`](https://huggingface.co/intfloat/multilingual-e5-large)[^8], which was chosen for its:

- Reasonable embedding dimensions (1024), which essentially means of many dimensions will the embedding vector have, allowing for a reduced database footprint and faster retrieval when compared to higher dimension models (such as GritLM-8x7B with 4096 dimensions)
- Good average score across the all tasks (ranking 20th overall)
- And most notably support 100 different languages, [one of them being Portuguese](https://arxiv.org/pdf/1911.02116), which is quite relevant since my notes and messages are largely a mix of English and Portuguese, with some sprinkles of other languages (which this model also supports)

*Related (source code [here](https://github.com/lopespm/personal_llm/blob/main/embedding_generator_multilingual.py))*


## Evaluation phase

Having all the documents vectorized and available in a database, we can now jump into the evaluation phase, in which we leverage upon these on chat conversation with an AI assistant.

To start the chat session, we only need to activate the respective conda environment [^9] and execute:

~~~
$ python main.py
~~~
{:lang="bash"}
<br/>

### 1. The main AI Assistant LLM

Upon starting the above script, a Llama3 8B model ([mlx-community/Meta-Llama-3-8B-Instruct-4bit](https://huggingface.co/mlx-community/Meta-Llama-3-8B-Instruct-4bit)) is loaded into memory and is instructed to behave as AI assistant / philosopher / psychotherapist (or any other role one so wishes, as [seen below]({% post_url 2024-06-24-personal-llm %}#results), and the user is greeted with an initial message, and is able to start inserting a prompt.

{% imgcap /files/personal_llm/greeting.png Greeting message from the AI assistant %}

This will be LLM having the conversation with the user.

### 2. Transform conversation into DB query

Once the user inserts their prompt, the entire conversation is provided to an auxiliary "document keeper" LLM, which has only one job: transform the entire conversation the user is having with the main AI assistant into concise sentence that aims to represent the information we are interested to provide as context on the upcoming reply.

The document keeper LLM produces a query sentence [using the previously described process]({% post_url 2024-06-24-personal-llm %}#transforming-a-conversation-into-a-query) (related [source code](https://github.com/lopespm/personal_llm/blob/main/formulate_query_for_retrieving_content.py)), and then transforms it into a vector using the [embedding model]({% post_url 2024-06-24-personal-llm %}#embedding-model).

Now we have everything we need. Using this vector representation of the query, we can ask the database which are the top 10 entries which have their respective vectors closest to the query vector.

So for example, if the text query created by the "document keeper" LLM is `Which are interesting facts about Survival Ball, a game developed in 2008?` (resulting in a vector representation of [1.3, 4.2, 3.3, etc]), then a [SQL query such as this one would be made against the DB](https://github.com/lopespm/personal_llm/blob/main/retrieve_related_content_from_db.py):

~~~
SELECT id, content, source, 1 - (embedding <=> [1.3, 4.2, 3.3, etc]) AS cosine_similarity
FROM items
ORDER BY cosine_similarity DESC LIMIT 10,
~~~
{:lang="sql"}
<br/>

### 3. Retrieved entries are added as context on the main AI LLM prompt

Now that we have the retrieved a set of relevant entries we want the main AI assistant LLM to consider towards its reply, we now can add them as context for the prompt for the main AI assistant LLM, very similarly to what was [described above]({% post_url 2024-06-24-personal-llm %}#insert-all-documents-into-the-prompt-as-context):

~~~

<|begin_of_text|><|start_header_id|>system<|end_header_id|>

You are a AI assistant which answers the user's question based on your prior knowledge
and a collection of the user's documents.

Each of the documents has the format <<document:||document_name||>>||content||.
||document_name|| represents the document name. ||content|| represents the
document's content. Don't show the <<document:||document_name||>> portion to the user.

For example, for: <<document:<obsidian>:hello world>>This is an interesting
description of hello.
- ||document_name|| is <obsidian>:hello world
- ||content|| This is an interesting description of hello.

These are the user's documents:
----------
<<document:<obsidian>:lamas running down the street>>The content for lamas
going down the street
<<document:<obsidian>:alpacas running down the street>>That time when they saw a
alpaca running down the street.
<<document:<whatsapp>:aaaaaaa-bbbbbbbb@t.we>>message from "Thy Table Turner" to me, on 2024-03-26 13:15:44: I've just seen a alpaca shuffling down the street
<<document:<whatsapp>:aaaaaaa-bbbbbbbb@t.we>>message from me to "Thy Table Turner", on 2024-03-26 13:16:32: Pretty sure it was lama though
----------

<|start_header_id|>user<|end_header_id|>Tell me about that time I've seen animals
running down the street<|eot_id|>

~~~
{:lang="text"}

### 4. Output from the AI assistant LLM presented to the user

We now have everything we need, and the prompt is ready to be [evaluated by the main LLM](https://github.com/lopespm/personal_llm/blob/main/main.py).

Once the prompt is evaluated by this LLM, we present the output to the user, and then we cycle through the entire evaluation phase again once the user submits their request.


# Results

 <center>
 <div class="video-media-caption-wrapper-two"><div class="video-wrapper-two">
  <div class="youtube-player video-frame-two" data-id="QOpAox8iXAc"></div></div>
   <p class="media-caption media-caption-two">Example interaction with the AI LLM, having its role as "AI assistant"</p>
 </div>
  </center>

Overall, I've found interactions with this AI to be quite interesting, even though sometimes it can output blobs of information that could be cleaner or have better answers. The former can be addressed by tweaking the prompts (i.e. prompt engineering) having increased efficacy towards the behavior I aim the Ai to have, and the latter by either cleaning Obsidian notes directly, or improving the data processing and extraction. Regardless, I find these results to be quite pleasing, useful and even amusing.

For example, the code allows you to choose the AI's persona by changing [this constant](https://github.com/lopespm/personal_llm/blob/main/main.py#L8-L10)

{% imgcap /files/personal_llm/ai_role.png The AI's persona is customizable %}

When choosing the AI's persona to be of a AI "psychotherapist", this happens *(disclaimer: please consult a professional if you require therapy, this agent is meant for pedagogical / entertainment / utilitarian uses only)*:

{% imgcap /files/personal_llm/ai_psycotherapist.png Example interaction with the AI LLM, having its role as "AI assistant"  %}


# Final Notes

## Adding other data sources

This project focuses on using Obsidian notes and WhatsApp messages to augment the main LLM, but virtually any piece of content could be used to augment it. CO2 historical readings, tax documents, financial statements, diplomas, official documents, calendar events, etc. Sky is the limit.

Doing so in practice would be as straightforward as adding an [additional module to this script](https://github.com/lopespm/personal_llm/blob/main/create_and_persist_embeddings.py), and have it return the pieces relevant pieces of content, and then re-run:

~~~
$ python create_and_persist_embeddings.py
~~~
{:lang="bash"}
<br/>

## Inspiring wealth of possibilities

This type of assistant has been something I've been daydreaming for a long time, and having the peace of mind that I have full control and customization of it is something that profoundly satisfies me. Not only that, this entire project has an immense learning opportunity for me, and as I researched through it and pieced the puzzle pieces together, I've felt humbled and inspired by the explosive amount of possibilities that these models provide.

For example, just browsing through the [wealth of freely available models](https://huggingface.co/models), ready to be used, combined and assembled into different scenarios, leaves me at awe:

{% imgcap /files/personal_llm/hugging_face_models.png A sample of different classes of models available in Hugging Face. Each of those having dozens of models, sometimes thousands. All freely available. %}

## Further references

I find it fulfilling to learn about a subject by fundamentally understanding its core components, hence the usage of several lower level components, [similar to how I previously built a deep reinforcement learning agent]({% post_url 2016-10-06-deep-reinforcement-learning-racing-game %})), but there are several readily available tools and libraries that handle a lot of the heavy lifting:

- [LangChain](https://www.langchain.com/): framework designed to simplify the creation of applications using large language models (LLMs). As a language model integration framework, LangChain's use-cases largely overlap with those of language models in general, including document analysis and summarization, chatbots, and code analysis. This could have been used to abstract most, if not all, of the RAG heavy lifting, which is quite useful.
- Other Vector Databases: although PostgreSQL worked great for this project, there are other possible, such as [Pinecone](https://www.pinecone.io/learn/retrieval-augmented-generation/) (this is a externally hosted DB, hence why it was not considered), [Qdrant](https://qdrant.tech/), [chroma](https://www.trychroma.com/), [faiss](https://github.com/facebookresearch/faiss) or [MongoDB](https://www.mongodb.com/resources/basics/retrieval-augmented-generation)
- [Replicate](https://replicate.com/): Similarly to Hugging Face, Replicate is a platform that collects various open-source large language models (LLMs), offering AI models for a variety of purposes, including AI text generation, AI image generation, and AI video generation. Developers can use these models through Replicate's API.

# Source code

All source code is available on GitHub at [https://github.com/lopespm/personal_llm](https://github.com/lopespm/personal_llm)

<br/>

[^1]: Obsidian is an amazing platform / app which I vividly recommend. I've recently migrated all of my notes from Evernote into Obsidian, and couldn't be happier. Obsidian stores all of the notes in plain `.md` files that are yours to keep, and allows you to completely customize it to your heart's desire. For example, I created a custom script that packages all of the notes, encrypts it, and stores that vault into my Google Drive. I would be happy to provide more details about this in a posterior note.
[^2]: Note that these calculations are based on loading + inference for a batch size of 1. Training a model required far more VRAM
[^3]: Specifically, I've used the model available on hugging face at [mlx-community/Meta-Llama-3-70B-Instruct-4bit](https://huggingface.co/mlx-community/Meta-Llama-3-70B-Instruct-4bit)
[^4]: The process of how these embedding models are trained is a fascinating topic by itself. The idea behind it is that you place a given piece of text on the model's input and on its corresponding contextual word on the output, and then train the model to attempt to correctly predict the output text. For example, if using a word2vec skip-gram architecture, the input is a single word and the output is trained to be the words around it. The model's number of weights is lower than the number of pieces of text in the dictionary, so that the model is forced to compress these associations into its weights. Once the model is trained, we use its learned weights to generate an embedding for a given piece of text. When a model is trained on large swathes of text, this simple method yields incredible results.
[^5]: In practice, representing these vectors as being closer together when they rhyme, vs when they are conceptually closer, can be achieved by training the embedding model on poetry books and giving higher emphasis on the last words of each line for the former, and training the embedding model on more generic text datasets, such as wikipedia, and using samples around the seed word uniformly as target words (using a [skip-gram](https://en.wikipedia.org/wiki/Word2vec) architecture for example) for the latter.
[^6]: These screenshots were taken from [DBeaver](https://dbeaver.io/), and open source universal database tool which is incredibly powerful and well designed.
[^7]: The pgvector extension supports L2 distance, inner product, cosine distance, L1 distance, Hamming distance, and Jaccard distance.
[^8]: Related backing "Multilingual E5 Text Embeddings: A Technical Report" paper for this model is available in [arxiv](https://arxiv.org/pdf/2402.05672)
[^9]: Conda provides for a self-contained and easy way to manage packages and environments. Whereas pip is a package manager and virtualenv is an environment manager, conda is both. Here is an [illustrative comparison table](https://docs.conda.io/projects/conda/en/latest/commands/index.html#conda-vs-pip-vs-virtualenv-commands)
