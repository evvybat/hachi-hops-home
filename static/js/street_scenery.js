// Backdrop for Level 2: a Tokyo evening. A warm sunset sky, two layers of
// skyline with lit windows, and Tokyo Tower glowing in the distance.
// Painted once into offscreen canvases, then copied each frame (see
// scenery.js for why). Layers scroll slower the further away they are, both
// sideways and up/down, so climbing the building feels like gaining height.

import { scatterTwinkles, kawaiiSun } from "./style.js";

const TILE = 1800;
const LAYER_H = 700;       // taller than the screen so vertical parallax has room

function rnd(i) {          // small repeatable "random" number in 0..1
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

// ---- Sky -------------------------------------------------------------------

function paintSky(ctx, w, h) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#7378c9");
  g.addColorStop(0.35, "#b890e6");
  g.addColorStop(0.65, "#ff9cbc");
  g.addColorStop(0.88, "#ffd6a6");
  g.addColorStop(1, "#ffe3b0");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  for (let i = 0; i < 70; i++) {                    // first stars of the evening
    const a = 0.25 + rnd(i + 5) * 0.55;
    ctx.fillStyle = `rgba(255,250,235,${a})`;
    ctx.beginPath();
    ctx.arc(rnd(i) * w, rnd(i + 99) * h * 0.4, 0.6 + rnd(i + 3) * 0.9, 0, Math.PI * 2);
    ctx.fill();
  }

  const sx = w * 0.26, sy = h * 0.84;               // low sun glow
  const glow = ctx.createRadialGradient(sx, sy, 6, sx, sy, 330);
  glow.addColorStop(0, "rgba(255,238,190,0.95)");
  glow.addColorStop(0.3, "rgba(255,190,140,0.5)");
  glow.addColorStop(1, "rgba(255,160,130,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
  kawaiiSun(ctx, sx, sy, 36, "#ffe7a8");              // a smiling sunset sun

  // Long pink and orange streaks of cloud lit from below.
  for (let i = 0; i < 7; i++) {
    const cx = rnd(i + 20) * w, cy = h * (0.28 + rnd(i + 40) * 0.3);
    const rx = 90 + rnd(i + 60) * 150;
    const cg = ctx.createRadialGradient(cx, cy, 4, cx, cy, rx);
    cg.addColorStop(0, "rgba(255,196,170,0.6)");
    cg.addColorStop(1, "rgba(255,150,150,0)");
    ctx.fillStyle = cg;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1, 0.18);
    ctx.translate(-cx, -cy);
    ctx.fillRect(cx - rx, cy - rx, rx * 2, rx * 2);
    ctx.restore();
  }
}

// ---- Skylines ---------------------------------------------------------------

function windowsOn(ctx, x, y, w, h, cell, litChance, seed, lit, dim) {
  for (let wy = y + 8; wy < y + h - 8; wy += cell) {
    for (let wx = x + 5; wx < x + w - 7; wx += cell) {
      ctx.fillStyle = rnd(seed + wx * 0.37 + wy * 1.3) < litChance ? lit : dim;
      ctx.fillRect(wx, wy, cell * 0.5, cell * 0.62);
    }
  }
}

function tokyoTower(ctx, cx, baseY, scale) {
  const s = scale;
  const half = (y) => (36 * (1 - y / 300) + 3) * s;   // width narrows toward the top
  ctx.fillStyle = "#e8553d";
  ctx.beginPath();
  ctx.moveTo(cx - half(0), baseY);
  ctx.lineTo(cx - half(300), baseY - 300 * s);
  ctx.lineTo(cx + half(300), baseY - 300 * s);
  ctx.lineTo(cx + half(0), baseY);
  ctx.lineTo(cx + half(0) - 14 * s, baseY);
  ctx.lineTo(cx, baseY - 90 * s);                     // open arch between the legs
  ctx.lineTo(cx - half(0) + 14 * s, baseY);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.8)";          // the white aviation stripes
  ctx.lineWidth = 5 * s;
  for (const y of [120, 170, 220]) {
    ctx.beginPath();
    ctx.moveTo(cx - half(y), baseY - y * s);
    ctx.lineTo(cx + half(y), baseY - y * s);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(120,30,20,0.5)";            // lattice
  ctx.lineWidth = 1 * s;
  for (let y = 0; y < 300; y += 30) {
    ctx.beginPath();
    ctx.moveTo(cx - half(y), baseY - y * s);
    ctx.lineTo(cx + half(y + 30), baseY - (y + 30) * s);
    ctx.moveTo(cx + half(y), baseY - y * s);
    ctx.lineTo(cx - half(y + 30), baseY - (y + 30) * s);
    ctx.stroke();
  }
  ctx.fillStyle = "#f4f0e8";                          // observation decks
  for (const [dy, dw] of [[105, 30], [205, 20]]) {
    ctx.fillRect(cx - dw * s, baseY - (dy + 6) * s, dw * 2 * s, 11 * s);
  }
  ctx.strokeStyle = "#d84a35";                        // antenna
  ctx.lineWidth = 2.4 * s;
  ctx.beginPath();
  ctx.moveTo(cx, baseY - 300 * s);
  ctx.lineTo(cx, baseY - 372 * s);
  ctx.stroke();
}

