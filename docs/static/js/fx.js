// Little particle effects: sparkle bursts when she picks something up, and
// floating hearts when she gets hurt. Positions are in world pixels.
import { game } from "./state.js";
import { heartPath, sparkle, INK } from "./style.js";

const STAR_COLORS = ["#fff3a8", "#ffd0e6", "#ffffff", "#c8f0ff", "#ffb3d6"];

export function spawnBurst(x, y) {
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + Math.random() * 0.5;
    const sp = 1.4 + Math.random() * 1.8;
    game.fx.push({
      kind: "star", x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 0.6,
      life: 38, max: 38, size: 3 + Math.random() * 4, color: STAR_COLORS[i % STAR_COLORS.length],
    });
  }
}

export function spawnHearts(x, y) {
  for (let i = 0; i < 4; i++) {
    game.fx.push({
      kind: "heart", x: x + (i - 1.5) * 9, y, vx: (i - 1.5) * 0.35, vy: -1.3 - Math.random() * 0.6,
      life: 52, max: 52, size: 5 + Math.random() * 2, color: "#ff8fbf",
    });
  }
}

export function updateFx() {
  const list = game.fx;
  for (const f of list) {
    f.x += f.vx;
    f.y += f.vy;
    f.vy += f.kind === "star" ? 0.05 : -0.012;    // stars arc down, hearts float up
    f.life--;
  }
  game.fx = list.filter((f) => f.life > 0);
}

export function drawFx(ctx) {
  for (const f of game.fx) {
    const k = f.life / f.max;
    ctx.globalAlpha = Math.min(1, k * 1.6);
    if (f.kind === "star") {
      sparkle(ctx, f.x, f.y, f.size * (0.5 + k * 0.7), f.color);
    } else {
      heartPath(ctx, f.x, f.y, f.size);
      ctx.fillStyle = f.color;
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
}
