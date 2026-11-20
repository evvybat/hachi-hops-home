// Backdrop for Level 3: a bright, candy-coloured Shibuya afternoon. A pastel
// blue-to-pink sky with cotton-candy clouds, a hazy skyline, a closer row of
// colourful buildings with giant LED screens and the round "109" tower, and
// heart balloons floating by. Painted once into offscreen canvases and
// copied each frame (see scenery.js for why).

import { scatterTwinkles, cloudFace, kawaiiSun } from "./style.js";

const TILE = 1800;
const LAYER_H = 560;

function rnd(i) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function makeLayer(width, height, paint) {
  const c = document.createElement("canvas");
  c.width = width;
  c.height = height;
  paint(c.getContext("2d"));
  return c;
}

function blit(ctx, img, w, camX, fx, y = 0, extra = 0) {
  const start = -(((camX * fx) + extra) % TILE);
  for (let ox = Math.round(start) - TILE; ox < w; ox += TILE) ctx.drawImage(img, ox, y);
}

// ---- Sky and clouds ----------------------------------------------------------------

function paintSky(ctx, w, h) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#69bdf0");
  g.addColorStop(0.5, "#b4e0fa");
  g.addColorStop(0.85, "#ffd3ea");
  g.addColorStop(1, "#ffe9f4");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  const sx = w * 0.78, sy = 90;                       // bright afternoon sun
  const glow = ctx.createRadialGradient(sx, sy, 4, sx, sy, 250);
  glow.addColorStop(0, "rgba(255,255,235,0.95)");
  glow.addColorStop(0.3, "rgba(255,250,215,0.45)");
  glow.addColorStop(1, "rgba(255,250,215,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
  kawaiiSun(ctx, sx, sy, 26);                         // a smiling afternoon sun
}

function cloud(ctx, x, y, s, tint) {
  const puffs = [[0, 0, 28], [-32, 9, 21], [34, 9, 23], [-13, -11, 22], [15, -13, 24], [60, 13, 16], [-58, 13, 16]];
  for (const [dx, dy, r] of puffs) {
    const cx = x + dx * s, cy = y + dy * s, rr = r * s;
    const g = ctx.createRadialGradient(cx, cy - rr * 0.3, rr * 0.1, cx, cy, rr);
    g.addColorStop(0, "rgba(255,255,255,0.96)");
    g.addColorStop(0.65, tint);
    g.addColorStop(1, "rgba(255,225,240,0)");
    ctx.fillStyle = g;
    ctx.fillRect(cx - rr, cy - rr, rr * 2, rr * 2);
  }
}

// ---- Buildings -----------------------------------------------------------------------

function windows(ctx, x, y, w, h, cell, color, seed) {
  for (let wy = y + 8; wy < y + h - 8; wy += cell) {
    for (let wx = x + 5; wx < x + w - 7; wx += cell) {
      ctx.fillStyle = rnd(seed + wx * 0.37 + wy * 1.3) < 0.7 ? color : "rgba(255,255,255,0.55)";
      ctx.fillRect(wx, wy, cell * 0.55, cell * 0.62);
    }
  }
}

// A giant LED screen showing a simple animated-looking pop graphic.
function ledScreen(ctx, x, y, w, h, hue) {
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, `hsl(${hue},95%,62%)`);
  g.addColorStop(1, `hsl(${(hue + 60) % 360},95%,66%)`);
  const glow = ctx.createRadialGradient(x + w / 2, y + h / 2, 4, x + w / 2, y + h / 2, w);
  glow.addColorStop(0, `hsla(${hue},95%,70%,0.55)`);
  glow.addColorStop(1, `hsla(${hue},95%,70%,0)`);
  ctx.fillStyle = glow;
  ctx.fillRect(x - w * 0.6, y - h * 0.6, w * 2.2, h * 2.2);
  ctx.fillStyle = "#1d1830";
  ctx.fillRect(x - 3, y - 3, w + 6, h + 6);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "rgba(255,255,255,0.85)";           // a heart and a star as "content"
  ctx.beginPath();
  const hx = x + w * 0.3, hy = y + h * 0.5, hs = h * 0.22;
  ctx.moveTo(hx, hy + hs);
  ctx.bezierCurveTo(hx - hs * 1.6, hy - hs * 0.2, hx - hs * 0.8, hy - hs * 1.2, hx, hy - hs * 0.4);
  ctx.bezierCurveTo(hx + hs * 0.8, hy - hs * 1.2, hx + hs * 1.6, hy - hs * 0.2, hx, hy + hs);
  ctx.fill();
  ctx.fillRect(x + w * 0.58, y + h * 0.28, w * 0.3, 3);
  ctx.fillRect(x + w * 0.58, y + h * 0.5, w * 0.24, 3);
  ctx.fillRect(x + w * 0.58, y + h * 0.72, w * 0.18, 3);
}

