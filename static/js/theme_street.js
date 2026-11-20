// Draws a whole level in the "tokyo_street" look (Level 2).
// Back to front: sunset sky and skyline, then the street and apartment block,
// platforms, pickups, hazards, Hachi, and finally drifting petals and vignette.
//
// The street, building and platforms never change, so they're painted once
// per level into offscreen canvases; each frame copies the visible part.
import { game } from "./state.js";
import { requiredItemsLeft } from "./level.js";
import {
  drawStreetBackdrop, drawStreetVignette, drawPetals,
} from "./street_scenery.js";
import { bakeStreetDecor } from "./street_decor.js";
import {
  drawStreetPlatform, drawStreetHazard, drawStreetCollectible, drawRoomDoor,
} from "./props_street.js";
import { drawHachi } from "./hachi.js";

let cache = { number: -1, decor: null, platforms: null };

function getCache(level) {
  if (cache.number !== level.number) {
    const platforms = document.createElement("canvas");
    platforms.width = level.worldWidth;
    platforms.height = level.worldHeight;
    const pctx = platforms.getContext("2d");
    for (const plat of level.platforms) drawStreetPlatform(pctx, plat);
    cache = { number: level.number, decor: bakeStreetDecor(level), platforms };
  }
  return cache;
}

// Is any part of this object near the visible window? (skip drawing if not)
function nearView(o, camX, camY, w, h) {
  const m = 80;
  const oy = o.fall ? o.fall.startY : o.y;
  const oh = o.fall ? o.fall.endY + o.h - o.fall.startY : o.h;
  return o.x + o.w > camX - m && o.x < camX + w + m && oy + oh > camY - m && oy < camY + h + m;
}

export function drawStreetScene(ctx, game_, canvas, t) {
  const w = canvas.width, h = canvas.height;
  const level = game.level;
  const { decor, platforms } = getCache(level);
  const camX = game.cameraX, camY = game.cameraY;
  const sx = Math.floor(camX), sy = Math.floor(camY);
  const maxCamY = Math.max(0, level.worldHeight - h);

  drawStreetBackdrop(ctx, w, h, camX, camY, maxCamY);   // 1. sky and skyline

  ctx.save();
  ctx.translate(-camX, -camY);                          // everything below is world space
  ctx.drawImage(decor, sx, sy, w, h, sx, sy, w, h);     // 2. street, building, poles
  ctx.drawImage(platforms, sx, sy, w, h, sx, sy, w, h); // 3. platforms (pre-painted)

  drawRoomDoor(ctx, level.goal, requiredItemsLeft() === 0, t);   // 4. Room 707's door

  for (const item of level.collectibles) {              // 5. pickups
    if (!item.collected && nearView(item, camX, camY, w, h)) drawStreetCollectible(ctx, item, t);
  }
  for (const hz of level.hazards) {                     // 6. dangers
    if (nearView(hz, camX, camY, w, h)) drawStreetHazard(ctx, hz, t);
  }

  const p = game.player;                                // 7. Hachi (flickers when hurt)
  const flickerOff = p.hurtTimer > 0 && Math.floor(p.hurtTimer / 6) % 2 === 0;
  if (!flickerOff) drawHachi(ctx, p, t);
  ctx.restore();

  drawPetals(ctx, w, h, camX, t);                       // 8. drifting petals
  drawStreetVignette(ctx, w, h);                        // 9. vignette
}
