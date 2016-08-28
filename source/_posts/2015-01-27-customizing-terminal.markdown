---
layout: post
title: "Quickly Customize OSX Terminal Style and Functionality"
comments: true
categories: workflow
tags: [android]
---


![image](/images/blog_images/terminal_custom/terminal_before_after.png)

<!--more-->

###Style - how it looks
Add the *real world tested* [Solarized (dark/light)](http://ethanschoonover.com/solarized) Terminal profiles: [https://github.com/tomislav/osx-terminal.app-colors-solarized](https://github.com/tomislav/osx-terminal.app-colors-solarized)

- After cloning the repo, just open the profile files, which will add them to your Terminal.app preferences
- You can set them as the default profiles on your Terminal.app preferences
- To enable the terminal colors, add the line `export CLICOLOR=1` to your .bash_profile

###Function - what it does
Grab the .bash_profile here: [https://gist.github.com/lopespm/3877ff1ca4064a392686](https://gist.github.com/lopespm/3877ff1ca4064a392686), which is heavily based on [Nathaniel Landau's profile](http://natelandau.com/my-mac-osx-bash_profile/)

- In OSX, .bash_profile is executed [everytime you open a new Terminal window](http://www.joshstaiger.org/archives/2005/07/bash_profile_vs.html), and it lives in your user's home directory, i.e. `~/.bash_profile`
- If it does not exist, just `touch ~/.bash_profile` to create it
- If you do not want to clutter your .bash_profile, you can create a file like `~/scripts/utilities.bash` with the portions you find useful and then add this line to your .bash_profile: `source ~/scripts/utilities.bash`


Hopefully now your Terminal is even more inviting :)