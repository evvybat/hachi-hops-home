// One frame of game logic. Only runs while PLAYING, which is what freezes
// physics and timers on the pause / menu / end screens.
import { game } from "./state.js";
import { held } from "./input.js";
import { followCamera } from "./camera.js";
import { updatePlatforms } from "./level.js";
import { updateFx } from "./fx.js";
import { sfx } from "./audio.js";
import { updateStory, updateCelebration } from "./story.js";
let stepDistance = 0;      // how far she has walked since the last footstep sound
import { movePlayer, applyPhysics, tickPlayerTimers } from "./player.js";
import {
  checkCollectibles, updateHazards, checkHazards, checkFell, checkGoal, checkLose,
} from "./level.js";

export function update(dt) {
  if (game.fadeIn > 0) game.fadeIn--;
  if (game.state === "STORY") { updateStory(); return; }                  // visual-novel scene
  if (game.state === "LEVEL_COMPLETE") { updateCelebration(); return; }   // goal celebration
  if (game.state !== "PLAYING") return;

  game.frame++;
  updateFx();
  updatePlatforms();                      // moving platforms carry her along first
  movePlayer((held("right") ? 1 : 0) - (held("left") ? 1 : 0));
  applyPhysics();
  const walker = game.player;
  if (walker.isGrounded && Math.abs(walker.velocityX) > 0.3) {          // soft footsteps
    stepDistance += Math.abs(walker.velocityX);
    if (stepDistance > 26) {
      stepDistance = 0;
      sfx("step", { pitch: 0.85 + Math.random() * 0.3 });
    }
  }
  tickPlayerTimers();
  checkCollectibles();
  updateHazards();
  checkHazards();
  checkFell();
  followCamera();

  if (game.level.timeLimit) {
    game.levelTimer = Math.max(0, game.levelTimer - dt);
  }
  checkGoal();
  checkLose();
}
