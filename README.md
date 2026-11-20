# Hachi Hops Home!

A browser-based platform game based on the manga *Nana*. You play Hachi
(Nana Komatsu) on her way to Tokyo across 4 levels. You get 3 hearts per level.

> All four levels are playable, ending in a celebration picture. Falling into
> a gap or touching a hazard costs a heart; 0 hearts = Game Over, and you just retry the level you were on (R or Enter).
> - Level 1: snowy station (icicle spikes, angry pigeons, icy patches).
> - Level 2: Tokyo street and apartment climb (bicycles, bouncy awnings,
>   falling flowerpots and crates). Grab the room key, then reach Room 707.
> - Level 3: Harajuku / Shibuya shopping spree (moving clothing racks, LED
>   billboards, a lift, shopper crowds that shove you, cars on a crosswalk
>   timer). Collect 10 of 16 items, then meet Nana.
> - Level 4: Housewarming Party Prep inside Room 707 (wobbly fragile tables,
>   sliding boxes, boiling-over pots, falling teacups, spilled soda). Collect 8
>   of 13 party items and reach the front door before the 80-second doorbell.
>
> Story: the game opens with a short visual-novel scene (Hachi leaving her snowy
> town for Tokyo), and Hachi and Nana talk between every level and at the end.
> Reaching a goal plays a hopping, confetti celebration before the next scene.
>
> The page loads the round "Fredoka" font from Google Fonts. Offline, it falls
> back to the other rounded fonts and everything still works.
>
> Art: the whole game follows the kawaii / gyaru look of Hachi's hand-drawn
> sprites (soft pastels, warm brown outlines, pixel hearts, smiling items).
> Hachi's artwork lives in `static/images/hachi/` and the other Nana's goes in
> `static/images/nana/` (see the README.txt in each folder).
> See the design doc "Nana Game (HMWK 6)".

## Install

1. Install Python 3.11+ from https://www.python.org
2. From this folder:

```bash
pip install -r requirements.txt
```

## Run

```bash
python app.py
```

Open http://127.0.0.1:5000 in your browser.

## Publish on GitHub Pages

GitHub Pages only hosts plain files, so make a static copy of the game first:

```bash
python export_static.py
```

This fills the `docs/` folder. Upload the contents of `docs/` to a GitHub
repository, then turn on Settings > Pages > Deploy from a branch > `main`, folder `/ (root)`
(or keep `docs/` as a folder and pick `/docs`). Run the script again after any change to the game.

## Controls

| Key | Action |
|---|---|
| Left / A, Right / D | Move |
| Up / W | Jump |
| P | Pause / resume |
| Enter / Space | Confirm / next line of the story |
| Esc | Skip a story scene, or go to the main menu while paused |
| R | Restart level |
| M | Mute / unmute sound |

## Project layout

```
platform-game/
├── app.py                 Flask server: page + /api/config + /api/levels
├── requirements.txt       Python dependencies
├── README.md
├── templates/index.html   The page with the <canvas>
├── static/
│   ├── css/style.css      Page styling
│   ├── js/                Browser code, one job per file:
│   │   ├── game.js        Entry point: key-press flow + main loop
│   │   ├── state.js       Shared game state
│   │   ├── api.js         Loads config + levels from Flask
│   │   ├── input.js       Keyboard tracking
│   │   ├── player.js      Player + movement/physics
│   │   ├── geometry.js    Shared rectangle-overlap helper
│   │   ├── theme_station.js  Draws Level 1's snowy station, back to front
│   │   ├── scenery.js     Sky, rays, mountains, village, forest, rail bed, snow
│   │   ├── station_decor.js  Canopy, pillars, lamps, signs, clock, vending machine
│   │   ├── props.js       Floor, ice, carts, racks, pickups, the Shinkansen
│   │   ├── theme_street.js   Draws Level 2's Tokyo street + apartment
│   │   ├── street_scenery.js Sunset sky, skyline, Tokyo Tower, petals
│   │   ├── street_decor.js   Shops, apartment block, drains, poles, corridor
│   │   ├── props_street.js   Awning, balconies, bicycles, pots, crates, key, door
│   │   ├── theme_harajuku.js   Draws Level 3's Harajuku / Shibuya street
│   │   ├── harajuku_scenery.js Pastel sky, skyline, 109 towers, balloons
│   │   ├── harajuku_decor.js   Takeshita arch, boutiques, scramble, mall
│   │   ├── props_harajuku.js   Racks, billboards, lift, shoppers, cars, items, Nana
│   │   ├── theme_room.js     Draws Level 4 (Room 707 housewarming)
│   │   ├── room_decor.js     The room: wallpaper, windows, kitchen, hall
│   │   ├── props_room.js     Boxes, tables, counters, pots, cups, party items, door
│   │   ├── story.js       Goal celebration + visual-novel story scenes (Hachi and Nana talking)
│   │   ├── ending_scene.js   The ending: one big happy Hachi with hearts and confetti
│   │   ├── people.js      Detailed chibi shoppers, cyclists and Nana (same style as Hachi)
│   │   ├── audio.js       Sound effects + background music (made live with Web Audio, no files)
│   │   ├── screens.js     Title page, pause page, level intro card, goal strip + arrow
│   │   ├── style.js       Kawaii style kit: brown outline, font, pixel hearts, faces, sparkles
│   │   ├── fx.js          Sparkle bursts (pickups) and floating hearts (ouch)
│   │   ├── camera.js      Follows the player sideways and up/down
│   │   ├── sprites.js     Loads your own Hachi artwork if you add it
│   │   ├── hachi.js       The built-in Hachi drawing + walk/jump poses
│   │   ├── level.js       Level loading, pickups, falls, goal
│   │   ├── update.js      One frame of game logic
│   │   └── render.js      Canvas drawing
│   └── images/            Sprites and backgrounds (add here)
└── game/                  Python game logic
    ├── config.py          Screen size, physics, key bindings
    ├── game_state.py      GameState enum + GameSession (flow, score, level)
    ├── player.py          Player data + take_hit / respawn rules
    ├── story.py           The visual-novel dialogue shown between levels
    └── level.py           The 4 levels as data
```

## What Python does

Python owns the game's *rules and data*: level layouts, physics numbers,
the allowed state transitions, and the player/hearts model. Flask hands these
to the browser, and `game.js` runs the real-time loop and draws it.

## AI tools used

- Claude Code (architecture scaffold)
- Cursor (feature development): document significant AI contributions here.
