import {
  W, H, clamp, rand, randInt, rectsOverlap, circleHit,
  drawText, createLoop, bindInput, gameOverOverlay,
} from "../utils.js";

function baseGame(canvas, hooks) {
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  return { ctx, hooks };
}

// 3. COIN COLLECTOR ----------------------------------------------------------
function createCoinCollector(canvas, hooks) {
  const { ctx } = baseGame(canvas, hooks);
  const player = { x: 390, y: 240, r: 18 };
  const coin = { x: rand(35, 765), y: rand(60, 460), r: 12 };
  let score = 0;
  let timeLeft = 30;
  let ended = false;

  function action(name) {
    const step = 28;
    if (name === "up") player.y -= step;
    if (name === "down") player.y += step;
    if (name === "left") player.x -= step;
    if (name === "right") player.x += step;
    player.x = clamp(player.x, player.r, W - player.r);
    player.y = clamp(player.y, player.r + 30, H - player.r);
  }
  const unbind = bindInput(canvas, { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right", w: "up", s: "down", a: "left", d: "right" }, action);

  const loop = createLoop((dt) => {
    if (ended) return;
    timeLeft -= dt;
    if (circleHit(player, coin)) {
      score += 1;
      coin.x = rand(35, 765); coin.y = rand(60, 460);
      hooks.setStatus(`Coin collected! ${score} total.`);
    }
    if (timeLeft <= 0) { timeLeft = 0; ended = true; hooks.setStatus(`Time! You collected ${score} coins.`); }
  }, () => {
    ctx.fillStyle = "#10172a"; ctx.fillRect(0, 0, W, H);
    for (let x = 0; x < W; x += 40) { ctx.strokeStyle = "rgba(255,255,255,.04)"; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    ctx.fillStyle = "#ffd166"; ctx.beginPath(); ctx.arc(coin.x, coin.y, coin.r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#6ee7ff"; ctx.beginPath(); ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2); ctx.fill();
    drawText(ctx, "★", player.x, player.y + 7, 20, "center", "#07111f");
    drawText(ctx, `Coins ${score}`, 20, 34, 20);
    drawText(ctx, `Time ${Math.ceil(timeLeft)}`, 780, 34, 20, "right", "#ffd166");
    if (ended) gameOverOverlay(ctx, "Time's up!", `You collected ${score} coin${score === 1 ? "" : "s"}.`);
  });

  return { start: () => { hooks.setStatus("Collect as many gold coins as you can in 30 seconds."); loop.start(); }, stop: () => { loop.stop(); unbind(); } };
}

export { createCoinCollector };
