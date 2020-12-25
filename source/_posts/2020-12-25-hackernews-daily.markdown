---
layout: post
title: "Hacker News Daily"
comments: true
#categories: games
tags: [aggregators]
description: "Lightweight daily best Hacker News stories, with screenshots and top comments. No JavaScript used. Deployed via GitHub Actions"
ogp_image: "/files/hackernews_daily/screenshots_cropped2.png"
ogp_image_twitter: "/files/hackernews_daily/screenshots_cropped2.png"
published: true
---

This article will dive into the system behind the generation of [Hacker News Daily](https://lopespm.github.io/hackernews_daily), an [open source](https://github.com/lopespm/hackernews_daily) lightweight daily Hacker News best stories website, with screenshots and top comments.

{% imgopt /files/hackernews_daily/screenshots_cropped2_705 %}


<!--more-->

<br/>



# Motivation

Hacker News is my go-to source for relevant, interesting and constructive discussions on a wide range of topics. I usually consume it via [Daemonology’s Hacker News Daily](https://www.daemonology.net/hn-daily/), to catch up on most active topics in the community.

[Daemonology’s Hacker News Daily](https://www.daemonology.net/hn-daily/) presents the title, story link, Hacker News discussion link, and is optimized for desktop. I usually consult it on mobile, and when I am several days behind, I sweep through the archives and open several story/discussion links in separate mobile tabs, in order to triage the stories with a quick glance at their web page and their discussion's top comments.

This project aims to ease that process, by generating a set of web pages presenting the best daily Hacker News for mobile or desktop, with screenshots and top comments for each story, while aiming to have a low footprint to the end user.


# Architecture

{% imgcap /files/hackernews_daily/hn_daily_diagram.png Information flow diagram between the different components of the system %}

The basilar idea is to recurrently get the [best Hacker News](https://news.ycombinator.com/best) stories via its [API](https://github.com/HackerNews/API); take screenshots of the web pages that these stories link to; and have this workflow executed via [GitHub Actions](https://github.com/features/actions).

In specific, these are the steps taken to generate the final web pages (illustrated by the above diagram):

**1.** Every day, a new [Github Workflow](https://github.com/lopespm/hackernews_daily/actions) is spawned, kickstarting the entire process.

**2.** Update History

- The first step is to get the past days best stories from the last successful run, and add the current best stories by
 reaching out to the Hacker News API to fetch the current list of best stories, removing the ones that were already featured, and adding the top ones to the current history
  - To persist the past best stories history, an `days_history.dat` artifact is created in every run, which is a simple [Python Pickle](https://docs.python.org/3/library/pickle.html) containing the story ids from the past days. These days are stored in form of a deque, in order to pop the older days as the history grows larger
  - The final result of this step is a new `days_history.dat`, which will be used in the next step below, and will also serve as a base for the next workflow
  - If a viable `days_history.dat` artifact cannot not be found in the previous successful runs, it is rebuilt by parsing the [Daemonology's Hacker News Daily](https://www.daemonology.net/hn-daily/) web page

**3.** Create Day/Story Models

- From the story ids provided by the previously built `days_history.dat`, a list of hydrated days with their respective stories are built. These models will posteriorly provide all the information needed to create the final web page views
  - Each story is composed of an ID, title, story link, Hacker News discussion link, and its top comments. This information is obtained via the Hacker News API (example [call](https://hacker-news.firebaseio.com/v0/item/25518730.json?print=pretty))

**4.** Create the `generated` folder. This is where the generated web pages and screenshots will be placed, in order to be later deployed to GitHub pages

**5.** Gather Screenshots

- Using [pyppeteer](https://pypi.org/project/pyppeteer/), an headless browser is created to navigate through all the story links
  - A screenshot is taken for each of these pages (after attempting to dismiss a possible "Allow Cookies" prompt), and stored as PNGs in the `generated` folder
  - Each of these screenshots are re-encoded in [WebP](https://en.wikipedia.org/wiki/WebP), which allows for a smaller image footprint in browser's that support it
- If there is an unexpected error while processing the screenshots, it will not halt the overall workflow, since the final web pages can still function without screenshot images

**6**. Generate Web Pages

- [Jinja](https://jinja.palletsprojects.com/en/2.11.x/), a templating engine for Python, is used to define and generate each of the final web pages. Four web pages are generated from a [single template](https://github.com/lopespm/hackernews_daily/blob/main/templates/page.html). These four variants are permutations of either presenting all past 10 days or not, and either showing images or not:
  - Latest day, with images
  - Latest day, without images
  - Past 10 days, with images
  - Past 10 days, without images
- It was chosen to keep these in separate static web pages, in order to keep them simple, static, and without additional dynamic logic

**7.** The `generated` folder is deployed to the `gh-pages` branch, which is deployed as a GitHub page, making these generated contents [publicly accessible](https://lopespm.github.io/hackernews_daily)


# Source Code

The full source code is accessible at [https://github.com/lopespm/hackernews_daily](https://github.com/lopespm/hackernews_daily) and the generated website at [https://lopespm.github.io/hackernews_daily](https://lopespm.github.io/hackernews_daily), feel free to improve it or to leave some feedback.
