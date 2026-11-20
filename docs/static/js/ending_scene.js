// The ending: one big, happy Hachi (your hand-drawn happy sprite) bouncing in
// the middle of a pastel party, with a heart glow, orbiting sparkles, floating
// hearts, balloons, a "WELCOME HOME" banner and falling confetti.
import { drawHachi } from "./hachi.js";
import { drawNanaSprite, hasSprite } from "./sprites.js";
import { drawChibiGirl, NANA } from "./people.js";
import { INK, FONT, heartPath, sparkle } from "./style.js";

const FEET = 486;
const HACHI_X = 480;       // centre of the pair (rug, glow, hearts)
const PAIR_GAP = 85;       // Hachi stands this far left of the centre, Nana this far right
const HACHI_SCALE = 4.4;
let bg = null;

function rnd(i) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function edge(ctx, lw = 2) {
  ctx.strokeStyle = INK;
  ctx.lineWidth = lw;
  ctx.lineJoin = "round";
  ctx.stroke();
}

// ---- The still background (painted once) ------------------------------------------------------

function paintBackground(w, h) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");

  const wall = ctx.createLinearGradient(0, 0, 0, h);
  wall.addColorStop(0, "#ffd3e6");
  wall.addColorStop(1, "#fff0f6");
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "rgba(255,255,255,0.45)";                 // soft stripes
  for (let x = 0; x < w; x += 64) ctx.fillRect(x, 0, 32, h);
  for (let i = 0; i < 220; i++) {                           // hearts and sparkles pattern
    const x = rnd(i) * w, y = rnd(i + 300) * 420;
    ctx.globalAlpha = 0.55;
    if (i % 3 === 0) { heartPath(ctx, x, y, 4 + rnd(i + 8) * 3); ctx.fillStyle = "#ffbfd9"; ctx.fill(); }
    else sparkle(ctx, x, y, 3 + rnd(i + 21) * 4, i % 2 ? "#fff6b8" : "#ffffff");
  }
  ctx.globalAlpha = 1;

  // floor
  const floor = ctx.createLinearGradient(0, 420, 0, h);
  floor.addColorStop(0, "#f6dcc0");
  floor.addColorStop(1, "#dcae84");
  ctx.fillStyle = floor;
  ctx.fillRect(0, 420, w, h - 420);
  ctx.strokeStyle = "rgba(140,85,55,0.25)";
  ctx.lineWidth = 1.5;
  for (let x = 0; x < w; x += 120) { ctx.beginPath(); ctx.moveTo(x, 420); ctx.lineTo(x - 30, h); ctx.stroke(); }
  ctx.fillStyle = "#fff5ea";
  ctx.fillRect(0, 414, w, 10);
  ctx.fillStyle = "#ffc2dc";
  ctx.fillRect(0, 422, w, 3);

  // round pink rug under Hachi
  ctx.fillStyle = "rgba(255,160,200,0.55)";
  ctx.beginPath();
  ctx.ellipse(HACHI_X, FEET - 2, 190, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.8)";
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.ellipse(HACHI_X, FEET - 2, 170, 21, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // banner
  const label = "WELCOME HOME";
  ctx.strokeStyle = "rgba(141,94,80,0.85)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(40, 26);
  ctx.quadraticCurveTo(w / 2, 90, w - 40, 26);
  ctx.stroke();
  const cols = ["#ff7ab8", "#ffd23a", "#6fd0f0", "#8aeb6a", "#b48af0", "#ff9a4a"];
  for (let i = 0; i < label.length; i++) {
    if (label[i] === " ") continue;
    const u = (i + 0.5) / label.length, x = 40 + (w - 80) * u;
    const y = (1 - u) * (1 - u) * 26 + 2 * (1 - u) * u * 58 + u * u * 26;
    ctx.fillStyle = cols[i % cols.length];
    ctx.beginPath();
    ctx.moveTo(x - 17, y); ctx.lineTo(x + 17, y); ctx.lineTo(x, y + 42);
    ctx.closePath();
    ctx.fill();
    edge(ctx, 2);
    ctx.fillStyle = "#fff";
    ctx.font = `bold 20px ${FONT}`;
    ctx.textAlign = "center";
    ctx.fillText(label[i], x, y + 20);
  }

  // balloons in both corners
  for (const bx of [70, 890]) {
    for (let i = 0; i < 5; i++) {
      const x = bx + (i - 2) * 26, y = 300 - (i % 3) * 28;
      ctx.strokeStyle = "rgba(141,94,80,0.7)";
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(x, y + 26);
      ctx.quadraticCurveTo(x + 8, 380, bx, FEET - 8);
      ctx.stroke();
      const col = cols[(i + (bx > 400 ? 2 : 0)) % cols.length];
      const g = ctx.createRadialGradient(x - 7, y - 8, 2, x, y, 28);
      g.addColorStop(0, "#fff");
      g.addColorStop(0.3, col);
      g.addColorStop(1, col);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(x, y, 20, 25, 0, 0, Math.PI * 2);
      ctx.fill();
      edge(ctx, 2);
    }
  }
  return c;
}

// ---- Live decorations ---------------------------------------------------------------------------

function confetti(ctx, w, h, t) {
  const cols = ["#ff7ab8", "#ffd23a", "#6fd0f0", "#8aeb6a", "#b48af0", "#ff9a4a", "#ffffff"];
  for (let i = 0; i < 80; i++) {
    const x = ((rnd(i) * w + Math.sin(t * 1.2 + i) * 34) % w + w) % w;
    const y = ((t * (46 + (i % 5) * 16) + rnd(i + 90) * (h + 80)) % (h + 60)) - 30;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t * 2.4 + i);
    ctx.fillStyle = cols[i % cols.length];
    if (i % 7 === 0) { heartPath(ctx, 0, 0, 5); ctx.fill(); }
    else if (i % 5 === 0) sparkle(ctx, 0, 0, 6, cols[i % cols.length]);
    else ctx.fillRect(-4, -2, 8, 4);
    ctx.restore();
  }
}

