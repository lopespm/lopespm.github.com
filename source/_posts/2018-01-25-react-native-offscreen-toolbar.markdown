---
layout: post
title: "React Native Offscreen Toolbar"
comments: true
categories: libraries
tags: [libraries, mobile]
description: "React native library which animates the toolbar off-screen while scrolling, a common material design pattern"
ogp_image: "/files/rn-offscreen-toolbar/thumb2.jpg"
published: true
---

In material design, there is a [common scrolling technique](https://material.io/guidelines/patterns/scrolling-techniques.html#scrolling-techniques-behavior) in which the toolbar is smoothly tucked away while scrolling down and is made visible again when scrolling up. This behaviour is fairly straightforward to implement when developing a native android app, but for a react native app, the best solution I found was [Janic Duplessis'](https://medium.com/appandflow/react-native-collapsible-navbar-e51a049b560a).

The [library](https://www.npmjs.com/package/react-native-offscreen-toolbar) I am releasing today is an encapsulation of this behaviour and its implementation is heavily based on Janic Duplessis' approach.

<center>
  <div style="overflow: auto; margin-bottom: 16px">
    <div style="float: left;height: 10px; width:8%;"/>
        <video autoplay loop muted playsinline style="width: auto; border: 0px; box-shadow: rgba(0, 0, 0, 0.02) 0px 1px 4px; float: left;height: auto; width:40%;">
        <source src="/files/rn-offscreen-toolbar/simplelist_demo.webm" type="video/webm"/>
        <source src="/files/rn-offscreen-toolbar/simplelist_demo.mp4" type="video/mp4"/>
        <!--[if lt IE 9]><img src="/files/rn-offscreen-toolbar/simplelist_demo.gif"><![endif]-->
    </video> 
    <div style="float: left;height: 10px; width:4%;"/>
    <video autoplay loop muted playsinline style="width: auto; border: 0px; box-shadow: rgba(0, 0, 0, 0.02) 0px 1px 4px; float: left;height: auto; width:40%;">
        <source src="/files/rn-offscreen-toolbar/search_demo.webm" type="video/webm"/>
        <source src="/files/rn-offscreen-toolbar/search_demo.mp4" type="video/mp4"/>
        <!--[if lt IE 9]><img src="/files/rn-offscreen-toolbar/search_demo.gif"><![endif]-->
    </video> 
  </div>
  <figcaption class='media-caption'>Library usage in both the <a href="https://github.com/lopespm/react-native-offscreen-toolbar/tree/master/example">example</a> bundled with the library and in the search screen of a to be released application</figcaption>
</center>

<!--more-->

##How to Use it

Installation:

~~~
$ $ npm install react-native-offscreen-toolbar --save
~~~
{:lang="bash"}

<br/>

Usage (full example [here](https://github.com/lopespm/react-native-offscreen-toolbar/tree/master/example)):

~~~
import OffscreenToolbar from 'react-native-offscreen-toolbar';
 
export default class YourComponent extends React.Component {
    render() {
        const toolbar = () => (<ToolbarAndroid title={'Title'} />);
        const listItem = ({item}) => <Text>{item.key}</Text>;
        const scrollable = () => (<FlatList data={DUMMY_DATA} renderItem={listItem}/>);
        return (
            <View style={styles.container}>
                <OffscreenToolbar
                    toolbar={toolbar}
                    scrollable={scrollable} />
            </View>
        );
    }
}
~~~
{:lang="jsx"}

<br/>

You can pass any component you desire as a `toolbar`, but typically this will be a toolbar/navbar backed by react native or a UI library of your choice, like [Native Base](https://nativebase.io/).

The scrollable however, will need to be scrollable component such as a `ScrollView`, `ListView`, `FlatList`, etc. The `OffscreenToolbar` will then create hooks around this component in order to gauge the user's scrolling behaviour and change toolbar's animation accordingly.

You can also provide the following properties to the component:

 - `scrollableOverlay`: for a search screen as the one presented above, this component can be used to present an overlay between the scrollable and the toolbar
 - `toolbarHeight`: adjust this property according to your toolbar height. This value is used for the toolbar's animation
 - `scrollablePaddingTop`: since the scrollable is laying behind the toolbar, this property comes in handy to place the scrollable content below the toolbar

##Where to get the library

- [Source code on GitHub](https://github.com/lopespm/react-native-offscreen-toolbar)
- [NPM distribution](https://www.npmjs.com/package/react-native-offscreen-toolbar)