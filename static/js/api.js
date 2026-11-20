// Talks to the Flask backend.
import { data } from "./state.js";

export async function loadData() {
  const [config, levels, story] = await Promise.all([
    fetch("/api/config").then((r) => r.json()),
    fetch("/api/levels").then((r) => r.json()),
    // The story is optional: if it can't load, the game just skips the scenes.
    fetch("/api/story").then((r) => r.json()).catch(() => ({ scenes: {}, cheers: {} })),
  ]);
  data.config = config;
  data.levels = levels;
  data.story = story;
}
