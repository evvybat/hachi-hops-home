HACHI'S ARTWORK
===============

The game picks up these files by name, with no code changes. Refresh the
browser after changing them.

  idle.png     standing and walking   <- REQUIRED. Without it the game falls
                                          back to the built-in drawn Hachi.
  happy.png    picked up an item, or finished the level
  hurt.png     just got hit
  jump.png     in the air             (optional)
  walk1.png, walk2.png ...            (optional walking frames, in name order)

Right now idle / happy / hurt are made from the hand-drawn JPEGs in the
"sprites hachi" folder (backgrounds removed, cropped to one shared box, shrunk
to 420px tall). Walking and jumping are animated in code (bob, lean, stretch).

How to make new ones
  - PNG (or WebP) with a TRANSPARENT background. JPEGs can't be transparent!
  - Facing RIGHT; the game flips her for left.
  - Feet touching the BOTTOM edge of the image; crop all poses to the SAME box
    so she doesn't shift when the pose changes.
  - 300-500px tall is plenty; the game shrinks it.

On-screen size: SPRITE_HEIGHT in static/js/sprites.js (default 62px).
