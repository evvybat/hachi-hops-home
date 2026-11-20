// The five Harajuku shopping items, drawn big and cute in Hachi's style: pastel
// colours, a warm brown outline, a shiny soap bubble behind them, sparkles, and
// little smiling faces. (Each is drawn about 50px wide; the pickup box is smaller.)
//   ribbon, platform heels, harajuku outfit (a frilly dress), makeup compact,
//   strawberry cup (a cream parfait).
import { kawaiiFace, pickupBubble, bow, sparkle, heartPath } from "./style.js";

const INK = "#8d5e50";

// Fill a path with `fill`, then outline it in the warm brown ink.
function inked(ctx, fill, lw = 1.8) {
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = lw;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.stroke();
}

function shine(ctx, x, y, rx, ry, rot = -0.5, alpha = 0.85) {
  ctx.fillStyle = `rgba(255,255,255,${alpha})`;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
  ctx.fill();
}

function dot(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

// ---- Ribbon: a big polka-dot bow with a heart in the knot -----------------------------------

function drawRibbon(ctx) {
  ctx.beginPath();                                          // the two hanging tails
  ctx.moveTo(-3, 4); ctx.lineTo(-14, 23); ctx.lineTo(-8, 20); ctx.lineTo(-4, 25); ctx.lineTo(2, 5);
  ctx.closePath();
  inked(ctx, "#ff8fbf");
  ctx.beginPath();
  ctx.moveTo(3, 4); ctx.lineTo(14, 23); ctx.lineTo(8, 20); ctx.lineTo(4, 25); ctx.lineTo(-2, 5);
  ctx.closePath();
  inked(ctx, "#ff8fbf");

  for (const s of [-1, 1]) {                                // the two big loops
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(s * 6, -17, s * 25, -20, s * 25, -4);
    ctx.bezierCurveTo(s * 25, 9, s * 8, 11, 0, 0);
    ctx.closePath();
    inked(ctx, "#ff6fae");
    ctx.beginPath();                                        // lighter inside of the loop
    ctx.moveTo(s * 3, -1);
    ctx.bezierCurveTo(s * 8, -12, s * 19, -13, s * 19, -4);
    ctx.bezierCurveTo(s * 19, 4, s * 9, 5, s * 3, -1);
    ctx.closePath();
    ctx.fillStyle = "#ff9ccb";
    ctx.fill();
    for (const [dx, dy, r] of [[14, -7, 2], [9, -2, 1.6], [19, -1, 1.6], [16, -12, 1.4]]) {   // polka dots
      dot(ctx, s * dx, dy, r, "#ffffff");
    }
    shine(ctx, s * 14, -13, 4, 1.6, s * 0.3);
  }
  ctx.beginPath();                                          // the knot, with a heart
  ctx.arc(0, 0, 7, 0, Math.PI * 2);
  inked(ctx, "#ff5fa2");
  heartPath(ctx, 0, 0.4, 3.4);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  sparkle(ctx, 20, -19, 5, "#ffe36a");
}

// ---- Platform heels: a chunky pink mary-jane with a strap, bow and smiling toe -----------------

function drawHeels(ctx) {
  ctx.translate(0, -3);
  ctx.beginPath();                                          // the shoe
  ctx.moveTo(-19, 9);
  ctx.lineTo(-19, -9);
  ctx.quadraticCurveTo(-19, -16, -12, -16);
  ctx.lineTo(-6, -16);
  ctx.lineTo(-2, -3);
  ctx.quadraticCurveTo(7, -6, 15, 1);
  ctx.quadraticCurveTo(24, 6, 21, 9);
  ctx.closePath();
  inked(ctx, "#ff7ab8");
  ctx.beginPath();                                          // chunky white platform sole
  ctx.roundRect(-20, 9, 43, 9, 4.5);
  inked(ctx, "#fff4f9");
  ctx.beginPath();                                          // block heel
  ctx.roundRect(-20, 18, 12, 6, 2);
  inked(ctx, "#ff9ccb");
  for (const x of [-12, -2, 8, 17]) {                       // little hearts on the sole
    heartPath(ctx, x, 13.5, 2.2);
    ctx.fillStyle = "#ff8fbf";
    ctx.fill();
  }
  ctx.beginPath();                                          // ankle strap over the foot
  ctx.moveTo(-10, -9);
  ctx.quadraticCurveTo(-4, -6, 2, -5);
  ctx.lineWidth = 4.5;
  ctx.strokeStyle = INK;
  ctx.lineCap = "round";
  ctx.stroke();
  ctx.lineWidth = 2.4;
  ctx.strokeStyle = "#ff4f9a";
  ctx.stroke();
  sparkle(ctx, -4, -7.5, 3.6, "#ffe36a");                   // star buckle
  bow(ctx, -13, -16, 0.62, "#ffffff");
  kawaiiFace(ctx, 10, 3, 0.95);
  shine(ctx, 13, -1, 4, 1.5, -0.3);
  sparkle(ctx, 22, -12, 5, "#ffe36a");
}

// ---- Harajuku outfit: a frilly polka-dot dress on a hanger --------------------------------------

function drawOutfit(ctx) {
  ctx.scale(0.92, 0.92);
  ctx.translate(0, 2);
  ctx.strokeStyle = INK;                                    // hanger
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(0, -17);
  ctx.lineTo(0, -21);
  ctx.arc(0, -24, 3.4, Math.PI * 0.5, Math.PI * 2.1);
  ctx.moveTo(0, -17);
  ctx.lineTo(-14, -10);
  ctx.lineTo(14, -10);
  ctx.lineTo(0, -17);
  ctx.stroke();

  ctx.beginPath();                                          // skirt, with a ruffled white petticoat
  ctx.moveTo(-7, -1);
  ctx.lineTo(7, -1);
  ctx.quadraticCurveTo(21, 8, 20, 20);
  ctx.lineTo(-20, 20);
  ctx.quadraticCurveTo(-21, 8, -7, -1);
  ctx.closePath();
  inked(ctx, "#ffb3d6");
  for (const [x, y] of [[-12, 9], [-3, 13], [8, 8], [14, 15], [-8, 17], [2, 5]]) dot(ctx, x, y, 1.9, "#ffffff");
  for (let i = 0; i < 8; i++) {                             // scalloped frill
    ctx.beginPath();
    ctx.arc(-17.5 + i * 5, 20, 2.9, 0, Math.PI);
    inked(ctx, "#ffffff", 1.5);
  }
  ctx.beginPath();                                          // puffy sleeves
  ctx.arc(-10, -9, 5, 0, Math.PI * 2);
  inked(ctx, "#ffffff", 1.6);
  ctx.beginPath();
  ctx.arc(10, -9, 5, 0, Math.PI * 2);
  inked(ctx, "#ffffff", 1.6);
  ctx.beginPath();                                          // bodice
  ctx.roundRect(-7, -12, 14, 13, 3);
  inked(ctx, "#ffb3d6");
  ctx.beginPath();                                          // lace collar
  ctx.arc(0, -12, 4, 0, Math.PI);
  inked(ctx, "#ffffff", 1.4);
  kawaiiFace(ctx, 0, -5, 0.75);
  bow(ctx, 0, 1, 0.62, "#6fd0f0");                          // blue waist bow
  sparkle(ctx, 21, -14, 5, "#ffe36a");
}

// ---- Makeup compact: an open pink compact with a smiling reflection -----------------------------

function drawCompact(ctx) {
  ctx.translate(0, 2);
  ctx.beginPath();                                          // the base with powder
  ctx.ellipse(0, 11, 20, 11, 0, 0, Math.PI * 2);
  inked(ctx, "#ff8ac4");
  ctx.beginPath();
  ctx.ellipse(0, 10.5, 14.5, 7, 0, 0, Math.PI * 2);
  inked(ctx, "#ffe0ee", 1.3);
  heartPath(ctx, 0, 10.5, 3.2);
  ctx.fillStyle = "#ffb3d6";
  ctx.fill();
  ctx.beginPath();                                          // the lid
  ctx.arc(0, -6, 19, 0, Math.PI * 2);
  inked(ctx, "#ff6fae");
  ctx.beginPath();                                          // mirror with a golden rim
  ctx.arc(0, -6, 13.5, 0, Math.PI * 2);
  inked(ctx, "#d6f1ff", 1.6);
  ctx.strokeStyle = "#ffd23a";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(0, -6, 15.8, 0, Math.PI * 2);
  ctx.stroke();
  kawaiiFace(ctx, 0, -5, 1.15);                             // her happy reflection
  ctx.strokeStyle = "rgba(255,255,255,0.95)";               // shine streaks
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-9, -11); ctx.lineTo(-4, -16);
  ctx.moveTo(-10.5, -6); ctx.lineTo(-8.5, -8.5);
  ctx.stroke();
  ctx.beginPath();                                          // gold hinge
  ctx.roundRect(-5, 11 - 6, 10, 5, 2);
  inked(ctx, "#ffd23a", 1.4);
  sparkle(ctx, 19, -19, 5.5, "#ffe36a");
  sparkle(ctx, -21, 4, 3.4, "#ffffff");
}

