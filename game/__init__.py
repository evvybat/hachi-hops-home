"""Python game logic for "Hachi Hops Home!".

config.py      - shared numbers (screen size, physics, key names)
game_state.py  - GameState enum + GameSession (score, level, lives, flow)
player.py      - Player dataclass (position, velocity, hearts, i-frames)
level.py       - the 4 levels as data + Level loader
"""

from .config import CONFIG
from .game_state import GameSession, GameState
from .level import LEVELS, get_level
from .player import Player
from .story import STORY

__all__ = ["CONFIG", "GameSession", "GameState", "LEVELS", "get_level", "Player", "STORY"]
