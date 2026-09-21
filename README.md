# TechTrack Kids — Game Arcade

A **multi-game reference and demonstration repository** for TechTrack Kids.

The purpose of this repository is simple: clone it and run the site locally, or publish it with GitHub Pages, then choose a game from the library and play it.

This is **not** the step-by-step kids course repository. The teaching/build-along versions can be developed separately. This repo is the finished-game showcase and reference library.

## Playable games

### Beginner

1. 🐢 Turtle Race
2. 🍎 Catch the Apple
3. 🪙 Coin Collector
4. 🎈 Balloon Pop
5. 🚀 Space Catcher

### Intermediate

6. 🚗 Car Dodge
7. 🦖 Dino Jump
8. 🏓 Mini Pong
9. 🐍 Mini Snake
10. 🐸 Cross the Road
11. 👾 Mini Space Shooter

## Why the showcase uses JavaScript instead of desktop Python

GitHub Pages hosts static browser content. Normal Python `turtle` or Pygame applications do not execute directly in a visitor's browser. For that reason, the playable showcase is implemented with **HTML, CSS, JavaScript, and Canvas**.

The separate TechTrack Kids teaching projects can still use Python where Python is the learning objective.

## Run locally

You can open `index.html` directly in many browsers, but because this project uses JavaScript modules, running a tiny local web server is more reliable.

With Python installed:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Repository structure

```text
kids-games/
├── index.html          # Game library + player screen
├── styles.css          # Arcade styling and responsive layout
├── src/
│   ├── app.js          # Game selection, filters, restart/back controls
│   ├── games/          # One JavaScript module per playable game
│   │   └── index.js    # Game catalog and metadata
│   └── utils.js        # Shared canvas, input, collision and loop helpers
└── README.md
```

## GitHub Pages

This repository is intentionally static and GitHub-Pages-friendly. Publish the repository root from the `main` branch and the same game library becomes a single public website.

Visitors can choose any game without installing Python, Node.js, Pygame, or a game engine.

## Product direction

**Reference/showcase repo:** this repository — finished playable games.

**Kids learning repo:** separate project — guided lessons that teach children to build the games themselves using the appropriate language/tool for each level.

**Advanced games later:** Pygame, Godot, larger platformers, racing games, RPG/adventure games, survival games, enemy AI, sound, saved scores, multiple scenes, and capstone projects.
