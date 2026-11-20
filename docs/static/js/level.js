// Level loading and what happens inside a level (pickups, falls, goal).
import { game, data } from "./state.js";
import { makePlayer, hurtPlayer, respawnPlayer } from "./player.js";
import { overlaps } from "./geometry.js";
import { snapCamera, worldHeight } from "./camera.js";
import { spawnBurst } from "./fx.js";
import { sfx, sfxAt } from "./audio.js";

const POINTS_PER_ITEM = 100;
const FALL_GRAVITY = 0.4;        // falling pots and crates speed up like real objects
const FALL_MAX_SPEED = 10;
const WARNING_FRAMES = 45;       // red "!" shows this long before a drop
const POINTS_PER_LEVEL = 500;

export function loadLevel(number) {
  game.currentLevel = number;
  // Deep copy so pickups collected this attempt don't alter the original data.
  game.level = structuredClone(data.levels[number - 1]);
  game.player = makePlayer(game.level.spawn);
  game.frame = 0;
  game.fx = [];
  for (const plat of game.level.platforms) {
    if (plat.fragile) {                         // fragile tables: solid -> shaking -> fallen -> back
      plat.state = "solid";
      plat.active = true;
    }
    if (!plat.move) continue;                   // moving platforms swing about their start spot
    plat.baseX = plat.x;
    plat.baseY = plat.y;
    placeMovingPlatform(plat);
  }
  for (const hz of game.level.hazards) {
    if (hz.patrol) hz.vx = hz.patrol.speed;     // start walking right
    if (hz.fall) {                              // falling objects start out waiting
      hz.vy = 0;
      hz.wait = hz.fall.delay + 30;
      hz.hidden = true;
      hz.y = hz.fall.startY;
    }
  }
  game.levelStartScore = game.score;
  game.itemsCollected = 0;
  game.levelTimer = game.level.timeLimit || 0;
  snapCamera();
  game.state = "PLAYING";
}

// Restart (R): score from the abandoned attempt is thrown away too.
export function restartLevel() {
  game.score = game.levelStartScore;
  loadLevel(game.currentLevel);
}

export function checkCollectibles() {
  for (const item of game.level.collectibles) {
    if (item.collected || !overlaps(game.player, item)) continue;
    item.collected = true;
    game.player.happyTimer = 50;                // she smiles for a moment
    spawnBurst(item.x + item.w / 2, item.y + item.h / 2);   // sparkle burst!
    game.itemsCollected++;
    game.score += POINTS_PER_ITEM;
    pickupSound(item);
  }
}

// Pickups sparkle higher and higher when you grab several quickly (a combo).
let lastPickupFrame = -999;
let combo = 0;
function pickupSound(item) {
  combo = game.frame - lastPickupFrame < 70 ? Math.min(combo + 1, 9) : 0;
  lastPickupFrame = game.frame;
  sfx(item.required ? "key" : "pickup", { combo });
  const need = game.level.itemsRequired;
  const unlockedNow = requiredItemsLeft() === 0 && game.itemsCollected >= need
    && (item.required || (need > 0 && game.itemsCollected === need));
  if (unlockedNow) sfx("unlock");                 // the exit just opened!
}

// ---- Moving platforms ---------------------------------------------------------
// platform.move = { axis: "x" | "y", range, speed, phase } makes it swing
// smoothly (sine wave) about its starting spot. Anyone standing on it is carried.

function placeMovingPlatform(plat) {
  const m = plat.move;
  const swing = Math.sin(game.frame * m.speed + (m.phase || 0)) * m.range;
  if (m.axis === "x") plat.x = plat.baseX + swing;
  else plat.y = plat.baseY + swing;
}

export function updatePlatforms() {
  const p = game.player;
  for (const plat of game.level.platforms) {
    if (plat.fragile) updateFragile(plat);
    if (!plat.move) continue;
    const ox = plat.x, oy = plat.y;
    placeMovingPlatform(plat);
    if (p.riding === plat) {                    // she rides along
      p.x += plat.x - ox;
      p.y += plat.y - oy;
    }
  }
}

// Fragile platforms (retro tables): step on one and it wobbles for `delay`
// frames, then falls away, then comes back after `respawn` frames.
function updateFragile(plat) {
  if (plat.state === "shaking") {
    if (--plat.timer <= 0) {
      plat.state = "fallen";
      plat.active = false;
      plat.timer = plat.fragile.respawn;
      plat.fallAge = 0;
      sfxAt("tableFall", plat.x + plat.w / 2);
    }
  } else if (plat.state === "fallen") {
    plat.fallAge++;
    if (--plat.timer <= 0) {
      plat.state = "solid";
      plat.active = true;
      sfxAt("tableBack", plat.x + plat.w / 2, { vol: 0.7 });
    }
  }
}

// Moving hazards:
//  - pulse:  a pot that bubbles (warn, harmless), then boils over and shoots
//            foam `reach` px upward (active, hurts), on a repeating timer
//  - patrol: walks back and forth between patrol.min / max (pigeons, bicycles)
//  - cycle:  runs on a timer. For `warn` frames it sits at `from` with its
//            engine revving (harmless, signal flashing), then dashes to `to`
//            over `active` frames, then disappears until the next period.
//  - fall:   waits (showing a red "!" warning), then drops from startY to endY
//            like a flowerpot or crate, and repeats
export function updateHazards() {
  for (const hz of game.level.hazards) {
    if (hz.patrol) {
      hz.x += hz.vx;
      if (hz.x >= hz.patrol.max) { hz.x = hz.patrol.max; hz.vx = -Math.abs(hz.vx); }
      if (hz.x <= hz.patrol.min) { hz.x = hz.patrol.min; hz.vx = Math.abs(hz.vx); }
      // Little ambient sounds as they walk past: coo, ring-ring, giggles.
      if ((game.frame + Math.floor(hz.patrol.min)) % 210 === 0) {
        const ambient = { pigeon: "coo", bicycle: "bikeBell", crowd: "giggle" }[hz.kind];
        if (ambient) sfxAt(ambient, hz.x + hz.w / 2, { vol: 0.8 });
      }
    }
    if (hz.fall) updateFallingHazard(hz);
    if (hz.cycle) updateCycleHazard(hz);
    if (hz.pulse) updatePulseHazard(hz);
  }
}

