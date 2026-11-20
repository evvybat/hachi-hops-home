// Keyboard input: tracks held keys and reports single presses.
import { data } from "./state.js";

const keysDown = new Set();
const PREVENT_DEFAULT = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"];

// Does this key code belong to the action? (e.g. "jump" -> ArrowUp / KeyW)
export function isKey(action, code) {
  return data.config.keys[action].includes(code);
}

// Is any key for this action currently held down?
export function held(action) {
  return data.config.keys[action].some((c) => keysDown.has(c));
}

// onPress(code) is called once per physical key press (not on auto-repeat).
export function setupInput(onPress) {
  window.addEventListener("keydown", (e) => {
    keysDown.add(e.code);
    if (PREVENT_DEFAULT.includes(e.code)) e.preventDefault(); // no page scroll
    if (!e.repeat) onPress(e.code);
  });
  window.addEventListener("keyup", (e) => keysDown.delete(e.code));
}
