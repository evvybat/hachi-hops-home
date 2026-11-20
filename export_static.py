"""Builds a plain-files copy of the game in the `docs/` folder for GitHub Pages.

GitHub Pages can only host static files (it can't run Flask), so this script asks
the Flask app for every page and data file once and saves them as files:

    python export_static.py

Then upload the contents of `docs/` (see README.md, "Publish on GitHub Pages").
The game's own source is not changed; the copies in `docs/` just use relative
paths so they also work under https://<name>.github.io/<repo>/.
"""

import json
import shutil
from pathlib import Path

from app import app

ROOT = Path(__file__).parent
OUT = ROOT / "docs"

# Where the game asks Flask for data  ->  the static file that replaces it.
FETCH_SWAPS = {
    '"/api/config"': '"api/config.json"',
    '"/api/levels"': '"api/levels.json"',
    '"/api/story"': '"api/story.json"',
    '"/api/sprites"': '"api/sprites.json"',
    "`/static/images/": "`static/images/",
}


def main() -> None:
    if OUT.exists():
        shutil.rmtree(OUT)
    (OUT / "api").mkdir(parents=True)

    client = app.test_client()

    # The page itself, with relative links to css and js.
    html = client.get("/").get_data(as_text=True).replace('"/static/', '"static/')
    (OUT / "index.html").write_text(html, encoding="utf-8")

    # The JSON data the game loads at start-up.
    for name in ("config", "levels", "story", "sprites"):
        data = client.get(f"/api/{name}").get_json()
        (OUT / "api" / f"{name}.json").write_text(json.dumps(data), encoding="utf-8")

    # css, javascript and the sprite images.
    shutil.copytree(ROOT / "static", OUT / "static")
    for js in (OUT / "static" / "js").glob("*.js"):
        text = js.read_text(encoding="utf-8")
        for old, new in FETCH_SWAPS.items():
            text = text.replace(old, new)
        js.write_text(text, encoding="utf-8")

    (OUT / ".nojekyll").write_text("", encoding="utf-8")    # tell GitHub Pages: no Jekyll

    # Browsers refuse to run the game when index.html is double-clicked (file://), so
    # this launcher starts a tiny local web server and opens the game for you.
    (OUT / "PLAY HERE (Windows).bat").write_text(
        "@echo off\r\n"
        "cd /d \"%~dp0\"\r\n"
        "echo Hachi Hops Home! is starting at http://localhost:8000 ... close this window to stop.\r\n"
        "start \"\" http://localhost:8000\r\n"
        "python -m http.server 8000\r\n",
        encoding="utf-8",
    )
    (OUT / "HOW TO PLAY.txt").write_text(
        "Hachi Hops Home!\r\n\r\n"
        "Online: open the GitHub Pages link (the game runs right in the browser).\r\n\r\n"
        "Offline: do NOT just double-click index.html (browsers show a blank page).\r\n"
        "Windows: double-click 'PLAY HERE (Windows).bat' (needs Python installed).\r\n"
        "Any system: open a terminal in this folder, run  python -m http.server 8000\r\n"
        "and visit http://localhost:8000\r\n",
        encoding="utf-8",
    )
    print(f"Done: {sum(1 for p in OUT.rglob('*') if p.is_file())} files in {OUT}")


if __name__ == "__main__":
    main()
