import {
  W, H, clamp, rand, randInt, rectsOverlap, circleHit,
  drawText, createLoop, bindInput, gameOverOverlay,
} from "../utils.js";

function baseGame(canvas, hooks) {
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  return { ctx, hooks };
}

// 9. MINI SNAKE --------------------------------------------------------------
function createMiniSnake(canvas, hooks) {
  const { ctx } = baseGame(canvas, hooks);
  const size = 20;
  const cols = W / size;
  const rows = H / size;
  let snake = [{ x: 12, y: 12 }, { x: 11, y: 12 }, { x: 10, y: 12 }];
  let dir = { x: 1, y: 0 };
  let nextDir = { ...dir };
  let food = spawnFood();
  let accumulator = 0;
  let score = 0;
  let ended = false;

  function spawnFood() {
    let candidate;
    do candidate = { x: randInt(1, cols - 2), y: randInt(2, rows - 2) };
    while (snake?.some?.((part) => part.x === candidate.x && part.y === candidate.y));
    return candidate;
  }
  function action(name) {
    const map = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
    const proposed = map[name];
    if (proposed && !(proposed.x === -dir.x && proposed.y === -dir.y)) nextDir = proposed;
  }
  const unbind = bindInput(canvas, { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right", w: "up", s: "down", a: "left", d: "right" }, action);

  const loop = createLoop((dt) => {
    if (ended) return;
    accumulator += dt;
    const speed = Math.max(.075, .15 - score * .004);
    if (accumulator < speed) return;
    accumulator = 0;
    dir = nextDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    const hitWall = head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows;
    const hitSelf = snake.some((part) => part.x === head.x && part.y === head.y);
    if (hitWall || hitSelf) { ended = true; hooks.setStatus(`Snake stopped! Score: ${score}.`); return; }
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) { score++; food = spawnFood(); }
    else snake.pop();
  }, () => {
    ctx.fillStyle = "#0b1721"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#ff6b6b"; ctx.fillRect(food.x * size + 3, food.y * size + 3, size - 6, size - 6);
    snake.forEach((part, i) => { ctx.fillStyle = i === 0 ? "#b9fbc0" : "#58c78a"; ctx.fillRect(part.x * size + 1, part.y * size + 1, size - 2, size - 2); });
    drawText(ctx, `Score ${score}`, 20, 30, 18);
    if (ended) gameOverOverlay(ctx, "Snake game over", `Score: ${score}`);
  });

  return { start: () => { hooks.setStatus("Eat the red food. Don't hit the wall or your own tail."); loop.start(); }, stop: () => { loop.stop(); unbind(); } };
}

export { createMiniSnake };
