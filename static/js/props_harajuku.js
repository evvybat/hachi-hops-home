// Level 3 objects (Harajuku / Shibuya): platforms (pavement with zebra
// crossings, rolling clothing racks, LED billboards, a shop lift, boutique
// balconies), hazards (shoppers and cars), traffic signals, the five shopping
// items, and Nana waiting with her bags. Manga look: flat colours with a dark
// ink outline. Each thing is drawn in the rectangle used for collision.
// `t` is time in seconds, for the small animations.

import { kawaiiFace, pickupBubble, bow, sprinkles } from "./style.js";
import { hasSprite, drawNanaSprite } from "./sprites.js";
import { drawChibiGirl, GIRLS, NANA } from "./people.js";

const INK = "#8d5e50";

function rnd(i) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function inkBorder(ctx, x, y, w, h, lw = 2.2) {
  ctx.strokeStyle = INK;
  ctx.lineWidth = lw;
  ctx.lineJoin = "round";
  ctx.strokeRect(x + lw / 2, y + lw / 2, w - lw, h - lw);
}

function shadow(ctx, cx, y, rx) {
  ctx.fillStyle = "rgba(60,30,80,0.3)";
  ctx.beginPath();
  ctx.ellipse(cx, y, rx, 3.4, 0, 0, Math.PI * 2);
  ctx.fill();
}

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

// ---- Platforms ---------------------------------------------------------------------

// Pastel paving on top; the road face below carries the zebra crossings.
function drawStreet(ctx, r) {
  const road = ctx.createLinearGradient(0, r.y + 18, 0, r.y + r.h);
  road.addColorStop(0, "#5a5568");
  road.addColorStop(1, "#34303f");
  ctx.fillStyle = road;
  ctx.fillRect(r.x, r.y + 18, r.w, r.h - 18);

  ctx.fillStyle = "rgba(255,255,255,0.82)";            // dashed centre line
  for (let x = Math.ceil(r.x / 60) * 60; x < r.x + r.w - 30; x += 60) ctx.fillRect(x, r.y + 42, 30, 4);
  for (const [a, b] of r.stripes || []) {              // zebra crossing: white bars
    ctx.fillStyle = "rgba(255,255,255,0.93)";
    for (let x = a; x < b; x += 24) ctx.fillRect(x, r.y + 20, 14, r.h - 22);
  }

  const walk = ctx.createLinearGradient(0, r.y, 0, r.y + 18);   // pavement
  walk.addColorStop(0, "#ffe3ee");
  walk.addColorStop(1, "#e8b9cd");
  ctx.fillStyle = walk;
  ctx.fillRect(r.x, r.y, r.w, 18);
  for (let x = Math.ceil(r.x / 24) * 24; x < r.x + r.w; x += 24) {     // checkerboard tiles
    ctx.fillStyle = (x / 24) % 2 ? "rgba(255,255,255,0.45)" : "rgba(210,130,170,0.25)";
    ctx.fillRect(x, r.y + 2, 24, 12);
  }
  ctx.fillStyle = "#f2c230";                           // tactile paving
  ctx.fillRect(r.x, r.y + 14, r.w, 3);
  ctx.fillStyle = "#9a8aa6";
  ctx.fillRect(r.x, r.y + 17, r.w, 2);
  inkBorder(ctx, r.x, r.y, r.w, r.h);
}

