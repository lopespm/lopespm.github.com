---
layout: post
title: "Compressed Deque"
comments: true
categories: libraries
tags: [python]
published: true
---

This post aims to give some insights about a recently [open-sourced](https://github.com/lopespm/compressed-deque) python deque which compresses its items for a decreased volatile and persistent memory footprint.

<!--more-->

##Why? How can it be useful?

Compressed Deque came up while buiding an algorithm which relied on fast random accesses of numerous complex objects. When compressed, this blob of data could easily fit in fast volatile memory, as opposed to being fetched from a slow hard drive. Even though there was a performance penalty from compressing/decompressing items from volatile memory, this solution proved to be faster than accessing these items from indexed files on a hard disk (on a SSD the gains are more negligible though).

This collection might also be useful for programs running on devices with very limited memory available.
 
##Structure

Compressed Deque inherits from [deque](https://docs.python.org/2/library/collections.html#collections.deque) and stores its items as zlib compressed pickles. The middle pickle layer only serves as a generic serialization method which can provide a serialized object string for zlib to compress. Although pickle can compress objects, its compression rate does not match zlib's, even using [higher protocols](https://docs.python.org/2/library/pickle.html#data-stream-format).

![image](/files/compressed_deque/value_layers.png)

`save_to_file()` and `load_from_file()` static methods are provided to persist the collection directly into disk in its compressed representation, without much overhead. 

The persisted file contains a sequence of header/compressed_value pairs: the header is a 4 byte integer description of the compressed value's length and the compressed value is similiar to its in-memory representation.

![image](/files/compressed_deque/persisted_values.png)


##How to Use it

An easy way to install this package is by using `pip`:

~~~
$ pip install compressed-deque
~~~
{:lang="bash"}

<br/>

You can then import the class and use it:

~~~
from compdeque import CompressedDeque

# Instantiate the Deque
collection = CompressedDeque()

# Use it as a normal deque
collection.append(1)

# Persist to a file
CompressedDeque.save_to_file(collection, file_path="/path/to/collection.dat")

# ...

# and load it when you need it later
loaded_collection = CompressedDeque.load_from_file("/path/to/collection.dat")
~~~
{:lang="python"}

<br/>

##Source Code

Source code is available here: [https://github.com/lopespm/compressed-deque](https://github.com/lopespm/compressed-deque)
