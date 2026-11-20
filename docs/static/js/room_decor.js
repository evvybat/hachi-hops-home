// Level 4's scenery in world space: the inside of Room 707, half unpacked and
// half decorated for the housewarming party. A pastel hearts wallpaper, windows
// with curtains, a Black Stones poster, party bunting and string lights, a
// sofa, bookshelf and plants in the living room, a tiled kitchen with cupboards
// and a fridge, and the entry hall with a shoe rack and "Home Sweet Home" sign.
// Painted ONCE into an offscreen canvas for the whole level (see scenery.js for
// why); no collision here, it's all backdrop.

import { heartPath, sparkle, bow, kawaiiFace, FONT } from "./style.js";

const FLOOR = 480;
const INK = "#8d5e50";

function rnd(i) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function edge(ctx, lw = 2) {
  ctx.strokeStyle = INK;
  ctx.lineWidth = lw;
  ctx.lineJoin = "round";
  ctx.stroke();
}

function text(ctx, str, x, y, size, color) {
  ctx.fillStyle = color;
  ctx.font = `bold ${size}px ${FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(str, x, y);
  ctx.textBaseline = "alphabetic";
}

// ---- Walls --------------------------------------------------------------------------------

function paintWallpaper(ctx, w) {
  const g = ctx.createLinearGradient(0, 0, 0, FLOOR);
  g.addColorStop(0, "#ffdcec");
  g.addColorStop(1, "#ffeef5");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, FLOOR);
  ctx.fillStyle = "rgba(255,255,255,0.45)";                 // soft stripes
  for (let x = 0; x < w; x += 64) ctx.fillRect(x, 0, 32, FLOOR);
  for (let i = 0; i < 300; i++) {                           // hearts and sparkles pattern
    const x = rnd(i) * w, y = rnd(i + 400) * (FLOOR - 40);
    ctx.globalAlpha = 0.5;
    if (i % 3 === 0) { heartPath(ctx, x, y, 3.4 + rnd(i + 9) * 2); ctx.fillStyle = "#ffbfd9"; ctx.fill(); }
    else sparkle(ctx, x, y, 3 + rnd(i + 20) * 3, i % 2 ? "#fff6b8" : "#ffffff");
  }
  ctx.globalAlpha = 1;
  // chair-rail wainscot along the lower wall
  ctx.fillStyle = "#fff5ea";
  ctx.fillRect(0, 400, w, FLOOR - 400);
  ctx.fillStyle = "#ffc2dc";
  ctx.fillRect(0, 396, w, 6);
  ctx.strokeStyle = "rgba(190,120,140,0.4)";
  ctx.lineWidth = 1.6;
  for (let x = 20; x < w; x += 70) { rr(ctx, x, 410, 52, 52, 6); ctx.stroke(); }
  ctx.fillStyle = "#ffffff";                                 // crown moulding
  ctx.fillRect(0, 0, w, 16);
  ctx.fillStyle = "#ffc2dc";
  ctx.fillRect(0, 16, w, 4);
}

function paintWindow(ctx, x, y, w, h) {
  const sky = ctx.createLinearGradient(0, y, 0, y + h);
  sky.addColorStop(0, "#9bb8f0");
  sky.addColorStop(1, "#ffc6a8");
  ctx.fillStyle = sky;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "#fff6c8";                                 // evening sun and stars
  ctx.beginPath();
  ctx.arc(x + w * 0.7, y + h * 0.7, 12, 0, Math.PI * 2);
  ctx.fill();
  sparkle(ctx, x + w * 0.25, y + h * 0.25, 5, "#fff");
  sparkle(ctx, x + w * 0.5, y + h * 0.15, 3.5, "#fff3a8");
  ctx.fillStyle = "rgba(190,150,200,0.6)";                   // city rooftops
  for (let i = 0; i < 5; i++) ctx.fillRect(x + i * (w / 5), y + h - 24 - (i % 3) * 8, w / 5 - 3, 40);
  ctx.strokeStyle = "#fffaf3";                               // frame + cross bars
  ctx.lineWidth = 5;
  ctx.strokeRect(x, y, w, h);
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w / 2, y + h);
  ctx.moveTo(x, y + h / 2); ctx.lineTo(x + w, y + h / 2);
  ctx.stroke();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.2;
  ctx.strokeRect(x - 2.5, y - 2.5, w + 5, h + 5);
  for (const side of [-1, 1]) {                              // pink curtains with tie-backs
    const cx = side < 0 ? x - 8 : x + w + 8;
    ctx.fillStyle = "#ff9cc7";
    ctx.beginPath();
    ctx.moveTo(cx - 12, y - 8); ctx.lineTo(cx + 12, y - 8);
    ctx.quadraticCurveTo(cx + 18 * side, y + h * 0.55, cx + 12 * side, y + h + 10);
    ctx.lineTo(cx - 12 * side, y + h + 10);
    ctx.quadraticCurveTo(cx - 6 * side, y + h * 0.5, cx - 12, y - 8);
    ctx.closePath();
    ctx.fill();
    edge(ctx, 1.8);
    bow(ctx, cx, y + h * 0.55, 0.7, "#fff");
  }
  ctx.fillStyle = "#fffaf3";                                 // sill with a plant
  rr(ctx, x - 12, y + h + 4, w + 24, 8, 3);
  ctx.fill();
  edge(ctx, 1.8);
}

function paintPoster(ctx, x, y, w, h, bg, title, accent) {
  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.fillRect(x + 3, y + 4, w, h);
  ctx.fillStyle = bg;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "#fffaf3";
  ctx.lineWidth = 4;
  ctx.strokeRect(x, y, w, h);
  edge(ctx, 1.6);
  sparkle(ctx, x + w * 0.5, y + h * 0.34, 15, accent);
  text(ctx, title, x + w / 2, y + h * 0.72, 13, accent);
  heartPath(ctx, x + w * 0.5, y + h * 0.9, 4);
  ctx.fillStyle = accent;
  ctx.fill();
}

// ---- Living room: sofa, bookshelf, plant, lamp ------------------------------------------------

function paintSofa(ctx, x) {
  const y = FLOOR;
  ctx.fillStyle = "rgba(150,80,110,0.25)";
  ctx.beginPath();
  ctx.ellipse(x + 62, y, 70, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  rr(ctx, x, y - 66, 124, 52, 14);                           // back
  ctx.fillStyle = "#b8ecd8";
  ctx.fill();
  edge(ctx, 2.2);
  rr(ctx, x - 12, y - 46, 30, 42, 12);                       // arms
  ctx.fill();
  edge(ctx, 2.2);
  rr(ctx, x + 106, y - 46, 30, 42, 12);
  ctx.fill();
  edge(ctx, 2.2);
  rr(ctx, x + 12, y - 34, 100, 28, 10);                      // seat
  ctx.fillStyle = "#cdf5e6";
  ctx.fill();
  edge(ctx, 2.2);
  for (const [px, c] of [[x + 26, "#ff9cc7"], [x + 92, "#fff0a8"]]) {   // cushions
    rr(ctx, px - 14, y - 58, 28, 26, 8);
    ctx.fillStyle = c;
    ctx.fill();
    edge(ctx, 1.8);
    kawaiiFace(ctx, px, y - 45, 0.7);
  }
  ctx.fillStyle = "#d8a07a";
  ctx.fillRect(x + 6, y - 8, 6, 8);
  ctx.fillRect(x + 112, y - 8, 6, 8);
}

function paintBookshelf(ctx, x) {
  const y = FLOOR, w = 96, h = 190;
  ctx.fillStyle = "#f3cfa6";
  rr(ctx, x, y - h, w, h, 6);
  ctx.fill();
  edge(ctx, 2.4);
  const cols = ["#ff8fbf", "#6fd0f0", "#ffd23a", "#b48af0", "#7be0a8", "#ff9a4a"];
  for (let r = 0; r < 4; r++) {
    const sy = y - h + 12 + r * 44;
    ctx.fillStyle = "#e6b88a";
    ctx.fillRect(x + 5, sy + 32, w - 10, 6);
    let bx = x + 9;
    for (let k = 0; k < 7; k++) {
      const bw = 8 + rnd(r * 9 + k) * 6, bh = 22 + rnd(r * 5 + k + 40) * 10;
      ctx.fillStyle = cols[(r + k) % cols.length];
      rr(ctx, bx, sy + 32 - bh, bw, bh, 2);
      ctx.fill();
      edge(ctx, 1.2);
      bx += bw + 1.5;
      if (bx > x + w - 14) break;
    }
  }
  bow(ctx, x + w - 10, y - h + 6, 0.8, "#ff7ab8");
}

function paintPlant(ctx, x, big = 1) {
  const y = FLOOR;
  ctx.fillStyle = "#ffb3d1";
  ctx.beginPath();
  ctx.moveTo(x - 14 * big, y - 28 * big);
  ctx.lineTo(x + 14 * big, y - 28 * big);
  ctx.lineTo(x + 10 * big, y);
  ctx.lineTo(x - 10 * big, y);
  ctx.closePath();
  ctx.fill();
  edge(ctx, 2);
  kawaiiFace(ctx, x, y - 13 * big, 0.8 * big);
  ctx.fillStyle = "#6fcf86";
  for (const [dx, dy, r] of [[-12, -42, 12], [8, -50, 14], [-2, -62, 12], [18, -38, 10]]) {
    ctx.beginPath();
    ctx.ellipse(x + dx * big, y + dy * big, r * big, r * 1.4 * big, dx * 0.03, 0, Math.PI * 2);
    ctx.fill();
    edge(ctx, 1.6);
  }
}

function paintLamp(ctx, x) {
  const y = FLOOR;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y - 110);
  ctx.stroke();
  ctx.strokeStyle = "#ffd0e4";
  ctx.lineWidth = 2.6;
  ctx.stroke();
  const glow = ctx.createRadialGradient(x, y - 120, 4, x, y - 120, 90);
  glow.addColorStop(0, "rgba(255,236,170,0.7)");
  glow.addColorStop(1, "rgba(255,236,170,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(x - 90, y - 210, 180, 180);
  ctx.beginPath();
  ctx.moveTo(x - 22, y - 100); ctx.lineTo(x + 22, y - 100); ctx.lineTo(x + 14, y - 130); ctx.lineTo(x - 14, y - 130);
  ctx.closePath();
  ctx.fillStyle = "#ffe0ef";
  ctx.fill();
  edge(ctx, 2);
  ctx.fillStyle = "#ff8fbf";
  ctx.beginPath();
  ctx.ellipse(x, y, 16, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  edge(ctx, 1.6);
}

// ---- Kitchen backsplash, cupboards, fridge ------------------------------------------------------

function paintKitchen(ctx) {
  const x0 = 900, x1 = 1520;
  ctx.fillStyle = "#e8fbf3";                                 // mint tiles
  ctx.fillRect(x0, 210, x1 - x0, 190);
  ctx.strokeStyle = "rgba(80,170,140,0.35)";
  ctx.lineWidth = 1.2;
  for (let x = x0; x < x1; x += 28) { ctx.beginPath(); ctx.moveTo(x, 210); ctx.lineTo(x, 400); ctx.stroke(); }
  for (let y = 210; y < 400; y += 28) { ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); }
  for (let i = 0; i < 26; i++) {                             // a few heart tiles
    const tx = x0 + 14 + Math.floor(rnd(i) * ((x1 - x0) / 28)) * 28, ty = 224 + Math.floor(rnd(i + 50) * 6) * 28;
    heartPath(ctx, tx, ty, 6);
    ctx.fillStyle = "#ffc2dc";
    ctx.fill();
  }
  // upper cupboards (the teacups fall from the right one)
  for (const [cx, cw] of [[930, 190], [1150, 140], [1300, 130]]) {
    const g = ctx.createLinearGradient(0, 60, 0, 190);
    g.addColorStop(0, "#d4f4e6");
    g.addColorStop(1, "#a5dcc6");
    rr(ctx, cx, 56, cw, 132, 6);
    ctx.fillStyle = g;
    ctx.fill();
    edge(ctx, 2.4);
    const n = Math.max(1, Math.round(cw / 64));
    for (let i = 0; i < n; i++) {
      const dx = cx + 6 + i * ((cw - 12) / n);
      rr(ctx, dx + 2, 66, (cw - 12) / n - 4, 112, 5);
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.fill();
      ctx.strokeStyle = "rgba(60,140,110,0.6)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      heartPath(ctx, dx + ((cw - 12) / n) / 2, 162, 4.2);
      ctx.fillStyle = "#ff8fbf";
      ctx.fill();
    }
  }
  // range hood above the first pot
  ctx.fillStyle = "#fff4f9";
  ctx.beginPath();
  ctx.moveTo(950, 226); ctx.lineTo(1110, 226); ctx.lineTo(1090, 196); ctx.lineTo(970, 196);
  ctx.closePath();
  ctx.fill();
  edge(ctx, 2);
  // fridge
  const fx = 1400, fy = 150, fw = 96, fh = FLOOR - fy;
  const fg = ctx.createLinearGradient(fx, 0, fx + fw, 0);
  fg.addColorStop(0, "#ffe3ef");
  fg.addColorStop(1, "#ffc2dc");
  rr(ctx, fx, fy, fw, fh, 12);
  ctx.fillStyle = fg;
  ctx.fill();
  edge(ctx, 2.6);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(fx, fy + 100); ctx.lineTo(fx + fw, fy + 100);
  ctx.stroke();
  rr(ctx, fx + fw - 18, fy + 22, 7, 56, 3);
  ctx.fillStyle = "#fffaf3";
  ctx.fill();
  edge(ctx, 1.6);
  kawaiiFace(ctx, fx + 40, fy + 56, 1.6);
  for (const [mx, my, c] of [[fx + 16, fy + 130, "#ffd23a"], [fx + 46, fy + 150, "#6fd0f0"], [fx + 24, fy + 180, "#b48af0"]]) {
    heartPath(ctx, mx, my, 7);
    ctx.fillStyle = c;
    ctx.fill();
    edge(ctx, 1.3);
  }
}

// ---- The entry hall: coat hooks, mirror, shoes, sign, welcome mat ---------------------------------------

function paintHall(ctx) {
  // "Home Sweet Home" sign
  ctx.fillStyle = "rgba(0,0,0,0.15)";
  rr(ctx, 2054, 124, 190, 50, 12); ctx.fill();
  rr(ctx, 2050, 120, 190, 50, 12);
  ctx.fillStyle = "#fff6ee";
  ctx.fill();
  edge(ctx, 2.4);
  text(ctx, "Home Sweet Home", 2145, 144, 17, "#e8508a");
  heartPath(ctx, 2064, 145, 5); ctx.fillStyle = "#ff8fbf"; ctx.fill();
  heartPath(ctx, 2226, 145, 5); ctx.fill();
  // coat hooks with pastel coats
  ctx.fillStyle = "#e6b88a";
  rr(ctx, 1760, 150, 150, 12, 5); ctx.fill(); edge(ctx, 1.8);
  for (const [cx, col] of [[1782, "#ff9cc7"], [1822, "#9ad9f5"], [1862, "#fff0a8"], [1898, "#c9b6f5"]]) {
    ctx.fillStyle = col;
    rr(ctx, cx - 14, 162, 28, 74, 8);
    ctx.fill();
    edge(ctx, 1.8);
    heartPath(ctx, cx, 190, 4);
    ctx.fillStyle = "#fff";
    ctx.fill();
  }
  // mirror
  rr(ctx, 1990, 180, 68, 110, 30);
  ctx.fillStyle = "#e8f6ff";
  ctx.fill();
  ctx.strokeStyle = "#ffb3d1";
  ctx.lineWidth = 6;
  ctx.stroke();
  edge(ctx, 2);
  sparkle(ctx, 2012, 210, 8, "#fff");
  sparkle(ctx, 2036, 240, 5, "#fff");
  // shoe rack with cute boots
  rr(ctx, 2290, 420, 130, 60, 6);
  ctx.fillStyle = "#f3cfa6";
  ctx.fill();
  edge(ctx, 2.2);
  ctx.fillStyle = "#e6b88a";
  ctx.fillRect(2296, 448, 118, 5);
  for (const [sx, c] of [[2312, "#ff8fbf"], [2346, "#6fd0f0"], [2380, "#ffd23a"]]) {
    rr(ctx, sx - 12, 428, 24, 18, 6);
    ctx.fillStyle = c;
    ctx.fill();
    edge(ctx, 1.6);
    rr(ctx, sx - 12, 456, 24, 18, 6);
    ctx.fill();
    edge(ctx, 1.6);
  }
  // welcome mat on the floor by the door
  rr(ctx, 2384, FLOOR - 6, 104, 12, 4);
  ctx.fillStyle = "#ffb3d1";
  ctx.fill();
  edge(ctx, 1.6);
  text(ctx, "WELCOME", 2436, FLOOR + 1, 8, "#fff");
  paintPlant(ctx, 1940, 1);
}

// ---- Party decorations ---------------------------------------------------------------------------------------

function bunting(ctx, x0, x1, y, sag, label) {
  ctx.strokeStyle = "rgba(141,94,80,0.8)";
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(x0, y);
  ctx.quadraticCurveTo((x0 + x1) / 2, y + sag * 2, x1, y);
  ctx.stroke();
  const n = label ? label.length : Math.floor((x1 - x0) / 34);
  const cols = ["#ff7ab8", "#ffd23a", "#6fd0f0", "#8aeb6a", "#b48af0", "#ff9a4a"];
  for (let i = 0; i < n; i++) {
    const u = (i + 0.5) / n;
    const x = x0 + (x1 - x0) * u;
    const yy = (1 - u) * (1 - u) * y + 2 * (1 - u) * u * (y + sag) + u * u * y;
    ctx.fillStyle = cols[i % cols.length];
    ctx.beginPath();
    ctx.moveTo(x - 13, yy);
    ctx.lineTo(x + 13, yy);
    ctx.lineTo(x, yy + 30);
    ctx.closePath();
    ctx.fill();
    edge(ctx, 1.5);
    if (label) text(ctx, label[i], x, yy + 9, 12, "#fff");
    else heartPath(ctx, x, yy + 10, 4), (ctx.fillStyle = "#fff"), ctx.fill();
  }
}

function stringLights(ctx, x0, x1, y) {
  ctx.strokeStyle = "rgba(141,94,80,0.7)";
  ctx.lineWidth = 1.4;
  const segs = Math.ceil((x1 - x0) / 120);
  for (let s = 0; s < segs; s++) {
    const a = x0 + s * 120, b = Math.min(x1, a + 120);
    ctx.beginPath();
    ctx.moveTo(a, y);
    ctx.quadraticCurveTo((a + b) / 2, y + 34, b, y);
    ctx.stroke();
    for (let i = 1; i < 6; i++) {
      const u = i / 6, x = a + (b - a) * u, yy = (1 - u) * (1 - u) * y + 2 * (1 - u) * u * (y + 17) + u * u * y;
      const col = ["#ffd23a", "#ff7ab8", "#6fd0f0"][i % 3];
      const g = ctx.createRadialGradient(x, yy + 4, 1, x, yy + 4, 14);
      g.addColorStop(0, col + "99");
      g.addColorStop(1, col + "00");
      ctx.fillStyle = g;
      ctx.fillRect(x - 14, yy - 10, 28, 28);
      sparkle(ctx, x, yy + 4, 5, col);
    }
  }
}

function balloons(ctx, x, y) {
  const cols = ["#ff7ab8", "#6fd0f0", "#ffd23a", "#b48af0", "#8aeb6a"];
  for (let i = 0; i < 5; i++) {
    const bx = x + (i - 2) * 22 + (i % 2) * 8, by = y - 40 - (i % 3) * 18;
    ctx.strokeStyle = "rgba(141,94,80,0.7)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(bx, by + 20);
    ctx.quadraticCurveTo(bx + 6 * (i % 2 ? 1 : -1), (by + y) / 2, x, y);
    ctx.stroke();
    const g = ctx.createRadialGradient(bx - 6, by - 7, 2, bx, by, 24);
    g.addColorStop(0, "#fff");
    g.addColorStop(0.3, cols[i]);
    g.addColorStop(1, cols[i]);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(bx, by, 17, 21, 0, 0, Math.PI * 2);
    ctx.fill();
    edge(ctx, 1.8);
    kawaiiFace(ctx, bx, by + 2, 0.9);
  }
}

// Half-unpacked moving boxes pushed against the back wall (faded: background).
function backBoxes(ctx) {
  const spots = [[90, 28, "BOOKS"], [150, 22, "KITCHEN"], [690, 26, "TOYS"], [1740, 26, "SHOES"], [2260, 24, "COATS"]];
  for (const [x, s, label] of spots) {
    ctx.globalAlpha = 0.9;
    rr(ctx, x - s, FLOOR - s * 1.5, s * 2, s * 1.5, 4);
    ctx.fillStyle = "#e6bf8a";
    ctx.fill();
    edge(ctx, 1.8);
    ctx.fillStyle = "rgba(255,243,214,0.7)";
    ctx.fillRect(x - 5, FLOOR - s * 1.5, 10, s * 1.5);
    text(ctx, label, x, FLOOR - s * 0.7, 8, "#a86a3a");
    ctx.globalAlpha = 1;
  }
}

// ---- Public -----------------------------------------------------------------------------------------------

export function bakeRoomDecor(level) {
  const c = document.createElement("canvas");
  c.width = level.worldWidth;
  c.height = 540;
  const ctx = c.getContext("2d");

  paintWallpaper(ctx, level.worldWidth);
  paintWindow(ctx, 130, 70, 150, 150);
  paintWindow(ctx, 1560, 70, 150, 150);
  paintPoster(ctx, 520, 90, 90, 120, "#2d2640", "BLACK STONES", "#ff8fbf");
  paintPoster(ctx, 640, 100, 70, 96, "#c9e8ff", "KAWAII!", "#e8508a");
  paintKitchen(ctx);
  paintBookshelf(ctx, 720);
  paintSofa(ctx, 20);
  paintLamp(ctx, 212);
  paintPlant(ctx, 460, 1.1);
  paintHall(ctx);
  backBoxes(ctx);
  paintLamp(ctx, 1690);

  bunting(ctx, 40, 500, 26, 22, "HOUSEWARMING");
  bunting(ctx, 760, 1300, 26, 24, null);
  bunting(ctx, 1560, 2060, 26, 22, null);
  stringLights(ctx, 300, 740, 238);
  stringLights(ctx, 1520, 2300, 70);
  balloons(ctx, 26, FLOOR - 6);
  balloons(ctx, 1380, FLOOR - 6);
  balloons(ctx, 2480, FLOOR - 6);
  return c;
}
