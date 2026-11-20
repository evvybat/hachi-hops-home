// Cute sound effects and background music, all made live in the browser with
// the Web Audio API (no audio files to download or license).
//
//   sfx("pickup")          play a sound effect          (see SFX below)
//   sfxAt("potBoil", x)    same, but quieter the further x is from Hachi
//   syncAudio(game)        called every frame: picks the music for the current
//                          screen and plays jingles when the screen changes
//   toggleMute() / isMuted()    the M key
//
// Browsers only allow sound after the player does something (a key press or
// click), so everything waits for the first interaction. Music is a tiny
// step-sequencer: each tune is a few strings of notes (see TRACKS), played by
// bell / chip / pluck "instruments" with a bass line, arpeggios and drums.
import { game } from "./state.js";

const AC = window.AudioContext || window.webkitAudioContext;
const MUTE_KEY = "room707-muted";

let E = null;             // the live engine (created on first interaction)
let muted = false;
try { muted = localStorage.getItem(MUTE_KEY) === "1"; } catch (err) { /* storage blocked: stay unmuted */ }

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

// ---- Building blocks -------------------------------------------------------------------------

// The background music sits well under the sound effects so the effects stand out.
const MUSIC_VOL = 0.13;

// Makes an audio "engine" around any AudioContext (a real one, or an
// OfflineAudioContext for testing).
export function makeEngine(c) {
  const comp = c.createDynamicsCompressor();             // keeps loud moments from clipping
  comp.threshold.value = -14;
  comp.ratio.value = 5;
  const master = c.createGain();
  master.gain.value = 0.85;
  const music = c.createGain();
  music.gain.value = MUSIC_VOL;
  const sfxBus = c.createGain();
  sfxBus.gain.value = 0.95;
  music.connect(master);
  sfxBus.connect(master);
  master.connect(comp);
  comp.connect(c.destination);

  const noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);   // 1 second of white noise
  const data = noiseBuf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

  return { c, master, music, sfxBus, noiseBuf, notes: 0 };
}

// One oscillator note with a quick attack and exponential decay.
function tone(e, o) {
  const c = e.c, dur = o.dur, t = o.t;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = o.type || "sine";
  osc.frequency.setValueAtTime(o.freq, t);
  if (o.glide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, o.glide), t + dur);
  if (o.vib) {                                            // vibrato
    const lfo = c.createOscillator();
    const lg = c.createGain();
    lfo.frequency.value = o.vib[0];
    lg.gain.value = o.vib[1];
    lfo.connect(lg);
    lg.connect(osc.frequency);
    lfo.start(t);
    lfo.stop(t + dur + 0.05);
  }
  const vol = Math.max(0.0002, o.vol);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + (o.attack ?? 0.006));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  if (o.lp) {
    const f = c.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = o.lp;
    osc.connect(f);
    f.connect(g);
  } else {
    osc.connect(g);
  }
  g.connect(o.bus);
  osc.start(t);
  osc.stop(t + dur + 0.06);
  e.notes++;
}

// A burst of filtered noise (whooshes, ticks, drums, fizz).
function noise(e, o) {
  const c = e.c;
  const src = c.createBufferSource();
  src.buffer = e.noiseBuf;
  const f = c.createBiquadFilter();
  f.type = o.type || "highpass";
  f.frequency.setValueAtTime(o.freq || 4000, o.t);
  if (o.sweep) f.frequency.exponentialRampToValueAtTime(Math.max(40, o.sweep), o.t + o.dur);
  f.Q.value = o.q || 0.8;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, o.t);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, o.vol), o.t + (o.attack ?? 0.004));
  g.gain.exponentialRampToValueAtTime(0.0001, o.t + o.dur);
  src.connect(f);
  f.connect(g);
  g.connect(o.bus);
  src.start(o.t, Math.random() * 0.6);
  src.stop(o.t + o.dur + 0.05);
  e.notes++;
}

