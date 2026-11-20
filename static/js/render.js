// Chooses how to draw each screen, and draws the HUD (pixel hearts!), the
// menu / pause / win cards, and the final pastel colour grade.
// Levels with a `theme` get detailed art; others fall back to plain shapes.
import { game, data } from "./state.js";
import { drawStationScene } from "./theme_station.js";
import { drawStreetScene } from "./theme_street.js";
import { drawHarajukuScene } from "./theme_harajuku.js";
import { drawRoomScene } from "./theme_room.js";
import { drawEnding } from "./ending_scene.js";
import { isMuted, soundReady } from "./audio.js";
import {
  INK, FONT, pixelHeart, kawaiiGrade, scatterTwinkles, sparkle, heartPath,
} from "./style.js";
import { drawFx } from "./fx.js";
import {
  drawMenuScreen, drawPauseScreen, drawLevelIntro, drawGoalArrow, objectiveText,
} from "./screens.js";
import { drawStory, drawCelebration, drawStoryScenery } from "./story.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const THEMES = {
  snow_station: drawStationScene,
  tokyo_street: drawStreetScene,
  harajuku: drawHarajukuScene,
  room707: drawRoomScene,
};

const OVERLAYS = {
  GAME_OVER: ["Oh no... Game Over", "Press R or Enter to try this level again  (Esc: main menu)", "T_T"],
  VICTORY: ["Welcome home, Hachi & Nana!", "Press Enter to play again", "♥ ★ ♥"],
};

const PLATFORM_COLORS = { solid: "#785a50", icy: "#9fd8f0" };
const TEXT = "#7a4a45";
const PINK_TEXT = "#e8508a";

export function focusCanvas() { canvas.focus(); }

function fillRect(r, color) {
  ctx.fillStyle = color;
  ctx.fillRect(r.x - game.cameraX, r.y - game.cameraY, r.w, r.h);
}

// Plain-shapes fallback for levels that don't have a theme yet.
function drawPlainScene() {
  game.level.platforms.forEach((r) => fillRect(r, PLATFORM_COLORS[r.kind] || "#785a50"));
  game.level.hazards.forEach((r) => fillRect(r, "#c82828"));
  game.level.collectibles.forEach((r) => {
    if (!r.collected) fillRect(r, "#fac828");
  });
  fillRect(game.level.goal, "#3caa5a");

  const p = game.player;
  if (p.hurtTimer > 0 && Math.floor(p.hurtTimer / 6) % 2 === 0) return;
  fillRect(p, "#f07aa0");
  const eyeX = p.facingDirection === "right" ? p.x + p.w - 12 : p.x + 4;
  fillRect({ x: eyeX, y: p.y + 10, w: 8, h: 8 }, "#ffffff");
}

// ---- A cute rounded card (used by the HUD and menus) ----------------------------------------

function card(x, y, w, h, r = 14) {
  ctx.fillStyle = "rgba(190,120,150,0.3)";          // soft pink drop shadow
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
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,0.9)";        // inner highlight
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.roundRect(x + 3.5, y + 3.5, w - 7, h - 7, r - 3);
  ctx.stroke();
}

// The goal, always visible right under the HUD in big pink letters.
function drawGoalStrip(t) {
  const goalText = objectiveText();
  const ready = goalText.startsWith("You have everything");
  ctx.font = `bold 19px ${FONT}`;
  const tw = ctx.measureText(goalText).width;
  const w = tw + 58, x = 8, y = 54, h = 36;
  card(x, y, w, h, 15);
  heartPath(ctx, x + 22, y + 19, 6.5);
  ctx.fillStyle = ready ? "#46c98a" : "#ff8fbf";
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.6;
  ctx.stroke();
  ctx.fillStyle = ready && Math.floor(t * 3) % 2 === 0 ? "#2f9e6a" : PINK_TEXT;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(goalText, x + 38, y + 20);
  ctx.textBaseline = "alphabetic";
}

