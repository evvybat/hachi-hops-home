// The train station around the player: roof canopy, steel pillars, hanging
// lamps, signs, a clock, a vending machine, a bench and a bin.
// All of this is background decoration (no collision), drawn in world space
// behind the platforms, so you can see it scroll past as Hachi runs.

import { kawaiiFace, bow } from "./style.js";

const FLOOR_Y = 480;
const CANOPY_H = 44;

// Pillars stand only on solid floor (never over a gap).
const PILLARS = [190, 900, 1330, 1620, 2050, 2230, 2440];
const LAMPS = [120, 480, 840, 1200, 1560, 1920, 2280, 2640];

const SIGNS = [
  { x: 300, text: "PLATFORM 1", bg: "#1f5fa8", w: 128 },
  { x: 1180, text: "TOKYO  →", bg: "#2f8a5a", w: 118 },
  { x: 2450, text: "SHINKANSEN →", bg: "#1f5fa8", w: 158 },
];

// ---- Canopy ---------------------------------------------------------------

function drawCanopy(ctx, x0, x1) {
  const g = ctx.createLinearGradient(0, 0, 0, CANOPY_H);
  g.addColorStop(0, "#a69fcc");
  g.addColorStop(1, "#c9c3e6");
  ctx.fillStyle = g;
  ctx.fillRect(x0, 0, x1 - x0, CANOPY_H);

  ctx.fillStyle = "#8f88b8";                        // roof beams
  for (let x = Math.floor(x0 / 90) * 90; x < x1; x += 90) ctx.fillRect(x, 0, 7, CANOPY_H);
  ctx.fillStyle = "rgba(255,255,255,0.07)";
  for (let x = Math.floor(x0 / 90) * 90; x < x1; x += 90) ctx.fillRect(x + 1, 0, 2, CANOPY_H);

  ctx.fillStyle = "#b6b0d8";                        // steel fascia beam
  ctx.fillRect(x0, CANOPY_H - 6, x1 - x0, 8);
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.fillRect(x0, CANOPY_H - 6, x1 - x0, 1.5);

  // Icicles hanging from the roof edge.
  for (let x = Math.floor(x0 / 26) * 26; x < x1; x += 26) {
    const len = 7 + ((Math.abs(x) * 13) % 17);
    const ig = ctx.createLinearGradient(0, CANOPY_H + 2, 0, CANOPY_H + 2 + len);
    ig.addColorStop(0, "rgba(235,248,255,0.95)");
    ig.addColorStop(1, "rgba(150,205,235,0.75)");
    ctx.fillStyle = ig;
    ctx.beginPath();
    ctx.moveTo(x, CANOPY_H + 2);
    ctx.lineTo(x + 6, CANOPY_H + 2);
    ctx.lineTo(x + 3, CANOPY_H + 2 + len);
    ctx.closePath();
    ctx.fill();
  }
}

// ---- Lamps (hang from the canopy, with a faint cone of light) ---------------------

