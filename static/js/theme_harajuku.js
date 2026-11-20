// Draws a whole level in the "harajuku" look (Level 3).
// Back to front: sky and skyline, the shopping street and mall, platforms,
// traffic signals, pickups, hazards, Nana, Hachi, then balloons and vignette.
//
// The still scenery and the platforms that don't move are painted once per
// level into offscreen canvases; each frame copies the visible slice. The
// moving platforms (racks, billboards, lift, one ledge) and everything else
// that moves are drawn live.
import { game } from "./state.js";
import {
  drawHarajukuBackdrop, drawHarajukuVignette, drawBalloons,
} from "./harajuku_scenery.js";
import { bakeHarajukuDecor } from "./harajuku_decor.js";
import {
  drawHarajukuPlatform, drawHarajukuHazard, drawHarajukuCollectible, drawSignal, drawNana,
} from "./props_harajuku.js";
import { drawHachi } from "./hachi.js";

let cache = { number: -1, decor: null, platforms: null };

function getCache(level) {
  if (cache.number !== level.number) {
    const platforms = document.createElement("canvas");
    platforms.width = level.worldWidth;
    platforms.height = 540;
    const pctx = platforms.getContext("2d");
    for (const plat of level.platforms) if (!plat.move) drawHarajukuPlatform(pctx, plat, 0);
    cache = { number: level.number, decor: bakeHarajukuDecor(level), platforms };
  }
  return cache;
}

const onScreen = (o, camX, w) => o.x + o.w > camX - 120 && o.x < camX + w + 120;

export function drawHarajukuScene(ctx, game_, canvas, t) {
  const w = canvas.width, h = canvas.height;
  const level = game.level;
  const { decor, platforms } = getCache(level);
  const camX = game.cameraX;
  const sx = Math.floor(camX);

  drawHarajukuBackdrop(ctx, w, h, camX, t);            // 1. sky, skyline, 109 towers

  ctx.save();
  ctx.translate(-camX, -game.cameraY);                 // everything below is world space
  ctx.drawImage(decor, sx, 0, w, 540, sx, 0, w, 540);  // 2. shops, arch, mall (pre-painted)
  ctx.drawImage(platforms, sx, 0, w, 540, sx, 0, w, 540);   // 3. still platforms (pre-painted)
  for (const plat of level.platforms) {                // 4. moving platforms (live)
    if (plat.move && onScreen(plat, camX, w)) drawHarajukuPlatform(ctx, plat, t);
  }

  for (const hz of level.hazards) {                    // 5. traffic signals for each car
    if (hz.cycle && hz.signal && onScreen({ x: hz.signal, w: 20 }, camX, w)) drawSignal(ctx, hz.signal, hz, t);
  }
  const need = level.itemsRequired;
  drawNana(ctx, level.goal, game.itemsCollected, need, t);       // 6. Nana and her bags

  for (const item of level.collectibles) {             // 7. pickups
    if (!item.collected && onScreen(item, camX, w)) drawHarajukuCollectible(ctx, item, t);
  }
  for (const hz of level.hazards) {                    // 8. shoppers and cars
    if (onScreen(hz.cycle ? { x: Math.min(hz.cycle.from, hz.cycle.to), w: 600 } : hz, camX, w)) {
      drawHarajukuHazard(ctx, hz, t);
    }
  }

  const p = game.player;                               // 9. Hachi (flickers when hurt)
  const flickerOff = p.hurtTimer > 0 && Math.floor(p.hurtTimer / 6) % 2 === 0;
  if (!flickerOff) drawHachi(ctx, p, t);
  ctx.restore();

  drawBalloons(ctx, w, h, camX, t);                    // 10. heart balloons drift past
  drawHarajukuVignette(ctx, w, h);                     // 11. soft vignette
}
