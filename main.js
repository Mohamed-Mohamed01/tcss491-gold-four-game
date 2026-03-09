// main.js
// Game entry point:
// - queues assets (AssetManager)
// - initializes engine + canvas
// - wires DOM overlays + menu flow (index.html + styles.css)
// - loads Tiled map (TileMap.loadFromTiledTMJ)
// - spawns player/enemies/keys/scroll + HUD

const gameEngine = new GameEngine({ debugging: false });
const ASSET_MANAGER = new AssetManager();


// Asset loading (paths used by TileMap, Player, EnemyCreator/Enemy, HUD, pickups)

// Tiles / map
ASSET_MANAGER.queueDownload("assets/images/tiles/grass.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/Dirt6.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/FieldsTileset.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/house.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/WaterTileset.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/FenceTileset.png");




// Ground clutter
ASSET_MANAGER.queueDownload("assets/images/tiles/grass1.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/grass2.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/grass3.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/grass4.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/grass5.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/grass6.png");

// Trees
ASSET_MANAGER.queueDownload("assets/images/tiles/tree.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/Tree_2.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/trunk.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/Autumn_tree2.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/Fruit_tree1.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/Fruit_tree2.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/Fruit_tree3.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/Broken_tree1.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/Broken_tree2.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/Broken_tree3.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/Broken_tree4.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/Broken_tree5.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/Broken_tree6.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/Broken_tree7.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/Moss_tree1.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/Moss_tree2.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/Moss_tree3.png");

// Stones
ASSET_MANAGER.queueDownload("assets/images/tiles/stone.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/stone8.png");

// Bushes
ASSET_MANAGER.queueDownload("assets/images/tiles/bush.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/bush2.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/bush3.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/bush4.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/bush5.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/bush6.png");

// Fences
ASSET_MANAGER.queueDownload("assets/images/tiles/fence1.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/fence2.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/fence3.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/fence4.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/fence5.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/fence6.png");

// Camps
ASSET_MANAGER.queueDownload("assets/images/tiles/camp1.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/camp2.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/camp3.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/camp4.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/camp5.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/camp6.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/PlaceForTower1.png");

// Boxes
ASSET_MANAGER.queueDownload("assets/images/tiles/Box1.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/Box2.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/Box3.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/Box4.png");

// Lamps
ASSET_MANAGER.queueDownload("assets/images/tiles/Lamp1.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/Lamp2.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/Lamp3.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/Lamp4.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/Lamp5.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/Lamp6.png");

// Logs
ASSET_MANAGER.queueDownload("assets/images/tiles/Log1.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/Log2.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/Log3.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/Log4.png");

// Pointers
ASSET_MANAGER.queueDownload("assets/images/tiles/pointer1.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/pointer2.png");

// Shadows
ASSET_MANAGER.queueDownload("assets/images/tiles/shadow1.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/shadow2.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/shadow3.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/shadow4.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/shadow5.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/shadow6.png");

// Stone variants
ASSET_MANAGER.queueDownload("assets/images/tiles/stone1.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/stone2.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/stone3.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/stone4.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/stone5.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/stone6.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/stone7.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/stone9.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/stone10.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/stone11.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/stone12.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/stone13.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/stone14.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/stone16.png");

// Flowers
ASSET_MANAGER.queueDownload("assets/images/tiles/flower1.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/flower2.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/flower3.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/flower4.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/flower5.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/flower6.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/flower7.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/flower8.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/flower9.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/flower10.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/flower11.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/flower12.png");

// Water Grass Edges
for (let i = 1; i <= 26; i++) {
  ASSET_MANAGER.queueDownload(`assets/images/tiles/water_grass${i}.png`);
}

// Water Shadows
for (let i = 1; i <= 6; i++) {
  ASSET_MANAGER.queueDownload(`assets/images/tiles/water_shadow${i}.png`);
}
//Bridges
ASSET_MANAGER.queueDownload("assets/images/tiles/Bridge4.png");

//Water Stones
ASSET_MANAGER.queueDownload("assets/images/tiles/Rock1_grass_shadow3.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/Rock3_snow_shadow1.png");
ASSET_MANAGER.queueDownload("assets/images/tiles/Rock8_ground_shadow4.png");

ASSET_MANAGER.queueDownload("assets/images/tiles/Shop.png");








// UI + pickups
ASSET_MANAGER.queueDownload("assets/images/ui_overlay/heart.png");
ASSET_MANAGER.queueDownload("assets/images/scrolls/scrolls.png");
ASSET_MANAGER.queueDownload("assets/images/keys_sprites/gold_key.png");
ASSET_MANAGER.queueDownload("assets/images/resources_sprite/coin_sprite.png");
ASSET_MANAGER.queueDownload("assets/images/resources_sprite/heart.png");

// Player
ASSET_MANAGER.queueDownload("assets/images/player_idle/idle_up.png");
ASSET_MANAGER.queueDownload("assets/images/player_idle/idle_down.png");
ASSET_MANAGER.queueDownload("assets/images/player_idle/idle_left.png");
ASSET_MANAGER.queueDownload("assets/images/player_idle/idle_right.png");

ASSET_MANAGER.queueDownload("assets/images/player_run/run_up.png");
ASSET_MANAGER.queueDownload("assets/images/player_run/run_down.png");
ASSET_MANAGER.queueDownload("assets/images/player_run/run_left.png");
ASSET_MANAGER.queueDownload("assets/images/player_run/run_right.png");

ASSET_MANAGER.queueDownload("assets/images/player_attack/attack1_up.png");
ASSET_MANAGER.queueDownload("assets/images/player_attack/attack1_down.png");
ASSET_MANAGER.queueDownload("assets/images/player_attack/attack1_left.png");
ASSET_MANAGER.queueDownload("assets/images/player_attack/attack1_right.png");

