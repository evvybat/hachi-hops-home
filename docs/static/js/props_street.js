// Level 2 objects (Tokyo street and apartment): platforms, hazards, pickups
// and the Room 707 door. Same manga look as Level 1: flat colours with a dark
// ink outline. Each thing is drawn inside the rectangle the game uses for
// collision, so what you see is what you can stand on or get hurt by.
// `t` is time in seconds, used for the small animations.

import { kawaiiFace, pickupBubble, bow, sprinkles, heartPath } from "./style.js";
import { drawChibiRider, GIRLS } from "./people.js";

const INK = "#8d5e50";

function inkBorder(ctx, x, y, w, h, lw = 2.2) {
  ctx.strokeStyle = INK;
  ctx.lineWidth = lw;
  ctx.lineJoin = "round";
  ctx.strokeRect(x + lw / 2, y + lw / 2, w - lw, h - lw);
}

function contactShadow(ctx, cx, y, rx) {
  ctx.fillStyle = "rgba(20,10,40,0.32)";
  ctx.beginPath();
  ctx.ellipse(cx, y, rx, 3.4, 0, 0, Math.PI * 2);
  ctx.fill();
}

function rnd(i) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// ---- Platforms -----------------------------------------------------------------

// Pavement on top, asphalt road below with a dashed centre line.
function drawStreet(ctx, r) {
  const road = ctx.createLinearGradient(0, r.y + 18, 0, r.y + r.h);
  road.addColorStop(0, "#9a8fb0");
  road.addColorStop(1, "#6f6590");
  ctx.fillStyle = road;
  ctx.fillRect(r.x, r.y + 18, r.w, r.h - 18);

  ctx.fillStyle = "rgba(255,255,255,0.8)";          // dashed road line
  for (let x = Math.ceil(r.x / 60) * 60; x < r.x + r.w - 30; x += 60) ctx.fillRect(x, r.y + 62, 30, 4);

  const walk = ctx.createLinearGradient(0, r.y, 0, r.y + 18);
  walk.addColorStop(0, "#e2dccf");
  walk.addColorStop(1, "#b7b0a4");
  ctx.fillStyle = walk;                             // pavement
  ctx.fillRect(r.x, r.y, r.w, 18);
  ctx.strokeStyle = "rgba(0,0,0,0.16)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = Math.ceil(r.x / 36) * 36; x < r.x + r.w; x += 36) {
    ctx.moveTo(x, r.y);
    ctx.lineTo(x, r.y + 14);
  }
  ctx.stroke();
  ctx.fillStyle = "#e3b93c";                        // yellow tactile paving
  ctx.fillRect(r.x, r.y + 3, r.w, 4);
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  for (let x = r.x + 4; x < r.x + r.w - 2; x += 8) ctx.fillRect(x, r.y + 4, 3, 2);
  ctx.fillStyle = "#8d877d";                        // kerb face
  ctx.fillRect(r.x, r.y + 14, r.w, 4);
  inkBorder(ctx, r.x, r.y, r.w, r.h);
}

// A striped shop awning. Bouncy: it springs you up.
function drawAwning(ctx, r) {
  const stripe = 14;
  const n = Math.ceil(r.w / stripe);
  for (let i = 0; i < n; i++) {
    const x = r.x + i * stripe;
    const w = Math.min(stripe, r.x + r.w - x);
    ctx.fillStyle = i % 2 ? "#fbf4ea" : "#e0414e";
    ctx.fillRect(x, r.y, w, r.h);
    ctx.beginPath();                                 // scalloped hanging edge
    ctx.arc(x + w / 2, r.y + r.h, w / 2, 0, Math.PI);
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.6;
    ctx.stroke();
  }
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.2;
  ctx.strokeRect(r.x + 1, r.y + 1, r.w - 2, r.h - 2);
  ctx.strokeStyle = "rgba(255,255,255,0.9)";         // chevrons say "bouncy"
  ctx.lineWidth = 2;
  for (let x = r.x + 18; x < r.x + r.w - 10; x += 26) {
    ctx.beginPath();
    ctx.moveTo(x - 5, r.y + 9);
    ctx.lineTo(x, r.y + 4);
    ctx.lineTo(x + 5, r.y + 9);
    ctx.stroke();
  }
}