// A bell / music-box note: a fundamental plus a couple of shimmering partials.
function bell(e, bus, freq, t, dur, vol) {
  tone(e, { bus, type: "sine", freq, t, dur, vol });
  tone(e, { bus, type: "sine", freq: freq * 2.01, t, dur: dur * 0.55, vol: vol * 0.32 });
  tone(e, { bus, type: "sine", freq: freq * 3.97, t, dur: dur * 0.3, vol: vol * 0.1 });
}

// ---- Sound effects -------------------------------------------------------------------------------
// Each effect is (engine, time, o) where o = { v: volume multiplier, p: pitch multiplier }.

const SFX = {
  jump(e, t, o) {                                         // a cheerful "boing-up"
    tone(e, { bus: e.sfxBus, type: "square", freq: 340 * o.p, glide: 720 * o.p, t, dur: 0.13, vol: 0.1 * o.v, lp: 3200 });
    tone(e, { bus: e.sfxBus, type: "sine", freq: 680 * o.p, glide: 1400 * o.p, t: t + 0.02, dur: 0.1, vol: 0.09 * o.v });
  },
  land(e, t, o) {                                         // a soft little thump
    noise(e, { bus: e.sfxBus, type: "lowpass", freq: 500, t, dur: 0.07, vol: 0.12 * o.v });
    tone(e, { bus: e.sfxBus, type: "sine", freq: 150, glide: 70, t, dur: 0.09, vol: 0.14 * o.v });
  },
  step(e, t, o) {                                         // tiny footstep tick
    noise(e, { bus: e.sfxBus, type: "bandpass", freq: 1800 * o.p, q: 1.0, t, dur: 0.045, vol: 0.5 * o.v });
  },
  pickup(e, t, o) {                                       // sparkly rising arpeggio (higher with a combo)
    const base = 79 + o.combo;                            // G5 and up
    [0, 4, 7, 12].forEach((s, i) => {
      bell(e, e.sfxBus, hz(base + s), t + i * 0.045, 0.32, 0.11 * o.v);
    });
    tone(e, { bus: e.sfxBus, type: "triangle", freq: hz(base + 19), t: t + 0.16, dur: 0.22, vol: 0.05 * o.v });
  },
  key(e, t, o) {                                          // a magical key jingle
    [72, 76, 79, 84, 88, 91].forEach((m, i) => bell(e, e.sfxBus, hz(m), t + i * 0.07, 0.5, 0.11 * o.v));
  },
  unlock(e, t, o) {                                       // click, then a happy twinkle
    noise(e, { bus: e.sfxBus, type: "bandpass", freq: 2600, q: 3, t, dur: 0.04, vol: 0.1 * o.v });
    [84, 88, 91, 96].forEach((m, i) => bell(e, e.sfxBus, hz(m), t + 0.06 + i * 0.06, 0.45, 0.1 * o.v));
  },
  hurt(e, t, o) {                                         // "ouch!": two wobbling falling squeaks
    tone(e, { bus: e.sfxBus, type: "square", freq: 620, glide: 360, t, dur: 0.17, vol: 0.1 * o.v, lp: 2600, vib: [18, 14] });
    tone(e, { bus: e.sfxBus, type: "square", freq: 470, glide: 200, t: t + 0.16, dur: 0.24, vol: 0.1 * o.v, lp: 2200, vib: [16, 12] });
    tone(e, { bus: e.sfxBus, type: "triangle", freq: 220, glide: 110, t, dur: 0.38, vol: 0.12 * o.v });
  },
  fall(e, t, o) {                                         // slide-whistle drop
    tone(e, { bus: e.sfxBus, type: "sine", freq: 1100, glide: 160, t, dur: 0.55, vol: 0.13 * o.v, vib: [9, 22] });
  },
  bounce(e, t, o) {                                       // spring "boooing"
    tone(e, { bus: e.sfxBus, type: "sine", freq: 220, glide: 760, t, dur: 0.14, vol: 0.16 * o.v, vib: [28, 22] });
    tone(e, { bus: e.sfxBus, type: "triangle", freq: 760, glide: 330, t: t + 0.12, dur: 0.22, vol: 0.12 * o.v, vib: [24, 18] });
  },
  wobble(e, t, o) {                                       // a table rattling
    for (let i = 0; i < 5; i++) noise(e, { bus: e.sfxBus, type: "bandpass", freq: 900 + (i % 2) * 500, q: 5, t: t + i * 0.07, dur: 0.05, vol: 0.09 * o.v });
  },
  tableFall(e, t, o) {                                    // crash + tinkling pieces
    noise(e, { bus: e.sfxBus, type: "lowpass", freq: 1800, sweep: 300, t, dur: 0.25, vol: 0.16 * o.v });
    [88, 83, 79, 76].forEach((m, i) => bell(e, e.sfxBus, hz(m), t + 0.04 + i * 0.05, 0.3, 0.06 * o.v));
  },
  tableBack(e, t, o) {                                    // pop! it's back
    tone(e, { bus: e.sfxBus, type: "sine", freq: 500, glide: 900, t, dur: 0.1, vol: 0.12 * o.v });
  },
  potBubble(e, t, o) {                                    // bubbling
    for (let i = 0; i < 6; i++) tone(e, { bus: e.sfxBus, type: "sine", freq: 280 + Math.random() * 360, glide: 600 + Math.random() * 400, t: t + i * 0.085, dur: 0.07, vol: 0.09 * o.v });
  },
  potBoil(e, t, o) {                                      // whoosh of foam + pops
    noise(e, { bus: e.sfxBus, type: "bandpass", freq: 500, sweep: 2600, q: 1.2, t, dur: 0.5, vol: 0.12 * o.v, attack: 0.05 });
    for (let i = 0; i < 7; i++) tone(e, { bus: e.sfxBus, type: "sine", freq: 400 + Math.random() * 500, glide: 900, t: t + 0.06 + i * 0.07, dur: 0.06, vol: 0.09 * o.v });
    tone(e, { bus: e.sfxBus, type: "triangle", freq: 120, glide: 260, t, dur: 0.4, vol: 0.1 * o.v });
  },
  whistle(e, t, o) {                                      // something is falling
    tone(e, { bus: e.sfxBus, type: "sine", freq: 1500, glide: 700, t, dur: 0.34, vol: 0.07 * o.v });
  },
  clink(e, t, o) {                                        // teacup / pot landing
    bell(e, e.sfxBus, hz(96), t, 0.35, 0.1 * o.v);
    bell(e, e.sfxBus, hz(103), t + 0.03, 0.28, 0.07 * o.v);
    noise(e, { bus: e.sfxBus, type: "highpass", freq: 3500, t, dur: 0.05, vol: 0.06 * o.v });
  },
  thud(e, t, o) {                                         // crate landing
    noise(e, { bus: e.sfxBus, type: "lowpass", freq: 700, t, dur: 0.12, vol: 0.18 * o.v });
    tone(e, { bus: e.sfxBus, type: "sine", freq: 110, glide: 55, t, dur: 0.16, vol: 0.18 * o.v });
  },
  carRev(e, t, o) {                                       // a cute engine rumble
    tone(e, { bus: e.sfxBus, type: "sawtooth", freq: 70, glide: 130, t, dur: 0.55, vol: 0.07 * o.v, lp: 500, vib: [14, 9] });
  },
  carHonk(e, t, o) {                                      // beep beep!
    for (let i = 0; i < 2; i++) {
      tone(e, { bus: e.sfxBus, type: "square", freq: 420, t: t + i * 0.2, dur: 0.14, vol: 0.09 * o.v, lp: 1800 });
      tone(e, { bus: e.sfxBus, type: "square", freq: 530, t: t + i * 0.2, dur: 0.14, vol: 0.07 * o.v, lp: 1800 });
    }
  },
  squeak(e, t, o) {                                       // squeaky toy
    tone(e, { bus: e.sfxBus, type: "square", freq: 900, glide: 1500, t, dur: 0.08, vol: 0.08 * o.v, lp: 3000 });
    tone(e, { bus: e.sfxBus, type: "square", freq: 1400, glide: 760, t: t + 0.08, dur: 0.11, vol: 0.08 * o.v, lp: 3000 });
  },
  coo(e, t, o) {                                          // pigeon: coo-coo
    for (let i = 0; i < 2; i++) tone(e, { bus: e.sfxBus, type: "sine", freq: 400, glide: 300, t: t + i * 0.17, dur: 0.14, vol: 0.09 * o.v, vib: [20, 18] });
  },
  bikeBell(e, t, o) {                                     // ring ring! (a bicycle bell)
    for (let i = 0; i < 2; i++) {
      tone(e, { bus: e.sfxBus, type: "sine", freq: 2300, t: t + i * 0.11, dur: 0.35, vol: 0.07 * o.v });
      tone(e, { bus: e.sfxBus, type: "sine", freq: 3100, t: t + i * 0.11, dur: 0.25, vol: 0.04 * o.v });
    }
  },
  giggle(e, t, o) {                                       // a little crowd giggle
    [84, 88, 86, 91].forEach((m, i) => tone(e, { bus: e.sfxBus, type: "triangle", freq: hz(m), t: t + i * 0.07, dur: 0.08, vol: 0.05 * o.v }));
  },
  tick(e, t, o) {                                         // clock tick-tock for the countdown
    tone(e, { bus: e.sfxBus, type: "sine", freq: 1300 * o.p, t, dur: 0.05, vol: 0.12 * o.v });
  },
  doorbell(e, t, o) {                                     // ding-dong!
    bell(e, e.sfxBus, hz(79), t, 0.9, 0.2 * o.v);
    bell(e, e.sfxBus, hz(72), t + 0.38, 1.1, 0.2 * o.v);
  },
  start(e, t, o) {                                        // a cheery "let's go!"
    [72, 76, 79, 84].forEach((m, i) => bell(e, e.sfxBus, hz(m), t + i * 0.07, 0.4, 0.12 * o.v));
  },
  blip(e, t, o) {                                         // menu / pause blip
    tone(e, { bus: e.sfxBus, type: "square", freq: 880 * o.p, t, dur: 0.07, vol: 0.07 * o.v, lp: 2600 });
    tone(e, { bus: e.sfxBus, type: "square", freq: 1320 * o.p, t: t + 0.06, dur: 0.07, vol: 0.06 * o.v, lp: 2600 });
  },
  respawn(e, t, o) {                                      // whoosh back to safety
    noise(e, { bus: e.sfxBus, type: "bandpass", freq: 400, sweep: 3000, q: 1, t, dur: 0.28, vol: 0.08 * o.v, attack: 0.03 });
  },
  levelComplete(e, t, o) {                                // a little victory fanfare
    const seq = [[72, 0], [72, 0.13], [72, 0.26], [76, 0.4], [79, 0.62], [84, 0.84]];
    seq.forEach(([m, dt], i) => {
      tone(e, { bus: e.sfxBus, type: "square", freq: hz(m), t: t + dt, dur: i === 5 ? 0.9 : 0.16, vol: 0.09 * o.v, lp: 3400 });
      bell(e, e.sfxBus, hz(m + 12), t + dt, i === 5 ? 1.1 : 0.3, 0.08 * o.v);
    });
    for (let i = 0; i < 8; i++) bell(e, e.sfxBus, hz(96 + (i % 4) * 3), t + 0.9 + i * 0.06, 0.3, 0.05 * o.v);
  },
  gameOver(e, t, o) {                                     // sad wah-wah-wah-waaah
    [67, 66, 65, 64].forEach((m, i) => tone(e, { bus: e.sfxBus, type: "triangle", freq: hz(m), t: t + i * 0.32, dur: i === 3 ? 1.1 : 0.3, vol: 0.14 * o.v, vib: [6, 9], lp: 1800 }));
  },
  victory(e, t, o) {                                      // big celebration sparkle
    [72, 76, 79, 84, 88, 91, 96].forEach((m, i) => bell(e, e.sfxBus, hz(m), t + i * 0.08, 0.7, 0.12 * o.v));
    for (let i = 0; i < 12; i++) noise(e, { bus: e.sfxBus, type: "bandpass", freq: 1500 + Math.random() * 3000, q: 2, t: t + 0.5 + i * 0.09, dur: 0.05, vol: 0.06 * o.v });
  },
};

