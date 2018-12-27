---
layout: post
title: "Unity: Dynamic Multi Target Camera"
comments: true
categories: [libraries, games]
tags: [games]
description: "Open source Unity library to dynamically keep multiple objects in view. This article details the inner workings of this library, which was developed for, and used by Survival Ball"
ogp_image: "/files/camera_multi_target/og-thumb.jpg"
published: true
---

<a href="https://www.youtube.com/watch?v=In3eVapQ5mk">{% img center /files/camera_multi_target/demo.gif %}</a>

Mostly invisible, yet essential, camera work is key to any game with dynamic cameras. This article dissects a concise Unity [open source](https://github.com/lopespm/unity-camera-multi-target) library which dynamically keeps a set of objects (e.g. players and important objects) in view, a common problem for a wide range of games.

The library was developed for, and used by my first Steam game, [Survival Ball](https://survivalball.com/). The game has an heavy shared screen local co-op component, which requires the camera to dynamically keep many key elements in view.

<!--more-->

There are good camera resources for Unity, but I found them to either do too much or too little for this specific problem, so I thought this could be a good opportunity to learn a bit more about dynamic camera movement and to share that knowledge and [code](#where-to-get-it) with the community.

{% comment %}
{% img center /files/camera_multi_target/demo.gif 705px 556px %}
{% endcomment %}


#Overview

The library is fed with the desired camera rotation (pitch, yaw and roll), the target objects that will be tracked and the camera that will be transformed. 

{% comment %}
The camera's field of view value and aspect ratio.

Since camera rotation is managed outside the library, meaning that the library's sole responsability is to calculate the new camera position and transform the camera accordingly. 
 
{% endcomment %}

The library's sole responsibility is to calculate a camera position in which all targets lie inside its view. To achieve this, all target objects are projected onto a slice (plane) of the [camera's view frustrum](https://docs.unity3d.com/Manual/UnderstandingFrustum.html). The projections located inside the view frustrum will be visible and the others will not. The idea is to trace back a new camera position from the outermost target projections, since this way we are guaranteed to include all projections inside the view.

{% comment %}  || image of Y Z projection, with arrows to where the projection place is, padding, targets, camera
{% endcomment %} 


{% img center /files/camera_multi_target/side_view_screen_basis_with_captions.png %}


{% comment %} 
Requirements were as follows: dynamically keep all players and key scene elements in view. Pitch, yaw and roll would be provided as parameters and would not be managed by the library.

would be provided and could be changed at runtime, but their dynamic nature (if one so wishes) would be outside the library's realm of responsabilty.
{% endcomment %} 

{% comment %} 
##Changing the problem space
{% endcomment %} 


{% comment %} 
This problem can be more approachable if thought in terms of a two dimensional space (say Y and Z) where the camera's axis are aligned with the world's axis, and then generalized to three dimensions. For this reason, most of the the illustrations will show 
{% endcomment %} 

In order to make the bulk of the operations easier to compute, the process starts by multiplying the camera's [inverse rotation](https://en.wikipedia.org/wiki/Quaternions_and_spatial_rotation#Using_quaternion_as_rotations) with each of the targets positions, which will place them as they would if the camera's axis would be aligned with the world's axis (identity rotation). Once the camera position is calculated in this transformed space, the camera rotation is multiplied by this position, resulting in the final desired camera position. The actual camera position is then progressively interpolated towards this desired position, to smooth out the camera movement.

{% comment %} 
This makes the calculations easier, and once the camera position is cal of the camera easier and after 


|| image sequence: 1. only targets with rotation of inverse camera rotatation
2. show the camera position (calculated) with the targets there as well, with debug rays
3. rotate the camera position back (show the rotation of camera and targets)
||
{% endcomment %} 

{% imgcap /files/camera_multi_target/transformed_space/transformed_space_1.png Original targets positions %}
{% imgcap /files/camera_multi_target/transformed_space/transformed_space_2_with_captions.png Multiply the camera's inverse rotation with each of the targets positions %}
{% imgcap /files/camera_multi_target/transformed_space/transformed_space_3.png Calculate the camera position in this transformed space %}
{% imgcap /files/camera_multi_target/transformed_space/transformed_space_4_with_captions.png Multiply the camera's rotation with the calculated position in the previous transformed space, which will reveal the final camera position in the original space%}


# Implementation

Most of the operations are performed in the transformed space where the camera’s axis would be aligned with the world’s axis (identity rotation). After the targets are rotated into the camera's identity rotation space by multiplying the camera’s inverse rotation with each of the targets positions, the first task is to calculate their projections.

Please note that in all the figures below (with the exception of the [*horizontal field of view angle*](#horizontal-projections) section), the camera is present for reference only, as its final desired position will only be uncovered in the final step.

## Targets projections

For each target, four projections are cast to a plane parallel to the view plane, sliced from the camera's view frustrum. The line described from the target object to its respective projection is parallel to the camera's view frustrum edges. Relative to the camera, two of these projections run horizontally, and the other two vertically.

{% comment %} 
|| 3 image tile. main one is image with the projections mid way, horizontal and vertical; then two completamentary are vertical and horizzpntal views ||

|| image with the projections mid way, horizontal and vertical ||
|| another image showing it in the side plane, to see where these projections are, the vertical ones ||

{% endcomment %} 

{% imgcap /files/camera_multi_target/projections_intro/projections_1.png Perspective view of the targets projections %}
{% imgcap /files/camera_multi_target/projections_intro/projections_2.png Side view of the targets projections %}
{% imgcap /files/camera_multi_target/projections_intro/projections_3.png Top view of the targets projections %}

If any of the target's projections are outside the camera's view frustrum (or its sliced plane), then the target object will not be visible. If they are inside, the target object will be visible. This means that the four outermost projections from all targets will define the limit of where the view frustrum must be in order to have all objects in view or partially in view. Adding some padding to these outermost projections (i.e. moving these projections away from the center of the view frustrum plane slice), will result in additional padding between the target object and the camera's view borders.

{% comment %} 
|| image showing padding effect ||
{% endcomment %} 


### Vertical projections
{% comment %} 
|| image side view with the traingle highlighted, with a question mark on the opposite side ||
{% endcomment %} 

For all vertical projections positions, we are interested in finding their Y component. In the figure below, notice the right triangle with one vertex on the target object and another one on the projection. If we discover the length of the side running parallel the projection plane, that value can be added to the Y component of the target's position, resulting in the Y component for the upper projection.


{% comment %} 
|| image side view with the traingle highlighted, with a question mark on the opposite side, and angle marked, and adjacent side marked as a-b or something ||
{% endcomment %} 

{% imgcap /files/camera_multi_target/projections_calc/projections_calc_with_captions_vertical.png Side view of the elements needed to calculate the vertical projections %}

{% comment %} 
If we know the length of any side of the triangle and which is the value of one of its non-right angles, then we can use trigon
{% endcomment %} 


$$\theta$$ is equal to half the camera's vertical field of view angle $$\theta'$$ ($$\theta = \frac{\theta'}{2}$$). The vertical field of view angle $$\theta'$$ is provided by the camera's [`fieldOfView`](https://docs.unity3d.com/ScriptReference/Camera-fieldOfView.html) in degrees, which needs to be converted to radians for our purposes ($$\theta' = \theta'_{degrees} \times \frac{\pi}{180º}$$).

The triangle's adjacent edge length (relative to $$\theta$$) is known, thus we can find the length of the opposite side of the triangle by using [trigonometric ratios](https://www.khanacademy.org/math/geometry/hs-geo-trig/hs-geo-trig-ratios-intro/a/finding-trig-ratios-in-right-triangles).

$$opposite = tan(\theta) \times adjacent$$

With this, the upper projection's Y/Z components can be fully calculated. The bottom projection has the same Z component as the upper one, and its Y component is equal to the target's Y component minus the calculated opposite triangle edge length.

### Horizontal projections

{%comment%}
|| image from top of the horizontal projections; similar to the picture above of the vertical projections, with the angle and rectagle marked ||
{%endcomment%}

{% imgcap /files/camera_multi_target/projections_calc/projections_calc_with_captions_horizontal.png Top view of the elements needed to calculate the horizontal projections %}

The horizontal projections follow a set of similar set of calculations, difference being that we are now interested in finding the X component (instead of Y), and the horizontal field of view angle is used instead of the vertical one. The horizontal field of view angle $$\gamma'$$ and its half value $$\gamma$$ ($$\gamma = \gamma' \times 2$$) need some further steps to be computed, which will be detailed in the following section.

{%comment%}
There is no immediate access to the horizontal field of view angle $$\gamma'$$,

  so in the following section we will see how this value is calculated.
{%endcomment%}

#### Horizontal field of view angle

Consider the following figure, in which $$\gamma$$ represents half the horizontal field of view angle, $$\theta$$ represents half the vertical field of view angle, $$w$$ the viewport width and $$h$$ the viewport height:

{% imgcap /files/camera_multi_target/horizontal_fov.png Elements for the calculation of the horizontal field of view angle %} 

Using trigonometric ratios, these two equations can be devised:

$$
\begin{cases}
tan(\gamma) = \frac{w / 2}{adj} \\ 
adj = \frac{h / 2}{tan(\theta)}
\end{cases} 
$$

Replacing $$adj$$ in the first equation with the definition of the second one:

$$
tan(\gamma) = \frac{w / 2}{\frac{h / 2}{tan(\theta)}} 
\Leftrightarrow \\
tan(\gamma) = \frac{w / 2}{h / 2} \times tan(\theta)
\Leftrightarrow \\
tan(\gamma) = \frac{w}{h} \times tan(\theta)
\Leftrightarrow \\
\gamma = arctan(\frac{w}{h} \times tan(\theta))
$$

Unity's camera has an [`aspect`](https://docs.unity3d.com/ScriptReference/Camera-aspect.html) attribute (view canvas width divided by height, i.e. $$aspect\ ratio = \frac{w}{h}$$), with which we can finalize our equation and discover the horizontal field of view angle half value.

$$
\gamma = arctan(aspect\ ratio \times tan(\theta))
$$

### Outermost projections

Having all target projections calculated, the four outermost ones are picked:
 
- $$p_{hMax}$$ is the projection with the highest X component
- $$p_{hMin}$$ is the projection with the lowest X component
- $$p_{vMax}$$ is the projection with the highest Y component
- $$p_{vMin}$$ is the projection with the lowest Y component

{%comment%}
|| image showing the four outermost projections ||
{%endcomment%}

{% imgcap /files/camera_multi_target/projections_outermost/projections_outermost.png All outermost projections %} 






##Calculating the camera position

###In the transformed space

{%comment%}
//###Camera position in the transformed space
{%endcomment%}

The X and Y components of the desired camera position in the transformed space are the midpoints of their respective outermost projections, this is, the midpoint between $$p_{hMax}$$ and $$p_{hMin}$$ is the camera's X position, and the midpoint between $$p_{vMax}$$ and $$p_{vMin}$$ is the camera's Y position.

{%comment%}
|| image of the p's, and the X,Y line? label saying that camera will be smowhere along this line ||
{%endcomment%}

The Z component of the camera position in the transformed space is calculated by backtracking a view frustrum from the the outermost projections to the camera Z component candidate. The furthest Z component from the projection plane will be the chosen, in order for the final camera position to contain all targets within its view.

{% imgcap /files/camera_multi_target/projections_distance/projections_distance_with_captions_vertical.png Elements for adjacent<sub>v</sub> calculation %} 

{% imgcap /files/camera_multi_target/projections_distance/projections_distance_with_captions_horizontal.png Elements for adjacent<sub>h</sub> calculation %} 

Once again, trigonometric ratios will be used to calculate these Z position candidates.

$$
adjacent_{v} = \frac{opposite_{v}}{tan(\theta)}
\\
adjacent_{h} = \frac{opposite_{h}}{tan(\gamma)}
$$

The highest value between $$adjacent_{v}$$ and $$adjacent_{h}$$ will be picked for the camera's Z position component in the transformed space.

{%comment%}
|| picture of vertical calculation of Z compoentn candidate; with labels of p's ||
|| picture of horizontal calculation of Z compoentn candidate; with labels of p's ||
caption saying that the furshest Z from projection plane is picked
{%endcomment%}

###Final camera position in the original space


With the camera position calculated in the transformed space, we can now multiply the desired camera rotation with this position, which will provide us with the final desired camera position. The actual camera position is then progressively interpolated towards this desired position, to smooth out the camera movement.

{%comment%}
|| image of the camera position being roated into place ||
{%endcomment%}



#Where to get it

The library is available on GitHub and will be available in the Unity Asset Store once it is approved[^1]. An example scene of the library's usage is included. Feedback is most welcome and I hope this can be useful!

- [GitHub Repository](https://github.com/lopespm/unity-camera-multi-target)

{%comment%}
The library is available on GitHub and the <del>Unity Asset Store</del> (pending approval). An example scene of the library's usage is included. Feedback is most welcome and I hope this can be useful!

- [GitHub Repository](https://github.com/lopespm/unity-camera-multi-target)
- <del>Unity Asset Store Package</del> (pending approval from the Unity Asset Store, the link will be placed here once it is available)

{%endcomment%}

<br/>

[^1]: *I have been informed that the Unity Asset Store team is experiencing longer than normal review times. From the information I gathered online, it might take a couple of weeks until it is available. I will post an update on my twitter [@lopes_pm](https://twitter.com/lopes_pm) once it is published.*