function paintSkyline(ctx, o) {
  let x = 0, i = 0;
  while (x < TILE) {
    const w = o.minW + rnd(i + o.seed) * (o.maxW - o.minW);
    const hgt = o.minH + rnd(i + o.seed + 50) * (o.maxH - o.minH);
    ctx.fillStyle = o.color;
    ctx.fillRect(x, o.base - hgt, w, hgt + 300);
    ctx.fillStyle = "rgba(0,0,0,0.12)";               // shaded side
    ctx.fillRect(x + w * 0.7, o.base - hgt, w * 0.3, hgt + 300);
    windowsOn(ctx, x, o.base - hgt, w, hgt, o.cell, o.lit, i * 31 + o.seed, o.litColor, o.dimColor);
    if (rnd(i + o.seed + 90) < 0.35) {                // rooftop antenna
      ctx.fillStyle = o.color;
      ctx.fillRect(x + w * 0.5, o.base - hgt - 22, 2, 22);
      ctx.fillStyle = "#ff5a5a";
      ctx.fillRect(x + w * 0.5 - 1, o.base - hgt - 24, 4, 3);
    }
    if (o.neon && rnd(i + o.seed + 120) < 0.3) {      // glowing billboard
      const bx = x + 4, by = o.base - hgt + hgt * 0.35, col = o.neon[i % o.neon.length];
      const ng = ctx.createRadialGradient(bx + 10, by + 9, 2, bx + 10, by + 9, 34);
      ng.addColorStop(0, col + "99");
      ng.addColorStop(1, col + "00");
      ctx.fillStyle = ng;
      ctx.fillRect(bx - 24, by - 26, 68, 70);
      ctx.fillStyle = col;
      ctx.fillRect(bx, by, 20, 18);
    }
    x += w + (o.gap || 0);
    i++;
  }
}

function warmMist(ctx, y0, y1, a) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, "rgba(255,200,160,0)");
  g.addColorStop(1, `rgba(255,200,160,${a})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, y0, TILE, y1 - y0);
}

let layers = null;

function build(w, h) {
  const L = {};
  L.sky = makeLayer(w, h, (c) => { paintSky(c, w, h); scatterTwinkles(c, w, h, 30, 5, 0.6); });
  L.far = makeLayer(TILE, LAYER_H, (c) => {
    paintSkyline(c, {
      seed: 1, base: 560, minW: 38, maxW: 80, minH: 120, maxH: 300, gap: 4,
      color: "#c9aee8", cell: 9, lit: 0.22, litColor: "#ffe2a0", dimColor: "#7a5f98",
    });
    tokyoTower(c, 1100, 560, 1.15);
    warmMist(c, 420, 570, 0.55);
  });
  L.mid = makeLayer(TILE, LAYER_H, (c) => {
    paintSkyline(c, {
      seed: 7, base: 600, minW: 56, maxW: 120, minH: 170, maxH: 400, gap: 6,
      color: "#9a86d0", cell: 12, lit: 0.5, litColor: "#ffd27a", dimColor: "#7e6cb8",
      neon: ["#ff4f9a", "#35d0ff", "#ffd23a", "#7cff8a"],
    });
    warmMist(c, 500, 610, 0.35);
  });
  L.vignette = makeLayer(w, h, (c) => {
    const v = c.createRadialGradient(w / 2, h / 2, h * 0.45, w / 2, h / 2, w * 0.72);
    v.addColorStop(0, "rgba(30,15,60,0)");
    v.addColorStop(1, "rgba(30,15,60,0.32)");
    c.fillStyle = v;
    c.fillRect(0, 0, w, h);
  });
  return L;
}

function getLayers(w, h) {
  if (!layers) layers = build(w, h);
  return layers;
}

// Copy a skyline layer: scrolled sideways at `fx`, shifted up/down at `fy`.
// dy is 0 when the camera is at street level and grows as it climbs, so the
// skyline sinks away below you.
function blit(ctx, img, w, camX, camY, maxCamY, fx, fy, baseScreenY, layerBase) {
  const dy = (maxCamY - camY) * fy;
  const y = Math.round(baseScreenY - layerBase + dy);   // put the skyline's base at baseScreenY
  const start = -((camX * fx) % TILE);
  for (let ox = Math.round(start) - TILE; ox < w; ox += TILE) ctx.drawImage(img, ox, y);
}

export function drawStreetBackdrop(ctx, w, h, camX, camY, maxCamY) {
  const L = getLayers(w, h);
  ctx.drawImage(L.sky, 0, 0);
  blit(ctx, L.far, w, camX, camY, maxCamY, 0.06, 0.22, 468, 560);
  blit(ctx, L.mid, w, camX, camY, maxCamY, 0.13, 0.4, 480, 600);
}

export function drawStreetVignette(ctx, w, h) {
  ctx.drawImage(getLayers(w, h).vignette, 0, 0);
}

// A few drifting specks (blossom petals and dust in the evening light).
const PETALS = Array.from({ length: 26 }, (_, i) => ({
  x: rnd(i + 1), y: rnd(i + 40), speed: 14 + rnd(i + 80) * 26, drift: 20 + rnd(i + 120) * 30,
  size: 1.6 + rnd(i + 160) * 1.8,
}));

export function drawPetals(ctx, w, h, camX, t) {
  for (const p of PETALS) {
    const x = (((p.x * w + t * p.drift - camX * 0.6) % w) + w) % w;
    const y = (p.y * h + t * p.speed) % h;
    ctx.fillStyle = "rgba(255,190,205,0.85)";
    ctx.beginPath();
    ctx.ellipse(x + Math.sin(t + p.y * 9) * 8, y, p.size * 1.3, p.size * 0.7, t + p.x * 6, 0, Math.PI * 2);
    ctx.fill();
  }
}
