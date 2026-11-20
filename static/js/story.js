// Two "in between" moments:
//   1. The goal celebration: when Hachi reaches the goal she hops for joy, confetti
//      pops, and a banner bounces in, instead of jumping straight to the next screen.
//   2. The visual-novel scenes (intro, between levels, ending): Hachi (and Nana)
//      talk in a dialogue box over the next level's scenery. The words come from
//      Flask (/api/story, written in game/story.py).
import { game, data } from "./state.js";
import { applyPhysics } from "./player.js";
import { loadLevel } from "./level.js";
import { updateFx, spawnBurst, spawnHearts } from "./fx.js";
import { drawHachi } from "./hachi.js";
import { drawNanaSprite, hasSprite } from "./sprites.js";
import { drawChibiGirl, NANA } from "./people.js";
import { sfx } from "./audio.js";
import { INK, FONT, kawaiiCard, stickerText, sparkle, heartPath } from "./style.js";

const TEXT = "#7a4a45";
const PINK = "#e8508a";
const CELEBRATE_FRAMES = 180;      // 3 seconds
const HOP_SPEED = 0.1;             // smaller = slower hops (one hop takes about 31 frames)
const SKIP_AFTER = 50;             // Enter can skip the celebration after this many frames
const LEAVE_FRAMES = 22;           // pink fade-out at the end of a scene
const CARD_FADE = 32;              // frames for a title card to fade in or out
const PORTRAIT_SCALE = 4.4;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const easeOutBack = (x) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2; };

// ================================================================================
// 1. The goal celebration
// ================================================================================

export function updateCelebration() {
  const c = game.celebrate;
  const p = game.player;
  if (!c) return;
  c.f++;
  updateFx();

  if (c.hop0 === null) {                         // first let her settle onto the ground
    p.velocityX = 0;
    applyPhysics();
    if (p.isGrounded || c.f >= 40) { c.hop0 = c.f; c.baseY = p.y; }
  } else {                                       // then three happy hops, getting a bit smaller
    const k = c.f - c.hop0;
    const phase = k * HOP_SPEED;                 // slow, floaty hops
    const h = Math.abs(Math.sin(phase)) * 34 * Math.max(0.4, 1 - k / 200);
    p.y = c.baseY - h;
    p.isGrounded = h < 1.5;
    p.velocityY = 0;
    const hops = Math.floor(phase / Math.PI);
    if (hops > (c.hops || 0)) {                  // every landing: sparkles, hearts, a rising "ping"
      c.hops = hops;
      spawnBurst(p.x + p.w / 2, p.y + 10);
      spawnHearts(p.x + p.w / 2, p.y);
      sfx("pickup", { combo: Math.min(9, hops * 2) });
    }
  }
  if (c.f % 9 === 0 && c.f < 140) {              // confetti pops all over the screen
    spawnBurst(game.cameraX + 60 + Math.random() * 840, game.cameraY + 60 + Math.random() * 300);
  }
  if (c.f >= CELEBRATE_FRAMES) finishCelebration();
}

export function skipCelebration() {
  if (game.celebrate && game.celebrate.f >= SKIP_AFTER) finishCelebration();
}

// The celebration is over: tell the next part of the story (or the ending).
function finishCelebration() {
  const n = game.currentLevel;
  game.celebrate = null;
  startStory(n < data.levels.length ? `after_${n}` : "ending");
}

