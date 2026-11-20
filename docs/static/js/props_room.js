// Level 4 objects (Room 707, housewarming party): platforms (wood floor,
// cardboard moving boxes, wobbly retro tables, a record shelf, kitchen counters),
// hazards (boiling-over pots, falling teacups, spilled soda), the party items
// and the front door with its doorbell. Everything is round, pastel and has a
// warm brown outline, like Hachi's art, and most things have little faces.
// `t` is time in seconds, used for the small animations.

import {
  kawaiiFace, pickupBubble, bow, sprinkles, gloss, heartPath, sparkle, FONT,
} from "./style.js";

const INK = "#8d5e50";

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function outline(ctx, lw = 2.2) {
  ctx.strokeStyle = INK;
  ctx.lineWidth = lw;
  ctx.lineJoin = "round";
  ctx.stroke();
}

function shadow(ctx, cx, y, rx) {
  ctx.fillStyle = "rgba(150,80,110,0.28)";
  ctx.beginPath();
  ctx.ellipse(cx, y, rx, 3.4, 0, 0, Math.PI * 2);
  ctx.fill();
}

// ---- Platforms (still ones are baked once; tables and sliding boxes are live) --------------

function drawWood(ctx, r) {
  const g = ctx.createLinearGradient(0, r.y, 0, r.y + r.h);
  g.addColorStop(0, "#f6dcc0");
  g.addColorStop(1, "#dcae84");
  ctx.fillStyle = g;
  ctx.fillRect(r.x, r.y, r.w, r.h);
  ctx.strokeStyle = "rgba(140,85,55,0.28)";           // plank seams
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  for (let x = Math.ceil(r.x / 130) * 130; x < r.x + r.w; x += 130) {
    ctx.moveTo(x, r.y + 12);
    ctx.lineTo(x, r.y + r.h);
  }
  ctx.moveTo(r.x, r.y + 34);
  ctx.lineTo(r.x + r.w, r.y + 34);
  ctx.stroke();
  ctx.strokeStyle = "rgba(150,95,60,0.22)";            // wood grain
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = r.x + 20; x < r.x + r.w; x += 47) {
    ctx.moveTo(x, r.y + 18); ctx.lineTo(x + 24, r.y + 18);
    ctx.moveTo(x + 12, r.y + 44); ctx.lineTo(x + 36, r.y + 44);
  }
  ctx.stroke();
  ctx.fillStyle = "#fff5ea";                           // cream baseboard strip
  ctx.fillRect(r.x, r.y, r.w, 10);
  ctx.fillStyle = "rgba(255,180,205,0.7)";
  ctx.fillRect(r.x, r.y + 8, r.w, 2);
  sprinkles(ctx, r.x, r.y + 14, r.w, r.h - 18, 7, Math.floor(r.w / 38));
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.2;
  ctx.strokeRect(r.x + 1.1, r.y + 1.1, r.w - 2.2, r.h - 2.2);
}

// A cardboard moving box. Big ones (like the 120px tall stack) get a seam.
function drawBox(ctx, r) {
  shadow(ctx, r.x + r.w / 2, r.y + r.h + 1, r.w * 0.55);
  const g = ctx.createLinearGradient(0, r.y, 0, r.y + r.h);
  g.addColorStop(0, "#f2cd98");
  g.addColorStop(1, "#d9a86a");
  rr(ctx, r.x, r.y, r.w, r.h, 6);
  ctx.fillStyle = g;
  ctx.fill();
  outline(ctx, 2.4);
  ctx.fillStyle = "rgba(255,243,214,0.8)";             // packing tape down the middle
  ctx.fillRect(r.x + r.w / 2 - 6, r.y + 2, 12, r.h - 4);
  ctx.strokeStyle = "rgba(150,100,50,0.5)";             // top flap line
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(r.x + 4, r.y + 9);
  ctx.lineTo(r.x + r.w - 4, r.y + 9);
  if (r.h > 90) { ctx.moveTo(r.x + 3, r.y + r.h / 2); ctx.lineTo(r.x + r.w - 3, r.y + r.h / 2); }   // two stacked boxes
  ctx.stroke();
  const rows = r.h > 90 ? 2 : 1;
  for (let k = 0; k < rows; k++) {                      // every box has a happy face
    const cy = r.y + (r.h / rows) * (k + 0.58);
    kawaiiFace(ctx, r.x + r.w * 0.28, cy, Math.min(r.w, r.h / rows) / 36 + 0.2);
    heartPath(ctx, r.x + r.w * 0.76, cy - 2, 5);
    ctx.fillStyle = "#ff8fbf";
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }
  gloss(ctx, r.x, r.y, r.w, r.h);
  bow(ctx, r.x + 8, r.y + 8, 0.7, "#ff7ab8");
}

