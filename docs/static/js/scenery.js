// Backdrop art for the snowy station, drawn like a painted anime background:
// soft sky and sun rays, hazy mountain ranges, a village with lit windows,
// two rows of forest, mist for depth, and two layers of falling snow.
// Everything is drawn with canvas paths and gradients, no image files.
//
// Layers further away scroll slower than the camera (parallax), and get
// lighter and bluer (atmospheric perspective) so the scene feels deep.
//
// PERFORMANCE: painting all those gradients every frame is slow, so each layer
// is painted ONCE into an offscreen canvas the first time it's needed, and
// after that a frame just copies (drawImage) the pictures. Only things that
// really move (snow, chimney smoke, clouds drifting) are drawn live.

import { scatterTwinkles, cloudFace, kawaiiSun, kawaiiFace } from "./style.js";

const TILE = 1800;   // each repeating layer is one 1800px-wide tile
const FULL_H = 540;

// ---- Small helpers --------------------------------------------------------

// y of a piecewise-linear ridge at x.
function ridgeY(peaks, x) {
  for (let i = 1; i < peaks.length; i++) {
    if (x <= peaks[i][0]) {
      const [x0, y0] = peaks[i - 1];
      const [x1, y1] = peaks[i];
      return y0 + (y1 - y0) * ((x - x0) / (x1 - x0));
    }
  }
  return peaks[peaks.length - 1][1];
}

// Paint something once into its own canvas.
function makeLayer(width, height, paint) {
  const c = document.createElement("canvas");
  c.width = width;
  c.height = height;
  paint(c.getContext("2d"));
  return c;
}

// Copy a repeating layer across the screen, scrolled at `factor` x camera speed.
function blit(ctx, img, w, cameraX, factor, extra = 0) {
  const start = -(((cameraX * factor) + extra) % TILE);
  for (let ox = Math.round(start) - TILE; ox < w; ox += TILE) ctx.drawImage(img, ox, 0);
}

// Call fn(ox) for each visible tile (used for the few live-drawn bits).
function eachTile(w, cameraX, factor, fn) {
  const start = -((cameraX * factor) % TILE);
  for (let ox = start - TILE; ox < w; ox += TILE) fn(ox);
}