// ---- Music ------------------------------------------------------------------------------------------
// Notes in the lead strings: a character is a scale degree (0-9, then a=10 ... f=15),
// '.' is a rest, '-' holds the previous note. Each string is one bar of 16 sixteenth-notes.
// Each tune plays its A section (4 bars) then its B section (4 bars), then repeats.

const MAJ = [0, 2, 4, 5, 7, 9, 11];
const MIN = [0, 2, 3, 5, 7, 8, 10];                       // natural minor: the moody rock sound

// A quiet, moody rock sound (think a band practising in a small flat): soft guitar,
// picked bass, light drums, mostly in a minor key.
const MELODY_A = {        // chords Am F C G
  A: ["7---9---7---4---", "5---7---9---7---", "6---4---2---4---", "6---8---a---8---"],
  B: ["9.9.7.9.b.9.7.4.", "9.9.7.5.7.9.7.5.", "9.b.9.7.6.4.6.4.", "8.a.8.6.8.a.8.6."],
};
const MELODY_B = {        // chords Am G F G
  A: ["7.4.7.9.7.4.2.4.", "8.6.8.a.8.6.4.6.", "7.5.7.9.7.5.3.5.", "8.6.8.a.8.a.8.6."],
  B: ["b.9.b.d.b.9.7.9.", "a.8.a.c.a.8.6.8.", "9.7.9.b.9.7.5.7.", "a.8.a.c.e.c.a.8."],
};
const ROCK = { k: "k.....k.k...k...", s: "....s.......s...", h: "h.h.h.h.h.h.h.h.", kv: 0.2, sv: 0.08, hv: 0.02 };