// ---- Strawberry cup: a parfait cup with cream, a strawberry and sprinkles ------------------------

function berry(ctx, x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.beginPath();
  ctx.moveTo(0, 10);
  ctx.bezierCurveTo(-11, 4, -9, -8, 0, -6);
  ctx.bezierCurveTo(9, -8, 11, 4, 0, 10);
  ctx.closePath();
  inked(ctx, "#ff4a63", 1.7);
  for (const [dx, dy] of [[-3.5, -1], [3, -2], [0, 2.5], [-2, 5], [3.5, 3]]) dot(ctx, dx, dy, 0.9, "#ffe9a8");
  shine(ctx, -3.5, -3.5, 2.2, 1.2, -0.7);
  ctx.beginPath();                                          // green leaves
  ctx.moveTo(0, -6); ctx.lineTo(-5, -9); ctx.lineTo(-2, -5.5); ctx.lineTo(0, -10); ctx.lineTo(2, -5.5); ctx.lineTo(5, -9);
  ctx.closePath();
  inked(ctx, "#66c866", 1.4);
  ctx.restore();
}

function drawStrawberryCup(ctx) {
  ctx.scale(0.88, 0.88);
  ctx.translate(0, 3);
  ctx.beginPath();                                          // the cup
  ctx.moveTo(-15, -3);
  ctx.lineTo(15, -3);
  ctx.lineTo(10, 23);
  ctx.lineTo(-10, 23);
  ctx.closePath();
  inked(ctx, "#fff7fb");
  ctx.beginPath();                                          // pink strawberry-sauce band
  ctx.moveTo(-13.6, 4); ctx.lineTo(13.6, 4); ctx.lineTo(12.4, 11); ctx.lineTo(-12.4, 11);
  ctx.closePath();
  ctx.fillStyle = "#ffc2dc";
  ctx.fill();
  kawaiiFace(ctx, 0, 14, 1.0);
  shine(ctx, -9, 0, 1.4, 4.5, 0.1, 0.9);

  ctx.beginPath(); ctx.ellipse(0, -5, 16, 7.5, 0, 0, Math.PI * 2); inked(ctx, "#fffdf5");     // whipped cream
  ctx.beginPath(); ctx.ellipse(0, -13, 11, 6.5, 0, 0, Math.PI * 2); inked(ctx, "#fffdf5");
  ctx.beginPath(); ctx.ellipse(0, -19, 6, 4.6, 0, 0, Math.PI * 2); inked(ctx, "#fffdf5");
  for (const [x, y, c] of [[-9, -5, "#ffd23a"], [6, -6, "#9ad9f5"], [-3, -12, "#ff9cc7"], [5, -13, "#b9a6f2"], [11, -3, "#9eeac4"]]) {
    dot(ctx, x, y, 1.5, c);                                 // sprinkles
  }
  berry(ctx, 1, -29, 0.95);
  ctx.save();                                               // a wafer stick
  ctx.translate(-11, -19);
  ctx.rotate(-0.5);
  ctx.beginPath();
  ctx.roundRect(-2.5, -11, 5, 18, 1.5);
  inked(ctx, "#f6cf8a", 1.4);
  ctx.restore();
  sparkle(ctx, 19, -22, 5, "#ffe36a");
}

