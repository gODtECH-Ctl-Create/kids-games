import {
  W, H, clamp, rand, randInt, rectsOverlap, circleHit,
  drawText, createLoop, bindInput, gameOverOverlay,
} from "../utils.js";

function baseGame(canvas, hooks) {
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  return { ctx, hooks };
}

// 11. MINI SPACE SHOOTER -----------------------------------------------------
function createSpaceShooter(canvas, hooks) {
  const { ctx } = baseGame(canvas, hooks);
  const ship = { x: 375, y: 440, w: 50, h: 35 };
  let bullets = [];
  let enemies = Array.from({ length: 12 }, (_, i) => ({ x: 95 + (i % 6) * 115, y: 70 + Math.floor(i / 6) * 65, w: 40, h: 28, dir: 1 }));
  let cooldown = 0;
  let lives = 3;
  let score = 0;
  let enemySpeed = 42;
  let ended = false;
  let won = false;

  function action(name) {
    if (ended) return;
    if (name === "left") ship.x = clamp(ship.x - 42, 0, W - ship.w);
    if (name === "right") ship.x = clamp(ship.x + 42, 0, W - ship.w);
    if (name === "fire" && cooldown <= 0) {
      bullets.push({ x: ship.x + ship.w / 2 - 3, y: ship.y - 12, w: 6, h: 16, speed: 430 });
      cooldown = .22;
    }
  }
  const unbind = bindInput(canvas, { ArrowLeft: "left", ArrowRight: "right", a: "left", d: "right", " ": "fire", ArrowUp: "fire" }, action);

  const loop = createLoop((dt) => {
    if (ended) return;
    cooldown -= dt;
    bullets.forEach((b) => b.y -= b.speed * dt);
    bullets = bullets.filter((b) => b.y > -30);

    let edge = false;
    enemies.forEach((enemy) => { enemy.x += enemySpeed * enemy.dir * dt; if (enemy.x < 25 || enemy.x + enemy.w > W - 25) edge = true; });
    if (edge) enemies.forEach((enemy) => { enemy.dir *= -1; enemy.y += 18; });

    for (let bi = bullets.length - 1; bi >= 0; bi--) {
      const hit = enemies.findIndex((enemy) => rectsOverlap(bullets[bi], enemy));
      if (hit >= 0) { enemies.splice(hit, 1); bullets.splice(bi, 1); score += 10; enemySpeed += 2; }
    }

    if (enemies.some((enemy) => enemy.y + enemy.h >= ship.y)) {
      lives = 0; ended = true; hooks.setStatus(`The aliens landed. Score: ${score}.`);
    }
    if (enemies.length === 0) { won = true; ended = true; hooks.setStatus(`You cleared the fleet! Score: ${score}.`); }
  }, () => {
    ctx.fillStyle = "#04091b"; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 85; i++) { ctx.fillStyle = "rgba(255,255,255,.55)"; ctx.fillRect((i * 83) % W, (i * 53) % H, 1.5, 1.5); }
    ctx.fillStyle = "#6ee7ff"; ctx.beginPath(); ctx.moveTo(ship.x + ship.w / 2, ship.y - 12); ctx.lineTo(ship.x + ship.w, ship.y + ship.h); ctx.lineTo(ship.x, ship.y + ship.h); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#ffd166"; bullets.forEach((b) => ctx.fillRect(b.x, b.y, b.w, b.h));
    enemies.forEach((enemy, i) => { ctx.fillStyle = i % 2 ? "#b9fbc0" : "#d0a2f7"; ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h); ctx.fillStyle = "#07111f"; ctx.fillRect(enemy.x + 8, enemy.y + 8, 6, 6); ctx.fillRect(enemy.x + 26, enemy.y + 8, 6, 6); });
    drawText(ctx, `Score ${score}`, 20, 34, 20); drawText(ctx, `Enemies ${enemies.length}`, 780, 34, 20, "right");
    if (ended) gameOverOverlay(ctx, won ? "Fleet cleared!" : "The aliens landed!", `Final score: ${score}`);
  });

  return { start: () => { hooks.setStatus("Move with ← →. Fire with Space or ↑."); loop.start(); }, stop: () => { loop.stop(); unbind(); } };
}

export { createSpaceShooter };
