"""Flask entry point: serves the page and the game data.

Run:   python app.py        then open http://127.0.0.1:5000
"""

from pathlib import Path

from flask import Flask, abort, jsonify, render_template

from game import CONFIG, LEVELS, STORY, get_level

app = Flask(__name__)

# Folders for the hand-drawn character sprites, one per character
# (see the README.txt inside each: static/images/hachi, static/images/nana).
SPRITE_ROOT = Path(app.static_folder) / "images"
SPRITE_SETS = ("hachi", "nana")
SPRITE_TYPES = {".png", ".webp", ".gif"}


@app.route("/")
def index():
    return render_template("index.html", title=CONFIG["title"])


@app.route("/api/config")
def api_config():
    """Physics, screen size and key bindings (see game/config.py)."""
    return jsonify(CONFIG)


@app.route("/api/sprites")
def api_sprites():
    """Image files found for each character, e.g. {"hachi": ["idle.png", ...], "nana": []}."""
    found = {}
    for who in SPRITE_SETS:
        folder = SPRITE_ROOT / who
        found[who] = sorted(
            p.name for p in folder.iterdir()
            if p.is_file() and p.suffix.lower() in SPRITE_TYPES
        ) if folder.is_dir() else []
    return jsonify(found)


@app.route("/api/levels")
def api_levels():
    return jsonify(LEVELS)


@app.route("/api/story")
def api_story():
    """The visual-novel scenes shown between levels (see game/story.py)."""
    return jsonify(STORY)


@app.route("/api/levels/<int:number>")
def api_level(number: int):
    level = get_level(number)
    if level is None:
        abort(404)
    return jsonify(level)


if __name__ == "__main__":
    # debug=True is for local development only - never deploy with it on.
    app.run(host="127.0.0.1", port=5000, debug=True)