export function drawCelebration(ctx, canvas, t) {
  const c = game.celebrate;
  if (!c) return;
  const W = canvas.width, H = canvas.height;
  const f = c.f;

  const cx = W / 2, cy = 150;                    // spinning sunburst behind the banner
  const ramp = clamp(f / 25, 0, 1);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(t * 0.4);
  for (let i = 0; i < 14; i++) {
    ctx.rotate((Math.PI * 2) / 14);
    ctx.fillStyle = i % 2 ? `rgba(255,243,168,${0.3 * ramp})` : `rgba(255,190,220,${0.3 * ramp})`;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(560, -62);
    ctx.lineTo(560, 62);
    ctx.fill();
  }
  ctx.restore();

  const s = easeOutBack(clamp((f - 4) / 22, 0, 1));          // the banner bounces in
  if (s > 0) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(s, s);
    kawaiiCard(ctx, -290, -80, 580, 170, 30);
    stickerText(ctx, `Level ${game.currentLevel} Complete!`, 0, -16, 46, PINK, "center", 10);
    const cheer = (data.story.cheers || {})[game.currentLevel] || "Great job, Hachi!";
    stickerText(ctx, cheer, 0, 26, 22, TEXT, "center", 6);
    stickerText(ctx, "+500 ★", 0, 68, 26, "#f0a020", "center", 7);
    for (const [sx, sy, r, ph] of [[-254, -44, 9, 0], [254, -40, 8, 1.3], [-250, 62, 7, 2.1], [250, 60, 9, 0.7]]) {
      sparkle(ctx, sx, sy, r * (0.8 + 0.25 * Math.sin(t * 4 + ph)), "#ffd23a");
    }
    ctx.restore();
  }

  if (f >= SKIP_AFTER && f < CELEBRATE_FRAMES - 20) {
    const pulse = 1 + Math.sin(t * 4) * 0.04;
    ctx.save();
    ctx.translate(cx, H - 26);
    ctx.scale(pulse, pulse);
    stickerText(ctx, "Press Enter ♥", 0, 0, 20, PINK, "center", 7);
    ctx.restore();
  }

  const wipe = clamp((f - (CELEBRATE_FRAMES - 32)) / 32, 0, 1);   // fades to pink at the end
  if (wipe > 0) {
    ctx.fillStyle = `rgba(255,214,234,${wipe})`;
    ctx.fillRect(0, 0, W, H);
  }
}

// ================================================================================
// 2. Visual-novel story scenes
// ================================================================================

// "after_2" -> level 3, "intro" -> level 1 (the scene that comes before a level).
function backdropFor(key) {
  if (key === "ending") return data.levels.length;
  const m = /^after_(\d+)$/.exec(key);
  return m ? Number(m[1]) + 1 : 1;
}

export function startStory(key) {
  const scene = (data.story.scenes || {})[key];
  if (!scene || !scene.lines || !scene.lines.length) {      // no story available: just carry on
    if (key === "ending") game.state = "VICTORY";
    else loadLevel(backdropFor(key));
    return;
  }
  loadLevel(scene.backdrop);                // paint the coming level's scenery behind the talking
  game.level.hazards = [];                  // a calm backdrop: no pigeons or flowerpots
  game.player.x = -600;                     // Hachi's big portrait stands in for her
  game.state = "STORY";
  game.celebrate = null;
  game.story = { key, scene, index: 0, shown: 0, frame: 0, nanaIn: 0, leave: 0, wrapped: null, lineFrame: 0, cardOut: 0 };
  game.fadeIn = 30;
}

// Enter: finish typing the line, or go on to the next one (or end the scene).
export function advanceStory() {
  const s = game.story;
  if (!s || s.leave) return;
  if (s.index === 0 && s.frame < 20) return;   // ignore the double-tap of the Enter that opened the story
  const line = s.scene.lines[s.index];
  if (s.shown < line.text.length) { s.shown = line.text.length; return; }
  const more = s.index < s.scene.lines.length - 1;
  if (line.card && more) {                    // a title card fades out before the next line
    if (!s.cardOut) s.cardOut = 1;
    return;
  }
  nextLine(s);
}

function nextLine(s) {
  if (s.index < s.scene.lines.length - 1) {
    s.index++;
    s.shown = 0;
    s.wrapped = null;
    s.lineFrame = 0;
    s.cardOut = 0;
    sfx("blip", { pitch: 1.3, vol: 0.6 });
  } else {
    s.leave = 1;
  }
}

export function skipStory() {
  if (game.story && !game.story.leave) game.story.leave = 1;
}

