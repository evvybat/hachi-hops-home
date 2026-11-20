// Level 1 objects: platforms, pickups and the Shinkansen. Each function draws
// one thing into the rectangle the game logic uses for collision, so what you
// see is exactly what you can stand on.
// `t` is time in seconds, used for the small animations.
// Manga look: flat colours with a dark ink outline (same ink as hachi.js).

import { kawaiiFace, pickupBubble, bow, sprinkles, heartPath } from "./style.js";

const INK = "#8d5e50";

// Ink border just inside a rectangle.
function inkBorder(ctx, x, y, w, h, lw = 2.2) {
  ctx.strokeStyle = INK;
  ctx.lineWidth = lw;
  ctx.lineJoin = "round";
  ctx.strokeRect(x + lw / 2, y + lw / 2, w - lw, h - lw);
}

// A layer of snow along the top edge of an object, with a wavy lower edge.
function snowCap(ctx, x, y, w, thick) {
  // Puffy whipped-cream snow: a row of round scallops hanging off the top edge.
  const n = Math.max(1, Math.round(w / (thick * 1.9)));
  const step = w / n;
  const base = y + thick * 0.5;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, base);
  for (let i = n - 1; i >= 0; i--) {
    ctx.arc(x + step * i + step / 2, base, step / 2, 0, Math.PI, false);
  }
  ctx.closePath();
  ctx.fillStyle = "#fffafd";
  ctx.fill();
  ctx.strokeStyle = "rgba(244,170,210,0.85)";            // soft pink rim
  ctx.lineWidth = 1.3;
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.9)";               // shine on each puff
  for (let i = 0; i < n; i++) {
    ctx.beginPath();
    ctx.ellipse(x + step * i + step * 0.36, base + step * 0.12, step * 0.1, step * 0.06, -0.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ---- Platforms ------------------------------------------------------------

function drawFloor(ctx, r) {
  const body = ctx.createLinearGradient(0, r.y, 0, r.y + r.h);
  body.addColorStop(0, "#e9dff3");
  body.addColorStop(1, "#c1b4de");
  ctx.fillStyle = body;
  ctx.fillRect(r.x, r.y, r.w, r.h);

  // Concrete slab seams, lined up to the world so they don't shift per piece.
  ctx.strokeStyle = "rgba(0,0,0,0.2)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = Math.ceil(r.x / 60) * 60; x < r.x + r.w; x += 60) {
    ctx.moveTo(x, r.y + 8);
    ctx.lineTo(x, r.y + r.h);
  }
  ctx.moveTo(r.x, r.y + 30);
  ctx.lineTo(r.x + r.w, r.y + 30);
  ctx.stroke();

  sprinkles(ctx, r.x + 6, r.y + 24, r.w - 12, r.h - 30, r.x, Math.floor(r.w / 26));   // candy sprinkles
  // Yellow tactile safety band just under the snow.
  ctx.fillStyle = "#d9b63a";
  ctx.fillRect(r.x, r.y + 9, r.w, 4);
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  for (let x = r.x + 4; x < r.x + r.w - 2; x += 10) ctx.fillRect(x, r.y + 10, 4, 2);

  // Darker, chipped end faces where the platform meets a gap.
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.fillRect(r.x, r.y, 4, r.h);
  ctx.fillRect(r.x + r.w - 4, r.y, 4, r.h);

  snowCap(ctx, r.x, r.y, r.w, 7);
  inkBorder(ctx, r.x, r.y, r.w, r.h);
}

function drawIce(ctx, r, t) {
  const body = ctx.createLinearGradient(0, r.y, 0, r.y + r.h);
  body.addColorStop(0, "#dff4fc");
  body.addColorStop(1, "#7dbfe0");
  ctx.fillStyle = body;
  ctx.fillRect(r.x, r.y, r.w, r.h);

  ctx.save();
  ctx.beginPath();
  ctx.rect(r.x, r.y, r.w, r.h);
  ctx.clip();

  ctx.strokeStyle = "rgba(255,255,255,0.35)";   // frozen streaks
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = r.x - 20; x < r.x + r.w; x += 38) {
    ctx.moveTo(x, r.y + 10);
    ctx.lineTo(x + 22, r.y + r.h - 4);
  }
  ctx.stroke();

  ctx.strokeStyle = "rgba(60,120,160,0.35)";    // hairline cracks
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = r.x + 30; x < r.x + r.w - 20; x += 85) {
    ctx.moveTo(x, r.y + 14);
    ctx.lineTo(x + 12, r.y + 30);
    ctx.lineTo(x + 4, r.y + 44);
  }
  ctx.stroke();

  ctx.restore();

  ctx.fillStyle = "rgba(255,255,255,0.85)";     // glossy top edge
  ctx.fillRect(r.x, r.y, r.w, 5);
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.fillRect(r.x, r.y, 3, r.h);
  ctx.fillRect(r.x + r.w - 3, r.y, 3, r.h);
  inkBorder(ctx, r.x, r.y, r.w, r.h);
}