function drawLamps(ctx, x0, x1, t) {
  for (const lx of LAMPS) {
    if (lx < x0 - 120 || lx > x1 + 120) continue;
    const flicker = 1;

    const cone = ctx.createLinearGradient(0, 66, 0, FLOOR_Y);
    cone.addColorStop(0, "rgba(255,232,170,0.2)");
    cone.addColorStop(1, "rgba(255,232,170,0)");
    ctx.fillStyle = cone;
    ctx.beginPath();
    ctx.moveTo(lx - 7, 66);
    ctx.lineTo(lx + 7, 66);
    ctx.lineTo(lx + 85, FLOOR_Y);
    ctx.lineTo(lx - 85, FLOOR_Y);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#20242c";                    // cord
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(lx, CANOPY_H + 4);
    ctx.lineTo(lx, 58);
    ctx.stroke();

    const glow = ctx.createRadialGradient(lx, 70, 2, lx, 70, 70 * flicker);
    glow.addColorStop(0, "rgba(255,226,150,0.65)");
    glow.addColorStop(1, "rgba(255,226,150,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(lx - 75, 0, 150, 150);

    ctx.fillStyle = "#8a84ac";                      // shade
    ctx.beginPath();
    ctx.moveTo(lx - 12, 66);
    ctx.quadraticCurveTo(lx - 10, 54, lx, 54);
    ctx.quadraticCurveTo(lx + 10, 54, lx + 12, 66);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#fff3c4";                      // bulb
    ctx.beginPath();
    ctx.ellipse(lx, 67, 5, 3.4, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ---- Pillars and clock ---------------------------------------------------------------

function drawPillar(ctx, cx) {
  const g = ctx.createLinearGradient(cx - 8, 0, cx + 8, 0);
  g.addColorStop(0, "#9d97c2");
  g.addColorStop(0.45, "#d8d3ef");
  g.addColorStop(1, "#9d97c2");
  ctx.fillStyle = g;
  ctx.fillRect(cx - 8, CANOPY_H, 16, FLOOR_Y - CANOPY_H);

  ctx.fillStyle = "rgba(0,0,0,0.25)";               // rivet bands
  for (let y = 120; y < FLOOR_Y - 20; y += 90) ctx.fillRect(cx - 8, y, 16, 2);

  ctx.fillStyle = "#8f88b8";                        // roof brackets
  ctx.beginPath();
  ctx.moveTo(cx - 8, CANOPY_H + 26);
  ctx.lineTo(cx - 28, CANOPY_H);
  ctx.lineTo(cx - 8, CANOPY_H);
  ctx.closePath();
  ctx.moveTo(cx + 8, CANOPY_H + 26);
  ctx.lineTo(cx + 28, CANOPY_H);
  ctx.lineTo(cx + 8, CANOPY_H);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#8a84ae";                        // base plate
  ctx.fillRect(cx - 12, FLOOR_Y - 18, 24, 18);
  ctx.fillStyle = "#f8fbfd";                        // snow drift against the base
  ctx.beginPath();
  ctx.ellipse(cx, FLOOR_Y, 24, 7, 0, Math.PI, 0);
  ctx.fill();
  kawaiiFace(ctx, cx, 330, 1.6, "sleepy");           // every pillar is a sleepy little totem
  bow(ctx, cx, 205, 1.5, "#ff9cc7");
}

function drawClock(ctx, cx, cy) {
  ctx.fillStyle = "#8a84ae";
  ctx.fillRect(cx - 3, cy - 24, 6, 10);
  const r = 17;
  ctx.fillStyle = "#8d5e50";
  ctx.beginPath();
  ctx.arc(cx, cy, r + 3, 0, Math.PI * 2);
  ctx.fill();
  const face = ctx.createRadialGradient(cx - 4, cy - 5, 2, cx, cy, r);
  face.addColorStop(0, "#ffffff");
  face.addColorStop(1, "#dfe6ec");
  ctx.fillStyle = face;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#8d5e50";
  ctx.lineWidth = 1.4;
  for (let i = 0; i < 12; i++) {                    // hour ticks
    const a = (i / 12) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * (r - 4), cy + Math.sin(a) * (r - 4));
    ctx.lineTo(cx + Math.cos(a) * (r - 1.5), cy + Math.sin(a) * (r - 1.5));
    ctx.stroke();
  }
}

// The clock hands show the real time, so they're drawn live each frame.
function drawClockHands(ctx, cx, cy) {
  const r = 17;
  const now = new Date();
  const s = now.getSeconds(), m = now.getMinutes() + s / 60, hr = (now.getHours() % 12) + m / 60;
  const hand = (angle, len, lw, color) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = lw;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.sin(angle) * len, cy - Math.cos(angle) * len);
    ctx.stroke();
  };
  hand((hr / 12) * Math.PI * 2, r * 0.5, 2.2, "#8d5e50");
  hand((m / 60) * Math.PI * 2, r * 0.78, 1.6, "#8d5e50");
  hand((s / 60) * Math.PI * 2, r * 0.85, 1, "#d63a48");
}

// ---- Hanging signs -------------------------------------------------------------------------

function drawSign(ctx, s) {
  const top = 66, h = 26;
  ctx.strokeStyle = "#20242c";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(s.x + 14, CANOPY_H + 4);
  ctx.lineTo(s.x + 14, top);
  ctx.moveTo(s.x + s.w - 14, CANOPY_H + 4);
  ctx.lineTo(s.x + s.w - 14, top);
  ctx.stroke();

  ctx.fillStyle = "rgba(0,0,0,0.25)";               // soft drop shadow
  ctx.fillRect(s.x + 3, top + 3, s.w, h);
  ctx.fillStyle = s.bg;
  ctx.fillRect(s.x, top, s.w, h);
  ctx.strokeStyle = "#f4f8fb";                      // white border
  ctx.lineWidth = 1.6;
  ctx.strokeRect(s.x + 2.5, top + 2.5, s.w - 5, h - 5);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 14px 'Fredoka','Baloo 2',system-ui,sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(s.text, s.x + s.w / 2, top + h / 2 + 1);
  ctx.textBaseline = "alphabetic";
}

// ---- Street furniture (in front of the haze, so it stays crisp) ---------------------------------

function drawVending(ctx, x) {
  const y = FLOOR_Y - 74, w = 42, h = 74;
  const glow = ctx.createRadialGradient(x + w / 2, y + 30, 4, x + w / 2, y + 30, 70);
  glow.addColorStop(0, "rgba(255,255,255,0.35)");
  glow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(x - 40, y - 30, w + 80, h + 60);

  ctx.fillStyle = "#d9363e";
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 3);
  ctx.fill();
  ctx.strokeStyle = "#8d5e50";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#1c2a3a";                        // lit window
  ctx.fillRect(x + 4, y + 6, w - 14, 46);
  const cans = ["#f2c14e", "#4aa3df", "#e8e8e8", "#8bc34a", "#e57aa0", "#ff9a3c"];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 4; c++) {
      ctx.fillStyle = cans[(r * 4 + c) % cans.length];
      ctx.fillRect(x + 6 + c * 6.5, y + 9 + r * 14, 4.6, 10);
    }
  }
  ctx.fillStyle = "#ffe08a";                        // button panel
  ctx.fillRect(x + w - 8, y + 8, 4, 30);
  ctx.fillStyle = "#14181f";                        // dispense slot
  ctx.fillRect(x + 6, y + h - 16, w - 12, 9);
  ctx.fillStyle = "#f8fbfd";                        // snow on top
  ctx.beginPath();
  ctx.roundRect(x - 1, y - 4, w + 2, 6, 3);
  ctx.fill();
}