// A big soft heart glowing behind Hachi, pulsing gently.
function heartGlow(ctx, cx, cy, t) {
  const s = 175 + Math.sin(t * 2.4) * 6;
  const g = ctx.createRadialGradient(cx, cy, 10, cx, cy, s * 1.5);
  g.addColorStop(0, "rgba(255,255,255,0.9)");
  g.addColorStop(0.5, "rgba(255,200,225,0.55)");
  g.addColorStop(1, "rgba(255,200,225,0)");
  ctx.fillStyle = g;
  ctx.fillRect(cx - s * 1.6, cy - s * 1.6, s * 3.2, s * 3.2);
  heartPath(ctx, cx, cy + 4, s * 0.62);
  ctx.fillStyle = "rgba(255,170,208,0.5)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.9)";
  ctx.lineWidth = 4;
  ctx.stroke();
}

// Sparkles and tiny hearts circling around her.
function orbit(ctx, cx, cy, t) {
  for (let i = 0; i < 12; i++) {
    const a = t * 0.9 + (i / 12) * Math.PI * 2;
    const rx = 220 + (i % 3) * 14, ry = 140 + (i % 2) * 12;
    const x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry;
    const tw = 0.6 + 0.4 * Math.sin(t * 4 + i);
    if (i % 3 === 0) {
      heartPath(ctx, x, y, 7 * tw);
      ctx.fillStyle = "#ff8fbf";
      ctx.fill();
      edge(ctx, 1.4);
    } else {
      sparkle(ctx, x, y, 8 * tw, i % 2 ? "#fff3a8" : "#ffffff");
    }
  }
}

// Hearts floating up from Hachi like happy little bubbles.
function risingHearts(ctx, cx, t) {
  for (let i = 0; i < 7; i++) {
    const age = (t * 0.35 + i / 7) % 1;
    const x = cx + Math.sin(t * 1.3 + i * 2.1) * 50 + (i - 3) * 16;
    const y = 250 - age * 80;
    ctx.globalAlpha = Math.min(1, (1 - age) * 1.6);
    heartPath(ctx, x, y, 6 + (i % 3) * 2);
    ctx.fillStyle = i % 2 ? "#ff8fbf" : "#ffb3d6";
    ctx.fill();
    edge(ctx, 1.3);
  }
  ctx.globalAlpha = 1;
}

// ---- Public ----------------------------------------------------------------------------------------

export function drawEnding(ctx, canvas, t) {
  const w = canvas.width, h = canvas.height;
  if (!bg) bg = paintBackground(w, h);
  ctx.drawImage(bg, 0, 0);

  heartGlow(ctx, HACHI_X, 350, t);
  orbit(ctx, HACHI_X, 350, t);

  // Hachi: big, happy and bouncing (her happy sprite, or the built-in drawing).
  const bounce = Math.abs(Math.sin(t * 4)) * 16;
  ctx.fillStyle = "rgba(150,80,110,0.25)";                  // her shadow stays on the rug
  ctx.beginPath();
  ctx.ellipse(HACHI_X, FEET, 60 - bounce * 0.8, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.translate(HACHI_X - PAIR_GAP, FEET - bounce);
  ctx.scale(HACHI_SCALE, HACHI_SCALE);
  const p = {
    x: -16, y: -48, w: 32, h: 48, facingDirection: "right", velocityX: 0, velocityY: 0,
    isGrounded: true, hurtTimer: 0, happyTimer: 99,
  };
  drawHachi(ctx, p, t);
  ctx.restore();

  // Nana next to her, smiling and bouncing a little out of step.
  const nanaBounce = Math.abs(Math.sin(t * 4 + 1.6)) * 10;
  ctx.fillStyle = "rgba(150,80,110,0.25)";
  ctx.beginPath();
  ctx.ellipse(HACHI_X + PAIR_GAP, FEET, 56 - nanaBounce * 0.8, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.translate(HACHI_X + PAIR_GAP, FEET - nanaBounce);
  ctx.scale(HACHI_SCALE, HACHI_SCALE);
  if (!(hasSprite("nana") && drawNanaSprite(ctx, 0, 0, -1, "happy", t))) {
    ctx.scale(-1, 1);                                        // no sprite: the built-in Nana, facing Hachi
    drawChibiGirl(ctx, { ...NANA, bag: null, bag2: null }, { t, walking: false });
  }
  ctx.restore();

  risingHearts(ctx, HACHI_X, t);
  confetti(ctx, w, h, t);

  // title
  const text = "Welcome home, Hachi & Nana!";
  ctx.font = `bold 42px ${FONT}`;
  ctx.textAlign = "center";
  ctx.lineJoin = "round";
  ctx.lineWidth = 9;
  ctx.strokeStyle = "#ffffff";
  ctx.strokeText(text, w / 2, 150);
  ctx.fillStyle = "#e8508a";
  ctx.fillText(text, w / 2, 150);
  ctx.font = `bold 18px ${FONT}`;
  ctx.lineWidth = 5;
  ctx.strokeStyle = "rgba(255,255,255,0.9)";
  ctx.fillStyle = "#7a4a45";
  ctx.strokeText("Thanks for playing!  ♥  Press Enter to play again", w / 2, 180);
  ctx.fillText("Thanks for playing!  ♥  Press Enter to play again", w / 2, 180);
}
