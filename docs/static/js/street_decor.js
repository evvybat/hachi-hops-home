// Level 2's scenery in world space: the shopping street (cafe, bookshop,
// ramen bar, 24h mart), storm drains, utility poles with wires, street lamps,
// and the apartment block that Hachi climbs, with its top-floor corridor.
// Painted ONCE for the whole level into an offscreen canvas; each frame only
// copies the part that is on screen. No collision here, it's all backdrop.

import { heartPath, kawaiiFace } from "./style.js";

const GROUND = 900;

function rnd(i) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

// ---- Shared bits ---------------------------------------------------------------

// A grid of windows. `lit` windows glow warm, others reflect the dusk sky.
function windowGrid(ctx, x, y, w, h, o) {
  const cols = Math.max(1, Math.floor((w - 10) / o.stepX));
  const offX = x + (w - cols * o.stepX) / 2 + (o.stepX - o.winW) / 2;
  for (let row = 0; y + 12 + row * o.stepY + o.winH < y + h; row++) {
    for (let col = 0; col < cols; col++) {
      const wx = offX + col * o.stepX, wy = y + 12 + row * o.stepY;
      if (o.skip && o.skip(wx, wy)) continue;
      const lit = rnd(o.seed + row * 13 + col * 7 + x) < o.litChance;
      if (lit) {
        const g = ctx.createLinearGradient(0, wy, 0, wy + o.winH);
        g.addColorStop(0, "#ffe6a8");
        g.addColorStop(1, "#ffbf6a");
        ctx.fillStyle = g;
      } else {
        const g = ctx.createLinearGradient(0, wy, 0, wy + o.winH);
        g.addColorStop(0, "#6f7fb0");
        g.addColorStop(1, "#3c4a78");
        ctx.fillStyle = g;
      }
      ctx.fillRect(wx, wy, o.winW, o.winH);
      if (lit && rnd(o.seed + row + col * 3 + x) < 0.4) {   // curtain
        ctx.fillStyle = "rgba(255,255,255,0.45)";
        ctx.fillRect(wx, wy, o.winW * 0.32, o.winH);
        ctx.fillRect(wx + o.winW * 0.68, wy, o.winW * 0.32, o.winH);
      }
      ctx.strokeStyle = "#f4efe4";                          // frame
      ctx.lineWidth = 2;
      ctx.strokeRect(wx, wy, o.winW, o.winH);
      ctx.beginPath();
      ctx.moveTo(wx + o.winW / 2, wy);
      ctx.lineTo(wx + o.winW / 2, wy + o.winH);
      ctx.stroke();
      ctx.fillStyle = "#e9e3d6";                            // sill
      ctx.fillRect(wx - 3, wy + o.winH, o.winW + 6, 3);
      if (!lit && rnd(o.seed + row * 5 + col + x) < 0.25) { // air conditioner under the window
        ctx.fillStyle = "#c9ced6";
        ctx.fillRect(wx + 3, wy + o.winH + 3, o.winW - 6, 8);
        ctx.fillStyle = "#8d95a0";
        ctx.fillRect(wx + 5, wy + o.winH + 6, o.winW - 10, 2);
      }
    }
  }
}

function sign(ctx, x, y, w, h, text, bg) {
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.fillRect(x + 2, y + 3, w, h);
  ctx.fillStyle = bg;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "rgba(255,255,255,0.85)";
  ctx.lineWidth = 1.6;
  ctx.strokeRect(x + 2.5, y + 2.5, w - 5, h - 5);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 15px 'Fredoka','Baloo 2',system-ui,sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + w / 2, y + h / 2 + 1);
  for (const hx of [x + 11, x + w - 11]) {            // a little heart at each end of every sign
    heartPath(ctx, hx, y + h / 2, 3.6);
    ctx.fillStyle = "#ffd0e4";
    ctx.fill();
  }
  ctx.textBaseline = "alphabetic";
}

// ---- Shopping street ---------------------------------------------------------------