const TRACKS = {
  // Title screen: slow, sleepy bell melody in a minor key.
  menu: {
    bpm: 84, root: 57, scale: MIN, prog: [0, 5, 2, 6], lead: "music", leadVol: 0.4,
    A: ["7---------9---7-", "5---------7---9-", "6---------4---2-", "6-------8-------"],
    B: ["9---b---9---7---", "9---7---5---7---", "6---9---b---9---", "8---a---8---6---"],
    arp: "0.1.2.3.2.1.2.1.", arpVol: 0.1, arpInst: "bell", bass: "0.......0.......", bassVol: 0.14, bassInst: "pick",
  },
  // Level 1: easy-going indie rock.
  L1: {
    bpm: 100, root: 57, scale: MIN, prog: [0, 5, 2, 6], lead: "guitar", leadVol: 0.2,
    ...MELODY_A,
    arp: "0.1.2.1.0.1.2.1.", arpVol: 0.06, arpInst: "bell", bass: "0.0.0.0.0.0.0.0.", bassVol: 0.16, bassInst: "pick",
    drums: { ...ROCK, k: "k.......k.......", h: "..h...h...h...h.", kv: 0.16 },
  },
  // Level 2: a little faster, city rock.
  L2: {
    bpm: 116, root: 62, scale: MIN, prog: [0, 6, 5, 6], lead: "guitar", leadVol: 0.2,
    ...MELODY_B,
    arp: "0.2.1.2.0.2.1.2.", arpVol: 0.06, arpInst: "bell", bass: "0.0.0.0.0.0.0.0.", bassVol: 0.17, bassInst: "pick",
    drums: ROCK,
  },
  // Level 3: bright and punchy, the Harajuku shopping run.
  L3: {
    bpm: 126, root: 64, scale: MIN, prog: [0, 5, 2, 6], lead: "guitar", leadVol: 0.2,
    A: MELODY_A.B, B: MELODY_A.A,
    arp: "0.1.2.3.0.1.2.3.", arpVol: 0.05, arpInst: "bell", bass: "0.0.0.0.0.0.0.0.", bassVol: 0.17, bassInst: "pick",
    drums: { ...ROCK, k: "k..k..k.k..k..k." },
  },
  // Level 4: the party rock, which speeds up when the doorbell is near.
  L4: {
    bpm: 130, root: 59, scale: MIN, prog: [0, 6, 5, 6], lead: "guitar", leadVol: 0.2,
    A: MELODY_B.B, B: MELODY_B.A,
    arp: "0.1.2.1.0.1.2.1.", arpVol: 0.06, arpInst: "bell", bass: "0.0.0.0.0.0.0.0.", bassVol: 0.17, bassInst: "pick",
    drums: ROCK,
  },
  // The ending: the same band, but major and happy.
  victory: {
    bpm: 112, root: 60, scale: MAJ, prog: [0, 3, 4, 0], lead: "guitar", leadVol: 0.2,
    A: ["7.b.9.7.b.d.b.9.", "a.c.a.7.a.c.a.7.", "8.b.d.b.8.b.d.f.", "7---9---b---c---"],
    B: ["b.9.b.d.f.d.b.9.", "c.a.c.e.c.a.7.a.", "8.b.d.f.d.b.8.6.", "7.9.b.c.e.c.b.9."],
    arp: "0.1.2.3.2.1.2.3.", arpVol: 0.06, arpInst: "bell", bass: "0.0.0.0.0.0.0.0.", bassVol: 0.16, bassInst: "pick",
    drums: ROCK,
  },
};

