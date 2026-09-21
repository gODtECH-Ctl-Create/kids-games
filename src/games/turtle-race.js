import {
  W, H, clamp, rand, randInt, rectsOverlap, circleHit,
  drawText, createLoop, bindInput, gameOverOverlay,
} from "../utils.js";

function baseGame(canvas, hooks) {
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  return { ctx, hooks };
}

// 1. TURTLE RACE -------------------------------------------------------------
function createTurtleRace(canvas, hooks) {
  const { ctx } = baseGame(canvas, hooks);
  const colors = ["#ff6b6b", "#6ee7ff", "#80ed99", "#ffd166"];
  const racers = colors.map((color, i) => ({ x: 80, y: 120 + i * 85, color, speed: rand(65, 110) }));
  let winner = null;

  const loop = createLoop((dt) => {
    if (winner) return;
    for (const racer of racers) {
      racer.x += racer.speed * dt * rand(.75, 1.3);
      if (racer.x >= 710) {
        winner = racer;
        hooks.setStatus("Race finished! Restart for another random race.");
        break;
      }
    }
  }, () => {
    ctx.fillStyle = "#f6fbff";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#d9ead3";
    ctx.fillRect(0, 70, W, 370);
    ctx.fillStyle = "#232946";
    ctx.fillRect(720, 70, 8, 370);
    drawText(ctx, "FINISH", 724, 52, 16, "center", "#232946");

    racers.forEach((racer, i) => {
      ctx.strokeStyle = "rgba(35,41,70,.16)";
      ctx.beginPath(); ctx.moveTo(60, racer.y + 24); ctx.lineTo(740, racer.y + 24); ctx.stroke();
      ctx.fillStyle = racer.color;
      ctx.beginPath(); ctx.ellipse(racer.x, racer.y, 28, 19, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(racer.x + 29, racer.y - 3, 10, 0, Math.PI * 2); ctx.fill();
      drawText(ctx, String(i + 1), racer.x, racer.y + 6, 14, "center", "#07111f");
    });

    if (winner) gameOverOverlay(ctx, "🏁 We have a winner!", "Every race is different because the speeds are random.");
  });

  return { start: () => { hooks.setStatus("The turtles are racing!"); loop.start(); }, stop: () => loop.stop() };
}

export { createTurtleRace };