// A wheeled clothing rack: the shelf on top is the platform, with dresses
// hanging below it and little wheels.
function drawRack(ctx, r) {
  const colors = ["#ff7ab8", "#6fd0f0", "#ffd23a", "#b48af0", "#7be0a8"];
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.6;
  for (let i = 0; i < 5; i++) {                        // hanging garments
    const gx = r.x + 10 + i * ((r.w - 20) / 4);
    ctx.beginPath();
    ctx.moveTo(gx, r.y + r.h);
    ctx.lineTo(gx, r.y + r.h + 4);
    ctx.stroke();
    ctx.fillStyle = colors[i];
    ctx.beginPath();
    ctx.moveTo(gx - 4, r.y + r.h + 4);
    ctx.lineTo(gx + 4, r.y + r.h + 4);
    ctx.lineTo(gx + 8, r.y + r.h + 30);
    ctx.lineTo(gx - 8, r.y + r.h + 30);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  ctx.strokeStyle = "#6a6280";                         // frame and wheels
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(r.x + 4, r.y + r.h);
  ctx.lineTo(r.x + 4, r.y + r.h + 36);
  ctx.moveTo(r.x + r.w - 4, r.y + r.h);
  ctx.lineTo(r.x + r.w - 4, r.y + r.h + 36);
  ctx.stroke();
  for (const wx of [r.x + 4, r.x + r.w - 4]) {
    ctx.fillStyle = "#3b3050";
    ctx.beginPath();
    ctx.arc(wx, r.y + r.h + 38, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  const g = ctx.createLinearGradient(0, r.y, 0, r.y + r.h);   // the shelf (platform)
  g.addColorStop(0, "#ff9ccb");
  g.addColorStop(1, "#e0609e");
  ctx.fillStyle = g;
  ctx.fillRect(r.x, r.y, r.w, r.h);
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.fillRect(r.x, r.y, r.w, 3);
  inkBorder(ctx, r.x, r.y, r.w, r.h);
}

function drawBillboard(ctx, r, t) {
  ctx.fillStyle = "#1d1830";
  ctx.fillRect(r.x, r.y, r.w, r.h);
  const n = Math.floor(r.w / 10);
  for (let i = 0; i < n; i++) {                        // chasing LED lights
    const on = (Math.floor(t * 6) + i) % 3 === 0;
    ctx.fillStyle = on ? "#ff5fa2" : "#35c8f0";
    ctx.fillRect(r.x + 4 + i * 10, r.y + 4, 6, 8);
  }
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.fillRect(r.x, r.y, r.w, 2);
  inkBorder(ctx, r.x, r.y, r.w, r.h);
  ctx.strokeStyle = "rgba(255,90,170,0.5)";            // neon glow edge
  ctx.lineWidth = 3;
  ctx.strokeRect(r.x - 1.5, r.y - 1.5, r.w + 3, r.h + 3);
}

function drawLift(ctx, r) {
  ctx.strokeStyle = "#5c5470";                          // steel cable going up
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(r.x + 10, r.y);
  ctx.lineTo(r.x + 10, -300);
  ctx.moveTo(r.x + r.w - 10, r.y);
  ctx.lineTo(r.x + r.w - 10, -300);
  ctx.stroke();
  ctx.fillStyle = "#f2c230";                            // hazard stripes
  ctx.fillRect(r.x, r.y, r.w, r.h);
  ctx.fillStyle = "#8d5e50";
  for (let x = r.x - 6; x < r.x + r.w; x += 16) {
    ctx.beginPath();
    ctx.moveTo(x, r.y + r.h);
    ctx.lineTo(x + 8, r.y + r.h);
    ctx.lineTo(x + 16, r.y);
    ctx.lineTo(x + 8, r.y);
    ctx.closePath();
    ctx.save();
    ctx.beginPath();
    ctx.rect(r.x, r.y, r.w, r.h);
    ctx.clip();
    ctx.fill();
    ctx.restore();
  }
  inkBorder(ctx, r.x, r.y, r.w, r.h);
}

// A boutique balcony: pastel slab with a scalloped awning edge and a flower box.
function drawLedge(ctx, r) {
  shadow(ctx, r.x + r.w / 2, r.y + r.h + 20, r.w * 0.42);
  for (let k = 0; k < Math.ceil(r.w / 14); k++) {      // scalloped awning under the slab
    const x = r.x + k * 14;
    ctx.fillStyle = k % 2 ? "#ffffff" : "#ff7ab8";
    ctx.beginPath();
    ctx.arc(x + 7, r.y + r.h, 7, 0, Math.PI);
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.4;
    ctx.stroke();
  }
  rr(ctx, r.x + 8, r.y - 9, r.w - 16, 9, 2);           // flower box on top
  ctx.fillStyle = "#c8693e";
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.3;
  ctx.stroke();
  for (let x = r.x + 16; x < r.x + r.w - 10; x += 14) {
    ctx.fillStyle = ["#ff5fa2", "#ffd23a", "#b48af0"][Math.floor(x / 14) % 3];
    ctx.beginPath();
    ctx.arc(x, r.y - 12, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.stroke();
  }
  const g = ctx.createLinearGradient(0, r.y, 0, r.y + r.h);
  g.addColorStop(0, "#ffe3ee");
  g.addColorStop(1, "#f0a8c8");
  ctx.fillStyle = g;
  ctx.fillRect(r.x, r.y, r.w, r.h);
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.fillRect(r.x, r.y, r.w, 2.5);
  inkBorder(ctx, r.x, r.y, r.w, r.h);
}

export function drawHarajukuPlatform(ctx, r, t = 0) {
  switch (r.style) {
    case "rack": return drawRack(ctx, r);
    case "billboard": return drawBillboard(ctx, r, t);
    case "lift": return drawLift(ctx, r);
    case "ledge": return drawLedge(ctx, r);
    default: return drawStreet(ctx, r);
  }
}

// ---- Hazards -----------------------------------------------------------------------------

// A little group of busy shoppers walking together: three different girls,
// each drawn in the detailed chibi style from people.js.
function drawCrowd(ctx, h, t) {
  const dir = (h.vx || 1) >= 0 ? 1 : -1;
  const base = Math.floor((h.patrol ? h.patrol.min : h.x) / 37) % GIRLS.length;
  shadow(ctx, h.x + h.w / 2, h.y + h.h, h.w * 0.68);
  ctx.save();
  ctx.translate(h.x + h.w / 2, h.y + h.h);
  ctx.scale(dir, 1);
  const ph = h.x * 0.2;
  [[-22, 0, 0], [22, 3.1, 5], [0, 1.5, 3]].forEach(([ox, off, pick]) => {
    ctx.save();
    ctx.translate(ox, 0);
    drawChibiGirl(ctx, GIRLS[(base + pick) % GIRLS.length], { t, phase: ph + off, walking: true });
    ctx.restore();
  });
  ctx.restore();
}

// A cute pastel hatchback. While `warn`, its headlights flash and it puffs
// exhaust (harmless); once `armed` it speeds across with motion lines.
function drawCar(ctx, h, t) {
  const dir = h.dir || -1;
  const w = h.w, ch = h.h;
  shadow(ctx, h.x + w / 2, h.y + ch, w * 0.55);
  ctx.save();
  ctx.translate(h.x + w / 2, h.y + ch);
  ctx.scale(-dir, 1);                                   // the car faces its direction of travel
  ctx.lineJoin = "round";
  const bounce = h.armed ? Math.sin(t * 40) * 0.8 : (h.warn ? Math.sin(t * 30) * 0.5 : 0);
  ctx.translate(0, bounce);

  if (h.armed) {                                        // speed lines
    ctx.strokeStyle = "rgba(255,255,255,0.85)";
    ctx.lineWidth = 2.4;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(-w / 2 - 6, -14 - i * 12);
      ctx.lineTo(-w / 2 - 28 - i * 6, -14 - i * 12);
      ctx.stroke();
    }
  }
  if (h.warn) {                                         // exhaust puffs
    for (let i = 0; i < 3; i++) {
      const a = (t * 1.6 + i / 3) % 1;
      ctx.fillStyle = `rgba(240,240,250,${0.7 * (1 - a)})`;
      ctx.beginPath();
      ctx.arc(-w / 2 - 6 - a * 18, -10 - a * 10, 4 + a * 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  rr(ctx, -w / 2, -ch + 18, w, ch - 24, 10);            // lower body
  const body = ctx.createLinearGradient(0, -ch + 18, 0, -6);
  body.addColorStop(0, "#ff9ccb");
  body.addColorStop(1, "#e0609e");
  ctx.fillStyle = body;
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.2;
  ctx.stroke();
  ctx.beginPath();                                      // cabin
  ctx.moveTo(-w * 0.3, -ch + 18);
  ctx.quadraticCurveTo(-w * 0.28, -ch + 1, -w * 0.1, -ch + 1);
  ctx.lineTo(w * 0.14, -ch + 1);
  ctx.quadraticCurveTo(w * 0.34, -ch + 3, w * 0.38, -ch + 18);
  ctx.closePath();
  ctx.fillStyle = "#ffb8d9";
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#bfe8ff";                            // windows
  ctx.beginPath();
  ctx.moveTo(-w * 0.22, -ch + 17);
  ctx.quadraticCurveTo(-w * 0.2, -ch + 6, -w * 0.08, -ch + 6);
  ctx.lineTo(w * 0.0, -ch + 6);
  ctx.lineTo(w * 0.0, -ch + 17);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(w * 0.06, -ch + 17);
  ctx.lineTo(w * 0.06, -ch + 6);
  ctx.lineTo(w * 0.14, -ch + 6);
  ctx.quadraticCurveTo(w * 0.28, -ch + 8, w * 0.3, -ch + 17);
  ctx.closePath();
  ctx.fill();

  kawaiiFace(ctx, -w * 0.02, -ch * 0.4 + 3, 0.85, h.armed ? "angry" : "happy");   // a cute (or cross) car
  const flash = h.warn ? (Math.floor(t * 8) % 2 === 0) : true;     // headlights
  ctx.fillStyle = flash ? "#fff6a8" : "#c9b86a";
  ctx.beginPath();
  ctx.ellipse(w / 2 - 4, -ch + 26, 5, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#ff4a6a";                            // tail light
  ctx.fillRect(-w / 2 + 1, -ch + 24, 5, 6);
  if (flash && h.warn) {                                // headlight glow
    const g = ctx.createRadialGradient(w / 2 + 6, -ch + 26, 2, w / 2 + 6, -ch + 26, 38);
    g.addColorStop(0, "rgba(255,246,168,0.6)");
    g.addColorStop(1, "rgba(255,246,168,0)");
    ctx.fillStyle = g;
    ctx.fillRect(w / 2 - 20, -ch - 10, 80, 70);
  }

  for (const wx of [-w * 0.3, w * 0.3]) {               // wheels
    ctx.fillStyle = "#8d5e50";
    ctx.beginPath();
    ctx.arc(wx, -6, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#cfc8e0";
    ctx.beginPath();
    ctx.arc(wx, -6, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawHarajukuHazard(ctx, h, t) {
  if (h.hidden) return;
  if (h.kind === "car") drawCar(ctx, h, t);
  else drawCrowd(ctx, h, t);
}

// Traffic signal beside a crossing: red while the car dashes, flashing yellow
// when it's revving up, green when the road is clear.
export function drawSignal(ctx, x, car, t) {
  const base = 480;
  ctx.fillStyle = "#4a4060";
  ctx.fillRect(x - 3, base - 96, 6, 96);
  rr(ctx, x - 12, base - 134, 24, 44, 5);
  ctx.fillStyle = "#8d5e50";
  ctx.fill();
  const state = car.armed ? "red" : car.warn ? "yellow" : "green";
  const flash = Math.floor(t * 6) % 2 === 0;
  const lights = [["red", "#ff3a4a", base - 124], ["yellow", "#ffd23a", base - 112], ["green", "#3aff7a", base - 100]];
  for (const [name, col, y] of lights) {
    const on = name === state && (name !== "yellow" || flash);
    ctx.fillStyle = on ? col : "rgba(255,255,255,0.12)";
    ctx.beginPath();
    ctx.arc(x, y, 4.2, 0, Math.PI * 2);
    ctx.fill();
    if (on) {
      const g = ctx.createRadialGradient(x, y, 1, x, y, 20);
      g.addColorStop(0, col + "99");
      g.addColorStop(1, col + "00");
      ctx.fillStyle = g;
      ctx.fillRect(x - 20, y - 20, 40, 40);
    }
  }
  rr(ctx, x - 22, base - 78, 22, 24, 4);                 // pedestrian sign
  ctx.fillStyle = "#1d1830";
  ctx.fill();
  ctx.fillStyle = state === "green" ? "#3aff7a" : "#ff3a4a";
  ctx.beginPath();
  ctx.arc(x - 11, base - 71, 2.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(x - 13, base - 68, 4, 9);
  if (state !== "green") {
    ctx.fillRect(x - 17, base - 66, 12, 2);
  } else {
    ctx.fillRect(x - 17, base - 65, 4, 2);
    ctx.fillRect(x - 9, base - 65, 4, 2);
  }
}

export { drawHarajukuCollectible } from "./items_harajuku.js";   // the five shopping items (big, cute, with faces)

// ---- Nana, waiting with the shopping bags -------------------------------------------------------

export function drawNana(ctx, goal, collected, needed, t) {
  const cx = goal.x + goal.w / 2, fy = goal.y + goal.h;
  // Use the hand-drawn Nana sprite if it's in static/images/nana, else the built-in drawing.
  const useSprite = hasSprite("nana");
  if (useSprite) drawNanaSprite(ctx, cx, fy, -1, collected >= needed ? "happy" : "idle", t);
  else shadow(ctx, cx, fy, 20);
  ctx.save();
  ctx.translate(cx, fy);
  ctx.lineJoin = "round";
  if (!useSprite) {                                  // built-in Nana, in Hachi's chibi art style
    ctx.scale(-1, 1);                                // she faces left, toward Hachi
    drawChibiGirl(ctx, NANA, { t, phase: 0, walking: false });
    ctx.scale(-1, 1);
  }   // end of the built-in drawing

  // Speech bubble: tells you what she's waiting for.
  const ready = collected >= needed;
  const msg = ready ? "Hachi!" : `Bags: ${collected}/${needed}`;
  ctx.font = "bold 13px 'Fredoka','Baloo 2',system-ui,sans-serif";
  const tw = ctx.measureText(msg).width + 16;
  const by = -88 - Math.sin(t * 3) * 2;
  ctx.fillStyle = ready ? "#fff3a8" : "#ffffff";
  rr(ctx, -tw / 2, by - 12, tw, 24, 8);
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.8;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-4, by + 11); ctx.lineTo(0, by + 18); ctx.lineTo(4, by + 11);
  ctx.fillStyle = ready ? "#fff3a8" : "#ffffff";
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = ready ? "#d8264a" : "#4a3f55";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(msg, 0, by + 1);
  ctx.textBaseline = "alphabetic";
  ctx.restore();
}