function paintFar(ctx) {
  let x = 0, i = 0;
  while (x < TILE) {
    const w = 40 + rnd(i + 3) * 50, hgt = 130 + rnd(i + 30) * 190;
    ctx.fillStyle = "#c9b8e8";
    ctx.fillRect(x, 520 - hgt, w, hgt + 60);
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.fillRect(x, 520 - hgt, w * 0.3, hgt + 60);
    windows(ctx, x, 520 - hgt, w, hgt, 9, "#ecf3ff", i * 31);
    x += w + 3;
    i++;
  }
  const g = ctx.createLinearGradient(0, 400, 0, 530);   // haze
  g.addColorStop(0, "rgba(255,230,245,0)");
  g.addColorStop(1, "rgba(255,230,245,0.6)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 400, TILE, 130);
}

const MID_COLORS = ["#ffb3cf", "#9ad9f5", "#ffe08a", "#b9a6f2", "#9eeac4", "#ffc6a3"];

// The round "109" tower: a pink cylinder with window bands and a big red sign.
function tower109(ctx, cx, base) {
  const w = 110, hgt = 280;
  const g = ctx.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
  g.addColorStop(0, "#ffb0c8");
  g.addColorStop(0.45, "#fff0f5");
  g.addColorStop(1, "#e88aa9");
  ctx.fillStyle = g;
  ctx.fillRect(cx - w / 2, base - hgt, w, hgt + 40);
  ctx.beginPath();
  ctx.ellipse(cx, base - hgt, w / 2, 9, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#ffd0e0";
  ctx.fill();
  for (let y = base - hgt + 26; y < base - 30; y += 24) {          // glass bands
    ctx.fillStyle = "rgba(120,170,220,0.7)";
    ctx.fillRect(cx - w / 2 + 6, y, w - 12, 12);
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.fillRect(cx - w / 2 + 10, y + 1, 10, 10);
  }
  ctx.fillStyle = "#e02a4a";                                         // sign
  ctx.fillRect(cx - 36, base - hgt - 36, 72, 36);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 28px 'Fredoka','Baloo 2',system-ui,sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("109", cx, base - hgt - 17);
  ctx.textBaseline = "alphabetic";
}

function paintMid(ctx) {
  let x = 0, i = 0;
  while (x < TILE) {
    const w = 70 + rnd(i + 8) * 70, hgt = 160 + rnd(i + 60) * 190;
    const col = MID_COLORS[i % MID_COLORS.length];
    ctx.fillStyle = col;
    ctx.fillRect(x, 540 - hgt, w, hgt + 60);
    ctx.fillStyle = "rgba(60,40,90,0.12)";
    ctx.fillRect(x + w * 0.72, 540 - hgt, w * 0.28, hgt + 60);
    windows(ctx, x, 540 - hgt, w, hgt, 12, "#fff7d0", i * 17 + 5);
    if (rnd(i + 90) < 0.55) ledScreen(ctx, x + 6, 540 - hgt + hgt * 0.2, w - 12, Math.min(60, hgt * 0.28), (i * 67) % 360);
    if (rnd(i + 120) < 0.3) {                                       // vertical neon sign
      ctx.fillStyle = "#ff4f9a";
      ctx.fillRect(x + w - 8, 540 - hgt + 20, 6, 52);
    }
    x += w + 5;
    i++;
  }
  tower109(ctx, 640, 540);
  tower109(ctx, 1500, 540);
  const g = ctx.createLinearGradient(0, 440, 0, 545);
  g.addColorStop(0, "rgba(255,235,248,0)");
  g.addColorStop(1, "rgba(255,235,248,0.5)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 440, TILE, 105);
}

let layers = null;

function build(w, h) {
  const L = {};
  L.sky = makeLayer(w, h, (c) => { paintSky(c, w, h); scatterTwinkles(c, w, h, 34, 2, 0.6); });
  L.clouds = makeLayer(TILE, 240, (c) => {
    [[160, 90, 1.3], [560, 150, 0.9], [940, 70, 1.5], [1320, 140, 1.1], [1660, 80, 0.95]]
      .forEach(([cx, cy, s], i) => {
        cloud(c, cx, cy, s, i % 2 ? "rgba(255,238,248,0.85)" : "rgba(245,250,255,0.85)");
        cloudFace(c, cx + 2 * s, cy + 3 * s, 2.0 * s);       // sleepy kawaii cloud
      });
  });
  L.far = makeLayer(TILE, LAYER_H, paintFar);
  L.mid = makeLayer(TILE, LAYER_H, paintMid);
  L.vignette = makeLayer(w, h, (c) => {
    const v = c.createRadialGradient(w / 2, h / 2, h * 0.5, w / 2, h / 2, w * 0.74);
    v.addColorStop(0, "rgba(90,40,110,0)");
    v.addColorStop(1, "rgba(90,40,110,0.22)");
    c.fillStyle = v;
    c.fillRect(0, 0, w, h);
  });
  return L;
}

function getLayers(w, h) {
  if (!layers) layers = build(w, h);
  return layers;
}

export function drawHarajukuBackdrop(ctx, w, h, camX, t) {
  const L = getLayers(w, h);
  ctx.drawImage(L.sky, 0, 0);
  blit(ctx, L.clouds, w, camX, 0.05, 0, t * 5);
  blit(ctx, L.far, w, camX, 0.1, -60);
  blit(ctx, L.mid, w, camX, 0.22, -50);
}

export function drawHarajukuVignette(ctx, w, h) {
  ctx.drawImage(getLayers(w, h).vignette, 0, 0);
}

// Heart balloons and confetti drifting past (live, but only a handful).
const BALLOONS = Array.from({ length: 7 }, (_, i) => ({
  x: rnd(i + 2), y: rnd(i + 20), speed: 10 + rnd(i + 50) * 14, size: 11 + rnd(i + 70) * 8,
  hue: [340, 190, 50, 280, 150, 20, 320][i],
}));

export function drawBalloons(ctx, w, h, camX, t) {
  for (const b of BALLOONS) {
    const x = (((b.x * w * 1.4 - camX * 0.7 + Math.sin(t * 0.8 + b.y * 9) * 14) % w) + w) % w;
    const y = h + 40 - (((b.y * h * 1.3 + t * b.speed) % (h + 120)));
    ctx.strokeStyle = "rgba(60,40,80,0.6)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x, y + b.size);
    ctx.quadraticCurveTo(x + 6 * Math.sin(t + b.x * 9), y + b.size + 20, x, y + b.size + 40);
    ctx.stroke();
    ctx.fillStyle = `hsl(${b.hue},90%,66%)`;
    ctx.beginPath();
    const s = b.size;
    ctx.moveTo(x, y + s);
    ctx.bezierCurveTo(x - s * 1.5, y + s * 0.1, x - s * 0.8, y - s * 1.1, x, y - s * 0.3);
    ctx.bezierCurveTo(x + s * 0.8, y - s * 1.1, x + s * 1.5, y + s * 0.1, x, y + s);
    ctx.fill();
    ctx.strokeStyle = "#8d5e50";
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.beginPath();
    ctx.ellipse(x - s * 0.5, y - s * 0.1, s * 0.2, s * 0.12, -0.6, 0, Math.PI * 2);
    ctx.fill();
  }
}