// Every bar is 16 sixteenth-notes; pad shorter strings with rests so the data is tidy.
for (const tr of Object.values(TRACKS)) {
  tr.A = tr.A.map((b) => b.padEnd(16, "."));
  tr.B = tr.B.map((b) => b.padEnd(16, "."));
}

const degMidi = (tr, d) => {
  const n = tr.scale.length;
  return tr.root + tr.scale[((d % n) + n) % n] + 12 * Math.floor(d / n);
};
const charDeg = (ch) => (ch >= "0" && ch <= "9" ? ch.charCodeAt(0) - 48 : ch >= "a" && ch <= "f" ? ch.charCodeAt(0) - 87 : -1);

function leadNote(e, inst, freq, t, dur, vol) {
  if (inst === "music") bell(e, e.music, freq, t, Math.max(dur, 0.7), vol);
  else if (inst === "guitar") {                          // a soft, slightly crunchy guitar pluck
    tone(e, { bus: e.music, type: "sawtooth", freq, t, dur: Math.min(dur + 0.08, 0.55), vol: vol * 0.5, lp: 1500, attack: 0.008 });
    tone(e, { bus: e.music, type: "triangle", freq, t, dur: Math.min(dur + 0.08, 0.55), vol: vol * 0.7 });
  }
  else if (inst === "chip") {
    tone(e, { bus: e.music, type: "square", freq, t, dur: Math.min(dur + 0.04, 0.45), vol: vol * 0.55, lp: 3600, vib: [5.5, 4] });
  } else {                                               // pluck
    tone(e, { bus: e.music, type: "triangle", freq, t, dur: Math.min(dur + 0.1, 0.5), vol });
    tone(e, { bus: e.music, type: "sawtooth", freq, t, dur: 0.16, vol: vol * 0.3, lp: 2400 });
  }
}