export function updateStory() {
  const s = game.story;
  if (!s) return;
  s.frame++;
  game.frame++;                              // keeps the backdrop's little animations going

  const L = game.level;                      // the camera slowly drifts across the scenery
  const room = Math.max(0, Math.min(340, L.worldWidth - 960));
  const drift = 0.5 - 0.5 * Math.cos(s.frame * 0.003);                // 0 -> 1 -> 0, very slowly
  if (s.key === "intro") {                                            // the platform, with the Shinkansen waiting
    game.cameraX = L.worldWidth - 960 - drift * 150;
  } else {
    game.cameraX = drift * room;
  }

  s.lineFrame++;
  const line = s.scene.lines[s.index];
  if (line.card) s.shown = line.text.length;               // cards fade in whole instead of typing
  if (s.cardOut && ++s.cardOut > CARD_FADE) nextLine(s);   // ...and fade out when you press Enter
  if (s.shown < line.text.length) {          // typewriter + a tiny speaking "blip"
    const before = Math.floor(s.shown);
    s.shown = Math.min(line.text.length, s.shown + 0.85);
    const now = Math.floor(s.shown);
    if (now > before && now % 3 === 0 && line.text[now - 1] !== " ") {
      sfx("blip", { vol: 0.35, pitch: (line.who === "nana" ? 0.8 : 1.5) + Math.random() * 0.12 });
    }
  }
  const nanaHere = s.scene.lines.slice(0, s.index + 1).some((l) => l.who === "nana");
  if (nanaHere) s.nanaIn = Math.min(1, s.nanaIn + 0.07);

  if (s.leave) {
    s.leave++;
    if (s.leave > LEAVE_FRAMES) endStory();
  }
}

function endStory() {
  const s = game.story;
  game.story = null;
  game.fadeIn = 24;
  if (s.key === "ending") game.state = "VICTORY";
  else loadLevel(s.scene.backdrop);          // on to the level
}

// ---- Drawing ------------------------------------------------------------------

// The dialogue box would hide the floor, props and train, so the scenery is lifted
// up by this many pixels (the strip it leaves at the bottom is filled in below).
export const STORY_SHIFT = 100;

export function drawStoryScenery(ctx, canvas, themed, t) {
  const W = canvas.width, H = canvas.height;
  ctx.save();
  ctx.translate(0, -STORY_SHIFT);
  themed(ctx, game, canvas, t);
  ctx.restore();
  // Stretch the last rows of the picture down to fill the gap at the bottom.
  ctx.drawImage(canvas, 0, H - STORY_SHIFT - 6, W, 6, 0, H - STORY_SHIFT, W, STORY_SHIFT);
}

