import { games } from "./games/index.js";

const libraryView = document.querySelector("#libraryView");
const playerView = document.querySelector("#playerView");
const grid = document.querySelector("#gameGrid");
const canvas = document.querySelector("#gameCanvas");
const title = document.querySelector("#gameTitle");
const emoji = document.querySelector("#gameEmoji");
const level = document.querySelector("#gameLevel");
const instructions = document.querySelector("#gameInstructions");
const skills = document.querySelector("#gameSkills");
const status = document.querySelector("#status");
const controls = document.querySelector("#touchControls");
const backButton = document.querySelector("#backButton");
const restartButton = document.querySelector("#restartButton");

let currentGame = null;
let currentDefinition = null;
let activeFilter = "all";

function renderLibrary() {
  grid.innerHTML = "";
  const visible = games.filter((game) => activeFilter === "all" || game.level.toLowerCase() === activeFilter);

  for (const game of visible) {
    const card = document.createElement("article");
    card.className = "game-card";
    card.innerHTML = `
      <div class="icon" aria-hidden="true">${game.emoji}</div>
      <div>
        <h2>${game.title}</h2>
        <p>${game.description}</p>
      </div>
      <div class="card-bottom">
        <span class="level-pill">${game.level}</span>
        <button class="play-button" type="button">Play →</button>
      </div>
    `;
    card.querySelector("button").addEventListener("click", () => launch(game));
    grid.append(card);
  }
}

function buildControls(game) {
  controls.innerHTML = "";
  for (const action of game.actions || []) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "action-button";
    button.textContent = action.label;

    const send = () => canvas.dispatchEvent(new CustomEvent("gameaction", { detail: action.id }));
    button.addEventListener("click", send);
    controls.append(button);
  }
}

function launch(game) {
  currentGame?.stop?.();
  currentDefinition = game;

  libraryView.hidden = true;
  playerView.hidden = false;
  title.textContent = game.title;
  emoji.textContent = game.emoji;
  level.textContent = game.level;
  instructions.textContent = game.instructions;
  skills.innerHTML = game.skills.map((item) => `<span class="skill">${item}</span>`).join("");
  status.textContent = "Ready — have fun!";
  buildControls(game);

  currentGame = game.create(canvas, {
    setStatus(message) {
      status.textContent = message;
    },
  });
  currentGame.start();
  canvas.focus();
  window.location.hash = game.id;
}

function backToLibrary() {
  currentGame?.stop?.();
  currentGame = null;
  currentDefinition = null;
  playerView.hidden = true;
  libraryView.hidden = false;
  window.location.hash = "";
  document.querySelector("#libraryTitle").focus?.();
}

restartButton.addEventListener("click", () => {
  if (currentDefinition) launch(currentDefinition);
});
backButton.addEventListener("click", backToLibrary);

document.querySelectorAll(".filter").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    activeFilter = button.dataset.filter;
    renderLibrary();
  });
});

renderLibrary();

const requested = window.location.hash.slice(1);
const requestedGame = games.find((game) => game.id === requested);
if (requestedGame) launch(requestedGame);