// Schedules everything that starts on one sixteenth-note step of a tune.
export function scheduleStep(e, tr, step, t, stepDur) {
  const bar = Math.floor(step / 16), s = step % 16;
  const inCycle = bar % 8;
  const chord = tr.prog[inCycle % 4];
  const leadStr = (inCycle < 4 ? tr.A : tr.B)[inCycle % 4];

  const ch = leadStr[s];
  const d = charDeg(ch);
  if (d >= 0) {
    let len = 1;
    while (s + len < 16 && leadStr[s + len] === "-") len++;
    leadNote(e, tr.lead, hz(degMidi(tr, d)), t, len * stepDur, tr.leadVol);
  }
  if (tr.arp && tr.arp[s] !== ".") {                      // chord arpeggio
    const tones = [chord, chord + 2, chord + 4, chord + 7];
    const idx = tr.arp.charCodeAt(s) - 48;
    const m = degMidi(tr, tones[idx % 4]) + 12;
    if (tr.arpInst === "bell") bell(e, e.music, hz(m), t, 0.5, tr.arpVol);
    else if (tr.arpInst === "chip") tone(e, { bus: e.music, type: "square", freq: hz(m), t, dur: 0.1, vol: tr.arpVol * 0.5, lp: 3000 });
    else tone(e, { bus: e.music, type: "triangle", freq: hz(m), t, dur: 0.14, vol: tr.arpVol });
  }
  if (tr.bass && tr.bass[s] !== ".") {                    // bass line: root, fifth or octave of the chord
    const kind = tr.bass[s];
    const deg = kind === "5" ? chord + 4 : chord;
    const m = degMidi(tr, deg) - 24 + (kind === "8" ? 12 : 0);
    if (tr.bassInst === "pick") {                         // picked rock bass: short and a little buzzy
      tone(e, { bus: e.music, type: "sawtooth", freq: hz(m), t, dur: stepDur * 1.5, vol: tr.bassVol * 0.8, lp: 420 });
    } else {
      tone(e, { bus: e.music, type: "triangle", freq: hz(m), t, dur: stepDur * 1.8, vol: tr.bassVol, lp: 700 });
    }
  }
  const dr = tr.drums;
  if (dr) {
    if (dr.k && dr.k[s] === "k") {
      tone(e, { bus: e.music, type: "sine", freq: 150, glide: 45, t, dur: 0.14, vol: dr.kv });
    }
    if (dr.s && dr.s[s] === "s") {
      noise(e, { bus: e.music, type: "highpass", freq: 1800, t, dur: 0.11, vol: dr.sv });
      tone(e, { bus: e.music, type: "triangle", freq: 200, glide: 140, t, dur: 0.08, vol: dr.sv });
    }
    if (dr.h && dr.h[s] === "h") noise(e, { bus: e.music, type: "highpass", freq: 7500, t, dur: 0.035, vol: dr.hv });
  }
}

