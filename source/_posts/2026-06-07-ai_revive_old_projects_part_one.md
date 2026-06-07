---
layout: note
title: "Using AI to Revive Old Projects [Part 1]"
comments: true
categories: notes
tags: []
description: "Using AI to burn through my backlog"
ogp_image: "/files/ai_revive_old_projects_part_one/pthumb1.jpg"
ogp_image_twitter: "/files/ai_revive_old_projects_part_one/pthumb1.jpg"
published: true
---

## AI powered backlog burner
Ideas come cheap. That’s why my backlog of project ideas keeps growing - there is only so much time and energy. 

The recent agentic AI advancements are changing that equation. All of a sudden, projects I long relegated to an uncertain future can now be brought to fruition with a single human pair of hands (read, mine).

A good example of this is [vivotime.net]({% post_url 2026-01-19-vivotime %}). There is no way I could have made it a reality on my own in such a short amount of time, in the midst of my routines and demanding job. AI changed all that. A success story in my book.

## New life to old projects

My backlog does not only consist of new projects, but also improvements to older ones that ended up getting outdated, or had missing features I long wanted to add. 

So in a single weekend I grabbed three of my older longstanding projects, and gave them an overhaul.

### Personal Local LLM Extended With WhatsApp + Obsidian Data

I grabbed this now [2 year old project]({% post_url 2024-06-24-personal-llm %}), and gave it a [new life](https://github.com/lopespm/personal_llm) with:

- **New model**: instead of Llama3 8B, use the newer and more powerful Qwen 2.5 model.
- **Agentic behaviour for research**: instead of performing a single query to the vector database to retrieve contextual information, the agent can do as many queries to the contextual data as it needs (up to a limit of course). The main point here is that once the agent is satisfied with the amount of context, it can stop information gathering altogether, which reduces context noise.
- **Embeddings model**: updated to the more capable Qwen3 embeddings model
- **Streaming**: instead of waiting for the model to generate the entire response, the response is now written as soon as the first token arrives. A much fluid experience.
- **Presentation**: added several nice progress bars and indicators that give the user better feedback on what is happening behind the scenes.
- **Performance**: the entire system is now much more performant, leveraging threading whenever possible, specially when creating embeddings, which is a fairly time consuming process
- **Correct system prompt structure**: the system prompt had several gaps in its structure and how the conversation should be provided to the LLM. This is now fixed.

{% imgopt /files/ai_revive_old_projects_part_one/personal_llm1 Presentation Improvements %}

<br/>

You might be thinking: *“That’s cool and all, but I already have LM Studio + Anything LLM, Ollama and OpenClaw”*. Those are incredible, but this project offers two unique things:

- It has 595 total lines, over 8 significant Python files. Small and understandable. Ideal to learn how these agents / harnesses work.
- Try importing all of your whatsapp conversations and obsidian notes to Anything LLM so that it can RAG them. If you have more than 400 files, good luck. With this project, you can.

## Hacker news daily

This one was relatively simple. The pipeline was broken for this almost [6 year old project]({% post_url 2020-12-25-hackernews-daily %}), and the site stopped updating. It is now back online, hardened against rogue errors, like image previews not loading and crashing the build.

Presentation is improved on larger screens as well, with a simple simple change to constrain the max width of the site's contents.

It is better than ever: [https://lopespm.com/hackernews-daily/](https://lopespm.com/hackernews-daily/)

{% imgopt /files/ai_revive_old_projects_part_one/hn1 Hacker News Daily Screenshot %}

<br/>

## This blog

There is a nifty user optimization where certain images are presented via their WebP proxy, delivering much smaller file sizes (25-35% lighter than PNG).

The problem is that image editors tend to work best when exporting and working with PNGs and JPEGs, so before, I would need to go through each image, one by one, and export them to WebP via the terminal. This was infrequent enough to make me postpone its automation, but also frequent enough to be annoying.

That is now a relic of the past. Presenting, a [completely ordinary script](https://gist.github.com/lopespm/2e0adf0ef9e2731b1bca63c38c50251c) that batch converts PNGs and JPEGs to WebP. Simple utility, high utility value.


## What’s next?

I want to eventually revamp [Survival Ball]({% post_url 2019-02-06-survival-ball-making-the-game %}), but there is a problem: AI alone won’t cut it, since proper game design iterations, testing and porting it to Mac and Windows are some of the most time consuming tasks.

If I don’t find the time and energy to tackle it, there are other projects itching to come to life, which don't suffer as much from the above problems. I’ll keep you posted!