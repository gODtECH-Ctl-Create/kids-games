import {
  W, H, clamp, rand, randInt, rectsOverlap, circleHit,
  drawText, createLoop, bindInput, gameOverOverlay,
} from "../utils.js";

function baseGame(canvas, hooks) {
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  return { ctx, hooks };
}

// 10. CROSS THE ROAD ---------------------------------------------------------
function createCrossRoad(canvas, hooks) {
  const { ctx } = baseGame(canvas, hooks);
  const frog = { x: 385, y: 450, w: 30, h: 30 };
  const lanes = [355, 285, 215, 145];
  const cars = lanes.flatMap((y, lane) => Array.from({ length: 2 }, (_, i) => ({ x: i * 440 + lane * 70, y, w: 70, h: 34, speed: (110 + lane * 35) * (lane % 2 ? -1 : 1) })));
  let level = 1;
  let lives = 3;
  let ended = false;

  function resetFrog() { frog.x = 385; frog.y = 450; }
  function action(name) {
    if (ended) return;
    if (name === "up") frog.y -= 42;
    if (name === "down") frog.y += 42;
    if (name === "left") frog.x -= 42;
    if (name === "right") frog.x += 42;
    frog.x = clamp(frog.x, 0, W - frog.w); frog.y = clamp(frog.y, 0, H - frog.h);
    if (frog.y < 55) {
      level++;
      cars.forEach((car) => car.speed *= 1.08);
      resetFrog();
      hooks.setStatus(`Level ${level}! Traffic is getting faster.`);
    }
  }
  const unbind = bindInput(canvas, { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right", w: "up", s: "down", a: "left", d: "right" }, action);

  const loop = createLoop((dt) => {
    if (ended) return;
    cars.forEach((car) => {
      car.x += car.speed * dt;
      if (car.speed > 0 && car.x > W + 80) car.x = -100;
      if (car.speed < 0 && car.x < -100) car.x = W + 80;
    });
    if (cars.some((car) => rectsOverlap(frog, car))) {
      lives--;
      if (lives <= 0) { ended = true; hooks.setStatus(`Road trip over. You reached level ${level}.`); }
      else { resetFrog(); hooks.setStatus(`Watch the traffic! ${lives} lives left.`); }
    }
  }, () => {
    ctx.fillStyle = "#68b05d"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#30343b"; ctx.fillRect(0, 105, W, 315);
    lanes.forEach((y) => { ctx.setLineDash([18, 20]); ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.beginPath(); ctx.moveTo(0, y + 52); ctx.lineTo(W, y + 52); ctx.stroke(); }); ctx.setLineDash([]);
    cars.forEach((car, i) => { ctx.fillStyle = i % 2 ? "#ffd166" : "#ff7b7b"; ctx.fillRect(car.x, car.y, car.w, car.h); });
    ctx.fillStyle = "#80ed99"; ctx.fillRect(frog.x, frog.y, frog.w, frog.h); drawText(ctx, "●", frog.x + 15, frog.y + 23, 18, "center", "#154734");
    drawText(ctx, `Level ${level}`, 20, 34, 20); drawText(ctx, `Lives ${lives}`, 780, 34, 20, "right", "#ffffff");
    if (ended) gameOverOverlay(ctx, "Road closed!", `You reached level ${level}.`);
  });

  return { start: () => { hooks.setStatus("Reach the top without touching a car."); loop.start(); }, stop: () => { loop.stop(); unbind(); } };
}

export { createCrossRoad };
