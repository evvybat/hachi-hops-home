"""Game flow: which screen we're on, and the score/level bookkeeping.

The browser reports events ("level_complete", "game_over", ...) and
GameSession decides whether that transition is legal. Keeping the rules in
Python means the JavaScript can't skip levels or invent a score.
"""

from enum import Enum

from .level import LEVELS, get_level


class GameState(str, Enum):
    MENU = "MENU"
    PLAYING = "PLAYING"
    PAUSED = "PAUSED"
    LEVEL_COMPLETE = "LEVEL_COMPLETE"
    GAME_OVER = "GAME_OVER"
    VICTORY = "VICTORY"


# state -> states it is allowed to move to
ALLOWED = {
    GameState.MENU: {GameState.PLAYING},
    GameState.PLAYING: {GameState.PAUSED, GameState.LEVEL_COMPLETE,
                        GameState.GAME_OVER},
    GameState.PAUSED: {GameState.PLAYING},
    GameState.LEVEL_COMPLETE: {GameState.PLAYING, GameState.VICTORY},
    GameState.GAME_OVER: {GameState.MENU},
    GameState.VICTORY: {GameState.MENU},
}


class GameSession:
    def __init__(self):
        self.state = GameState.MENU        # gameState
        self.current_level = 1             # currentLevel (1..4)
        self.score = 0                     # score
        self.items_collected = 0           # itemsCollected (this level)

    # isPaused / hasWon / hasLost are derived so they can't drift from state.
    @property
    def is_paused(self) -> bool:
        return self.state == GameState.PAUSED

    @property
    def has_won(self) -> bool:
        return self.state == GameState.VICTORY

    @property
    def has_lost(self) -> bool:
        return self.state == GameState.GAME_OVER

    def transition(self, new_state: GameState) -> bool:
        """Move to new_state if the flow allows it. Returns success."""
        if new_state not in ALLOWED[self.state]:
            return False
        self.state = new_state
        return True

    def start_game(self) -> None:
        self.score = 0
        self.start_level(1)

    def start_level(self, number: int) -> None:
        if get_level(number) is None:
            raise ValueError(f"No such level: {number}")
        self.current_level = number
        self.items_collected = 0
        self.state = GameState.PLAYING

    def complete_level(self) -> GameState:
        """Called when the player reaches an unlocked exit."""
        self.transition(GameState.LEVEL_COMPLETE)
        return self.state

    def advance(self) -> GameState:
        """Confirm on the level-complete screen: next level or victory."""
        if self.current_level < len(LEVELS):
            self.start_level(self.current_level + 1)
        else:
            self.transition(GameState.VICTORY)
        return self.state

    def to_dict(self) -> dict:
        return {
            "state": self.state.value,
            "currentLevel": self.current_level,
            "score": self.score,
            "itemsCollected": self.items_collected,
            "isPaused": self.is_paused,
            "hasWon": self.has_won,
            "hasLost": self.has_lost,
        }
