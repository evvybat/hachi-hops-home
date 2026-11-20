// Detailed chibi people, drawn in the style of Hachi's hand-drawn sprites: a big
// round head with glossy wavy hair, huge shiny eyes, rosy cheeks with hatch
// lines, a cosy trimmed sweater, a flared pleated skirt, socks and chunky boots,
// plus a bow, flower or headphones and a shopping bag.
//
// Three things are drawn here, all sharing the same head and style:
//   drawChibiGirl  - a walking / standing shopper (the Shibuya crowds)
//   drawChibiRider - a cyclist, seated and pedalling (Level 2's bicycles)
//   NANA           - a preset for Nana Osaki (black hair, red tartan, punk boots)
//
// Origin is her feet (centre), +x is the way she faces, and she's about 66px
// tall. There are eight different looks (GIRLS) so a crowd isn't made of clones.
import { INK, heartPath, sparkle, bow } from "./style.js";

export const GIRLS = [
  { hair: "#f0c050", light: "#fff4b0", shade: "#c98a2a", style: "twin", skin: "#f6d3b4", eye: "#8a5a3a",
    top: "#ff9cc7", trim: "#ffffff", skirt: "#8a6ae0", sock: "#ffffff", boots: "#ff8fbf", acc: "bow", accColor: "#ff5fa2", bag: "#ffd23a", platform: true },
  { hair: "#3a2a3a", light: "#8a6a9a", shade: "#241a2a", style: "bob", skin: "#ffe5d3", eye: "#5a3a4a",
    top: "#9ad9f5", trim: "#fff0f6", skirt: "#fff6ee", sock: "#ffb3d1", boots: "#6a5a88", acc: "flower", accColor: "#ff8fbf", bag: "#ff7ab8" },
  { hair: "#d98aa8", light: "#ffc8da", shade: "#a8567a", style: "long", skin: "#ffe5d3", eye: "#a04a6a",
    top: "#fff0a8", trim: "#ff9cc7", skirt: "#5fc2a0", sock: "#ffffff", boots: "#ffffff", acc: "bow", accColor: "#6fd0f0", bag: "#6fd0f0" },
  { hair: "#a86a3a", light: "#e8b080", shade: "#7a4626", style: "bun", skin: "#f6d3b4", eye: "#6a3a2a",
    top: "#c9b6f5", trim: "#ffffff", skirt: "#ff9a6a", sock: "#6a5a88", boots: "#8a5a4a", acc: "phones", accColor: "#ff8fbf", bag: "#8aeb6a" },
  { hair: "#f4e6a8", light: "#ffffff", shade: "#d8c070", style: "long", skin: "#f0c8a4", eye: "#7a5a3a",
    top: "#ff7ab0", trim: "#ffe3f0", skirt: "#2f2a40", sock: "#2f2a40", boots: "#ff9cc7", acc: "bow", accColor: "#ffffff", bag: "#c9b6f5", platform: true },
  { hair: "#5a3a2a", light: "#b88a6a", shade: "#3a241a", style: "twin", skin: "#ffe5d3", eye: "#4a3028",
    top: "#fff6ee", trim: "#ff9cc7", skirt: "#ff6a8a", sock: "#fff6ee", boots: "#b86a5a", acc: "flower", accColor: "#ffd23a", bag: "#ff9a4a" },
  { hair: "#8ab8e8", light: "#d0ecff", shade: "#5a88b8", style: "bob", skin: "#ffe5d3", eye: "#3a6a9a",
    top: "#ffd0a0", trim: "#ffffff", skirt: "#6fb3e8", sock: "#ffffff", boots: "#8a6ae0", acc: "bow", accColor: "#ffd23a", bag: "#ff7ab8" },
  { hair: "#2a2030", light: "#6a5a7a", shade: "#16101c", style: "bun", skin: "#f6d3b4", eye: "#5a3a3a",
    top: "#ffb3d1", trim: "#8a6ae0", skirt: "#fff0a8", sock: "#ffb3d1", boots: "#2f2a40", acc: "phones", accColor: "#ffffff", bag: "#ffffff", platform: true },
];

