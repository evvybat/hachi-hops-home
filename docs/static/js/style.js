// The game's shared "kawaii / gyaru" look, matched to Hachi's hand-drawn art:
// soft pastel colours, warm brown outlines (not black ink), big sparkly eyes,
// blushing cheeks, little hearts and stars. Every drawing file imports from
// here so the whole game stays consistent.

// Warm brown outline colour, sampled from the Hachi sprites' linework.
export const INK = "#8d5e50";

// Rounded, friendly fonts first; falls back to what the computer has.
export const FONT = "'Fredoka','Baloo 2','Nunito','Quicksand','Trebuchet MS',system-ui,sans-serif";

export const PINK = "#ff8fbf";
export const PINK_DEEP = "#e8508a";
export const CREAM = "#fff4ec";
export const LAVENDER = "#d9c8f5";

// ---- Pixel hearts (for the lives display) ------------------------------------------
// A tiny bitmap: # = heart pixel. Drawn with solid squares for crisp pixel art.
const HEART = [
  ".###..###.",
  "##########",
  "##########",
  "##########",
  ".########.",
  "..######..",
  "...####...",
  "....##....",
];

// Draws a pixel heart with its top-left at (x, y); `px` is the size of one pixel.
// filled: full pink heart with a shine. Empty: a pale ghost heart.
export function pixelHeart(ctx, x, y, px, filled) {
  const on = (r, c) => HEART[r] && HEART[r][c] === "#";
  // outline: a pixel is outline if it is empty but touches a heart pixel
  ctx.fillStyle = filled ? INK : "rgba(141,94,80,0.45)";
  for (let r = -1; r <= HEART.length; r++) {
    for (let c = -1; c <= HEART[0].length; c++) {
      if (on(r, c)) continue;
      if (on(r - 1, c) || on(r + 1, c) || on(r, c - 1) || on(r, c + 1)) {
        ctx.fillRect(x + c * px, y + r * px, px, px);
      }
    }
  }
  for (let r = 0; r < HEART.length; r++) {
    for (let c = 0; c < HEART[0].length; c++) {
      if (!on(r, c)) continue;
      let col = filled ? PINK : "#f6e3ea";
      if (filled && (r + c) >= 11) col = PINK_DEEP;            // shaded lower right
      ctx.fillStyle = col;
      ctx.fillRect(x + c * px, y + r * px, px, px);
    }
  }
  if (filled) {                                                  // sparkle highlight
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x + 1 * px, y + 1 * px, px * 2, px);
    ctx.fillRect(x + 1 * px, y + 2 * px, px, px);
  }
}

export const HEART_W = 10 + 2;   // in pixels, including the outline

// ---- Smooth vector hearts and stars (for particles and decorations) -----------------------
export function heartPath(ctx, cx, cy, s) {
  ctx.beginPath();
  ctx.moveTo(cx, cy + s);
  ctx.bezierCurveTo(cx - s * 1.5, cy + s * 0.1, cx - s * 0.8, cy - s * 1.1, cx, cy - s * 0.35);
  ctx.bezierCurveTo(cx + s * 0.8, cy - s * 1.1, cx + s * 1.5, cy + s * 0.1, cx, cy + s);
  ctx.closePath();
}

// A four-point twinkle star.
export function sparkle(ctx, x, y, r, color = "#fff") {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x + r * 0.18, y - r * 0.18, x + r, y);
  ctx.quadraticCurveTo(x + r * 0.18, y + r * 0.18, x, y + r);
  ctx.quadraticCurveTo(x - r * 0.18, y + r * 0.18, x - r, y);
  ctx.quadraticCurveTo(x - r * 0.18, y - r * 0.18, x, y - r);
  ctx.fill();
}

