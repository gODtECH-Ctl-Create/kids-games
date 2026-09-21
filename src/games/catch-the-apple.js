import {
  W, H, clamp, rand, randInt, rectsOverlap, circleHit,
  drawText, createLoop, bindInput, gameOverOverlay,
} from "../utils.js";

function baseGame(canvas, hooks) {
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  return { ctx, hooks };
}

// 2. CATCH THE APPLE ---------------------------------------------------------
function createCatchApple(canvas, hooks) {
  const { ctx } = baseGame(canvas, hooks);
  const basket = { x: 350, y: 440, w: 100, h: 28 };
  const apple = { x: rand(35, 765), y: -20, r: 16, speed: 145 };
  let score = 0;
  let lives = 3;
  let ended = false;

  function resetApple() { apple.x = rand(35, 765); apple.y = -20; }
  function action(name) {
    if (name === "left") basket.x = clamp(basket.x - 45, 0, W - basket.w);
    if (name === "right") basket.x = clamp(basket.x + 45, 0, W - basket.w);
  }
  const unbind = bindInput(canvas, { ArrowLeft: "left", ArrowRight: "right", a: "left", d: "right" }, action);

  const loop = createLoop((dt) => {
    if (ended) return;
    apple.y += apple.speed * dt;
    const appleBox = { x: apple.x - apple.r, y: apple.y - apple.r, w: apple.r * 2, h: apple.r * 2 };
    if (rectsOverlap(appleBox, basket)) {
      score += 1;
      apple.speed = Math.min(270, apple.speed + 10);
      resetApple();
      hooks.setStatus(`Nice catch! Score: ${score}`);
    } else if (apple.y - apple.r > H) {
      lives -= 1;
      if (lives <= 0) {
        ended = true;
        hooks.setStatus(`Game over — final score ${score}.`);
      } else resetApple();
    }
  }, () => {
    ctx.fillStyle = "#bfe9ff"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#7acb74"; ctx.fillRect(0, 455, W, 45);
    ctx.fillStyle = "#9a6b3f"; ctx.fillRect(basket.x, basket.y, basket.w, basket.h);
    ctx.fillStyle = "#e63946"; ctx.beginPath(); ctx.arc(apple.x, apple.y, apple.r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#2f7d32"; ctx.fillRect(apple.x + 4, apple.y - 24, 4, 10);
    drawText(ctx, `Score ${score}`, 20, 34, 20);
    drawText(ctx, `Lives ${"♥".repeat(lives)}`, 780, 34, 20, "right", "#d62828");
    if (ended) gameOverOverlay(ctx, "Apple basket closed!", `You caught ${score} apple${score === 1 ? "" : "s"}.`);
  });

  return { start: () => { hooks.setStatus("Use ← → or A/D to catch apples."); loop.start(); }, stop: () => { loop.stop(); unbind(); } };
}

export { createCatchApple };