// ---- HUD: pixel hearts for lives, then level, score and items ---------------------------------

function drawHud(t) {
  const max = data.config.player.startingLives;
  const lives = game.player.lives;
  const px = 3, heartStep = 40;

  const parts = [`Lv ${game.currentLevel}  ${game.level.name}`, `★ ${game.score}`];
  parts.push(game.level.itemsRequired
    ? `♡ ${game.itemsCollected}/${game.level.itemsRequired}`
    : `♡ ${game.itemsCollected}`);
  const required = game.level.collectibles.filter((c) => c.required);
  if (required.length) {
    const got = required.filter((c) => c.collected).length;
    parts.push(`Key ${got}/${required.length}`);
  }
  if (game.level.timeLimit) parts.push(`Time ${Math.floor(game.levelTimer)}`);

  ctx.font = `bold 16px ${FONT}`;
  const text = parts.join("   ");
  const textW = ctx.measureText(text).width;
  const heartsW = max * heartStep;
  const w = heartsW + textW + 36;
  card(8, 6, w, 40, 14);

  for (let i = 0; i < max; i++) {
    const filled = i < lives;
    let hx = 18 + i * heartStep, hy = 14;
    if (filled) hy += Math.sin(t * 3 + i * 0.9) * 1.2;                       // gentle bounce
    if (!filled && i === lives && game.player.hurtTimer > 60) hx += (Math.random() - 0.5) * 4;   // the lost one shakes
    pixelHeart(ctx, hx, hy, px, filled);
  }

  const hurry = game.level.timeLimit && game.levelTimer <= 15;           // doorbell is about to ring!
  ctx.fillStyle = hurry && Math.floor(t * 4) % 2 === 0 ? "#e8344a" : TEXT;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 18 + heartsW + 6, 27);
  ctx.textBaseline = "alphabetic";
  drawGoalStrip(t);
}

