// The "explaining" screens, all in the cute pastel style:
//   drawMenuScreen   - the title page: a short intro, Hachi, and Room 707
//   drawPauseScreen  - the pause page, with a reminder of the current goal
//   drawLevelIntro   - a card that slides in when a level starts (name, goal, tip)
//   drawGoalArrow    - a bouncing arrow pointing at the goal when it's off-screen
//   objectiveText    - the one-line goal shown under the HUD
import { game, data } from "./state.js";
import { drawHachi } from "./hachi.js";
import {
  INK, FONT, heartPath, sparkle, kawaiiFace, kawaiiSun, scatterTwinkles, kawaiiCard, stickerText,
} from "./style.js";

const TEXT = "#7a4a45";
const PINK = "#e8508a";

// ---- The goal text ------------------------------------------------------------------------------

// What should the player be doing right now? Before the exit is open it's the
// level's objective; once they have everything it says to go to the goal.
export function objectiveText() {
  const L = game.level;
  if (!L) return "";
  const hasRequirement = L.itemsRequired > 0 || L.collectibles.some((c) => c.required);
  const keyLeft = L.collectibles.some((c) => c.required && !c.collected);
  const unlocked = game.itemsCollected >= L.itemsRequired && !keyLeft;
  if (hasRequirement && unlocked) return "You have everything! Run to the goal!";
  return L.objective || L.name;
}

function wrapText(ctx, text, maxW) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; }
    else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

// A stand-in "player" so drawHachi can draw her on the title / pause screens.
const fakeHachi = (extra = {}) => ({
  x: -16, y: -48, w: 32, h: 48, facingDirection: "right", velocityX: 0, velocityY: 0,
  isGrounded: true, hurtTimer: 0, happyTimer: 0, ...extra,
});

