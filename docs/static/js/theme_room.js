// Draws a whole level in the "room707" look (Level 4: the housewarming).
// Back to front: the room (pre-painted), still platforms (pre-painted), the
// front door, then live things: wobbly tables and sliding boxes, pickups,
// hazards and Hachi. Finally floating sparkles and a warm vignette.
import { game } from "./state.js";
import { bakeRoomDecor } from "./room_decor.js";
import {
  drawRoomPlatform, drawRoomHazard, drawRoomCollectible, drawFrontDoor,
} from "./props_room.js";
import { drawHachi } from "./hachi.js";import { sparkle } from "./style.js";

let cache = { number: -1, decor: null, platforms: null, vignette: null };

function getCache(level, w, h) {
  if (cache.number !== level.number) {
    const platforms = document.createElement("canvas");
    platforms.width = level.worldWidth;
    platforms.height = 540;
    const pctx = platforms.getContext("2d");
    // Bake only the platforms that never change: not tables (fragile) or sliding boxes (move).
    for (const plat of level.platforms) {
      if (!plat.move && !plat.fragile) drawRoomPlatform(pctx, plat, 0);
    }
    const vignette = document.createElement("canvas");
    vignette.width = w;
    vignette.height = h;
    const v = vignette.getContext("2d");
    const g = v.createRadialGradient(w / 2, h / 2, h * 0.5, w / 2, h / 2, w * 0.72);
    g.addColorStop(0, "rgba(120,50,90,0)");
    g.addColorStop(1, "rgba(120,50,90,0.2)");
    v.fillStyle = g;
    v.fillRect(0, 0, w, h);
    cache = { number: level.number, decor: bakeRoomDecor(level), platforms, vignette };
  }
  return cache;
}

const onScreen = (o, camX, w) => o.x + o.w > camX - 120 && o.x < camX + w + 120;

export function drawRoomScene(ctx, game_, canvas, t) {
  const w = canvas.width, h = canvas.height;
  const level = game.level;
  const { decor, platforms, vignette } = getCache(level, w, h);
  const camX = game.cameraX;
  const sx = Math.floor(camX);

  ctx.save();
  ctx.translate(-camX, -game.cameraY);
  ctx.drawImage(decor, sx, 0, w, 540, sx, 0, w, 540);              // 1. the room
  ctx.drawImage(platforms, sx, 0, w, 540, sx, 0, w, 540);          // 2. still platforms

  for (const plat of level.platforms) {                           // 3. tables + sliding boxes (live)
    if ((plat.move || plat.fragile) && onScreen(plat, camX, w)) drawRoomPlatform(ctx, plat, t);
  }

  const collected = game.itemsCollected;
  drawFrontDoor(ctx, level.goal, collected, level.itemsRequired, game.levelTimer, t);   // 4. the door

  for (const item of level.collectibles) {                        // 5. party items
    if (!item.collected && onScreen(item, camX, w)) drawRoomCollectible(ctx, item, t);
  }
  for (const hz of level.hazards) {                               // 6. pots, cups, spills
    const near = hz.fall ? { x: hz.x, w: hz.w } : hz;
    if (onScreen(near, camX, w)) drawRoomHazard(ctx, hz, t);
  }

  const p = game.player;                                          // 7. Hachi
  const flickerOff = p.hurtTimer > 0 && Math.floor(p.hurtTimer / 6) % 2 === 0;
  if (!flickerOff) drawHachi(ctx, p, t);
  ctx.restore();

  for (let i = 0; i < 14; i++) {                                   // 8. floating sparkles
    const x = (((i * 137.5 + t * (6 + (i % 4) * 3) - camX * 0.8) % w) + w) % w;
    const y = 30 + ((i * 61.3 + t * (8 + (i % 3) * 4)) % (h - 80));
    sparkle(ctx, x, y, 2.6 + (i % 3), `rgba(255,255,255,${0.5 + 0.4 * Math.sin(t * 3 + i)})`);
  }
  ctx.drawImage(vignette, 0, 0);                                   // 9. vignette
}