// Player Attack 2 (AoE)
ASSET_MANAGER.queueDownload("assets/images/player_attack2/attack2_up.png");
ASSET_MANAGER.queueDownload("assets/images/player_attack2/attack2_down.png");
ASSET_MANAGER.queueDownload("assets/images/player_attack2/attack2_left.png");
ASSET_MANAGER.queueDownload("assets/images/player_attack2/attack2_right.png");

// Enemy type 1 (skeleton)
ASSET_MANAGER.queueDownload("assets/images/enemy_sprite/Skeleton_01_White_Idle.png");
ASSET_MANAGER.queueDownload("assets/images/enemy_sprite/Skeleton_01_White_Walk.png");
ASSET_MANAGER.queueDownload("assets/images/enemy_sprite/Skeleton_01_White_Attack1.png");
ASSET_MANAGER.queueDownload("assets/images/enemy_sprite/Skeleton_01_White_Hurt.png");
ASSET_MANAGER.queueDownload("assets/images/enemy_sprite/Skeleton_01_White_Die.png");

// Enemy type 2 (zombie)
ASSET_MANAGER.queueDownload("assets/images/enemy2_sprite/Idle.png");
ASSET_MANAGER.queueDownload("assets/images/enemy2_sprite/Walk.png");
ASSET_MANAGER.queueDownload("assets/images/enemy2_sprite/Attack.png");
ASSET_MANAGER.queueDownload("assets/images/enemy2_sprite/Hurt.png");
ASSET_MANAGER.queueDownload("assets/images/enemy2_sprite/Dead.png");

// Enemy type 3 (dragon + projectile)
ASSET_MANAGER.queueDownload("assets/images/enemy3_sprite/IDLE.png");
ASSET_MANAGER.queueDownload("assets/images/enemy3_sprite/FLYING.png");
ASSET_MANAGER.queueDownload("assets/images/enemy3_sprite/HURT.png");
ASSET_MANAGER.queueDownload("assets/images/enemy3_sprite/ATTACK.png");
ASSET_MANAGER.queueDownload("assets/images/enemy3_sprite/DEATH.png");
ASSET_MANAGER.queueDownload("assets/images/enemy3_sprite/projectile.png");

// Enemy 4 sprite sheets
ASSET_MANAGER.queueDownload("assets/images/enemy4_sprite/IDLE.png");
ASSET_MANAGER.queueDownload("assets/images/enemy4_sprite/WALK.png");
ASSET_MANAGER.queueDownload("assets/images/enemy4_sprite/HURT.png");
ASSET_MANAGER.queueDownload("assets/images/enemy4_sprite/ATTACK.png");
ASSET_MANAGER.queueDownload("assets/images/enemy4_sprite/DEATH.png");

//Enemy 5
ASSET_MANAGER.queueDownload("assets/images/enemy5_sprite/Idle.png");
ASSET_MANAGER.queueDownload("assets/images/enemy5_sprite/Walk.png");
ASSET_MANAGER.queueDownload("assets/images/enemy5_sprite/Hurt.png");
ASSET_MANAGER.queueDownload("assets/images/enemy5_sprite/Attack.png");
ASSET_MANAGER.queueDownload("assets/images/enemy5_sprite/Dead.png");
ASSET_MANAGER.queueDownload("assets/images/enemy5_sprite/Arrow.png");

//Enemy 6
ASSET_MANAGER.queueDownload("assets/images/enemy6_sprite/Idle.png");
ASSET_MANAGER.queueDownload("assets/images/enemy6_sprite/Walk.png");
ASSET_MANAGER.queueDownload("assets/images/enemy6_sprite/Hurt.png");
ASSET_MANAGER.queueDownload("assets/images/enemy6_sprite/Attack.png");
ASSET_MANAGER.queueDownload("assets/images/enemy6_sprite/Dead.png");

//NPC
ASSET_MANAGER.queueDownload("assets/images/npc_sprite/Idle.png");

// Phase A Boss Setup
ASSET_MANAGER.queueDownload("assets/images/boss_sprite/Idle.png");
ASSET_MANAGER.queueDownload("assets/images/boss_sprite/Walk.png");
ASSET_MANAGER.queueDownload("assets/images/boss_sprite/Attack.png");
ASSET_MANAGER.queueDownload("assets/images/boss_sprite/Hurt.png");
ASSET_MANAGER.queueDownload("assets/images/boss_sprite/Dead.png");


// Boot (after assets load): DOM wiring + engine state + world/entities spawn

