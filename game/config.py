"""Single source of truth for tuning numbers.

Flask sends this dict to the browser (/api/config), so Python and JavaScript
always agree on screen size, physics and controls.
"""

CONFIG = {
    "title": "Hachi Hops Home!",
    "screen": {"width": 960, "height": 540, "fps": 60},
    "physics": {                      # pixels per frame at 60 FPS
        "moveSpeed": 4.0,
        "jumpForce": 11.0,
        "gravity": 0.5,
        "maxFallSpeed": 12.0,
        "iceFriction": 0.97,          # Level 1 icy patches
        "bounceForce": 15.0,          # Level 2 shop awnings
        "crowdPush": 6.0,             # Level 3 shoppers
    },
    "player": {
        "width": 32,
        "height": 48,
        "startingLives": 3,           # hearts reset to 3 every level
        "hurtInvincibleFrames": 90,   # ~1.5 s of damage immunity
    },
    # Each action accepts any of its keys (KeyboardEvent.code values).
    "keys": {
        "left": ["ArrowLeft", "KeyA"],
        "right": ["ArrowRight", "KeyD"],
        "jump": ["ArrowUp", "KeyW"],
        "pause": ["KeyP"],
        "confirm": ["Enter", "Space"],
        "restart": ["KeyR"],
        "menu": ["Escape"],                    # from the pause screen: back to the main menu
        "dash": ["ShiftLeft", "ShiftRight"],   # optional bonus
    },
}
