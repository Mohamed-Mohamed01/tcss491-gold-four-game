// game/objectives.js
// Simple step-by-step objectives that auto-advance when complete.

class ObjectiveManager {
    constructor(game, player) {
      this.game = game;
      this.player = player;
  
      // flags
      if (typeof this.game.storyRead !== "boolean") this.game.storyRead = false;
  
      this.index = 0;
  
      this.steps = [
        {
          // 0
          text: () => `Objective: Read the scroll (Press E near it)`,
          isComplete: () => this.game.storyRead === true
        },
        {
          // 1
          text: () => {
            const keys = this.game.keysCollected || 0;
            const req = this.game.requiredKeys || 3;
            return `Objective: Collect the keys (${keys}/${req})`;
          },
          isComplete: () => (this.game.keysCollected || 0) >= (this.game.requiredKeys || 3)
        },
        {
          // 2
          text: () => {
            const left = this._enemiesLeft();
            return `Objective: Defeat all enemies (${left} left)`;
          },
          isComplete: () => this._enemiesLeft() === 0
        },
        {
          // 3
          text: () => `Objective: Complete!`,
          isComplete: () => this.game.win === true
        }
      ];
    }
  
    _enemiesLeft() {
      return (this.game.entities || []).filter(ent =>
        ent && ent.tag === "enemy" && !ent.removeFromWorld
      ).length;
    }
  
    update() {
      // If game ended, don't churn objectives
      if (this.game.gameOver) return;
  
      while (this.index < this.steps.length - 1 && this.steps[this.index].isComplete()) {
        this.index++;
      }
    }
  
    getText() {
      if (!this.steps[this.index]) return "";
      return this.steps[this.index].text();
    }
  }
  