// ---- Public: draw one item, bobbing in a soap bubble ----------------------------------------------

export function drawHarajukuCollectible(ctx, item, t) {
  const bob = Math.sin(t * 3 + item.x * 0.02) * 3;
  const cx = item.x + item.w / 2, cy = item.y + item.h / 2 + bob;

  const g = ctx.createRadialGradient(cx, cy, 4, cx, cy, 40);   // soft pink glow
  g.addColorStop(0, "rgba(255,220,240,0.55)");
  g.addColorStop(1, "rgba(255,220,240,0)");
  ctx.fillStyle = g;
  ctx.fillRect(cx - 42, cy - 42, 84, 84);
  pickupBubble(ctx, cx, cy, 29);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(0.9, 0.9);
  switch (item.name) {
    case "platform heels": drawHeels(ctx); break;
    case "ribbon": drawRibbon(ctx); break;
    case "harajuku outfit": drawOutfit(ctx); break;
    case "makeup compact": drawCompact(ctx); break;
    default: drawStrawberryCup(ctx);
  }
  ctx.restore();

  for (let i = 0; i < 2; i++) {                             // two sparkles orbit the bubble
    const a = t * 1.6 + i * Math.PI + item.x * 0.01;
    sparkle(ctx, cx + Math.cos(a) * 33, cy + Math.sin(a) * 28, 3.6 + Math.sin(t * 5 + i) * 1.2, "#fff6b0");
  }
}
