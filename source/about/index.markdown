---
layout: default
comments: false
sharing: false
footer: true
---

<p></p>

<article class="hentry" role="article">

<p>Hi, I’m Pedro - a software engineer curious about tech, design, media, people, the world. This is where I share my projects and thoughts (opinions are mine own, especially the stupid ones). I’m always eager to learn, so feel free to reach out via the navbar or leave a comment!</p>

<p style="font-style: italic">Looking for other ways to support this site? <a href="https://buymeacoffee.com/lopespm">Buy me a coffee</a>.</p>

</article>

<style>
  .about-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
    margin-top: 0px;
    padding-top: 0px !important;
  }

  .about-grid-item {
    position: relative;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    overflow: hidden;
    transition: background-color 0.15s ease, box-shadow 0.15s ease;
  }

  .about-grid-item:has(.about-grid-item-link:hover) {
    background-color: #f5f5f5;
    box-shadow: 0 2px 8px rgba(0,0,0,0.10);
  }

  .about-grid-item-link {
    position: absolute;
    inset: 0;
    z-index: 1;
    border-radius: 4px;
  }

  .about-grid-item-link:focus-visible {
    outline: 2px solid #0066cc;
    outline-offset: -2px;
  }

  .about-grid-item img {
    width: 100%;
    height: 180px;
    object-fit: cover;
    display: block;
  }

  .about-grid-item-body {
    padding: 1rem 1.25rem 1.25rem;
  }

  .about-grid-item h3 {
    margin: 0 0 0.5rem;
    font-size: 1.1rem;
  }

  .about-grid-item p {
    margin: 0;
    font-size: 0.95rem;
    line-height: 1.5;
  }

  @media (max-width: 768px) {
    .about-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }


</style>

<div class="about-grid">
  <div class="about-grid-item">
    <a class="about-grid-item-link" href="https://www.vivotime.net/" aria-label="Vivo Time" target="_blank" rel="noopener noreferrer"></a>
    <img src="/files/about/projects/pvivotime.png" alt="Screenshot of Vivo Time, a life goals tracking site">
    <div class="about-grid-item-body">
      <h3>Vivo Time</h3>
      <p>Life Goals Site</p>
    </div>
  </div>
  <div class="about-grid-item">
    <a class="about-grid-item-link" href="https://survivalball.com/" aria-label="Survival Ball" target="_blank" rel="noopener noreferrer"></a>
    <img src="/files/about/projects/psb.png" alt="Survival Ball Steam game screenshot">
    <div class="about-grid-item-body">
      <h3>Survival Ball</h3>
      <p>Steam Game</p>
    </div>
  </div>
  <div class="about-grid-item">
    <a class="about-grid-item-link" href="{% post_url 2018-03-12-arxiv-papers %}" aria-label="ArXiv Papers" target="_blank" rel="noopener noreferrer"></a>
    <img src="/files/about/projects/parxiv.jpg" alt="ArXiv Papers Android app screenshot">
    <div class="about-grid-item-body">
      <h3>ArXiv Papers</h3>
      <p>Android App</p>
    </div>
  </div>

<div class="about-grid-item">
    <a class="about-grid-item-link" href="https://www.youtube.com/@lopespm" aria-label="Pedro Lopes" target="_blank" rel="noopener noreferrer"></a>
    <img src="/files/about/projects/ppedrolopes.jpg" alt="Pedro Lopes YouTube channel">
    <div class="about-grid-item-body">
      <h3>Pedro Lopes</h3>
      <p>Main YT Channel</p>
    </div>
  </div>
  <div class="about-grid-item">
    <a class="about-grid-item-link" href="https://www.youtube.com/c/MusikWald" aria-label="Musik Wald" target="_blank" rel="noopener noreferrer"></a>
    <img src="/files/about/projects/pmusik2.png" alt="Musik Wald covers YouTube channel">
    <div class="about-grid-item-body">
      <h3>Musik Wald</h3>
      <p>Covers YT Channel</p>
    </div>
  </div>
  <div class="about-grid-item">
    <a class="about-grid-item-link" href="https://www.youtube.com/@out-and-about-channel" aria-label="Out and About" target="_blank" rel="noopener noreferrer"></a>
    <img src="/files/about/projects/pout_about.jpg" alt="Out n' About activities YouTube channel">
    <div class="about-grid-item-body">
      <h3>Out n' About</h3>
      <p>Activities YT Channel</p>
    </div>
  </div>


<div class="about-grid-item">
    <a class="about-grid-item-link" href="{% post_url 2016-10-06-deep-reinforcement-learning-racing-game %}" aria-label="Playing a Game" target="_blank" rel="noopener noreferrer"></a>
    <img src="/files/about/projects/pdqn.jpg" alt="Deep reinforcement learning agent playing a racing game">
    <div class="about-grid-item-body">
      <h3>Playing a Game</h3>
      <p>Using Deep Reinforcement Learning</p>
    </div>
  </div>
  <div class="about-grid-item">
    <a class="about-grid-item-link" href="{% post_url 2025-07-15-arduino %}" aria-label="Inside the Box" target="_blank" rel="noopener noreferrer"></a>
    <img src="/files/about/projects/parduino2.jpg" alt="Arduino starter kit projects and builds">
    <div class="about-grid-item-body">
      <h3>Inside the Box</h3>
      <p>Everything I Did With an Arduino Starter Kit</p>
    </div>
  </div>
  <div class="about-grid-item">
    <a class="about-grid-item-link" href="{% post_url 2024-06-24-personal-llm %}" aria-label="Personal LLM" target="_blank" rel="noopener noreferrer"></a>
    <img src="/files/about/projects/pllm.png" alt="Personal LLM setup with WhatsApp and Obsidian integration">
    <div class="about-grid-item-body">
      <h3>Personal LLM</h3>
      <p>With WhatsApp + Obsidian Access</p>
    </div>
  </div>

  <div class="about-grid-item">
    <a class="about-grid-item-link" href="{% post_url 2020-08-03-implementation-autocomplete-system-design %}" aria-label="Typeahead Suggestions" target="_blank" rel="noopener noreferrer"></a>
    <img src="/files/about/projects/ptypeahead.png" alt="Typeahead suggestions system design for large scale">
    <div class="about-grid-item-body">
      <h3>Typeahead Suggestions</h3>
      <p>For Large Scale</p>
    </div>
  </div>
  <div class="about-grid-item">
    <a class="about-grid-item-link" href="{% post_url 2020-12-25-hackernews-daily %}" aria-label="Hacker News Daily" target="_blank" rel="noopener noreferrer"></a>
    <img src="/files/about/projects/phndaily.png" alt="Hacker News Daily best stories interface">
    <div class="about-grid-item-body">
      <h3>Hacker News Daily</h3>
      <p>Best HN Stories</p>
    </div>
  </div>
  <div class="about-grid-item">
    <a class="about-grid-item-link" href="https://github.com/lopespm/unity-camera-multi-target" aria-label="Dynamic Multi Target Camera" target="_blank" rel="noopener noreferrer"></a>
    <img src="/files/about/projects/pdmc.jpg" alt="Dynamic multi-target camera Unity plugin demonstration">
    <div class="about-grid-item-body">
      <h3>Dynamic Multi Target Camera</h3>
      <p>Unity Plugin</p>
    </div>
  </div>

</div>