function drawRoof(ctx, r) {
  const g = ctx.createLinearGradient(0, r.y, 0, r.y + r.h);
  g.addColorStop(0, "#b8b2c0");
  g.addColorStop(1, "#7d7788");
  ctx.fillStyle = g;
  ctx.fillRect(r.x, r.y, r.w, r.h);
  ctx.fillStyle = "rgba(255,255,255,0.5)";           // lit top edge
  ctx.fillRect(r.x, r.y, r.w, 3);
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  for (let x = r.x + 10; x < r.x + r.w; x += 24) ctx.fillRect(x, r.y + 6, 2, r.h - 8);
  inkBorder(ctx, r.x, r.y, r.w, r.h);
}

// Railing: posts and a top rail standing on a slab.
function railing(ctx, x, y, w, height, spacing) {
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  for (let px = x + 4; px <= x + w - 3; px += spacing) {
    ctx.moveTo(px, y);
    ctx.lineTo(px, y - height);
  }
  ctx.moveTo(x + 3, y - height);
  ctx.lineTo(x + w - 3, y - height);
  ctx.moveTo(x + 3, y - height * 0.5);
  ctx.lineTo(x + w - 3, y - height * 0.5);
  ctx.stroke();
  for (let px = x + 4; px <= x + w - 3; px += spacing) {         // a pink heart on top of every post
    heartPath(ctx, px, y - height - 3, 3.4);
    ctx.fillStyle = "#ff8fbf";
    ctx.fill();
    ctx.lineWidth = 1.1;
    ctx.stroke();
  }
}

