---
layout: post
title: "Attenuate GoPro Chest Mount Heartbeat - using GarageBand/iMovie"
comments: true
categories: audio
tags: [gopro]
published: true
---

If you have a chest mount (chesty) for your GoPro, then you might have had the surprise of hearing your heartbeat on the recording, since it may lay fairly close to your heart, picking up its beat. This post will:

- show you how to attenuate the heartbeat sound to a point where it is almost imperceptible, while maintaining the overall sound
- attenuate the difference between quiet and loud sounds, so the listener gets less startled by a sudden noise created when entering with the bike on rought terrain or the common bike bell sound.

##Steps, using GarageBand/iMovie

In this specific case, GarageBand 10.0.3 and iMovie 10.0.5 were used, but other versions should work just as fine.

1. Open iMovie
    1. Import your GoPro file(s) into your iMovie project. This is the best point in time to edit them and arrange the movie to your liking
    2. Export your movie (File->Share->File...)
* Open GarageBand
    1. Drag the exported movie into your GarageBand project
    * Decompress [gopro_master_track.patch.zip](/files/gopro_heartbeat/gopro_master_track.patch.zip) and copy **gopro_master_track.patch** to the "~/Music/Audio Music Apps/Patches/Output"
    * Go to your Master Track (if you do not see it, click "Track->Show MasterTrack") and click "User Patches" in your Library tab (if you do not see it, click "View->Show Library")
    * You should now see inside the "User Patches" the patch file we just copied, select it
    * *Your audio should now have an attenuated heartbeat and a more audible and balanced sound*
    * Export the audio (Share->Export to Disk). AIFF or MP3 will work great. I personally use the MP3 192kBit/s export, since the GoPro audio is not extra pristine to start with, so the tiny losses in compression are pretty much neglegible
* Go back to iMovie
    1. Remove the sound on your original GoPro video(s)
    * Drag the export audio from GarageBand, and place it below the video timeline
* Done!


##Why did this \*hopefully\* worked for you?

The whole concept is very simple really, the heartbeat is simply being attenuated on specific frequencies by a Channel EQ plugin included in the above Master Track patch. This is how it looks visually:

![image](/files/gopro_heartbeat/heartbeat_channel_eq.png)


This Channel EQ alone will turn this:

{% audio /files/gopro_heartbeat/gopro_sample_with_heartbeat.mp3 %}

into this:

{% audio /files/gopro_heartbeat/gopro_sample_without_heartbeat.mp3 %}


And that is it! The rest of the plugins included on the Master Track Patch are:

 - An additional Channel EQ that attenuates clicking sounds I heard along my videos
 - Two compressors and a limiter which increase the overall loudness and diminish the difference between quiet and loud sounds

##Support Files:

- [Master Track Patch](/files/gopro_heartbeat/gopro_master_track.patch.zip) (which includes all the above plugins)
- [Channel EQ preset](/files/gopro_heartbeat/gopro_eq_heartbeat_attenuate.pst) to attenuate the heartbeat sound. This can be used by opening a Channel EQ plugin in any of your tracks and clicking "More->Load.." inside it
- The final result of a movie using these plugins:

<center><iframe width="560" height="315" src="//www.youtube.com/embed/sczmkokpEuY" frameborder="0" allowfullscreen></iframe></center>