function drawBench(ctx, x) {
  const y = FLOOR_Y;
  ctx.fillStyle = "rgba(10,20,40,0.25)";
  ctx.beginPath();
  ctx.ellipse(x + 34, y, 38, 3.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#8f88b8";                        // legs
  ctx.fillRect(x + 5, y - 17, 4, 17);
  ctx.fillRect(x + 59, y - 17, 4, 17);
  const wood = ctx.createLinearGradient(0, y - 20, 0, y - 14);
  wood.addColorStop(0, "#b48a64");
  wood.addColorStop(1, "#7b5b40");
  ctx.fillStyle = wood;                             // seat and backrest
  ctx.fillRect(x, y - 20, 68, 5);
  ctx.fillRect(x + 2, y - 36, 64, 4.5);
  ctx.fillRect(x + 2, y - 29, 64, 4.5);
  ctx.fillStyle = "#8f88b8";
  ctx.fillRect(x + 6, y - 36, 3, 17);
  ctx.fillRect(x + 59, y - 36, 3, 17);
  ctx.fillStyle = "#f8fbfd";                        // snow on the seat and backrest
  ctx.beginPath();
  ctx.roundRect(x - 1, y - 24, 70, 5, 2.5);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(x + 1, y - 39.5, 66, 4, 2);
  ctx.fill();
}

function drawBin(ctx, x) {
  const y = FLOOR_Y;
  ctx.fillStyle = "rgba(10,20,40,0.25)";
  ctx.beginPath();
  ctx.ellipse(x + 11, y, 15, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#3f7a58";
  ctx.beginPath();
  ctx.roundRect(x, y - 28, 22, 28, 3);
  ctx.fill();
  ctx.strokeStyle = "#8d5e50";
  ctx.lineWidth = 1.8;
  ctx.stroke();
  ctx.fillStyle = "#14181f";
  ctx.fillRect(x + 5, y - 22, 12, 3);
  kawaiiFace(ctx, x + 11, y - 12, 0.85, "happy");     // a friendly little bin
  ctx.fillStyle = "#f8fbfd";
  ctx.beginPath();
  ctx.roundRect(x - 1, y - 32, 24, 6, 3);
  ctx.fill();
}

// ---- Public ------------------------------------------------------------------------------------

// Paints the whole station strip for x0..x1 (called once, see bakeStationDecor).
function paintDecor(ctx, x0, x1, t) {
  drawCanopy(ctx, x0, x1);
  drawLamps(ctx, x0, x1, t);
  for (const s of SIGNS) if (s.x + s.w > x0 && s.x < x1) drawSign(ctx, s);
  for (const px of PILLARS) if (px > x0 - 40 && px < x1 + 40) drawPillar(ctx, px);
  if (900 > x0 && 900 < x1) drawClock(ctx, 900, 118);

  // Light blue haze pushes everything above back into the scene.
  ctx.fillStyle = "rgba(205,222,236,0.16)";
  ctx.fillRect(x0, 0, x1 - x0, FLOOR_Y);

  if (120 > x0 - 60 && 120 < x1) drawVending(ctx, 120);
  if (1230 > x0 - 80 && 1230 < x1) drawBench(ctx, 1230);
  if (2400 > x0 - 40 && 2400 < x1) drawBin(ctx, 2400);
}

// The station never changes, so paint it ONCE for the whole level into an
// offscreen canvas. Each frame then only copies the visible slice.
export function bakeStationDecor(worldWidth) {
  const c = document.createElement("canvas");
  c.width = worldWidth;
  c.height = FLOOR_Y + 8;
  paintDecor(c.getContext("2d"), -60, worldWidth + 60, 0);
  return c;
}

export function drawStationDecor(ctx, baked, cameraX, w, t) {
  const sx = Math.floor(cameraX);
  ctx.drawImage(baked, sx, 0, w, baked.height, sx, 0, w, baked.height);
  if (sx < 900 + 40 && sx + w > 900 - 40) drawClockHands(ctx, 900, 118);
}
