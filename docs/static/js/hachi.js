// Draws Hachi as a chibi anime girl: an oversized head, huge sparkly eyes, a
// tiny body, stubby legs, clean ink outlines and flat cel shading. She squashes
// and stretches when jumping, blinks, and makes an "ouch" face when hurt.
// (An original drawing inspired by the genre, not copied manga artwork.)
//
// Drawn inside the player's 32x48 collision box; the origin is her feet.

import { drawSprite } from "./sprites.js";

export const INK = "#8d5e50";
const HAIR = "#a8683e";
const HAIR_SHADE = "#7d4a29";
const HAIR_LIGHT = "#e2b384";
const SKIN = "#ffe5d3";

// Fill a path with a colour, then trace it with ink.
function inked(ctx, fill, lw = 1.6) {
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = lw;
  ctx.lineJoin = "round";
  ctx.stroke();
}

// Stubby chibi leg: stocking plus a chunky boot.
function leg(ctx, x, lift) {
  ctx.beginPath();
  ctx.roundRect(x - 2.5, -10 - lift, 5, 6, 2);
  inked(ctx, "#4a3f55", 1.3);
  ctx.beginPath();
  ctx.roundRect(x - 4, -5.5 - lift, 8.4, 5.5, [2, 3.5, 2.5, 2.5]);
  inked(ctx, "#8a5338", 1.4);
  ctx.fillStyle = "rgba(255,255,255,0.4)";           // boot shine
  ctx.fillRect(x - 2.4, -4.6 - lift, 1.8, 2.4);
}

// Tiny arm that swings from the shoulder at (px, -19).
function arm(ctx, px, angle) {
  ctx.save();
  ctx.translate(px, -19);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.roundRect(-2.5, -1, 5, 8, 2.5);
  inked(ctx, "#e57aa0", 1.3);
  ctx.beginPath();
  ctx.arc(0, 8.6, 2.6, 0, Math.PI * 2);
  inked(ctx, SKIN, 1.3);
  ctx.restore();
}

// One huge anime eye. mood: "open" | "closed" | "hurt".
function eye(ctx, x, y, s, mood) {
  ctx.strokeStyle = INK;
  ctx.lineCap = "round";
  if (mood === "closed") {                           // happy blink arc
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y - 0.6 * s, 3 * s, 0.12 * Math.PI, 0.88 * Math.PI);
    ctx.stroke();
    return;
  }
  if (mood === "hurt") {                             // > <  face
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(x - 3 * s, y - 3 * s);
    ctx.lineTo(x + 2.4 * s, y);
    ctx.lineTo(x - 3 * s, y + 3 * s);
    ctx.stroke();
    return;
  }
  const rx = 3.1 * s, ry = 4.2 * s;
  ctx.fillStyle = "#ffffff";                         // eye white
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();

  const iris = ctx.createLinearGradient(0, y - ry, 0, y + ry);
  iris.addColorStop(0, "#41231a");                   // dark at the top, glowing below
  iris.addColorStop(0.5, "#8f5230");
  iris.addColorStop(1, "#f0b27a");
  ctx.fillStyle = iris;
  ctx.beginPath();
  ctx.ellipse(x + 0.2 * s, y + 0.3 * s, rx * 0.86, ry * 0.88, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#24131c";                         // pupil
  ctx.beginPath();
  ctx.ellipse(x + 0.2 * s, y + 0.1 * s, rx * 0.42, ry * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";                         // big + small sparkle highlights
  ctx.beginPath();
  ctx.ellipse(x - 0.9 * s, y - 1.5 * s, 1.25 * s, 1.5 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 1.1 * s, y + 1.9 * s, 0.6 * s, 0, Math.PI * 2);
  ctx.fill();

  ctx.lineWidth = 2;                                 // thick upper lash line
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, Math.PI * 1.03, Math.PI * 1.97);
  ctx.stroke();
  ctx.lineWidth = 1.4;                               // lash flick
  ctx.beginPath();
  ctx.moveTo(x + rx * 0.95, y - ry * 0.3);
  ctx.lineTo(x + rx * 1.5, y - ry * 0.7);
  ctx.stroke();
}

