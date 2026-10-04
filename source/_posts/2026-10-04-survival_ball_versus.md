---
layout: post
title: "Survival Ball Versus: The Sabbatical Sprint"
comments: true
#categories: games
tags: [games]
tags: []
description: "How I built the new Versus Mode for Survival Ball (Steam game)"
ogp_image: "/files/sbversus/pthumb.png"
ogp_image_twitter: "/files/sbversus/pthumb.png"
published: true
---

<center>
 <div class="video-media-caption-wrapper-two"><div class="video-wrapper-two">
     <div class="youtube-player video-frame-two" data-id="Oc1gJ_m-w2s"></div></div>
   <p class="media-caption media-caption-two">Versus Mode Trailer</p>
 </div>
</center>

The new versus mode is now available in a **[free update to Survival Ball](https://store.steampowered.com/app/918690/Survival_Ball/)**, a game I published [8 years ago]({% post_url 2019-02-06-survival-ball-making-the-game %}) that originally shipped with a solo / co-op campaign. Here is the story behind it.

<!--more-->

## Cooperative vs Competitive

Local co-op gaming experiences have been one of the best I had when playing with others. Not only did they create a healthy environment that usually brought up the best of each of the players, but also offered mechanics that could run deep and be intellectually satisfying.

When developing the original game, I wanted to tap into those features and provide my own interpretation. I did not want to incentivize competition, but cooperation instead. 

As time went by, I came to appreciate the merits of rubbing your shoulders against someone else. It plainly demonstrates where your shortcomings are, calibrates your expectations, teaches you humility, and challenges you to up your game and *grow*, if you so choose. It all comes down to how you handle it.

Hence why the idea of adding a versus mode started growing on me, specially because during the original play tests a few friends mentioned that a versus mode seemed like a natural fit for the game.

## Making it happen

I knew that developing a new feature from start to finish in the game was not something I could pull off by taking a weekend here, a late night there. It required *large* continuous focus blocks where the only thing in mind would be the game.

Just so happened that my company offered an extra continuous month of paid vacations (aka recharge) for every five years of work. Being six years in, I took it starting from mid-August, the perfect time to develop a new versus mode, so I planned accordingly.

### Preparation 

I spent a few odd days and nights preparing my development setup before recharge started in preparation for the development phase.

Survival Ball was originally developed almost fully in my 2011 Intel MacBookPro, and then ported to Windows via my 2015-ish mini-itx PC. Unity 2018 was the game’s engine.  

I now have a much more powerful Apple Silicon MacBookPro M3, where I have my entire dev setup, do all of my personal work, and game. “Gaming on a Mac, wut?” you might ask. Yes, it works fairly well via CrossOver, which runs Windows based applications like Steam and its games.

I wanted to replicate my past workflow and use my M3 and upgrade the game to use a newer Unity version. Turns out, none of it worked.

Upgrading the game to use, even a small bump, higher Unity version completely breaks it:

- breaks the **plugins**: such as my custom [ReWired](https://guavaman.com/projects/rewired/) integration, which is essential for controller handling
- breaks the **model import pipeline**: since newer Unity versions don't auto collapse blender modifiers, so I would have needed re-export all my models
- breaks **rendering**: since tricks and quirks used in Unity 2018 stopped working
- breaks the **code**: APIs changed or disappeared, leading to fixes that changed the behaviour of the game, and would have required a complete retesting of the game 

How about forgetting the upgrade, and instead use Unity Editor 2018 on my M3? No dice, since the 2018 editor version is Intel based, leading to a wealth of errors, stalled imports and editor windows not being rendered. I tried it via CrossOver, Parallels and without any mediators. All had issues.

### PC to the rescue

One thing did work though. My old Windows based mini-itx PC still ran everything perfectly well and its development environment remained intact and functional, even though I hadn't touch it since 2018 (when I launched the game).

I was not going to spend a minute more trying to upgrade anything. That would be my development setup for the new mode. If it gets the job done, I'm all for it.

## Ready, set, execute ruthlessly

My last day of work was on a Friday, and once I wrapped up everything and had a nice dinner, I could not contain myself with the excitement of starting my recharge. What should I do first?!

I really wanted to finish [Titanfall 2](https://x.com/lopes_pm/status/2068447979040551423), but that would have to wait, since I could not stop thinking about this new game mode for Survival Ball. I was well aware that this could be the only realistic opportunity to fully focus on an endeavour like this, specially because I would travel about one week and half after my recharge started, so my precious continuous time block would be in reality constrained to that time.

I had one week and a half to give it all and make this new game mode happen, so I couldn't waste any time. I started developing the versus right on that Friday night.

I powered up my mini-ITX PC, and started banging on it. By 3AM or 4AM, I already had a very basic versus mode running.

I was in full flow, for 5 consecutive days.

My mind was fully consumed by the game, day and night. It was wonderful. This state of constant flow is one of the most enjoyable things I can think of, and was very similar to how I felt while developing the original version of the game.

### No need for a bloated AI setup

Execution was all that mattered to me. I knew roughly what I wanted to do, so I just needed the essential tools to get the job done. 

Luckily, my C# / Unity dev environment worked as nicely as before (Rider is still a kickass IDE), and I only needed to do a few tweaks to get the system working nicely with my Apple Magic Keyboard and some new shortcuts I’ve become used to.

I spent zero time setting up all the nice AI agent harnesses that I used for my normal professional and personal work. I didn’t need any of that. The real challenge of developing this new mode was making sure that the experience felt right and cohesive. Much of that comes down to gut feeling and trying things live. 

Where AI agents were indeed helpful was during algorithm and behaviour development, and finding what is the best way to do X on Unity 2018. As such, you might be surprised to know that the only AI agent I used was Gemini [^1], *on a  browser window*. That was it.

This worked really well, since it forced me to only provide the code snippets and context that was relevant, which in turn helped me to remember how the code was structured, and because the context was so clean and unambiguous, the agent’s responses were fast and provided me exactly what I needed, about 95% of the time. It was a great development experience. 

Without all this help from an AI, I would have easily taken twice or thrice the time to develop this new mode.


## Leveraging what already existed

One of the great things about iterating on top of an existing game was the possibility to use a wealth of fully baked components.

### Behaviour 

The ball’s behaviour was kept essentially the same: one can move, stomp and dash, the difference being that on the versus mode those same stomp and dashes carry additional force towards other players, which transforms them into offensive weapons. An aura of power effect was added to reinforce and indicate that difference in versus.

I loved how you could make your opponents fly off the screen in Super Smash Bros, and wanted something that would allow it. As such, another new mechanism is the ability to grab a power-up crate to further increase the force applied to a stomp or dash. A well timed / placed stomp or dash will take your opponents to the stratosphere.

### Battlefield

Players need somewhere to hash it out, and since there were already a wealth of different scenarios in the co-op game, it came naturally to reuse them.

The first pick was [Venom Rig]({% post_url 2019-02-06-survival-ball-making-the-game %}#venom-rig), a plain, rectangular platform. I quickly realized on that Friday night that it was not a good fit, since the experience felt too plain and one dimensional.

I pivoted towards using [Hex Elevator]({% post_url 2019-02-06-survival-ball-making-the-game %}#hex-elevator), which had two interesting components:

- each platform is procedurally generated, so every new gameplay would be different
- originally, the players would need to quickly catch their elevators in order to escape from the rising lava, where all players would need to be on top of their elevator for the elevators to rise. On the versus mode however, these platforms could be used as an offensive tactic, since they would not be linked anymore. First one(s) to get the elevator(s) and able to reach the top first, trigger the lava to creep upon the players left in the bottom.

### Code  

After so many professional years of dealing with realms of sloppy, quickly pieced together code, it was a breath of fresh air to rediscover the codebase I carefully laid out for the original game, where events were neatly coordinated via reactive streams and the structure was pondered to serve the game as best as possible, with minimal bloat.

Looking at that code was something I can compare to experiencing an harmonious art piece, like a painting. Beauty has a value of its own. It’s not often one can have that nowadays.

More than beautiful, it was functional and easily extensible.

Because I was not offloading my reasoning to a random AI agent, I interiorized the code’s architecture and could play that against my game design ideas. For example, if there was some specific behaviour I wanted to attribute to an elevator, I knew exactly which streams I could leverage for maximum effect and low code entropy.

### Speed

You might notice the game feels faster. It is. One of the pieces of feedback I got for the original game was that the physics felt like you were on the moon, and I got the same feeling when playing the game after all these years. The cooperative mode speed was slightly increased and the versus mode speed was increased a step more. It feels nicer and punchier.


## Testing

As with any (multiplayer) game, the proof of the pudding only happens when experienced together with others.

Right after finishing the game’s development, I invited friends of mine to play the game with me, or between them. I took note of their observations, tweaked the game accordingly, and then repeated the cycle.

In the end, the versus mode got its quirks ironed out, and as with the original game’s play tests, these sessions were a fantastic way to spend some quality time with a group of friends.

## Finished product

The new versus mode, support for spanish and portuguese locales, plus several bug fixes are now available as a free update for Survival Ball. The update feels like a polished deliverable, which personally is deeply satisfying.

The update is for Windows only because of the above Mac development challenges, but the final packaged executable available on the Steam store runs amazingly well via Mac's Crossover app, which curiously was how the game was run during play tests. Developed on Windows, play tested on a Mac, the [exact opposite]({% post_url 2019-02-06-survival-ball-making-the-game %}#final-notes) of what happened during the original game's development.

I still have many other ideas, one of them being to expand the versus mode's number of scenarios and mechanics, but one step at a time. [Get it now on Steam](https://store.steampowered.com/app/918690/Survival_Ball/) and let me know what you think!

[^1]: Counter to many of the memes floating around, Gemini is actually a pretty decent model for many tasks.