// Nana Osaki: long wavy black hair, a studded black jacket with red trim and a
// choker, a red tartan skirt, tall platform boots, red lipstick, and both
// hands full of Hachi's shopping bags.
export const NANA = {
  hair: "#1c1622", light: "#6a5a8a", shade: "#0e0a14", style: "long", skin: "#ffe5d3", eye: "#4a3040",
  top: "#2a2432", trim: "#d83a52", skirt: "#d83a52", tartan: true, sock: "#2a2432", boots: "#2a2432", platform: true,
  acc: "none", accColor: "#d83a52", bag: "#ff7ab8", bag2: "#6fd0f0", choker: "#d83a52", studs: true, lip: "#d8264a",
};

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function inked(ctx, fill, lw = 1.4) {
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = lw;
  ctx.lineJoin = "round";
  ctx.stroke();
}

// One big sparkly eye (open or happily closed).
function eye(ctx, x, y, s, iris, closed) {
  ctx.strokeStyle = INK;
  ctx.lineCap = "round";
  if (closed) {
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(x, y - 0.4 * s, 2.6 * s, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
    return;
  }
  const rx = 2.8 * s, ry = 3.8 * s;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  const g = ctx.createLinearGradient(0, y - ry, 0, y + ry);
  g.addColorStop(0, "#3a2028");
  g.addColorStop(0.5, iris);
  g.addColorStop(1, "#f6c8a0");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(x + 0.2 * s, y + 0.3 * s, rx * 0.86, ry * 0.88, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1e1018";
  ctx.beginPath();
  ctx.ellipse(x + 0.2 * s, y + 0.1 * s, rx * 0.4, ry * 0.48, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(x - 0.8 * s, y - 1.3 * s, 1.1 * s, 1.3 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 1 * s, y + 1.7 * s, 0.5 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 1.7;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, Math.PI * 1.03, Math.PI * 1.97);
  ctx.stroke();
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(x + rx * 0.95, y - ry * 0.3);
  ctx.lineTo(x + rx * 1.5, y - ry * 0.7);
  ctx.stroke();
}

// Hair that sits behind the head, by style.
function hairBack(ctx, g, sway) {
  ctx.beginPath();
  ctx.ellipse(-1, -1, 16.6, 15.4, 0, 0, Math.PI * 2);
  inked(ctx, g.shade);
  const lock = (x, len, wave) => {                                    // a long wavy lock
    ctx.beginPath();
    ctx.moveTo(x - 4.6, -6);
    ctx.quadraticCurveTo(x - 6.4 + sway, len * 0.45, x - 3.2 + sway * 1.4 + wave, len);
    ctx.quadraticCurveTo(x + 0.4 + sway, len + 4, x + 1.8 + sway * 1.2 + wave, len - 2);
    ctx.quadraticCurveTo(x + 5.4 + sway, len * 0.45, x + 4.6, -6);
    ctx.closePath();
    inked(ctx, g.hair, 1.3);
  };
  if (g.style === "long") {
    lock(-14, 24, -2);
    lock(14, 22, 2);
  } else if (g.style === "bob") {
    lock(-14, 12, 0);
    lock(14, 10, 0);
  } else if (g.style === "twin") {
    for (const side of [-1, 1]) {                                     // pigtails with a tie
      const px = side * 19;
      ctx.beginPath();
      ctx.moveTo(px - side * 2, -8);
      ctx.quadraticCurveTo(px + side * 9 + sway, 8, px + side * 3 + sway * 1.6, 26);
      ctx.quadraticCurveTo(px - side * 4 + sway, 18, px - side * 4, -4);
      ctx.closePath();
      inked(ctx, g.hair, 1.3);
      heartPath(ctx, px - side * 0.4, -5, 3.4);
      inked(ctx, "#ff7ab8", 1);
    }
  } else if (g.style === "bun") {
    for (const side of [-1, 1]) {                                     // two round buns on top
      ctx.beginPath();
      ctx.arc(side * 11, -16, 7.6, 0, Math.PI * 2);
      inked(ctx, g.hair, 1.3);
      ctx.fillStyle = g.light;
      ctx.beginPath();
      ctx.ellipse(side * 11 - 2, -18, 2.4, 1.6, -0.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function accessory(ctx, g) {
  if (g.acc === "bow") bow(ctx, -10, -13, 0.95, g.accColor);
  else if (g.acc === "flower") {
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(-11 + Math.cos(a) * 3.2, -12 + Math.sin(a) * 3.2, 2.7, 0, Math.PI * 2);
      inked(ctx, g.accColor, 1);
    }
    ctx.beginPath();
    ctx.arc(-11, -12, 2, 0, Math.PI * 2);
    inked(ctx, "#fff3a8", 1);
  } else if (g.acc === "phones") {                                    // pastel headphones
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4.6;
    ctx.beginPath();
    ctx.arc(0, -3, 16.2, Math.PI * 1.08, Math.PI * 1.92);
    ctx.stroke();
    ctx.strokeStyle = g.accColor;
    ctx.lineWidth = 2.4;
    ctx.stroke();
    for (const x of [-15.6, 14.4]) {
      rr(ctx, x - 3.6, -5, 7.2, 11, 3.4);
      inked(ctx, g.accColor, 1.4);
      heartPath(ctx, x, 0.5, 2);
      inked(ctx, "#ff8fbf", 0.8);
    }
  }
}

// The whole head, centred on (0, 0): hair, face, eyes, cheeks, mouth, fringe,
// glossy highlights and accessory. Shared by walkers, riders and Nana.
function headBlock(ctx, g, sway, blink) {
  hairBack(ctx, g, sway);

  ctx.beginPath();                                                    // face
  ctx.ellipse(1.4, 1.6, 12.8, 11.6, 0, 0, Math.PI * 2);
  inked(ctx, g.skin, 1.5);
  ctx.fillStyle = "rgba(230,150,130,0.32)";                           // shadow under the fringe
  ctx.beginPath();
  ctx.ellipse(1.4, -5, 12.2, 4.4, 0, 0, Math.PI);
  ctx.fill();

  eye(ctx, -3.6, 1.4, 0.92, g.eye, blink);                            // far eye (a bit smaller)
  eye(ctx, 6.4, 1.4, 1.14, g.eye, blink);                             // near eye

  ctx.fillStyle = "rgba(255,110,140,0.55)";                           // blush with anime hatch lines
  ctx.beginPath();
  ctx.ellipse(-8.2, 7.6, 2.6, 1.5, 0, 0, Math.PI * 2);
  ctx.ellipse(11, 7.6, 2.6, 1.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(220,60,100,0.65)";
  ctx.lineWidth = 0.75;
  ctx.beginPath();
  for (const bx of [-8.2, 11]) for (const dx of [-1.2, 0.2, 1.6]) { ctx.moveTo(bx + dx - 0.6, 8.4); ctx.lineTo(bx + dx + 0.6, 6.8); }
  ctx.stroke();
  ctx.strokeStyle = "#c98370";                                        // tiny nose
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(12.4, 6);
  ctx.lineTo(13.2, 6.7);
  ctx.stroke();
  ctx.strokeStyle = INK;                                              // open smile (red lipstick for Nana)
  ctx.lineWidth = 1.2;
  ctx.fillStyle = g.lip || "#d94a62";
  ctx.beginPath();
  ctx.arc(6, 8.6, 1.9, 0, Math.PI);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();                                                    // fringe with pointed strands
  ctx.moveTo(-11.6, 1);
  ctx.quadraticCurveTo(-13, -14.6, 1.6, -15.4);
  ctx.quadraticCurveTo(15.4, -14.8, 14, 1);
  ctx.lineTo(11.6, -4.6);
  ctx.lineTo(9, -1.2);
  ctx.lineTo(6.2, -5);
  ctx.lineTo(3.4, -1.4);
  ctx.lineTo(0.4, -5.2);
  ctx.lineTo(-2.6, -1.6);
  ctx.lineTo(-5.8, -4.8);
  ctx.lineTo(-8.6, -1);
  ctx.closePath();
  inked(ctx, g.hair, 1.5);
  ctx.strokeStyle = "rgba(255,255,255,0.8)";                          // glossy highlight band
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(1.6, -8.2, 9.6, 1.16 * Math.PI, 1.64 * Math.PI);
  ctx.stroke();
  ctx.strokeStyle = g.light;
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.arc(1.6, -7.2, 10.8, 1.08 * Math.PI, 1.3 * Math.PI);
  ctx.stroke();
  ctx.beginPath();                                                    // cheek lock
  ctx.moveTo(13.4, -3.4);
  ctx.quadraticCurveTo(16.8 + sway * 0.4, 5, 14.4 + sway * 0.6, 13);
  ctx.quadraticCurveTo(11.6, 8, 11.8, 1);
  ctx.closePath();
  inked(ctx, g.hair, 1.2);

  accessory(ctx, g);
}

function bag(ctx, color) {
  ctx.strokeStyle = INK;                                              // handle
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 2, 4.2, Math.PI, 0);
  ctx.stroke();
  rr(ctx, -6.6, 2, 13.2, 14, 2.4);                                    // the bag
  inked(ctx, color, 1.5);
  heartPath(ctx, 0, 9.4, 3.2);
  inked(ctx, "#ffffff", 0.9);
}

function blinkNow(g, t) {
  return ((t + (g.skin.length + g.hair.charCodeAt(1)) * 0.37) % 3.8) < 0.11;
}

// ---- A walking / standing girl ----------------------------------------------------------------------
// o: { t, phase, walking }
export function drawChibiGirl(ctx, g, o = {}) {
  const t = o.t || 0, phase = o.phase || 0;
  const walking = o.walking !== false;
  const swing = walking ? Math.sin(phase) : 0;
  const bob = walking ? Math.abs(Math.sin(phase)) * 1.9 : Math.sin(t * 2 + phase) * 0.35;
  const sway = Math.max(-2.6, Math.min(2.6, -swing * 1.6));

  ctx.save();
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.strokeStyle = INK;
  ctx.translate(0, -bob);

  // ---- back arm (holds a second shopping bag if she has one) ----------------------------------------------
  ctx.save();
  ctx.translate(-9.4, -37);
  ctx.rotate(-swing * 0.5 - 0.1);
  rr(ctx, -2.8, -1, 5.6, 11, 2.8);
  inked(ctx, g.top, 1.3);
  ctx.beginPath();
  ctx.arc(0, 11.8, 2.6, 0, Math.PI * 2);
  inked(ctx, g.skin, 1.2);
  if (g.bag2) {
    ctx.translate(-0.4, 13);
    ctx.rotate(swing * 0.7 + 0.1);
    bag(ctx, g.bag2);
  }
  ctx.restore();

  // ---- legs: knee socks and chunky boots with a little sole -------------------------------------------------
  for (const [lx, lift] of [[-5.8, Math.max(0, -swing) * 3.2], [5.8, Math.max(0, swing) * 3.2]]) {
    rr(ctx, lx - 2.7, -17 - lift, 5.4, 10, 2.4);
    inked(ctx, g.sock, 1.3);
    ctx.strokeStyle = "rgba(141,94,80,0.35)";                          // sock ribbing
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(lx - 2.7, -15 - lift); ctx.lineTo(lx + 2.7, -15 - lift);
    ctx.moveTo(lx - 2.7, -12.6 - lift); ctx.lineTo(lx + 2.7, -12.6 - lift);
    ctx.stroke();
    rr(ctx, lx - 4.8, -9.4 - lift, 9.8, 9.4, [3, 4.4, 3, 3]);
    inked(ctx, g.boots, 1.4);
    ctx.fillStyle = g.platform ? "#ffffff" : "rgba(80,50,60,0.55)";    // sole (thick for platform boots)
    ctx.fillRect(lx - 4.6, -(g.platform ? 4.4 : 2.4) - lift, 9.4, g.platform ? 4.2 : 2.2);
    ctx.fillStyle = "rgba(255,255,255,0.65)";                          // boot shine
    ctx.fillRect(lx - 2.8, -8 - lift, 1.8, 3.4);
    ctx.strokeStyle = INK;
  }

  // ---- flared pleated skirt ---------------------------------------------------------------------------------------
  ctx.beginPath();
  ctx.moveTo(-9.4, -29);
  ctx.lineTo(9.4, -29);
  ctx.lineTo(15, -15);
  ctx.quadraticCurveTo(0, -11.6, -15, -15);
  ctx.closePath();
  inked(ctx, g.skirt, 1.5);
  ctx.save();                                                         // shading + pleats (+ tartan)
  ctx.clip();
  ctx.fillStyle = "rgba(60,30,80,0.18)";
  ctx.fillRect(2, -30, 14, 20);
  if (g.tartan) {
    ctx.strokeStyle = "rgba(25,10,25,0.5)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (let x = -15; x <= 15; x += 5) { ctx.moveTo(x * 0.6, -29); ctx.lineTo(x * 1.1, -12); }
    for (let y = -26; y < -12; y += 5) { ctx.moveTo(-16, y); ctx.lineTo(16, y); }
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,200,210,0.55)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    for (let x = -12; x <= 14; x += 10) { ctx.moveTo(x * 0.6, -29); ctx.lineTo(x * 1.1, -12); }
    for (let y = -23; y < -12; y += 10) { ctx.moveTo(-16, y); ctx.lineTo(16, y); }
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(60,30,80,0.3)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (const px of [-6, -2, 2, 6]) { ctx.moveTo(px * 0.7, -28); ctx.lineTo(px * 1.9, -13); }
  ctx.stroke();
  ctx.restore();
  ctx.strokeStyle = "rgba(255,255,255,0.8)";                          // hem trim
  ctx.lineWidth = 1.3;
  ctx.setLineDash([2.4, 2.4]);
  ctx.beginPath();
  ctx.moveTo(-14, -16.4);
  ctx.quadraticCurveTo(0, -13, 14, -16.4);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeStyle = INK;

  // ---- sweater / jacket: rounded body, contrasting trim at the neck and hem ----------------------------------------
  rr(ctx, -10, -43, 20, 17, 6);
  inked(ctx, g.top, 1.5);
  ctx.save();
  ctx.clip();
  ctx.fillStyle = "rgba(120,40,90,0.16)";
  ctx.fillRect(-11, -44, 7, 19);
  ctx.strokeStyle = "rgba(120,40,90,0.25)";                           // knit fold lines
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-2, -36); ctx.quadraticCurveTo(1, -33, 5, -35);
  ctx.moveTo(-6, -31); ctx.quadraticCurveTo(-2, -29, 1, -30);
  ctx.stroke();
  ctx.restore();
  rr(ctx, -10.8, -43.6, 21.6, 5, 2.5);
  inked(ctx, g.trim, 1.3);
  rr(ctx, -11, -30.6, 22, 4.4, 2.2);
  inked(ctx, g.trim, 1.3);
  if (g.studs) {                                                      // silver punk studs
    ctx.fillStyle = "#e6ecf4";
    for (const sx of [-7.5, -4, -0.5, 3, 6.5]) {
      ctx.beginPath();
      ctx.arc(sx, -41.2, 0.95, 0, Math.PI * 2);
      ctx.fill();
    }
    for (const sx of [-8, -3.6, 0.8, 5.2, 9]) {
      ctx.beginPath();
      ctx.arc(sx, -28.4, 0.9, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  heartPath(ctx, 3.4, -35, 2.6);                                      // heart button
  inked(ctx, "#ffffff", 0.9);
  if (g.choker) {                                                     // choker at the neck
    rr(ctx, -6.4, -44.2, 12.8, 3.6, 1.8);
    inked(ctx, g.choker, 1.1);
    ctx.beginPath();
    ctx.arc(0, -42.4, 1.5, 0, Math.PI * 2);
    inked(ctx, "#e6ecf4", 0.8);
  }

  // ---- front arm with a shopping bag swinging from the hand ----------------------------------------------------------
  ctx.save();
  ctx.translate(9.4, -37);
  ctx.rotate(swing * 0.5 + 0.1);
  rr(ctx, -2.8, -1, 5.6, 11, 2.8);
  inked(ctx, g.top, 1.3);
  ctx.beginPath();
  ctx.arc(0, 11.8, 2.6, 0, Math.PI * 2);
  inked(ctx, g.skin, 1.2);
  ctx.translate(0.4, 13);
  ctx.rotate(-swing * 0.7 - 0.1);
  bag(ctx, g.bag);
  ctx.restore();

  // ---- head -------------------------------------------------------------------------------------------------------------------
  ctx.save();
  ctx.translate(0, -50);
  ctx.rotate(swing * 0.025);
  headBlock(ctx, g, sway, blinkNow(g, t));
  ctx.restore();

  // a little sparkle that twinkles beside her now and then
  const tw = Math.sin(t * 3 + phase);
  if (tw > 0.55) sparkle(ctx, 18, -58, 3 * tw, "#fff7c0");
  ctx.restore();
}

// ---- A cyclist: seated on the bike, leaning forward, pedalling ---------------------------------------------------
// Origin is the bike's ground point under the crank, facing +x (like drawBicycle).
// o: { t, pedal }  (pedal = crank angle in radians)
export function drawChibiRider(ctx, g, o = {}) {
  const t = o.t || 0, pedal = o.pedal || 0;
  ctx.save();
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.strokeStyle = INK;

  const hip = { x: -4, y: -27 };
  const crank = { x: 1, y: -11 };
  const kneeFor = (fx, fy, L = 11) => {                                // two-bone leg, knee bends forward
    const dx = fx - hip.x, dy = fy - hip.y;
    const d = Math.min(Math.hypot(dx, dy), 2 * L - 0.01);
    const a = Math.acos(d / (2 * L));
    const base = Math.atan2(dy, dx);
    return { x: hip.x + Math.cos(base - a) * L, y: hip.y + Math.sin(base - a) * L };
  };
  const leg = (ph) => {
    const foot = { x: crank.x + Math.cos(ph) * 5.4, y: crank.y + Math.sin(ph) * 5.4 };
    const knee = kneeFor(foot.x, foot.y);
    ctx.lineWidth = 7.4;                                              // sock with an ink edge...
    ctx.strokeStyle = INK;
    ctx.beginPath();
    ctx.moveTo(hip.x, hip.y); ctx.lineTo(knee.x, knee.y); ctx.lineTo(foot.x, foot.y - 2);
    ctx.stroke();
    ctx.lineWidth = 4.4;
    ctx.strokeStyle = g.sock;
    ctx.stroke();
    rr(ctx, foot.x - 4.2, foot.y - 3.4, 9, 7.2, 2.6);                  // chunky boot on the pedal
    inked(ctx, g.boots, 1.4);
    ctx.fillStyle = "rgba(255,255,255,0.65)";
    ctx.fillRect(foot.x - 2.4, foot.y - 2.2, 1.6, 2.8);
    ctx.strokeStyle = INK;
  };
  leg(pedal + Math.PI);                                               // far leg first, then the near one
  leg(pedal);

  ctx.beginPath();                                                    // short flared skirt over the saddle
  ctx.moveTo(-12, -31);
  ctx.lineTo(4, -31);
  ctx.lineTo(9.5, -20);
  ctx.quadraticCurveTo(-4, -16.5, -17, -20);
  ctx.closePath();
  inked(ctx, g.skirt, 1.5);

  ctx.save();                                                         // torso leaning into the ride
  ctx.translate(hip.x, hip.y - 2);
  ctx.rotate(0.22);
  rr(ctx, -9, -17, 18, 18, 6);
  inked(ctx, g.top, 1.5);
  rr(ctx, -9.8, -17.6, 19.6, 4.6, 2.3);
  inked(ctx, g.trim, 1.2);
  rr(ctx, -10, -2.6, 20, 4, 2);
  inked(ctx, g.trim, 1.2);
  if (g.studs) {
    ctx.fillStyle = "#e6ecf4";
    for (const sx of [-6, -2, 2, 6]) { ctx.beginPath(); ctx.arc(sx, -15.4, 0.9, 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.restore();

  ctx.lineWidth = 6.6;                                                // arm reaching the handlebar
  ctx.strokeStyle = INK;
  ctx.beginPath();
  ctx.moveTo(2, -41); ctx.lineTo(12.6, -34.4);
  ctx.stroke();
  ctx.lineWidth = 3.8;
  ctx.strokeStyle = g.top;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(13.4, -34, 2.8, 0, Math.PI * 2);
  inked(ctx, g.skin, 1.2);

  ctx.save();                                                         // head, with hair streaming back
  ctx.translate(3.6, -57);
  ctx.rotate(0.14);
  headBlock(ctx, g, -2.6, blinkNow(g, t));
  ctx.restore();
  ctx.restore();
}
