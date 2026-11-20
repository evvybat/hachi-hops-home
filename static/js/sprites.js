// Uses your own hand-drawn character artwork instead of the built-in drawings.
//
// Each character has a folder of transparent PNGs (facing right, feet on the
// bottom edge, all the same size and framing):
//
//   static/images/hachi/   idle.png  (required)   happy.png  hurt.png
//                          jump.png  walk1.png walk2.png ...  (all optional)
//   static/images/nana/    idle.png  (required)   happy.png
//
// If a character has no idle.png the game keeps the built-in drawing for her.
// With only idle/happy/hurt, walking and jumping are animated in code: a little
// bob and lean while walking, a stretch in the air.
//
// SPRITE_HEIGHT is how tall Hachi appears on screen, in pixels (her collision
// box is 48px tall and her hair adds a bit, so 56-68 looks right).
import { data, game } from "./state.js";

export const SPRITE_HEIGHT = 62;
const FRAME_DISTANCE = 14;          // pixels walked per walking frame

// set ("hachi" | "nana") -> file name (lower case) -> loaded Image
const images = { hachi: {}, nana: {} };

// Ask Flask which files exist for each character, then load them.
export async function loadSprites() {
  let found = {};
  try {
    found = await fetch("/api/sprites").then((r) => r.json());
  } catch (err) {
    return;                         // no sprite folders: keep the built-in drawings
  }
  data.sprites = found;
  const jobs = [];
  for (const [who, names] of Object.entries(found)) {
    images[who] = images[who] || {};
    for (const name of names) {
      jobs.push(new Promise((resolve) => {
        const img = new Image();
        img.onload = () => { images[who][name.toLowerCase()] = img; resolve(); };
        img.onerror = () => resolve();
        img.src = `/static/images/${who}/${name}`;
      }));
    }
  }
  await Promise.all(jobs);
}

const named = (who, n) => images[who][n + ".png"] || images[who][n + ".webp"];

export function hasSprite(who) {
  return !!named(who, "idle");
}

function walkFrames() {
  return Object.keys(images.hachi).filter((n) => n.startsWith("walk")).sort();
}

// Which picture fits what Hachi is doing right now?
function pickHachi(p) {
  if (p.hurtTimer > 0 && named("hachi", "hurt")) return named("hachi", "hurt");
  const celebrating = p.happyTimer > 0 || game.state === "LEVEL_COMPLETE" || game.state === "VICTORY";
  if (celebrating && named("hachi", "happy")) return named("hachi", "happy");
  if (!p.isGrounded && named("hachi", "jump")) return named("hachi", "jump");
  const frames = walkFrames();
  if (p.isGrounded && Math.abs(p.velocityX) > 0.3 && frames.length) {
    return images.hachi[frames[Math.floor(p.x / FRAME_DISTANCE) % frames.length]];
  }
  return named("hachi", "idle");
}

// Draws Hachi's sprite. Returns false if there isn't one (so the caller can
// draw the built-in Hachi instead).
export function drawSprite(ctx, p, t = 0) {
  const img = pickHachi(p);
  if (!img) return false;

  const dir = p.facingDirection === "right" ? 1 : -1;
  const h = SPRITE_HEIGHT;
  const w = (img.naturalWidth / img.naturalHeight) * h;
  const air = !p.isGrounded;
  const walking = !air && Math.abs(p.velocityX) > 0.3;
  const stepPhase = p.x * 0.14;

  ctx.save();
  ctx.translate(p.x + p.w / 2, p.y + p.h);          // origin: feet, centre
  if (!air) {                                       // ground shadow
    ctx.fillStyle = "rgba(20,30,50,0.28)";
    ctx.beginPath();
    ctx.ellipse(0, 0, Math.min(w * 0.45, 16), 3.2, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Life without walking frames: bob and lean while walking, stretch in the
  // air, a tiny breathing motion when standing still.
  let stretch = 1, lean = 0, bob = 0;
  if (walking) {
    bob = Math.abs(Math.sin(stepPhase)) * 2.6;
    lean = Math.sin(stepPhase) * 0.06;
  } else if (air) {
    stretch = 1 + Math.min(Math.abs(p.velocityY) * 0.012, 0.1);
  } else {
    stretch = 1 + Math.sin(t * 2.4) * 0.008;
  }
  ctx.translate(0, -bob);
  ctx.rotate(lean * dir);
  ctx.scale(dir / stretch, stretch);
  ctx.drawImage(img, -w / 2, -h, w, h);
  ctx.restore();
  return true;
}

// Draws the other Nana standing with her feet at (cx, feetY), looking toward
// `dir` (-1 = looking left, at Hachi). pose: "idle" or "happy". Returns false
// if she has no sprite yet.
export function drawNanaSprite(ctx, cx, feetY, dir, pose, t = 0) {
  const img = named("nana", pose) || named("nana", "idle");
  if (!img) return false;
  const h = SPRITE_HEIGHT;
  const w = (img.naturalWidth / img.naturalHeight) * h;
  ctx.save();
  ctx.translate(cx, feetY);
  ctx.fillStyle = "rgba(20,30,50,0.28)";
  ctx.beginPath();
  ctx.ellipse(0, 0, Math.min(w * 0.45, 16), 3.2, 0, 0, Math.PI * 2);
  ctx.fill();
  const stretch = 1 + Math.sin(t * 2.4) * 0.01;      // gentle breathing
  ctx.scale(dir / stretch, stretch);
  ctx.drawImage(img, -w / 2, -h, w, h);
  ctx.restore();
  return true;
}
