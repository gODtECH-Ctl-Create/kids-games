import {
  W, H, clamp, rand, randInt, rectsOverlap, circleHit,
  drawText, createLoop, bindInput, gameOverOverlay,
} from "../utils.js";

function baseGame(canvas, hooks) {
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  return { ctx, hooks };
}

// 4. BALLOON POP -------------------------------------------------------------
function createBalloonPop(canvas, hooks) {
  const { ctx } = baseGame(canvas, hooks);
  const colors = ["#ff6b6b", "#6ee7ff", "#ffd166", "#b9fbc0", "#d0a2f7"];
  let balloons = Array.from({ length: 7 }, () => makeBalloon());
  let score = 0;
  let timeLeft = 25;
  let ended = false;

  function makeBalloon() {
    return { x: rand(45, 755), y: rand(75, 445), r: rand(22, 34), color: colors[randInt(0, colors.length - 1)], vx: rand(-18, 18), vy: rand(-14, 14) };
  }
  function pointer(event) {
    if (ended) return;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (W / rect.width);
    const y = (event.clientY - rect.top) * (H / rect.height);
    const hit = balloons.findIndex((b) => Math.hypot(x - b.x, y - b.y) <= b.r);
    if (hit >= 0) {
      score += 1;
      balloons[hit] = makeBalloon();
      hooks.setStatus(`Pop! Score: ${score}`);
    }
  }
  canvas.addEventListener("pointerdown", pointer);

  const loop = createLoop((dt) => {
    if (ended) return;
    timeLeft -= dt;
    for (const b of balloons) {
      b.x += b.vx * dt; b.y += b.vy * dt;
      if (b.x < b.r || b.x > W - b.r) b.vx *= -1;
      if (b.y < 60 + b.r || b.y > H - b.r) b.vy *= -1;
    }
    if (timeLeft <= 0) { timeLeft = 0; ended = true; hooks.setStatus(`Finished! ${score} balloons popped.`); }
  }, () => {
    ctx.fillStyle = "#f5eaff"; ctx.fillRect(0, 0, W, H);
    balloons.forEach((b) => {
      ctx.fillStyle = b.color;
      ctx.beginPath(); ctx.ellipse(b.x, b.y, b.r * .82, b.r, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(40,30,60,.35)"; ctx.beginPath(); ctx.moveTo(b.x, b.y + b.r); ctx.lineTo(b.x, b.y + b.r + 24); ctx.stroke();
    });
    drawText(ctx, `Pops ${score}`, 20, 34, 20, "left", "#36294a");
    drawText(ctx, `Time ${Math.ceil(timeLeft)}`, 780, 34, 20, "right", "#36294a");
    if (ended) gameOverOverlay(ctx, "Balloon round complete!", `You popped ${score} balloon${score === 1 ? "" : "s"}.`);
  });

  return { start: () => { hooks.setStatus("Click or tap the balloons before time runs out."); loop.start(); }, stop: () => { loop.stop(); canvas.removeEventListener("pointerdown", pointer); } };
}

export { createBalloonPop };
