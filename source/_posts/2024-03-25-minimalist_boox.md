---
layout: note
title: "Minimalist Onyx BOOX Note Air3 B/W Setup"
comments: true
categories: notes
tags: []
description: "Focused, Debloated Writing and Drawing on BOOX Air3"
ogp_image: "/files/minimalist_boox/pthumb.png"
ogp_image_twitter: "/files/minimalist_boox/pthumb.png"
published: true
---

As part of the plan to banish mobile phones with access to instant rewards from my bedroom (more on this in an upcoming post), I've acquired a Onyx BOOX Note Air3 B/W, which is a Android tablet with a black and white e-ink screen that is focused on writing and reading <sup id="fnref:1"><a href="#fn:1" rel="footnote">1</a></sup>

## House Rules

First of all, *why* I did get the device in the first place? This was in order to:

- Reduce distractions before going to sleep and after waking up, increase focus on the things that really mattered, block out all other noise, and make it really hard to have access to instant gratification and rewards (such as video consumption)
- Register any ideas and thoughts that occur to me before and after going to sleep, which is one of my most proficuous times for such, and then have them available on other devices

*How* to achieve this using the BOOX:

- Only two functionalities should be easy and quick to use:
  - Write text and notes (via Google Keep and Google Docs)
  - Write diagrams and mental maps (via the device's main app, which has the snappiest performance)
- Getting to above functionalities should be as fast as possible, and they should be fast
- The cost to get to other apps and functionalities should be high

## Focusing & Debloating

The Onyx BOOX Note Air3 B/W is not an incredibly fast device, and comes with several functionalities, apps, and a launcher that increase the distraction degree, and also slow down the device.

### Google Play, Google Keep & Docs

The first step towards the objective above was to install Google Play (see [guide here](https://help.boox.com/hc/en-us/articles/8569260963732-Google-Play-Store), and afterwards installed these apps:

- Google Keep
- Google Docs
- Android Hidden Settings - this app provides access to several hidden settings, that allow the access of settings such as enabling the Developer Options in Android (useful in the debloating process described below)
- Lawnchair (see below)

### New Launcher: Lawnchair

<center>
<div class="video-media-caption-wrapper-two"><div class="video-wrapper-two">
   {% imgopt /files/minimalist_boox/home_screen_before How the home screen looks like now %}</div>
 <p class="media-caption media-caption-two"><b>Before:</b> Default BOOX Launcher <sup id="fnref:2"><a href="#fn:2" rel="footnote">2</a></sup> </p>
</div>
<div class="video-media-caption-wrapper-two"> <div class="video-wrapper-two">
	{% imgopt /files/minimalist_boox/home_screen_after How the home screen looked like before %}</div>
 <p class="media-caption media-caption-two"><b>After:</b> Using Lawnchair Launcher<br class="video-br-end"/></p>
</div>
</center>

The default device's launcher was replaced by [Lawnchair](https://lawnchair.app/), which is a lightweight, open-source, highly customizable launcher for Android.

What was added to the Lawnchair's home screen:

- Shortcut to Google Keep
- Shortcut to Google Docs
- Shortcut to Onyx Launcher - for any custom changes that are only accessible on the device's default launcher, which are are in practice, so this was eventually something I removed from the home screen as I wrote this note
- Shortcut to Google Calendar - to add any events or reminders
- A widget to Onyx Sketch app, which is one the only way I found to have that app directly accessible from the Lawnchair home screen, without having to use Onyx's launcher to do so. The widget can be added by long pressing on the home screen, then select "Widgets", and then on the "ContentBrowser" section select one of the "Notes" widgets


### Disabling bloatware

With all of the above in place, we could start disabling non-essential apps and services, to prevent them from running in the background.

Here are the steps:

1. The first step is to enable "Developer Options", by accessing the system settings via the "Android Hidden Settings" app above, and then finding the [Build Number](https://developer.android.com/studio/debug/dev-options) in order to click it enough times to eventually enable "Developer Options".
2. Connect the BOOX to the computer
3. On the computer's terminal run the below commands

In general, these are the commands one can run via the terminal to manage bloat apps:

~~~
// See all packages
$ adb shell pm list packages

// See all disabled packages
$ adb shell pm list packages -d

// Disable a package
$ adb shell pm disable-user --user 0 <package_to_disable>

// Re-enable a package
$ adb shell pm enable <package_to_disable>
~~~
{:lang="bash"}

<br/>
And these are the specific ones I used in my BOOX to disable bloatware, without any relevant side effects for my usages:

~~~
adb shell pm disable-user --user 0 com.onyx.appmarket
adb shell pm disable-user --user 0 com.onyx.floatingbutton
adb shell pm disable-user --user 0 com.onyx.dict
adb shell pm disable-user --user 0 com.onyx.mail
adb shell pm disable-user --user 0 com.onyx.igetshop
adb shell pm disable-user --user 0 com.onyx.easytransfer
adb shell pm disable-user --user 0 com.onyx.kime
adb shell pm disable-user --user 0 com.onyx.android.ksync
adb shell pm disable-user --user 0 com.onyx.calculator
~~~
{:lang="bash"}

<br/>

The commands above should be enough to remove all bloatware, and if you wish to learn more, [this article](https://www.kaspersky.co.uk/blog/how-to-disable-and-remove-android-bloatware/26993/) and [this article](https://digitaluncoded.com/cpu-usage-android) provide a good overview.

## Using an external keyboard

Given that this device is meant to be used in bed, and since it is quite unwieldy to write on the on-screen display, I was looking for an external keyboard that could be somehow attached to the BOOX, that would bestable, low-maintenance and allowed for flexibility on the writing position.

From the keyboards and keyboard stands I've researched, the most elegant solution I found was to use [Logitech K480](https://www.logitech.com/en-gb/products/keyboards/k480-multi-device-wireless.html), a bluetooth keyboard with an in-built cradle, detachable batteries (i.e. zero issues related internal battery becoming faulty), incredible battery span (some users reported this to be [in the order of years](https://www.youtube.com/watch?v=EoH2bXoNEE0)), and wonderful typing experience.

One caveat is that the BOOX slides backward and falls when using the cradle without any other aid. A very simple fix is to get a piece of cardboard, and place it behind the BOOX (see picture below) to create a better fit. It works remarkably well.

{% imgopt /files/minimalist_boox/keyboard_k480_with_boox BOOX attached to Logitech K480 cradle, with and added piece of cardboard %}
<br/>

## Writing and Drawing

### Writing

Writing is my main use case for the device, and even though it has some lag when doing it, it works great for me, because I tend to write long streams of ranting text, rather than editing it.

<div>
	<div class="youtube-player" data-id="bYENTrabzXw" data-thumbsize="1"/>
</div>
<br/>

The best mode I've found for writing was the "A2" Mode. It has ghosting, but is responsive enough for this use case.

{% imgopt /files/minimalist_boox/configuration_for_writing BOOX attached to Logitech K480 cradle, with and added piece of cardboard %}
<br/>

### Drawing

To draw, I use the default Onyx's Sketch app due to its responsiveness, even though I would have preferred to have a more customizable UI interface and faster ways to share the drawing.

Sharing is one of the downsides of the Onyx Sketch app. You need to either use their cloud service, or export the image in order to get the sketch easily accessible on other devices. I've opted to use the export functionality, which allows to directly share the image to a Google Keep note, which fits well into my workflow. I would prefer to not have this extra step, but still, it works well enough.

<div>
	<div class="youtube-player" data-id="iW3IZ9MnFL8" data-thumbsize="1"/>
</div>
<br/>

## Closing Thoughts

This has been one of the most satisfying devices I've added to my routines, and it's incredibly satisfying to write on this device, almost distraction free. It allows enough customizability for it to be tailored to my use case, but is also limited enough to deter me from falling prey to distractions.

I hope this was useful towards your journey - do let me know your tips for distraction free environments!

<br/>
<hr/>
<br/>

<div class="footnotes">

  <ol>
	<li id="fn:1">
  	<p>The BOOX Note Air3 B/W is a very capable device, able to do most of the things one would expect from an Android Tablet, but its screen refresh rate, speed and screen drag make it less suited for fast browsing and video usage for example. <a href="#fnref:1" rel="reference">↩</a></p>
	</li>
	<li id="fn:2">
  	<p>The screenshot is from BOOX Tablet Note Air 3 C, the color counterpart of Onyx BOOX Note Air3 B/W, but the layout is the same, save from the color display <a href="#fnref:2" rel="reference">↩</a></p>
	</li>
    
  </ol>
</div>