ASSET_MANAGER.downloadAll(async () => {
  const canvas = document.getElementById("gameWorld");
  const ctx = canvas.getContext("2d");

  canvas.focus();
  gameEngine.init(ctx);

  // --------------------------
  // Shared overlays (index.html)
  // --------------------------

  function showUnderConstruction() {
    const welcome = document.getElementById("welcomeOverlay");
    const winUI = document.getElementById("winOverlay");
    const uc = document.getElementById("underConstructionOverlay");

    if (welcome) welcome.style.display = "none";
    if (winUI) winUI.style.display = "none";
    if (uc) uc.style.display = "flex";

    canvas.focus();
  }

  const restartBtn = document.getElementById("restartBtn");
  const nextBtn = document.getElementById("nextBtn");

  const underConstructionOverlay = document.getElementById("underConstructionOverlay");
  const ucBackBtn = document.getElementById("ucBackBtn");

  const howToOverlay = document.getElementById("howToOverlay");
  const howToBackBtn = document.getElementById("howToBackBtn");

  const levelsOverlay = document.getElementById("levelsOverlay");
  const levelsBackBtn = document.getElementById("levelsBackBtn");
  const level1Btn = document.getElementById("level1Btn");
  const level2Btn = document.getElementById("level2Btn");
  const bossBtn = document.getElementById("bossBtn");
  const endingRestartBtn = document.getElementById("endingRestartBtn");
  const tryAgainBtn = document.getElementById("tryAgainBtn");
  const resetProgressBtn = document.getElementById("resetProgressBtn");
  const resumeBtn = document.getElementById("resumeBtn");

  const shopOverlay = document.getElementById("shopOverlay");
  const shopCoinsText = document.getElementById("shopCoinsText");
  const shopHealBtn = document.getElementById("shopHealBtn");
  const shopMaxHpBtn = document.getElementById("shopMaxHpBtn");
  const shopAtkBtn = document.getElementById("shopAtkBtn");
  const shopSpeedBtn = document.getElementById("shopSpeedBtn");
  const shopCloseBtn = document.getElementById("shopCloseBtn");
  const shopFeedback = document.getElementById("shopFeedback");

  const npcDialogueOverlay = document.getElementById("npcDialogueOverlay");
  const npcDialogueText = document.getElementById("npcDialogueText");

  if (restartBtn) restartBtn.addEventListener("click", () => window.location.reload());
  if (nextBtn) nextBtn.addEventListener("click", () => showUnderConstruction());

  if (ucBackBtn) {
    ucBackBtn.addEventListener("click", () => {
      if (underConstructionOverlay) underConstructionOverlay.style.display = "none";

      const welcome = document.getElementById("welcomeOverlay");
      if (welcome) welcome.style.display = "flex";

      canvas.focus();
    });
  }

  if (howToBackBtn) {
    howToBackBtn.addEventListener("click", () => {
      if (howToOverlay) howToOverlay.style.display = "none";

      const welcome = document.getElementById("welcomeOverlay");
      if (welcome) welcome.style.display = "flex";

      canvas.focus();
    });
  }

  // --------------------------
  // Game state flags
  // --------------------------

  gameEngine.gameOver = false;
  gameEngine.win = false;

  gameEngine.requiredKeys = 3;
  gameEngine.keysCollected = 0;
  gameEngine.coinsCollected = 0;
  gameEngine.isPaused = false;
  gameEngine.maxCoinsAvailable = 17;
  gameEngine.levelStartCoins = 0;
  gameEngine.levelStartIndex = 0;

  // Level switching state
  gameEngine.exitUnlocked = false;
  gameEngine.loadingLevel = false;
  gameEngine.currentLevelIndex = 0;

  // "request" style level loading (prevents crash from clearing entities mid-update)
  gameEngine.pendingLevelIndex = null;

  const LEVELS = ["./assets/Level1_Map.tmj", "./assets/Level2_Map.tmj", "./assets/Boss_Map.tmj"];

  // Called from gameplay when player dies
  gameEngine.triggerGameOver = function () {
    this.gameOver = true;
    const overlay = document.getElementById("gameOverOverlay");
    if (overlay) overlay.style.display = "flex";
  };

  // Called when FINAL win happens (no more levels)
  gameEngine.triggerWin = function () {
    this.win = true;

    const uc = document.getElementById("underConstructionOverlay");
    if (uc) uc.style.display = "none";

    const winUI = document.getElementById("winOverlay");
    if (winUI) winUI.style.display = "flex";
  };

  // Removed restart-on-R behavior (game over / win)

  // --------------------------
  // Debug (internal flag only)
  // --------------------------

  gameEngine.debug = false;
  // Debug button removed (internal debug flag can remain if needed)

  // --------------------------
  // Welcome screen flow
  // --------------------------

  let gameStarted = false;

  // Background music (starts on user gesture)
  let backgroundMusic = new Audio("assets/sounds/background_music.mp3");
  backgroundMusic.loop = true;
  backgroundMusic.volume = 0.4;
  backgroundMusic.load();

  // New Code
  // Boss polish sounds (preload)
  const bossLaughSound = new Audio("assets/sounds/boss_laugh.mp3");
  bossLaughSound.loop = false;
  bossLaughSound.volume = 0.7;
  bossLaughSound.load();

  const endSound = new Audio("assets/sounds/end_sound.mp3");
  endSound.loop = false;
  endSound.volume = 0.6;
  endSound.load();

  // Coin pickup sound (short and subtle)
  const coinPickupSoundPath = "assets/sounds/coin_pickup.mp3";

  // Simple helper for future sound effects (one-shot)
  function playSound(path, volume = 0.6) {
    const sound = new Audio(path);
    sound.volume = volume;
    sound.play().catch(() => {});
  }

  // Expose for pickups/other systems
  gameEngine.playSound = playSound;

  // New Code
  // Ending sequence (credits scroll)
  let endingStarted = false;
  const startEndingSequence = () => {
    if (endingStarted) return;
    endingStarted = true;

    gameEngine.win = true;

    const winUI = document.getElementById("winOverlay");
    if (winUI) winUI.style.display = "none";

    // play end sound slightly after boss death
    setTimeout(() => {
      endSound.currentTime = 0;
      endSound.play().catch(() => {});
    }, 400);

    const endingOverlay = document.getElementById("endingOverlay");
    if (endingOverlay) {
      endingOverlay.style.display = "flex";
      requestAnimationFrame(() => {
        endingOverlay.classList.add("open");
        const scroll = endingOverlay.querySelector(".ending-scroll");
        if (scroll) {
          scroll.classList.remove("run");
          // restart animation
          void scroll.offsetWidth;
          scroll.classList.add("run");
        }
      });
    }
  };

  gameEngine.startEndingSequence = startEndingSequence;

  const showResumeButton = () => {
    if (!resumeBtn) return;
    resumeBtn.classList.toggle("hidden", !gameStarted);
  };

  const setShopFeedback = (text) => {
    if (!shopFeedback) return;
    shopFeedback.textContent = text || "";
  };

  const updateShopCoins = () => {
    if (!shopCoinsText) return;
    shopCoinsText.textContent = String(gameEngine.coinsCollected || 0);
  };

  // Phase A: boss dialogue helper (uses HUD story toast)
  let bossDialogueTimer = null;
  const playBossDialogue = (lines, onDone) => {
    if (!Array.isArray(lines) || lines.length === 0) return;
    if (bossDialogueTimer) clearTimeout(bossDialogueTimer);

    let idx = 0;
    const showNext = () => {
      gameEngine.storyToast = lines[idx];
      idx += 1;

      if (idx >= lines.length) {
        bossDialogueTimer = setTimeout(() => {
          gameEngine.storyToast = "";
          bossDialogueTimer = null;
          if (onDone) onDone();
        }, 1400);
        return;
      }

      bossDialogueTimer = setTimeout(showNext, 1800);
    };

    showNext();
  };

  const openShop = () => {
    if (!shopOverlay) return;
    gameEngine.shopOpen = true;
    gameEngine.contextHint = "";
    updateShopCoins();
    setShopFeedback("");
    shopOverlay.style.display = "flex";
    requestAnimationFrame(() => shopOverlay.classList.add("open"));
  };

  const closeShop = () => {
    if (!shopOverlay) return;
    gameEngine.shopOpen = false;
    shopOverlay.classList.remove("open");
    setTimeout(() => {
      if (shopOverlay) shopOverlay.style.display = "none";
    }, 220);
    canvas.focus();
  };

  const tryBuy = (cost, onBuy) => {
    const coins = gameEngine.coinsCollected || 0;
    if (coins < cost) {
      setShopFeedback("Not enough coins.");
      return;
    }
    gameEngine.coinsCollected = coins - cost;
    onBuy();
    updateShopCoins();
    setShopFeedback("Purchase successful!");
  };

  const npcDialogueLines = [
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

  const openNpcDialogue = () => {
    if (!npcDialogueOverlay || !npcDialogueText) return;
    gameEngine.npcDialogueOpen = true;
    gameEngine.contextHint = "";
    gameEngine.contextHintSource = "";
    gameEngine.npcTalked = true;
    npcDialogueText.textContent = npcDialogueLines.join("\n\n");
    npcDialogueOverlay.style.display = "flex";
    requestAnimationFrame(() => npcDialogueOverlay.classList.add("open"));
  };

  const closeNpcDialogue = () => {
    if (!npcDialogueOverlay) return;
    gameEngine.npcDialogueOpen = false;
    npcDialogueOverlay.classList.remove("open");
    setTimeout(() => {
      if (npcDialogueOverlay) npcDialogueOverlay.style.display = "none";
    }, 220);
  };

  gameEngine.openNpcDialogue = openNpcDialogue;
  gameEngine.closeNpcDialogue = closeNpcDialogue;

  const setLocked = (btn, locked, tooltip) => {
    if (!btn) return;
    btn.classList.toggle("locked", locked);
    btn.setAttribute("aria-disabled", locked ? "true" : "false");
    if (locked && tooltip) btn.setAttribute("title", tooltip);
    else btn.removeAttribute("title");
  };

  const readProgress = () => ({
    level1Completed: localStorage.getItem("level1Completed") === "true",
    level2Completed: localStorage.getItem("level2Completed") === "true"
  });

  const applyLevelLocks = () => {
    const progress = readProgress();
    setLocked(level1Btn, false, "");
    setLocked(level2Btn, !progress.level1Completed, "Complete Level 1 to unlock");
    setLocked(bossBtn, !progress.level2Completed, "Complete Level 2 to unlock");

    const markCurrent = (btn, isCurrent) => {
      if (!btn) return;
      if (!btn.dataset.baseLabel) btn.dataset.baseLabel = btn.textContent;
      btn.textContent = isCurrent ? `${btn.dataset.baseLabel} (Current)` : btn.dataset.baseLabel;
      btn.classList.toggle("current-level", isCurrent);
    };

    markCurrent(level1Btn, gameEngine.currentLevelIndex === 0);
    markCurrent(level2Btn, gameEngine.currentLevelIndex === 1);
    markCurrent(bossBtn, gameEngine.currentLevelIndex === 2);
  };

  const openLevelsPanel = () => {
    applyLevelLocks();
    if (welcomeOverlay) welcomeOverlay.style.display = "none";
    if (levelsOverlay) {
      levelsOverlay.style.display = "flex";
      requestAnimationFrame(() => levelsOverlay.classList.add("open"));
    }
    canvas.focus();
  };

  const openMainMenu = () => {
    gameEngine.isPaused = true;
    showResumeButton();
    if (playBtn) playBtn.classList.add("hidden");
    if (levelsOverlay) {
      levelsOverlay.classList.remove("open");
      levelsOverlay.style.display = "none";
    }
    if (howToOverlay) howToOverlay.style.display = "none";
    if (welcomeOverlay) {
      welcomeOverlay.classList.remove("hidden");
      welcomeOverlay.classList.remove("leaving");
      welcomeOverlay.style.display = "flex";
    }
    canvas.focus();
  };

  const resumeGame = () => {
    gameEngine.isPaused = false;
    if (welcomeOverlay) {
      welcomeOverlay.classList.add("hidden");
      welcomeOverlay.style.display = "none";
    }
    canvas.focus();
  };

  const closeLevelsPanel = () => {
    if (levelsOverlay) {
      levelsOverlay.classList.remove("open");
      setTimeout(() => {
        if (levelsOverlay) levelsOverlay.style.display = "none";
      }, 220);
    }
    if (welcomeOverlay) welcomeOverlay.style.display = "flex";
    canvas.focus();
  };

  const startAtLevel = async (index) => {
    gameEngine.isPaused = false;
    gameEngine.currentLevelIndex = index;
    await buildLevel(index);

    if (levelsOverlay) {
      levelsOverlay.classList.remove("open");
      levelsOverlay.style.display = "none";
    }

    if (!gameStarted) {
      gameStarted = true;

      if (welcomeOverlay) {
        welcomeOverlay.classList.add("leaving");

        setTimeout(() => {
          welcomeOverlay.classList.add("hidden");
          welcomeOverlay.classList.remove("leaving");

          gameEngine.start();
          canvas.focus();
        }, 650);
      } else {
        gameEngine.start();
        canvas.focus();
      }
      return;
    }

    if (welcomeOverlay) {
      welcomeOverlay.classList.add("hidden");
      welcomeOverlay.style.display = "none";
    }
    canvas.focus();
  };

  const startGame = () => {
    if (gameStarted) return;
    gameEngine.isPaused = false;
    gameStarted = true;
    showResumeButton();
    if (playBtn) playBtn.classList.remove("hidden");

    if (backgroundMusic.paused) {
      backgroundMusic.play().catch(() => {});
    }

    if (welcomeOverlay) {
      welcomeOverlay.classList.add("leaving");

      setTimeout(() => {
        welcomeOverlay.classList.add("hidden");
        welcomeOverlay.classList.remove("leaving");

        gameEngine.start();
        canvas.focus();
      }, 650);
    } else {
      gameEngine.start();
      canvas.focus();
    }
  };

  if (playBtn) playBtn.addEventListener("click", startGame);
  if (levelsBtn) levelsBtn.addEventListener("click", () => openLevelsPanel());
  if (howToBtn) {
    howToBtn.addEventListener("click", () => {
      const welcome = document.getElementById("welcomeOverlay");
      if (welcome) welcome.style.display = "none";
      if (howToOverlay) howToOverlay.style.display = "flex";
      canvas.focus();
    });
  }
  if (levelsBackBtn) levelsBackBtn.addEventListener("click", () => closeLevelsPanel());
  if (resumeBtn) resumeBtn.addEventListener("click", () => resumeGame());

  if (resetProgressBtn) {
    resetProgressBtn.addEventListener("click", () => {
      localStorage.removeItem("level1Completed");
      localStorage.removeItem("level2Completed");
      applyLevelLocks();
    });
  }

  if (endingRestartBtn) {
    endingRestartBtn.addEventListener("click", () => window.location.reload());
  }

  if (tryAgainBtn) {
    tryAgainBtn.addEventListener("click", () => window.location.reload());
  }

  if (level1Btn) level1Btn.addEventListener("click", () => {});
  if (level2Btn) level2Btn.addEventListener("click", () => {});
  if (bossBtn) bossBtn.addEventListener("click", () => {});

  if (shopCloseBtn) shopCloseBtn.addEventListener("click", () => closeShop());
  if (shopHealBtn) {
    shopHealBtn.addEventListener("click", () => {
      tryBuy(4, () => {
        if (!player) return;
        player.hp = Math.min(player.maxHp, player.hp + 5);
      });
    });
  }
  if (shopMaxHpBtn) {
    shopMaxHpBtn.addEventListener("click", () => {
      tryBuy(8, () => {
        if (!player) return;
        player.maxHp += 2;
        player.hp = Math.min(player.maxHp, player.hp + 2);
      });
    });
  }
  if (shopAtkBtn) {
    shopAtkBtn.addEventListener("click", () => {
      tryBuy(9, () => {
        if (!player) return;
        player.attackDamage = (player.attackDamage || 1) + 1;
      });
    });
  }
  if (shopSpeedBtn) {
    shopSpeedBtn.addEventListener("click", () => {
      tryBuy(7, () => {
        if (!player) return;
        player.SPEED = (player.SPEED || 3) + 0.2;
      });
    });
  }

  window.addEventListener("keydown", (e) => {
    if (e.key === "p" || e.key === "P") {
      if (gameEngine.gameOver || gameEngine.win) return;
      if (gameEngine.storyModalOpen) return;
      if (gameEngine.shopOpen) return;

      if (gameEngine.isPaused) resumeGame();
      else openMainMenu();
    }
  });

  window.addEventListener("keydown", (e) => {
    if (!gameEngine.shopOpen) return;
    if (e.key === "Escape" || e.key === "Esc" || e.key === "e" || e.key === "E") {
      closeShop();
    }
  });

  window.addEventListener("keydown", (e) => {
    if (!gameEngine.npcDialogueOpen) return;
    if (gameEngine.npcDialogueManaged) return;
    if (e.key === "Escape" || e.key === "Esc" || e.key === "e" || e.key === "E") {
      closeNpcDialogue();
    }
  });

  // ---------------------------------------------------------
  // Helpers: collision check + exit logic
  // ---------------------------------------------------------

  function aabbIntersect(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  // Finds ExitPoint object in ANY object layer
  function getExitRectFromMap(tileMap) {
    const map = tileMap?._map;
    if (!map) return null;

    for (const layer of map.layers ?? []) {
      if (layer.type !== "objectgroup") continue;

      for (const o of layer.objects ?? []) {
        if (o.name !== "ExitPoint") continue;

        // If it's a POINT, make it a bigger trigger box
        if (o.point) {
          const size = tileMap.TILE_SIZE * 2;
          return { x: o.x - size / 2, y: o.y - size / 2, w: size, h: size };
        }

        // Rectangle/tile object
        const w = o.width && o.width > 0 ? o.width : tileMap.TILE_SIZE;
        const h = o.height && o.height > 0 ? o.height : tileMap.TILE_SIZE;

        // If it's a tile-object (has gid), Tiled anchors it at bottom-left
        const yTop = o.gid ? o.y - h : o.y;

        return { x: o.x, y: yTop, w, h };
      }
    }
    return null;
  }

  // ------------------------------------
  // World variables (these get replaced per level)
  // ------------------------------------

  let tileMap = null;
  let camera = null;
  let player = null;

  // Helper stays the same (used by loot + etc)
  gameEngine.addWorldEntity = function (ent) {
    const ents = this.entities;
    if (!Array.isArray(ents)) {
      this.addEntity(ent);
      return;
    }

    const mapIndex = ents.findIndex((e) => e && e.tag === "tilemap_draw");
    if (mapIndex === -1) {
      this.addEntity(ent);
      return;
    }

    // Insert BEFORE tilemap draw entity
    ents.splice(mapIndex, 0, ent);
  };

  // ------------------------------------
  // LEVEL BUILDER (keeps entity add order EXACTLY the same)
  // ------------------------------------
  async function buildLevel(levelIndex) {
    const isBossLevel = levelIndex === 2;

    // Reset per-level counters
    gameEngine.keysCollected = 0;
    gameEngine.exitUnlocked = false;
    gameEngine.requiredKeys = isBossLevel ? 0 : 3;
    gameEngine.contextHint = "";
    gameEngine.contextHintSource = "";
    gameEngine.shopOpen = false;
    gameEngine.npcDialogueOpen = false;

    // Level-start coin checkpoint (for restart current level)
    gameEngine.levelStartCoins = gameEngine.coinsCollected || 0;
    gameEngine.levelStartIndex = levelIndex;

    // Clear entities safely HERE (not inside an entity update loop)
    // Keep the level_loader so it can process future level switches
    gameEngine.entities = (gameEngine.entities || []).filter((e) => e && e.tag === "level_loader");

    // Load map + camera + player
    const prevPlayer = gameEngine.player || null;
    tileMap = new TileMap(gameEngine, ASSET_MANAGER);
    await tileMap.loadFromTiledTMJ(LEVELS[levelIndex]);

    // Debug proof of which level/map is loaded
    console.log("BUILD LEVEL:", levelIndex, "loaded:", LEVELS[levelIndex], "mapName:", tileMap?._map?.name);

    camera = new Camera(canvas.width, canvas.height, tileMap.WORLD_W, tileMap.WORLD_H);
    player = new Player(gameEngine, ASSET_MANAGER, tileMap, camera);
    gameEngine.player = player;

    // Keep health in sync across levels (carry over hp/maxHp from previous level)
    if (prevPlayer) {
      if (typeof prevPlayer.maxHp === "number") player.maxHp = prevPlayer.maxHp;
      if (typeof prevPlayer.hp === "number") player.hp = Math.min(prevPlayer.hp, player.maxHp);
    }

    // New Code
    // Expose map + camera for HUD/minimap usage without globals.
    gameEngine.tileMap = tileMap;
    gameEngine.camera = camera;

    // Objectives
    gameEngine.objectives = new ObjectiveManager(gameEngine, player);

    // --- Story Scroll ---
    // Only Level 1 should spawn the story scroll.
    let storyScroll = null;
    if (levelIndex === 0) {
      const scrollPoint = (tileMap.scrollSpawns || []).find((s) => s.name === "story_scroll");
      const scrollX = scrollPoint ? scrollPoint.x : player.x + 90;
      const scrollY = scrollPoint ? scrollPoint.y : player.y + 10;

      const storyLines = ["You wake in a cursed valley.", "Find the three keys and defeat the guardians."];

      storyScroll = new ScrollStoryPickup(gameEngine, ASSET_MANAGER, camera, player, scrollX, scrollY, {
        size: 90,
        radius: 80,
        storyLines
      });
    }

    let shopEntity = null;
    let npcEntity = null;
    let bossEntity = null;
    let bossEncounter = null;
    let arenaController = null;

    if (isBossLevel) {
      gameEngine.arenaStarted = false;

      const shopObj = tileMap.getObjectByName("shop_spawn");
      if (shopObj) {
        const shopX = shopObj.point ? shopObj.x : (shopObj.x + (shopObj.width || 0) / 2);
        const shopY = shopObj.point ? shopObj.y : (shopObj.y + (shopObj.height || 0) / 2);

        shopEntity = {
          tag: "shop_trigger",
          _eHeld: false,
          update: () => {
            if (!player) return;
            const dx = player.x - shopX;
            const dy = player.y - shopY;
            const dist = Math.hypot(dx, dy);
            const near = dist <= 90;

            if (near && !gameEngine.shopOpen) {
              gameEngine.contextHint = "Press E near the shop to buy upgrades";
              gameEngine.contextHintSource = "shop";
            } else if (!gameEngine.shopOpen && gameEngine.contextHintSource === "shop") {
              gameEngine.contextHint = "";
              gameEngine.contextHintSource = "";
            }

            const keys = gameEngine.keys || {};
            const eDown = keys["e"] || keys["E"];
            if (near && eDown && !shopEntity._eHeld) {
              if (gameEngine.shopOpen) closeShop();
              else openShop();
            }
            shopEntity._eHeld = !!eDown;
          },
          draw: () => {},
          removeFromWorld: false
        };
      }

      const npcObj = tileMap.getObjectByName("npc_spawn");
      if (npcObj) {
        const npcX = npcObj.point ? npcObj.x : (npcObj.x + (npcObj.width || 0) / 2);
        const npcY = npcObj.point ? npcObj.y : (npcObj.y + (npcObj.height || 0) / 2);
        npcEntity = new NPC(gameEngine, ASSET_MANAGER, tileMap, camera, player, npcX, npcY);
      }

      // ------------------------------
      // Phase A Boss Setup (foundation)
      // ------------------------------
      const pointFromObj = (o) => {
        if (!o) return null;
        const x = o.point ? o.x : (o.x + (o.width || 0) / 2);
        const y = o.point ? o.y : (o.y + (o.height || 0) / 2);
        return { x, y };
      };

      const rectFromObj = (o) => {
        if (!o) return null;
        if (o.point) {
          const size = tileMap.TILE_SIZE * 3;
          return { x: o.x - size / 2, y: o.y - size / 2, w: size, h: size };
        }
        return { x: o.x, y: o.y, w: o.width || tileMap.TILE_SIZE, h: o.height || tileMap.TILE_SIZE };
      };

      const bossSpawn = pointFromObj(tileMap.getObjectByName("boss_spawn"));
      const arenaCenter = pointFromObj(tileMap.getObjectByName("arena_center")) || bossSpawn;
      const arenaTrigger = rectFromObj(tileMap.getObjectByName("arena_trigger"));

      const enemySpawns = ["enemy_spawn_1", "enemy_spawn_2", "enemy_spawn_3"]
        .map((n) => pointFromObj(tileMap.getObjectByName(n)))
        .filter(Boolean);

      // Expose for later phases
      gameEngine.bossSpawns = {
        bossSpawn,
        arenaCenter,
        enemySpawns
      };

      // Boss entity (starts inactive/idle)
      if (bossSpawn) {
        bossEntity = new BossEnemy(gameEngine, ASSET_MANAGER, tileMap, camera, player, bossSpawn.x, bossSpawn.y, {
          roundHitTarget: 3,
          onRetreat: null
        });
      }

      // Phase B: Round 1 encounter controller
      if (bossEntity) {
        bossEncounter = new BossEncounter(gameEngine, ASSET_MANAGER, tileMap, camera, player, bossEntity);
      }

      // Arena trigger foundation
      let arenaStarted = false;
      let bossIntroDone = false;
      let bossLaughPlayed = false;

      arenaController = {
        tag: "arena_controller",
        update: () => {
          if (!player || !bossEntity) return;
          if (gameEngine.gameOver || gameEngine.win) return;

          // Start arena when player enters trigger (or near center if trigger missing)
          if (!arenaStarted) {
            let shouldStart = false;

            if (arenaTrigger) {
              const b = player.getCollisionAABBAt(player.x, player.y);
              const playerRect = { x: b.left, y: b.top, w: b.w, h: b.h };
              shouldStart =
                playerRect.x < arenaTrigger.x + arenaTrigger.w &&
                playerRect.x + playerRect.w > arenaTrigger.x &&
                playerRect.y < arenaTrigger.y + arenaTrigger.h &&
                playerRect.y + playerRect.h > arenaTrigger.y;
            } else if (arenaCenter) {
              const dx = player.x - arenaCenter.x;
              const dy = player.y - arenaCenter.y;
              shouldStart = Math.hypot(dx, dy) <= 180;
            }

            if (shouldStart) {
              arenaStarted = true;
              gameEngine.arenaStarted = true;
              gameEngine.contextHint = "Welcome to the arena. There's no leaving now.";
              gameEngine.contextHintSource = "arena";
              tileMap.activateBlockedColliders();
              tileMap.activateBlockedAreas();
            }
          }

          if (!arenaStarted) return;

          // Boss intro when player approaches boss area
          const center = arenaCenter || bossSpawn;
          if (center && !bossIntroDone) {
            const dx = player.x - center.x;
            const dy = player.y - center.y;
            const dist = Math.hypot(dx, dy);

            if (dist <= 160) {
              bossIntroDone = true;
              if (!bossLaughPlayed) {
                bossLaughPlayed = true;
                bossLaughSound.currentTime = 0;
                bossLaughSound.play().catch(() => {});
              }
              playBossDialogue([
                "So... you've made it this far.",
                "I was beginning to think the arena had gone soft.",
                "Come then. Show me whether your strength is real."
              ], () => {
                if (bossEncounter) bossEncounter.startEncounter();
              });
            }
          }
        },
        draw: () => {},
        removeFromWorld: false
      };
    }

    let guardsKey1 = [];
    let guardsKey2 = [];
    let guardsKey3 = [];

    let key1 = null;
    let key2 = null;
    let key3 = null;
    if (!isBossLevel) {
      const getKeyPoint = (name, fallbackX, fallbackY) => {
        const p = (tileMap.keySpawns || []).find((s) => s.name === name);
        return p ? { x: p.x, y: p.y } : { x: fallbackX, y: fallbackY };
      };

      const findSpawnNear = (center, radiusPx, tries = 60) => {
        for (let i = 0; i < tries; i++) {
          const ang = Math.random() * Math.PI * 2;
          const r = Math.random() * radiusPx;

          const x = center.x + Math.cos(ang) * r;
          const y = center.y + Math.sin(ang) * r;

          if (x < 0 || y < 0 || x >= tileMap.WORLD_W || y >= tileMap.WORLD_H) continue;
          if (tileMap.isBlockedAtWorld(x, y)) continue;

          return { x, y };
        }
        return { x: center.x, y: center.y };
      };

      const p1 = getKeyPoint("key1", tileMap.WORLD_W * 0.5, tileMap.WORLD_H * 0.15);
      const p2 = getKeyPoint("key2", tileMap.WORLD_W * 0.2, tileMap.WORLD_H * 0.8);
      const p3 = getKeyPoint("key3", tileMap.WORLD_W * 0.85, tileMap.WORLD_H * 0.7);

      const isMap2 = levelIndex === 1;
      const key1Type = isMap2 ? "enemy4" : "skeletonWhite";
      const key2Type = isMap2 ? "enemy5" : "zombie";
      const key3Type = isMap2 ? "enemy6" : "dragon";

      guardsKey1 = EnemyCreator.spawnMany(gameEngine, ASSET_MANAGER, tileMap, camera, player, [
        { type: key1Type, count: 3 }
      ]);
      guardsKey2 = EnemyCreator.spawnMany(gameEngine, ASSET_MANAGER, tileMap, camera, player, [
        { type: key2Type, count: 3 }
      ]);
      guardsKey3 = EnemyCreator.spawnMany(gameEngine, ASSET_MANAGER, tileMap, camera, player, [
        { type: key3Type, count: 2 }
      ]);

      for (const e of guardsKey1) {
        e.asleep = true;
        const s = findSpawnNear(p1, 140);
        e.x = s.x;
        e.y = s.y;
      }

      for (const e of guardsKey2) {
        e.asleep = true;
        const s = findSpawnNear(p2, 140);
        e.x = s.x;
        e.y = s.y;
      }

      for (const e of guardsKey3) {
        e.asleep = true;
        const s = findSpawnNear(p3, 140);
        e.x = s.x;
        e.y = s.y;
      }

      key1 = new KeyPickup(gameEngine, ASSET_MANAGER, camera, player, p1.x, p1.y, {
        size: 18,
        radius: 20,
        guardEnemies: guardsKey1,
        wakeRadius: 220
      });
      key1._keyName = "key1";

      key2 = new KeyPickup(gameEngine, ASSET_MANAGER, camera, player, p2.x, p2.y, {
        size: 18,
        radius: 20,
        guardEnemies: guardsKey2,
        wakeRadius: 220
      });
      key2._keyName = "key2";

      key3 = new KeyPickup(gameEngine, ASSET_MANAGER, camera, player, p3.x, p3.y, {
        size: 18,
        radius: 20,
        guardEnemies: guardsKey3,
        wakeRadius: 220
      });
      key3._keyName = "key3";
    }

    // =========================================================
    // ENTITY ADD ORDER (unchanged)
    // 1) enemies
    // 2) player
    // 3) storyScroll
    // 4) key1
    // 5) key2
    // 6) key3
    // 7) exit unlocker
    // 8) exit transporter
    // 9) HUD
    // 10) tilemap draw
    // =========================================================

    const enemies = [...guardsKey1, ...guardsKey2, ...guardsKey3];
    if (bossEntity) enemies.push(bossEntity);
    for (const e of enemies) gameEngine.addEntity(e);

    gameEngine.addEntity(player);
    if (storyScroll) gameEngine.addEntity(storyScroll);

    if (key1) gameEngine.addEntity(key1);
    if (key2) gameEngine.addEntity(key2);
    if (key3) gameEngine.addEntity(key3);

    if (shopEntity) gameEngine.addEntity(shopEntity);
    if (npcEntity) gameEngine.addEntity(npcEntity);
    if (arenaController) gameEngine.addEntity(arenaController);
    if (bossEncounter) gameEngine.addEntity(bossEncounter);

    // Exit Unlocker (same logic)
    gameEngine.addEntity({
      update: () => {
        if (gameEngine.gameOver || gameEngine.win) return;
        if (gameEngine.exitUnlocked) return;

        const keysOk = (gameEngine.keysCollected || 0) >= gameEngine.requiredKeys;
        const coinsLeft = (gameEngine.entities || []).filter(
          (ent) => ent && ent.tag === "pickup_coin" && !ent.removeFromWorld
        ).length;

        const enemiesLeft = (gameEngine.entities || []).filter(
          (ent) => ent && ent.tag === "enemy" && !ent.removeFromWorld
        ).length;

        if (keysOk && enemiesLeft === 0 && coinsLeft === 0) {
          gameEngine.exitUnlocked = true;
          console.log("Exit unlocked! Go to ExitPoint.");
        }
      },
      draw: () => {},
      removeFromWorld: false
    });

    // Exit Transporter (FIXED: request only once; do NOT touch currentLevelIndex here)
    gameEngine.addEntity({
      update: () => {
        if (gameEngine.gameOver || gameEngine.win) return;
        if (!gameEngine.exitUnlocked) return;

        // prevent spam while standing on exit
        if (gameEngine.loadingLevel) return;
        if (gameEngine.pendingLevelIndex !== null && gameEngine.pendingLevelIndex !== undefined) return;

        const exitRect = getExitRectFromMap(tileMap);
        if (!exitRect) return;

        const b = player.getCollisionAABBAt(player.x, player.y);
        const playerRect = { x: b.left, y: b.top, w: b.w, h: b.h };

        if (!aabbIntersect(playerRect, exitRect)) return;

        const nextIndex = gameEngine.currentLevelIndex + 1;

        if (nextIndex >= LEVELS.length) {
          gameEngine.triggerWin();
          return;
        }

        if (gameEngine.currentLevelIndex === 0 && nextIndex === 1) {
          localStorage.setItem("level1Completed", "true");
        }
        if (gameEngine.currentLevelIndex === 1 && nextIndex === 2) {
          localStorage.setItem("level2Completed", "true");
        }

        console.log("EXIT HIT -> requesting level", nextIndex, "path:", LEVELS[nextIndex]);

        // request load (safe)
        gameEngine.pendingLevelIndex = nextIndex;

        // lock immediately to avoid repeat hits same frame
        gameEngine.loadingLevel = true;
      },
      draw: () => {},
      removeFromWorld: false
    });

    // HUD
    const hud = new HUD(gameEngine, player);
    gameEngine.addEntity(hud);

    // Tile map draw hook
    const tilemapDrawEntity = {
      tag: "tilemap_draw",
      update: () => {},
      draw: (ctx) => tileMap.draw(ctx, camera),
      removeFromWorld: false
    };
    gameEngine.addEntity(tilemapDrawEntity);
  }

  // ------------------------------------
  // Level Loader (runs every tick, but only acts when pending)
  // ------------------------------------
  gameEngine.addEntity({
    tag: "level_loader",
    update: async () => {
      // allow loader to run if there IS a pending request
      if (
        gameEngine.loadingLevel &&
        (gameEngine.pendingLevelIndex === null || gameEngine.pendingLevelIndex === undefined)
      ) return;

      if (gameEngine.pendingLevelIndex === null || gameEngine.pendingLevelIndex === undefined) return;

      const nextIndex = gameEngine.pendingLevelIndex;
      gameEngine.pendingLevelIndex = null;

      // ensure lock is on during load
      gameEngine.loadingLevel = true;

      setTimeout(async () => {
        try {
          gameEngine.currentLevelIndex = nextIndex;
          await buildLevel(nextIndex);
        } finally {
          gameEngine.loadingLevel = false;
          canvas.focus();
        }
      }, 0);
    },
    draw: () => {},
    removeFromWorld: false
  });

  // ------------------------------------
  // Build initial level (Level 1)
  // ------------------------------------
  await buildLevel(gameEngine.currentLevelIndex);
});