const BUILDINGS = [
  { x: 0, w: 130, top: 520, wall: "#e8c9b0", kind: "apt" },
  { x: 130, w: 170, top: 700, wall: "#f3e2c0", kind: "shop", sign: "CAFE", bg: "#7a3b2e" },
  { x: 300, w: 170, top: 676, wall: "#c9d8e4", kind: "shop", sign: "BOOKS", bg: "#2f5d8a" },
  { x: 470, w: 230, top: 430, wall: "#d8c0d0", kind: "apt" },
  { x: 700, w: 200, top: 720, wall: "#e6b8a0", kind: "ramen", sign: "RAMEN", bg: "#b3262f" },
  { x: 900, w: 200, top: 700, wall: "#d8e4d0", kind: "mart", sign: "24H MART", bg: "#1f7a4a" },
  { x: 1100, w: 160, top: 560, wall: "#e0d2b8", kind: "apt" },
];

// A taller, hazier row of buildings behind the shops, for depth.
const BACK_ROW = [[-20, 250, 360], [220, 190, 300], [400, 250, 270], [650, 240, 340], [880, 210, 300], [1080, 200, 320]];

function paintBackRow(ctx) {
  BACK_ROW.forEach(([x, w, top], i) => {
    ctx.fillStyle = ["#f0cdea", "#cfe2f8", "#f8e0cc", "#d9edd5", "#ecd6f2", "#d2ecf4"][i % 6];
    ctx.fillRect(x, top, w, GROUND - top);
    windowGrid(ctx, x, top, w, GROUND - top - 150, {
      stepX: 34, stepY: 56, winW: 18, winH: 28, litChance: 0.4, seed: 300 + i * 17,
    });
    ctx.fillStyle = "rgba(255,225,240,0.22)";       // sunset haze to push it back
    ctx.fillRect(x, top, w, GROUND - top);
  });
}