// ---- The live music player --------------------------------------------------------------------------

const player = { name: null, step: 0, next: 0, timer: null, tempo: 1, level: 1 };

function tick() {
  if (!E || E.c.state !== "running" || !player.name) return;
  const tr = TRACKS[player.name];
  const stepDur = 60 / (tr.bpm * player.tempo) / 4;
  while (player.next < E.c.currentTime + 0.22) {
    scheduleStep(E, tr, player.step, player.next, stepDur);
    player.next += stepDur;
    player.step++;
  }
}

function startMusic(name) {
  player.name = name;
  player.step = 0;
  player.tempo = 1;
  if (E) player.next = E.c.currentTime + 0.08;
  if (!player.timer) player.timer = setInterval(tick, 40);
}

function stopMusic() {
  player.name = null;
}

function setMusicLevel(x) {                               // smooth fade (e.g. quieter while paused)
  if (E && Math.abs(player.level - x) > 0.01) {
    E.music.gain.setTargetAtTime(MUSIC_VOL * x, E.c.currentTime, 0.12);
    player.level = x;
  }
}

// ---- Public: sound effects ------------------------------------------------------------------------------

export function sfx(name, opts = {}) {
  if (!E || muted || !SFX[name]) return;
  if (E.c.state !== "running") return;
  const o = { v: opts.vol ?? 1, p: opts.pitch ?? 1, combo: opts.combo ?? 0 };
  SFX[name](E, E.c.currentTime + 0.005, o);
}

// A sound that happens somewhere in the world: quieter the further it is from Hachi.
export function sfxAt(name, worldX, opts = {}) {
  const p = game.player;
  if (!p) return;
  const dx = Math.abs(worldX - (p.x + p.w / 2));
  const vol = Math.pow(clamp(1 - dx / 720, 0, 1), 1.3);
  if (vol < 0.06) return;
  sfx(name, { ...opts, vol: (opts.vol ?? 1) * vol });
}

// ---- Public: setup, mute, per-frame sync ---------------------------------------------------------------------

// Build the (silent, suspended) sound engine while the page loads. Making it is
// the slow part, so doing it up front means the first key press doesn't freeze
// the game for a moment. It only starts making sound after a key press.
export function prepareAudio() {
  if (!AC || E) return;
  try { E = makeEngine(new AC()); } catch (err) { /* no audio available */ }
}

