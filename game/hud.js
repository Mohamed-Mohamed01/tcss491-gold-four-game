// game/hud.js
// HUD (DOM-based UI layer):
// - Reads game state (main.js)
// - Reads player state (player.js)
// - Reads objectives system (objectives.js)
// - Updates HTML elements defined in index.html
// Does NOT draw on canvas.

class HUD {
  constructor(game, player) {
    this.game = game;
    this.player = player;

    // DOM references (must exist in index.html)
    this.hpTextEl = document.getElementById("hudHpText");
    this.hpFillEl = document.getElementById("hudHpFill");
    this.keysTextEl = document.getElementById("hudKeysText");
    this.coinsTextEl = document.getElementById("hudCoinsText");

    // Attack 2 cooldown UI
    this.atk2TextEl = document.getElementById("hudAtk2Text");
    this.atk2FillEl = document.getElementById("hudAtk2Fill");

    // Objectives + story UI
    this.objTextEl = document.getElementById("hudObjectiveText");
    this.storyToastEl = document.getElementById("hudStoryToast");
  }

  update() {
    if (!this.player) return;

    // ----- HP -----
    // Uses player.hp + player.maxHp (player.js)
    const hp = this.player.hp;
    const max = this.player.maxHp;
    const pct = Math.max(0, Math.min(1, hp / max));

    if (this.hpTextEl) {
      this.hpTextEl.textContent = `HP: ${hp}/${max}`;
    }

    if (this.hpFillEl) {
      this.hpFillEl.style.width = `${pct * 100}%`;

      // Color shift when low HP
      if (pct > 0.5) this.hpFillEl.style.filter = "none";
      else if (pct > 0.25) this.hpFillEl.style.filter = "hue-rotate(-40deg)";
      else this.hpFillEl.style.filter = "hue-rotate(-90deg)";
    }

    // ----- Keys -----
    // Values set by main.js / key.js
    const keys = this.game.keysCollected || 0;
    const req = this.game.requiredKeys || 3;

    if (this.keysTextEl) {
      this.keysTextEl.textContent = `Keys: ${keys}/${req}`;
    }

    // ----- Coins -----
    const coins = this.game.coinsCollected || 0;
    if (this.coinsTextEl) {
      this.coinsTextEl.textContent = `Coins: ${coins}`;
    }

    // ----- Attack 2 Cooldown -----
    // Uses player.attack2Cooldown + player.attack2CooldownTime (player.js)
    const cdMax = this.player.attack2CooldownTime || 1;
    const cdRem = this.player.attack2Cooldown || 0;
    const pctReady = 1 - Math.max(0, Math.min(1, cdRem / cdMax));

    if (this.atk2FillEl) {
      this.atk2FillEl.style.width = `${pctReady * 100}%`;
      this.atk2FillEl.classList.toggle("ready", pctReady >= 1);
    }

    if (this.atk2TextEl) {
      if (pctReady >= 1) {
        this.atk2TextEl.textContent = "Attack 2: READY";
      } else {
        this.atk2TextEl.textContent = `Attack 2: ${cdRem.toFixed(1)}s`;
      }
    }

    // ----- Objectives -----
    // Objectives system stored on game.objectives (objectives.js)
    if (this.game.objectives) {
      this.game.objectives.update();
    }

    if (this.objTextEl) {
      this.objTextEl.textContent =
        this.game.objectives ? this.game.objectives.getText() : "";
    }

    // ----- Story Toast -----
    // Short message set by scroll.js or objectives.js
    if (this.storyToastEl) {
      const t = this.game.storyToast || "";
      this.storyToastEl.textContent = t;
      this.storyToastEl.style.display = t ? "block" : "none";
    }
  }

  draw() {
    // Intentionally empty:
    // HUD is DOM-based and does not render on canvas.
  }
}
