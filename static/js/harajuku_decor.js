// Level 3's street scenery in world space: the Takeshita Street arch, boutiques
// with mannequins in the windows, strings of pennant flags, subway stairwells
// (the gaps), the Shibuya scramble with giant screens, and the shopping-mall
// facade with its balconies. Painted ONCE into an offscreen canvas for the
// whole level; each frame copies the visible slice. All backdrop, no collision.

import { drawChibiGirl, GIRLS } from "./people.js";

const GROUND = 480;
const GAPS = [[640, 840], [1360, 1560], [2520, 2640], [3040, 3240]];

function rnd(i) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const PASTELS = ["#ffc2d9", "#bfe5f7", "#fff0a8", "#d8c8f5", "#bff0d6", "#ffd2b0"];

function text(ctx, str, x, y, size, color) {
  ctx.fillStyle = color;
  ctx.font = `bold ${size}px 'Fredoka','Baloo 2',system-ui,sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(str, x, y);
  ctx.textBaseline = "alphabetic";
}

function windowRows(ctx, x, y, w, h, seed) {
  const cols = Math.max(1, Math.floor((w - 10) / 34));
  const offX = x + (w - cols * 34) / 2 + 6;
  for (let row = 0; y + 10 + row * 50 + 30 < y + h; row++) {
    for (let col = 0; col < cols; col++) {
      const wx = offX + col * 34, wy = y + 10 + row * 50;
      const g = ctx.createLinearGradient(0, wy, 0, wy + 30);
      g.addColorStop(0, rnd(seed + row * 3 + col) < 0.55 ? "#fff6c8" : "#cfe6fb");
      g.addColorStop(1, rnd(seed + row * 3 + col) < 0.55 ? "#ffdf8e" : "#9cc3ea");
      ctx.fillStyle = g;
      ctx.fillRect(wx, wy, 22, 30);
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.strokeRect(wx, wy, 22, 30);
    }
  }
}

// A mannequin in a coloured dress.
function mannequin(ctx, x, y, color, hair) {
  ctx.fillStyle = "#f3d9c8";
  ctx.beginPath();
  ctx.arc(x, y - 44, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = hair;
  ctx.beginPath();
  ctx.arc(x, y - 46, 6.5, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x - 6, y - 38);
  ctx.lineTo(x + 6, y - 38);
  ctx.lineTo(x + 15, y - 6);
  ctx.lineTo(x - 15, y - 6);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#6a5a6a";
  ctx.fillRect(x - 1.5, y - 6, 3, 10);
  ctx.fillRect(x - 9, y + 3, 18, 3);
}

function pit(ctx, x0, x1) {
  const g = ctx.createLinearGradient(0, GROUND, 0, 540);
  g.addColorStop(0, "#2d2a3a");
  g.addColorStop(1, "#110f1a");
  ctx.fillStyle = g;
  ctx.fillRect(x0, GROUND, x1 - x0, 60);
  ctx.strokeStyle = "#6a6380";                       // subway stairs going down
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let s = 0; s < 6; s++) {
    ctx.moveTo(x0 + 6 + s * 8, GROUND + 6 + s * 9);
    ctx.lineTo(x0 + 6 + s * 8 + 10, GROUND + 6 + s * 9);
  }
  ctx.stroke();
  ctx.fillStyle = "rgba(120,200,255,0.18)";          // glow from the station below
  ctx.fillRect(x0, 520, x1 - x0, 20);
}

// ---- Takeshita Street shops (x 340-1360) ---------------------------------------------------

const SHOPS = [
  { x: 330, w: 190, top: 340, wall: "#ffc2d9", name: "KAWAII", awn: "#ff5fa2", dress: "#ff7ab8" },
  { x: 520, w: 120, top: 380, wall: "#fff0a8", name: "CREPES", awn: "#f2a03c", dress: "#ffffff" },
  { x: 840, w: 190, top: 350, wall: "#d8c8f5", name: "LOLITA", awn: "#8a5fd6", dress: "#b48af0" },
  { x: 1030, w: 180, top: 330, wall: "#bfe5f7", name: "GYARU", awn: "#27a7d8", dress: "#ff6a8a" },
  { x: 1210, w: 150, top: 370, wall: "#bff0d6", name: "TOKYO", awn: "#2fb27a", dress: "#fff17a" },
  // The calm stretch at the end of the street, where Nana waits.
  { x: 3440, w: 200, top: 350, wall: "#ffd8e8", name: "CAFE", awn: "#ff5fa2", dress: "#ffffff" },
  { x: 3660, w: 220, top: 330, wall: "#d8c8f5", name: "SWEETS", awn: "#8a5fd6", dress: "#ff9ccb" },
];

function paintShop(ctx, s, i) {
  ctx.fillStyle = s.wall;
  ctx.fillRect(s.x, s.top, s.w, GROUND - s.top);
  ctx.fillStyle = "rgba(90,50,110,0.14)";
  ctx.fillRect(s.x + s.w * 0.84, s.top, s.w * 0.16, GROUND - s.top);
  ctx.fillStyle = "rgba(255,255,255,0.4)";                  // roof lip
  ctx.fillRect(s.x - 3, s.top, s.w + 6, 6);

  // upper windows
  windowRows(ctx, s.x, s.top + 8, s.w, 70, 10 + i * 9);

  // sign
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.fillRect(s.x + 11, s.top + 91, s.w - 16, 30);
  ctx.fillStyle = s.awn;
  ctx.fillRect(s.x + 8, s.top + 88, s.w - 16, 30);
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.strokeRect(s.x + 10, s.top + 90, s.w - 20, 26);
  text(ctx, s.name, s.x + s.w / 2, s.top + 104, 16, "#fff");

  // striped awning over the shop window
  const ay = s.top + 122;
  for (let k = 0; k < Math.ceil((s.w - 12) / 14); k++) {
    ctx.fillStyle = k % 2 ? "#ffffff" : s.awn;
    ctx.fillRect(s.x + 6 + k * 14, ay, 14, 12);
    ctx.beginPath();
    ctx.arc(s.x + 13 + k * 14, ay + 12, 7, 0, Math.PI);
    ctx.fill();
  }

  // big display window with mannequins
  const wy = ay + 22, wh = GROUND - wy - 6;
  const glass = ctx.createLinearGradient(0, wy, 0, wy + wh);
  glass.addColorStop(0, "#fff6e0");
  glass.addColorStop(1, "#ffd9ef");
  ctx.fillStyle = glass;
  ctx.fillRect(s.x + 10, wy, s.w - 20, wh);
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 3;
  ctx.strokeRect(s.x + 10, wy, s.w - 20, wh);
  const n = Math.max(2, Math.floor((s.w - 30) / 42));
  for (let m = 0; m < n; m++) {
    const mx = s.x + 10 + (s.w - 20) * ((m + 0.5) / n);
    mannequin(ctx, mx, GROUND - 8, m % 2 ? s.dress : PASTELS[(i + m) % PASTELS.length], m % 2 ? "#3a2a3a" : "#c98a52");
  }
  ctx.fillStyle = "rgba(255,255,255,0.35)";                 // window glare
  ctx.beginPath();
  ctx.moveTo(s.x + 16, wy);
  ctx.lineTo(s.x + 40, wy);
  ctx.lineTo(s.x + 16, wy + 50);
  ctx.closePath();
  ctx.fill();
}

// A string of triangular pennant flags between two points.
function pennants(ctx, x0, y0, x1, y1, sag) {
  const n = Math.floor((x1 - x0) / 22);
  ctx.strokeStyle = "rgba(60,40,80,0.7)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.quadraticCurveTo((x0 + x1) / 2, Math.max(y0, y1) + sag * 2, x1, y1);
  ctx.stroke();
  const cols = ["#ff5fa2", "#ffd23a", "#35c8f0", "#8aeb6a", "#b48af0", "#ff9a4a"];
  for (let i = 1; i < n; i++) {
    const u = i / n;
    const x = x0 + (x1 - x0) * u;
    const y = (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * (Math.max(y0, y1) + sag) + u * u * y1;
    ctx.fillStyle = cols[i % cols.length];
    ctx.beginPath();
    ctx.moveTo(x - 7, y + 1);
    ctx.lineTo(x + 7, y + 1);
    ctx.lineTo(x, y + 18);
    ctx.closePath();
    ctx.fill();
  }
}

function paintArch(ctx) {
  for (const px of [40, 300]) {
    const g = ctx.createLinearGradient(px, 0, px + 24, 0);
    g.addColorStop(0, "#ff9ac2");
    g.addColorStop(0.5, "#ffe3ee");
    g.addColorStop(1, "#e87aa6");
    ctx.fillStyle = g;
    ctx.fillRect(px, 150, 24, GROUND - 150);
    ctx.fillStyle = "#fff";
    for (let y = 190; y < GROUND - 20; y += 46) {
      ctx.beginPath();
      ctx.arc(px + 12, y, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.fillRect(38, 100, 300, 50);
  const sg = ctx.createLinearGradient(30, 0, 340, 0);
  sg.addColorStop(0, "#ff5fa2");
  sg.addColorStop(0.5, "#8a5fd6");
  sg.addColorStop(1, "#27a7d8");
  ctx.fillStyle = sg;
  ctx.fillRect(34, 96, 300, 50);
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 3;
  ctx.strokeRect(38, 100, 292, 42);
  text(ctx, "TAKESHITA STREET", 184, 122, 22, "#fff");
  ctx.fillStyle = "#ffe85a";                                  // little star lights
  for (let x = 50; x < 330; x += 28) {
    ctx.beginPath();
    ctx.arc(x, 150, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ---- Shibuya scramble: tall screens and the 109 tower -----------------------------------------

function screenTower(ctx, x, w, top, hue, label) {
  ctx.fillStyle = "#cfc4ee";
  ctx.fillRect(x, top, w, GROUND - top);
  ctx.fillStyle = "rgba(255,255,255,0.22)";
  ctx.fillRect(x, top, 8, GROUND - top);
  windowRows(ctx, x, top + 160, w, GROUND - top - 170, hue);
  const glow = ctx.createRadialGradient(x + w / 2, top + 70, 4, x + w / 2, top + 70, w);
  glow.addColorStop(0, `hsla(${hue},95%,70%,0.5)`);
  glow.addColorStop(1, `hsla(${hue},95%,70%,0)`);
  ctx.fillStyle = glow;
  ctx.fillRect(x - 40, top - 40, w + 80, 220);
  ctx.fillStyle = "#1d1830";
  ctx.fillRect(x + 8, top + 14, w - 16, 130);
  const g = ctx.createLinearGradient(x, top, x + w, top + 140);
  g.addColorStop(0, `hsl(${hue},95%,62%)`);
  g.addColorStop(1, `hsl(${(hue + 70) % 360},95%,66%)`);
  ctx.fillStyle = g;
  ctx.fillRect(x + 12, top + 18, w - 24, 122);
  text(ctx, label, x + w / 2, top + 66, 24, "#fff");
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillRect(x + 28, top + 94, w - 56, 4);
  ctx.fillRect(x + 28, top + 108, (w - 56) * 0.6, 4);
}

function paintScramble(ctx) {
  screenTower(ctx, 1590, 190, 150, 330, "SHIBUYA");
  screenTower(ctx, 2250, 210, 130, 190, "NEW!");
  screenTower(ctx, 2020, 190, 210, 50, "SALE");
  // the real 109 style tower in front
  const cx = 1870, top = 200, w = 130;
  const g = ctx.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
  g.addColorStop(0, "#ffa8c4");
  g.addColorStop(0.45, "#fff0f5");
  g.addColorStop(1, "#e684a4");
  ctx.fillStyle = g;
  ctx.fillRect(cx - w / 2, top, w, GROUND - top);
  ctx.beginPath();
  ctx.ellipse(cx, top, w / 2, 10, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#ffd0e0";
  ctx.fill();
  for (let y = top + 22; y < GROUND - 60; y += 26) {
    ctx.fillStyle = "rgba(120,170,220,0.75)";
    ctx.fillRect(cx - w / 2 + 6, y, w - 12, 14);
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillRect(cx - w / 2 + 10, y + 1, 12, 12);
  }
  ctx.fillStyle = "#e02a4a";
  ctx.fillRect(cx - 44, top - 44, 88, 44);
  text(ctx, "109", cx, top - 22, 34, "#fff");
}

// ---- The mall with the balconies you can reach by lift (x 2640-3400) --------------------------------

function paintMall(ctx) {
  const x = 2660, w = 760, top = 180;
  const wall = ctx.createLinearGradient(x, 0, x + w, 0);
  wall.addColorStop(0, "#ffd0e2");
  wall.addColorStop(1, "#f6b6d0");
  ctx.fillStyle = wall;
  ctx.fillRect(x, top, w, GROUND - top);
  ctx.fillStyle = "#ff5fa2";
  ctx.fillRect(x - 6, top - 10, w + 12, 14);
  text(ctx, "SHIBUYA FASHION MALL", x + w / 2, top - 38, 28, "#e02a7a");
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.fillRect(x + w / 2 - 170, top - 62, 340, 4);

  // rows of glass shopfronts with mannequins on every storey
  const floors = [top + 24, top + 118, top + 212];
  floors.forEach((fy, r) => {
    for (let k = 0; k < 6; k++) {
      const wx = x + 18 + k * 122;
      const g = ctx.createLinearGradient(0, fy, 0, fy + 74);
      g.addColorStop(0, "#fff6e0");
      g.addColorStop(1, "#ffd9ef");
      ctx.fillStyle = g;
      ctx.fillRect(wx, fy, 108, 74);
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 3;
      ctx.strokeRect(wx, fy, 108, 74);
      mannequin(ctx, wx + 34, fy + 70, PASTELS[(r + k) % PASTELS.length], "#3a2a3a");
      mannequin(ctx, wx + 78, fy + 70, PASTELS[(r + k + 2) % PASTELS.length], "#c98a52");
    }
  });
  // big heart "SALE" posters
  for (const px of [x + 30, x + w - 80]) {
    ctx.fillStyle = "#e02a4a";
    ctx.beginPath();
    ctx.arc(px + 25, GROUND - 62, 28, 0, Math.PI * 2);
    ctx.fill();
    text(ctx, "SALE", px + 25, GROUND - 62, 13, "#fff");
  }
  // glass entrance doors on the ground floor
  ctx.fillStyle = "#3b3050";
  ctx.fillRect(x + w / 2 - 50, GROUND - 90, 100, 90);
  ctx.fillStyle = "#ffe9c0";
  ctx.fillRect(x + w / 2 - 44, GROUND - 84, 88, 84);
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.fillRect(x + w / 2 - 38, GROUND - 78, 10, 70);
}

// ---- Faint crowds of shoppers in the background (clearly not the hazards) -----------------------

function backgroundCrowd(ctx, worldWidth) {
  for (let i = 0; i < Math.floor(worldWidth / 88); i++) {
    const x = 30 + i * 88 + rnd(i) * 40;
    if (GAPS.some(([a, b]) => x > a - 24 && x < b + 24)) continue;
    const dir = rnd(i + 5) < 0.5 ? -1 : 1;
    ctx.save();
    ctx.globalAlpha = 0.62;                       // faded so they read as background, not hazards
    ctx.translate(x, GROUND - 2);
    ctx.scale(0.74 * dir, 0.74);
    drawChibiGirl(ctx, GIRLS[(i * 3 + 1) % GIRLS.length], { walking: false, t: i * 1.7, phase: i });
    ctx.restore();
  }
}

// ---- Public ---------------------------------------------------------------------------------------------

export function bakeHarajukuDecor(level) {
  const c = document.createElement("canvas");
  c.width = level.worldWidth;
  c.height = 540;
  const ctx = c.getContext("2d");

  // A taller, hazier row of buildings behind everything for depth.
  for (let i = 0; i < Math.ceil((level.worldWidth + 40) / 210); i++) {
    const x = i * 210 - 40, w = 170 + rnd(i) * 70, top = 120 + rnd(i + 40) * 160;
    ctx.fillStyle = PASTELS[i % PASTELS.length];
    ctx.fillRect(x, top, w, GROUND - top);
    windowRows(ctx, x, top + 6, w, GROUND - top - 60, 60 + i);
    ctx.fillStyle = "rgba(255,235,248,0.45)";           // haze to push it back
    ctx.fillRect(x, top, w, GROUND - top);
  }

  paintScramble(ctx);
  paintMall(ctx);
  SHOPS.forEach((s, i) => paintShop(ctx, s, i));
  paintArch(ctx);
  backgroundCrowd(ctx, level.worldWidth);
  for (const [a, b] of GAPS) pit(ctx, a, b);

  pennants(ctx, 340, 262, 830, 262, 26);
  pennants(ctx, 830, 262, 1370, 262, 28);
  pennants(ctx, 2660, 120, 3420, 120, 30);
  pennants(ctx, 3420, 120, 3880, 150, 18);
  return c;
}
