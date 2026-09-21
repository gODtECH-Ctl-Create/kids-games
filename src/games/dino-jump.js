import {
  W, H, clamp, rand, randInt, rectsOverlap, circleHit,
  drawText, createLoop, bindInput, gameOverOverlay,
} from "../utils.js";

function baseGame(canvas, hooks) {
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  return { ctx, hooks };
}

// 7. DINO JUMP ---------------------------------------------------------------
function createDinoJump(canvas, hooks) {
  const { ctx } = baseGame(canvas, hooks);
  const groundY = 405;
  const dino = { x: 105, y: groundY - 54, w: 46, h: 54, vy: 0, grounded: true };
  let cactus = { x: W + 40, y: groundY - 48, w: 30, h: 48, speed: 230 };
  let score = 0;
  let ended = false;

  function action(name) {
    if (name === "jump" && dino.grounded && !ended) { dino.vy = -520; dino.grounded = false; }
  }
  const unbind = bindInput(canvas, { " ": "jump", ArrowUp: "jump", w: "jump" }, action);

  const loop = createLoop((dt) => {
    if (ended) return;
    dino.vy += 1250 * dt;
    dino.y += dino.vy * dt;
    if (dino.y >= groundY - dino.h) { dino.y = groundY - dino.h; dino.vy = 0; dino.grounded = true; }
    cactus.x -= cactus.speed * dt;
    if (cactus.x + cactus.w < 0) {
      score += 1;
      cactus.x = W + rand(70, 230);
      cactus.speed = Math.min(390, cactus.speed + 16);
      hooks.setStatus(`Great jump! Score: ${score}`);
    }
    if (rectsOverlap(dino, cactus)) { ended = true; hooks.setStatus(`Ouch! Final score: ${score}.`); }
  }, () => {
    ctx.fillStyle = "#f7f3e8"; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "#343a40"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(W, groundY); ctx.stroke();
    ctx.fillStyle = "#394867"; ctx.fillRect(dino.x, dino.y, dino.w, dino.h); ctx.fillRect(dino.x + 34, dino.y - 18, 32, 28);
    ctx.fillStyle = "#2a9d50"; ctx.fillRect(cactus.x, cactus.y, cactus.w, cactus.h); ctx.fillRect(cactus.x - 9, cactus.y + 16, 10, 18); ctx.fillRect(cactus.x + cactus.w, cactus.y + 9, 10, 21);
    drawText(ctx, `Score ${score}`, 20, 34, 20, "left", "#343a40");
    if (ended) gameOverOverlay(ctx, "Dino bumped a cactus!", `You cleared ${score} obstacle${score === 1 ? "" : "s"}.`);
  });

  return { start: () => { hooks.setStatus("Press Space, ↑, W, or Jump to leap over the cactus."); loop.start(); }, stop: () => { loop.stop(); unbind(); } };
}

export { createDinoJump };