// ---- Kawaii face: two shiny dot eyes, rosy cheeks and a tiny mouth ----------------------------
// mood: "happy" | "angry" | "sleepy" | "oh". (x, y) is the centre; s is the scale
// (1 = about 14px wide).
export function kawaiiFace(ctx, x, y, s = 1, mood = "happy") {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = "rgba(255,120,150,0.55)";           // blush
  ctx.beginPath();
  ctx.ellipse(-5.4, 2.2, 2.3, 1.4, 0, 0, Math.PI * 2);
  ctx.ellipse(5.4, 2.2, 2.3, 1.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.fillStyle = INK;
  ctx.lineWidth = 1.2;
  ctx.lineCap = "round";
  for (const ex of [-3.4, 3.4]) {
    if (mood === "sleepy") {
      ctx.beginPath();
      ctx.arc(ex, -0.6, 1.8, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.ellipse(ex, -0.6, 1.25, 1.7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";                           // eye shine
      ctx.fillRect(ex - 0.6, -1.5, 0.9, 0.9);
      ctx.fillStyle = INK;
    }
  }
  if (mood === "angry") {                               // slanted brows + little frown
    ctx.beginPath();
    ctx.moveTo(-6, -3.6); ctx.lineTo(-1.6, -2.4);
    ctx.moveTo(6, -3.6); ctx.lineTo(1.6, -2.4);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 4.4, 1.5, 1.15 * Math.PI, 1.85 * Math.PI);
    ctx.stroke();
  } else if (mood === "oh") {
    ctx.beginPath();
    ctx.ellipse(0, 3.2, 1.1, 1.4, 0, 0, Math.PI * 2);
    ctx.stroke();
  } else {                                              // tiny "w" smile
    ctx.beginPath();
    ctx.arc(-1, 2.6, 1.1, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.arc(1, 2.6, 1.1, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
  }
  ctx.restore();
}

// Scatter little sparkles, stars and hearts over a (baked) background.
export function scatterTwinkles(ctx, w, h, count, seed = 0, area = 1) {
  const rnd = (i) => { const v = Math.sin(i * 127.1 + 311.7 + seed * 17.3) * 43758.5453; return v - Math.floor(v); };
  const colors = ["#ffffff", "#fff3a8", "#ffd0e6", "#d9c8ff", "#c8f0ff"];
  for (let i = 0; i < count; i++) {
    const x = rnd(i) * w, y = rnd(i + 200) * h * area, r = 2.5 + rnd(i + 400) * 5;
    ctx.globalAlpha = 0.55 + rnd(i + 600) * 0.4;
    if (rnd(i + 800) < 0.25) {
      ctx.fillStyle = "#ffc2dc";
      heartPath(ctx, x, y, r * 0.8);
      ctx.fill();
    } else {
      sparkle(ctx, x, y, r, colors[i % colors.length]);
    }
  }
  ctx.globalAlpha = 1;
}

// A sleepy smiling face for a cloud puff.
export function cloudFace(ctx, x, y, s) {
  kawaiiFace(ctx, x, y, s, "sleepy");
}

// ---- Final colour grade: lifts the dark tones into soft pastel pink ----------------------------
export function kawaiiGrade(ctx, w, h) {
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.fillStyle = "rgba(255,206,230,0.12)";
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = "soft-light";
  ctx.fillStyle = "rgba(255,170,215,0.2)";
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

// ---- More kawaii building blocks ---------------------------------------------------------------

// A shiny soap-bubble behind a pickup so it reads as "collect me!".
export function pickupBubble(ctx, cx, cy, r) {
  const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.35, 1, cx, cy, r);
  g.addColorStop(0, "rgba(255,255,255,0.8)");
  g.addColorStop(0.7, "rgba(255,228,242,0.4)");
  g.addColorStop(1, "rgba(255,185,222,0.6)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,140,196,0.95)";
  ctx.lineWidth = 1.7;
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,0.95)";          // little shine arc
  ctx.lineWidth = 2.2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.72, Math.PI * 1.08, Math.PI * 1.42);
  ctx.stroke();
}

// A little ribbon bow, centred on (x, y).
export function bow(ctx, x, y, s = 1, color = "#ff7ab8") {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.lineJoin = "round";
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = INK;
  ctx.fillStyle = color;
  for (const k of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(k * 7, -8, k * 10, -3);
    ctx.quadraticCurveTo(k * 11, 4, k * 8, 6);
    ctx.quadraticCurveTo(k * 4, 2, 0, 0);
    ctx.fill();
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(0, 0, 2.6, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

// Tiny coloured dots and hearts sprinkled over a surface (like a cake).
export function sprinkles(ctx, x, y, w, h, seed = 0, count = 8) {
  const rnd = (i) => { const v = Math.sin(i * 127.1 + 311.7 + seed * 0.37) * 43758.5453; return v - Math.floor(v); };
  const cols = ["#ff9cc7", "#ffd23a", "#9ad9f5", "#b9a6f2", "#9eeac4", "#ffffff"];
  for (let i = 0; i < count; i++) {
    const px = x + rnd(i) * w, py = y + rnd(i + 90) * h;
    ctx.fillStyle = cols[i % cols.length];
    if (i % 5 === 0) { heartPath(ctx, px, py, 2.4); ctx.fill(); }
    else { ctx.beginPath(); ctx.arc(px, py, 1.5, 0, Math.PI * 2); ctx.fill(); }
  }
}

// Soft white shine on the top-left of a rounded shape.
export function gloss(ctx, x, y, w, h) {
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.beginPath();
  ctx.roundRect(x + 3, y + 2.5, Math.max(4, w * 0.45), Math.max(2, Math.min(4, h * 0.22)), 2);
  ctx.fill();
}
// A smiling sun: soft glow, little rays, a round face with rosy cheeks.
export function kawaiiSun(ctx, x, y, r, color = "#fff3b0") {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "rgba(255,255,255,0.55)";               // short rays around the disc
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a - 0.12) * r * 1.18, Math.sin(a - 0.12) * r * 1.18);
    ctx.lineTo(Math.cos(a) * r * 1.62, Math.sin(a) * r * 1.62);
    ctx.lineTo(Math.cos(a + 0.12) * r * 1.18, Math.sin(a + 0.12) * r * 1.18);
    ctx.closePath();
    ctx.fill();
  }
  const g = ctx.createRadialGradient(-r * 0.3, -r * 0.35, 2, 0, 0, r);
  g.addColorStop(0, "#ffffff");
  g.addColorStop(1, color);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(141,94,80,0.55)";
  ctx.lineWidth = 2;
  ctx.stroke();
  kawaiiFace(ctx, 0, 1, r / 11);
  ctx.restore();
}
// A cute rounded card with a soft pink drop shadow and an inner highlight, used
// by the HUD, the title / pause screens and the level intro.
export function kawaiiCard(ctx, x, y, w, h, r = 14) {
  ctx.fillStyle = "rgba(190,120,150,0.3)";
  ctx.beginPath();
  ctx.roundRect(x + 3, y + 4, w, h, r);
  ctx.fill();
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, "#fffaf6");
  g.addColorStop(1, "#ffe6ef");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.4;
  ctx.lineJoin = "round";
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,0.9)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.roundRect(x + 3.5, y + 3.5, w - 7, h - 7, Math.max(2, r - 3));
  ctx.stroke();
}

// Chunky readable text with a white "sticker" outline behind it.
export function stickerText(ctx, text, x, y, size, color, align = "center", outline = 7) {
  ctx.font = `bold ${size}px ${FONT}`;
  ctx.textAlign = align;
  ctx.lineJoin = "round";
  ctx.lineWidth = outline;
  ctx.strokeStyle = "#ffffff";
  ctx.strokeText(text, x, y);
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}