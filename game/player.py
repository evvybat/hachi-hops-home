"""Player state (the "Player Physics & Movement" and "Player Status" lists
from the design doc). The real-time movement loop runs in the browser
(static/js/game.js); this class is the Python-side model of the same data,
used for rules and validation.
"""

from dataclasses import dataclass, asdict

from .config import CONFIG


@dataclass
class Player:
    # Physics & movement
    x: float = 0.0                      # playerX
    y: float = 0.0                      # playerY
    velocity_x: float = 0.0             # velocityX
    velocity_y: float = 0.0             # velocityY
    facing_direction: str = "right"     # "left" or "right"

    # Status
    is_grounded: bool = False
    is_jumping: bool = False
    lives: int = CONFIG["player"]["startingLives"]
    hurt_timer: int = 0                 # frames of invincibility left

    @property
    def is_invincible(self) -> bool:
        # Derived from hurt_timer so the two can never disagree.
        return self.hurt_timer > 0

    def respawn(self, spawn_x: float, spawn_y: float) -> None:
        """Back to the spawn point with no momentum."""
        self.x, self.y = spawn_x, spawn_y
        self.velocity_x = self.velocity_y = 0.0
        self.is_grounded = self.is_jumping = False

    def take_hit(self) -> bool:
        """Lose a heart unless invincible. True if a heart was lost."""
        if self.is_invincible:
            return False
        self.lives -= 1
        self.hurt_timer = CONFIG["player"]["hurtInvincibleFrames"]
        return True

    def tick(self) -> None:
        """Advance timers by one frame."""
        if self.hurt_timer > 0:
            self.hurt_timer -= 1

    def to_dict(self) -> dict:
        data = asdict(self)
        data["is_invincible"] = self.is_invincible
        return data