export function unlock() {
  if (!AC) return;
  if (!E) E = makeEngine(new AC());
  if (E.c.state === "suspended") E.c.resume();
  if (E.master) E.master.gain.value = muted ? 0 : 0.85;
}

export function isMuted() { return muted; }

export function toggleMute() {
  muted = !muted;
  try { localStorage.setItem(MUTE_KEY, muted ? "1" : "0"); } catch (err) { /* ignore */ }
  if (E) E.master.gain.setTargetAtTime(muted ? 0 : 0.85, E.c.currentTime, 0.04);
  else unlock();
  if (!muted) sfx("blip");
  return muted;
}

export function soundReady() { return !!E && E.c.state === "running"; }
export function audioStats() { return { notes: E ? E.notes : 0, state: E ? E.c.state : "none", music: player.name, muted }; }

if (typeof window !== "undefined") {                      // the first key press or click turns the sound on
  for (const ev of ["keydown", "pointerdown"]) window.addEventListener(ev, unlock);
  document.addEventListener("visibilitychange", () => {
    if (!E) return;
    if (document.hidden) E.c.suspend();
    else E.c.resume();
  });
}

const THEME = { 1: "L1", 2: "L2", 3: "L3", 4: "L4" };
let prevState = null;
let lastTickSecond = -1;

// Called once per frame by the game loop: chooses the music for this screen and
// plays a jingle whenever the screen changes (win, lose, pause...).
export function syncAudio() {
  if (!E || E.c.state !== "running") return;
  const s = game.state;

  if (s !== prevState) {
    const was = prevState;
    if (was === "MENU" && s === "PLAYING") sfx("start");
    else if (s === "LEVEL_COMPLETE") sfx("levelComplete");
    else if (s === "GAME_OVER") {
      if (game.level && game.level.timeLimit && game.levelTimer <= 0) sfx("doorbell");   // the guests arrived!
      sfx("gameOver", { vol: 1 });
    } else if (s === "VICTORY") sfx("victory");
    else if (s === "PAUSED") sfx("blip", { pitch: 0.8 });
    else if (s === "PLAYING" && was === "PAUSED") sfx("blip", { pitch: 1.2 });
    else if (s === "STORY") sfx("blip", { pitch: 1.1 });
    else if (s === "PLAYING" && (was === "LEVEL_COMPLETE" || was === "STORY" || was === "GAME_OVER")) sfx("start");
    else if (s === "MENU" && was) sfx("blip");
    prevState = s;
  }

  let want = null;
  if (s === "MENU") want = "menu";
  else if (s === "VICTORY") want = "victory";
  else if (s === "STORY") want = game.story && game.story.key === "intro" ? "menu" : THEME[game.story ? game.story.scene.backdrop : game.currentLevel] || "L1";
  else if (s === "PLAYING" || s === "PAUSED") want = THEME[game.currentLevel] || "L1";
  if (want !== player.name) {
    if (want) startMusic(want);
    else stopMusic();
  }
  setMusicLevel(s === "PAUSED" ? 0.25 : 1);

  // The doorbell countdown: the party music speeds up and the clock ticks.
  if (s === "PLAYING" && game.level && game.level.timeLimit) {
    const left = game.levelTimer;
    player.tempo = left <= 20 ? 1.18 : 1;
    const sec = Math.ceil(left);
    if (left <= 10 && sec !== lastTickSecond && sec > 0) {
      sfx("tick", { pitch: sec % 2 ? 1 : 0.85 });
      lastTickSecond = sec;
    }
  } else {
    player.tempo = 1;
    lastTickSecond = -1;
  }
}

// For testing: names of every sound effect and music track.
export const SFX_NAMES = Object.keys(SFX);
export const TRACK_NAMES = Object.keys(TRACKS);
export const TRACK_DATA = TRACKS;
export function playSfxOn(engine, name, t = 0.01, o = {}) {
  SFX[name](engine, t, { v: 1, p: 1, combo: 0, ...o });
}
