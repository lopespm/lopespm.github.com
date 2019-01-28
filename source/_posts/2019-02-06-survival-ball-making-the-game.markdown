---
layout: post
title: "Survival Ball: Making the Game"
comments: true
#categories: games
tags: [games]
description: "In-depth article/postmortem about the process of building Survival Ball, from prototype until launch/showcase."
ogp_image: "/files/sb_making_game/og-thumb-facebook.png"
ogp_image_twitter: "/files/sb_making_game/og-thumb-twitter.png"
published: true
---

<script src="https://www.youtube.com/iframe_api"></script>
<script>

  /* Based on: http://labnol.org/?p=27941 */

  // function onYouTubeIframeAPIReady() {
  //   initialize();
  // }

  document.addEventListener("DOMContentLoaded", initialize );

  function initialize() {
    console.log("Init");

    var div, n,
      v = document.getElementsByClassName("youtube-player");
    for (n = 0; n < v.length; n++) {
      div = document.createElement("div");
      div.setAttribute("data-id", v[n].dataset.id);
      div.innerHTML = labnolThumb(v[n].dataset.id, v[n].dataset.thumbsize);
      div.onclick = labnolIframe;

      v[n].classList.add("ytp-thumbnail-overlay");
      v[n].classList.add("ytp-cued-thumbnail-overlay");

      v[n].appendChild(div);
    }
  }

  function labnolThumb(id, thumbSize) {
    var thumb = getThumb(thumbSize);
    var thumbWithId = thumb.replace("ID", id);

    var youtubePlayButton = '<div class="play-youtube-button"><button class="ytp-large-play-button ytp-button"><svg height="100%" version="1.1" viewBox="0 0 68 48" width="100%"><path class="ytp-large-play-button-bg" d="m .66,37.62 c 0,0 .66,4.70 2.70,6.77 2.58,2.71 5.98,2.63 7.49,2.91 5.43,.52 23.10,.68 23.12,.68 .00,-1.3e-5 14.29,-0.02 23.81,-0.71 1.32,-0.15 4.22,-0.17 6.81,-2.89 2.03,-2.07 2.70,-6.77 2.70,-6.77 0,0 .67,-5.52 .67,-11.04 l 0,-5.17 c 0,-5.52 -0.67,-11.04 -0.67,-11.04 0,0 -0.66,-4.70 -2.70,-6.77 C 62.03,.86 59.13,.84 57.80,.69 48.28,0 34.00,0 34.00,0 33.97,0 19.69,0 10.18,.69 8.85,.84 5.95,.86 3.36,3.58 1.32,5.65 .66,10.35 .66,10.35 c 0,0 -0.55,4.50 -0.66,9.45 l 0,8.36 c .10,4.94 .66,9.45 .66,9.45 z" fill="#1f1f1e" fill-opacity="0.81"></path><path d="m 26.96,13.67 18.37,9.62 -18.37,9.55 -0.00,-19.17 z" fill="#fff"></path><path d="M 45.02,23.46 45.32,23.28 26.96,13.67 43.32,24.34 45.02,23.46 z" fill="#ccc"></path></svg></button></div>';



    var bg = '<div class="bg" style=\'background-image: url(\"' + thumbWithId + '\')\"></div>';
    var fadeBg = '<div class="fadeBg"></div>';
    return bg + fadeBg + youtubePlayButton;
  }

  function getThumb(thumbSize) {
    if (thumbSize === "0")
      return 'https://i.ytimg.com/vi/ID/hqdefault.jpg';
    if (thumbSize === "1")
      return 'https://i.ytimg.com/vi/ID/sddefault.jpg';
    else if (thumbSize === "2")
      return 'https://i.ytimg.com/vi/ID/maxresdefault.jpg';
    return 'https://i.ytimg.com/vi/ID/sddefault.jpg';
  }

  function labnolIframe() {
    var container = document.createElement("div");

    var loaderContainerOuter = document.createElement("div");
    loaderContainerOuter.setAttribute("style", "display: table; position: absolute; top: 0; left: 0; height: 100%; width: 100%; background-color: black; z-index: 200;");
    var loaderContainerMiddle = document.createElement("div");
    loaderContainerMiddle.setAttribute("style", "  display: table-cell; vertical-align: middle;");
    var loaderContainerInner = document.createElement("div");
    loaderContainerInner.setAttribute("style", "margin-left: auto; margin-right: auto; width: 400px;");

    loaderContainerOuter.appendChild(loaderContainerMiddle);
    loaderContainerMiddle.appendChild(loaderContainerInner);

    const loader = Rocket.loader({
      target: loaderContainerInner,
      size: 'large',
      type: 'spinner',
      colour: 'grey-blue-dark'
      //body: "Loading Video"
    });

    var containerPlayer = document.createElement("div");
    container.appendChild(containerPlayer);
    container.appendChild(loaderContainerOuter);

    this.parentNode.replaceChild(container, this);

    var didLoadAndPlay = 0;
    player = new YT.Player(containerPlayer, {
      videoId: this.dataset.id,
      playerVars: { 'autoplay': 1 },
      events: {
        'onReady': function(event) {
          event.target.playVideo();

          // Fallback if onStateChange is not called
          setInterval(function () {
            if (didLoadAndPlay === 0) {
              console.log("Hide on after ready");
              container.removeChild(loaderContainerOuter);
              didLoadAndPlay = 1;
            }
          }, 5000);
        },
        'onStateChange': function (event) {
          console.log(event.data);
          if (didLoadAndPlay === 0) {
            console.log("Hide on play");
            container.removeChild(loaderContainerOuter);
            didLoadAndPlay = 1;
          }
        }
      }
    });

  }

</script>