// A box on little wheels that slides along (live: it moves).
function drawMoveBox(ctx, r, t) {
  for (const wx of [r.x + 14, r.x + r.w - 14]) {
    ctx.fillStyle = "#6a5a78";
    ctx.beginPath();
    ctx.arc(wx, r.y + r.h + 5, 5, 0, Math.PI * 2);
    ctx.fill();
    outline(ctx, 1.4);
    ctx.fillStyle = "#e8dff5";
    ctx.beginPath();
    ctx.arc(wx, r.y + r.h + 5, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }
  drawBox(ctx, r);
  ctx.strokeStyle = "rgba(255,143,191,0.9)";            // little pink "slide" arrows
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  const dir = Math.sign(Math.cos(t * 2.1)) || 1;
  ctx.beginPath();
  ctx.moveTo(r.x + r.w / 2 - 6, r.y - 6); ctx.lineTo(r.x + r.w / 2 + 6, r.y - 6);
  ctx.moveTo(r.x + r.w / 2 + 6 * dir, r.y - 6); ctx.lineTo(r.x + r.w / 2 + 2 * dir, r.y - 9);
  ctx.moveTo(r.x + r.w / 2 + 6 * dir, r.y - 6); ctx.lineTo(r.x + r.w / 2 + 2 * dir, r.y - 3);
  ctx.stroke();
}

// A wall shelf full of pastel brackets and fairy lights (the pickups float above it).
function drawShelf(ctx, r) {
  for (const bx of [r.x + 14, r.x + r.w - 14]) {        // pink brackets
    ctx.beginPath();
    ctx.moveTo(bx - 7, r.y + r.h);
    ctx.lineTo(bx + 7, r.y + r.h);
    ctx.lineTo(bx, r.y + r.h + 18);
    ctx.closePath();
    ctx.fillStyle = "#ff9cc7";
    ctx.fill();
    outline(ctx, 1.6);
  }
  const g = ctx.createLinearGradient(0, r.y, 0, r.y + r.h);
  g.addColorStop(0, "#fbe0bf");
  g.addColorStop(1, "#e4b88c");
  rr(ctx, r.x, r.y, r.w, r.h, 6);
  ctx.fillStyle = g;
  ctx.fill();
  outline(ctx, 2.2);
  gloss(ctx, r.x, r.y, r.w, r.h);
  ctx.strokeStyle = "rgba(140,90,60,0.6)";               // a string of fairy lights underneath
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(r.x + 6, r.y + r.h + 2);
  ctx.quadraticCurveTo(r.x + r.w / 2, r.y + r.h + 20, r.x + r.w - 6, r.y + r.h + 2);
  ctx.stroke();
  const cols = ["#ff7ab8", "#ffd23a", "#6fd0f0", "#8aeb6a", "#b48af0"];
  for (let i = 0; i < 6; i++) {
    const u = (i + 0.5) / 6;
    const lx = r.x + 6 + (r.w - 12) * u, ly = r.y + r.h + 2 + 16 * 4 * u * (1 - u) * 0.95;
    ctx.fillStyle = cols[i % cols.length];
    ctx.beginPath();
    ctx.arc(lx, ly + 3, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

// A kitchen counter: mint cabinet doors with heart knobs under a marble top.
function drawCounter(ctx, r) {
  shadow(ctx, r.x + r.w / 2, r.y + r.h + 1, r.w * 0.5);
  const g = ctx.createLinearGradient(0, r.y, 0, r.y + r.h);
  g.addColorStop(0, "#d4f4e6");
  g.addColorStop(1, "#a5dcc6");
  rr(ctx, r.x, r.y, r.w, r.h, 5);
  ctx.fillStyle = g;
  ctx.fill();
  outline(ctx, 2.4);
  const doors = Math.max(1, Math.round(r.w / 62));
  const dw = (r.w - 12) / doors;
  for (let i = 0; i < doors; i++) {
    const dx = r.x + 6 + i * dw;
    rr(ctx, dx + 2, r.y + 20, dw - 4, r.h - 30, 5);
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fill();
    ctx.strokeStyle = "rgba(60,140,110,0.6)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    heartPath(ctx, dx + dw / 2, r.y + 20 + (r.h - 30) * 0.28, 4.4);   // heart-shaped knob
    ctx.fillStyle = "#ff8fbf";
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }
  ctx.fillStyle = "#fffaf3";                              // marble worktop with a pink rim
  rr(ctx, r.x - 3, r.y - 3, r.w + 6, 14, 5);
  ctx.fill();
  outline(ctx, 2.2);
  sprinkles(ctx, r.x, r.y - 1, r.w, 8, r.x, Math.floor(r.w / 26));
  gloss(ctx, r.x - 3, r.y - 3, r.w + 6, 14);
}

export function drawRoomPlatform(ctx, r, t = 0) {
  switch (r.style) {
    case "box": return drawBox(ctx, r);
    case "movebox": return drawMoveBox(ctx, r, t);
    case "shelf": return drawShelf(ctx, r);
    case "counter": return drawCounter(ctx, r);
    case "table": return drawTable(ctx, r, t);
    default: return drawWood(ctx, r);
  }
}

// ---- The wobbly retro table (fragile) --------------------------------------------------------

function drawTable(ctx, r, t) {
  if (r.state === "fallen" && r.fallAge > 46) return;            // gone until it respawns
  ctx.save();
  const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
  if (r.state === "shaking") {                                  // wobbling: about to go!
    ctx.translate(Math.sin(t * 60) * 1.8, 0);
    ctx.translate(cx, cy); ctx.rotate(Math.sin(t * 47) * 0.04); ctx.translate(-cx, -cy);
  } else if (r.state === "fallen") {                            // tipping off and falling
    const a = r.fallAge;
    ctx.globalAlpha = Math.max(0, 1 - a / 46);
    ctx.translate(cx, cy + a * a * 0.3);
    ctx.rotate(a * 0.07);
    ctx.translate(-cx, -cy);
  }
  const floorY = 480;
  // legs: splayed retro legs down to the floor, with little round feet
  ctx.strokeStyle = INK;
  ctx.lineCap = "round";
  for (const [sx, ex] of [[r.x + 14, r.x + 4], [r.x + r.w - 14, r.x + r.w - 4]]) {
    ctx.lineWidth = 6.5;
    ctx.beginPath();
    ctx.moveTo(sx, r.y + r.h);
    ctx.lineTo(ex, floorY - 4);
    ctx.stroke();
    ctx.strokeStyle = "#ffb3d1";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.strokeStyle = INK;
    ctx.fillStyle = "#ff8fbf";
    ctx.beginPath();
    ctx.arc(ex, floorY - 3, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 1.4;
    ctx.stroke();
  }
  // gingham tablecloth drape with scalloped hearts
  const n = Math.round(r.w / 14);
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = i % 2 ? "#ffffff" : "#ffc2dc";
    ctx.beginPath();
    ctx.arc(r.x + 7 + i * (r.w - 14) / (n - 1), r.y + r.h, 7, 0, Math.PI);
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.3;
    ctx.stroke();
  }
  const g = ctx.createLinearGradient(0, r.y, 0, r.y + r.h);
  g.addColorStop(0, "#fffaf6");
  g.addColorStop(1, "#ffd2e4");
  rr(ctx, r.x, r.y, r.w, r.h, 7);
  ctx.fillStyle = g;
  ctx.fill();
  outline(ctx, 2.3);
  gloss(ctx, r.x, r.y, r.w, r.h);
  heartPath(ctx, r.x + r.w / 2, r.y + r.h / 2 + 1, 4);
  ctx.fillStyle = "#ff8fbf";
  ctx.fill();
  if (r.state === "shaking") {                                  // a little "!" bubble
    const bx = cx, by = r.y - 20 - Math.abs(Math.sin(t * 20)) * 2;
    ctx.fillStyle = "#ff5a7a";
    ctx.beginPath();
    ctx.arc(bx, by, 9, 0, Math.PI * 2);
    ctx.fill();
    outline(ctx, 1.8);
    ctx.fillStyle = "#fff";
    ctx.font = `bold 13px ${FONT}`;
    ctx.textAlign = "center";
    ctx.fillText("!", bx, by + 4.5);
  }
  ctx.restore();
}

// ---- Hazards --------------------------------------------------------------------------------------

// A polka-dot cooking pot. Bubbling it rattles; boiling over it shoots foam up.
function drawBoilingPot(ctx, h, t) {
  const cx = h.x + h.w / 2, base = h.y + h.h;
  const state = h.armed ? "boil" : h.warn ? "warn" : "idle";
  shadow(ctx, cx, base, h.w * 0.55);

  if (state === "boil") {                                       // foam column shooting upward
    const reach = h.pulse.reach, p = h.progress;
    const height = reach * Math.min(1, Math.sin(Math.min(p, 1) * Math.PI) * 1.5);
    const bubbles = Math.ceil(height / 9);
    for (let i = bubbles; i >= 0; i--) {
      const y = h.y - 4 - (height * i) / Math.max(1, bubbles);
      const wob = Math.sin(t * 14 + i * 1.7) * 4;
      const rad = 9 - i * 0.15 + (i % 2) * 2;
      ctx.fillStyle = i % 3 === 0 ? "#ffe3f0" : "#ffffff";
      ctx.beginPath();
      ctx.arc(cx + wob, y, rad, 0, Math.PI * 2);
      ctx.fill();
      outline(ctx, 1.6);
    }
    for (let k = 0; k < 4; k++) sparkle(ctx, cx + Math.sin(t * 9 + k * 2) * 22, h.y - height * (0.3 + 0.2 * k), 4, "#fff3a8");
  } else if (state === "idle") {                                // lazy steam wisps
    for (let k = 0; k < 3; k++) {
      const a = (t * 0.5 + k / 3) % 1;
      ctx.fillStyle = `rgba(255,255,255,${0.55 * (1 - a)})`;
      ctx.beginPath();
      ctx.arc(cx + Math.sin(t * 2 + k * 2) * 5, h.y - 4 - a * 22, 4 + a * 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const shake = state === "warn" ? Math.sin(t * 50) * 1.4 : 0;  // rattling when about to boil
  ctx.save();
  ctx.translate(shake, 0);
  ctx.fillStyle = "#ffd0e4";                                    // side handles
  rr(ctx, h.x - 6, base - 30, 10, 8, 3); ctx.fill(); outline(ctx, 1.6);
  rr(ctx, h.x + h.w - 4, base - 30, 10, 8, 3); ctx.fill(); outline(ctx, 1.6);
  const g = ctx.createLinearGradient(0, h.y + 10, 0, base);
  g.addColorStop(0, "#ff9cc7");
  g.addColorStop(1, "#ff7ab0");
  rr(ctx, h.x, h.y + 10, h.w, h.h - 10, 9);                     // pot body
  ctx.fillStyle = g;
  ctx.fill();
  outline(ctx, 2.2);
  ctx.fillStyle = "rgba(255,255,255,0.85)";                     // polka dots
  for (const [dx, dy] of [[10, 24], [26, 32], [44, 22], [50, 36], [18, 38]]) {
    ctx.beginPath();
    ctx.arc(h.x + dx, h.y + dy - 4, 2.4, 0, Math.PI * 2);
    ctx.fill();
  }
  kawaiiFace(ctx, cx, h.y + h.h * 0.62, 1.05, state === "boil" ? "angry" : state === "warn" ? "oh" : "sleepy");
  const lidLift = state === "boil" ? 14 + Math.sin(t * 30) * 2 : state === "warn" ? Math.abs(Math.sin(t * 40)) * 3 : 0;
  rr(ctx, h.x - 3, h.y + 4 - lidLift, h.w + 6, 8, 4);          // lid (pops off when boiling)
  ctx.fillStyle = "#fff6ee";
  ctx.fill();
  outline(ctx, 2);
  ctx.beginPath();
  ctx.arc(cx, h.y + 2 - lidLift, 4, 0, Math.PI * 2);
  ctx.fillStyle = "#ff5fa2";
  ctx.fill();
  outline(ctx, 1.5);
  ctx.restore();
}

function drawTeacup(ctx, h, t) {
  const spin = Math.sin(h.y * 0.06) * 0.5;
  ctx.save();
  ctx.translate(h.x + h.w / 2, h.y + h.h / 2);
  ctx.rotate(spin);
  ctx.beginPath();                                              // handle
  ctx.arc(11, -1, 6, -Math.PI / 2, Math.PI / 2);
  ctx.lineWidth = 4;
  ctx.strokeStyle = INK;
  ctx.stroke();
  ctx.lineWidth = 1.8;
  ctx.strokeStyle = "#ffe3f0";
  ctx.stroke();
  const g = ctx.createLinearGradient(0, -10, 0, 12);
  g.addColorStop(0, "#fffafc");
  g.addColorStop(1, "#ffd0e4");
  ctx.beginPath();
  ctx.moveTo(-12, -9);
  ctx.lineTo(12, -9);
  ctx.quadraticCurveTo(11, 11, 0, 12);
  ctx.quadraticCurveTo(-11, 11, -12, -9);
  ctx.closePath();
  ctx.fillStyle = g;
  ctx.fill();
  outline(ctx, 2);
  ctx.fillStyle = "#b86a4a";                                    // spilling tea
  ctx.beginPath();
  ctx.ellipse(0, -9, 11, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  outline(ctx, 1.4);
  kawaiiFace(ctx, 0, 2.5, 0.62, "angry");
  ctx.restore();
}

function drawWarning(ctx, h, t) {
  const cx = h.x + h.w / 2, y = h.fall.startY + 14 + Math.sin(t * 14) * 2;
  ctx.strokeStyle = "rgba(255,90,130,0.5)";
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 7]);
  ctx.beginPath();
  ctx.moveTo(cx, y + 14);
  ctx.lineTo(cx, h.fall.endY + h.h);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = "#ff5a7a";
  ctx.beginPath();
  ctx.moveTo(cx, y - 13);
  ctx.lineTo(cx + 13, y + 10);
  ctx.lineTo(cx - 13, y + 10);
  ctx.closePath();
  ctx.fill();
  outline(ctx, 2);
  ctx.fillStyle = "#fff";
  ctx.font = `bold 14px ${FONT}`;
  ctx.textAlign = "center";
  ctx.fillText("!", cx, y + 8);
}

// A puddle of spilled pink soda with fizzy bubbles (and a startled face).
function drawPuddle(ctx, h, t) {
  const cx = h.x + h.w / 2, base = h.y + h.h;
  ctx.beginPath();
  ctx.moveTo(h.x, base);
  const n = 8;
  for (let i = 0; i <= n; i++) {
    const u = i / n, x = h.x + h.w * u;
    const y = base - (Math.sin(u * Math.PI) * h.h * 0.95 + Math.sin(t * 3 + i * 1.3) * 0.8);
    ctx.lineTo(x, y);
  }
  ctx.lineTo(h.x + h.w, base);
  ctx.closePath();
  const g = ctx.createLinearGradient(0, h.y, 0, base);
  g.addColorStop(0, "#ffb3d6");
  g.addColorStop(1, "#ff86be");
  ctx.fillStyle = g;
  ctx.fill();
  outline(ctx, 2);
  ctx.fillStyle = "rgba(255,255,255,0.85)";                     // fizzy bubbles popping
  for (let k = 0; k < 4; k++) {
    const a = (t * 0.9 + k / 4) % 1;
    ctx.beginPath();
    ctx.arc(h.x + 10 + k * (h.w - 20) / 3, base - 3 - a * 9, 1.4 + (1 - a) * 1.6, 0, Math.PI * 2);
    ctx.fill();
  }
  kawaiiFace(ctx, cx, base - 6, 0.55, "oh");
  ctx.strokeStyle = "#7ad0e8";                                  // a straw sticking out
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(h.x + h.w - 12, base - 2);
  ctx.lineTo(h.x + h.w - 4, base - 15);
  ctx.stroke();
}

export function drawRoomHazard(ctx, h, t) {
  if (h.fall && h.hidden) {
    if (h.warn) drawWarning(ctx, h, t);
    return;
  }
  if (h.kind === "boiling_pot") drawBoilingPot(ctx, h, t);
  else if (h.kind === "cup") drawTeacup(ctx, h, t);
  else drawPuddle(ctx, h, t);
}

// ---- Party items -------------------------------------------------------------------------------------

function drawStrawberries(ctx) {
  for (const [dx, dy, s] of [[-5, 2, 1], [6, -2, 0.85]]) {
    ctx.save();
    ctx.translate(dx, dy);
    ctx.scale(s, s);
    ctx.beginPath();
    ctx.moveTo(0, 11);
    ctx.bezierCurveTo(-13, 3, -10, -10, 0, -8);
    ctx.bezierCurveTo(10, -10, 13, 3, 0, 11);
    ctx.closePath();
    ctx.fillStyle = "#ff4f6a";
    ctx.fill();
    outline(ctx, 1.7);
    ctx.fillStyle = "#ffd0d8";                                  // seeds
    for (const [sx, sy] of [[-4, -2], [3, -3], [-1, 3], [5, 3], [-5, 5]]) ctx.fillRect(sx, sy, 1.4, 1.8);
    ctx.fillStyle = "#5fc25a";                                  // leafy top
    ctx.beginPath();
    ctx.moveTo(0, -8); ctx.lineTo(-6, -13); ctx.lineTo(-2, -9); ctx.lineTo(0, -14); ctx.lineTo(2, -9); ctx.lineTo(6, -13);
    ctx.closePath();
    ctx.fill();
    outline(ctx, 1.3);
    if (s === 1) kawaiiFace(ctx, 0, 2, 0.5);
    ctx.restore();
  }
}

function drawCarrot(ctx) {
  ctx.rotate(-0.5);
  ctx.beginPath();
  ctx.moveTo(-7, -9);
  ctx.quadraticCurveTo(0, -12, 7, -9);
  ctx.lineTo(1.5, 14);
  ctx.quadraticCurveTo(0, 16, -1.5, 14);
  ctx.closePath();
  ctx.fillStyle = "#ff9a3c";
  ctx.fill();
  outline(ctx, 1.7);
  ctx.strokeStyle = "rgba(190,90,20,0.55)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-4, -2); ctx.lineTo(-1, -2);
  ctx.moveTo(1, 3); ctx.lineTo(4, 3);
  ctx.moveTo(-2, 8); ctx.lineTo(0.5, 8);
  ctx.stroke();
  ctx.fillStyle = "#5fc25a";                                    // green leaves
  for (const k of [-1, 0, 1]) {
    ctx.beginPath();
    ctx.ellipse(k * 4.5, -14, 2.8, 5.2, k * 0.5, 0, Math.PI * 2);
    ctx.fill();
    outline(ctx, 1.2);
  }
  kawaiiFace(ctx, 0, -2.5, 0.52);
}

function drawPlate(ctx) {
  ctx.beginPath();
  ctx.arc(0, 0, 12, 0, Math.PI * 2);
  ctx.fillStyle = "#fffdf8";
  ctx.fill();
  outline(ctx, 1.8);
  ctx.beginPath();
  ctx.arc(0, 0, 8.4, 0, Math.PI * 2);
  ctx.fillStyle = "#ffe3ef";
  ctx.fill();
  ctx.strokeStyle = "#ff9cc7";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.beginPath();
  ctx.ellipse(-5.5, -6, 2.6, 1.4, -0.6, 0, Math.PI * 2);
  ctx.fill();
  kawaiiFace(ctx, 0, 0.5, 0.6);
}

function drawRecord(ctx, t) {
  ctx.beginPath();
  ctx.arc(0, 0, 12, 0, Math.PI * 2);
  ctx.fillStyle = "#3a3445";
  ctx.fill();
  outline(ctx, 1.8);
  ctx.strokeStyle = "rgba(255,255,255,0.2)";                    // grooves
  ctx.lineWidth = 0.8;
  for (const r of [10.4, 8.8, 7.2]) { ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke(); }
  ctx.strokeStyle = "rgba(255,255,255,0.8)";                    // a shine that turns with the record
  ctx.lineWidth = 2;
  const a = t * 3;
  ctx.beginPath(); ctx.arc(0, 0, 10.8, a, a + 0.6); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, 10.8, a + Math.PI, a + Math.PI + 0.6); ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, 5.2, 0, Math.PI * 2);
  ctx.fillStyle = "#ff8fbf";                                    // pink label
  ctx.fill();
  outline(ctx, 1.2);
  kawaiiFace(ctx, 0, 0.3, 0.36);
}

export function drawRoomCollectible(ctx, item, t) {
  const bob = Math.sin(t * 3 + item.x * 0.02) * 3;
  const cx = item.x + item.w / 2, cy = item.y + item.h / 2 + bob;
  const g = ctx.createRadialGradient(cx, cy, 2, cx, cy, 24);
  g.addColorStop(0, "rgba(255,230,160,0.7)");
  g.addColorStop(1, "rgba(255,230,160,0)");
  ctx.fillStyle = g;
  ctx.fillRect(cx - 26, cy - 26, 52, 52);
  pickupBubble(ctx, cx, cy, 19);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(1.08, 1.08);
  switch (item.name) {
    case "strawberries": drawStrawberries(ctx); break;
    case "curry ingredients": drawCarrot(ctx); break;
    case "plate": drawPlate(ctx); break;
    default: drawRecord(ctx, t);
  }
  ctx.restore();
  const tw = (Math.sin(t * 5 + item.x) + 1) / 2;
  sparkle(ctx, cx + 12, cy - 13 - tw * 2, 2 + tw * 2, `rgba(255,255,255,${0.5 + tw * 0.5})`);
}

// ---- The front door: locked until you have the party items; the doorbell rings at 0 -------

export function drawFrontDoor(ctx, goal, collected, needed, timeLeft, t) {
  const { x, y, w, h } = goal;
  const unlocked = collected >= needed;
  const hurry = timeLeft <= 12;

  const lamp = ctx.createRadialGradient(x + w / 2, y - 10, 2, x + w / 2, y - 10, 90);
  lamp.addColorStop(0, unlocked ? "rgba(150,255,190,0.6)" : "rgba(255,226,170,0.55)");
  lamp.addColorStop(1, "rgba(255,226,170,0)");
  ctx.fillStyle = lamp;
  ctx.fillRect(x - 80, y - 100, w + 160, 210);

  ctx.save();
  if (hurry) ctx.translate(Math.sin(t * 40) * 1.4, 0);          // the door rattles: they're knocking!
  rr(ctx, x - 7, y - 8, w + 14, h + 8, 8);                       // frame
  ctx.fillStyle = "#fff6ee";
  ctx.fill();
  outline(ctx, 2.6);
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, "#ffb3d6");
  g.addColorStop(1, "#ff8fbf");
  rr(ctx, x, y, w, h, 6);
  ctx.fillStyle = g;
  ctx.fill();
  outline(ctx, 2.2);
  ctx.strokeStyle = "rgba(255,255,255,0.7)";                      // door panels
  ctx.lineWidth = 2;
  rr(ctx, x + 9, y + 38, w - 18, 24, 6); ctx.stroke();
  rr(ctx, x + 9, y + 68, w - 18, 26, 6); ctx.stroke();

  ctx.fillStyle = "#fffdf6";                                      // round window with a heart
  ctx.beginPath();
  ctx.arc(x + w / 2, y + 22, 13, 0, Math.PI * 2);
  ctx.fill();
  outline(ctx, 2);
  heartPath(ctx, x + w / 2, y + 22, 6);
  ctx.fillStyle = "#ff8fbf";
  ctx.fill();

  ctx.fillStyle = "#fff0a8";                                      // 707 plate
  rr(ctx, x + w / 2 - 14, y + 40, 28, 13, 4);
  ctx.fill();
  outline(ctx, 1.5);
  ctx.fillStyle = INK;
  ctx.font = `bold 11px ${FONT}`;
  ctx.textAlign = "center";
  ctx.fillText("707", x + w / 2, y + 50);
  ctx.fillStyle = "#ffe36a";                                      // knob
  ctx.beginPath();
  ctx.arc(x + w - 11, y + 66, 4.6, 0, Math.PI * 2);
  ctx.fill();
  outline(ctx, 1.5);

  if (!unlocked) {                                                // little padlock
    const px = x + w / 2, py = y + 80;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(px, py - 4, 6, Math.PI, 0);
    ctx.stroke();
    rr(ctx, px - 9, py - 4, 18, 14, 3);
    ctx.fillStyle = "#ff5a7a";
    ctx.fill();
    outline(ctx, 1.6);
  } else {
    const pulse = 0.5 + 0.5 * Math.sin(t * 5);
    ctx.strokeStyle = `rgba(90,255,150,${0.45 + pulse * 0.5})`;
    ctx.lineWidth = 4;
    rr(ctx, x - 9, y - 10, w + 18, h + 10, 9);
    ctx.stroke();
  }
  ctx.restore();

  // Doorbell on the wall, blinking when the time is nearly up.
  const bx = x + w + 20, by = y + 40;
  rr(ctx, bx - 8, by - 12, 16, 24, 5);
  ctx.fillStyle = "#fff6ee";
  ctx.fill();
  outline(ctx, 1.8);
  ctx.beginPath();
  ctx.arc(bx, by, 4.4, 0, Math.PI * 2);
  ctx.fillStyle = hurry && Math.floor(t * 5) % 2 === 0 ? "#ff3a5a" : "#ffb3d1";
  ctx.fill();
  outline(ctx, 1.4);
  if (hurry) {                                                    // ding dong!
    ctx.fillStyle = "#e8344a";
    ctx.font = `bold 15px ${FONT}`;
    ctx.textAlign = "center";
    ctx.fillText(Math.floor(t * 2) % 2 ? "ding!" : "dong!", bx, by - 22 - Math.abs(Math.sin(t * 8)) * 3);
  }

  // Doormat and a sign saying what you still need.
  rr(ctx, x - 6, y + h - 4, w + 12, 8, 3);
  ctx.fillStyle = "#ffb3d1";
  ctx.fill();
  outline(ctx, 1.4);
  const msg = unlocked ? "Open it!" : `Items ${collected}/${needed}`;
  ctx.font = `bold 13px ${FONT}`;
  const tw = ctx.measureText(msg).width + 16;
  const sy = y - 30 - Math.sin(t * 3) * 2;
  rr(ctx, x + w / 2 - tw / 2, sy - 12, tw, 24, 9);
  ctx.fillStyle = unlocked ? "#fff3a8" : "#ffffff";
  ctx.fill();
  outline(ctx, 1.8);
  ctx.fillStyle = unlocked ? "#d8264a" : "#7a4a45";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(msg, x + w / 2, sy + 1);
  ctx.textBaseline = "alphabetic";
}
