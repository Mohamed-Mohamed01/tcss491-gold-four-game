// game/npc.js
// NPC entity:
// - Spawns at npc_spawn (boss level)
// - Idle animation loop
// - Shows interaction hint and opens dialogue on E

class NPC {
  constructor(game, assetManager, tileMap, camera, player, x, y) {
    this.game = game;
    this.AM = assetManager;
    this.map = tileMap;
    this.camera = camera;
    this.player = player;

    this.x = x;
    this.y = y;

    this.tag = "npc";
    this.removeFromWorld = false;

    // Animation config
    this.imgPath = "assets/images/npc_sprite/Idle.png";
    this.frameCount = 4;
    this.frameTime = 0.2;
    this.animElapsed = 0;

    this.interactRadius = 120;

    // NPC Interaction Fix
    this.playerInRange = false;
    this.isTalking = false;
    this.dialogueIndex = 0;
    this.eHeld = false;
    this.escHeld = false;

    // Dialogue content (line-by-line)
    this.dialogueLines = [
      "Hold it right there, traveler...",
      "I've seen warriors march into that arena thinking they were ready.",
      "Most of them never walked back out.",
      "If you're planning to fight what's inside, you'd better prepare first.",
      "There's a shop just ahead.",
      "You can spend the coins you've collected to strengthen yourself.",
      "Stronger weapons. More health. Maybe even enough power to survive.",
      "When you're ready... step into the arena.",
      "But don't say I didn't warn you."
    ];

    // Dialogue overlay references (from index.html)
    this.dialogueOverlay = document.getElementById("npcDialogueOverlay");
    this.dialogueText = document.getElementById("npcDialogueText");

    // NPC Interaction Fix: NPC controls its own dialogue flow
    this.game.npcDialogueManaged = true;
  }

  // Dialogue State Control
  openDialogue() {
    if (this.isTalking) return;
    this.isTalking = true;
    this.dialogueIndex = 0;
    this.game.npcDialogueOpen = true;

    // Pause player movement (player.js checks game.npcDialogueOpen)
    if (this.player) this.player.canMove = false;

    if (this.dialogueOverlay) {
      this.dialogueOverlay.style.display = "flex";
      this.dialogueOverlay.classList.add("open");
    }
    this.updateDialogueText();
  }

  updateDialogueText() {
    if (!this.dialogueText) return;
    const line = this.dialogueLines[this.dialogueIndex] || "";
    this.dialogueText.textContent = line;
  }

  closeDialogue() {
    this.isTalking = false;
    this.dialogueIndex = 0;
    this.game.npcDialogueOpen = false;
    this.game.npcTalked = true;

    if (this.player) this.player.canMove = true;

    if (this.dialogueOverlay) {
      this.dialogueOverlay.classList.remove("open");
      this.dialogueOverlay.style.display = "none";
    }
  }

  advanceDialogue() {
    if (!this.isTalking) return;
    this.dialogueIndex += 1;

    if (this.dialogueIndex >= this.dialogueLines.length) {
      this.closeDialogue();
      return;
    }

    this.updateDialogueText();
  }

  update() {
    const dt = this.game.clockTick || 1 / 60;
    this.animElapsed += dt;

    if (!this.player) return;

    const dx = this.player.x - this.x;
    const dy = this.player.y - this.y;
    const dist = Math.hypot(dx, dy);
    const near = dist <= this.interactRadius;
    this.playerInRange = near;

    if (!this.game.shopOpen && !this.game.npcDialogueOpen) {
      if (near) {
        this.game.contextHint = "Press E to talk";
        this.game.contextHintSource = "npc";
      } else if (this.game.contextHintSource === "npc") {
        this.game.contextHint = "";
        this.game.contextHintSource = "";
      } else if (this.game.npcTalked && !this.game.contextHint) {
        this.game.contextHint = "Visit the shop to prepare for the arena.";
        this.game.contextHintSource = "npc_guidance";
      }
    } else if (this.game.contextHintSource === "npc") {
      this.game.contextHint = "";
      this.game.contextHintSource = "";
    }

    const keys = this.game.keys || {};
    const eDown = keys["e"] || keys["E"];
    const escDown = keys["Escape"] || keys["Esc"];

    // Input Debounce
    const ePressed = eDown && !this.eHeld;
    const escPressed = escDown && !this.escHeld;

    // Start dialogue
    if (near && ePressed && !this.isTalking && !this.game.shopOpen) {
      this.openDialogue();
    }

    // Advance / Close dialogue
    if (this.isTalking) {
      if (ePressed) this.advanceDialogue();
      if (escPressed) this.closeDialogue();
    }

    this.eHeld = !!eDown;
    this.escHeld = !!escDown;
  }

  draw(ctx) {
    const img = this.AM.getAsset(this.imgPath);
    if (!img) return;

    const fw = img.width / this.frameCount;
    const fh = img.height;

    const frame = Math.floor(this.animElapsed / this.frameTime) % this.frameCount;
    const sx = frame * fw;

    const SCALE = 1.6;
    const dw = fw * SCALE;
    const dh = fh * SCALE;

    const drawX = this.x - this.camera.renderX - dw / 2;
    const drawY = this.y - this.camera.renderY - dh / 2;

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, sx, 0, fw, fh, drawX, drawY, dw, dh);
  }
}