<script src="/javascripts/rocket-loader/tools.min.js"></script>
<script src="/javascripts/rocket-loader/loader.min.js"></script>



 <center>
 <div class="video-media-caption-wrapper-two"><div class="video-wrapper-two">
     <div class="youtube-player video-frame-two" data-id="VO6P3h9RRcg"></div></div>
   <p class="media-caption media-caption-two"><b>Before:</b> Initial prototype, built 6 years ago</p>
 </div>
 <div class="video-media-caption-wrapper-two"> <div class="video-wrapper-two">
      <div class="youtube-player video-frame-two" data-id="DBqUGRCwBGc"></div></div>
   <p class="media-caption media-caption-two"><b>After:</b> Current version, released last November<br class="video-br-end"/></p>
 </div>
 </center>



 

This article/postmortem provides an in-depth look into the process of building [Survival Ball](https://survivalball.com/), a Single / Local Co-Op physics-based game available on Steam for Windows and macOS. From prototype until showcase at Lisboa Games Week, passing by the related principles, design decisions, level creation process, tools and technical details.  



<!--more-->

---

<br/>

* list element with functor item
{:toc}

<br/>

# Prototype

About six years ago I started learning Unity in my spare time, going through several official and unofficial tutorials. One was a simple tutorial on how to create a wire chain through physics. After its completion, I added a simple platform and a sphere. When arrow keys were pressed the sphere was torqued, and on spacebar press a vertical force was added to sphere, which caused it to jump. I was at awe. Unity's physics were accessible and felt natural out of the box. Not only that, but a rough working scene could be quickly setup by gluing some basic concepts.

<div>
    <div class="youtube-player" data-id="3goAGlKg92Q" data-thumbsize="1"/>
</div>
<p class="media-caption media-caption-one">Wire chain and sphere physics</p>

An idea started to bubble up about around this simple project: staying as long as possible on top of a platform. Antagonists, materialized in the form of various hazards, were added in order to coerce (directly or indirectly) the player off the platform. Frequency and power of these hazards increased over time, raising the probability of reaching the level's finishing state. From this starting point, more elements were added, such as interactable platform edge blocks, destroyable floor tiles, backdrops, user interface and basic sound effects.

Two versions resulted from this. The first ad supported version was available for [Android mobile](https://play.google.com/store/apps/details?id=com.rockbyte.survivalball) devices only, having one playable level in single-player mode. Afterwards, a new adless version was released for [OUYA](https://www.ouya.tv/game/Survival-Ball/), [Android TV](https://play.google.com/store/apps/details?id=com.rockbyte.survivalltv) and Kongregate, featuring a new versus mode.

<div>
    <div class="youtube-player" data-id="ZrqakDKWwjg"/>
</div>
<p class="media-caption media-caption-one">Game prototype version for OUYA, Android TV and Kongregate</p>


# Reboot

I went to work on other projects after the prototype's launch, but the feedback provided from gamers was kept in the back of my mind in the meanwhile. Several ideas eventually piled up for a new, improved version of the game, and about two years ago they were first brought to fruition. First at night after work, then full-time until completion.

Laying out a solid base was was essential in the beginning of the project, specially concept wise. Pre-production, if you will. Surviving on top of a platform was the root idea, but was there latitude for perpendicular ideas? Multiplayer mode? Versus or Cooperative? Online or local only? Powerups? Which player movements would be available, only jump? Progressive difficulty (the player does not choose the difficulty level) or bucket based difficulty (e.g. easy, normal, hard)? What will be the direction of visual style, audio, and code architecture? How many levels? What is the player's motivation play these levels?

##Root ideas and game modes

Less is more when it comes to the game's root ideas, and surviving on top of a platform seemed like a good premise. This idea was dissected and questioned thoroughly during the initial phase of development, in order to make sure it was well sustained. Other ideas such as going as high as possible or objective based levels were considered, but set aside in the initial stage of the project. They were not completely scrapped, such that both survival/time based and objective based levels would later cohabitate throughout the game's development.

Assuming survival as the most important root idea, a question came up: survive what? It could be either you against the world, or you against other player(s), or a combination of both. The latter two options would prompt the need of a multiplayer versus mode and/or player AI, and the former one would naturally accommodate a single player and/or cooperation mode.

Allowing for a local multiplayer mode would be something desirable, since I had a personal bias towards games that physically join a group of friends in the same place. Also, online multiplayer was set aside due to the added entropy and complexity associated with it. 
 
As for cooperative (co-op) games, there is usually an increased inclusion factor due to the wealth of opportunities to strike a balance between experienced and less experienced players, translating to less chances of frustration caused by huge proficiency gaps.

Given the above points, solo and local co-op modes were chosen to be included in the game.

##Difficulty

Again, having in mind that less is more, a progressive difficulty mode (where the player does not choose the difficulty level) was strived for, instead of a bucket based approach (e.g. easy, normal, hard). Choosing a difficulty level when starting a simple game like this one, forces the player to commit to a given difficulty level at start, and accepting that decision. The responsibility is on the player. Often happens to me that when I choose a difficulty level like "easy" or "normal", I keep wondering throughout the game if I am really good at that game, or am I just being thrown softballs. Progressive difficulty resolves that problem immediately, but it falls on the developer shoulders to craft the game in such a way that all difficulty ranges are covered just right.

Progression would be 2-fold: each level would start in an accessible way, but would gradually get more difficult as time passes. On the other hand, each level would be more challenging than the last one during the campaign. 

## Control and movement

There was the need to have offensive manuevers against hazards, and to provide mid-air control to the player. Two new movements were added to the already existing jump and double jump movements: dash and stomp. Dash provided mid-air control and allowed the player to interact with the world's objects and attack hazards. Stomp, inspired by [Super Mario 64](https://en.wikipedia.org/wiki/Super_Mario_64), allowed for button interaction, and mid-air stop and plunge for precise vertical landings.

With this set of movements, the player was able to gain full control over the ball. Easy to learn, hard to master. Additionally, it suppressed the need for aerial control via directional controls, which would be less physically coherent and could quench some of the fun of gaining control proficiency.  


## Powerups

An assumption was made that powerups would be distributed randomly, either by items scattered throughout the level or by other means. Powerups were not used because of these four reasons: 
 
- **Added game design complexity** - every new powerup would increase the realm of possible scenarios during a game session, which would increase the difficulty of striking good game balance.
- **Simplicity** - simplicity was held at high value during development, and powerups would probably require the usage of a new button to trigger the power, more UI elements and new concepts for the player to grasp.
- **Skill based gameplay** - the game aimed to be purely skill based. Since the randomized nature of hazards already abducted some of this intent, having powerups attributed by chance would further decrease the player's perception that the level was completed by his/her own merit.
- **They could be used as crutches** - powerups are outstanding when [used](https://en.wikipedia.org/wiki/Rollcage_(video_game)) [properly](https://en.wikipedia.org/wiki/Mario_Kart_8), but can also be abused to cover up design flaws. Having a no-powerup limitation forced me think in alternative ways to make the game more interesting, a challenge I was drawn to. 


## Visual Aesthetics

Defining the game's visual appearance early on was quite important, since it would influence the reasoning behind 3D models, textures, UI, colors, mood and even audio. The two most influential references were [Material Design (first version)](https://material.io/archive/guidelines/) and [Lara Croft GO](https://store.steampowered.com/app/540840/Lara_Croft_GO/).

Coming from an Android development background, I was exposed to Material Design, which is a visual language that synthesizes the classic principles of good design. Its principles go beyond mobile UI development, and span to a swath of different form factors and use cases. I personally found it beautiful and applyed its principles throughout the game's aesthetics, both in UI, but also in the overall style of the game. This influenced the game to have a simple, clean and coherent style.

Lara Croft GO is a beautiful game. The charming colors and elegant (yet simple) style made an impression on me. While building up the game's aesthetics, I consulted several screenshots of Lara Croft GO and attempted to transpose its most pleasant design elements into Survival Ball.

{% img center /files/sb_making_game/lara_croft_go_0.jpg %}

                                                                                                                         
  
##Codebase

The prototype was a literal extension of the initial [wire chain and ball physics experiment](#prototype), and features were added at the same time I learned Unity's ropes. This, added to rapid prototyping and little to no code architecture planning, resulted in a codebase that was entangled, difficult to follow and hard to extend.

The new version was built from scratch and several arquitectures were explored in the beginning of the project, until one was found to fit the game best. The chosen approach followed these principles:

 - Each level had a single entry point, the game controller, which orquestrated the different actors.
 - The game controller contained all top level parameters. Sub-parametrization was facilitated via [Scriptable Objects](https://docs.unity3d.com/Manual/class-ScriptableObject.html). For example, the PlayerController had PlayerParameters (which was a scriptable object) exposed on the game controller. The PlayerParameters could in turn have sub-parameters, if needed.
 - Dynamic objects, such as the player, hazards and interactable level parts should be created programmatically whenever possible.
 - The initial scene stage should only have static or decorative objects.
 - Object behavior should be managed by its specific controller. Game object components should be presentational and have as little behaviour as possible. For example, a rocket thruster could have a component which changed the color and size of smoke and fire, but it would be the thruster's controller responsibility to drive the input value for this component.
 - Orquestration of events (from dynamic objects, user interaction and other data streams) was handled using a reactive approach, facilitated by [UniRx](https://github.com/neuecc/UniRx)


## Levels

The level creation process went somewhere along these lines: I would go for a long walk without any audiobooks or entertainment, and allow my mind to wander around. If an idea came up, I would write it down in a [Google Keep](https://keep.google.com/) note. At a later time, in a quiet place, I would dissect these ideas on paper to materialize its pros and cons, while further developing the ideas that seemed most promising. 


### First Sandbox

Before building any of the levels, a scrappy sandbox level was built to work out the broader strokes of the player's movement. In this sandbox, movement, jump, stomp and dash (immediate single charge at the time) were first developed and loosely tweaked.

<div>
    <div class="youtube-player" data-id="7Fi5rzgwcVo"/>
</div>
<p class="media-caption media-caption-one"></p>


### RocketX

SpaceX was landing their first rockets on drone ships when the first idea of the bunch was developed. It revolved around the concept of a four thruster rocket platform. Each of these thrusters could be activated or deactivated by their respective button. An additional center button turned all the thrusters on or off. The platform had a finite amount of fuel that could be replineshed by shoving fuel crates, hazards or players in the center fuel intake.

This level would set the tone for the upcoming ones, so it was important to pin down the core gameplay, level structure and hazard dynamics before moving on to the next level. Just like changing a cosmological parameter would drastically change everything in the universe (like the possiblity of life), the game's basilar parameters were set as tightly as possibile early on, because even a small change could break other already built levels. For example, a small change in how fast the player is, how high can it jump or how gravity affects it, could translate into several hours of extra work to re-adjust every level accordingly, or even render them obsolete.

For these reasons, it took around 354 hours to develop the bulk of RocketX, about one fifth of the project's timespan.      

 
  <center>
  <div class="video-media-caption-wrapper-two"><div class="video-wrapper-two">
      <div class="youtube-player video-frame-two" data-id="pNcz-92Qva0"/></div>
    <p class="media-caption media-caption-two">Initial RocketX prototype, to access the <br class="video-br"/>overall feel of the level</p>
  </div>
  <div class="video-media-caption-wrapper-two"> <div class="video-wrapper-two">
       <div class="youtube-player video-frame-two" data-id="QWNof5LEvAE"/></div>
    <p class="media-caption media-caption-two">Textures, props, backdrop and hazards added, <br class="video-br"/> along with several adjustments to player gameplay</p>
  </div>
  </center>
 


<div>
    <div class="youtube-player" data-id="qRJ4ETvlLy8"/>
</div>
<p class="media-caption media-caption-one">Four players playing the final version</p>


### Garfunkel

Original concept for the second level was a variation of the [Simon](https://en.wikipedia.org/wiki/Simon_(game)) game, hence [Garfunkel](https://en.wikipedia.org/wiki/Simon_%26_Garfunkel). A sequence of lights would be played out first, and the player(s) would then have to mimic the same sequence afterwards by orderly hitting the respective target pieces, at the cost of the piece falling off if it were to be hit outside the sequence. There would exist as many platforms as the number of players.

A quick level layout was built. Soon after the first plays and it became apparent that the concept was flawed. Mimicking a sequence would mean that during the first phase, while the model sequence is played out, the player would be left to do nothing movementwise. Moreover, after the second or third prompt of the sequence, the player would most likely forget which came next, because his/her main focus would be getting the ball movement right and not hit any of the non sequenced tiles. Simon is about memory, Survival Ball is about motor skill.   

<div>
    <div class="youtube-player" data-id="g13i_KKoPAM" data-thumbsize="1"/>
</div>
<p class="media-caption media-caption-one">Initial Garfunkel prototype, exploring a variation of the Simon electronic game</p>


Pivoting from this, came the idea of collapsing the two phases into a single phase, no memorization needed. The platform piece prompts would be immediate and coupled with the background music rhythm, which would progressivly get faster as time passed. The player would have limited time to hit these prompts, as the unhit prompted pieces would fall after each music measure.

There was only one platform, since having multiple platforms would elicit a natural exploit. The player could quickly notice that the best strategy would be to focus all energy in a single platform. There was no real gain to be had on saving all platforms. One would suffice, and would be easier for the player to manage.

The background music was programmatically played. The easiest approach was to individually play each audio sample, meaning that the rhythm was dictated by the frequency to which these were played. Long and complex audio samples were not fit for this purpose, since they had their own tempo, and only transforming these samples would correctly match them with the overall music tempo. Simple and short audio samples were used, specially drum samples, which worked great for this use case.


 <center>
 <div class="video-media-caption-wrapper-two"><div class="video-wrapper-two">
     <div class="youtube-player video-frame-two" data-id="O4v96qUWg5g"/></div>
   <p class="media-caption media-caption-two">1. First tribal backdrop experiment</p>
 </div>
 <div class="video-media-caption-wrapper-two"> <div class="video-wrapper-two">
     <div class="youtube-player video-frame-two" data-id="1Q3wCCTs1jk"/></div>
   <p class="media-caption media-caption-two">2. Waterfall backdrop, later re-used in Unfair Fair</p>
 </div>
 </center>


 <center>
 <div class="video-media-caption-wrapper-two"><div class="video-wrapper-two">
     <div class="youtube-player video-frame-two" data-id="8CNEBxzrX8c"/></div>
   <p class="media-caption media-caption-two">3. Level exploit,<br class="video-br"/> bypassing piece decay, platform rotations and prompts</p>
 </div>
 <div class="video-media-caption-wrapper-two"> <div class="video-wrapper-two">
     <div class="youtube-player video-frame-two" data-id="Vxnas8eIIkY"/></div>
   <p class="media-caption media-caption-two">4. Simple particle system backdrop,<br class="video-br"/>synchronized with the music</p>
 </div>
 </center>


The music engine and platform movement were first tackled, and took a considerable amount of time to build. After a few playthroughs with these basic systems in place, something did not feel quite right. At the time, it seemed related with how the background looked like. Predominantly using drum samples, the overall music style suggested a tribal feel, and seemed important at the time to have a good match between the music and the level's visual appearance, hence the different backdrop experiments.    

After these four different backdrops, something was still off. Progressively I realized that the real problem was related with the platform's shape. In a circular platform, the best strategy is to safeguard the inner pieces, since they are easily reachable and have an inferior angular speed compared to the outer ones. Falling prey to [sunk cost fallacy](https://en.wikipedia.org/wiki/Sunk_cost#Loss_aversion_and_the_sunk_cost_fallacy), some attempts were made to save this concept: rotate the inner pieces at a higher speed or to rotate them in different axes; to implement piece decay, which released the piece if the player stayed on top of it for too long. None of them worked, since these obstacles could be easily bypassed, as shown by the above video number 3.


<div>
    <div class="youtube-player" data-id="55rM9iCQBSw" data-thumbsize="1"/>
</div>
<p class="media-caption media-caption-one">Final Garfunkel state. The level was scrapped but most of its elements were re-used in Beatmill and Big Giant Head</p>



The last backdrop experiment was a simple water floor, which focused the player's attention in the platform and had the additional benefit of having a near plane to which the player's shadow could be casted. The vertical player shadow was a very important reference for the player's position.

The level would need to be completely redesigned or scrapped altogether, since it was not acceptable in its current form. It ended up being scrapped, but the waterfall backdrop (video 2. above) was later reused by [Unfair Fair](#unfair-fair), and two new levels were forked from Garfunkel's base elements: [Beatmill](#beatmill) and [Big Giant Head](#big-giant-head).


### Beatmill

Beatmill addressed one of the major issues in Garfunkel, the easy exploit of the circular platform shape. Solution was to have several loose square pieces which were part of a cross or lengthwise treadmill. Randomly moving each piece along these two directions meant that no piece was permanently in the same area (like the center area) of the platform. Every single piece was important to treasure and save.

The treadmill system was developed from scratch, and Garfunkel's music engine and water floor backdrop were reused. 

 <center>
 <div class="video-media-caption-wrapper-two"><div class="video-wrapper-two">
     <div class="youtube-player video-frame-two" data-id="QoVlL5SxoKg"/></div>
   <p class="media-caption media-caption-two">Single piece treadmill logic,<br class="video-br"/> which would generalize in to a treadmill system</p>
 </div>
 <div class="video-media-caption-wrapper-two"> <div class="video-wrapper-two">
     <div class="youtube-player video-frame-two" data-id="D9mfA-_3XU4"/></div>
   <p class="media-caption media-caption-two">Treadmill system<br class="video-br-end"/><br class="video-br-end"/></p>
 </div>
 </center>

After developing the level's basic game elements and validating their gameplay via play testing, the decay concept was recycled from Garfunkel, with slight modifications. A special black button was placed as one of the platform's pieces. If pressed, it decayed the adjacent pieces. If a decayed piece was touched, it would fall.

This concept apparently worked well, but when play tested with a group of friends, it was pointed out as being too punishing. When the special black button was pressed, the level's difficulty skyrocketed, making the already difficult task of reaching prompted pieces even harder. As a result, pressing the black button was faced as a death kneel, urging players to restart the level right after the black button was pressed. After a few rounds of these, collective despair would soon grow due to the overwhelming difficulty.

Solution was to invert the black button's function. Instead of decaying the adjacent pieces, it would revive them. This time around, the special black button was not avoided in fear, but in greed. It was a precious resource, to be used as a late as possible.  

 <center>
 <div class="video-media-caption-wrapper-two"><div class="video-wrapper-two">
     <div class="youtube-player video-frame-two" data-id="yq5UPIoTyLo"/></div>
   <p class="media-caption media-caption-two">Four players playing an early version,<br class="video-br"/>with the special black button decaying the adjacent pieces</p>
 </div>
 <div class="video-media-caption-wrapper-two"> <div class="video-wrapper-two">
     <div class="youtube-player video-frame-two" data-id="qPaBAVRu8xM"/></div>
   <p class="media-caption media-caption-two">Four players playing the final version,<br class="video-br"/>with the special black button reviving the adjacent pieces</p>
 </div>
 </center>


### Big Giant Head

Garfunkel's platform did not work in a survival setting, but could it work in a different setting? In order for it to work, the level's progress could only advance when the player touched his/her respective prompt. An objective sequence. The level also needed a long term objective for these sequences to link up. Turns out the game campaign was lacking a final boss, and this could be a good opportunity to salvage Garfunkel's platform (and its respective movement and prompt system) to a new level, the final one. The final boss.

The defined long term objective was to deplete the boss's life, but the players needed a way to interact with it. The first idea was to drain the boss's life every time a prompted platform piece was hit, but that bore two problems: interaction was too indirect and there was no opposite force that gave the boss a chance to defend itself. Hazards could be used to fulfil this purpose, but that dynamic was too easy and insipid. The final boss was expected to be more challenging than all its previous levels, and was expected to require the player to use most, if not all, of the previously aquired learnings.

Inspired by classic game bosses, which stack different boss stages, solution was to materialize the boss into an anthropomorphic head, and have the head appear in the center, equipped with a turret, when it was sufficiently small to fit platform's center gap. The head shrank every time a sequence of prompted platform pieces were hit. The players could directly interact with the center head by hitting it, draining the boss's life. Difficulty progression was accomplished by decaying a set of platform pieces every time the small center head was defeated.
 

 <center>
 <div class="video-media-caption-wrapper-two"><div class="video-wrapper-two">
     <div class="youtube-player video-frame-two" data-id="Zd5Qi1Z-0Ww"/></div>
   <p class="media-caption media-caption-two">Interactable boss turret prototype<br class="video-br"/>added to the Garfunkel platform</p>
 </div>
 <div class="video-media-caption-wrapper-two"> <div class="video-wrapper-two">
      <div class="youtube-player video-frame-two" data-id="9cJ6whQak_E"/></div>
   <p class="media-caption media-caption-two">Three players playing the final version<br class="video-br-end"/><br class="video-br-end"/></p>
 </div>
 </center>


### Unfair Fair

"Giant washing machine drum" was the initial concept behind this level. Challenge was to transform this germinal idea into a fun level, coherent with the game's survival motto. Some scattered ideas were drafted on paper, such as having interactable controls to make the drum rotate in a given direction or to stop the rotation entirelly, but none of them were successfuly transformed in to a viable challenge or part of a larger challenge.


<div>
    <div class="youtube-player" data-id="ogk1-BE4Wgo" data-thumbsize="1"/>
</div>
<p class="media-caption media-caption-one">Hardcoded drum to validate to overall feel of the level</p>


The most interesting avenue was to reuse the piece decay concept from Beatmill. In Unfair Fair, the decay was caused by a specific hazard, which if not hit by its respective player, exploded and decayed the nearby platform pieces. Once these pieces were touched, they fell. The pieces near the platform spokes were decayed at start, to increase the chances of partial or complete piece group detachment.

The first iteration of this hazard exploded after bouncing a given amount of times, which proved to be unfair for when the hazard bounces close to the ground, giving little opportunity for the player(s) to react. 

The next and final iteration had the hazard explode a given time amount after its first bounce, which gave a fair chance for its dismantling. Visual presentation was reviewed to better present how close the hazard was to explode. The time taken to explode would decrease as the level progressed. 

Notice the waterfall backdrop below, repurposed from one of Garfunkel's experiments.     


 <center>
 <div class="video-media-caption-wrapper-two"><div class="video-wrapper-two">
     <div class="youtube-player video-frame-two" data-id="lYch8E96Sdw"/></div>
   <p class="media-caption media-caption-two">First version<br class="video-br"/>Decay hazards exploding after a given amount of bounces</p>
 </div>
 <div class="video-media-caption-wrapper-two"> <div class="video-wrapper-two">
     <div class="youtube-player video-frame-two" data-id="nP65k-Fp9X0"/></div>
   <p class="media-caption media-caption-two">Four players playing the final version<br class="video-br"/>Decay hazards explode after a given amount of time</p>
 </div>
 </center>


### Venom Rig

Upon Garfunkel's closure, began the development of a concept revolving around an oil rig shaped platform. The platform had four pillars, each destroyed when their respective button was pressed. The player had no motivation to press them, but these could be pressed by stomper hazard developed previously for RocketX. Their only task was to press these buttons.

To add another challenge dimension, a concept from the game's prototype was added: decay rockets (in the prototype they were represented as rectangular parallelepipeds). Upon landing, these hazards decayed the platform piece below until the piece was completely detached from the platform. Other hazards would be spawned throughout the lifecyle of the level for increased diversity.


 <center>
 <div class="video-media-caption-wrapper-two"><div class="video-wrapper-two">
     <div class="youtube-player video-frame-two" data-id="8wkLZoBdFGw"/></div>
   <p class="media-caption media-caption-two">First iteration of the level<br class="video-br"/>with a dynamically generated platform</p>
 </div>
 <div class="video-media-caption-wrapper-two"> <div class="video-wrapper-two">
     <div class="youtube-player video-frame-two" data-id="WHGM0U-mF0s"/></div>
   <p class="media-caption media-caption-two">Added decay rockets and other hazards,<br class="video-br"/>along with model, backdrop and texture work</p>
 </div>
 </center>
 
<div>
    <div class="youtube-player" data-id="L89rCKa2zU4" data-thumbsize="1"/>
</div>
<p class="media-caption media-caption-one">Four players playing the final version</p>


### Hex Elevator

The initial concept on paper was a 2.5D level in which a fluid (water/lava) would progressively rise as the player(s) made their way up a series of platforms and objects. The rising fluid concept seemed promising, but having a series of fixed 2.5D platforms seemed somewhat bland and left little space for cooperation dynamics.

Solution was to have an infinite amount of procedurally generated platforms, each higher than the previous one. The only way to reach the next platform was via an elevator assigned to a specific player, which first had to be activated by touching all of its respective prompts. The elevators would only rise when all players occupied their respective elevator.

[Reb Blob Games' guides](https://www.redblobgames.com/grids/hexagons/) on hex grids were immensly useful when building the procedurally generated honeycomb platforms. These guides couple well explained theory with concise practical implementations, and I highly recommend them to anyone doing hex grid work.

 
<center>
<div class="video-media-caption-wrapper-two"><div class="video-wrapper-two">
    <div class="youtube-player video-frame-two" data-id="7_Dx6vlX-vo"/></div>
  <p class="media-caption media-caption-two">First iteration of the level with procedurally generated<br class="video-br"/>platforms and their respective prompts and elevators</p>
</div>
<div class="video-media-caption-wrapper-two"> <div class="video-wrapper-two">
    <div class="youtube-player video-frame-two" data-id="hV-HI7lUlsA"/></div>
  <p class="media-caption media-caption-two">Added rising water which was<br class="video-br"/>replaced by lava in the upcoming iteration</p>
</div>
</center>

Upon the first play test session with friends, it became apparent that small tweaks were required to the behaviour of elevators. Because elevators would only rise when all players were sitting on top of their respective elevator, a problem arised if, near the upper platform, someone abandoned the elevator earlier than others. At that point, all elevators would drop, taking most of the players with them.

Solution was to make each elevator independent when they were close the upper platform, allowing for a smoother team transition between platforms.  

<center>
<div class="video-media-caption-wrapper-two"><div class="video-wrapper-two">
    <div class="youtube-player video-frame-two" data-id="-eQAA99UQrQ"/></div>
  <p class="media-caption media-caption-two">Four players playing the early version without<br class="video-br"/>elevator independence upon reaching the upper platform</p>
</div>
<div class="video-media-caption-wrapper-two"> <div class="video-wrapper-two">
    <div class="youtube-player video-frame-two" data-id="n5eVn3ieY3c"/></div>
  <p class="media-caption media-caption-two">Four players playing the final version with<br class="video-br"/>elevator independence upon reaching the upper platform</p>
</div>
</center>


### Tutorial

Is is generally a good idea to write the introduction of a book, essay or paper last, since you need to have a very solid idea of the shape of the finished product, and exactly what you need to mention up front for everything to hold together. The tutorial level was left for last for the same reasons.

It was the game's first level, and had the responsability to introduce the game and provide the required tools and knowledge to play it. Specifically, how to jump, double jump, dash and stomp. The overall concept of the level was inspired by an early version of [Gang Beasts' tutorial](https://www.youtube.com/watch?v=eQgWTt5usQ4&feature=youtu.be&t=17), which was pedagogic andp fun. Having the controls layed out as part of the scenario, instead of using an UI overlay fixture, was something quite interesting as well.


<div>
    <div class="youtube-player" data-id="rCCqNCzG7RE" data-thumbsize="1"/>
</div>
<p class="media-caption media-caption-one">First iteration. Functional, yet bland</p>


The first iteration had some of the required pedagogic elements, but was static and insipid when played, even though it had some interactive elements.

The following idea was to have a series of small platforms sitting by a pond. The instability of these floating platforms imprinted a livelier dynamic and were more physically sound than the initial tutorial iteration.
 

 
<center>
<div class="video-media-caption-wrapper-two"> <div class="video-wrapper-two">
    <div class="youtube-player video-frame-two" data-id="Q1ewmcfZoCM"/></div>
  <p class="media-caption media-caption-two">Second iteration, featuring <br class="video-br"/> several floating platforms inside a pond</p>
</div>
<div class="video-media-caption-wrapper-two"> <div class="video-wrapper-two">
    <div class="youtube-player video-frame-two" data-id="7ACfcqM3zMQ"/></div>
  <p class="media-caption media-caption-two">Refinements to the second iteration<br class="video-br-end"/><br class="video-br-end"/></p>
</div>
</center>
 
 
After a play test with friends, it was noticeable that very few people understood how to dash, or how important the combination of jump, dash and stomps were to gain air control. 
 
Solution was to add an animated billboard ilustrating how the dash charge worked, and add two additional sections focused on air control. The following play tests showed that these changes made a significant difference on a player's comprehension of the game's basilar movements and techniques. 
 

<div>
    <div class="youtube-player" data-id="bdmKDki32Og" data-thumbsize="1"/>
</div>
<p class="media-caption media-caption-one">Final iteration with an animated dash charge billboard and new sections focused on air control</p>


### Extra: Block Towers

This level was not used, since no plausible game dynamics were found to fit the overall concept of the game, but the sheer fun and simplicity it provided while moving around high stacks of blocks were worth the special mention. 

<div>
    <div class="youtube-player" data-id="_7bUriE71NY" data-thumbsize="1"/>
</div>
<p class="media-caption media-caption-one"></p>


## Menus and User Interface

Most of these interfaces were built in the late stages of development. Following the [Visual Aesthetics](#visual-aesthetics) layed out earlier, the first rough screens were sketched out, starting by the home screen. Some experiments were made with the game's logo and UI elements. UI buttons design for example, referred their colors and shape from a core element of the game, the hexagonal wave counter. 


<div>
    <div class="youtube-player" data-id="3_a3mHJhOuQ" data-thumbsize="1"/>
</div>
<p class="media-caption media-caption-one">First iteration of the home screen</p>


At about the same time, the title screen was built. Presented when opening the game and right before the home screen, it was crafted to create an impactful first impression and to be later used for key art, showcasing the most important elements of the game: logo, players, enemies and some levels. Another important aspect was to illustrate that this was a co-op game, so the 4 players were placed in the forefront, aligned in such a way that no one was widely in front of anyone, with about equal highlight to all of them. The screen drew inspiration from other games' key art, such as the one from [Super Mario Land 2](https://en.wikipedia.org/wiki/Super_Mario_Land_2:_6_Golden_Coins), which presented all game's key elements in one powerful, stylized image. 


<div>
    <div class="youtube-player" data-id="OPnS6aaiGks" data-thumbsize="1"/>
</div>
<p class="media-caption media-caption-one">Title screen</p>


The home screen was later refined and the remaining screens were progressively built and polished. These were the options (video, audio and controls), player selection, pause, end game, game selection and stats screens.


<div>
    <div class="youtube-player" data-id="OrAXiD4QQis" data-thumbsize="1"/>
</div>
<p class="media-caption media-caption-one">Tour of all menus and graphical interfaces</p>



## Audio

Music and sound effects were built using GarageBand. Many freely available sound libraries such as the [Sonniss GameAudioGDC Bundles](https://sonniss.com/gameaudiogdc2017/) were used to mash up different samples into new sound effects.  

{% imgcap /files/sb_making_game/main_screen_main_theme2.png GarageBand project for the main theme %}

Audio aimed to be clean and coherent, thus a small subset of samples were used from the immense libraries available and reused whenever possible, trying to settle with a mostly electronic style for music and to use instruments or natural audio effects for SFX.

### Keys

I believe coherency is gained when using a small set of musical keys throughout the game. Survival Ball only used the C major key and its relative minor, A minor. Major keys are genererally recognized as happier and joyful and minor keys as darker and heavier. In the game, each level or screen used one of these keys, according to the desired environment and feel. 

One interesting nugget of knowledge I came to learn while developing the audio, was that sound effects also fit within a certain key. The overall audio will sound much better when sound effects and music are built in key accordance.  

### EQ
 
Another interesting tidbit was to remove the extremely low and high frequencies in the final mix. The effect is threefold: audio fatigue is reduced when editing; makes the overall composition seem cleaner to the listener; leaves more headroom in the audible frequency range, improving the composition's focus and clarity.  

{% imgcap /files/sb_making_game/eq_cutoff.png Extremely low and high frequencies cutoff in the master bus' EQ %}

### Organization

The game ended up having more than 60 different sound effects and around [20 musical segments](https://store.steampowered.com/app/997540). A considerable amount of time was wasted checking on a given audio segment status, so a simple spreadsheet was used to track the name, category and its state (done, needs revision, missing). This simple sheet improved the audio creation process considerably. 




## Play Tests

### AI agents

Having the need to perform many iterations and tweaks without constant access to other testers, a simple AI was built to simulate multiplayer dynamics and to have a better grasp of how the level handles these dynamics.

AI agents were specific to each level, and driven by a series of objectives. For example, in Beatmill, the agent's main objective was to reach its respective colored prompt. If no prompts existed, it would move towards the platform's center, the optimal place to wait for a prompt. It also had passive behaviours such as avoidance of gaps or special black buttons via jumps. As seen in the video below, the agents are not perfect, but set a good work baseline.


<div>
    <div class="youtube-player" data-id="L82f3-ckaYA" data-thumbsize="1"/>
</div>
<p class="media-caption media-caption-one">Beatmill (non published early version): the blue, green and yellow players are controlled by AI</p>



### User Tests

Once roughly tweaked, the game was presented (preferably for the first time) to a group of friends during a play test session. These sessions were of uttermost value, since they provided valuable feedback, critics and/or validation to the various game elements.

There were 6 play test sessions in total. Apart from how valuable these were to improve the game, they were also a great opportunity to gather a group of friends and have a good time. The game was modified and tweaked between each session, after digesting the impressions and feedback of the previous one.

The game had some backdoor hooks which allowed for quick macro difficulty tweaks, e.g. how many waves were necessary to unlock a level. These were specially useful in the first play session, since the game was extremelly punishing in its early incarnations.

Some guidelines I tried to follow:
 
 - Refrained from playing. I only joined if the backdoor hooks were not enough to lower the difficulty to a point that was enjoyable by the players. I could infrequently join near the session's end and most of the feedback had been provided.
 - I sat behind the players, writing impressions and feedback. Sporadically I asked for more details on a comment or behaviour that I observed. Being an observer, it is also easier to probe for mood fluctuations in the room. For example, when frustration starts to build up due to the extreme difficulty of a level, it is easily noticeable when observing from outside. The same applies for bursts of joy a given level or dynamic might cause.
 - Gut reactions were very precious, so I would probe for more details on these reactions and encourage honest reactions and feedback.  
 - After the game was finished, I asked the players about their impressions, what they liked, they did not like, the level they enjoyed the most and the level they enjoyed the least. On that note, RocketX, Hex Elevator and Big Giant Head were top favorites. Venom Rig, Unfair Fair and Beatmill were most often referred as the less enjoyable of the bunch.
 - Only explained the reasons behind a given design decision after the game was finished and most of the feedback had been given, to diminish the influence of my opinion on the players feedback.


# Launch

The game was launched on November 8th, 2018. One month earlier, the [Steam store page](https://store.steampowered.com/app/918690), [official website](https://survivalball.com/) and [twiter account](https://twitter.com/survivalball) were brought online. During that month, a closed beta ran on Steam, which served mostly for last mile validations, since the bulk of the iterations were made during the in-person play testing phase. At the same time, several dozens of keys were sent to youtubers, with notable regard to the ones specialized in couch co-op games. To the ones contacted by email, I took into attention [this video by Stephen](https://www.youtube.com/watch?v=L3Qf1aQHqyc), where he describes what kind of emails he expects to receive from developers. 

After launch, I was advised by fellow developers that the above strategy was not optimal, because it is usually a good idea to build your following by sharing your progress and interacting with the community during development (via social networks or dev blogs for example), potentially increasing the game's exposure and sales. In a possible new game, it would be interesting to adopt this strategy and take note of how workflow and game design would be influenced.


# Indie X

Shortly after completing the first beta build of the game, I submitted my application to [Indie X](https://indiex.pt/), the biggest indie game showcase/contest in Portugal. Fortunately, Survival Ball was accepted as one of the 55 finalists, meaning that it would be showcased at Lisboa Games Week 2018 a week after the game's launch!

A custom build was specially crafted for the event. To better fit the event's environment, the build offered an arcade experience through local leaderbords for the players with the highest number of completed waves, and leaderboards for the fastest players to finish Big Giant Head or the Tutorial. A simple controls cheat sheet was added to the pause menu, and the end game screens were changed to allow the players to enter their (group) name to the leaderboard. All levels were unlocked in this build, avoiding the need to finish the campaign to access a specific level.


<div>
    <div class="youtube-player" data-id="m6X0yNZu-PI" data-thumbsize="1"/>
</div>
<p class="media-caption media-caption-one">Highlights of the custom build for Lisboa Games Week 2018 showcase</p>


The event surpassed all my expectations. It was the first time I saw, in person, swathes of anonymous people playing Survival Ball. It was pleasantly surprising to recurrently see many groups of gamers trying out the game, playing for hours, and even returning back to the booth at a later time. Not much sleep was had during those four days, but it was rewarding to witness such moments.


<center><a href="https://twitter.com/survivalball/status/1064556805630697477"><img align="center" src="/files/sb_making_game/composite-3-players-photos_705.png" alt=""></a></center>
<p class="media-caption media-caption-one">Some of the players at Lisboa Games Week. More photos and videos <a href="https://twitter.com/survivalball/status/1064556805630697477">here</a></p>


The showcase was also a great opportunity to connect with other developers and get to know their stories and games. The overall experience was incredible and I am immensly thankful to the organizers for putting it all together 🙏  


# Additional Notes / Appendix

## Tools

- **[Unity](https://unity3d.com/)** - game engine in which the game was built
  - **[Rewired (Unity plugin)](https://assetstore.unity.com/packages/tools/utilities/rewired-21676)** - a godsend for managing input
- **[Rider](https://www.jetbrains.com/rider/)** - .NET IDE used to develop and manage the game's code
- **[Blender](https://www.blender.org/)** - used to build all the 3D models and to map their respective textures. Blender is one of the most powerful FOSS tools I have ever used, and puts up a good fight against proprietary packages such as 3ds Max
- **[Inkscape](https://inkscape.org/)** - all textures were crafted in Inkscape. Almost all textures were [vector based](https://vector-conversions.com/vectorizing/raster_vs_vector.html), and later rasterized for Unity in PNG format
- **[GarageBand](https://www.apple.com/lae/mac/garageband/)** - music and sound effects composition
- **[Tyme](https://www.tyme-app.com/)** - project time tracking
- **[Git](https://git-scm.com/)** - source control. [GitLab](https://gitlab.com/) private repositories were used to host the game's project and website

## Time log

Time was tracked during the entire span of the project, in various categories.

### Time for all categories, per milestone:

- **Until first complete alpha build** - 1334 hours 
- **Until Steam release** - 1642 hours
- **Total, until now** - 1716 hours 

### Time until now, per category

- **Coding, visual work, tooling, research/study** - 1417 hours
- **Audio (music, sfx)** - 92 hours
- **Final builds play tests (does not include play tests with other people or tests during development)** - 32 hours
- **Website** - 22h
- **Marketing, screenshots, videos, social media** - 123 hours
- **User support** - 8 hours
- **Administrative, burocracies** - 22h



## Final Notes

- The game was developed in macOS. Windows was mostly used to work out the particularities of its respective build, such as build post-processing work.
- [In case you need one more reason](https://twitter.com/chetfaliszek/status/1085957214781595648) on why to use version control for your game project: time travel. The game was under version control since day one, and its git repository has around 1.3K commits at the time of this writing. Going back in time was as simple as checking out an older commit. Almost all videos presented throughout this article were made possible because of this. Checkout, open project, record, repeat. Not only that, but it was fairly easy to see how work evolved over time, which helped immensely when writing this article.
- Most challenging aspect was to make sure everything was coherent. Once root concepts, design and objectives were aligned and the early level prototypes felt good when played, then filling out the gaps (refining gameplay, models, textures, audio, UI) was somewhat straightforward.
- The game's development could be divided in three phases:
  - **First phase (until first alpha build)** - bulk of the development work was done during this phase. Very intense in terms of making sure everything was coherent, sane and enjoyable to play. There were large temporally contiguous blocks of work on each level.
  - **Second phase (first alpha to public launch)** - development was scattered, moving from place to place, iterating where needed and finishing up peripheral features such as Steam integration. 
  - **Third phase (from launch onwards)** - maintenance work, user support, optimizations and bug fixes.
- I had an amazing experience building this game and am very happy with the final result. Not only did it materialize one of my dreams, but gave me the opportunity to explore and deepen areas outside my professional expertise, such as 3D modeling/texturing, audio production and game design. If you are a game developer or are thinking on becoming one, I hope this testimony was useful for your journey and hopefully brought more clarity into the process 🙌
 