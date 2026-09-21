import {
  W, H, clamp, rand, randInt, rectsOverlap, circleHit,
  drawText, createLoop, bindInput, gameOverOverlay,
} from "../utils.js";

function baseGame(canvas, hooks) {
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  return { ctx, hooks };
}

// 6. CAR DODGE ---------------------------------------------------------------
function createCarDodge(canvas, hooks) {
  const { ctx } = baseGame(canvas, hooks);
  const player = { x: 375, y: 420, w: 50, h: 70 };
  const laneXs = [215, 315, 415, 515];
  let obstacles = [];
  let spawn = 0;
  let score = 0;
  let ended = false;

  function action(name) {
    const lane = laneXs.reduce((best, x, i) => Math.abs(x - player.x) < Math.abs(laneXs[best] - player.x) ? i : best, 0);
    let next = lane;
    if (name === "left") next = Math.max(0, lane - 1);
    if (name === "right") next = Math.min(laneXs.length - 1, lane + 1);
    player.x = laneXs[next];
  }
  player.x = laneXs[1];
  const unbind = bindInput(canvas, { ArrowLeft: "left", ArrowRight: "right", a: "left", d: "right" }, action);

  const loop = createLoop((dt) => {
    if (ended) return;
    score += dt * 10;
    spawn -= dt;
    if (spawn <= 0) {
      obstacles.push({ x: laneXs[randInt(0, laneXs.length - 1)], y: -90, w: 50, h: 70, speed: Math.min(330, 170 + score * .9) });
      spawn = Math.max(.48, 1.05 - score / 400);
    }
    obstacles.forEach((car) => car.y += car.speed * dt);
    obstacles = obstacles.filter((car) => car.y < H + 100);
    if (obstacles.some((car) => rectsOverlap(player, car))) { ended = true; hooks.setStatus(`Crash! Distance score: ${Math.floor(score)}.`); }
  }, () => {
    ctx.fillStyle = "#7fc97f"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#343a40"; ctx.fillRect(170, 0, 460, H);
    ctx.strokeStyle = "rgba(255,255,255,.5)"; ctx.setLineDash([24, 24]);
    [270, 370, 470, 570].forEach((x) => { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); });
    ctx.setLineDash([]);
    const drawCar = (car, color) => { ctx.fillStyle = color; ctx.fillRect(car.x, car.y, car.w, car.h); ctx.fillStyle = "#a9def9"; ctx.fillRect(car.x + 9, car.y + 9, car.w - 18, 18); };
    obstacles.forEach((car) => drawCar(car, "#ff7b7b")); drawCar(player, "#6ee7ff");
    drawText(ctx, `Distance ${Math.floor(score)}`, 20, 34, 20);
    if (ended) gameOverOverlay(ctx, "Crash!", `Distance score: ${Math.floor(score)}`);
  });

  return { start: () => { hooks.setStatus("Change lanes with ← → or A/D. Avoid the traffic!"); loop.start(); }, stop: () => { loop.stop(); unbind(); } };
}

export { createCarDodge };
