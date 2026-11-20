"""The 4 levels, described as plain data (no logic) so layouts can be edited
without touching any code. Rects are {x, y, w, h} in world pixels.

TODO: replace the placeholder platforms/hazards/collectibles with the real
layouts from the design doc.
"""

from dataclasses import dataclass, field


def rect(x, y, w, h):
    return {"x": x, "y": y, "w": w, "h": h}


# platform kinds: solid | icy | bouncy | moving | fragile
# hazard kinds:   icicles | pigeon | bicycle | flowerpot | crate | crowd | car |
#                 boiling_pot | cup | spilled_drink
# A platform with "move" is a moving platform (see static/js/level.js).
# Levels are screen-sized by default; a level may set "worldHeight" (taller
# than 540) to scroll vertically.
LEVELS = [
    {
        "number": 1,
        "name": "Catching the Tokyo Train",
        "setting": "Snowy hometown train platform",
        "focus": "Learning movement and jump timing",
        # Shown to the player: a short goal (always on screen) and a tip (level intro).
        "objective": "Catch the train: reach the Shinkansen door!",
        "tip": "Jump the gaps, dodge spikes and pigeons, grab tickets & bentos.",
        "worldWidth": 3000,
        "spawn": {"x": 80, "y": 432},
        "timeLimit": None,
        "itemsRequired": 0,
        # Tells the browser which art set to draw (see static/js/theme_station.js).
        # "style" says what each platform looks like; "kind" is how it behaves.
        "theme": "snow_station",
        "platforms": [
            # Station floor, in wide pieces with small (80px) gaps.
            # Icy patches are slippery slowdowns, not hazards.
            {**rect(0, 480, 700, 60), "kind": "solid", "style": "floor"},
            {**rect(780, 480, 220, 60), "kind": "solid", "style": "floor"},
            {**rect(1000, 480, 250, 60), "kind": "icy", "style": "ice"},
            {**rect(1250, 480, 250, 60), "kind": "solid", "style": "floor"},
            {**rect(1580, 480, 320, 60), "kind": "solid", "style": "floor"},
            {**rect(1900, 480, 250, 60), "kind": "icy", "style": "ice"},
            {**rect(2150, 480, 150, 60), "kind": "solid", "style": "floor"},
            {**rect(2380, 480, 620, 60), "kind": "solid", "style": "floor"},
            # Luggage carts (blocks to jump onto) and hanging luggage racks.
            {**rect(350, 420, 110, 60), "kind": "solid", "style": "cart"},
            {**rect(560, 360, 120, 15), "kind": "solid", "style": "rack"},
            {**rect(1100, 420, 110, 60), "kind": "solid", "style": "cart"},
            {**rect(1700, 420, 110, 60), "kind": "solid", "style": "cart"},
            {**rect(2000, 380, 120, 15), "kind": "solid", "style": "rack"},
            {**rect(2500, 420, 110, 60), "kind": "solid", "style": "cart"},
        ],
        # Touching a hazard costs a heart, and so does falling into a gap.
        # A "patrol" hazard walks back and forth between x = min and max.
        "hazards": [
            {**rect(520, 456, 44, 24), "kind": "icicles"},
            {**rect(1400, 456, 44, 24), "kind": "icicles"},
            {**rect(1830, 456, 44, 24), "kind": "icicles"},
            {**rect(2640, 456, 44, 24), "kind": "icicles"},
            {**rect(800, 458, 28, 22), "kind": "pigeon",
             "patrol": {"min": 800, "max": 930, "speed": 1.0}},
            {**rect(2700, 458, 28, 22), "kind": "pigeon",
             "patrol": {"min": 2700, "max": 2820, "speed": 1.0}},
        ],
        "collectibles": [
            {**rect(250, 440, 20, 20), "name": "train ticket"},
            {**rect(395, 380, 20, 20), "name": "bento snack"},
            {**rect(610, 320, 20, 20), "name": "train ticket"},
            {**rect(850, 440, 20, 20), "name": "bento snack"},
            {**rect(1145, 380, 20, 20), "name": "train ticket"},
            {**rect(1350, 440, 20, 20), "name": "bento snack"},
            {**rect(1745, 380, 20, 20), "name": "train ticket"},
            {**rect(2050, 340, 20, 20), "name": "bento snack"},
            {**rect(2545, 380, 20, 20), "name": "train ticket"},
            {**rect(2700, 440, 20, 20), "name": "bento snack"},
        ],
        "goal": {**rect(2850, 380, 80, 100), "label": "Shinkansen door"},
    },
    {
        "number": 2,
        "name": "Race to Room 707",
        "setting": "Tokyo streets and the apartment stairwell",
        "focus": "Vertical climbing and avoiding obstacles",
        "objective": "Grab the room key, then reach Room 707!",
        "tip": "Climb the balconies. Watch out for bikes and falling pots!",
        # The world is taller than the screen: run along the street, then
        # climb the apartment balconies up to the top-floor corridor.
        "worldWidth": 2600,
        "worldHeight": 1000,
        "theme": "tokyo_street",
        "spawn": {"x": 80, "y": 852},
        "timeLimit": None,
        "itemsRequired": 0,
        "platforms": [
            # --- The street (ground is y = 900). Two storm-drain gaps. ---
            {**rect(0, 900, 520, 100), "kind": "solid", "style": "street"},
            {**rect(620, 900, 480, 100), "kind": "solid", "style": "street"},
            # Lobby / ground floor under the whole apartment building.
            {**rect(1190, 900, 1410, 100), "kind": "solid", "style": "street"},
            # A bouncy shop awning launches you up onto a shop roof (optional
            # route to extra pickups).
            {**rect(170, 820, 100, 14), "kind": "bouncy", "style": "awning"},
            {**rect(300, 660, 160, 16), "kind": "solid", "style": "roof"},
            # --- The climb: balconies zig-zag up the building, ~90px apart. ---
            {**rect(1480, 820, 130, 16), "kind": "solid", "style": "balcony"},
            {**rect(1330, 735, 130, 16), "kind": "solid", "style": "balcony"},
            {**rect(1480, 650, 130, 16), "kind": "solid", "style": "balcony"},
            {**rect(1330, 565, 130, 16), "kind": "solid", "style": "balcony"},
            {**rect(1480, 480, 130, 16), "kind": "solid", "style": "balcony"},
            {**rect(1330, 395, 130, 16), "kind": "solid", "style": "balcony"},
            {**rect(1480, 310, 130, 16), "kind": "solid", "style": "balcony"},
            # A narrow stair landing, then the top-floor corridor.
            {**rect(1680, 260, 100, 16), "kind": "solid", "style": "balcony"},
            {**rect(1900, 220, 700, 24), "kind": "solid", "style": "corridor"},
        ],
        # Hazards cost a heart. "patrol" ones ride back and forth; "fall" ones
        # drop from startY to endY, wait `delay` frames, then drop again.
        "hazards": [
            {**rect(330, 836, 56, 64), "kind": "bicycle",
             "patrol": {"min": 330, "max": 460, "speed": 1.8}},
            {**rect(640, 836, 56, 64), "kind": "bicycle",
             "patrol": {"min": 640, "max": 1040, "speed": 2.2}},
            {**rect(1640, 60, 22, 26), "kind": "flowerpot",
             "fall": {"startY": 60, "endY": 874, "delay": 0}},
            {**rect(1840, 60, 22, 26), "kind": "flowerpot",
             "fall": {"startY": 60, "endY": 874, "delay": 110}},
            {**rect(2230, 40, 28, 28), "kind": "crate",
             "fall": {"startY": 40, "endY": 192, "delay": 0}},
            {**rect(2330, 40, 28, 28), "kind": "crate",
             "fall": {"startY": 40, "endY": 192, "delay": 70}},
        ],
        # "required" items must be collected before the exit opens.
        "collectibles": [
            {**rect(110, 860, 20, 20), "name": "yen coin"},
            {**rect(210, 780, 20, 20), "name": "yen coin"},
            {**rect(340, 620, 20, 20), "name": "apartment flyer"},
            {**rect(410, 620, 20, 20), "name": "apartment flyer"},
            {**rect(570, 800, 20, 20), "name": "yen coin"},
            {**rect(800, 860, 20, 20), "name": "yen coin"},
            {**rect(1000, 860, 20, 20), "name": "apartment flyer"},
            {**rect(1230, 860, 20, 20), "name": "yen coin"},
            {**rect(1530, 780, 20, 20), "name": "yen coin"},
            {**rect(1380, 695, 20, 20), "name": "yen coin"},
            {**rect(1530, 610, 20, 20), "name": "yen coin"},
            {**rect(1380, 525, 20, 20), "name": "yen coin"},
            {**rect(1530, 440, 20, 20), "name": "yen coin"},
            {**rect(1380, 355, 20, 20), "name": "yen coin"},
            {**rect(1530, 270, 20, 20), "name": "yen coin"},
            {**rect(1715, 220, 20, 20), "name": "apartment flyer"},
            {**rect(2080, 180, 20, 20), "name": "room key", "required": True},
        ],
        "goal": {**rect(2450, 110, 70, 110), "label": "Room 707 door"},
    },
    {
        "number": 3,
        "name": "Harajuku / Shibuya Shopping Spree",
        "setting": "Fashion boutiques and bustling crosswalks",
        "focus": "Precision jumping and rhythm",
        "objective": "Collect 10 shopping items, then meet Nana!",
        "tip": "Ride the racks over the stairwells. Wait for the cars to pass!",
        "worldWidth": 3900,          # a long flat stretch at the end to run to Nana
        "theme": "harajuku",
        "spawn": {"x": 80, "y": 432},
        "timeLimit": None,
        # Collect 10 of the 16 shopping items to have a full set of bags for Nana.
        "itemsRequired": 10,
        "platforms": [
            # --- The pavement. The gaps are subway stairwells: ride a clothing
            # rack across them, or you fall (and lose a heart). ---
            {**rect(0, 480, 640, 60), "kind": "solid", "style": "street"},
            {**rect(840, 480, 520, 60), "kind": "solid", "style": "street"},
            # Shibuya scramble: two zebra crossings, with cars on a timer.
            {**rect(1560, 480, 960, 60), "kind": "solid", "style": "street",
             "stripes": [[1650, 1900], [2150, 2400]]},
            {**rect(2640, 480, 400, 60), "kind": "solid", "style": "street"},
            {**rect(3240, 480, 660, 60), "kind": "solid", "style": "street"},
            # --- Moving platforms. A "move" swings smoothly about its start
            # spot (range px each way) and carries whoever stands on it. ---
            # Clothing racks rolling back and forth over the stairwells:
            {**rect(700, 500, 80, 14), "kind": "solid", "style": "rack",
             "move": {"axis": "x", "range": 50, "speed": 0.03, "phase": 0}},
            {**rect(1420, 500, 80, 14), "kind": "solid", "style": "rack",
             "move": {"axis": "x", "range": 50, "speed": 0.03, "phase": 3.14}},
            {**rect(3100, 500, 80, 14), "kind": "solid", "style": "rack",
             "move": {"axis": "x", "range": 55, "speed": 0.032, "phase": 1.57}},
            # LED billboards sliding above the crossings (optional pickups):
            {**rect(1700, 380, 110, 16), "kind": "solid", "style": "billboard",
             "move": {"axis": "x", "range": 45, "speed": 0.035, "phase": 0}},
            {**rect(2200, 380, 110, 16), "kind": "solid", "style": "billboard",
             "move": {"axis": "x", "range": 45, "speed": 0.035, "phase": 2}},
            # A shop lift up to the boutique balconies (an optional high route
            # that skips the last stairwell):
            {**rect(2740, 380, 90, 14), "kind": "solid", "style": "lift",
             "move": {"axis": "y", "range": 86, "speed": 0.022, "phase": 0}},
            {**rect(2880, 350, 140, 16), "kind": "solid", "style": "ledge"},
            {**rect(3070, 300, 120, 16), "kind": "solid", "style": "ledge",
             "move": {"axis": "x", "range": 40, "speed": 0.03, "phase": 0}},
            {**rect(3250, 320, 110, 16), "kind": "solid", "style": "ledge"},
        ],
        # "push" hazards shove Hachi backward as well as costing a heart.
        # A "cycle" car sits revving for `warn` frames (signal flashes, harmless),
        # then dashes from `from` to `to` over `active` frames.
        "hazards": [
            {**rect(900, 416, 64, 64), "kind": "crowd", "push": True,
             "patrol": {"min": 900, "max": 1290, "speed": 1.2}},
            {**rect(2870, 416, 64, 64), "kind": "crowd", "push": True,
             "patrol": {"min": 2870, "max": 2975, "speed": 1.0}},
            {**rect(3290, 416, 64, 64), "kind": "crowd", "push": True,
             "patrol": {"min": 3290, "max": 3390, "speed": 1.4}},
            {**rect(2010, 426, 100, 54), "kind": "car", "push": True, "signal": 1630,
             "cycle": {"period": 330, "warn": 50, "active": 75, "offset": 0,
                       "from": 2010, "to": 1570}},
            {**rect(2460, 426, 100, 54), "kind": "car", "push": True, "signal": 2130,
             "cycle": {"period": 330, "warn": 50, "active": 75, "offset": 165,
                       "from": 2460, "to": 2040}},
        ],
        "collectibles": [
            {**rect(250, 440, 20, 20), "name": "ribbon"},
            {**rect(520, 440, 20, 20), "name": "platform heels"},
            {**rect(720, 420, 20, 20), "name": "strawberry cup"},
            {**rect(960, 380, 20, 20), "name": "makeup compact"},
            {**rect(1100, 380, 20, 20), "name": "harajuku outfit"},
            {**rect(1450, 420, 20, 20), "name": "ribbon"},
            {**rect(1745, 340, 20, 20), "name": "platform heels"},
            {**rect(1790, 440, 20, 20), "name": "strawberry cup"},
            {**rect(2000, 440, 20, 20), "name": "harajuku outfit"},
            {**rect(2245, 340, 20, 20), "name": "makeup compact"},
            {**rect(2440, 440, 20, 20), "name": "ribbon"},
            {**rect(2570, 400, 20, 20), "name": "platform heels"},
            {**rect(2930, 310, 20, 20), "name": "harajuku outfit"},
            {**rect(3120, 260, 20, 20), "name": "makeup compact"},
            {**rect(3300, 280, 20, 20), "name": "strawberry cup"},
            {**rect(3420, 440, 20, 20), "name": "ribbon"},
        ],
        "goal": {**rect(3760, 400, 60, 80), "label": "Nana with shopping bags"},
    },
    {
        "number": 4,
        "name": "Housewarming Party Prep",
        "setting": "Inside Room 707",
        "focus": "Combining everything + speed/collection pressure",
        "objective": "Collect 8 party items, then open the front door!",
        "tip": "Wobbly tables fall, pots boil over. Beat the doorbell timer!",
        "worldWidth": 2500,
        "theme": "room707",
        "spawn": {"x": 60, "y": 432},
        # The doorbell rings when the timer hits 0 (Nana and the Black Stones
        # are at the door!). You need 8 of the 13 party items to open it.
        "timeLimit": 80,
        "itemsRequired": 8,
        "platforms": [
            {**rect(0, 480, 2500, 60), "kind": "solid", "style": "wood"},
            # --- Living room: stacked moving boxes, a wobbly retro table,
            # a sliding box and a record shelf, stepping up. ---
            {**rect(190, 420, 100, 60), "kind": "solid", "style": "box"},
            {**rect(290, 360, 90, 120), "kind": "solid", "style": "box"},
            # A "fragile" platform wobbles for `delay` frames after you land,
            # then falls away, then comes back `respawn` frames later.
            {**rect(430, 380, 110, 16), "kind": "solid", "style": "table",
             "fragile": {"delay": 40, "respawn": 240}},
            {**rect(600, 350, 90, 36), "kind": "solid", "style": "movebox",
             "move": {"axis": "x", "range": 50, "speed": 0.035, "phase": 0}},
            {**rect(760, 280, 130, 16), "kind": "solid", "style": "shelf"},
            # --- Kitchen: you have to climb over the counters, past boiling pots. ---
            {**rect(930, 410, 190, 70), "kind": "solid", "style": "counter"},
            {**rect(1180, 350, 200, 130), "kind": "solid", "style": "counter"},
            {**rect(1420, 390, 120, 16), "kind": "solid", "style": "table",
             "fragile": {"delay": 40, "respawn": 240}},
            {**rect(1580, 330, 110, 16), "kind": "solid", "style": "table",
             "fragile": {"delay": 35, "respawn": 240}},
            # --- Hallway to the front door: more sliding boxes. ---
            {**rect(1750, 400, 90, 36), "kind": "solid", "style": "movebox",
             "move": {"axis": "x", "range": 50, "speed": 0.04, "phase": 1}},
            {**rect(1900, 330, 90, 36), "kind": "solid", "style": "movebox",
             "move": {"axis": "y", "range": 40, "speed": 0.03, "phase": 0}},
            {**rect(2050, 290, 120, 16), "kind": "solid", "style": "shelf"},
        ],
        # "pulse" pots bubble (harmless) then boil over and shoot foam upward
        # for `reach` px. "cup"s fall from a cupboard. Puddles of spilled drink
        # just sit there. Every one costs a heart.
        "hazards": [
            {**rect(1000, 365, 60, 45), "kind": "boiling_pot",
             "pulse": {"period": 240, "warn": 50, "active": 60, "offset": 0, "reach": 75}},
            {**rect(1260, 305, 60, 45), "kind": "boiling_pot",
             "pulse": {"period": 240, "warn": 50, "active": 60, "offset": 120, "reach": 75}},
            {**rect(1340, 100, 24, 26), "kind": "cup",
             "fall": {"startY": 100, "endY": 324, "delay": 30}},
            {**rect(2250, 100, 24, 26), "kind": "cup",
             "fall": {"startY": 100, "endY": 454, "delay": 90}},
            {**rect(640, 466, 70, 14), "kind": "spilled_drink"},
            {**rect(1460, 466, 70, 14), "kind": "spilled_drink"},
            {**rect(1700, 466, 70, 14), "kind": "spilled_drink"},
            {**rect(2200, 466, 70, 14), "kind": "spilled_drink"},
        ],
        "collectibles": [
            {**rect(120, 440, 20, 20), "name": "strawberries"},
            {**rect(230, 380, 20, 20), "name": "strawberries"},
            {**rect(330, 320, 20, 20), "name": "curry ingredients"},
            {**rect(460, 340, 20, 20), "name": "plate"},
            {**rect(640, 310, 20, 20), "name": "vinyl record"},
            {**rect(790, 240, 20, 20), "name": "curry ingredients"},
            {**rect(860, 440, 20, 20), "name": "plate"},
            {**rect(960, 370, 20, 20), "name": "plate"},
            {**rect(1210, 310, 20, 20), "name": "strawberries"},
            {**rect(1440, 350, 20, 20), "name": "curry ingredients"},
            {**rect(1610, 290, 20, 20), "name": "plate"},
            {**rect(1790, 360, 20, 20), "name": "vinyl record"},
            {**rect(2160, 440, 20, 20), "name": "vinyl record"},
        ],
        "goal": {**rect(2400, 380, 70, 100), "label": "Front door"},
    },
]


@dataclass
class Level:
    """Thin wrapper over one LEVELS entry, for use in Python-side rules."""
    data: dict
    collected: set = field(default_factory=set)

    @property
    def number(self) -> int:
        return self.data["number"]

    @property
    def items_required(self) -> int:
        return self.data["itemsRequired"]

    def can_finish(self, items_collected: int) -> bool:
        """The exit unlocks once enough key items are collected."""
        return items_collected >= self.items_required


def get_level(number: int) -> dict | None:
    """Return the data for level `number` (1-based), or None if invalid."""
    if 1 <= number <= len(LEVELS):
        return LEVELS[number - 1]
    return None
