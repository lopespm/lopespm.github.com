---
layout: post
title: "ArXiv Papers: React Native Android App"
comments: true
categories: apps
tags: [mobile]
description: "ArXiv Papers is an open source mobile application to search, download and save arXiv papers. Developed using react native / redux and avalaible for Android"
ogp_image: "/files/arxiv-papers/thumb.jpg"
published: true
---

{% imgopt /files/arxiv-papers/arxiv_layout_implementation Layouts of the ArXiv Papers App %} 

ArXiv Papers is an [open source](https://github.com/lopespm/arxiv-papers-mobile) mobile application to search, download and save arXiv papers. It was developed using a react native / redux framework and is currently available for smartphone and tablet devices. You can get it on [Google Play](https://play.google.com/store/apps/details?id=com.rockbyte.arxiv).

<!--more-->

##Motivation

Often I would find myself downloading the same arXiv paper on my phone because it would get buried in the "downloads" folder under the default arXiv id file name, so instead of sifting through a myriad of already downloaded PDFs I would just revisit the paper's web page and redownload it.

Organizing each paper neatly into its proper folder with a more discernable filename is quite laborious on a mobile device and the apps I tried out either did too much or too little. I just wanted to quickly search an arXiv article and quickly refer to the ones I downloaded.

This seemed not only a good opportunity to leverage on [arXiv's public API](https://arxiv.org/help/api/index) and develop this idea into an application, but also to expand from Android native development and dive into cross platform app development, specifically Android/iOS.


#Bootstraping

Cross platform mobile app development frameworks come far and wide, so the plan was to go through them, choose one framework, learn its foundations, and attempt to solidify my understanding of its various concepts, advantages, pains and quirks by using it in this new application.

I went shopping for a suitable framework and eventually settled with react native/redux. It seemed like a good fit for the project and a valuable add to my programming tool belt. React and redux had been around for a while and were quite mature and capable at that point. The react native library did not reach a major version yet, but appeared to be quite solid and had a rich ecosystem, vibrant community and various [successful](https://code.facebook.com/posts/1189117404435352/react-native-for-android-how-we-built-the-first-cross-platform-react-native-app/) [use](https://developers.soundcloud.com/blog/react-native-at-soundcloud) [cases](https://www.youtube.com/watch?v=8qCociUB6aQ) in demanding production apps.

I first built my foundations through courses ([Dan Abramov's](https://egghead.io/instructors/dan-abramov) react and redux courses are wonderful), examples, lectures, tutorials, documentation and articles. I was pleasantly impressed with the [CRNA](https://github.com/react-community/create-react-native-app) project's workflow and how it enables you to develop an entire application without touching a single native implementation piece. However, Android and iOS are two distinct platforms, with different design and UX paradigms, meaning that even unejected applications should be specifically tailored for each platform. With this in mind, and knowing that I would need native integrations to download papers for example, I decided to narrow the scope to Android only, but a potential future iOS version should not be a huge pain.

#Design

{% imgcap /files/arxiv-papers/arxiv_layout_mockup.png Final Android smartphone app design, made in Sketch %}

After a few iterations, the above design seemed like a good compromise between functionality, breadth and ease of use. Most importantly, it catered to the app's motif: search, download and save arXiv articles. 

Many, if not all of the apps I explored, allowed the user to browse through arXiv's categories. For this application however, it did not seem to be an essential feature. Browsing categories serves discoverability, but I am assuming that whoever uses this app would at least have a rough idea of what she is looking for. In that case, keyword search can fill that use case. Looking for DeepMind's [Playing Atari with Deep Reinforcement Learning](https://arxiv.org/pdf/1312.5602.pdf)? Write "deep atari" and the paper you are looking for appears on the first page.

Bookmark-wise, the assumption is that if you download a paper, then most probably it is something your are interested in, thus the higher the probability for its recall. How about merging the two concepts? You are on the article's details screen, you download it, read it if you wish, and when you arrive back at the home screen, it will be available for immediate recall.

#Implementation

React by itself is a library which could be seen as the view in model-view-controller, whereas react native builds upon it by providing native component rendering, and redux is used for state management. Moreover, I chose to use [Redux Observable](https://redux-observable.js.org/) to handle redux action side effects, [Native Base](https://nativebase.io/) for most of the UI components, Flow for type safety, [Detox](https://github.com/wix/detox) for end to end tests and Jest for unit and integration tests.

## Action Side Effects

Redux Observable does not seem to be a popular choice for action side effects, when compared with redux sagas for example, but I think it offers one of the best solutions in this domain. At its core it uses rxJS, a library for reactive programming, which is a natural fit for the asynchronous nature of redux action side effects. This approach is inherently declarative, provides powerful composition (complex async tasks godsend) and makes it easy to cancel async tasks, a common edge case which is often overlooked and can make the difference between an OK application and a very solid application. 

## Testing

Application logic was contained inside the action's handlers, selectors and reducers, so I chose not to test the react components because the unit and integration tests could extract an higher value when applied to the before mentioned triad. Adding to this, ESLint was used for code quality control and catching basic errors, and much of the application was typed using Flow. Redux Observable epics were not type checked, since at the moment there are [no meaningful type definitions available](https://github.com/redux-observable/redux-observable/issues/258).

Integration tests were done for the different application modules (articles, papers, etc), using actions as inputs and selectors as outputs; action side effects were tested separately in their respective unit tests. More unit tests could be made to each of the redux units and further satisfy the traditional test pyramid, but the before mentioned static analysis served as a good foundation and most of the module's inner code paths were covered by the aforementioned tests, so I opted for a more a pragmatic approach, one which could yield a higher value with minimum developer effort.

To encompass the whole application, end to end tests were built with the aid of Detox. Detox's android support is still nearing completion, but appears to be a very promising solution. One of its most distinctive features, when compared with popular black box testing frameworks like Appium, is its direct integration with the native layers via EarlGrey for iOS and Espresso for Android, translating to more stable, faster and less flaky tests. Using it was straightforward, the API is well designed and it did not stand in the way while writing the tests. Overall, a good experience for this small application.

## Folder Structure

Regarding folder structure, I opted for a feature based tree which branched into framework concepts (reducer, action, selector, react component, redux observable epic). As it typically happens in other domains, using the framework's concepts as the root of your folder structure works great for small applications, but as complexity grows, root division by features makes the structure much easier to extend and reason about.

~~~
├── __e2e__
├── modules
│   ├── articles
│   ├── connection
│   ├── donations
│   ├── navigation
│   ├── papers
│   │   ├── __tests__
│   │   ├── epic
│   │   ├── paper.js
│   │   ├── actions.js
│   │   ├── reducer.js
│   │   └── selector.js
│   ├── permission
│   ├── shared
│   └── snackbar
├── configureStore
├── theme
├── App.js
├── epic.js
├── reducer.js
└── selector.js
~~~
{:lang="bash"}

<br/>

#Get it, Hack it

Feel free to hack away [the code](https://github.com/lopespm/arxiv-papers-mobile) or download the application on [Google Play](https://play.google.com/store/apps/details?id=com.rockbyte.arxiv), let me know your thoughts about it!
