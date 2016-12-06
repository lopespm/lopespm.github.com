---
layout: post
title: "Deep Reinforcement Learning: Playing a Racing Game"
comments: true
categories: [machine_learning]
tags: [machine learning, reinforcement learning, games]
description: "Python+Tensorflow DQN agent, which autonomously learns how to play Out Run and can potentially be modified to play other games or perform other tasks"
ogp_image: "/files/dqn_outrun/thumb.jpg"
published: true
update_notes: "Dec. 5th, 2016: broken link fix; more neural network concepts details"
---

<center>
  <div style=" display: inline-block; ">
    <iframe width="350" height="197" src="https://www.youtube.com/embed/spzYVhOgKBA" frameborder="0" allowfullscreen></iframe>
    <p class="media-caption">Agent playing Out Run, session 201609171218_175eps<br/>No time limit, no traffic, 2X time lapse</p>
  </div>
</center>
Above is the built [deep Q-network (DQN)](https://deepmind.com/research/dqn/) agent playing [Out Run](https://en.wikipedia.org/wiki/Out_Run), trained for a total of 1.8 million frames on a Amazon Web Services g2.2xlarge (GPU enabled) instance. The agent was built using python and tensorflow. The Out Run game emulator is a modified version of [Cannonball](https://github.com/lopespm/cannonball). All source code for this project is [available on GitHub]({% post_url 2016-10-06-deep-reinforcement-learning-racing-game %}#source-code).

<!--more-->

The agent learnt how to play by being rewarded for high speeds and penalized for crashing or going off road. It fetched the game’s screens, car speed, number of off-road wheels and collision state from the emulator and issued actions to it such as pressing the left, right, accelerate or brake virtual button. 

Agent trainer implements the deep Q-learning algorithm used by [Google’s DeepMind Team to play various Atari 2600 games](http://www.readcube.com/articles/10.1038/nature14236?shared_access_token=Lo_2hFdW4MuqEcF3CVBZm9RgN0jAjWel9jnR3ZoTv0P5kedCCNjz3FJ2FhQCgXkApOr3ZSsJAldp-tw3IWgTseRnLpAc9xQq-vTA2Z5Ji9lg16_WvCy4SaOgpK5XXA6ecqo8d8J7l4EJsdjwai53GqKt-7JuioG0r3iV67MQIro74l6IxvmcVNKBgOwiMGi8U0izJStLpmQp6Vmi_8Lw_A%3D%3D). It uses a reward function and hyperparameters that fit best for Out Run, but could potentially be used to [play other games or solve other problems](#plugging-other-problems-and-games).

There is a wealth of [good information](#further-references) about this reinforcement learning algorithm, but I found some topics difficult to grasp or contextualize solely from the information available online. I will attempt to add my humble contribution by tackling these and also provide details about the project’s implementation, results and how it can be used/modified/deployed.

Let’s start by one of its main gears: Q-learning

<p></p>


#Concepts

##Q-learning

At the heart of deep Q-learning lies Q-learning, a popular and effective [model-free](https://www.youtube.com/watch?time_continue=258&v=bFPoHrAoPoQ) algorithm for learning from delayed reinforcement.  

Jacob Schrum has made available a terse and accessible [explanation](https://www.youtube.com/playlist?list=PL4uSLeZ-ET3xLlkPVEGw9Bn4Z8Mbp-SQc) which takes around 45 minutes to watch and serves as a great starting point for the paragraphs below. 
Let’s take the canonical reinforcement learning example presented by Jacob (grid world):

{% img center /files/dqn_outrun/gridworld.png %}

To implement this algorithm, we need to build the Q-function ([one of the forms](https://www.youtube.com/watch?v=XLkW_WGJoyQ) of the [Bell-Equation](https://en.wikipedia.org/wiki/Bellman_equation)) by using the Q-value iteration update:

{% img center /files/dqn_outrun/q_value_iteration_update.svg %}

In the above grid, there are 9 actionable states, 2 terminal states and 4 possible actions (left, right, up, down), resulting in 36 (9 actionable states x 4 possible actions) Q-values.

This project aims to train an agent to play Out Run via its game screens, so for the sake of argument, let´s consider that each game screen is transformed into a 80x80 greyscale image (each pixel value ranging from 0 to 255), and that each transformed image represents a state. 6400 pixels (80x80) and 256 possible values per pixel translate to 256<sup>6400</sup> possible states. This value alone is a good indicator of how inflated the number of possible Q-values will be.

Multiplying [9 possible actions](https://github.com/lopespm/agent-trainer/blob/master/agent/game/action.py) by 256<sup>6400</sup> possible states results in 256<sup>6400</sup> x 9 possible Q-values. If we use multiple and/or colored images for state representation, then this value will be even higher. Quite unwieldy if we want to store these values in a table or similar structure.

##Enter deep neural networks

Deep neural networks work quite well for inferring the mapping implied by data, giving them the ability to predict an approximated output from an input that they never saw before. No longer do we need to store all state/action pair’s Q-values, we can now model these mappings in a more general, less redundant way. These networks also automatically learn a set of internal features which are useful in complex non-linear mapping domains, such as image processing, releasing us from laborious feature handcrafting tasks.

This is perfect. We can now use a deep neural network to approximate the Q-function: the network would accept a state/action combination as input and would output the corresponding Q-value. Training-wise, we would need the network’s Q-value output for a given state/action combo (obtained through a forward pass) and the target Q-value, which is calculated through the expression: $$r_{t+1} + \gamma \underset{a}\max Q(s_{t+1}, a)$$. With these two values, we can perform a gradient step on the squared difference between the target Q-value and the network’s output.

This is perfect, but there is still room for improvement. Imagine we have 5 possible actions for any given state: when calculating the target Q-value, to get the optimal future value estimate (consequent state’s maximum Q-value) we need to ask (forward pass) our neural network for a Q-value 5 times per learning step.

Another approach (used in [DeepMind’s](https://www.cs.toronto.edu/~vmnih/docs/dqn.pdf) [network](http://www.readcube.com/articles/10.1038/nature14236?shared_access_token=Lo_2hFdW4MuqEcF3CVBZm9RgN0jAjWel9jnR3ZoTv0P5kedCCNjz3FJ2FhQCgXkApOr3ZSsJAldp-tw3IWgTseRnLpAc9xQq-vTA2Z5Ji9lg16_WvCy4SaOgpK5XXA6ecqo8d8J7l4EJsdjwai53GqKt-7JuioG0r3iV67MQIro74l6IxvmcVNKBgOwiMGi8U0izJStLpmQp6Vmi_8Lw_A%3D%3D)) would be to feed in the game’s screens and have the network output the Q-value for each possible action. This way, a single forward pass would output all the Q-values for a given state, translating into one forward pass per optimal future value estimate.

 {% imgcap /files/dqn_outrun/q_network_formulations.png Image courtesy of Tambet Matiisen’s <a href='https://www.nervanasys.com/demystifying-deep-reinforcement-learning'>Demystifying Deep Reinforcement Learning</a> - Left: Naive formulation of deep Q-network. Right: More optimized architecture of deep Q-network, used in DeepMind papers. %} 

Q-learning and deep neural networks are the center pieces of a deep Q-network reinforcement learning agent and I think that by understanding them and how they fit together, it can be easier to picture how the algorithm works as a whole.

#Implementation

<center><a href="/files/dqn_outrun/overall_view_play.png"><img align="center" src="/files/dqn_outrun/overall_view_play.png" alt=""></a></center>

<p></p>

Above is an overall representation of how the different components relate during a play evaluation, centered around the `deep Q-network for playing`[^1], the main decision component.

Each game screen is resized to a desaturated 80x80 pixels image (opposed to 84x84 on DeepMind’s papers), and if you might be wondering why each state is a sequence of four game screens instead of one, that is because the agent’s history is used for better motion perception. Achieving this requires a sequence of preprocessed images to be stacked in channels (like you would stack RGB channels on a colored image) and fed to the network. Note that RGB channels and agent history could be used simultaneously for state representation. For example, with three channels per (RGB) image and an agent history length of four, the network would be fed twelve channels per input state.

The [network’s architecture](https://github.com/lopespm/agent-trainer/blob/master/agent/trainer/q_network.py#L121) is essentially the same used by DeepMind, except for the first convolutional neural network’s input (80x80x4 instead of 84x84x4, to account for the different input sizes) and the linear layer’s output (9 instead of 18, to account for the different number of actions available)

The algorithm used to train this network is well described [here (page 7)](http://www.readcube.com/articles/10.1038/nature14236?shared_access_token=Lo_2hFdW4MuqEcF3CVBZm9RgN0jAjWel9jnR3ZoTv0P5kedCCNjz3FJ2FhQCgXkApOr3ZSsJAldp-tw3IWgTseRnLpAc9xQq-vTA2Z5Ji9lg16_WvCy4SaOgpK5XXA6ecqo8d8J7l4EJsdjwai53GqKt-7JuioG0r3iV67MQIro74l6IxvmcVNKBgOwiMGi8U0izJStLpmQp6Vmi_8Lw_A%3D%3D) and [here](https://www.nervanasys.com/demystifying-deep-reinforcement-learning/), but I would like to present it graphically, to hopefully provide some further intuition.

Below is [agent trainer](https://github.com/lopespm/agent-trainer)´s implementation of the aforementioned algorithm. It adds some new concepts which were not approached by this article:

- Experience replay mechanism sported by replay memories: randomly samples previous transitions, thereby smoothing the training distribution over many past behaviors
- Separate training network, cloned at fixed intervals to the target playing network, making the algorithm more stable when compared with standard online Q-learning
- ε-greedy policy to balance exploitation/exploration

<center><a href="/files/dqn_outrun/overall_view_train_merged.png"><img align="center" src="/files/dqn_outrun/overall_view_train_merged.png" alt=""></a></center>

<p></p>

## Reward function

The reward function’s definition is crucial for good learning performance and determines the goal in a reinforcement learning problem. April Yu et al. have an interesting paper on [simulated autonomous vehicle control](http://cs231n.stanford.edu/reports2016/112_Report.pdf) which details a DQN agent used to drive a game that strongly resembles Out Run ([JavaScript Racer](http://codeincomplete.com/games/racer/v4-final/)). Based on their reward function experiments, I’ve built a [function](https://github.com/lopespm/agent-trainer/blob/master/agent/trainer/episode.py#L60) which rewards logarithmically based on speed and penalizes when the car is off-road, crashed or stopped. 

 {% imgcap /files/dqn_outrun/reward_function_plot.png Reward values for when the car is not crashed or off-road %} 

# Deployment

Run the trainer and emulator on your local machine by following the guide available on [agent-trainer’s readme](https://github.com/lopespm/agent-trainer/blob/master/README.md).

It is also possible to deploy the agent to an AWS EC2 instance or generic Linux remote machine by using a set of bash scripts offered by [agent-trainer-deployer](https://github.com/lopespm/agent-trainer-deployer).

### AWS EC2

Amazon allows you to bid on spare EC2 computing capacity via [spot instances](https://aws.amazon.com/ec2/spot/). These can cost a fraction of on-demand ones, and for this reason were chosen as the prime method for training in this project, leading to the need for mid-training instance termination resilience.

To accommodate this scenario, the deployment scripts and agent-trainer are designed to support train session resumes. To persist results and decrease boot up time between sessions, a long-lived EBS volume is attached to the live instance. The volume contains the training results, agent-trainer´s source code, cannonball’s source code, dockerfiles and their respective docker images. 

 {% imgcap /files/dqn_outrun/deployed-diagram.png Relationship between components when deploying agent-trainer to an AWS EC2 instance %} 



#Results

The hyperparameters used on all sessions mimic the ones used on DeepMind’s [Human-Level Control through Deep Reinforcement Learning paper](http://www.readcube.com/articles/10.1038/nature14236?shared_access_token=Lo_2hFdW4MuqEcF3CVBZm9RgN0jAjWel9jnR3ZoTv0P5kedCCNjz3FJ2FhQCgXkApOr3ZSsJAldp-tw3IWgTseRnLpAc9xQq-vTA2Z5Ji9lg16_WvCy4SaOgpK5XXA6ecqo8d8J7l4EJsdjwai53GqKt-7JuioG0r3iV67MQIro74l6IxvmcVNKBgOwiMGi8U0izJStLpmQp6Vmi_8Lw_A%3D%3D), except for the number of frames skipped between actions, which are spaced apart by 450ms (equivalent to 13 frames) on agent-trainer.

The Out Run game, as you would play it in an arcade, clutters the road with various cars in order to make the game more challenging. In-game traffic was disabled for both training and evaluation plays, rendering a more achievable starting point for these experiments. Training with random traffic could be an interesting posterior experiment.

Some experiments were made by increasing the discount factor up its final value during training, as proposed on [“How to Discount Deep Reinforcement Learning: Towards New Dynamic Strategies”](https://arxiv.org/abs/1512.02011), but did not achieve better stability or rewards when compared to a fixed 0.99 discount factor. The aforementioned paper also proposes decaying the learning rate during training, which increased stability and performance significantly. Decaying the learning rate without minimum value clipping yielded the best results.

Another improvement was to train the game without a time limit, meaning that the training episode would only finish when the car reached the last stage’s end. This allowed for a broader replay memory training set, since the agent traversed a wide range of different tracks and settings.

Play evaluation was the same between all experiments, this is, the agent was evaluated by playing on the default 80 second, easy mode.

Here is a summary of the most relevant training sessions (you can find their models, metrics and visualizations on [agent-trainer-results](https://github.com/lopespm/agent-trainer-results)):

| Session | M | Training<br/>game mode  |  Learning rate decay                                                           |
| -------------------- | --- | --- |---------------------------------------------------------------------- |
| 201609040550_5010eps | a) | timed; easy  | without learning rate decay          |
| 201609111241_2700eps | b) | timed; easy  |  unclipped learning rate decay   |
| 201609111241_7300eps | b) | timed; easy  |  unclipped learning rate decay   |
| 201609160922_54eps | b)   | unlimited time  | without learning rate decay        |
| 201609171218_175eps | b)  | unlimited time  | unclipped learning rate decay |

<p class="media-caption"><a href='https://github.com/lopespm/agent-trainer-results'>Training sessions</a> summary: session names are formed by &#60;session ID&#62;_&#60;number of episodes trained&#62;<br/>(M)achine used:  a) AMD Athlon(tm) II X2 250 Processor @ 3GHz; 2GB RAM DDR3-1333 SDRAM; SSD 500 GB: Samsung 850 EVO (CPU only training); b) AWS EC2 g2.2xlarge (GPU enabled instance), 200 GB General Purpose SSD (GP2)</p>

<p></p>

<center>
  <div style=" display: inline-block; ">
    <iframe width="350" height="197" src="https://www.youtube.com/embed/1Gpl9Xc-E8M" frameborder="0" allowfullscreen></iframe>
    <p class="media-caption">Agent playing Out Run (timed easy mode, no traffic)<br/>Session 201609111241_2700eps</p>
  </div>
    <div style=" display: inline-block;">
    <iframe width="350" height="197" src="https://www.youtube.com/embed/6F3eCoCw57E" frameborder="0" allowfullscreen></iframe>
    <p class="media-caption">Agent playing Out Run (timed easy mode, no traffic)<br/>Session 201609171218_175eps</p>
  </div>
</center>

Notice on the videos above how the timed mode trained session `201609111241_2700eps` reaches the first checkpoint about five seconds earlier than the unlimited time mode trained session `201609171218_175eps`, but proceeds to drive off-road two turns after. Its stability gets increasingly compromised as more episodes are trained, which can be observed by the rampant loss increase before 7300 episodes are reached (`201609111241_7300eps`):

{% imgcap /files/dqn_outrun/201609111241_7300eps/metrics_in_train.png Training metrics for session 201609111241_7300eps %}{% imgcap /files/dqn_outrun/201609111241_7300eps/metrics_trained_play.png Play evaluation metrics for session 201609111241_7300eps: using ε=0.0; evaluation made at the end of every 20 training episodes %}{% imgcap /files/dqn_outrun/201609171218_175eps/metrics_in_train.png Training metrics for session 201609171218_175eps %}{% imgcap /files/dqn_outrun/201609171218_175eps/metrics_trained_play.png Play evaluation metrics 201609171218_175eps: using ε=0.0; evaluation made at the end of every training episode %}


Both `201609111241_2700eps` and `201609111241_7300eps` timed trained sessions mostly drive off-road and stall after the first stage, whereas the unlimited time mode trained session `201609171218_175eps` can race through all the stages crashing *only* three times (as shown on the article’s first video) and is able to match the performance of a timed trained session when evaluated on the default easy timed mode. 

Below is the loss plot for `201609160922_54eps` and `201609171218_175eps`, both trained using the game’s unlimited time mode, difference being that `201609160922_54eps` keeps a fixed learning rate and `201609171218_175eps` decays it every 50100 steps:

{% imgcap /files/dqn_outrun/loss_201609171218_201609160922.png Loss comparison between sessions <font color="#9c27b0">■</font> 201609160922_54eps and <font color="#009688">■</font> 201609171218_175eps, as viewed on <a href='https://github.com/lopespm/agent-trainer-results'>tensorboard</a> %}


Other representative visualizations:

{% imgcap /files/dqn_outrun/201609171218_175eps/t-SNE_timed_easy_mode.png t-SNE visualization, generated by letting the agent play one game on timed easy mode. Agent is using the network trained on session 201609171218_175eps %}
{% imgcap /files/dqn_outrun/201609171218_175eps/t-SNE_no_time_mode.png t-SNE visualization, generated by letting the agent play one game on unlimited time mode. Agent is using the network trained on session 201609171218_175eps %}
 {% imgcap /files/dqn_outrun/conv_net_filters.png Visualization of the first convolutional network layer’s filters. These can be viewed via <a href='https://github.com/lopespm/agent-trainer-results'>tensorboard</a>%} 

<br/>

# Final Notes

## Plugging other problems and games

Agent-trainer was not built from the get-go to train games or problems other than Out Run, but I think it would be interesting to perform a thought exercise on what would be necessary to do so.

There are three main areas in which [agent-trainer](https://github.com/lopespm/agent-trainer) has domain knowledge about Out Run:

- [`game`](https://github.com/lopespm/agent-trainer/tree/master/agent/game) package, which contains
   - [`Action`](https://github.com/lopespm/agent-trainer/blob/master/agent/game/action.py) enumeration: describes all the possible actions in the game.
   - [`cannonball_wrapper`](https://github.com/lopespm/agent-trainer/blob/master/agent/game/cannonball_wrapper.py) module: only this module has access to the cannonball emulator. It translates the aforementioned actions into game actions and is accessed by methods such as `start_game()`, `reset()` and `speed()`.
- [`RewardCalculator`](https://github.com/lopespm/agent-trainer/blob/master/agent/trainer/episode.py#L56) class: contains the reward function. Instead of using a generic reward function like DeepMind, it was chosen to have a tailor-made reward function for Out Run, which takes into account the car’s speed and its off-road and crash status.
- [`metrics`](https://github.com/lopespm/agent-trainer/blob/master/agent/trainer/visualization/metrics.py) module: aware of the `speed` metric, which is Out Run specific, and `score`, which is game specific domain knowledge.

Training another game would require the creation of a new wrapper with the same interface as `cannonball_wrapper`, a new `Action` enumerator specific to the game, a new [`RewardCalculator`](https://github.com/lopespm/agent-trainer/blob/master/agent/trainer/episode.py#L56) with a different reward function and the removal/replacement of the `speed` metric.

Apart from the previously mentioned steps, solving generic problems would require the preprocessor to be changed/replaced if images were not to be used for state representation. An option would be to create a new preprocessor class with a [`process(input)`](https://github.com/lopespm/agent-trainer/blob/master/agent/trainer/image_preprocessor.py#L13) method, tweak the hyperparameters as required (so that the network knows which dimensions to expect on its input), and finally inject the newly created class in [`EpisodeRunner`](https://github.com/lopespm/agent-preprocessor/blob/master/agent/trainer/episode.py#L300), replacing the old preprocessor class.


## Further references

I am not a machine learning expert, but from my learner’s point of view, if you are interested in getting your feet wet, Andrew Ng's Machine Learning Course is as a great starting point. It is freely available on the [Coursera online learning platform](https://www.coursera.org/learn/machine-learning). This was my first solid contact with the subject and served as a major stepping stone for related topics such as Reinforcement Learning.

[Udacity Google Deep Learning](https://www.udacity.com/course/deep-learning--ud730): this free course tackles some of the popular deep learning techniques, all the while using tensorflow. I did this right after Andrew Ng's course and found it to leave the student with less support during lessons - less hand-holding if you will - and as result I spent a good amount of time dabbling to reach a solution for the assignments. 

As a side note, I started building this project by the end of the Deep Learning course, mostly because I wanted to apply and consolidate the concepts I learnt into something more practical and to share this knowledge further, so it could hopefully help more people who are interested in this.

Other useful resources:

- DeepMind’s [Human-Level Control through Deep Reinforcement Learning paper](http://www.readcube.com/articles/10.1038/nature14236?shared_access_token=Lo_2hFdW4MuqEcF3CVBZm9RgN0jAjWel9jnR3ZoTv0P5kedCCNjz3FJ2FhQCgXkApOr3ZSsJAldp-tw3IWgTseRnLpAc9xQq-vTA2Z5Ji9lg16_WvCy4SaOgpK5XXA6ecqo8d8J7l4EJsdjwai53GqKt-7JuioG0r3iV67MQIro74l6IxvmcVNKBgOwiMGi8U0izJStLpmQp6Vmi_8Lw_A%3D%3D) and its respective [source code](https://sites.google.com/a/deepmind.com/dqn/)
- [Playing Atari with Deep Reinforcement Learning](https://www.cs.toronto.edu/~vmnih/docs/dqn.pdf)
- [Deep Reinforcement Learning for Simulated Autonomous Vehicle Control](http://cs231n.stanford.edu/reports2016/112_Report.pdf)
- [Demystifying Deep Reinforcement Learning](https://www.nervanasys.com/demystifying-deep-reinforcement-learning/)
- [Udacity Reinforcement Learning by Georgia Tech](https://www.udacity.com/course/reinforcement-learning--ud600)
- [Deep learning lecture by Nando de Freitas](https://www.youtube.com/watch?v=dV80NAlEins)
- [Learning reinforcement learning (with code, exercises and solutions)](http://www.wildml.com/2016/10/learning-reinforcement-learning/)
- [OpenAI Gym](https://gym.openai.com/): quoting the project’s page: *”a toolkit for developing and comparing reinforcement learning algorithms. It supports teaching agents everything from walking to playing games like Pong or Go”*
- [Tensorflow implementation](https://github.com/devsisters/DQN-tensorflow) of Human-Level Control through Deep Reinforcement Learning, by Devsisters corp.

# Source code

All source code is available on GitHub:

 - [Agent Trainer](https://github.com/lopespm/agent-trainer): the core python+tensorflow application
 - [Cannonball](https://github.com/lopespm/cannonball): custom Cannonball (Out Run game emulator) fork which contains the changes needed to access the emulator externally
 - [Agent Trainer Deployer](https://github.com/lopespm/agent-trainer-deployer): bash scripts to deploy agent-trainer to a generic remote machine or AWS EC2 instance
 - [Agent Trainer Docker](https://github.com/lopespm/agent-trainer-docker): Dockerfiles used when deploying agent-trainer to a remote machine
 - [Agent Trainer Results](https://github.com/lopespm/agent-trainer-results): Collection of training sessions, each containing their resulting network, metrics and visualizations

<br/>

[^1]: “Deep Q-network for playing” in this project is equivalent to DeepMind’s “target network $\hat Q$” and “Deep Q-network for training” is equivalent to DeepMind’s “network Q”