function drawBigHachi(ctx, cx, feetY, scale, t, extra) {
  ctx.fillStyle = "rgba(150,80,110,0.25)";                      // her shadow
  ctx.beginPath();
  ctx.ellipse(cx, feetY, 17 * scale, 3.4 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.translate(cx, feetY);
  ctx.scale(scale, scale);
  drawHachi(ctx, fakeHachi(extra), t);
  ctx.restore();
}

// ---- The title screen ---------------------------------------------------------------------------

let menuBg = null;

function cloudBlob(c, x, y, s) {
  for (const [dx, dy, rx, ry] of [[0, 0, 34, 20], [-30, 8, 24, 15], [32, 8, 26, 15], [-10, -12, 22, 17], [14, -13, 24, 17]]) {
    const g = c.createRadialGradient(x + dx * s, y + dy * s - ry * s * 0.3, 2, x + dx * s, y + dy * s, rx * s);
    g.addColorStop(0, "rgba(255,255,255,0.98)");
    g.addColorStop(0.7, "rgba(255,244,250,0.9)");
    g.addColorStop(1, "rgba(255,220,238,0)");
    c.fillStyle = g;
    c.beginPath();
    c.ellipse(x + dx * s, y + dy * s, rx * s, ry * s, 0, 0, Math.PI * 2);
    c.fill();
  }
  kawaiiFace(c, x + 1 * s, y + 4 * s, 1.5 * s, "sleepy");
}

function paintApartment(c, x0, y0) {
  const w = 190, h = 210;
  c.fillStyle = "rgba(190,120,150,0.25)";
  c.beginPath();
  c.ellipse(x0 + w / 2, y0 + h + 2, w * 0.62, 8, 0, 0, Math.PI * 2);
  c.fill();
  const g = c.createLinearGradient(0, y0, 0, y0 + h);
  g.addColorStop(0, "#ffeadf");
  g.addColorStop(1, "#ffd2de");
  c.beginPath();
  c.roundRect(x0, y0, w, h, 10);
  c.fillStyle = g;
  c.fill();
  c.strokeStyle = INK;
  c.lineWidth = 2.6;
  c.stroke();
  c.beginPath();                                                // pink scalloped roof
  c.roundRect(x0 - 10, y0 - 16, w + 20, 20, 9);
  c.fillStyle = "#ff9cc7";
  c.fill();
  c.stroke();
  for (let i = 0; i < 9; i++) {
    c.beginPath();
    c.arc(x0 - 4 + i * 24.5, y0 + 4, 9, 0, Math.PI);
    c.fillStyle = i % 2 ? "#ffffff" : "#ffc2dc";
    c.fill();
    c.lineWidth = 1.5;
    c.stroke();
  }
  c.beginPath();                                                // the "707" sign on the roof
  c.roundRect(x0 + w / 2 - 38, y0 - 52, 76, 32, 9);
  c.fillStyle = "#fff6ee";
  c.fill();
  c.lineWidth = 2.4;
  c.stroke();
  c.fillStyle = PINK;
  c.font = `bold 22px ${FONT}`;
  c.textAlign = "center";
  c.fillText("707", x0 + w / 2 + 4, y0 - 28);
  heartPath(c, x0 + w / 2 - 25, y0 - 36, 5);
  c.fillStyle = "#ff8fbf";
  c.fill();
  for (let r = 0; r < 3; r++) {                                 // windows with warm light
    for (let col = 0; col < 3; col++) {
      const wx = x0 + 18 + col * 56, wy = y0 + 22 + r * 54;
      const lit = (r + col) % 2 === 0;
      const wg = c.createLinearGradient(0, wy, 0, wy + 34);
      wg.addColorStop(0, lit ? "#fff2b8" : "#c9e6ff");
      wg.addColorStop(1, lit ? "#ffd27a" : "#9cc3ee");
      c.fillStyle = wg;
      c.fillRect(wx, wy, 34, 34);
      c.strokeStyle = "#ffffff";
      c.lineWidth = 3;
      c.strokeRect(wx, wy, 34, 34);
      c.strokeStyle = INK;
      c.lineWidth = 1.6;
      c.strokeRect(wx - 1.5, wy - 1.5, 37, 37);
      if (lit) { heartPath(c, wx + 17, wy + 18, 6); c.fillStyle = "rgba(255,150,190,0.85)"; c.fill(); }
    }
  }
  c.beginPath();                                                // the front door
  c.roundRect(x0 + w / 2 - 22, y0 + h - 56, 44, 56, [10, 10, 2, 2]);
  c.fillStyle = "#ff9cc7";
  c.fill();
  c.lineWidth = 2.4;
  c.stroke();
  c.beginPath();
  c.arc(x0 + w / 2 + 12, y0 + h - 26, 3.4, 0, Math.PI * 2);
  c.fillStyle = "#ffe36a";
  c.fill();
  c.lineWidth = 1.4;
  c.stroke();
  heartPath(c, x0 + w / 2, y0 + h - 40, 6);
  c.fillStyle = "#fff";
  c.fill();
  for (const bx of [x0 - 26, x0 + w + 26]) {                    // balloons tied beside the building
    for (let i = 0; i < 3; i++) {
      const bxx = bx + (i - 1) * 14, byy = y0 + 70 - i * 18 - (bx > x0 ? 10 : 0);
      c.strokeStyle = "rgba(141,94,80,0.7)";
      c.lineWidth = 1.2;
      c.beginPath();
      c.moveTo(bxx, byy + 18);
      c.quadraticCurveTo(bxx + 5, y0 + h - 30, bx, y0 + h - 4);
      c.stroke();
      const col = ["#ff7ab8", "#6fd0f0", "#ffd23a", "#b48af0", "#8aeb6a"][(i + (bx > x0 ? 2 : 0)) % 5];
      c.fillStyle = col;
      c.beginPath();
      c.ellipse(bxx, byy, 12, 15, 0, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = INK;
      c.lineWidth = 1.6;
      c.stroke();
    }
  }
}

// Pastel Tokyo far away behind the hills: little buildings with lit windows and a
// pink-and-white Tokyo Tower.
function paintSkyline(c, w, base) {
  const cols = ["#e9dcf8", "#fbd9ea", "#d9ebfb", "#f3e3fa", "#ffe6ef"];
  let x = -10;
  for (let i = 0; x < w; i++) {
    const bw = 46 + ((i * 37) % 38), bh = 60 + ((i * 53) % 95);
    c.beginPath();
    c.roundRect(x, base - bh, bw, bh + 40, [6, 6, 0, 0]);
    c.fillStyle = cols[i % cols.length];
    c.fill();
    c.strokeStyle = "rgba(141,94,80,0.4)";
    c.lineWidth = 1.5;
    c.stroke();
    for (let wy = base - bh + 12; wy < base - 8; wy += 17) {          // tiny lit windows
      for (let wx = x + 9; wx < x + bw - 10; wx += 14) {
        c.fillStyle = (wx + wy + i) % 3 === 0 ? "#fff0a8" : "rgba(255,255,255,0.8)";
        c.fillRect(wx, wy, 7, 9);
      }
    }
    x += bw + 6;
  }
  const tx = 468;                                                       // Tokyo Tower
  c.beginPath();
  c.moveTo(tx - 34, base + 10);
  c.lineTo(tx - 7, base - 150);
  c.lineTo(tx - 3, base - 200);
  c.lineTo(tx, base - 238);
  c.lineTo(tx + 3, base - 200);
  c.lineTo(tx + 7, base - 150);
  c.lineTo(tx + 34, base + 10);
  c.closePath();
  c.fillStyle = "#ffb5b0";
  c.fill();
  c.strokeStyle = INK;
  c.lineWidth = 2;
  c.lineJoin = "round";
  c.stroke();
  for (const [by, bw] of [[base - 120, 15], [base - 60, 25]]) {          // white bands and decks
    c.beginPath();
    c.roundRect(tx - bw - 5, by, (bw + 5) * 2, 12, 5);
    c.fillStyle = "#fff7f4";
    c.fill();
    c.stroke();
  }
  c.beginPath();
  c.moveTo(tx - 24, base - 30); c.lineTo(tx + 24, base - 30);
  c.moveTo(tx - 15, base - 90); c.lineTo(tx + 15, base - 90);
  c.strokeStyle = "rgba(255,255,255,0.8)";
  c.lineWidth = 2.4;
  c.stroke();
}

// A cherry-blossom tree: brown trunk and a fluffy cloud of pink blossoms.
function paintSakura(c, x, base, s = 1) {
  c.save();
  c.translate(x, base);
  c.scale(s, s);
  c.beginPath();
  c.moveTo(-9, 0);
  c.quadraticCurveTo(-5, -50, -14, -92);
  c.lineTo(-5, -100);
  c.quadraticCurveTo(3, -60, 9, 0);
  c.closePath();
  c.fillStyle = "#c08a78";
  c.fill();
  c.strokeStyle = INK;
  c.lineWidth = 2.4;
  c.lineJoin = "round";
  c.stroke();
  c.strokeStyle = INK;                                                  // a few branches reaching into the blossoms
  c.lineWidth = 3.2;
  c.lineCap = "round";
  for (const [x1, y1, x2, y2, x3, y3] of [[-8, -92, -30, -118, -52, -126], [-4, -96, 6, -128, 2, -158], [-2, -92, 26, -116, 50, -122]]) {
    c.beginPath();
    c.moveTo(x1, y1);
    c.quadraticCurveTo(x2, y2, x3, y3);
    c.stroke();
  }
  const rnd = (i) => { const v = Math.sin(i * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
  // Only real blossoms, no solid shapes: a deeper-pink layer at the back for
  // depth, then a lighter layer in front. They overlap to make the canopy.
  for (let layer = 0; layer < 2; layer++) {
    const count = layer === 0 ? 80 : 150;
    for (let i = 0; i < count; i++) {
      const k = i + layer * 1000;
      const a = rnd(k) * Math.PI * 2, d = Math.sqrt(rnd(k + 300)) * (layer === 0 ? 70 : 64);
      const bx = Math.cos(a) * d * 1.15, by = -150 + Math.sin(a) * d * 0.8;
      blossom(c, bx, by, 5 + rnd(k + 600) * 4, rnd(k + 900) * 6.28, layer === 0);
    }
  }
  c.restore();
}

// One cherry blossom: five heart-shaped petals with a little notch at the tip,
// pale pink fading to deeper pink at the centre, and golden stamens.
function blossom(c, x, y, r, rot, deep = false) {
  c.save();
  c.translate(x, y);
  c.rotate(rot);
  for (let k = 0; k < 5; k++) {
    c.rotate((Math.PI * 2) / 5);
    c.beginPath();
    c.moveTo(0, 0);
    c.bezierCurveTo(-r * 0.75, -r * 0.35, -r * 0.8, -r * 1.15, -r * 0.16, -r * 1.05);   // notched tip
    c.lineTo(0, -r * 0.88);
    c.lineTo(r * 0.16, -r * 1.05);
    c.bezierCurveTo(r * 0.8, -r * 1.15, r * 0.75, -r * 0.35, 0, 0);
    c.closePath();
    const g = c.createLinearGradient(0, 0, 0, -r);
    g.addColorStop(0, deep ? "#f0719f" : "#ff9ec2");
    g.addColorStop(0.55, deep ? "#ffb3cd" : "#ffd2e2");
    g.addColorStop(1, deep ? "#ffd9e6" : "#fff1f6");
    c.fillStyle = g;
    c.fill();
    c.strokeStyle = "rgba(214,120,155,0.75)";
    c.lineWidth = 0.7;
    c.stroke();
  }
  c.strokeStyle = "#e8508a";                                            // stamens
  c.lineWidth = 0.6;
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2;
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(Math.cos(a) * r * 0.5, Math.sin(a) * r * 0.5);
    c.stroke();
    c.fillStyle = "#ffe08a";
    c.beginPath();
    c.arc(Math.cos(a) * r * 0.5, Math.sin(a) * r * 0.5, r * 0.1, 0, Math.PI * 2);
    c.fill();
  }
  c.fillStyle = "#e8508a";
  c.beginPath();
  c.arc(0, 0, r * 0.12, 0, Math.PI * 2);
  c.fill();
  c.restore();
}

function paintSignpost(c, x, base) {
  c.beginPath();
  c.roundRect(x - 4, base - 78, 8, 80, 3);
  c.fillStyle = "#c9a07a";
  c.fill();
  c.strokeStyle = INK;
  c.lineWidth = 2;
  c.stroke();
  c.beginPath();                                                        // pointing board
  c.moveTo(x - 46, base - 108);
  c.lineTo(x + 34, base - 108);
  c.lineTo(x + 52, base - 91);
  c.lineTo(x + 34, base - 74);
  c.lineTo(x - 46, base - 74);
  c.closePath();
  c.fillStyle = "#fff6ee";
  c.fill();
  c.lineWidth = 2.4;
  c.lineJoin = "round";
  c.stroke();
  c.fillStyle = PINK;
  c.font = `bold 17px ${FONT}`;
  c.textAlign = "center";
  c.fillText("Tokyo", x - 4, base - 85);
  heartPath(c, x + 30, base - 96, 4);
  c.fillStyle = "#ff8fbf";
  c.fill();
}

function paintFlowers(c, w, base) {
  const petals = ["#ffffff", "#fff3a8", "#cfe8ff", "#e4d6ff"];
  for (let i = 0; i < 22; i++) {
    const x = 14 + i * 44 + (i * 17) % 23;
    if (x > 120 && x < 235) continue;                                   // leave room for the suitcase
    const y = base + 6 + ((i * 7) % 5);
    c.strokeStyle = "#5fb86a";
    c.lineWidth = 2.2;
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x, y - 12);
    c.stroke();
    c.fillStyle = petals[i % petals.length];
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      c.beginPath();
      c.arc(x + Math.cos(a) * 4.4, y - 14 + Math.sin(a) * 4.4, 3.4, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = "rgba(141,94,80,0.6)";
      c.lineWidth = 1;
      c.stroke();
    }
    c.fillStyle = "#ffcf3a";
    c.beginPath();
    c.arc(x, y - 14, 2.8, 0, Math.PI * 2);
    c.fill();
  }
}

function paintMenuBackground(w, h) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");

  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#9fd2f6");
  sky.addColorStop(0.45, "#d9e8fb");
  sky.addColorStop(0.75, "#ffd6ea");
  sky.addColorStop(1, "#fff0f6");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
  scatterTwinkles(ctx, w, h, 46, 3, 0.7);
  kawaiiSun(ctx, 868, 88, 32);
  cloudBlob(ctx, 110, 90, 1.0);
  cloudBlob(ctx, 700, 62, 0.9);
  cloudBlob(ctx, 480, 232, 0.7);
  cloudBlob(ctx, 880, 250, 0.8);

  paintSkyline(ctx, w, 444);                                    // Tokyo in the distance

  ctx.fillStyle = "#e2d3f6";                                    // soft hills
  ctx.beginPath();
  ctx.ellipse(160, 520, 330, 110, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#d4c3f0";
  ctx.beginPath();
  ctx.ellipse(780, 530, 380, 120, 0, 0, Math.PI * 2);
  ctx.fill();

  paintApartment(ctx, 648, 252);

  const ground = ctx.createLinearGradient(0, 458, 0, h);        // pink candy ground with a scalloped edge
  ground.addColorStop(0, "#ffd0e4");
  ground.addColorStop(1, "#ff9cc7");
  ctx.fillStyle = ground;
  ctx.fillRect(0, 466, w, h - 466);
  for (let x = 0; x < w + 28; x += 28) {
    ctx.beginPath();
    ctx.arc(x, 466, 15, 0, Math.PI * 2);
    ctx.fillStyle = "#ffd0e4";
    ctx.fill();
  }
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(0, 480);
  ctx.lineTo(w, 480);
  ctx.globalAlpha = 0.0;
  ctx.stroke();
  ctx.globalAlpha = 1;
  for (let i = 0; i < 40; i++) {                                // sprinkles
    const x = (i * 97.3) % w, y = 492 + ((i * 41.7) % 40);
    ctx.fillStyle = ["#ffffff", "#fff3a8", "#9ad9f5", "#b9a6f2"][i % 4];
    if (i % 5 === 0) { heartPath(ctx, x, y, 3.4); ctx.fill(); }
    else { ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill(); }
  }

  paintSakura(ctx, 52, 478, 1.05);                              // blossom trees, flowers and a signpost
  paintSakura(ctx, 548, 478, 0.9);
  paintSignpost(ctx, 270, 478);
  paintFlowers(ctx, w, 480);

  ctx.save();                                                   // Hachi's pink suitcase with a bow
  ctx.translate(176, 470);
  ctx.beginPath();
  ctx.roundRect(-26, -40, 52, 40, 8);
  ctx.fillStyle = "#ff9cc7";
  ctx.fill();
  ctx.lineWidth = 2.4;
  ctx.stroke();
  ctx.beginPath();
  ctx.roundRect(-9, -50, 18, 12, 4);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.stroke();
  kawaiiFace(ctx, 0, -18, 1.3);
  ctx.restore();
  return c;
}

export function drawMenuScreen(ctx, canvas, t) {
  const w = canvas.width, h = canvas.height;
  if (!menuBg) menuBg = paintMenuBackground(w, h);
  ctx.drawImage(menuBg, 0, 0);

  // Hachi, bouncing happily on the path to Room 707.
  const bounce = Math.abs(Math.sin(t * 3)) * 9;
  const hx = 372;
  ctx.fillStyle = "rgba(150,80,110,0.25)";
  ctx.beginPath();
  ctx.ellipse(hx, 470, 52 - bounce, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.translate(hx, 470 - bounce);
  ctx.scale(3.2, 3.2);
  drawHachi(ctx, fakeHachi(), t);
  ctx.restore();
  for (let i = 0; i < 5; i++) {                                 // little hearts float up from her
    const a = (t * 0.4 + i / 5) % 1;
    ctx.globalAlpha = Math.min(1, (1 - a) * 1.6);
    heartPath(ctx, hx + Math.sin(t * 1.4 + i * 2) * 38 + (i - 2) * 14, 330 - a * 70, 5 + (i % 3));
    ctx.fillStyle = "#ff8fbf";
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  for (let i = 0; i < 30; i++) {                                // cherry-blossom petals drift down
    const px = ((i * 83.7 + t * (16 + (i % 4) * 6) + Math.sin(t * 0.8 + i) * 20) % (w + 60)) - 30;
    const py = ((i * 61.3 + t * (24 + (i % 3) * 9)) % (h + 40)) - 20;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(t * 1.1 + i);
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = i % 3 === 0 ? "#ffffff" : "#ffc2dc";
    ctx.beginPath();
    ctx.ellipse(0, 0, 5.2, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Title card.
  kawaiiCard(ctx, 150, 20, 660, 94, 26);
  stickerText(ctx, "Hachi Hops Home!", w / 2, 82, 48, PINK, "center", 9);
  for (const [sx, sy, r, ph] of [[176, 46, 9, 0], [786, 52, 7, 1.3], [200, 98, 6, 2.1], [768, 98, 8, 0.7]]) {
    sparkle(ctx, sx, sy, r * (0.8 + 0.25 * Math.sin(t * 3 + ph)), "#ffd23a");
  }
  ctx.fillStyle = "#ff8fbf";
  heartPath(ctx, 786, 40, 7);
  ctx.fill();
  heartPath(ctx, 176, 96, 7);
  ctx.fill();

  // The very short story.
  kawaiiCard(ctx, 150, 126, 660, 80, 22);
  ctx.textAlign = "center";
  ctx.font = `bold 19px ${FONT}`;
  ctx.fillStyle = TEXT;
  ctx.fillText("Hachi is heading to Tokyo for a fresh start and her dreams!", w / 2, 158);
  ctx.fillStyle = PINK;
  ctx.fillText("Help her catch the train and find Room 707 ♥", w / 2, 188);

  // "Press Enter" pulses; the controls sit underneath.
  const pulse = 1 + Math.sin(t * 4) * 0.04;
  ctx.save();
  ctx.translate(w / 2, 506);
  ctx.scale(pulse, pulse);
  stickerText(ctx, "Press Enter to begin Hachi's story ♥", 0, 0, 27, PINK, "center", 8);
  ctx.restore();
  stickerText(ctx, "← → move    ↑ jump    P pause    M sound", w / 2, 528, 14, TEXT, "center", 5);
}

// ---- The pause screen ---------------------------------------------------------------------------

function keyBadge(ctx, x, y, label) {
  ctx.font = `bold 15px ${FONT}`;
  const kw = Math.max(34, ctx.measureText(label).width + 20);
  ctx.beginPath();
  ctx.roundRect(x, y - 15, kw, 28, 9);
  ctx.fillStyle = "#ffe3ee";
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = TEXT;
  ctx.textAlign = "center";
  ctx.fillText(label, x + kw / 2, y + 5);
  return kw;
}

export function drawPauseScreen(ctx, canvas, t) {
  const w = canvas.width, h = canvas.height;
  ctx.fillStyle = "rgba(255,214,234,0.58)";                      // pink veil over the paused game
  ctx.fillRect(0, 0, w, h);

  const cw = 700, ch = 340, cx0 = (w - cw) / 2, cy0 = 104;
  kawaiiCard(ctx, cx0, cy0, cw, ch, 28);
  stickerText(ctx, "Paused", w / 2, cy0 + 62, 44, PINK, "center", 10);
  for (const [sx, sy, r, ph] of [[cx0 + 40, cy0 + 40, 9, 0], [cx0 + cw - 44, cy0 + 46, 7, 1.3], [cx0 + 56, cy0 + ch - 36, 6, 2.1], [cx0 + cw - 60, cy0 + ch - 34, 8, 0.7]]) {
    sparkle(ctx, sx, sy, r * (0.8 + 0.25 * Math.sin(t * 3 + ph)), "#ffd23a");
  }

  // Sleepy Hachi on the left, eyes closed (the happy picture has them shut), with floating z's.
  drawBigHachi(ctx, cx0 + 140, cy0 + ch - 26, 2.4, t, { happyTimer: 1 });
  for (let i = 0; i < 3; i++) {
    const a = (t * 0.55 + i / 3) % 1;
    ctx.globalAlpha = Math.min(1, (1 - a) * 1.8);
    stickerText(ctx, ["z", "Z", "Z"][i], cx0 + 215 + a * 26 + i * 10, cy0 + 134 - a * 58, 18 + i * 8, "#8a6ae0", "center", 6);
  }
  ctx.globalAlpha = 1;

  // The current goal, so you never forget it.
  ctx.textAlign = "left";
  ctx.font = `bold 16px ${FONT}`;
  ctx.fillStyle = "#ff8fbf";
  ctx.fillText("♥ YOUR GOAL", cx0 + 300, cy0 + 112);
  ctx.font = `bold 21px ${FONT}`;
  ctx.fillStyle = TEXT;
  const lines = wrapText(ctx, objectiveText(), cw - 340);
  lines.forEach((ln, i) => ctx.fillText(ln, cx0 + 300, cy0 + 140 + i * 26));

  // What the keys do.
  const rows = [["P", "keep playing"], ["R", "restart this level"], ["M", "sound on / off"], ["Esc", "back to the main menu"]];
  rows.forEach(([key, what], i) => {
    const y = cy0 + 206 + i * 34;
    const kw = keyBadge(ctx, cx0 + 300, y, key);
    ctx.textAlign = "left";
    ctx.font = `bold 17px ${FONT}`;
    ctx.fillStyle = TEXT;
    ctx.fillText(what, cx0 + 300 + kw + 14, y + 5);
  });
  const pulse = 1 + Math.sin(t * 4) * 0.04;
  ctx.save();
  ctx.translate(w / 2, cy0 + ch + 38);
  ctx.scale(pulse, pulse);
  stickerText(ctx, "Take a little break ♥", 0, 0, 22, PINK, "center", 7);
  ctx.restore();
}

// ---- The level intro card -----------------------------------------------------------------------

const INTRO_FRAMES = 280;                                       // about 4.5 seconds

export function drawLevelIntro(ctx, canvas, t) {
  const L = game.level;
  const f = game.frame;
  if (game.state !== "PLAYING" || !L || f > INTRO_FRAMES) return;
  const w = canvas.width;
  const slide = Math.min(1, f / 18);
  const ease = 1 - Math.pow(1 - slide, 3);
  const fade = Math.min(1, (INTRO_FRAMES - f) / 36);
  const cw = 680, ch = 132, x = (w - cw) / 2, y = 112 + (1 - ease) * -70;

  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, fade));
  kawaiiCard(ctx, x, y, cw, ch, 26);

  const badge = `LEVEL ${game.currentLevel}`;                    // pink badge on the top edge
  ctx.font = `bold 15px ${FONT}`;
  const bw = ctx.measureText(badge).width + 28;
  ctx.beginPath();
  ctx.roundRect(w / 2 - bw / 2, y - 14, bw, 28, 12);
  ctx.fillStyle = "#ff8fbf";
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.2;
  ctx.stroke();
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.fillText(badge, w / 2, y + 6);

  stickerText(ctx, L.name, w / 2, y + 50, 27, PINK, "center", 7);
  ctx.font = `bold 21px ${FONT}`;
  ctx.fillStyle = TEXT;
  ctx.textAlign = "center";
  ctx.fillText(`★ ${L.objective}`, w / 2, y + 82);
  if (L.tip) {
    ctx.font = `bold 15px ${FONT}`;
    ctx.fillStyle = "#b07a8a";
    ctx.fillText(L.tip, w / 2, y + 110);
  }
  for (const [sx, sy, r, ph] of [[x + 34, y + 62, 8, 0], [x + cw - 34, y + 62, 8, 1.4]]) {
    sparkle(ctx, sx, sy, r * (0.8 + 0.25 * Math.sin(t * 3 + ph)), "#ffd23a");
  }
  ctx.restore();
}

// ---- The goal arrow ---------------------------------------------------------------------------------

// When the goal is off-screen, a pink arrow at the screen edge points toward it.
export function drawGoalArrow(ctx, canvas, t) {
  const L = game.level;
  if (game.state !== "PLAYING" || !L) return;
  const W = canvas.width, H = canvas.height;
  const g = L.goal;
  const gx = g.x + g.w / 2 - game.cameraX, gy = g.y + g.h / 2 - game.cameraY;
  if (gx > 20 && gx < W - 20 && gy > 20 && gy < H - 20) return;     // already on screen

  const left = 44, right = W - 44, top = 104, bottom = H - 44;
  const cx = W / 2, cy = H / 2;
  const dx = gx - cx, dy = gy - cy;
  const tx = dx > 0 ? (right - cx) / dx : dx < 0 ? (left - cx) / dx : Infinity;
  const ty = dy > 0 ? (bottom - cy) / dy : dy < 0 ? (top - cy) / dy : Infinity;
  const k = Math.min(tx, ty);
  const px = cx + dx * k, py = cy + dy * k;
  const ang = Math.atan2(dy, dx);
  const bob = Math.sin(t * 6) * 5;

  ctx.save();
  ctx.translate(px + Math.cos(ang) * bob, py + Math.sin(ang) * bob);
  ctx.rotate(ang);
  ctx.beginPath();                                                 // a chunky arrow
  ctx.moveTo(20, 0);
  ctx.lineTo(2, -16);
  ctx.lineTo(2, -7);
  ctx.lineTo(-16, -7);
  ctx.lineTo(-16, 7);
  ctx.lineTo(2, 7);
  ctx.lineTo(2, 16);
  ctx.closePath();
  ctx.fillStyle = "#ff8fbf";
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.6;
  ctx.lineJoin = "round";
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.fillRect(-12, -4.5, 12, 3);
  ctx.restore();

  const lx = px - Math.cos(ang) * 40, ly = py - Math.sin(ang) * 40;   // "GOAL" label just inside
  stickerText(ctx, "GOAL ♥", lx, ly + 5, 15, PINK, "center", 6);
}
