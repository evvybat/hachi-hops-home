// Player creation, movement and physics.
import { game, data } from "./state.js";
import { overlaps } from "./geometry.js";
import { spawnHearts } from "./fx.js";
import { sfx, sfxAt } from "./audio.js";

export function makePlayer(spawn) {
  const p = data.config.player;
  return {
    x: spawn.x, y: spawn.y, w: p.width, h: p.height,
    velocityX: 0, velocityY: 0,
    facingDirection: "right",
    isGrounded: false, isJumping: false,
    onIce: false,
    riding: null,             // the moving platform she's standing on, if any
    knockTimer: 0, knockVX: 0,   // a shove from a crowd or car (frames left, speed)
    happyTimer: 0,            // frames left of the happy face after a pickup
    lives: p.startingLives,   // hearts reset every level
    hurtTimer: 0,
    safeX: spawn.x, safeY: spawn.y,   // last good ground, for respawning
  };
}

// ---- Input-driven actions -------------------------------------------------

// Jump only when standing on something. velocityY is negative = upward.
export function jump() {
  const p = game.player;
  if (!p.isGrounded) return;
  p.velocityY = -data.config.physics.jumpForce;
  p.isGrounded = false;
  p.isJumping = true;
  sfx("jump");
}

// direction: -1 = left, 0 = stop, +1 = right.
export function movePlayer(direction) {
  const p = game.player;
  const ph = data.config.physics;
  const target = direction * ph.moveSpeed;

  if (direction !== 0) p.facingDirection = direction > 0 ? "right" : "left";

  if (p.onIce) {
    // Slippery: speed up slowly, and keep sliding when you let go.
    if (direction === 0) p.velocityX *= ph.iceFriction;
    else p.velocityX += (target - p.velocityX) * 0.06;
  } else {
    p.velocityX = target;
  }

  if (p.knockTimer > 0) {          // being shoved overrides walking for a moment
    p.velocityX = p.knockVX;
    p.knockTimer--;
  }
}

// ---- Physics --------------------------------------------------------------
// X and Y are moved and resolved separately. That way we always know which
// side of a platform was hit: a sideways hit stops us walking through a cart,
// a downward hit lands us on top.
export function applyPhysics() {
  const p = game.player;
  const ph = data.config.physics;
  const platforms = game.level.platforms;

  // 1. Gravity (capped so we can't fall fast enough to skip through floors).
  p.velocityY = Math.min(p.velocityY + ph.gravity, ph.maxFallSpeed);

  // 2. Horizontal move + collisions.
  p.x += p.velocityX;
  for (const plat of platforms) {
    if (plat.active === false || !overlaps(p, plat)) continue;   // fallen tables don't count
    if (p.velocityX > 0) p.x = plat.x - p.w;          // hit its left side
    else if (p.velocityX < 0) p.x = plat.x + plat.w;  // hit its right side
    else if (p.x + p.w / 2 < plat.x + plat.w / 2) p.x = plat.x - p.w;   // a moving platform
    else p.x = plat.x + plat.w;                                          // slid into her
    p.velocityX = 0;
  }
  // Level edges.
  p.x = Math.max(0, Math.min(p.x, game.level.worldWidth - p.w));

  // 3. Vertical move + collisions.
  const wasAir = !p.isGrounded;                   // for the landing sound
  const fallSpeed = p.velocityY;
  p.y += p.velocityY;
  p.isGrounded = false;
  p.onIce = false;
  p.riding = null;
  for (const plat of platforms) {
    if (plat.active === false || !overlaps(p, plat)) continue;
    if (p.velocityY > 0) {                            // falling: land on top
      p.y = plat.y - p.h;
      if (plat.kind === "bouncy") {                   // shop awning: spring back up
        p.velocityY = -ph.bounceForce;
        sfx("bounce");
        p.isGrounded = false;
        p.isJumping = true;
        continue;
      }
      p.isGrounded = true;
      p.isJumping = false;
      if (wasAir && fallSpeed > 4) sfx("land", { vol: Math.min(1, fallSpeed / 9) });   // soft thump
      p.onIce = plat.kind === "icy";
      p.riding = plat.move ? plat : null;               // moving platforms carry her
      if (plat.fragile && plat.state === "solid") {     // a fragile table starts to wobble
        plat.state = "shaking";
        plat.timer = plat.fragile.delay;
        sfxAt("wobble", plat.x + plat.w / 2);
      }
      if (!plat.move) rememberSafeSpot(p, plat);        // (don't respawn her onto a moving one)
    } else if (p.velocityY < 0) {                     // rising: bonk head
      p.y = plat.y + plat.h;
    }
    p.velocityY = 0;
  }
}

// Remember where we last stood well inside a platform (not on its edge), so
// a fall can put us back somewhere that won't immediately drop us again.
function rememberSafeSpot(p, plat) {
  const margin = 20;
  if (p.x >= plat.x + margin && p.x + p.w <= plat.x + plat.w - margin) {
    p.safeX = p.x;
    p.safeY = p.y;
  }
}

// ---- Damage / respawn -----------------------------------------------------

// Lose a heart unless briefly invincible. Returns true if a heart was lost.
// `force` skips the invincibility check (falling always costs a heart).
export function hurtPlayer(force = false) {
  const p = game.player;
  if (p.hurtTimer > 0 && !force) return false;
  p.lives--;
  p.hurtTimer = data.config.player.hurtInvincibleFrames;
  spawnHearts(p.x + p.w / 2, p.y);
  sfx("hurt");               // little hearts float up (ouch!)
  return true;
}

export function respawnPlayer() {
  const p = game.player;
  sfx("respawn");
  p.x = p.safeX;
  p.y = p.safeY;
  p.velocityX = p.velocityY = 0;
  p.isGrounded = p.isJumping = false;
}

export function tickPlayerTimers() {
  const p = game.player;
  if (p.hurtTimer > 0) p.hurtTimer--;   // invincibility countdown
  if (p.happyTimer > 0) p.happyTimer--;
}