// A soft band of mist: transparent at y0, `alpha` at y1.
function mist(ctx, w, y0, y1, alpha) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, "rgba(255,236,246,0)");
  g.addColorStop(1, `rgba(255,236,246,${alpha})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, y0, w, y1 - y0);
}

// ---- Sky --------------------------------------------------------------------

function paintSky(ctx, w, h) {
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#9fcdf2");
  sky.addColorStop(0.45, "#d3e6fb");
  sky.addColorStop(0.8, "#fde6f1");
  sky.addColorStop(1, "#fff3f8");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  const sx = w * 0.8, sy = 100;
  const glow = ctx.createRadialGradient(sx, sy, 4, sx, sy, 260);
  glow.addColorStop(0, "rgba(255,250,228,0.95)");
  glow.addColorStop(0.25, "rgba(255,246,215,0.45)");
  glow.addColorStop(1, "rgba(255,246,215,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
  kawaiiSun(ctx, sx, sy, 26);                         // a smiling sun

  // Faint god rays fanning down from the sun.
  for (let i = 0; i < 9; i++) {
    const a = Math.PI * 0.58 + i * 0.1;
    const g = ctx.createLinearGradient(sx, sy, sx + Math.cos(a) * 700, sy + Math.sin(a) * 700);
    g.addColorStop(0, "rgba(255,248,225,0.13)");
    g.addColorStop(1, "rgba(255,248,225,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + Math.cos(a) * 900, sy + Math.sin(a) * 900);
    ctx.lineTo(sx + Math.cos(a + 0.045) * 900, sy + Math.sin(a + 0.045) * 900);
    ctx.closePath();
    ctx.fill();
  }
}

// A soft cloud made of overlapping radial puffs.
function cloud(ctx, x, y, s) {
  const puffs = [[0, 0, 28], [-32, 9, 21], [34, 9, 23], [-13, -11, 22], [15, -13, 24],
    [60, 13, 16], [-58, 13, 16]];
  for (const [dx, dy, r] of puffs) {
    const cx = x + dx * s, cy = y + dy * s, rr = r * s;
    const g = ctx.createRadialGradient(cx, cy - rr * 0.3, rr * 0.1, cx, cy, rr);
    g.addColorStop(0, "rgba(255,255,255,0.95)");
    g.addColorStop(0.65, "rgba(246,250,253,0.82)");
    g.addColorStop(1, "rgba(214,228,240,0)");
    ctx.fillStyle = g;
    ctx.fillRect(cx - rr, cy - rr, rr * 2, rr * 2);
  }
}

const CLOUDS = [[150, 85, 1.3], [520, 140, 0.95], [900, 70, 1.5], [1280, 130, 1.1], [1630, 62, 0.9]];

// ---- Mountains ----------------------------------------------------------------

const FAR_PEAKS = [[0, 300], [210, 232], [420, 285], [660, 205], [900, 278], [1150, 220],
  [1400, 290], [1620, 240], [1800, 300]];
const MID_PEAKS = [[0, 330], [170, 262], [320, 312], [560, 196], [760, 300], [1010, 232],
  [1230, 314], [1480, 205], [1650, 290], [1800, 330]];
const HILL_PEAKS = [[0, 392], [230, 350], [470, 388], [720, 340], [980, 386], [1240, 346],
  [1500, 384], [1800, 392]];

// Paint one tile of a mountain range at x = 0.
function paintMountains(ctx, h, o) {
  const g = ctx.createLinearGradient(0, o.top, 0, o.bottom);
  g.addColorStop(0, o.colorTop);
  g.addColorStop(1, o.colorBottom);
  ctx.beginPath();
  ctx.moveTo(0, h);
  for (const [px, py] of o.peaks) ctx.lineTo(px, py);
  ctx.lineTo(TILE, h);
  ctx.closePath();
  ctx.fillStyle = g;
  ctx.fill();

  if (o.snow) {
    for (const [px, py] of o.peaks) {
      if (py > o.snowLimit) continue;
      const d = o.snowDepth;
      const lx = px - d * 0.95, rx = px + d * 0.95;
      const ly = ridgeY(o.peaks, lx), ry = ridgeY(o.peaks, rx);
      // Snow cap: lit on the sun side (left), shaded on the right.
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(rx, ry);
      ctx.lineTo(px + d * 0.5, py + d * 0.7);
      ctx.lineTo(px + d * 0.3, py + d * 0.52);
      ctx.lineTo(px + d * 0.08, py + d * 0.86);
      ctx.lineTo(px - d * 0.2, py + d * 0.58);
      ctx.lineTo(px - d * 0.5, py + d * 0.84);
      ctx.lineTo(lx, ly);
      ctx.closePath();
      ctx.fillStyle = "#fbfdff";
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(rx, ry);
      ctx.lineTo(px + d * 0.5, py + d * 0.7);
      ctx.lineTo(px + d * 0.3, py + d * 0.52);
      ctx.lineTo(px + d * 0.08, py + d * 0.86);
      ctx.lineTo(px, py + d * 0.5);
      ctx.closePath();
      ctx.fillStyle = "rgba(190,168,228,0.55)";
      ctx.fill();
      // Rock gullies running down the shaded face.
      ctx.strokeStyle = "rgba(70,95,128,0.28)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px + d * 0.12, py + d * 0.9);
      ctx.lineTo(px + d * 0.3, py + d * 1.9);
      ctx.moveTo(px + d * 0.45, py + d * 0.7);
      ctx.lineTo(px + d * 0.75, py + d * 1.7);
      ctx.stroke();
      kawaiiFace(ctx, px, py + d * 0.52, d / 19, "sleepy");   // every snowy peak is a sleepy cutie
    }
  }

  if (o.forest) {                       // tiny pines along the ridge line
    for (let x = 0; x < TILE; x += 13) {
      const y = ridgeY(o.peaks, x) + 3;
      const th = 11 + ((x * 7) % 8);
      ctx.fillStyle = o.forest;
      ctx.beginPath();
      ctx.moveTo(x, y - th);
      ctx.lineTo(x + 5, y);
      ctx.lineTo(x - 5, y);
      ctx.closePath();
      ctx.fill();
    }
  }
}

// ---- Village ----------------------------------------------------------------------

const HOUSES = [[60, 44, 30], [150, 36, 26], [250, 52, 34], [370, 40, 28], [470, 48, 32],
  [590, 38, 26], [700, 54, 36], [830, 42, 28], [940, 46, 32], [1050, 36, 26],
  [1160, 50, 34], [1280, 42, 30], [1390, 46, 28], [1500, 38, 26], [1620, 52, 34]];
const WALL = ["#e3d8c8", "#d2c2ae", "#c9b8a8", "#e8dcc6"];
const HOUSE_BASE = 470;

function paintHouse(ctx, x, w, hgt, i) {
  const top = HOUSE_BASE - hgt;
  ctx.fillStyle = WALL[i % WALL.length];
  ctx.fillRect(x, top, w, hgt);
  ctx.fillStyle = "rgba(60,70,100,0.18)";           // shaded side
  ctx.fillRect(x + w * 0.6, top, w * 0.4, hgt);

  ctx.fillStyle = "#7a5a52";                        // roof
  ctx.beginPath();
  ctx.moveTo(x - 5, top + 1);
  ctx.lineTo(x + w / 2, top - 17);
  ctx.lineTo(x + w + 5, top + 1);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#fbfdff";                        // snow on the roof
  ctx.beginPath();
  ctx.moveTo(x - 5, top + 1);
  ctx.lineTo(x + w / 2, top - 17);
  ctx.lineTo(x + w + 5, top + 1);
  ctx.lineTo(x + w + 1, top - 2);
  ctx.lineTo(x + w * 0.75, top - 4);
  ctx.lineTo(x + w / 2, top - 8);
  ctx.lineTo(x + w * 0.25, top - 4);
  ctx.lineTo(x - 1, top - 2);
  ctx.closePath();
  ctx.fill();

  // Warm lit windows with a soft glow.
  for (const wx of [x + 6, x + w - 14]) {
    const wy = top + 8;
    const g = ctx.createRadialGradient(wx + 4, wy + 4, 1, wx + 4, wy + 4, 14);
    g.addColorStop(0, "rgba(255,214,120,0.5)");
    g.addColorStop(1, "rgba(255,214,120,0)");
    ctx.fillStyle = g;
    ctx.fillRect(wx - 10, wy - 10, 28, 28);
    ctx.fillStyle = "#ffd98a";
    ctx.fillRect(wx, wy, 8, 9);
    ctx.fillStyle = "rgba(120,80,40,0.55)";
    ctx.fillRect(wx + 3.6, wy, 0.9, 9);
    ctx.fillRect(wx, wy + 4, 8, 0.9);
  }
  ctx.fillStyle = "#6a4a3a";                        // door
  ctx.fillRect(x + w / 2 - 3, HOUSE_BASE - 11, 6, 11);

  if (i % 3 === 0) {                                // chimney (smoke is drawn live)
    ctx.fillStyle = "#8a6a60";
    ctx.fillRect(x + w * 0.72, top - 20, 6, 12);
  }
}

// Chimney smoke is the only animated part of the village.
function drawSmoke(ctx, w, cameraX, t) {
  eachTile(w, cameraX, 0.34, (ox) => {
    HOUSES.forEach(([hx, hw, hh], i) => {
      if (i % 3 !== 0) return;
      const cx = ox + hx + hw * 0.72 + 3;
      if (cx < -40 || cx > w + 40) return;
      const top = HOUSE_BASE - hh;
      for (let k = 0; k < 4; k++) {
        const age = (t * 0.5 + k * 0.25) % 1;
        ctx.fillStyle = `rgba(245,248,250,${0.55 * (1 - age)})`;
        ctx.beginPath();
        ctx.arc(cx + age * 14, top - 24 - age * 34, 3 + age * 6, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  });
}

// ---- Forest -------------------------------------------------------------------------

// A snow-laden pine in four tiers, lit from the left.
function pine(ctx, x, baseY, height, dark, light) {
  pineBody(ctx, x, baseY, height, dark, light);
  if (height > 84) {                                  // the big pines have happy little faces
    const top = baseY - 6;
    kawaiiFace(ctx, x, top - height * 0.56 + height * 0.27, height / 60, "happy");
  }
}

function pineBody(ctx, x, baseY, height, dark, light) {
  ctx.fillStyle = "#4a3b30";
  ctx.fillRect(x - 2.5, baseY - 8, 5, 8);
  const top = baseY - 6;
  for (let i = 0; i < 4; i++) {
    const apex = top - height * (1 - i * 0.22);
    const bottom = apex + height * 0.38;
    const half = height * (0.2 + i * 0.07);
    ctx.fillStyle = dark;
    ctx.beginPath();
    ctx.moveTo(x, apex);
    ctx.lineTo(x + half, bottom);
    ctx.lineTo(x - half, bottom);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = light;                          // sunlit left half
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.moveTo(x, apex);
    ctx.lineTo(x, bottom);
    ctx.lineTo(x - half, bottom);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
    const span = bottom - apex;                     // snow resting on the tier
    ctx.fillStyle = "#f4f8fb";
    ctx.beginPath();
    ctx.moveTo(x, apex);
    ctx.lineTo(x + half * 0.66, apex + span * 0.66);
    ctx.lineTo(x + half * 0.34, apex + span * 0.52);
    ctx.lineTo(x, apex + span * 0.72);
    ctx.lineTo(x - half * 0.34, apex + span * 0.52);
    ctx.lineTo(x - half * 0.66, apex + span * 0.66);
    ctx.closePath();
    ctx.fill();
  }
}

const TREES_BACK = [30, 95, 170, 240, 320, 400, 470, 560, 640, 720, 800, 890, 960, 1050, 1130, 1220, 1300, 1390, 1470, 1550, 1700];
const TREES_FRONT = [70, 180, 300, 420, 540, 660, 790, 910, 1030, 1150, 1270, 1390, 1500, 1640];

// ---- Build every static layer once ------------------------------------------------------

let layers = null;

function buildLayers(w, h) {
  const L = {};
  L.sky = makeLayer(w, h, (c) => { paintSky(c, w, h); scatterTwinkles(c, w, h, 26, 1, 0.5); });

  L.clouds = makeLayer(TILE, 240, (c) => {
    for (const [cx, cy, s] of CLOUDS) {
      cloud(c, cx, cy, s);
      cloudFace(c, cx + 2 * s, cy + 3 * s, 2.0 * s);       // every cloud is a sleepy cutie
    }
  });

  L.far = makeLayer(TILE, FULL_H, (c) => {
    paintMountains(c, FULL_H, {
      peaks: FAR_PEAKS, top: 205, bottom: 380,
      colorTop: "#d6c9ee", colorBottom: "#f1e9f9",
      snow: true, snowLimit: 250, snowDepth: 38, forest: null,
    });
    mist(c, TILE, 250, 400, 0.4);
  });
  L.mid = makeLayer(TILE, FULL_H, (c) => {
    paintMountains(c, FULL_H, {
      peaks: MID_PEAKS, top: 190, bottom: 420,
      colorTop: "#bcb3e6", colorBottom: "#e3def4",
      snow: true, snowLimit: 260, snowDepth: 46, forest: null,
    });
    mist(c, TILE, 300, 430, 0.5);
  });
  L.hills = makeLayer(TILE, FULL_H, (c) => {
    paintMountains(c, FULL_H, {
      peaks: HILL_PEAKS, top: 335, bottom: 480,
      colorTop: "#b7bcdf", colorBottom: "#dadef0",
      snow: false, forest: "#8f92c4",
    });
  });
  L.village = makeLayer(TILE, FULL_H, (c) => {
    HOUSES.forEach(([hx, hw, hh], i) => paintHouse(c, hx, hw, hh, i));
    mist(c, TILE, 400, 478, 0.35);
  });
  L.treesBack = makeLayer(TILE, FULL_H, (c) => {
    TREES_BACK.forEach((tx, i) => pine(c, tx, 474, 44 + ((i * 29) % 30), "#6c9b8e", "#a9d3c3"));
    mist(c, TILE, 410, 480, 0.4);
  });
  L.treesFront = makeLayer(TILE, FULL_H, (c) => {
    TREES_FRONT.forEach((tx, i) => pine(c, tx, 480, 78 + ((i * 41) % 44), "#4f8d79", "#88c6aa"));
  });

  L.vignette = makeLayer(w, h, (c) => {
    const v = c.createRadialGradient(w / 2, h / 2, h * 0.45, w / 2, h / 2, w * 0.72);
    v.addColorStop(0, "rgba(40,30,70,0)");
    v.addColorStop(1, "rgba(40,30,70,0.3)");
    c.fillStyle = v;
    c.fillRect(0, 0, w, h);
  });
  return L;
}

function getLayers(w, h) {
  if (!layers) layers = buildLayers(w, h);
  return layers;
}

// ---- Public: the whole backdrop (screen space) -----------------------------------------

export function drawBackdrop(ctx, w, h, cameraX, t = 0) {
  const L = getLayers(w, h);
  ctx.drawImage(L.sky, 0, 0);
  blit(ctx, L.clouds, w, cameraX, 0.06, t * 6);     // clouds drift slowly
  blit(ctx, L.far, w, cameraX, 0.08);
  blit(ctx, L.mid, w, cameraX, 0.17);
  blit(ctx, L.hills, w, cameraX, 0.28);
  blit(ctx, L.village, w, cameraX, 0.34);
  drawSmoke(ctx, w, cameraX, t);
  blit(ctx, L.treesBack, w, cameraX, 0.45);
  blit(ctx, L.treesFront, w, cameraX, 0.68);
}

// ---- The rail bed under the platform, seen through the gaps (world space) ----------------

export function drawRailBed(ctx, cameraX, w) {
  const x0 = Math.floor(cameraX / 40) * 40 - 40;
  const bed = ctx.createLinearGradient(0, 480, 0, 560);
  bed.addColorStop(0, "#4b505a");
  bed.addColorStop(1, "#1b1e24");
  ctx.fillStyle = bed;
  ctx.fillRect(cameraX, 480, w, 80);

  ctx.fillStyle = "#5e4a3b";                        // wooden ties
  for (let x = x0; x < cameraX + w + 40; x += 40) ctx.fillRect(x, 512, 24, 14);
  ctx.fillStyle = "#aeb6bf";                        // steel rail
  ctx.fillRect(cameraX, 506, w, 5);
  ctx.fillStyle = "#dfe5ea";
  ctx.fillRect(cameraX, 506, w, 1.5);
  ctx.fillStyle = "rgba(240,246,250,0.8)";          // snow on the gravel
  ctx.fillRect(cameraX, 528, w, 3);
}

// ---- Falling snow: a slow, small far layer and a fast, big near layer ----------------------

const FAR_FLAKES = Array.from({ length: 56 }, (_, i) => ({
  x: (i * 73.13) % 1, y: (i * 37.71) % 1,
  speed: 20 + (i % 5) * 7, drift: 6 + (i % 4) * 3, size: 0.8 + (i % 3) * 0.4,
}));
const NEAR_FLAKES = Array.from({ length: 26 }, (_, i) => ({
  x: (i * 61.7) % 1, y: (i * 29.3) % 1,
  speed: 90 + (i % 6) * 22, drift: 34 + (i % 5) * 10, size: 2 + (i % 4) * 0.9,
}));

export function drawSnow(ctx, w, h, cameraX, t, layer) {
  const near = layer === "near";
  const flakes = near ? NEAR_FLAKES : FAR_FLAKES;
  const parallax = near ? 0.95 : 0.3;
  for (const f of flakes) {
    const x = (((f.x * w + t * f.drift - cameraX * parallax) % w) + w) % w;
    const y = (f.y * h + t * f.speed) % h;
    const sx = x + Math.sin(t * 1.3 + f.y * 20) * (near ? 10 : 5);
    if (near) {                                     // soft halo for out-of-focus flakes
      ctx.fillStyle = "rgba(255,255,255,0.22)";
      ctx.beginPath();
      ctx.arc(sx, y, f.size * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = near ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.7)";
    ctx.beginPath();
    ctx.arc(sx, y, f.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ---- Final colour pass: soft vignette so the eye stays on the action ------------------------

export function drawAtmosphere(ctx, w, h) {
  ctx.drawImage(getLayers(w, h).vignette, 0, 0);
}