// Warm glows, drifting sparkles and (at the snowy station) falling snow, so the
// scene feels alive even when nobody is moving.
function drawAtmosphere(ctx, W, H, t, snowy) {
  for (const lx of [150, 480, 810]) {                    // soft lamp light from the top
    const g = ctx.createRadialGradient(lx, 60, 4, lx, 60, 170);
    g.addColorStop(0, "rgba(255,236,170,0.4)");
    g.addColorStop(1, "rgba(255,236,170,0)");
    ctx.fillStyle = g;
    ctx.fillRect(lx - 170, 0, 340, 240);
  }
  if (snowy) {
    for (let i = 0; i < 90; i++) {
      const sp = 22 + (i % 5) * 9;
      const x = ((i * 137.5 + Math.sin(t * 0.7 + i) * 18) % W + W) % W;
      const y = (t * sp + i * 53) % (H + 20) - 10;
      ctx.globalAlpha = 0.55 + (i % 4) * 0.12;
      ctx.fillStyle = i % 7 === 0 ? "#ffd9ec" : "#ffffff";
      ctx.beginPath();
      ctx.arc(x, y, 1.6 + (i % 3) * 0.9, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  for (let i = 0; i < 9; i++) {                          // little sparkles and hearts float up
    const a = (t * 0.07 + i / 9) % 1;
    const x = 70 + ((i * 197) % 820) + Math.sin(t * 0.8 + i * 2) * 14;
    const y = 380 - a * 330;
    ctx.globalAlpha = Math.sin(a * Math.PI);
    if (i % 3 === 0) {
      heartPath(ctx, x, y, 5);
      ctx.fillStyle = "#ff9ec8";
      ctx.fill();
    } else {
      sparkle(ctx, x, y, 5 + (i % 3) * 2, "#fff3a8");
    }
  }
  ctx.globalAlpha = 1;
}

function wrap(ctx, text, maxW) {
  const lines = [];
  let cur = "";
  for (const w of text.split(" ")) {
    const test = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; }
    else cur = test;
  }
  if (cur) lines.push(cur);
  return lines;
}

function hachiPortrait(ctx, x, feetY, mood, t) {
  const pose = {
    x: -16, y: -48, w: 32, h: 48, facingDirection: "right", velocityX: 0, velocityY: 0,
    isGrounded: true, hurtTimer: mood === "hurt" ? 30 : 0, happyTimer: mood === "happy" ? 30 : 0,
  };
  ctx.save();
  ctx.translate(x, feetY);
  ctx.scale(PORTRAIT_SCALE, PORTRAIT_SCALE);
  drawHachi(ctx, pose, t);
  ctx.restore();
}

function nanaPortrait(ctx, x, feetY, mood, t, bags) {
  ctx.save();
  ctx.translate(x, feetY);
  ctx.scale(PORTRAIT_SCALE, PORTRAIT_SCALE);
  if (!(hasSprite("nana") && drawNanaSprite(ctx, 0, 0, -1, mood, t))) {   // mood = idle | happy | annoyed | angry
    ctx.scale(-1, 1);                                    // look toward Hachi (left)
    const girl = bags ? NANA : { ...NANA, bag: null, bag2: null };
    drawChibiGirl(ctx, girl, { t, walking: false });
  }
  ctx.restore();
}

// A full-screen pink card with one line of big text, for jumps in time.
function drawTitleCard(ctx, W, H, t, line, s) {
  const fadeIn = clamp(s.lineFrame / CARD_FADE, 0, 1);
  const fadeOut = s.cardOut ? clamp(1 - s.cardOut / CARD_FADE, 0, 1) : 1;
  ctx.save();
  ctx.globalAlpha = fadeIn * fadeOut;                    // the whole card fades in and out
  const veil = ctx.createLinearGradient(0, 0, 0, H);
  veil.addColorStop(0, "rgba(255,226,240,0.96)");
  veil.addColorStop(1, "rgba(255,196,224,0.96)");
  ctx.fillStyle = veil;
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 14; i++) {                         // sparkles and hearts drift across it
    const x = (i * 211 + t * (10 + (i % 3) * 5)) % W;
    const y = 60 + ((i * 97) % 420) + Math.sin(t + i) * 8;
    ctx.globalAlpha = fadeIn * fadeOut * (0.5 + 0.4 * Math.sin(t * 2 + i));
    if (i % 3 === 0) { heartPath(ctx, x, y, 7); ctx.fillStyle = "#ff9ec8"; ctx.fill(); }
    else sparkle(ctx, x, y, 6 + (i % 3) * 2, "#fff3a8");
  }
  ctx.globalAlpha = fadeIn * fadeOut;
  const rise = (1 - fadeIn) * 14;                        // the words float up a little as they appear
  stickerText(ctx, line.text, W / 2, H / 2 + 12 + rise, 50, PINK, "center", 11);
  if (fadeIn >= 1 && !s.cardOut) {
    const pulse = 1 + Math.sin(t * 4) * 0.04;
    ctx.save();
    ctx.translate(W / 2, H - 50);
    ctx.scale(pulse, pulse);
    stickerText(ctx, "Enter ♥", 0, 0, 20, "#b07a8a", "center", 6);
    ctx.restore();
  }
  ctx.restore();
  if (s.leave) {
    ctx.fillStyle = `rgba(255,214,234,${clamp(s.leave / LEAVE_FRAMES, 0, 1)})`;
    ctx.fillRect(0, 0, W, H);
  }
}

export function drawStory(ctx, canvas, t) {
  const s = game.story;
  if (!s) return;
  const W = canvas.width, H = canvas.height;
  const line = s.scene.lines[s.index];
  const typing = s.shown < line.text.length;

  ctx.fillStyle = "rgba(255,226,240,0.16)";              // soft veil over the scenery
  ctx.fillRect(0, 0, W, H);
  drawAtmosphere(ctx, W, H, t, s.scene.backdrop === 1);

  // Portraits: whoever is speaking bounces a little while the words are typed.
  const feetY = 436;
  const hachiSpeaking = line.who === "hachi";
  const nanaSpeaking = line.who === "nana";
  const bounce = (on) => (on && typing ? -Math.abs(Math.sin(t * 9)) * 5 : 0);

  ctx.save();
  ctx.fillStyle = "rgba(150,80,110,0.25)";
  ctx.beginPath();
  ctx.ellipse(250, feetY, 70, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  hachiPortrait(ctx, 250, feetY + bounce(hachiSpeaking), line.who === "hachi" ? line.mood : "idle", t);
  ctx.restore();

  if (s.nanaIn > 0) {                                    // Nana slides in from the right
    const e = 1 - (1 - s.nanaIn) ** 3;
    const nx = 710 + (1 - e) * 220;
    ctx.save();
    ctx.globalAlpha = e;                                 // she fades in as she slides
    ctx.fillStyle = "rgba(150,80,110,0.25)";
    ctx.beginPath();
    ctx.ellipse(nx, feetY, 70, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    nanaPortrait(ctx, nx, feetY + bounce(nanaSpeaking), line.who === "nana" ? line.mood : "idle", t, !!s.scene.bags);
    ctx.restore();
  }

  if (line.card) {                                       // a title card on its own: "Later that day..."
    drawTitleCard(ctx, W, H, t, line, s);                // (it fades in over the portraits, so nothing pops)
    return;
  }

  // The dialogue box.
  const bx = 40, by = 402, bw = 880, bh = 122;
  kawaiiCard(ctx, bx, by, bw, bh, 28);
  const name = line.who === "hachi" ? "Hachi" : line.who === "nana" ? "Nana" : "";
  if (name) {
    ctx.font = `bold 22px ${FONT}`;
    const tw = ctx.measureText(name).width + 44;
    ctx.beginPath();
    ctx.roundRect(bx + 28, by - 20, tw, 38, 15);
    ctx.fillStyle = line.who === "nana" ? "#3a2a48" : "#ff8fbf";
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.4;
    ctx.stroke();
    heartPath(ctx, bx + 28 + 18, by - 1, 6);
    ctx.fillStyle = line.who === "nana" ? "#d83a52" : "#ffffff";
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.fillText(name, bx + 28 + 32, by + 8);
  }

  ctx.font = `bold 25px ${FONT}`;                        // the words, typed out
  if (!s.wrapped) s.wrapped = wrap(ctx, line.text, bw - 80);
  let left = Math.floor(s.shown);
  ctx.fillStyle = line.who === "nana" ? "#4a3050" : TEXT;
  ctx.textAlign = "left";
  s.wrapped.forEach((ln, i) => {
    const shownPart = ln.slice(0, Math.max(0, left));
    left -= ln.length + 1;
    ctx.fillText(shownPart, bx + 40, by + 46 + i * 32);
  });

  if (!typing) {                                         // a bouncing "next" arrow
    const ay = by + bh - 30 + Math.sin(t * 6) * 3;
    ctx.beginPath();
    ctx.moveTo(bx + bw - 54, ay - 7);
    ctx.lineTo(bx + bw - 34, ay - 7);
    ctx.lineTo(bx + bw - 44, ay + 7);
    ctx.closePath();
    ctx.fillStyle = "#ff8fbf";
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.font = `bold 14px ${FONT}`;
  ctx.fillStyle = "#b07a8a";
  ctx.textAlign = "left";
  ctx.fillText(`Enter: next    Esc: skip story     ${s.index + 1} / ${s.scene.lines.length}`, bx + 40, by + bh - 12);

  if (s.leave) {                                         // fade to pink as the scene ends
    ctx.fillStyle = `rgba(255,214,234,${clamp(s.leave / LEAVE_FRAMES, 0, 1)})`;
    ctx.fillRect(0, 0, W, H);
  }
}
