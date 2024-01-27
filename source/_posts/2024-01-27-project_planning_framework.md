---
layout: note
title: "Project Planning Framework"
comments: true
categories: notes
tags: []
description: "Simple framework proposing 3 axes to classify and inform the approach towards reaching a goal"
ogp_image: "/files/project_planning_framework/pthumb.png"
ogp_image_twitter: "/files/project_planning_framework/pthumb.png"
published: true
---

Different goals require different roadmapping and planning techniques.

In this post, a simple framework is proposed to classify a goal using three axes, in order to inform the approach taken towards reaching that goal. The three axes are:

- **Timeline sensitivity**: how much leeway is there to extend the deadline to deliver a goal?
- **Dependency level between goals / projects**: how many steps are needed to reach the goal?
- **Uncertainty of which steps will drive the goal forward**: how sure are we that a given step will move us toward the goal?

## Example of how to apply the Framework

### Scenario 1: Reach Compliance

#### Goaling Statement

An external entity (let's say, government or partner company), has made a set of requirements for which your team must provide compliance for on a fixed, non-negotiable timeline, with limited team capacity. The "definition of done" is well defined by this entity, and there is a low amount of unknowns of how to reach the goals.

#### Axes

- **Timeline sensitivity**: High
- **Dependency level between goals / projects**: Low
- **Uncertainty of which steps will drive the goal forward**: Low

#### Approach

This goal has sensitive timelines and is archetypal top-down. The deadline will be reached in one way or the other, so all hands are needed on deck to tackle this goal. In specific:

- Use a Gant-style chart, where there is a heavy emphasis on the timeline
- Apply stricter project management, more process driven

{% imgopt /files/project_planning_framework/compliance %}

### Scenario 2: Increase Effectiveness of a User Flow

#### Goaling Statement

Your team supports a user flow, such as a check-out flow, for which the goal is the increase the conversion amount by *X*. There are known levers you have available to drive this metric, but also many others which are unbeknownst and would need experimentation and research. This increase is not business critical, so there is an underlying lenience in case the goal is not hit.

#### Axes

- **Timeline sensitivity**: Low
- **Dependency level between goals / projects**: Low
- **Uncertainty of which steps will drive the goal forward**: High

#### Approach

Unlike Scenario 1, which is exploitation heavy, this scenario favors an approach which is exploration heavy, due to the high amount of uncertainty of which projects will be able to move the needle towards the successful completion of the goal. To de-risk and address this goal, a high level of adaptability will be needed, and several opportunities will need to be created to discover which levers can be used. In specific:

- Have open ended brainstorming sessions
- Leverage user research and focus groups
- Apply looser project management, to allow for quick and less trashier pivots


{% imgopt /files/project_planning_framework/effectiveness %}

### Scenario 3: Unification of Several Systems into One

#### Goaling Statement

Your team is tasked to unify several internal systems into a single one, where several dependencies between different projects exist, and the time each project will take ranges from certain to unknown.

#### Axes

- **Timeline sensitivity**: Low
- **Dependency level between goals / projects**: High
- **Uncertainty of which steps will drive the goal forward**: Low / Medium

#### Approach

The focus here should be on making clear which are the dependencies between different projects, and allow some leniency towards the completion of each of the projects, while actively managing the team's capacity to focus on the projects which are discovered to require a heavier lift. In specific:

- Build a full dependency graph, allowing for each of the projects timelines to have some leeway where needed
- Incentivize structured system design documents and discussions, making sure that all involved parties are aligned on a given approach, and engineers are able to explain not only the system they own, but also other systems involved in their unification

{% imgopt /files/project_planning_framework/unification %}


## Closing Thoughts

The framework above is quite simple and could potentially be used for several other different use cases. It might also be missing some essential parameters that are relevant for your specific context. Let me know if you find these, I would be happy to review the framework accordingly. Regardless, hope the above can be useful on your next roadmapping / planning cycle!