function paintShopFront(ctx, b) {
  const doorX = b.x + b.w - 46;
  // sign board above the shop window
  sign(ctx, b.x + 10, 734, b.w - 20, 28, b.sign, b.bg);

  // big glass window with warm light inside
  const gx = b.x + 14, gw = b.w - 66;
  const glass = ctx.createLinearGradient(0, 772, 0, 886);
  glass.addColorStop(0, "#fff0c0");
  glass.addColorStop(1, "#ffc878");
  ctx.fillStyle = glass;
  ctx.fillRect(gx, 772, gw, 114);
  ctx.strokeStyle = "rgba(120,80,50,0.35)";         // shelves / tables inside
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (const y of [806, 838, 868]) { ctx.moveTo(gx + 6, y); ctx.lineTo(gx + gw - 6, y); }
  ctx.stroke();
  for (let i = 0; i < 9; i++) {                     // little goods on the shelves
    ctx.fillStyle = ["#e57aa0", "#4aa3df", "#8bc34a", "#f2c14e"][i % 4];
    ctx.fillRect(gx + 12 + i * (gw / 9.5), 796 + (i % 3) * 32, 9, 10);
  }
  ctx.fillStyle = "rgba(255,255,255,0.3)";          // glass reflection
  ctx.beginPath();
  ctx.moveTo(gx + 10, 772);
  ctx.lineTo(gx + 34, 772);
  ctx.lineTo(gx + 10, 830);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#3b3541";
  ctx.lineWidth = 3;
  ctx.strokeRect(gx, 772, gw, 114);

  // door
  ctx.fillStyle = "#3b3541";
  ctx.fillRect(doorX - 3, 790, 36, 110);
  ctx.fillStyle = "#ffdca0";
  ctx.fillRect(doorX, 794, 30, 106);
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.fillRect(doorX + 4, 800, 6, 80);
  ctx.fillStyle = "#3b3541";
  ctx.fillRect(doorX + 22, 840, 3, 16);

  if (b.kind === "ramen") {                         // noren curtain and red lanterns
    ctx.fillStyle = "#2a2f4a";
    ctx.fillRect(doorX - 2, 786, 34, 38);
    ctx.fillStyle = "#f4efe4";
    for (let i = 0; i < 3; i++) ctx.fillRect(doorX + 3 + i * 10, 790, 4, 28);
    for (const lx of [b.x + 24, b.x + b.w - 70]) {
      ctx.strokeStyle = "#8d5e50";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(lx, 762);
      ctx.lineTo(lx, 770);
      ctx.stroke();
      const lg = ctx.createRadialGradient(lx, 782, 2, lx, 782, 26);
      lg.addColorStop(0, "rgba(255,120,80,0.6)");
      lg.addColorStop(1, "rgba(255,120,80,0)");
      ctx.fillStyle = lg;
      ctx.fillRect(lx - 26, 756, 52, 52);
      ctx.fillStyle = "#d9302e";
      ctx.beginPath();
      ctx.ellipse(lx, 782, 9, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#8d5e50";
      ctx.stroke();
    }
  }
  if (b.kind === "mart") {                          // bright blue-green stripe
    ctx.fillStyle = "#35c28a";
    ctx.fillRect(b.x, 764, b.w, 5);
    ctx.fillStyle = "#1c5fa8";
    ctx.fillRect(b.x, 769, b.w, 3);
  }
}

function paintBuilding(ctx, b, i) {
  const wallG = ctx.createLinearGradient(b.x, 0, b.x + b.w, 0);
  wallG.addColorStop(0, b.wall);
  wallG.addColorStop(1, "#b9a9a0");
  ctx.fillStyle = wallG;
  ctx.fillRect(b.x, b.top, b.w, GROUND - b.top);
  ctx.fillStyle = "rgba(60,40,80,0.16)";            // shaded side
  ctx.fillRect(b.x + b.w * 0.82, b.top, b.w * 0.18, GROUND - b.top);
  ctx.fillStyle = "#5d4a52";                        // roof edge
  ctx.fillRect(b.x - 2, b.top, b.w + 4, 6);
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.fillRect(b.x - 2, b.top, b.w + 4, 2);

  // upper-floor windows (above the shop level)
  const winBottom = b.kind === "apt" ? GROUND - 140 : 728;
  if (winBottom - b.top > 50) {
    windowGrid(ctx, b.x, b.top + 6, b.w, winBottom - b.top - 6, {
      stepX: 44, stepY: 66, winW: 24, winH: 36, litChance: 0.55, seed: 40 + i * 11,
    });
  }

  if (b.kind === "apt") {                           // building entrance
    const dx = b.x + b.w / 2 - 20;
    ctx.fillStyle = "#4a3f4f";
    ctx.fillRect(dx - 4, 806, 48, 94);
    ctx.fillStyle = "#ffdca0";
    ctx.fillRect(dx, 810, 40, 90);
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.fillRect(dx + 4, 816, 8, 70);
    ctx.fillStyle = "#6a7d8f";                      // mailboxes
    ctx.fillRect(b.x + 8, 846, 22, 28);
  } else {
    paintShopFront(ctx, b);
  }
}

function paintStreetBuildings(ctx) {
  BUILDINGS.forEach((b, i) => paintBuilding(ctx, b, i));
}

// ---- Apartment block: windows, entrance, top-floor corridor, roof sign --------------

const APT_X = 1250, APT_TOP = 100;

function paintApartment(ctx, level) {
  const w = level.worldWidth - APT_X;
  const wall = ctx.createLinearGradient(APT_X, 0, APT_X + w, 0);
  wall.addColorStop(0, "#ffe7da");
  wall.addColorStop(1, "#f8d2de");
  ctx.fillStyle = wall;
  ctx.fillRect(APT_X, APT_TOP, w, GROUND - APT_TOP);
  ctx.fillStyle = "rgba(255,255,255,0.18)";         // light band along the left edge
  ctx.fillRect(APT_X, APT_TOP, 8, GROUND - APT_TOP);

  // Concrete floor-slab bands every storey give it that apartment-block look.
  for (let y = 224; y < GROUND; y += 90) {
    ctx.fillStyle = "rgba(90,70,90,0.18)";
    ctx.fillRect(APT_X, y, w, 6);
  }

  windowGrid(ctx, APT_X + 20, 236, w - 40, GROUND - 236 - 140, {
    stepX: 70, stepY: 90, winW: 34, winH: 46, litChance: 0.5, seed: 900,
  });

  // Roof parapet and the glowing building sign.
  ctx.fillStyle = "#6a5560";
  ctx.fillRect(APT_X - 6, APT_TOP - 6, w + 6, 12);
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.fillRect(APT_X - 6, APT_TOP - 6, w + 6, 2);
  const sg = ctx.createRadialGradient(1640, 62, 10, 1640, 62, 190);
  sg.addColorStop(0, "rgba(255,90,160,0.5)");
  sg.addColorStop(1, "rgba(255,90,160,0)");
  ctx.fillStyle = sg;
  ctx.fillRect(1440, -40, 400, 200);
  ctx.fillStyle = "#8d5e50";
  ctx.fillRect(1520, 40, 240, 44);
  ctx.fillStyle = "#ff5aa5";
  ctx.font = "bold 24px 'Fredoka','Baloo 2',system-ui,sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("707 APARTMENTS", 1640, 63);
  ctx.textBaseline = "alphabetic";

  // Entrance on the ground floor.
  ctx.fillStyle = "#4a3f4f";
  ctx.fillRect(1280, 790, 110, 110);
  ctx.fillStyle = "#ffdca0";
  ctx.fillRect(1286, 796, 98, 104);
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.fillRect(1292, 802, 10, 90);
  ctx.fillStyle = "#3b3541";
  ctx.fillRect(1333, 796, 4, 104);

  // The top-floor open corridor: dark panelled wall, doors, ceiling lamps.
  const cx0 = 1900, cy0 = 112, cy1 = 220;
  const hall = ctx.createLinearGradient(0, cy0, 0, cy1);
  hall.addColorStop(0, "#6a5240");
  hall.addColorStop(1, "#4a3a2e");
  ctx.fillStyle = hall;
  ctx.fillRect(cx0, cy0, level.worldWidth - cx0, cy1 - cy0);
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.fillRect(cx0, cy0, level.worldWidth - cx0, 6);
  ["701", "702", "703"].forEach((num, i) => {
    const dx = [1960, 2150, 2320][i];
    ctx.fillStyle = "#2f2520";
    ctx.fillRect(dx - 4, cy0 + 12, 58, cy1 - cy0 - 12);
    const dg = ctx.createLinearGradient(0, cy0 + 16, 0, cy1);
    dg.addColorStop(0, "#9a7656");
    dg.addColorStop(1, "#7a5a40");
    ctx.fillStyle = dg;
    ctx.fillRect(dx, cy0 + 16, 50, cy1 - cy0 - 16);
    ctx.fillStyle = "#d9b04a";
    ctx.fillRect(dx + 16, cy0 + 24, 18, 9);
    ctx.fillStyle = "#8d5e50";
    ctx.font = "bold 8px 'Fredoka','Baloo 2',system-ui,sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(num, dx + 25, cy0 + 31);
    ctx.fillStyle = "#d9b04a";
    ctx.fillRect(dx + 40, cy0 + 56, 4, 3);
  });
  for (const lx of [1990, 2200, 2380, 2560]) {       // warm ceiling lamps
    const lg = ctx.createRadialGradient(lx, cy0 + 8, 2, lx, cy0 + 8, 70);
    lg.addColorStop(0, "rgba(255,226,160,0.55)");
    lg.addColorStop(1, "rgba(255,226,160,0)");
    ctx.fillStyle = lg;
    ctx.fillRect(lx - 70, cy0, 140, 110);
    ctx.fillStyle = "#fff3c4";
    ctx.fillRect(lx - 9, cy0 + 4, 18, 5);
  }
}

// ---- Storm drains (the gaps in the street) --------------------------------------------

function paintDrain(ctx, x0, x1) {
  const g = ctx.createLinearGradient(0, GROUND, 0, 1000);
  g.addColorStop(0, "#23262e");
  g.addColorStop(1, "#0d0f14");
  ctx.fillStyle = g;
  ctx.fillRect(x0, GROUND, x1 - x0, 100);
  ctx.fillStyle = "#4a5260";                        // big concrete pipe
  ctx.fillRect(x0, 944, x1 - x0, 22);
  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.fillRect(x0, 944, x1 - x0, 3);
  ctx.fillStyle = "rgba(90,170,220,0.4)";           // trickle of water
  ctx.fillRect(x0, 982, x1 - x0, 5);
  ctx.strokeStyle = "#6b7482";                      // ladder rungs on the drain wall
  ctx.lineWidth = 3;
  for (let y = GROUND + 6; y < 940; y += 12) {
    ctx.beginPath();
    ctx.moveTo(x0 + 8, y);
    ctx.lineTo(x0 + 24, y);
    ctx.stroke();
  }
}

// ---- Poles, wires and street lamps -----------------------------------------------------

function paintPole(ctx, x, top) {
  ctx.fillStyle = "#8a7f9c";
  ctx.fillRect(x - 4, top, 8, GROUND - top);
  ctx.fillRect(x - 32, top + 6, 64, 5);
  ctx.fillRect(x - 24, top + 28, 48, 4);
  ctx.fillStyle = "#cfd4dc";                        // insulators
  for (const dx of [-28, -10, 10, 28]) ctx.fillRect(x + dx - 2, top, 4, 6);
  ctx.fillStyle = "#6a707c";                        // transformer can
  ctx.fillRect(x + 8, top + 50, 16, 24);
  kawaiiFace(ctx, x + 16, top + 63, 0.85, "oh");      // the transformer can is startled
}

function wire(ctx, x0, y0, x1, y1, sag) {
  ctx.strokeStyle = "rgba(35,28,45,0.85)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.quadraticCurveTo((x0 + x1) / 2, Math.max(y0, y1) + sag, x1, y1);
  ctx.stroke();
}

function paintLamp(ctx, x) {
  ctx.fillStyle = "#8a7f9c";
  ctx.fillRect(x - 3, 740, 6, GROUND - 740);
  ctx.fillRect(x - 3, 740, 26, 5);
  const glow = ctx.createRadialGradient(x + 20, 752, 3, x + 20, 752, 90);
  glow.addColorStop(0, "rgba(255,226,150,0.6)");
  glow.addColorStop(1, "rgba(255,226,150,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(x - 70, 680, 180, 220);
  const cone = ctx.createLinearGradient(0, 752, 0, GROUND);
  cone.addColorStop(0, "rgba(255,230,170,0.22)");
  cone.addColorStop(1, "rgba(255,230,170,0)");
  ctx.fillStyle = cone;
  ctx.beginPath();
  ctx.moveTo(x + 14, 752);
  ctx.lineTo(x + 26, 752);
  ctx.lineTo(x + 80, GROUND);
  ctx.lineTo(x - 34, GROUND);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#fff3c4";
  ctx.beginPath();
  ctx.ellipse(x + 20, 749, 8, 4, 0, 0, Math.PI * 2);
  ctx.fill();
}

function paintStreetFurniture(ctx) {
  paintPole(ctx, 590, 540);
  paintPole(ctx, 1170, 540);
  for (const dy of [0, 22]) {
    wire(ctx, -30, 548 + dy, 590 - 28, 552 + dy, 22);
    wire(ctx, 590 + 28, 552 + dy, 1170 - 28, 552 + dy, 26);
    wire(ctx, 1170 + 28, 552 + dy, 1330, 560 + dy, 18);
  }
  for (const lx of [90, 470, 1050]) paintLamp(ctx, lx);
}

// ---- Public -----------------------------------------------------------------------------------

export function bakeStreetDecor(level) {
  const c = document.createElement("canvas");
  c.width = level.worldWidth;
  c.height = level.worldHeight;
  const ctx = c.getContext("2d");

  paintBackRow(ctx);
  paintStreetBuildings(ctx);
  paintApartment(ctx, level);
  paintDrain(ctx, 520, 620);
  paintDrain(ctx, 1100, 1190);
  paintStreetFurniture(ctx);
  return c;
}