export function drawHachi(ctx, p, t = 0) {
  if (drawSprite(ctx, p, t)) return;       // your own artwork, if you've added it
  const dir = p.facingDirection === "right" ? 1 : -1;
  const moving = p.isGrounded && Math.abs(p.velocityX) > 0.3;
  const swing = moving ? Math.sin(p.x * 0.14) : 0;     // walk cycle follows distance
  const air = !p.isGrounded;
  const bob = moving ? Math.abs(Math.sin(p.x * 0.14)) * 2 : 0;
  const hurt = p.hurtTimer > 0;
  const blink = (t % 3.4) < 0.12;
  const mood = hurt ? "hurt" : blink ? "closed" : "open";

  // Stretch tall while moving fast through the air (about her feet).
  const stretch = air ? 1 + Math.min(Math.abs(p.velocityY) * 0.012, 0.12) : 1;

  // Hair and scarf trail behind her when she moves or falls.
  const forward = p.velocityX * dir;
  const sway = Math.max(-3, Math.min(3, -forward * 0.7)) + (air ? -p.velocityY * 0.15 : 0);
  const flap = Math.sin(t * 6) * 1.2;

  ctx.save();
  ctx.translate(p.x + p.w / 2, p.y + p.h);            // origin: feet, centre
  ctx.scale(dir / stretch, stretch);

  if (!air) {                                         // ground shadow
    ctx.fillStyle = "rgba(20,30,50,0.28)";
    ctx.beginPath();
    ctx.ellipse(0, 0, 14, 3.2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.translate(0, -bob);

  // ---- Back arm and stubby legs -------------------------------------------
  arm(ctx, -7.5, air ? -2.6 : -swing * 0.8);
  leg(ctx, -4.2, air ? 3 : Math.max(0, -swing) * 3);
  leg(ctx, 4.2, air ? 1 : Math.max(0, swing) * 3);

  // ---- Scarf tail (behind the body) ----------------------------------------------
  ctx.beginPath();
  ctx.moveTo(-6, -25);
  ctx.lineTo(-6, -21);
  ctx.quadraticCurveTo(-13 + sway, -20 + flap, -17 + sway * 1.6, -13 + flap);
  ctx.lineTo(-11 + sway, -14);
  ctx.quadraticCurveTo(-9, -19, -3, -24);
  ctx.closePath();
  inked(ctx, "#d63a48", 1.3);

  // ---- Small round body in a pink coat -----------------------------------------------
  ctx.beginPath();
  ctx.roundRect(-8.5, -23, 17, 15, 5);
  inked(ctx, "#f28cae", 1.5);
  ctx.save();                                         // flat shadow on the back side
  ctx.clip();
  ctx.fillStyle = "rgba(190,70,110,0.45)";
  ctx.fillRect(-10, -24, 8, 18);
  ctx.restore();
  ctx.beginPath();
  ctx.roundRect(-9.5, -12.5, 19, 4.5, 2.2);
  inked(ctx, "#ffffff", 1.3);                         // fur hem
  ctx.fillStyle = "#fff6fa";                          // buttons
  ctx.beginPath();
  ctx.arc(3, -19, 1.2, 0, Math.PI * 2);
  ctx.arc(3, -15, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // ---- Scarf wrap -----------------------------------------------------------------------
  ctx.beginPath();
  ctx.roundRect(-9.5, -26, 19, 5.5, 2.8);
  inked(ctx, "#e24a58", 1.4);

  // ---- Hair behind the head ------------------------------------------------------------
  ctx.beginPath();
  ctx.ellipse(-1, -35.5, 14.6, 13.8, 0, 0, Math.PI * 2);
  inked(ctx, HAIR_SHADE, 1.6);
  ctx.beginPath();                                    // swaying back lock
  ctx.moveTo(-13.5, -38);
  ctx.quadraticCurveTo(-18 + sway, -29, -14 + sway * 1.4, -20);
  ctx.quadraticCurveTo(-9 + sway, -23, -7, -31);
  ctx.closePath();
  inked(ctx, HAIR, 1.4);

  // ---- Big round face -------------------------------------------------------------------
  ctx.beginPath();
  ctx.ellipse(1, -33.2, 12.6, 11.2, 0, 0, Math.PI * 2);
  inked(ctx, SKIN, 1.5);
  ctx.fillStyle = "rgba(230,150,130,0.35)";           // shadow under the fringe
  ctx.beginPath();
  ctx.ellipse(1, -39, 12, 4, 0, 0, Math.PI);
  ctx.fill();

  eye(ctx, -3.4, -31.6, 1.2, mood);                   // far eye (a bit smaller)
  eye(ctx, 6.8, -31.6, 1.46, mood);                   // near eye

  ctx.strokeStyle = "#c98370";                        // tiny nose
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(13, -27.8);
  ctx.lineTo(14, -26.9);
  ctx.stroke();

  ctx.strokeStyle = INK;                              // little mouth
  ctx.lineWidth = 1.3;
  if (air && !hurt) {
    ctx.fillStyle = "#c4435a";
    ctx.beginPath();
    ctx.ellipse(6.2, -24.6, 1.9, 2.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(6.2, -25.4, 2.2, 0.12 * Math.PI, 0.88 * Math.PI);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(255,100,130,0.55)";           // blush with anime hatch lines
  ctx.beginPath();
  ctx.ellipse(11.6, -26.2, 3.2, 1.7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(220,60,100,0.7)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  for (const dx of [-1.8, 0, 1.8]) {
    ctx.moveTo(11.6 + dx - 0.8, -25.2);
    ctx.lineTo(11.6 + dx + 0.8, -27.4);
  }
  ctx.stroke();

  // ---- Fringe with pointed anime strands (tips stop above the eyes) ---------------------
  ctx.beginPath();
  ctx.moveTo(-12.8, -33);
  ctx.quadraticCurveTo(-15, -49, 1, -50);
  ctx.quadraticCurveTo(16.4, -49, 14.6, -33);
  ctx.lineTo(13, -37.6);
  ctx.lineTo(11, -42);
  ctx.lineTo(8.2, -38.9);
  ctx.lineTo(6, -42.4);
  ctx.lineTo(3.2, -39);
  ctx.lineTo(0.4, -42.6);
  ctx.lineTo(-2.4, -39);
  ctx.lineTo(-5, -42.2);
  ctx.lineTo(-8, -38.8);
  ctx.lineTo(-10.6, -41.8);
  ctx.closePath();
  inked(ctx, HAIR, 1.6);
  ctx.strokeStyle = "rgba(255,236,200,0.85)";         // glossy highlight band
  ctx.lineWidth = 2.2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(1, -44.5, 10, 1.16 * Math.PI, 1.64 * Math.PI);
  ctx.stroke();
  ctx.strokeStyle = HAIR_LIGHT;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(1, -43.5, 11.4, 1.08 * Math.PI, 1.3 * Math.PI);
  ctx.stroke();

  ctx.beginPath();                                    // front side lock by the cheek
  ctx.moveTo(13, -41);
  ctx.quadraticCurveTo(17.5 + sway * 0.4, -33, 14.6 + sway * 0.6, -24);
  ctx.quadraticCurveTo(11.6, -29, 11.8, -36);
  ctx.closePath();
  inked(ctx, HAIR, 1.3);

  // Red bow on top of the head.
  ctx.beginPath();
  ctx.moveTo(-8, -48);
  ctx.lineTo(-13.4, -52.2);
  ctx.lineTo(-13.4, -44.4);
  ctx.closePath();
  inked(ctx, "#e24a58", 1.1);
  ctx.beginPath();
  ctx.moveTo(-8, -48);
  ctx.lineTo(-2.6, -52.2);
  ctx.lineTo(-2.6, -44.4);
  ctx.closePath();
  inked(ctx, "#e24a58", 1.1);
  ctx.beginPath();
  ctx.arc(-8, -48, 2.1, 0, Math.PI * 2);
  inked(ctx, "#ff8f9b", 1.1);

  // ---- Front arm -----------------------------------------------------------------------
  arm(ctx, 7.5, air ? 2.7 : swing * 0.8);

  ctx.restore();
}
