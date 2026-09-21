import {
  W, H, clamp, rand, randInt, rectsOverlap, circleHit,
  drawText, createLoop, bindInput, gameOverOverlay,
} from "../utils.js";

function baseGame(canvas, hooks) {
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  return { ctx, hooks };
}

// 8. MINI PONG ---------------------------------------------------------------
function createMiniPong(canvas, hooks) {
  const { ctx } = baseGame(canvas, hooks);
  const player = { x: 25, y: 205, w: 16, h: 90 };
  const cpu = { x: 759, y: 205, w: 16, h: 90 };
  const ball = { x: 400, y: 250, r: 10, vx: 285, vy: 185 };
  let playerScore = 0;
  let cpuScore = 0;
  let ended = false;

  function reset(direction) { ball.x = 400; ball.y = 250; ball.vx = 285 * direction; ball.vy = rand(-210, 210); }
  function action(name) {
    if (name === "up") player.y = clamp(player.y - 45, 0, H - player.h);
    if (name === "down") player.y = clamp(player.y + 45, 0, H - player.h);
  }
  const unbind = bindInput(canvas, { ArrowUp: "up", ArrowDown: "down", w: "up", s: "down" }, action);

  const loop = createLoop((dt) => {
    if (ended) return;
    cpu.y += clamp(ball.y - (cpu.y + cpu.h / 2), -230 * dt, 230 * dt);
    cpu.y = clamp(cpu.y, 0, H - cpu.h);
    ball.x += ball.vx * dt; ball.y += ball.vy * dt;
    if (ball.y < ball.r || ball.y > H - ball.r) { ball.vy *= -1; ball.y = clamp(ball.y, ball.r, H - ball.r); }
    if (rectsOverlap({ x: ball.x - ball.r, y: ball.y - ball.r, w: ball.r * 2, h: ball.r * 2 }, player) && ball.vx < 0) ball.vx *= -1.05;
    if (rectsOverlap({ x: ball.x - ball.r, y: ball.y - ball.r, w: ball.r * 2, h: ball.r * 2 }, cpu) && ball.vx > 0) ball.vx *= -1.05;
    if (ball.x < -20) { cpuScore++; reset(1); }
    if (ball.x > W + 20) { playerScore++; reset(-1); }
    if (playerScore === 5 || cpuScore === 5) { ended = true; hooks.setStatus(playerScore > cpuScore ? "You won the Pong match!" : "Computer wins this round."); }
  }, () => {
    ctx.fillStyle = "#081229"; ctx.fillRect(0, 0, W, H);
    ctx.setLineDash([12, 12]); ctx.strokeStyle = "rgba(255,255,255,.28)"; ctx.beginPath(); ctx.moveTo(400, 0); ctx.lineTo(400, H); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = "#eef6ff"; ctx.fillRect(player.x, player.y, player.w, player.h); ctx.fillRect(cpu.x, cpu.y, cpu.w, cpu.h);
    ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2); ctx.fill();
    drawText(ctx, playerScore, 330, 56, 34, "center"); drawText(ctx, cpuScore, 470, 56, 34, "center");
    if (ended) gameOverOverlay(ctx, playerScore > cpuScore ? "You win!" : "Computer wins", `${playerScore} — ${cpuScore}`);
  });

  return { start: () => { hooks.setStatus("First to 5 wins. Move your left paddle with ↑ ↓ or W/S."); loop.start(); }, stop: () => { loop.stop(); unbind(); } };
}

export { createMiniPong };