// Soft pink flash at the screen edges right after taking damage.
function drawHurtFlash() {
  const p = game.player;
  const strength = Math.min(1, (p.hurtTimer - 60) / 30);        // first ~0.5 s only
  if (strength <= 0) return;
  const g = ctx.createRadialGradient(
    canvas.width / 2, canvas.height / 2, canvas.height * 0.35,
    canvas.width / 2, canvas.height / 2, canvas.width * 0.65);
  g.addColorStop(0, "rgba(255,90,140,0)");
  g.addColorStop(1, `rgba(255,90,140,${0.4 * strength})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// ---- Menu / pause / win cards ----------------------------------------------------------------

function drawOverlay(title, subtitle, deco, t) {
  if (game.state !== "MENU") {                       // dim the game behind a pink veil
    ctx.fillStyle = "rgba(255,222,238,0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  const w = 560, h = 190, x = (canvas.width - w) / 2, y = (canvas.height - h) / 2;
  card(x, y, w, h, 24);

  ctx.textAlign = "center";
  ctx.font = `bold 38px ${FONT}`;
  ctx.lineJoin = "round";
  ctx.lineWidth = 7;
  ctx.strokeStyle = "#ffffff";                       // white sticker outline behind the text
  ctx.strokeText(title, canvas.width / 2, y + 78);
  ctx.fillStyle = "#e8508a";
  ctx.fillText(title, canvas.width / 2, y + 78);

  ctx.font = `bold 20px ${FONT}`;
  ctx.fillStyle = TEXT;
  ctx.fillText(subtitle, canvas.width / 2, y + 120);
  ctx.font = `bold 22px ${FONT}`;
  ctx.fillStyle = "#ff8fbf";
  ctx.fillText(deco, canvas.width / 2, y + 160);

  for (const [sx, sy, r, ph] of [[x + 34, y + 34, 9, 0], [x + w - 36, y + 40, 7, 1.3], [x + 60, y + h - 34, 6, 2.1], [x + w - 70, y + h - 30, 8, 0.7]]) {
    sparkle(ctx, sx, sy, r * (0.8 + 0.25 * Math.sin(t * 3 + ph)), "#ffd23a");
  }
  ctx.fillStyle = "#ff8fbf";
  heartPath(ctx, x + w - 34, y + 34, 7);
  ctx.fill();
  heartPath(ctx, x + 34, y + h - 34, 7);
  ctx.fill();
}

// A little speaker in the top-right corner: shows whether sound is on (press M).
function drawSpeaker(t) {
  const w = 46, h = 38, x = canvas.width - w - 10, y = 8;
  card(x, y, w, h, 12);
  const cx = x + 17, cy = y + h / 2;
  const off = isMuted();
  ctx.fillStyle = off ? "#b9a3ad" : "#ff8fbf";                     // speaker body
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.8;
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(cx - 7, cy - 3.5); ctx.lineTo(cx - 2, cy - 3.5); ctx.lineTo(cx + 3, cy - 8);
  ctx.lineTo(cx + 3, cy + 8); ctx.lineTo(cx - 2, cy + 3.5); ctx.lineTo(cx - 7, cy + 3.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.lineCap = "round";
  if (off) {                                                         // a cross when muted
    ctx.strokeStyle = "#e8344a";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(cx + 8, cy - 5); ctx.lineTo(cx + 16, cy + 5);
    ctx.moveTo(cx + 16, cy - 5); ctx.lineTo(cx + 8, cy + 5);
    ctx.stroke();
  } else {                                                           // sound waves (they pulse once audio is playing)
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.8;
    const pulse = soundReady() ? 0.7 + 0.3 * Math.sin(t * 6) : 0.5;
    ctx.globalAlpha = pulse;
    ctx.beginPath();
    ctx.arc(cx + 4, cy, 6, -0.9, 0.9);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + 4, cy, 11, -0.9, 0.9);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

// A soft pink veil that fades away after a scene change (story -> level, etc.).
function drawFadeIn() {
  if (game.fadeIn <= 0) return;
  ctx.fillStyle = `rgba(255,214,234,${Math.min(1, game.fadeIn / 24)})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

export function draw() {
  const t = performance.now() / 1000;

  if (game.state === "VICTORY") {                    // the celebration picture replaces the game screen
    drawEnding(ctx, canvas, t);
    drawSpeaker(t);
    drawFadeIn();
    return;
  }

  ctx.fillStyle = "#fff0f6";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (game.level && game.state !== "MENU") {
    const themed = THEMES[game.level.theme];
    if (themed && game.state === "STORY") drawStoryScenery(ctx, canvas, themed, t);   // lifted above the dialogue box
    else if (themed) themed(ctx, game, canvas, t);
    else drawPlainScene();

    ctx.save();                                       // sparkle / heart particles (world space)
    ctx.translate(-game.cameraX, -game.cameraY);
    drawFx(ctx);
    ctx.restore();

    kawaiiGrade(ctx, canvas.width, canvas.height);    // soft pastel tint over everything
    if (game.state === "STORY") {
      drawStory(ctx, canvas, t);                      // visual-novel scene over the next level's scenery
    } else {
      drawHurtFlash();
      drawGoalArrow(ctx, canvas, t);                  // arrow to the goal when it is off-screen
      drawLevelIntro(ctx, canvas, t);                 // name + goal + tip card at the start of a level
      drawHud(t);
    }
    if (game.state === "LEVEL_COMPLETE") drawCelebration(ctx, canvas, t);   // confetti banner at the goal
  } else if (game.state === "MENU") {
    drawMenuScreen(ctx, canvas, t);                   // cute title page with Hachi
  }
  if (game.state === "PAUSED") drawPauseScreen(ctx, canvas, t);

  const overlay = OVERLAYS[game.state];
  if (overlay) {
    const title = overlay[0] === "__TITLE__" ? data.config.title : overlay[0];
    drawOverlay(title, overlay[1], overlay[2], t);
  }
  drawSpeaker(t);
  drawFadeIn();
}
