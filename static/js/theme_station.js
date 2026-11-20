// Draws a whole level in the "snow_station" look (Level 1).
// Order matters: back to front, like layers of paper.
//
// Things that never change (the station and the platforms) are painted once
// per level into offscreen canvases; each frame just copies the visible part.
// Only moving things (snow, pickups, hazards, Hachi) are drawn live.
import {
  drawBackdrop, drawRailBed, drawSnow, drawAtmosphere,
} from "./scenery.js";
import { bakeStationDecor, drawStationDecor } from "./station_decor.js";
import {
  drawPlatform, drawIceShimmer, drawCollectible, drawHazard, drawTrain,
} from "./props.js";
import { drawHachi } from "./hachi.js";

// ---- Per-level cache of the pre-painted station and platforms -------------------

let cache = { number: -1, decor: null, platforms: null };

function getCache(level) {
  if (cache.number !== level.number) {
    const platforms = document.createElement("canvas");
    platforms.width = level.worldWidth;
    platforms.height = 540;
    const pctx = platforms.getContext("2d");
    for (const plat of level.platforms) drawPlatform(pctx, plat, 0);
    cache = {
      number: level.number,
      decor: bakeStationDecor(level.worldWidth),
      platforms,
    };
  }
  return cache;
}

const onScreen = (obj, cameraX, w) => obj.x + obj.w > cameraX - 60 && obj.x < cameraX + w + 60;

export function drawStationScene(ctx, game, canvas, t) {
  const w = canvas.width, h = canvas.height;
  const level = game.level;
  const { decor, platforms } = getCache(level);
  const cam = game.cameraX;
  const sx = Math.floor(cam);

  drawBackdrop(ctx, w, h, cam, t);                 // 1. sky, mountains, village, forest
  drawSnow(ctx, w, h, cam, t, "far");              // 2. small, slow snow far away

  ctx.save();
  ctx.translate(-cam, -game.cameraY);              // everything below is world space
  drawRailBed(ctx, cam, w);                        // 3. tracks seen through gaps
  drawStationDecor(ctx, decor, cam, w, t);         // 4. canopy, pillars, lamps, signs
  drawTrain(ctx, level.goal, t);                   // 5. the Shinkansen (exit)

  ctx.drawImage(platforms, sx, 0, w, 540, sx, 0, w, 540);   // 6. platforms (pre-painted)
  for (const plat of level.platforms) {
    if (plat.style === "ice" && onScreen(plat, cam, w)) drawIceShimmer(ctx, plat, t);
  }

  for (const item of level.collectibles) {         // 7. pickups
    if (!item.collected && onScreen(item, cam, w)) drawCollectible(ctx, item, t);
  }
  for (const hz of level.hazards) {                // 8. dangers
    if (onScreen(hz, cam, w)) drawHazard(ctx, hz, t);
  }

  const p = game.player;                           // 9. Hachi (flickers when hurt)
  const flickerOff = p.hurtTimer > 0 && Math.floor(p.hurtTimer / 6) % 2 === 0;
  if (!flickerOff) drawHachi(ctx, p, t);
  ctx.restore();

  drawSnow(ctx, w, h, cam, t, "near");             // 10. big flakes in front of everything
  drawAtmosphere(ctx, w, h);                       // 11. vignette
}
