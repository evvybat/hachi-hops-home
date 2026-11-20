// Shared game state. Every other module imports from here.
// (Names match the "Game state information" list in the design doc.)

// Data loaded from Flask at startup (see api.js).
export const data = {
  config: null,   // from /api/config
  levels: [],     // from /api/levels
  story: { scenes: {}, cheers: {} },   // from /api/story
};

export const game = {
  // MENU STORY PLAYING PAUSED LEVEL_COMPLETE (the goal celebration) GAME_OVER VICTORY
  state: "MENU",
  story: null,          // the scene being read while state is STORY (see story.js)
  celebrate: null,      // the goal celebration while state is LEVEL_COMPLETE
  fadeIn: 0,            // frames left of the pink fade-in after a scene change
  currentLevel: 1,
  score: 0,
  levelStartScore: 0,   // score when this level began (restart goes back to it)
  itemsCollected: 0,
  levelTimer: 0,
  fx: [],               // sparkle / heart particles
  frame: 0,             // frames since the level began (drives moving platforms and timed hazards)
  cameraX: 0,
  cameraY: 0,           // only non-zero on levels taller than the screen
  level: null,    // data for the active level
  player: null,
};