// A slow shimmer sweeping across the ice says "slippery". Drawn live each
// frame on top of the pre-painted platform.
export function drawIceShimmer(ctx, r, t) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(r.x + 3, r.y + 5, r.w - 6, r.h - 8);
  ctx.clip();
  const sweep = r.x + ((t * 70) % (r.w + 80)) - 40;
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.beginPath();
  ctx.moveTo(sweep, r.y);
  ctx.lineTo(sweep + 24, r.y);
  ctx.lineTo(sweep + 4, r.y + r.h);
  ctx.lineTo(sweep - 20, r.y + r.h);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function roundedBox(ctx, x, y, w, h, radius, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
  ctx.fill();
  ctx.strokeStyle = INK;                           // ink outline
  ctx.lineWidth = 1.8;
  ctx.lineJoin = "round";
  ctx.stroke();
}

// Soft oval shadow where an object touches the ground.
function contactShadow(ctx, cx, y, rx) {
  ctx.fillStyle = "rgba(10,20,40,0.3)";
  ctx.beginPath();
  ctx.ellipse(cx, y, rx, 3.4, 0, 0, Math.PI * 2);
  ctx.fill();
}

// A luggage cart: two suitcases on a steel frame with wheels.
function drawCart(ctx, r) {
  const groundY = r.y + r.h;
  contactShadow(ctx, r.x + r.w / 2, groundY, r.w * 0.58);

  // Wheels.
  for (const wx of [r.x + 18, r.x + r.w - 18]) {
    ctx.fillStyle = "#1d2025";
    ctx.beginPath();
    ctx.arc(wx, groundY - 6, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#8d949c";
    ctx.beginPath();
    ctx.arc(wx, groundY - 6, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  // Steel chassis.
  ctx.fillStyle = "#3a3f48";
  ctx.fillRect(r.x + 3, groundY - 17, r.w - 6, 7);
  ctx.fillStyle = "#59606b";
  ctx.fillRect(r.x + 3, groundY - 17, r.w - 6, 2);

  const caseH = r.h - 17;

  // Brown leather case with straps.
  const leather = ctx.createLinearGradient(0, r.y, 0, r.y + caseH);
  leather.addColorStop(0, "#a8744c");
  leather.addColorStop(1, "#6e4528");
  roundedBox(ctx, r.x + 4, r.y, 50, caseH, 5, leather);
  ctx.fillStyle = "#4a2d18";
  ctx.fillRect(r.x + 16, r.y, 4, caseH);
  ctx.fillRect(r.x + 38, r.y, 4, caseH);
  ctx.fillStyle = "#d9b04a";                        // buckle
  ctx.fillRect(r.x + 15, r.y + caseH * 0.45, 6, 6);
  ctx.fillRect(r.x + 37, r.y + caseH * 0.45, 6, 6);
  roundedBox(ctx, r.x + 24, r.y + 3, 10, 4, 2, "#3b2412");   // carry handle

  // Teal hard-shell case with ribs and a sticker.
  const shell = ctx.createLinearGradient(0, r.y, 0, r.y + caseH);
  shell.addColorStop(0, "#3a9aa6");
  shell.addColorStop(1, "#236a75");
  roundedBox(ctx, r.x + 58, r.y, 48, caseH, 5, shell);
  ctx.strokeStyle = "rgba(0,0,0,0.22)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let x = r.x + 66; x < r.x + 104; x += 9) {
    ctx.moveTo(x, r.y + 6);
    ctx.lineTo(x, r.y + caseH - 4);
  }
  ctx.stroke();
  roundedBox(ctx, r.x + 88, r.y + 14, 10, 10, 2, "#f2c14e");  // travel sticker
  roundedBox(ctx, r.x + 76, r.y + 3, 12, 4, 2, "#17474f");    // carry handle

  kawaiiFace(ctx, r.x + 29, r.y + caseH * 0.64, 1.0);              // both suitcases have happy faces
  kawaiiFace(ctx, r.x + 78, r.y + caseH * 0.68, 0.95);
  bow(ctx, r.x + r.w - 12, r.y + 14, 0.85, "#ff7ab8");   // a pink bow on the teal case
  // Cart push-bar on the left edge.
  ctx.fillStyle = "#2b2e34";
  ctx.fillRect(r.x, r.y + 10, 3, r.h - 20);

  snowCap(ctx, r.x + 4, r.y, r.w - 8, 4);
}

// A luggage rack hanging from the station roof on chains.
function drawRack(ctx, r) {
  ctx.strokeStyle = "#6c737d";
  ctx.lineWidth = 2;
  for (const cx of [r.x + 12, r.x + r.w - 12]) {
    ctx.setLineDash([5, 3]);                       // chain links
    ctx.beginPath();
    ctx.moveTo(cx, r.y + r.h);
    ctx.lineTo(cx, 0);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  const wood = ctx.createLinearGradient(0, r.y, 0, r.y + r.h);
  wood.addColorStop(0, "#b48a64");
  wood.addColorStop(1, "#7b5b40");
  ctx.fillStyle = wood;
  ctx.fillRect(r.x, r.y, r.w, r.h);
  ctx.strokeStyle = "rgba(60,35,15,0.35)";         // wood grain
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = r.x + 10; x < r.x + r.w; x += 22) {
    ctx.moveTo(x, r.y + 3);
    ctx.lineTo(x + 12, r.y + r.h - 3);
  }
  ctx.stroke();
  ctx.fillStyle = "#4b515b";                       // steel end caps
  ctx.fillRect(r.x, r.y, 5, r.h);
  ctx.fillRect(r.x + r.w - 5, r.y, 5, r.h);

  snowCap(ctx, r.x, r.y, r.w, 4);
  inkBorder(ctx, r.x, r.y, r.w, r.h, 1.4);
  bow(ctx, r.x + r.w / 2, r.y - 4, 0.8, "#ff9cc7");              // a bow on every hanging rack
}

export function drawPlatform(ctx, r, t) {
  switch (r.style) {
    case "ice": return drawIce(ctx, r, t);
    case "cart": return drawCart(ctx, r);
    case "rack": return drawRack(ctx, r);
    default: return drawFloor(ctx, r);
  }
}

// ---- Pickups --------------------------------------------------------------

function drawTicket(ctx, cx, cy) {
  ctx.rotate(-0.15);
  ctx.fillStyle = "#fff6dc";
  ctx.beginPath();
  ctx.roundRect(-13, -8, 26, 16, 2);
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.3;
  ctx.stroke();
  ctx.fillStyle = "#c9372c";                        // red end band
  ctx.fillRect(-13, -8, 6, 16);
  ctx.fillStyle = "#2b6cb0";                        // blue route stripe
  ctx.fillRect(-4, -5, 14, 3);
  kawaiiFace(ctx, 3, 3, 0.55);                      // a smiling ticket
  ctx.fillStyle = "#e9e1c8";                        // punched notches
  ctx.beginPath();
  ctx.arc(13, -8, 2.5, 0, Math.PI * 2);
  ctx.arc(13, 8, 2.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawBento(ctx) {
  roundedBox(ctx, -12, -8, 24, 16, 3, "#8c2a24");   // lacquer box
  roundedBox(ctx, -10, -6, 20, 12, 2, "#2a1a16");   // dark inside
  roundedBox(ctx, -10, -6, 10, 12, 2, "#fbfbf5");   // rice
  ctx.fillStyle = "#f08a5d";                        // grilled salmon
  ctx.fillRect(1, -6, 9, 5);
  ctx.fillStyle = "#6fae4a";                        // greens
  ctx.fillRect(1, -0.5, 4.5, 6.5);
  ctx.fillStyle = "#f2c94c";                        // egg
  ctx.fillRect(5.5, -0.5, 4.5, 6.5);
  kawaiiFace(ctx, -5, 1.5, 0.55);                   // a smiling onigiri-style rice ball
  ctx.strokeStyle = "#d7b184";                      // chopsticks
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-9, 11);
  ctx.lineTo(13, 6);
  ctx.moveTo(-9, 13);
  ctx.lineTo(13, 8);
  ctx.stroke();
}

export function drawCollectible(ctx, item, t) {
  const bob = Math.sin(t * 3 + item.x * 0.02) * 3;
  const cx = item.x + item.w / 2;
  const cy = item.y + item.h / 2 + bob;

  const glow = ctx.createRadialGradient(cx, cy, 2, cx, cy, 22);   // pickup glow
  glow.addColorStop(0, "rgba(255,236,150,0.55)");
  glow.addColorStop(1, "rgba(255,236,150,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(cx - 22, cy - 22, 44, 44);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(1.25, 1.25);                           // chunkier, easier to spot
  if (item.name === "bento snack") drawBento(ctx);
  else drawTicket(ctx);
  ctx.restore();

  const twinkle = (Math.sin(t * 5 + item.x) + 1) / 2;             // sparkle
  ctx.fillStyle = `rgba(255,255,255,${0.4 + twinkle * 0.5})`;
  ctx.fillRect(cx + 10, cy - 14 - twinkle * 2, 2, 2);
}

// ---- Hazards (touching one costs a heart) --------------------------------

// A cluster of sharp ice spikes standing on the ground, with a faint red-pink
// glow so they read as dangerous, not as scenery.
function drawIcicles(ctx, h, t) {
  const base = h.y + h.h;
  contactShadow(ctx, h.x + h.w / 2, base, h.w * 0.6);
  const pulse = 0.18 + 0.1 * Math.sin(t * 4);
  const glow = ctx.createRadialGradient(h.x + h.w / 2, base - 8, 2, h.x + h.w / 2, base - 8, h.w);
  glow.addColorStop(0, `rgba(255,90,120,${pulse})`);
  glow.addColorStop(1, "rgba(255,90,120,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(h.x - h.w / 2, base - h.h - 16, h.w * 2, h.h + 20);

  const heights = [0.72, 1, 0.62, 0.92, 0.7];
  const step = h.w / heights.length;
  heights.forEach((k, i) => {
    const cx = h.x + step * i + step / 2;
    const top = base - h.h * k;
    const half = step / 2 + 1.5;
    const g = ctx.createLinearGradient(0, top, 0, base);
    g.addColorStop(0, "#ffffff");
    g.addColorStop(1, "#8ccbea");
    ctx.beginPath();
    ctx.moveTo(cx - half, base);
    ctx.lineTo(cx, top);
    ctx.lineTo(cx + half, base);
    ctx.closePath();
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.4;
    ctx.lineJoin = "round";
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,0.9)";      // glint on the left edge
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - half * 0.45, base - 3);
    ctx.lineTo(cx - 0.5, top + 5);
    ctx.stroke();
    if (i === 1 || i === 3) kawaiiFace(ctx, cx, base - (base - top) * 0.36, 0.5, "angry");   // cross little icicles
  });
}

// A grumpy station pigeon that paces back and forth.
function drawPigeon(ctx, h, t) {
  const dir = (h.vx || 1) >= 0 ? 1 : -1;
  const bob = Math.abs(Math.sin(t * 10)) * 1.2;
  const swing = Math.sin(t * 10) * 2.5;
  contactShadow(ctx, h.x + h.w / 2, h.y + h.h, 15);

  ctx.save();
  ctx.translate(h.x + h.w / 2, h.y + h.h);          // origin: feet
  ctx.scale(dir, 1);

  ctx.strokeStyle = "#e88a3c";                      // legs
  ctx.lineWidth = 1.8;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-3, -6);
  ctx.lineTo(-3 + swing, 0);
  ctx.moveTo(3, -6);
  ctx.lineTo(3 - swing, 0);
  ctx.stroke();

  ctx.translate(0, -bob);
  ctx.lineJoin = "round";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.4;

  ctx.beginPath();                                  // tail
  ctx.moveTo(-10, -12);
  ctx.lineTo(-17, -9);
  ctx.lineTo(-16, -16);
  ctx.closePath();
  ctx.fillStyle = "#7f8896";
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();                                  // body
  ctx.ellipse(0, -12, 12, 7.5, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#aab2be";
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#d7dce3";                        // lighter belly
  ctx.beginPath();
  ctx.ellipse(2, -9.5, 7, 3.6, 0, 0, Math.PI);
  ctx.fill();

  ctx.beginPath();                                  // wing
  ctx.ellipse(-3, -13, 7, 4.5, -0.2, 0, Math.PI * 2);
  ctx.fillStyle = "#7f8896";
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();                                  // head
  ctx.arc(9, -17.5, 5.5, 0, Math.PI * 2);
  ctx.fillStyle = "#aab2be";
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#8f78b5";                        // iridescent neck patch
  ctx.beginPath();
  ctx.ellipse(5.5, -14.5, 3.5, 2.2, 0.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();                                  // beak
  ctx.moveTo(13.6, -18.4);
  ctx.lineTo(19.5, -16.6);
  ctx.lineTo(13.6, -15.4);
  ctx.closePath();
  ctx.fillStyle = "#f0a040";
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();                                  // angry eye
  ctx.arc(10.8, -19, 2.1, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#d02a38";
  ctx.beginPath();
  ctx.arc(11.3, -19, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 1.7;                              // slanted brow
  ctx.beginPath();
  ctx.moveTo(8, -22.4);
  ctx.lineTo(13, -20.6);
  ctx.stroke();

  // Manga anger mark that pulses above its head.
  const s = 1 + 0.15 * Math.sin(t * 8);
  ctx.strokeStyle = "#e0303e";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  for (const sign of [1, -1]) {
    ctx.moveTo(3 + 1.5 * s * sign, -27 - 2.2 * s);
    ctx.quadraticCurveTo(3 + 3.8 * s * sign, -27 - 4 * s, 3 + 3.8 * s * sign, -27 - 6 * s);
    ctx.moveTo(3 + 1.5 * s * sign, -27 + 2.2 * s);
    ctx.quadraticCurveTo(3 + 3.8 * s * sign, -27 + 4 * s, 3 + 3.8 * s * sign, -27 + 6 * s);
  }
  ctx.stroke();

  ctx.restore();
}

export function drawHazard(ctx, h, t) {
  if (h.kind === "pigeon") drawPigeon(ctx, h, t);
  else drawIcicles(ctx, h, t);
}

// ---- The Shinkansen at the exit ------------------------------------------

export function drawTrain(ctx, goal, t) {
  const x = goal.x - 70, w = goal.w + 140;       // car runs to the level's edge
  const top = goal.y - 40, bottom = goal.y + goal.h;

  const body = ctx.createLinearGradient(0, top, 0, bottom);
  body.addColorStop(0, "#fbfcfd");
  body.addColorStop(1, "#cfd6de");
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.roundRect(x, top, w, bottom - top, [16, 16, 0, 0]);
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "#1f5fa8";                     // blue stripe
  ctx.fillRect(x, bottom - 52, w, 14);
  ctx.fillStyle = "#3b4350";                     // dark skirt
  ctx.fillRect(x, bottom - 14, w, 14);
  kawaiiFace(ctx, x + 38, goal.y + 52, 1.7);                     // the Shinkansen is smiling!
  kawaiiFace(ctx, goal.x + goal.w + 38, goal.y + 52, 1.7);
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.fillRect(x, top + 10, w, 2);

  // Passenger windows on both sides of the door.
  const windows = [x + 8, x + 42, goal.x + goal.w + 8, goal.x + goal.w + 42];
  for (const wx of windows) {
    const glass = ctx.createLinearGradient(0, top + 16, 0, top + 46);
    glass.addColorStop(0, "#38557c");
    glass.addColorStop(1, "#1f3350");
    ctx.fillStyle = glass;
    ctx.beginPath();
    ctx.roundRect(wx, top + 16, 26, 30, 5);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.25)";    // reflection
    ctx.fillRect(wx + 4, top + 19, 5, 24);
    heartPath(ctx, wx + 16, top + 32, 4.4);        // a little heart in every window
    ctx.fillStyle = "rgba(255,170,205,0.95)";
    ctx.fill();
  }

  // The door: warm light inside, two glass panels, a pulsing green lamp.
  ctx.fillStyle = "#c4cad2";
  ctx.fillRect(goal.x - 3, goal.y - 4, goal.w + 6, goal.h - 14 + 4);
  ctx.fillStyle = "#ffe7a3";
  ctx.fillRect(goal.x, goal.y, goal.w, goal.h - 14);
  const panel = ctx.createLinearGradient(0, goal.y, 0, goal.y + goal.h);
  panel.addColorStop(0, "#38557c");
  panel.addColorStop(1, "#243a58");
  ctx.fillStyle = panel;
  ctx.fillRect(goal.x, goal.y, goal.w / 2 - 5, goal.h - 14);
  ctx.fillRect(goal.x + goal.w / 2 + 5, goal.y, goal.w / 2 - 5, goal.h - 14);
  ctx.fillStyle = "rgba(255,255,255,0.22)";
  ctx.fillRect(goal.x + 6, goal.y + 8, 6, 50);
  ctx.fillRect(goal.x + goal.w / 2 + 11, goal.y + 8, 6, 50);

  const pulse = 0.55 + 0.45 * Math.sin(t * 4);
  ctx.fillStyle = `rgba(60,220,110,${pulse})`;
  ctx.beginPath();
  ctx.arc(goal.x + goal.w / 2, goal.y - 14, 4, 0, Math.PI * 2);
  ctx.fill();
}
