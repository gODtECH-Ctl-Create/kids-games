import {
  W, H, clamp, rand, randInt, rectsOverlap, circleHit,
  drawText, createLoop, bindInput, gameOverOverlay,
} from "../utils.js";

function baseGame(canvas, hooks) {
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  return { ctx, hooks };
}

// 5. SPACE CATCHER -----------------------------------------------------------
function createSpaceCatcher(canvas, hooks) {
  const { ctx } = baseGame(canvas, hooks);
  const ship = { x: 360, y: 445, w: 80, h: 28 };
  const star = { x: rand(30, 770), y: -20, r: 13, speed: 150 };
  let score = 0;
  let lives = 3;
  let ended = false;

  function action(name) {
    if (name === "left") ship.x = clamp(ship.x - 48, 0, W - ship.w);
    if (name === "right") ship.x = clamp(ship.x + 48, 0, W - ship.w);
  }
  const unbind = bindInput(canvas, { ArrowLeft: "left", ArrowRight: "right", a: "left", d: "right" }, action);
  function resetStar() { star.x = rand(30, 770); star.y = -20; }

  const loop = createLoop((dt) => {
    if (ended) return;
    star.y += star.speed * dt;
    if (rectsOverlap({ x: star.x - 12, y: star.y - 12, w: 24, h: 24 }, ship)) {
      score++; star.speed = Math.min(310, star.speed + 13); resetStar();
    } else if (star.y > H + 20) {
      lives--; resetStar();
      if (lives <= 0) { ended = true; hooks.setStatus(`Mission over — ${score} stars rescued.`); }
    }
  }, () => {
    ctx.fillStyle = "#050b20"; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 70; i++) { ctx.fillStyle = `rgba(255,255,255,${.2 + (i % 5) * .12})`; ctx.fillRect((i * 97) % W, (i * 47) % H, 2, 2); }
    ctx.fillStyle = "#6ee7ff"; ctx.beginPath(); ctx.moveTo(ship.x + ship.w / 2, ship.y - 18); ctx.lineTo(ship.x + ship.w, ship.y + ship.h); ctx.lineTo(ship.x, ship.y + ship.h); ctx.closePath(); ctx.fill();
    drawText(ctx, "★", star.x, star.y + 9, 30, "center", "#ffd166");
    drawText(ctx, `Stars ${score}`, 20, 34, 20);
    drawText(ctx, `Lives ${lives}`, 780, 34, 20, "right", "#ff8fa3");
    if (ended) gameOverOverlay(ctx, "Mission complete", `You rescued ${score} star${score === 1 ? "" : "s"}.`);
  });

  return { start: () => { hooks.setStatus("Move the ship and catch the falling stars."); loop.start(); }, stop: () => { loop.stop(); unbind(); } };
}

export { createSpaceCatcher };
