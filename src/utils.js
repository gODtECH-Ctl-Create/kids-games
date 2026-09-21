export const W = 800;
export const H = 500;

export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export const rand = (min, max) => Math.random() * (max - min) + min;
export const randInt = (min, max) => Math.floor(rand(min, max + 1));

export function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function circleHit(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const r = a.r + b.r;
  return dx * dx + dy * dy <= r * r;
}

export function drawText(ctx, text, x, y, size = 24, align = "left", color = "#eef6ff") {
  ctx.fillStyle = color;
  ctx.font = `700 ${size}px system-ui, sans-serif`;
  ctx.textAlign = align;
  ctx.fillText(text, x, y);
}

export function createLoop(update, draw) {
  let frameId = 0;
  let active = false;
  let last = 0;

  function frame(now) {
    if (!active) return;
    const dt = Math.min((now - last) / 1000 || 0, 0.05);
    last = now;
    update(dt);
    draw();
    frameId = requestAnimationFrame(frame);
  }

  return {
    start() {
      if (active) return;
      active = true;
      last = performance.now();
      frameId = requestAnimationFrame(frame);
    },
    stop() {
      active = false;
      cancelAnimationFrame(frameId);
    },
  };
}

export function bindInput(canvas, keyMap, onAction) {
  const keyHandler = (event) => {
    const action = keyMap[event.key] || keyMap[event.key.toLowerCase?.()];
    if (!action) return;
    event.preventDefault();
    onAction(action);
  };

  const actionHandler = (event) => onAction(event.detail);
  window.addEventListener("keydown", keyHandler);
  canvas.addEventListener("gameaction", actionHandler);

  return () => {
    window.removeEventListener("keydown", keyHandler);
    canvas.removeEventListener("gameaction", actionHandler);
  };
}

export function gameOverOverlay(ctx, title, subtitle = "Press Restart to play again") {
  ctx.fillStyle = "rgba(2, 8, 18, .74)";
  ctx.fillRect(0, 0, W, H);
  drawText(ctx, title, W / 2, H / 2 - 10, 42, "center", "#ffffff");
  drawText(ctx, subtitle, W / 2, H / 2 + 36, 18, "center", "#b9fbc0");
}
