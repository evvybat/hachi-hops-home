// Entry point: wires the modules together and runs the loop.
//
//   state.js   shared game state          input.js   keyboard
//   api.js     loads data from Flask      player.js  player + physics
//   level.js   level flow + checks        update.js  one frame of logic
//   render.js  canvas drawing         audio.js   sound effects + music
import { game } from "./state.js";
import { loadData } from "./api.js";
import { loadSprites } from "./sprites.js";
import { setupInput, isKey } from "./input.js";
import { jump } from "./player.js";
import { restartLevel } from "./level.js";
import { startStory, advanceStory, skipStory, skipCelebration } from "./story.js";
import { update } from "./update.js";
import { draw, focusCanvas } from "./render.js";
import { syncAudio, toggleMute, prepareAudio } from "./audio.js";

// One-time key presses: which screen are we on, and what does the key do?
function onKeyPress(code) {
  if (code === "KeyM") { toggleMute(); return; }          // M mutes / unmutes everything

  switch (game.state) {
    case "MENU":
      if (isKey("confirm", code)) { game.score = 0; startStory("intro"); }   // story first, then level 1
      break;
    case "STORY":
      if (isKey("confirm", code)) advanceStory();
      else if (isKey("menu", code)) skipStory();             // Esc skips the story scene
      break;
    case "PLAYING":
      if (isKey("pause", code)) game.state = "PAUSED";
      else if (isKey("restart", code)) restartLevel();
      else if (isKey("jump", code)) jump();
      break;
    case "PAUSED":
      if (isKey("pause", code)) game.state = "PLAYING";
      else if (isKey("restart", code)) restartLevel();
      else if (isKey("menu", code)) game.state = "MENU";       // Esc (while paused): main menu
      break;
    case "LEVEL_COMPLETE":
      if (isKey("confirm", code)) skipCelebration();     // it also moves on by itself
      break;
    case "GAME_OVER":                                     // out of hearts or time: retry just this level
      if (isKey("restart", code) || isKey("confirm", code)) restartLevel();
      else if (isKey("menu", code)) game.state = "MENU";
      break;
    case "VICTORY":
      if (isKey("restart", code) || isKey("confirm", code)) game.state = "MENU";
      break;
  }
}

// The game logic is tuned for 60 steps per second. We run it on a fixed clock,
// so the game moves at the same speed on a 60 Hz, 144 Hz or slow computer:
// a fast screen just draws more often, a slow one catches up with extra steps.
const STEP = 1 / 60;
const MAX_STEPS = 5;                   // never try to catch up more than this in one frame
let lastTime = 0;
let behind = 0;
function frame(now) {
  behind += Math.min((now - lastTime) / 1000, 0.25);
  lastTime = now;
  let steps = 0;
  while (behind >= STEP && steps < MAX_STEPS) {
    update(STEP);
    behind -= STEP;
    steps++;
  }
  if (steps === MAX_STEPS) behind = 0;  // too slow to catch up: drop the backlog
  syncAudio();                         // music for this screen + jingles when it changes
  draw();
  requestAnimationFrame(frame);
}

// Wait (briefly) for the cute Fredoka font, so the first frames use it. If it
// can't load, we carry on after 2.5 s with the fallback rounded fonts.
async function waitForFont() {
  if (!document.fonts) return;
  const loads = ["400", "600", "700"].map((w) => document.fonts.load(`${w} 16px Fredoka`));
  await Promise.race([Promise.all(loads), new Promise((r) => setTimeout(r, 2500))]);
}

async function start() {
  await waitForFont();
  await loadData();
  await loadSprites();                 // uses your Hachi art if it's in static/images/hachi
  prepareAudio();                      // get the sound ready now so the first key press is instant
  setupInput(onKeyPress);
  focusCanvas();
  requestAnimationFrame((t) => { lastTime = t; frame(t); });
}

start();