function updatePulseHazard(hz) {
  const c = hz.pulse;
  const f = (game.frame + c.offset) % c.period;
  const warn = f < c.warn;                       // bubbling: foam rises a little, harmless
  const armed = f >= c.warn && f < c.warn + c.active;   // boiling over!
  if (warn && !hz.warn) sfxAt("potBubble", hz.x + hz.w / 2, { vol: 0.8 });
  if (armed && !hz.armed) sfxAt("potBoil", hz.x + hz.w / 2);
  hz.warn = warn;
  hz.armed = armed;
  hz.progress = hz.armed ? (f - c.warn) / c.active : 0;
}

function updateCycleHazard(hz) {
  const c = hz.cycle;
  const f = (game.frame + c.offset) % c.period;
  const warn = f < c.warn;                       // revving up: visible but harmless
  const armed = f >= c.warn && f < c.warn + c.active;
  if (warn && !hz.warn) sfxAt("carRev", c.from, { vol: 0.9 });
  if (armed && !hz.armed) sfxAt("carHonk", c.from, { vol: 1 });
  hz.warn = warn;
  hz.armed = armed;
  hz.hidden = !(hz.warn || hz.armed);
  if (hz.warn) hz.x = c.from;
  else if (hz.armed) hz.x = c.from + (c.to - c.from) * ((f - c.warn) / c.active);
  hz.dir = c.to >= c.from ? 1 : -1;
}

function updateFallingHazard(hz) {
  if (hz.wait > 0) {
    hz.wait--;
    hz.warn = hz.wait <= WARNING_FRAMES;       // warn just before it drops
    if (hz.wait === 0) {                        // release it
      hz.hidden = false;
      hz.warn = false;
      hz.y = hz.fall.startY;
      hz.vy = 0;
      sfxAt("whistle", hz.x + hz.w / 2, { vol: 0.8 });          // here it comes...
    }
    return;
  }
  hz.vy = Math.min(hz.vy + FALL_GRAVITY, FALL_MAX_SPEED);
  hz.y += hz.vy;
  if (hz.y >= hz.fall.endY) {                   // landed: vanish, then wait to repeat
    hz.y = hz.fall.endY;
    hz.hidden = true;
    hz.wait = 100;
    sfxAt(hz.kind === "crate" ? "thud" : "clink", hz.x + hz.w / 2);   // and lands
  }
}

// Touching a hazard costs a heart and pops Hachi up a little. The hitboxes are
// a few pixels smaller than the art so near-misses feel fair.
export function checkHazards() {
  const p = game.player;
  const body = { x: p.x + 4, y: p.y + 4, w: p.w - 8, h: p.h - 6 };
  for (const hz of game.level.hazards) {
    if (hz.hidden) continue;                    // a pot that hasn't dropped yet
    if (hz.cycle && !hz.armed) continue;        // a car that's only revving its engine
    if (hz.pulse && !hz.armed) continue;        // a pot that isn't boiling over right now
    const reach = hz.pulse ? hz.pulse.reach : 0;   // boiling foam shoots upward
    const hit = { x: hz.x + 3, y: hz.y + 3 - reach, w: hz.w - 6, h: hz.h - 3 + reach };
    if (!overlaps(body, hit)) continue;
    if (hurtPlayer()) {
      if (hz.kind === "crowd") sfx("squeak");          // squeaky-toy bump
      else if (hz.kind === "car") sfx("carHonk");
      p.velocityY = -7;          // knocked upward
      p.isGrounded = false;
      if (hz.push) {             // crowds and cars shove her backward, away from them
        p.knockVX = (p.x + p.w / 2 < hz.x + hz.w / 2 ? -1 : 1) * 6;
        p.knockTimer = 14;
      }
    }
    return;
  }
}

// Falling into a gap always costs a heart, then Hachi goes back to the last
// solid ground she stood on (with a moment of invincibility).
export function checkFell() {
  const p = game.player;
  if (p.y < worldHeight() + 100) return;
  sfx("fall");                                    // wheeeee... (slide whistle)
  hurtPlayer(true);
  respawnPlayer();
}

// Collectibles marked `required` (like Room 707's key) must be picked up first.
export function requiredItemsLeft() {
  return game.level.collectibles.filter((c) => c.required && !c.collected).length;
}

export function checkGoal() {
  const atGoal = overlaps(game.player, game.level.goal);
  const unlocked = game.itemsCollected >= game.level.itemsRequired && requiredItemsLeft() === 0;
  if (atGoal && unlocked) {
    game.score += POINTS_PER_LEVEL;
    game.state = "LEVEL_COMPLETE";            // a short celebration plays (see story.js)
    game.celebrate = { f: 0, hop0: null, baseY: game.player.y };
    game.player.hurtTimer = 0;
    game.player.velocityX = 0;
  }
}

export function checkLose() {
  const outOfHearts = game.player.lives <= 0;
  const outOfTime = game.level.timeLimit && game.levelTimer <= 0;
  if (outOfHearts || outOfTime) game.state = "GAME_OVER";
}
