// The camera: follows the player sideways, and up/down on tall levels.
// Levels are screen-sized (540px tall) unless they set `worldHeight`.
import { game, data } from "./state.js";

export const DEFAULT_WORLD_HEIGHT = 540;

export function worldHeight() {
  return game.level.worldHeight || DEFAULT_WORLD_HEIGHT;
}

// Where the camera wants to be: player roughly centred sideways, and a little
// below the middle vertically so there's more room to see what's above.
function target() {
  const p = game.player;
  const viewW = data.config.screen.width;
  const viewH = data.config.screen.height;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(v, hi));
  return {
    x: clamp(p.x + p.w / 2 - viewW / 2, 0, game.level.worldWidth - viewW),
    y: clamp(p.y + p.h / 2 - viewH * 0.6, 0, Math.max(0, worldHeight() - viewH)),
  };
}

// Jump straight to the right spot (when a level starts).
export function snapCamera() {
  const t = target();
  game.cameraX = t.x;
  game.cameraY = t.y;
}

// Glide toward the target each frame; vertical movement is eased so climbing
// doesn't jerk the picture around.
export function followCamera() {
  const t = target();
  game.cameraX = t.x;
  game.cameraY += (t.y - game.cameraY) * 0.14;
}