function plant(ctx, x, y) {
  ctx.fillStyle = "#c8693e";                         // terracotta pot
  ctx.beginPath();
  ctx.moveTo(x - 6, y - 10);
  ctx.lineTo(x + 6, y - 10);
  ctx.lineTo(x + 4, y);
  ctx.lineTo(x - 4, y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.3;
  ctx.stroke();
  ctx.fillStyle = "#4f9a52";
  for (const [dx, dy, r] of [[-5, -16, 5], [3, -19, 6], [7, -13, 4]]) {
    ctx.beginPath();
    ctx.arc(x + dx, y + dy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
}

function drawBalcony(ctx, r) {
  contactShadow(ctx, r.x + r.w / 2, r.y + r.h + 2, r.w * 0.5);
  railing(ctx, r.x, r.y, r.w, 22, 18);
  if (rnd(r.x * 0.1 + r.y) < 0.5) plant(ctx, r.x + 14, r.y);   // some have a plant
  const g = ctx.createLinearGradient(0, r.y, 0, r.y + r.h);
  g.addColorStop(0, "#ebe5d8");
  g.addColorStop(1, "#aaa294");
  ctx.fillStyle = g;
  ctx.fillRect(r.x, r.y, r.w, r.h);
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.fillRect(r.x, r.y, r.w, 2.5);
  inkBorder(ctx, r.x, r.y, r.w, r.h);
}

function drawCorridor(ctx, r) {
  railing(ctx, r.x, r.y, r.w, 30, 40);
  const g = ctx.createLinearGradient(0, r.y, 0, r.y + r.h);
  g.addColorStop(0, "#c9bfae");
  g.addColorStop(1, "#8f8678");
  ctx.fillStyle = g;
  ctx.fillRect(r.x, r.y, r.w, r.h);
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.fillRect(r.x, r.y, r.w, 2.5);
  ctx.strokeStyle = "rgba(0,0,0,0.18)";              // floor tile seams
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = Math.ceil(r.x / 50) * 50; x < r.x + r.w; x += 50) {
    ctx.moveTo(x, r.y + 3);
    ctx.lineTo(x, r.y + r.h);
  }
  ctx.stroke();
  inkBorder(ctx, r.x, r.y, r.w, r.h);
}

export function drawStreetPlatform(ctx, r) {
  switch (r.style) {
    case "awning": return drawAwning(ctx, r);
    case "roof": return drawRoof(ctx, r);
    case "balcony": return drawBalcony(ctx, r);
    case "corridor": return drawCorridor(ctx, r);
    default: return drawStreet(ctx, r);
  }
}

// ---- Hazards -----------------------------------------------------------------------

// A grumpy salaryman on a bicycle, riding back and forth.
function drawBicycle(ctx, h, t) {
  const dir = (h.vx || 1) >= 0 ? 1 : -1;
  const spin = h.x * 0.22;
  const pedal = h.x * 0.15;
  contactShadow(ctx, h.x + h.w / 2, h.y + h.h, 30);

  ctx.save();
  ctx.translate(h.x + h.w / 2, h.y + h.h);           // origin: ground, centre
  ctx.scale(dir, 1);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (const wx of [-17, 17]) {                       // wheels with spokes
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.arc(wx, -11, 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    for (let k = 0; k < 4; k++) {
      const a = spin + (k * Math.PI) / 4;
      ctx.moveTo(wx + Math.cos(a) * 9, -11 + Math.sin(a) * 9);
      ctx.lineTo(wx - Math.cos(a) * 9, -11 - Math.sin(a) * 9);
    }
    ctx.stroke();
  }

  ctx.strokeStyle = INK;                              // frame (ink under, colour over)
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-17, -11); ctx.lineTo(-4, -24); ctx.lineTo(12, -25); ctx.lineTo(17, -11);
  ctx.moveTo(-4, -24); ctx.lineTo(1, -11); ctx.lineTo(-17, -11);
  ctx.stroke();
  ctx.strokeStyle = "#e84a5f";
  ctx.lineWidth = 2.6;
  ctx.stroke();

  ctx.fillStyle = "#c79b5e";                          // front basket
  ctx.fillRect(14, -35, 13, 10);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.4;
  ctx.strokeRect(14, -35, 13, 10);

  // Rider: a cute chibi girl, drawn in the same style as all the other people.
  const look = Math.floor((h.patrol ? h.patrol.min : h.x) / 29) % GIRLS.length;
  drawChibiRider(ctx, GIRLS[(look + 2) % GIRLS.length], { t, pedal });

  ctx.restore();
}

function drawFlowerpot(ctx, h) {
  const spin = h.hidden ? 0 : Math.sin(h.y * 0.05) * 0.35;
  ctx.save();
  ctx.translate(h.x + h.w / 2, h.y + h.h / 2);
  ctx.rotate(spin);
  ctx.fillStyle = "#d4703f";
  ctx.beginPath();
  ctx.moveTo(-10, -4); ctx.lineTo(10, -4); ctx.lineTo(7, 13); ctx.lineTo(-7, 13);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.8;
  ctx.lineJoin = "round";
  ctx.stroke();
  ctx.fillStyle = "#e58a58";                          // rim
  ctx.beginPath();
  ctx.roundRect(-11, -8, 22, 6, 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#5fae56";                          // leaves and a flower
  kawaiiFace(ctx, 0, 5.5, 0.55, "angry");
  for (const [dx, dy, r] of [[-6, -13, 5], [4, -15, 6], [8, -10, 4]]) {
    ctx.beginPath();
    ctx.arc(dx, dy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.fillStyle = "#ff7aa8";
  ctx.beginPath();
  ctx.arc(0, -17, 3.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawCrate(ctx, h) {
  const spin = h.hidden ? 0 : Math.sin(h.y * 0.06) * 0.25;
  ctx.save();
  ctx.translate(h.x + h.w / 2, h.y + h.h / 2);
  ctx.rotate(spin);
  const s = h.w / 2;
  const wood = ctx.createLinearGradient(0, -s, 0, s);
  wood.addColorStop(0, "#d2a46a");
  wood.addColorStop(1, "#a97a46");
  ctx.fillStyle = wood;
  ctx.fillRect(-s, -s, s * 2, s * 2);
  ctx.strokeStyle = "#7a5530";                        // planks and cross brace
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-s, -s * 0.3); ctx.lineTo(s, -s * 0.3);
  ctx.moveTo(-s, s * 0.3); ctx.lineTo(s, s * 0.3);
  ctx.moveTo(-s, -s); ctx.lineTo(s, s);
  ctx.stroke();
  ctx.fillStyle = "#d9302e";                          // red "FRAGILE" tape
  ctx.fillRect(-s, -3, s * 2, 6);
  ctx.fillStyle = "#fff";
  for (let x = -s + 4; x < s - 3; x += 7) ctx.fillRect(x, -1, 3, 2);
  kawaiiFace(ctx, 0, s * 0.52, 0.62, "angry");
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  ctx.strokeRect(-s, -s, s * 2, s * 2);
  ctx.restore();
}

// Red "!" warning (and a dotted drop line) shown shortly before something falls.
function drawWarning(ctx, h, t) {
  const cx = h.x + h.w / 2, y = h.fall.startY + 14 + Math.sin(t * 14) * 2;
  ctx.strokeStyle = "rgba(230,50,70,0.45)";
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 7]);
  ctx.beginPath();
  ctx.moveTo(cx, y + 14);
  ctx.lineTo(cx, h.fall.endY + h.h);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "#e8344a";
  ctx.beginPath();
  ctx.moveTo(cx, y - 13);
  ctx.lineTo(cx + 13, y + 10);
  ctx.lineTo(cx - 13, y + 10);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  ctx.stroke();
  ctx.fillStyle = "#fff";
  ctx.font = "bold 14px 'Fredoka','Baloo 2',system-ui,sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("!", cx, y + 8);
}

export function drawStreetHazard(ctx, h, t) {
  if (h.fall && h.hidden) {
    if (h.warn) drawWarning(ctx, h, t);
    return;
  }
  if (h.kind === "bicycle") drawBicycle(ctx, h, t);
  else if (h.kind === "crate") drawCrate(ctx, h);
  else drawFlowerpot(ctx, h);
}

// ---- Pickups --------------------------------------------------------------------------

function glow(ctx, cx, cy, strong) {
  const g = ctx.createRadialGradient(cx, cy, 2, cx, cy, strong ? 30 : 22);
  g.addColorStop(0, strong ? "rgba(255,230,120,0.75)" : "rgba(255,236,150,0.5)");
  g.addColorStop(1, "rgba(255,236,150,0)");
  ctx.fillStyle = g;
  ctx.fillRect(cx - 32, cy - 32, 64, 64);
}

function drawCoin(ctx, t, spinSeed) {
  const sx = Math.max(0.22, Math.abs(Math.cos(t * 3 + spinSeed)));   // spins around
  ctx.scale(sx, 1);
  const g = ctx.createLinearGradient(-9, -9, 9, 9);
  g.addColorStop(0, "#fff2a8");
  g.addColorStop(1, "#e8a92a");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.8 / Math.max(sx, 0.5);
  ctx.stroke();
  if (sx > 0.5) {
    ctx.strokeStyle = "rgba(160,100,10,0.6)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.stroke();
    kawaiiFace(ctx, 0, 0.8, 0.62);                  // a smiling coin
  }
}

function drawFlyer(ctx) {
  ctx.rotate(-0.18);
  ctx.fillStyle = "#fffdf6";
  ctx.beginPath();
  ctx.roundRect(-9, -12, 18, 24, 1.5);
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.fillStyle = "#ff6fa6";                           // pink header
  ctx.fillRect(-9, -12, 18, 7);
  kawaiiFace(ctx, 0, 2, 0.6);                          // a smiling flyer
  ctx.fillStyle = "#ffb3d1";
  ctx.fillRect(-6, 8, 12, 1.5);
  ctx.fillRect(-6, 10.5, 8, 1.5);
}

function drawKey(ctx) {
  ctx.rotate(-0.5);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 5.2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-3, 0); ctx.lineTo(13, 0);                // shaft
  ctx.moveTo(9, 0); ctx.lineTo(9, 6);                  // teeth
  ctx.moveTo(13, 0); ctx.lineTo(13, 5);
  ctx.stroke();
  ctx.strokeStyle = "#f2c230";
  ctx.lineWidth = 2.6;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(-8, 0, 6, 0, Math.PI * 2);                   // round head
  ctx.fillStyle = "#f7d24a";
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(-8, 0, 2.4, 0, Math.PI * 2);
  ctx.fillStyle = "#6a4a10";
  ctx.fill();
  ctx.fillStyle = "#fff";                              // room tag
  ctx.fillRect(-14, 8, 12, 7);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.2;
  ctx.strokeRect(-14, 8, 12, 7);
  ctx.fillStyle = INK;
  ctx.font = "bold 6px 'Fredoka','Baloo 2',system-ui,sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("707", -8, 14);
}

export function drawStreetCollectible(ctx, item, t) {
  const bob = Math.sin(t * 3 + item.x * 0.02) * 3;
  const cx = item.x + item.w / 2, cy = item.y + item.h / 2 + bob;
  glow(ctx, cx, cy, item.required);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(1.2, 1.2);
  if (item.name === "yen coin") drawCoin(ctx, t, item.x * 0.01);
  else if (item.name === "room key") drawKey(ctx);
  else drawFlyer(ctx);
  ctx.restore();
  const tw = (Math.sin(t * 5 + item.x) + 1) / 2;       // sparkle
  ctx.fillStyle = `rgba(255,255,255,${0.4 + tw * 0.5})`;
  ctx.fillRect(cx + 10, cy - 14 - tw * 2, 2, 2);
}

// ---- Room 707's door ----------------------------------------------------------------------

export function drawRoomDoor(ctx, goal, unlocked, t) {
  const { x, y, w, h } = goal;
  const lamp = ctx.createRadialGradient(x + w / 2, y - 10, 2, x + w / 2, y - 10, 80);
  lamp.addColorStop(0, unlocked ? "rgba(140,255,170,0.6)" : "rgba(255,226,160,0.5)");
  lamp.addColorStop(1, "rgba(255,226,160,0)");
  ctx.fillStyle = lamp;
  ctx.fillRect(x - 70, y - 90, w + 140, 190);

  ctx.fillStyle = INK;                                  // frame
  ctx.fillRect(x - 6, y - 6, w + 12, h + 6);
  const wood = ctx.createLinearGradient(0, y, 0, y + h);
  wood.addColorStop(0, "#b87a4e");
  wood.addColorStop(1, "#8a5733");
  ctx.fillStyle = wood;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "rgba(60,30,10,0.45)";              // door panels
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 9, y + 34, w - 18, 30);
  ctx.strokeRect(x + 9, y + 70, w - 18, 34);

  ctx.fillStyle = "#e6c25a";                            // brass number plate
  ctx.beginPath();
  ctx.roundRect(x + w / 2 - 15, y + 10, 30, 18, 3);
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.6;
  ctx.stroke();
  ctx.fillStyle = INK;
  ctx.font = "bold 13px 'Fredoka','Baloo 2',system-ui,sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("707", x + w / 2, y + 24);

  ctx.fillStyle = "#f4d77a";                            // handle
  ctx.beginPath();
  ctx.arc(x + w - 12, y + 66, 4.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  if (!unlocked) {                                      // red padlock until you have the key
    const px = x + w / 2, py = y + 82;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(px, py - 4, 6, Math.PI, 0);
    ctx.stroke();
    ctx.fillStyle = "#d9302e";
    ctx.beginPath();
    ctx.roundRect(px - 9, py - 4, 18, 14, 3);
    ctx.fill();
    ctx.lineWidth = 1.6;
    ctx.stroke();
  } else {
    const pulse = 0.5 + 0.5 * Math.sin(t * 5);          // green "go" glow
    ctx.strokeStyle = `rgba(90,255,140,${0.4 + pulse * 0.5})`;
    ctx.lineWidth = 4;
    ctx.strokeRect(x - 8, y - 8, w + 16, h + 8);
  }

  ctx.fillStyle = "#6b4a3a";                            // doormat
  ctx.fillRect(x - 4, y + h - 2, w + 8, 5);
}
