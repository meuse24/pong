import Phaser from "phaser";
import "./style.css";

const ui = {
  difficultySelect: document.getElementById("difficulty"),
  handednessSelect: document.getElementById("handedness"),
  winTargetInput: document.getElementById("win-target"),
  languageSelect: document.getElementById("language"),
  fullscreenSelect: document.getElementById("fullscreen"),
  menuToggle: document.getElementById("menu-toggle"),
  menuPanel: document.getElementById("menu-panel"),
  menuBackdrop: document.getElementById("menu-backdrop"),
  startScreen: document.getElementById("start-screen"),
  startButton: document.getElementById("start-button"),
  infoButton: document.getElementById("info-button"),
  infoScreen: document.getElementById("info-screen"),
  infoClose: document.getElementById("info-close"),
  rotateScreen: document.getElementById("orientation-lock"),
  rotateTry: document.getElementById("rotate-try"),
  winTargetLabel: document.getElementById("win-target-label"),
  gameOverScreen: document.getElementById("gameover-screen"),
  gameOverTitle: document.getElementById("gameover-title"),
  gameOverScore: document.getElementById("gameover-score"),
  gameOverButton: document.getElementById("gameover-button"),
};

const DIFFICULTIES = {
  easy: { reaction: 260, error: 80, speed: 320 },
  medium: { reaction: 170, error: 40, speed: 430 },
  hard: { reaction: 90, error: 16, speed: 560 },
};

const COLORS = {
  bg: 0x07080f,
  cyan: 0x4ef5ff,
  magenta: 0xff49c8,
  violet: 0x8a6cff,
  white: 0xf1fbff,
};

const TRANSLATIONS = {
  de: {
    difficulty: "KI-Schwierigkeit",
    difficultyEasy: "Einfach",
    difficultyMedium: "Mittel",
    difficultyHard: "Schwer",
    handedness: "Händigkeit",
    handednessRight: "Rechte Hand",
    handednessLeft: "Linke Hand",
    language: "Sprache",
    fullscreen: "Vollbild",
    fullscreenOn: "An",
    fullscreenOff: "Aus",
    rotateTitle: "Bitte drehen",
    rotateSubtitle: "Dieses Spiel laeuft im Querformat.",
    rotateTry: "Ich habe gedreht",
    rotateHint: "Aktiviere Bildschirmrotation, falls noetig.",
    powerPhaseReady: "Phase-Ball bereit",
    powerPhaseActive: "Phase-Ball aktiviert",
    powerShieldReady: "Pulse-Schild bereit",
    powerShieldUsed: "Pulse-Schild!",
    powerTurboReady: "Turbo-Serve bereit",
    powerGhostActive: "Ghost-Paddle aktiv",
    powerInvertActive: "Invert-Spin aktiv",
    powerMagnetReady: "Magnet-Fang bereit",
    powerMagnetActive: "Magnet-Fang!",
    powerDashActive: "Dash-Paddle aktiv",
    powerSlowFieldActive: "Slow-Field aktiv",
    powerLaserReady: "Laser-Serve bereit",
    powerBarrierActive: "Barrier-Core aktiv",
    playUntil: "Spiele bis",
    controlsHint: "W/S oder ↑/↓ · Maus bewegen · Touch ziehen",
    firstTo: "Zuerst bis",
    start: "Start",
    info: "Info",
    controlsAndTips: "Steuerung & Tipps",
    keyboard: "Tastatur",
    keyboardControls: "W/S oder ↑/↓",
    mouse: "Maus",
    mouseControls: "Vertikal folgen",
    touch: "Touch",
    touchControls: "Drag / Swipe",
    goal: "Ziel",
    goalDescription: "Zuerst bis X (im Menü)",
    back: "Zurück",
    playAgain: "Noch eine Runde",
    menuToggleLabel: "Einstellungen öffnen",
    brand: "NEON PONG",
    gameOver: "SPIEL VORBEI",
    infoFooter: "© 2026 meuse24 · Built with Codex · Lizenz: MIT",
    youWin: "DU GEWINNST",
    aiWins: "KI GEWINNT",
  },
  en: {
    difficulty: "AI Difficulty",
    difficultyEasy: "Easy",
    difficultyMedium: "Medium",
    difficultyHard: "Hard",
    handedness: "Handedness",
    handednessRight: "Right Hand",
    handednessLeft: "Left Hand",
    language: "Language",
    fullscreen: "Fullscreen",
    fullscreenOn: "On",
    fullscreenOff: "Off",
    rotateTitle: "Rotate device",
    rotateSubtitle: "This game is meant for landscape mode.",
    rotateTry: "I rotated",
    rotateHint: "Enable auto-rotate if needed.",
    powerPhaseReady: "Phase Ball ready",
    powerPhaseActive: "Phase Ball active",
    powerShieldReady: "Pulse Shield ready",
    powerShieldUsed: "Pulse Shield!",
    powerTurboReady: "Turbo Serve ready",
    powerGhostActive: "Ghost Paddle active",
    powerInvertActive: "Invert Spin active",
    powerMagnetReady: "Magnet Catch ready",
    powerMagnetActive: "Magnet Catch!",
    powerDashActive: "Dash Paddle active",
    powerSlowFieldActive: "Slow Field active",
    powerLaserReady: "Laser Serve ready",
    powerBarrierActive: "Barrier Core active",
    playUntil: "Play until",
    controlsHint: "W/S or ↑/↓ · Move mouse · Touch drag",
    firstTo: "First to",
    start: "Start",
    info: "Info",
    controlsAndTips: "Controls & Tips",
    keyboard: "Keyboard",
    keyboardControls: "W/S or ↑/↓",
    mouse: "Mouse",
    mouseControls: "Follow vertically",
    touch: "Touch",
    touchControls: "Drag / Swipe",
    goal: "Goal",
    goalDescription: "First to X (in menu)",
    back: "Back",
    playAgain: "Play Again",
    menuToggleLabel: "Open settings",
    brand: "NEON PONG",
    gameOver: "GAME OVER",
    infoFooter: "© 2026 meuse24 · Built with Codex · License: MIT",
    youWin: "YOU WIN",
    aiWins: "AI WINS",
  },
};

class PongScene extends Phaser.Scene {
  constructor() {
    super("PongScene");
    this.scoreLeft = 0;
    this.scoreRight = 0;
    this.ballActive = true;
    this.audioContext = null;
    this.audioUnlocked = false;
    this.noiseBuffer = null;
    this.audioUnlockBound = false;
    this.uiBound = false;
    this.menuOpen = false;
    this.winTarget = 5;
    this.gameState = "start";
    this.touchHandedness = "right";
    this.touchZoneWidth = 0;
    this.activeTouchId = null;
    this.lastPaddleHitAt = 0;
    this.lastPaddleHitPaddle = null;
    this.currentLanguage = "de";
    this.difficulty = "medium";
    this.fullscreenEnabled = true;
    this.serveTimer = null;
    this.orientationPaused = false;
    this.orientationQuery = null;
    this.sideState = {
      player: this.createSideState(),
      ai: this.createSideState(),
    };
    this.phaseOwner = null;
    this.phaseDisabledPaddle = null;
    this.wallTouchedSinceLastHit = false;
    this.rallyStartAt = 0;
    this.turboTimer = null;
    this.laserTimer = null;
    this.rallyWallTouched = false;
    this.rallyHitCount = 0;
    this.rallyHitStreakSide = null;
    this.rallyHitStreakCount = 0;
    this.rallyBarrierGranted = false;
    this.playerPaddleVelocity = 0;
    this.aiPaddleVelocity = 0;
    this.magnetPaddle = null;
    this.barrierSide = null;
    this.fxQuality = "high";
    this.fpsSmoothed = 60;
    this.lowFpsMs = 0;
    this.highFpsMs = 0;
    this.allowScreenShake = true;
  }

  createSideState() {
    return {
      phaseReady: false,
      phaseActive: false,
      phaseCooldownUntil: 0,
      phaseExpiresAt: 0,
      shieldActive: false,
      shieldCooldownUntil: 0,
      turboServeReady: false,
      turboCooldownUntil: 0,
      laserServeReady: false,
      laserCooldownUntil: 0,
      ghostActive: false,
      ghostUntil: 0,
      ghostCooldownUntil: 0,
      invertActive: false,
      invertUntil: 0,
      invertCooldownUntil: 0,
      dashActive: false,
      dashUntil: 0,
      dashCooldownUntil: 0,
      magnetReady: false,
      magnetActive: false,
      magnetCooldownUntil: 0,
      magnetReleaseAt: 0,
      slowFieldActive: false,
      slowFieldUntil: 0,
      slowFieldCooldownUntil: 0,
      barrierActive: false,
      barrierCooldownUntil: 0,
      barrierHitsRemaining: 0,
      barrierUntil: 0,
      concededStreak: 0,
      edgeDeflects: 0,
      noWallHitCount: 0,
      fastSaveCount: 0,
    };
  }

  getPlayerPhysicalSide() {
    return this.touchHandedness === "right" ? "right" : "left";
  }

  getAiPhysicalSide() {
    return this.getPlayerPhysicalSide() === "right" ? "left" : "right";
  }

  getOpponentSide(side) {
    return side === "player" ? "ai" : "player";
  }

  getSideByPaddle(paddle) {
    return paddle === this.playerPaddle ? "player" : "ai";
  }

  getScoreBySide(side) {
    return side === "player" ? this.scoreLeft : this.scoreRight;
  }

  getSideByDirection(direction) {
    const playerPhysical = this.getPlayerPhysicalSide();
    if (direction < 0) {
      return playerPhysical === "left" ? "player" : "ai";
    }
    return playerPhysical === "right" ? "player" : "ai";
  }

  hasActivePowerup(side) {
    const state = this.sideState[side];
    return (
      state.shieldActive ||
      state.ghostActive ||
      state.invertActive ||
      state.dashActive ||
      state.slowFieldActive ||
      state.magnetActive ||
      state.magnetReady ||
      state.barrierActive ||
      state.turboServeReady ||
      state.laserServeReady ||
      state.phaseReady ||
      (this.phaseOwner === side && state.phaseActive)
    );
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.bg);

    this.playerSpeedBase = 560;
    this.playerSpeed = this.playerSpeedBase;
    this.ballBaseSpeed = 430;

    this.arena = this.add.graphics().setDepth(0);
    this.midLine = this.add.graphics().setDepth(0);

    this.createPaddles();
    this.createBall();
    this.createScore();
    this.createFx();

    this.initUi();
    this.setupAudio();

    this.physics.add.collider(
      this.ball,
      this.playerPaddle,
      this.handlePaddleHit,
      null,
      this
    );
    this.physics.add.collider(
      this.ball,
      this.aiPaddle,
      this.handlePaddleHit,
      null,
      this
    );
    this.physics.add.collider(
      this.ball,
      this.barrierWall,
      this.handleBarrierHit,
      null,
      this
    );

    this.physics.world.on("worldbounds", this.handleWorldBounds, this);

    this.input.on("pointermove", this.handlePointer, this);
    this.input.on("pointerdown", this.handlePointer, this);
    this.input.on("pointerup", this.handlePointerUp, this);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys("W,S");

    this.scale.on("resize", this.onResize, this);
    this.onResize(this.scale.gameSize);

    this.holdBall();
    this.showStartScreen();
  }

  createFx() {
    if (!this.textures.exists("spark")) {
      const gfx = this.make.graphics({ x: 0, y: 0, add: false });
      gfx.fillStyle(0xffffff, 1);
      gfx.fillCircle(4, 4, 4);
      gfx.generateTexture("spark", 8, 8);
      gfx.destroy();
    }

    this.fxParticles = this.add.particles("spark").setDepth(4);

    this.phaseEmitter = this.fxParticles.createEmitter({
      follow: this.ball,
      speed: { min: 6, max: 22 },
      lifespan: { min: 220, max: 420 },
      scale: { start: 0.6, end: 0 },
      frequency: 40,
      tint: COLORS.cyan,
      blendMode: Phaser.BlendModes.ADD,
    });
    this.phaseEmitter.stop();

    this.turboEmitter = this.fxParticles.createEmitter({
      follow: this.ball,
      speed: { min: 18, max: 55 },
      lifespan: { min: 180, max: 300 },
      scale: { start: 0.7, end: 0 },
      frequency: 35,
      tint: COLORS.magenta,
      blendMode: Phaser.BlendModes.ADD,
    });
    this.turboEmitter.stop();

    this.laserEmitter = this.fxParticles.createEmitter({
      follow: this.ball,
      speed: { min: 12, max: 40 },
      lifespan: { min: 160, max: 260 },
      scale: { start: 0.55, end: 0 },
      frequency: 45,
      tint: COLORS.violet,
      blendMode: Phaser.BlendModes.ADD,
    });
    this.laserEmitter.stop();

    this.invertEmitter = this.fxParticles.createEmitter({
      follow: this.ball,
      speed: { min: 10, max: 32 },
      lifespan: { min: 200, max: 360 },
      scale: { start: 0.55, end: 0 },
      frequency: 45,
      tint: COLORS.violet,
      blendMode: Phaser.BlendModes.ADD,
    });
    this.invertEmitter.stop();

    this.toastText = this.add
      .text(0, 0, "", {
        fontFamily: "Oxanium, Segoe UI, sans-serif",
        fontSize: "16px",
        color: "#e9f6ff",
        letterSpacing: "2px",
      })
      .setDepth(60)
      .setOrigin(0.5, 0)
      .setAlpha(0);

    this.playerShieldGlow = this.add
      .rectangle(0, 0, 30, 120)
      .setStrokeStyle(2, COLORS.cyan, 0.85)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(3)
      .setVisible(false);

    this.aiShieldGlow = this.add
      .rectangle(0, 0, 30, 120)
      .setStrokeStyle(2, COLORS.magenta, 0.85)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(3)
      .setVisible(false);

    this.playerGhostGlow = this.add
      .rectangle(0, 0, 30, 120, COLORS.cyan, 0.15)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(1)
      .setVisible(false);

    this.aiGhostGlow = this.add
      .rectangle(0, 0, 30, 120, COLORS.magenta, 0.15)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(1)
      .setVisible(false);

    this.playerInvertGlow = this.add
      .rectangle(0, 0, 30, 120)
      .setStrokeStyle(2, COLORS.violet, 0.8)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(3)
      .setVisible(false);

    this.aiInvertGlow = this.add
      .rectangle(0, 0, 30, 120)
      .setStrokeStyle(2, COLORS.violet, 0.8)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(3)
      .setVisible(false);

    this.playerDashGlow = this.add
      .rectangle(0, 0, 30, 120)
      .setStrokeStyle(2, COLORS.cyan, 0.7)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(2)
      .setVisible(false);

    this.aiDashGlow = this.add
      .rectangle(0, 0, 30, 120)
      .setStrokeStyle(2, COLORS.magenta, 0.7)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(2)
      .setVisible(false);

    this.slowFieldPlayer = this.add
      .rectangle(0, 0, 10, 10, COLORS.cyan, 0.08)
      .setDepth(0)
      .setVisible(false);

    this.slowFieldAi = this.add
      .rectangle(0, 0, 10, 10, COLORS.magenta, 0.08)
      .setDepth(0)
      .setVisible(false);

    this.barrierWall = this.add
      .rectangle(0, 0, 10, 100, COLORS.violet, 0.25)
      .setDepth(2)
      .setVisible(false);
    this.physics.add.existing(this.barrierWall);
    this.barrierWall.body.setImmovable(true);
    this.barrierWall.body.setAllowGravity(false);
    this.barrierWall.body.setEnable(false);
  }

  createPaddles() {
    this.playerPaddle = this.add
      .rectangle(0, 0, 20, 120, COLORS.cyan)
      .setStrokeStyle(2, COLORS.cyan, 0.85)
      .setDepth(2);

    this.aiPaddle = this.add
      .rectangle(0, 0, 20, 120, COLORS.magenta)
      .setStrokeStyle(2, COLORS.magenta, 0.85)
      .setDepth(2);

    this.physics.add.existing(this.playerPaddle);
    this.physics.add.existing(this.aiPaddle);

    [this.playerPaddle, this.aiPaddle].forEach((paddle) => {
      paddle.body.setImmovable(true);
      paddle.body.setCollideWorldBounds(true);
      paddle.body.allowGravity = false;
    });

    this.pointerActive = false;
    this.pointerSource = "mouse";
    this.lastPointerTime = 0;
    this.aiNextDecision = 0;
    this.aiTargetY = 0;
    this.playerTargetY = 0;
  }

  createBall() {
    this.ballGlow = this.add
      .circle(0, 0, 18, COLORS.cyan, 0.18)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(1);

    this.ball = this.add
      .circle(0, 0, 8, COLORS.white)
      .setStrokeStyle(2, COLORS.cyan, 0.9)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(3);

    this.physics.add.existing(this.ball);

    this.ball.body.setAllowGravity(false);
    this.ball.body.setBounce(1, 1);
    this.ball.body.setMaxSpeed(920);
    this.ball.body.setCollideWorldBounds(true);
    this.ball.body.onWorldBounds = true;
  }

  createScore() {
    const scoreStyle = {
      fontFamily: "Oxanium, Segoe UI, sans-serif",
      fontSize: "28px",
      color: "#e9f6ff",
      letterSpacing: "6px",
    };

    this.scoreLeftText = this.add.text(0, 0, "0", scoreStyle).setOrigin(0.5, 0);
    this.scoreRightText = this.add
      .text(0, 0, "0", scoreStyle)
      .setOrigin(0.5, 0);
  }

  updateScore() {
    const isRightHanded = this.touchHandedness === "right";

    if (isRightHanded) {
      this.scoreRightText.setText(String(this.scoreLeft));
      this.scoreLeftText.setText(String(this.scoreRight));
    } else {
      this.scoreLeftText.setText(String(this.scoreLeft));
      this.scoreRightText.setText(String(this.scoreRight));
    }
  }

  updateScoreLayout() {
    const top = Math.max(18, this.bounds.height * 0.04);
    const offset = Math.max(70, this.bounds.width * 0.06);
    const isRightHanded = this.touchHandedness === "right";

    if (isRightHanded) {
      this.scoreRightText.setPosition(this.bounds.centerX + offset, top);
      this.scoreLeftText.setPosition(this.bounds.centerX - offset, top);
    } else {
      this.scoreLeftText.setPosition(this.bounds.centerX - offset, top);
      this.scoreRightText.setPosition(this.bounds.centerX + offset, top);
    }
  }

  showToast(message, color = "#e9f6ff") {
    if (!this.toastText) return;
    this.toastText.setText(message);
    this.toastText.setColor(color);
    this.toastText.setAlpha(0);
    this.tweens.add({
      targets: this.toastText,
      alpha: 1,
      duration: 180,
      yoyo: true,
      hold: 900,
      ease: "Sine.easeOut",
    });
  }

  setFxQuality(level) {
    if (this.fxQuality === level) return;
    this.fxQuality = level;
    this.allowScreenShake = level === "high";

    const isLow = level === "low";
    const phaseFreq = isLow ? 90 : 40;
    const turboFreq = isLow ? 110 : 35;
    const invertFreq = isLow ? 95 : 45;
    const laserFreq = isLow ? 120 : 45;

    this.phaseEmitter?.setFrequency(phaseFreq);
    this.turboEmitter?.setFrequency(turboFreq);
    this.invertEmitter?.setFrequency(invertFreq);
    this.laserEmitter?.setFrequency(laserFreq);

    const glowAlpha = isLow ? 0.12 : 0.18;
    if (this.ballGlow) {
      this.ballGlow.setAlpha(glowAlpha);
    }
    if (this.slowFieldPlayer) {
      this.slowFieldPlayer.setAlpha(isLow ? 0.05 : 0.08);
    }
    if (this.slowFieldAi) {
      this.slowFieldAi.setAlpha(isLow ? 0.05 : 0.08);
    }
  }

  updatePerformance(delta) {
    const fps = 1000 / Math.max(1, delta);
    this.fpsSmoothed = this.fpsSmoothed * 0.9 + fps * 0.1;

    if (this.fpsSmoothed < 45) {
      this.lowFpsMs += delta;
      this.highFpsMs = 0;
    } else if (this.fpsSmoothed > 55) {
      this.highFpsMs += delta;
      this.lowFpsMs = 0;
    } else {
      this.lowFpsMs = 0;
      this.highFpsMs = 0;
    }

    if (this.lowFpsMs > 1500) {
      this.setFxQuality("low");
    } else if (this.highFpsMs > 2500) {
      this.setFxQuality("high");
    }
  }

  getTranslation(key) {
    const translations = TRANSLATIONS[this.currentLanguage] || TRANSLATIONS.de;
    return translations[key] || key;
  }

  isMatchPoint(side) {
    return this.getScoreBySide(side) >= this.winTarget - 1;
  }

  startRally() {
    this.rallyStartAt = this.time.now;
    this.rallyWallTouched = false;
    this.rallyHitCount = 0;
    this.rallyHitStreakSide = null;
    this.rallyHitStreakCount = 0;
    this.rallyBarrierGranted = false;
  }

  updatePowerups(time) {
    const leftState = this.sideState.player;
    const rightState = this.sideState.ai;

    ["player", "ai"].forEach((side) => {
      const state = this.sideState[side];
      if (state.ghostActive && time > state.ghostUntil) {
        state.ghostActive = false;
        this.updatePaddleLayout();
      }
      if (state.invertActive && time > state.invertUntil) {
        state.invertActive = false;
      }
      if (state.phaseActive && time > state.phaseExpiresAt) {
        this.deactivatePhase();
      }
      if (state.dashActive && time > state.dashUntil) {
        state.dashActive = false;
      }
      if (state.slowFieldActive && time > state.slowFieldUntil) {
        state.slowFieldActive = false;
      }
      if (state.barrierActive && time > state.barrierUntil) {
        this.deactivateBarrier(side);
      }
    });

    this.updatePhaseState(time);
    this.updateMagnet(time);
    this.updateDashSpeeds();
    this.updateSlowField();
    this.updateEffectOverlays();

    if (this.invertEmitter) {
      if (leftState.invertActive || rightState.invertActive) {
        this.invertEmitter.start();
      } else {
        this.invertEmitter.stop();
      }
    }
  }

  updateEffectOverlays() {
    if (!this.playerPaddle || !this.aiPaddle) return;

    const playerState = this.sideState.player;
    const aiState = this.sideState.ai;

    if (this.playerShieldGlow) {
      this.playerShieldGlow.setVisible(playerState.shieldActive);
      this.playerShieldGlow.setPosition(this.playerPaddle.x, this.playerPaddle.y);
      this.playerShieldGlow.setSize(this.paddleWidth + 10, this.playerPaddleHeight + 14);
    }
    if (this.aiShieldGlow) {
      this.aiShieldGlow.setVisible(aiState.shieldActive);
      this.aiShieldGlow.setPosition(this.aiPaddle.x, this.aiPaddle.y);
      this.aiShieldGlow.setSize(this.paddleWidth + 10, this.aiPaddleHeight + 14);
    }

    if (this.playerGhostGlow) {
      this.playerGhostGlow.setVisible(playerState.ghostActive);
      this.playerGhostGlow.setPosition(this.playerPaddle.x, this.playerPaddle.y);
      this.playerGhostGlow.setSize(this.paddleWidth + 14, this.playerPaddleHeight + 18);
    }
    if (this.aiGhostGlow) {
      this.aiGhostGlow.setVisible(aiState.ghostActive);
      this.aiGhostGlow.setPosition(this.aiPaddle.x, this.aiPaddle.y);
      this.aiGhostGlow.setSize(this.paddleWidth + 14, this.aiPaddleHeight + 18);
    }

    if (this.playerInvertGlow) {
      this.playerInvertGlow.setVisible(playerState.invertActive);
      this.playerInvertGlow.setPosition(this.playerPaddle.x, this.playerPaddle.y);
      this.playerInvertGlow.setSize(this.paddleWidth + 12, this.playerPaddleHeight + 16);
    }
    if (this.aiInvertGlow) {
      this.aiInvertGlow.setVisible(aiState.invertActive);
      this.aiInvertGlow.setPosition(this.aiPaddle.x, this.aiPaddle.y);
      this.aiInvertGlow.setSize(this.paddleWidth + 12, this.aiPaddleHeight + 16);
    }

    if (this.playerDashGlow) {
      this.playerDashGlow.setVisible(playerState.dashActive);
      this.playerDashGlow.setPosition(this.playerPaddle.x, this.playerPaddle.y);
      this.playerDashGlow.setSize(this.paddleWidth + 16, this.playerPaddleHeight + 20);
    }
    if (this.aiDashGlow) {
      this.aiDashGlow.setVisible(aiState.dashActive);
      this.aiDashGlow.setPosition(this.aiPaddle.x, this.aiPaddle.y);
      this.aiDashGlow.setSize(this.paddleWidth + 16, this.aiPaddleHeight + 20);
    }

    if (this.slowFieldPlayer) {
      const playerPhysical = this.getPlayerPhysicalSide();
      const fieldWidth = this.bounds.width / 2;
      const x =
        playerPhysical === "left"
          ? this.bounds.offsetX + fieldWidth / 2
          : this.bounds.offsetX + fieldWidth + fieldWidth / 2;
      this.slowFieldPlayer.setVisible(playerState.slowFieldActive);
      this.slowFieldPlayer.setPosition(x, this.bounds.centerY);
      this.slowFieldPlayer.setSize(fieldWidth, this.bounds.height);
    }

    if (this.slowFieldAi) {
      const aiPhysical = this.getAiPhysicalSide();
      const fieldWidth = this.bounds.width / 2;
      const x =
        aiPhysical === "left"
          ? this.bounds.offsetX + fieldWidth / 2
          : this.bounds.offsetX + fieldWidth + fieldWidth / 2;
      this.slowFieldAi.setVisible(aiState.slowFieldActive);
      this.slowFieldAi.setPosition(x, this.bounds.centerY);
      this.slowFieldAi.setSize(fieldWidth, this.bounds.height);
    }

    if (this.barrierWall) {
      if (this.barrierWall.body?.enable) {
        const isLeft = this.barrierSide === "left";
        const x = isLeft
          ? this.bounds.offsetX + this.bounds.width * 0.28
          : this.bounds.offsetX + this.bounds.width * 0.72;
        this.barrierWall.setPosition(x, this.bounds.centerY);
        this.barrierWall.setSize(this.paddleWidth + 4, this.bounds.height * 0.3);
        this.barrierWall.body.setSize(
          this.paddleWidth + 4,
          this.bounds.height * 0.3,
          true
        );
      }
    }
  }

  updateDashSpeeds() {
    const playerState = this.sideState.player;
    const aiState = this.sideState.ai;
    this.playerSpeed = this.playerSpeedBase * (playerState.dashActive ? 1.35 : 1);
    this.aiSpeed = this.aiSpeedBase * (aiState.dashActive ? 1.35 : 1);
  }

  updateSlowField() {
    if (!this.ballActive) return;
    const playerState = this.sideState.player;
    const aiState = this.sideState.ai;

    const ball = this.ball;
    const speed = ball.body.speed;
    if (speed <= 0) return;

    const playerPhysical = this.getPlayerPhysicalSide();
    const ballOnLeft = ball.x < this.bounds.offsetX + this.bounds.width / 2;
    const ballOnPlayerHalf =
      (playerPhysical === "left" && ballOnLeft) ||
      (playerPhysical === "right" && !ballOnLeft);

    let targetSpeed = null;
    if (playerState.slowFieldActive && ballOnPlayerHalf) {
      targetSpeed = this.ballBaseSpeed * 0.8;
    }

    const aiPhysical = this.getAiPhysicalSide();
    const ballOnAiHalf =
      (aiPhysical === "left" && ballOnLeft) ||
      (aiPhysical === "right" && !ballOnLeft);
    if (aiState.slowFieldActive && ballOnAiHalf) {
      targetSpeed = this.ballBaseSpeed * 0.8;
    }

    if (targetSpeed !== null && speed > targetSpeed) {
      const newSpeed = Phaser.Math.Linear(speed, targetSpeed, 0.05);
      const scale = newSpeed / speed;
      ball.body.setVelocity(ball.body.velocity.x * scale, ball.body.velocity.y * scale);
    }
  }

  updateMagnet(time) {
    const playerState = this.sideState.player;
    const aiState = this.sideState.ai;
    const magnetSide = playerState.magnetActive
      ? "player"
      : aiState.magnetActive
        ? "ai"
        : null;

    if (!magnetSide) return;

    const paddle =
      magnetSide === "player" ? this.playerPaddle : this.aiPaddle;
    const paddleHeight =
      magnetSide === "player" ? this.playerPaddleHeight : this.aiPaddleHeight;
    const dir = this.getBallDirectionForPaddle(paddle);

    this.ball.setPosition(
      paddle.x + dir * (this.paddleWidth / 2 + this.ballRadius + 2),
      paddle.y
    );

    if (time < this.sideState[magnetSide].magnetReleaseAt) {
      return;
    }

    this.sideState[magnetSide].magnetActive = false;
    this.ball.body.moves = true;

    const velocity =
      magnetSide === "player" ? this.playerPaddleVelocity : this.aiPaddleVelocity;
    const maxVy = this.ballBaseSpeed * 0.85;
    const finalVy = Phaser.Math.Clamp(velocity * 0.7, -maxVy, maxVy);
    const speed = Phaser.Math.Clamp(
      this.ballBaseSpeed * 1.05,
      this.ballBaseSpeed,
      960
    );
    const finalVx = Math.sqrt(speed * speed - finalVy * finalVy) * dir;

    this.ball.body.setVelocity(finalVx, finalVy);
    this.ball.setStrokeStyle(
      2,
      magnetSide === "player" ? COLORS.cyan : COLORS.magenta,
      0.95
    );
    this.startRally();
  }

  handlePowerupTriggersOnHit(side, ball, paddle) {
    if (this.gameState !== "playing") {
      return;
    }
    const now = this.time.now;
    const state = this.sideState[side];

    this.recordRallyHit(side, now, ball);

    if (this.wallTouchedSinceLastHit) {
      this.wallTouchedSinceLastHit = false;
      this.sideState.player.noWallHitCount = 0;
      this.sideState.ai.noWallHitCount = 0;
    }

    if (state.phaseReady && !state.phaseActive) {
      this.activatePhase(side);
      state.phaseReady = false;
    }

    state.noWallHitCount += 1;
    if (
      state.noWallHitCount >= 3 &&
      now >= state.phaseCooldownUntil &&
      !state.phaseReady &&
      !state.phaseActive &&
      !this.phaseOwner &&
      !this.hasActivePowerup(side)
    ) {
      state.phaseReady = true;
      state.phaseCooldownUntil = now + 12000;
      this.showToast(this.getTranslation("powerPhaseReady"), "#7ff7ff");
    }

    const height = this.bounds.height;
    const edgeThreshold = height * 0.15;
    if (ball.y < edgeThreshold || ball.y > height - edgeThreshold) {
      state.edgeDeflects += 1;
      if (
        state.edgeDeflects >= 5 &&
        now >= state.ghostCooldownUntil &&
        !state.ghostActive &&
        !this.hasActivePowerup(side)
      ) {
        this.activateGhost(side);
      }
    }

    const paddleHeight =
      paddle === this.playerPaddle ? this.playerPaddleHeight : this.aiPaddleHeight;
    const diff = Math.abs((ball.y - paddle.y) / (paddleHeight / 2));
    if (
      diff > 0.7 &&
      now >= state.invertCooldownUntil &&
      !state.invertActive &&
      !this.hasActivePowerup(side) &&
      !this.isMatchPoint(side)
    ) {
      this.activateInvert(side);
    }
  }

  activatePhase(side) {
    const state = this.sideState[side];
    if (state.phaseActive || this.phaseOwner) return;
    state.phaseActive = true;
    this.phaseOwner = side;
    state.phaseExpiresAt = this.time.now + 8000;
    this.phaseEmitter?.start();
    this.ball.setStrokeStyle(2, COLORS.cyan, 0.95);
    this.showToast(this.getTranslation("powerPhaseActive"), "#7ff7ff");
  }

  deactivatePhase() {
    if (this.phaseOwner) {
      this.sideState[this.phaseOwner].phaseActive = false;
    }
    if (this.phaseDisabledPaddle?.body) {
      this.phaseDisabledPaddle.body.checkCollision.none = false;
    }
    this.phaseDisabledPaddle = null;
    this.phaseOwner = null;
    this.phaseEmitter?.stop();
  }

  updatePhaseState(time) {
    if (!this.phaseOwner) return;
    const owner = this.phaseOwner;
    const opponent = this.getOpponentSide(owner);
    const opponentPaddle = opponent === "player" ? this.playerPaddle : this.aiPaddle;

    if (!opponentPaddle?.body) return;
    opponentPaddle.body.checkCollision.none = true;
    this.phaseDisabledPaddle = opponentPaddle;

    const vx = this.ball.body.velocity.x;
    const passDistance = this.paddleWidth / 2 + this.ballRadius + 6;
    if (
      (vx < 0 && this.ball.x < opponentPaddle.x - passDistance) ||
      (vx > 0 && this.ball.x > opponentPaddle.x + passDistance) ||
      time > this.sideState[owner].phaseExpiresAt
    ) {
      this.deactivatePhase();
    }
  }

  activateGhost(side) {
    const state = this.sideState[side];
    state.ghostActive = true;
    state.ghostUntil = this.time.now + 6000;
    state.ghostCooldownUntil = this.time.now + 14000;
    state.edgeDeflects = 0;
    this.updatePaddleLayout();
    this.showToast(this.getTranslation("powerGhostActive"), "#7ff7ff");
  }

  activateInvert(side) {
    const state = this.sideState[side];
    state.invertActive = true;
    state.invertUntil = this.time.now + 4000;
    state.invertCooldownUntil = this.time.now + 10000;
    this.showToast(this.getTranslation("powerInvertActive"), "#b8a2ff");
    this.invertEmitter?.start();
  }

  activateShield(side) {
    const state = this.sideState[side];
    state.shieldActive = true;
    state.shieldCooldownUntil = this.time.now + 15000;
    this.showToast(this.getTranslation("powerShieldReady"), "#7ff7ff");
  }

  triggerShield(side) {
    const state = this.sideState[side];
    if (!state.shieldActive) return false;
    state.shieldActive = false;

    const physicalSide =
      side === "player" ? this.getPlayerPhysicalSide() : this.getAiPhysicalSide();
    const direction = physicalSide === "left" ? 1 : -1;
    const angle = Phaser.Math.DegToRad(Phaser.Math.Between(-30, 30));
    const speed = this.ballBaseSpeed * 1.05;
    const goalX =
      physicalSide === "left"
        ? this.bounds.offsetX + this.ballRadius * 2
        : this.bounds.offsetX + this.bounds.width - this.ballRadius * 2;

    this.ball.setPosition(goalX, this.bounds.centerY);
    this.ball.body.setVelocity(
      Math.cos(angle) * speed * direction,
      Math.sin(angle) * speed
    );

    this.spawnShieldBurst(physicalSide);
    this.showToast(this.getTranslation("powerShieldUsed"), "#7ff7ff");
    this.playImpactSound("wall");
    this.startRally();
    return true;
  }

  spawnShieldBurst(side) {
    const x =
      side === "left"
        ? this.bounds.offsetX + this.ballRadius * 3
        : this.bounds.offsetX + this.bounds.width - this.ballRadius * 3;
    const ring = this.add
      .circle(x, this.bounds.centerY, 20)
      .setStrokeStyle(2, side === "left" ? COLORS.cyan : COLORS.magenta, 0.9)
      .setDepth(5)
      .setBlendMode(Phaser.BlendModes.ADD);

    this.tweens.add({
      targets: ring,
      scale: 3,
      alpha: 0,
      duration: 420,
      ease: "Sine.easeOut",
      onComplete: () => ring.destroy(),
    });
  }

  grantTurboServe(side) {
    const state = this.sideState[side];
    if (this.time.now < state.turboCooldownUntil) return;
    if (state.laserServeReady || state.turboServeReady) return;
    state.turboServeReady = true;
    state.turboCooldownUntil = this.time.now + 8000;
    this.showToast(this.getTranslation("powerTurboReady"), "#ff91e6");
  }

  grantLaserServe(side) {
    const state = this.sideState[side];
    if (this.time.now < state.laserCooldownUntil) return;
    if (state.laserServeReady || state.turboServeReady) return;
    state.laserServeReady = true;
    state.laserCooldownUntil = this.time.now + 10000;
    this.showToast(this.getTranslation("powerLaserReady"), "#c7b7ff");
  }

  applyServeModifiers(direction) {
    const serveSide = this.getSideByDirection(direction);
    const state = this.sideState[serveSide];
    const base = this.ballBaseSpeed;
    let speed = base;
    let angleRange = { min: -40, max: 40 };

    if (state.laserServeReady) {
      state.laserServeReady = false;
      speed = base * 1.2;
      angleRange = { min: -12, max: 12 };
      this.startServeFx("laser", 800);
    } else if (state.turboServeReady) {
      state.turboServeReady = false;
      speed = base * 1.3;
      this.startServeFx("turbo", 1000);
    }

    return { speed, angleRange };
  }

  startServeFx(type, duration) {
    const emitter = type === "laser" ? this.laserEmitter : this.turboEmitter;
    if (!emitter) return;
    emitter.start();
    if (this.turboTimer) {
      this.turboTimer.remove(false);
    }
    this.turboTimer = this.time.delayedCall(duration, () => {
      emitter.stop();
      this.turboTimer = null;
      if (this.ball.body.speed > this.ballBaseSpeed) {
        const scale = this.ballBaseSpeed / this.ball.body.speed;
        this.ball.body.setVelocity(
          this.ball.body.velocity.x * scale,
          this.ball.body.velocity.y * scale
        );
      }
    });
  }

  recordRallyHit(side, now, ball) {
    this.rallyHitCount += 1;
    if (this.rallyHitStreakSide === side) {
      this.rallyHitStreakCount += 1;
    } else {
      this.rallyHitStreakSide = side;
      this.rallyHitStreakCount = 1;
    }

    const state = this.sideState[side];
    const opponent = this.getOpponentSide(side);
    const scoreDiff = this.getScoreBySide(side) - this.getScoreBySide(opponent);

    if (
      this.rallyHitStreakCount >= 4 &&
      now >= state.magnetCooldownUntil &&
      !state.magnetReady &&
      !state.magnetActive &&
      Math.abs(scoreDiff) <= 1 &&
      !this.hasActivePowerup(side)
    ) {
      state.magnetReady = true;
      state.magnetCooldownUntil = now + 14000;
      this.showToast(this.getTranslation("powerMagnetReady"), "#9fd6ff");
    }

    if (this.rallyHitCount >= 8 && !this.rallyBarrierGranted) {
      const trailing =
        scoreDiff === 0 ? null : scoreDiff < 0 ? side : opponent;
      if (trailing && !this.hasActivePowerup(trailing)) {
        this.activateBarrier(trailing);
        this.rallyBarrierGranted = true;
      }
    }

    const fast = ball.body.speed >= this.ballBaseSpeed * 1.15;
    if (fast) {
      state.fastSaveCount += 1;
      if (
        state.fastSaveCount >= 3 &&
        now >= state.dashCooldownUntil &&
        !state.dashActive &&
        !this.hasActivePowerup(side)
      ) {
        this.activateDash(side);
      }
    } else {
      state.fastSaveCount = 0;
    }

    if (
      fast &&
      scoreDiff <= -2 &&
      now >= state.slowFieldCooldownUntil &&
      !state.slowFieldActive &&
      !this.hasActivePowerup(side)
    ) {
      this.activateSlowField(side);
    }
  }

  tryActivateMagnet(side, paddle) {
    const state = this.sideState[side];
    if (!state.magnetReady || state.magnetActive) return false;
    state.magnetReady = false;
    state.magnetActive = true;
    state.magnetReleaseAt = this.time.now + 260;
    this.ball.body.setVelocity(0, 0);
    this.ball.body.moves = false;
    this.magnetPaddle = paddle;
    this.showToast(this.getTranslation("powerMagnetActive"), "#9fd6ff");
    return true;
  }

  activateDash(side) {
    const state = this.sideState[side];
    state.dashActive = true;
    state.dashUntil = this.time.now + 5000;
    state.dashCooldownUntil = this.time.now + 12000;
    state.fastSaveCount = 0;
    this.showToast(this.getTranslation("powerDashActive"), "#7ff7ff");
  }

  activateSlowField(side) {
    const state = this.sideState[side];
    state.slowFieldActive = true;
    state.slowFieldUntil = this.time.now + 3200;
    state.slowFieldCooldownUntil = this.time.now + 16000;
    this.showToast(this.getTranslation("powerSlowFieldActive"), "#7cc7ff");
  }

  activateBarrier(side) {
    const state = this.sideState[side];
    if (this.time.now < state.barrierCooldownUntil) return;
    state.barrierActive = true;
    state.barrierHitsRemaining = 1;
    state.barrierUntil = this.time.now + 4500;
    state.barrierCooldownUntil = this.time.now + 16000;
    const physical =
      side === "player" ? this.getPlayerPhysicalSide() : this.getAiPhysicalSide();
    this.barrierSide = physical;
    this.barrierWall.setVisible(true);
    this.barrierWall.body.setEnable(true);
    this.updateEffectOverlays();
    this.showToast(this.getTranslation("powerBarrierActive"), "#caa9ff");
  }

  deactivateBarrier(side) {
    const state = this.sideState[side];
    state.barrierActive = false;
    state.barrierHitsRemaining = 0;
    this.barrierSide = null;
    if (this.barrierWall) {
      this.barrierWall.setVisible(false);
      this.barrierWall.body.setEnable(false);
    }
  }

  handleBarrierHit() {
    if (!this.barrierSide) return;
    const side =
      this.barrierSide === this.getPlayerPhysicalSide() ? "player" : "ai";
    const state = this.sideState[side];
    if (!state.barrierActive) return;

    state.barrierHitsRemaining -= 1;
    this.spawnShieldBurst(this.barrierSide);
    this.playImpactSound("wall");
    this.wallTouchedSinceLastHit = true;
    this.rallyWallTouched = true;
    if (state.barrierHitsRemaining <= 0) {
      this.deactivateBarrier(side);
    }
  }

  resetPowerups() {
    this.deactivatePhase();
    this.deactivateBarrier("player");
    this.deactivateBarrier("ai");
    this.magnetPaddle = null;
    if (this.ball?.body) {
      this.ball.body.moves = true;
    }
    ["player", "ai"].forEach((side) => {
      const state = this.sideState[side];
      state.phaseReady = false;
      state.phaseActive = false;
      state.phaseCooldownUntil = 0;
      state.phaseExpiresAt = 0;
      state.shieldActive = false;
      state.shieldCooldownUntil = 0;
      state.turboServeReady = false;
      state.turboCooldownUntil = 0;
      state.laserServeReady = false;
      state.laserCooldownUntil = 0;
      state.ghostActive = false;
      state.ghostUntil = 0;
      state.ghostCooldownUntil = 0;
      state.invertActive = false;
      state.invertUntil = 0;
      state.invertCooldownUntil = 0;
      state.dashActive = false;
      state.dashUntil = 0;
      state.dashCooldownUntil = 0;
      state.magnetReady = false;
      state.magnetActive = false;
      state.magnetCooldownUntil = 0;
      state.magnetReleaseAt = 0;
      state.slowFieldActive = false;
      state.slowFieldUntil = 0;
      state.slowFieldCooldownUntil = 0;
      state.barrierActive = false;
      state.barrierCooldownUntil = 0;
      state.barrierHitsRemaining = 0;
      state.barrierUntil = 0;
      state.concededStreak = 0;
      state.edgeDeflects = 0;
      state.noWallHitCount = 0;
      state.fastSaveCount = 0;
    });
    this.updatePaddleLayout();
    this.updateEffectOverlays();
    this.phaseEmitter?.stop();
    this.turboEmitter?.stop();
    this.invertEmitter?.stop();
    this.laserEmitter?.stop();
  }

  handlePoint(scoringSide, goalSound, serveDirection) {
    const concedingSide = this.getOpponentSide(scoringSide);

    if (this.triggerShield(concedingSide)) {
      this.sideState[concedingSide].concededStreak = 0;
      return;
    }

    const rallyDuration = this.time.now - this.rallyStartAt;
    if (!this.hasActivePowerup(scoringSide)) {
      if (rallyDuration > 0 && rallyDuration < 4000) {
        this.grantTurboServe(scoringSide);
      }
      if (!this.rallyWallTouched) {
        this.grantLaserServe(scoringSide);
      }
    }

    this.sideState[scoringSide].concededStreak = 0;
    const concedingState = this.sideState[concedingSide];
    concedingState.concededStreak += 1;

    if (
      concedingState.concededStreak >= 2 &&
      this.time.now >= concedingState.shieldCooldownUntil &&
      !concedingState.shieldActive &&
      !this.hasActivePowerup(concedingSide)
    ) {
      this.activateShield(concedingSide);
      concedingState.concededStreak = 0;
    }

    this.wallTouchedSinceLastHit = false;
    this.rallyWallTouched = false;
    this.sideState.player.noWallHitCount = 0;
    this.sideState.ai.noWallHitCount = 0;
    this.sideState.player.edgeDeflects = 0;
    this.sideState.ai.edgeDeflects = 0;
    this.sideState.player.fastSaveCount = 0;
    this.sideState.ai.fastSaveCount = 0;

    if (scoringSide === "player") {
      this.scoreLeft += 1;
    } else {
      this.scoreRight += 1;
    }
    this.updateScore();
    this.playGoalSound(goalSound);
    if (this.allowScreenShake) {
      this.cameras.main.shake(140, 0.006);
      this.cameras.main.flash(120, 60, 20, 120);
    }

    if (scoringSide === "player") {
      if (this.scoreLeft >= this.winTarget) {
        this.endMatch("left");
        return;
      }
    } else if (this.scoreRight >= this.winTarget) {
      this.endMatch("right");
      return;
    }

    this.scheduleServe(serveDirection);
  }

  setDifficulty(name) {
    const key = DIFFICULTIES[name] ? name : "medium";
    this.aiConfig = DIFFICULTIES[key];
    this.difficulty = key;
    this.aiSpeedBase = this.aiConfig.speed;
    this.aiSpeed = this.aiSpeedBase;
  }

  setFullscreenEnabled(enabled) {
    this.fullscreenEnabled = Boolean(enabled);
    localStorage.setItem("pong-fullscreen", this.fullscreenEnabled ? "on" : "off");
    if (ui.fullscreenSelect) {
      ui.fullscreenSelect.value = this.fullscreenEnabled ? "on" : "off";
    }
    if (!this.fullscreenEnabled && document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch((err) => {
        console.warn("Exit fullscreen failed:", err);
      });
    }
    if (
      this.fullscreenEnabled &&
      this.gameState === "playing" &&
      !document.fullscreenElement &&
      document.documentElement.requestFullscreen
    ) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn("Fullscreen request failed:", err);
      });
    }
  }

  setGameplaySettingsEnabled(enabled) {
    const locked = !enabled;
    [ui.difficultySelect, ui.handednessSelect, ui.winTargetInput].forEach(
      (element) => {
        if (element) {
          element.disabled = locked;
        }
      }
    );
  }

  syncGameplaySettingsUi() {
    if (ui.difficultySelect) {
      ui.difficultySelect.value = this.difficulty || "medium";
    }
    if (ui.handednessSelect) {
      ui.handednessSelect.value = this.touchHandedness === "left" ? "left" : "right";
    }
    if (ui.winTargetInput) {
      ui.winTargetInput.value = String(this.winTarget);
    }
    this.updateWinTargetLabels();
  }

  isPortraitMode() {
    if (this.orientationQuery) {
      return this.orientationQuery.matches;
    }
    return window.innerHeight > window.innerWidth;
  }

  updateOrientationState() {
    const isPortrait = this.isPortraitMode();
    if (ui.rotateScreen) {
      ui.rotateScreen.classList.toggle("visible", isPortrait);
    }
    if (isPortrait) {
      this.setMenuOpen(false);
      if (this.gameState === "playing" && !this.orientationPaused) {
        this.orientationPaused = true;
        this.physics.world.pause();
        this.scene.pause();
      }
      return;
    }

    if (this.orientationPaused) {
      this.orientationPaused = false;
      this.scene.resume();
      this.physics.world.resume();
    }
  }

  async requestOrientationLock() {
    if (!screen.orientation?.lock) {
      return;
    }
    try {
      await screen.orientation.lock("landscape");
    } catch (err) {
      console.warn("Orientation lock failed:", err);
    }
  }

  setLanguage(lang) {
    this.currentLanguage = lang;
    localStorage.setItem("pong-language", lang);
    this.updateLanguage();
  }

  updateLanguage() {
    const translations = TRANSLATIONS[this.currentLanguage] || TRANSLATIONS.de;

    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.getAttribute("data-i18n");
      if (translations[key]) {
        element.textContent = translations[key];
      }
    });

    document.querySelectorAll("[data-i18n-aria]").forEach((element) => {
      const key = element.getAttribute("data-i18n-aria");
      if (translations[key]) {
        element.setAttribute("aria-label", translations[key]);
      }
    });

    if (ui.languageSelect) {
      ui.languageSelect.value = this.currentLanguage;
    }

    if (this.gameState === "gameover") {
      const winner = this.scoreLeft >= this.winTarget ? "left" : "right";
      if (ui.gameOverTitle) {
        ui.gameOverTitle.textContent =
          winner === "left" ? translations.youWin : translations.aiWins;
      }
    }
  }

  initUi() {
    if (this.uiBound) return;
    this.uiBound = true;

    const savedLanguage = localStorage.getItem("pong-language") || "de";
    this.currentLanguage = savedLanguage;
    if (ui.languageSelect) {
      ui.languageSelect.value = savedLanguage;
    }
    this.updateLanguage();

    const savedFullscreen = localStorage.getItem("pong-fullscreen");
    this.fullscreenEnabled = savedFullscreen ? savedFullscreen !== "off" : true;
    if (ui.fullscreenSelect) {
      ui.fullscreenSelect.value = this.fullscreenEnabled ? "on" : "off";
    }

    this.setDifficulty(ui.difficultySelect?.value || "medium");
    this.touchHandedness = ui.handednessSelect?.value || "right";
    this.winTarget = this.readWinTarget();
    this.updateWinTargetLabels();
    this.setGameplaySettingsEnabled(true);

    ui.difficultySelect?.addEventListener("change", (event) => {
      if (this.gameState === "playing") {
        this.syncGameplaySettingsUi();
        return;
      }
      this.setDifficulty(event.target.value);
    });

    ui.winTargetInput?.addEventListener("change", () => {
      if (this.gameState === "playing") {
        this.syncGameplaySettingsUi();
        return;
      }
      this.winTarget = this.readWinTarget();
      this.updateWinTargetLabels();
      this.checkWinTarget();
    });

    ui.handednessSelect?.addEventListener("change", (event) => {
      if (this.gameState === "playing") {
        this.syncGameplaySettingsUi();
        return;
      }
      this.touchHandedness = event.target.value === "left" ? "left" : "right";
      this.onResize(this.scale.gameSize);
      this.updateScore();
    });

    ui.languageSelect?.addEventListener("change", (event) => {
      this.setLanguage(event.target.value);
    });

    ui.fullscreenSelect?.addEventListener("change", (event) => {
      this.setFullscreenEnabled(event.target.value !== "off");
    });

    ui.rotateTry?.addEventListener("click", () => {
      this.requestOrientationLock();
      this.updateOrientationState();
    });

    ui.startButton?.addEventListener("click", () => this.startMatch());
    ui.gameOverButton?.addEventListener("click", () => this.startMatch());
    ui.infoButton?.addEventListener("click", () => this.showInfoScreen());
    ui.infoClose?.addEventListener("click", () => this.hideInfoScreen());

    ui.menuToggle?.addEventListener("click", () =>
      this.setMenuOpen(!this.menuOpen)
    );
    ui.menuBackdrop?.addEventListener("click", () => this.setMenuOpen(false));

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        this.setMenuOpen(false);
        this.hideInfoScreen();
      }
      if (event.key === "Enter" && this.gameState !== "playing") {
        this.startMatch();
      }
    });

    this.orientationQuery =
      window.matchMedia?.("(orientation: portrait)") || null;
    if (this.orientationQuery?.addEventListener) {
      this.orientationQuery.addEventListener("change", () =>
        this.updateOrientationState()
      );
    } else if (this.orientationQuery?.addListener) {
      this.orientationQuery.addListener(() => this.updateOrientationState());
    }
    window.addEventListener("resize", () => this.updateOrientationState());
    this.updateOrientationState();
  }

  readWinTarget() {
    if (!ui.winTargetInput) return 5;
    const raw = parseInt(ui.winTargetInput.value, 10);
    const safe = Number.isFinite(raw) ? Phaser.Math.Clamp(raw, 1, 15) : 5;
    ui.winTargetInput.value = String(safe);
    return safe;
  }

  updateWinTargetLabels() {
    if (ui.winTargetLabel) {
      ui.winTargetLabel.textContent = String(this.winTarget);
    }
  }

  setMenuOpen(open) {
    this.menuOpen = open;
    ui.menuPanel?.classList.toggle("open", open);
    ui.menuBackdrop?.classList.toggle("visible", open);
    ui.menuToggle?.setAttribute("aria-expanded", open ? "true" : "false");
  }

  showStartScreen() {
    ui.startScreen?.classList.add("visible");
  }

  hideStartScreen() {
    ui.startScreen?.classList.remove("visible");
  }

  showGameOverScreen(winner) {
    const translations = TRANSLATIONS[this.currentLanguage] || TRANSLATIONS.de;
    if (ui.gameOverTitle) {
      ui.gameOverTitle.textContent =
        winner === "left" ? translations.youWin : translations.aiWins;
    }
    if (ui.gameOverScore) {
      ui.gameOverScore.textContent = `${this.scoreLeft} : ${this.scoreRight}`;
    }
    ui.gameOverScreen?.classList.add("visible");
  }

  hideGameOverScreen() {
    ui.gameOverScreen?.classList.remove("visible");
  }

  showInfoScreen() {
    ui.infoScreen?.classList.add("visible");
  }

  hideInfoScreen() {
    ui.infoScreen?.classList.remove("visible");
  }

  setupAudio() {
    if (this.audioUnlockBound) return;
    this.audioUnlockBound = true;

    const enableAudio = async () => {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.audioContext) {
        this.audioContext = new AudioCtx();
      }
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }
      this.audioUnlocked = true;
      this.createNoiseBuffer();
    };

    this.input.once("pointerdown", enableAudio);
    this.input.once("pointerup", enableAudio);
    if (this.input.keyboard) {
      this.input.keyboard.once("keydown", enableAudio);
    }

    window.addEventListener("pointerdown", enableAudio, { once: true });
    window.addEventListener("touchstart", enableAudio, { once: true, passive: true });
    window.addEventListener("keydown", enableAudio, { once: true });
  }

  ensureAudioContext() {
    if (!this.audioContext || this.audioContext.state === "suspended") {
      return false;
    }
    return this.audioUnlocked;
  }

  createNoiseBuffer() {
    if (!this.audioContext || this.noiseBuffer) return;
    const ctx = this.audioContext;
    const length = Math.floor(ctx.sampleRate * 0.15);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) {
      data[i] = Math.random() < 0.5 ? -1 : 1;
    }
    this.noiseBuffer = buffer;
  }

  playImpactSound(type) {
    if (!this.ensureAudioContext()) return;

    const ctx = this.audioContext;
    const now = ctx.currentTime;
    const base = type === "paddle" ? 780 : 520;
    const jitter = Phaser.Math.Between(-30, 30);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(base + jitter, now);
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(120, (base + jitter) * 0.58),
      now + 0.08
    );

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.14);

    if (type === "wall" && this.noiseBuffer) {
      const noise = ctx.createBufferSource();
      const noiseGain = ctx.createGain();
      noise.buffer = this.noiseBuffer;

      noiseGain.gain.setValueAtTime(0.0001, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.07, now + 0.006);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

      noise.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + 0.07);
    }
  }

  playGoalSound(side) {
    if (!this.ensureAudioContext()) return;

    const ctx = this.audioContext;
    const now = ctx.currentTime;
    const notes =
      side === "left" ? [520, 390, 260] : [330, 440, 660];

    notes.forEach((freq, index) => {
      const startTime = now + index * 0.09;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "square";
      osc.frequency.setValueAtTime(freq, startTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.15, startTime + 0.08);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.18, startTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.13);
    });
  }

  handlePointer(pointer) {
    if (pointer.pointerType === "touch") {
      if (!pointer.isDown) return;
      if (this.activeTouchId !== null && pointer.id !== this.activeTouchId) {
        return;
      }
      if (!this.isInTouchZone(pointer)) {
        return;
      }
      this.activeTouchId = pointer.id;
      this.pointerActive = true;
      this.pointerSource = "touch";
      this.playerTargetY = pointer.worldY;
      this.lastPointerTime = this.time.now;
      return;
    }

    this.pointerActive = true;
    this.pointerSource = pointer.pointerType || "mouse";
    this.playerTargetY = pointer.worldY;
    this.lastPointerTime = this.time.now;
  }

  handlePointerUp(pointer) {
    if (pointer.pointerType === "touch") {
      if (this.activeTouchId === null || pointer.id !== this.activeTouchId) {
        return;
      }
      this.pointerActive = false;
      this.activeTouchId = null;
    }
  }

  onResize(gameSize) {
    const width = gameSize.width;
    const height = gameSize.height;
    const isRightHanded = this.touchHandedness === "right";

    const hasTouchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const controlMargin = hasTouchSupport ? width * 0.1 : 0;
    const fieldOffsetX = hasTouchSupport
      ? (isRightHanded ? -controlMargin / 2 : controlMargin / 2)
      : 0;
    const fieldWidth = width - controlMargin;

    this.bounds = {
      width: fieldWidth,
      height,
      offsetX: fieldOffsetX + (width - fieldWidth) / 2,
      centerX: fieldOffsetX + width / 2,
      centerY: height / 2,
      fullWidth: width,
    };

    this.safeMargin = Math.max(8, Math.min(fieldWidth, height) * 0.015);
    this.touchZoneWidth = Phaser.Math.Clamp(width * 0.22, 80, 200);

    this.physics.world.setBounds(
      this.bounds.offsetX,
      0,
      fieldWidth,
      height
    );
    this.physics.world.setBoundsCollision(false, false, true, true);

    this.paddleHeightBase = Math.max(90, height * 0.18);
    this.paddleWidth = Math.max(12, fieldWidth * 0.012);
    this.ballRadius = Math.max(6, Math.min(fieldWidth, height) * 0.012);
    this.marginX = Math.max(20, fieldWidth * 0.04);

    this.updatePaddleLayout();

    this.ball.setRadius(this.ballRadius);
    this.ball.body.setCircle(this.ballRadius, -this.ballRadius, -this.ballRadius);
    this.ballGlow.setRadius(this.ballRadius * 2.4);

    this.updateScoreLayout();
    this.drawArena();
    this.updateEffectOverlays();
    if (this.toastText) {
      this.toastText.setPosition(this.bounds.centerX, Math.max(10, height * 0.02));
    }
  }

  drawArena() {
    const width = this.bounds.width;
    const height = this.bounds.height;
    const offsetX = this.bounds.offsetX;
    const inset = Math.max(12, Math.min(width, height) * 0.02);

    this.arena.clear();
    this.arena.lineStyle(2, COLORS.cyan, 0.22);
    this.arena.strokeRoundedRect(
      offsetX + inset,
      inset,
      width - inset * 2,
      height - inset * 2,
      18
    );

    this.midLine.clear();
    this.midLine.lineStyle(2, COLORS.violet, 0.35);
    const dash = 14;
    const gap = 12;
    let y = inset + 8;
    const centerX = offsetX + width / 2;
    while (y < height - inset - 8) {
    this.midLine.lineBetween(centerX, y, centerX, y + dash);
    y += dash + gap;
    }
  }

  updatePaddleLayout() {
    const height = this.bounds.height;
    const fieldWidth = this.bounds.width;
    const isRightHanded = this.touchHandedness === "right";
    const playerScale = this.sideState.player.ghostActive ? 1.25 : 1;
    const aiScale = this.sideState.ai.ghostActive ? 1.25 : 1;

    this.playerPaddleHeight = this.paddleHeightBase * playerScale;
    this.aiPaddleHeight = this.paddleHeightBase * aiScale;

    const playerMinY = this.playerPaddleHeight / 2 + this.safeMargin;
    const playerMaxY = height - this.playerPaddleHeight / 2 - this.safeMargin;
    const aiMinY = this.aiPaddleHeight / 2 + this.safeMargin;
    const aiMaxY = height - this.aiPaddleHeight / 2 - this.safeMargin;

    this.playerPaddle.setSize(this.paddleWidth, this.playerPaddleHeight);
    this.playerPaddle.setPosition(
      isRightHanded
        ? this.bounds.offsetX + fieldWidth - this.marginX
        : this.bounds.offsetX + this.marginX,
      Phaser.Math.Clamp(this.playerPaddle.y || height / 2, playerMinY, playerMaxY)
    );
    this.playerPaddle.body.setSize(
      this.paddleWidth,
      this.playerPaddleHeight,
      true
    );

    this.aiPaddle.setSize(this.paddleWidth, this.aiPaddleHeight);
    this.aiPaddle.setPosition(
      isRightHanded
        ? this.bounds.offsetX + this.marginX
        : this.bounds.offsetX + fieldWidth - this.marginX,
      Phaser.Math.Clamp(this.aiPaddle.y || height / 2, aiMinY, aiMaxY)
    );
    this.aiPaddle.body.setSize(this.paddleWidth, this.aiPaddleHeight, true);
  }

  update(time, delta) {
    this.updatePerformance(delta);
    this.updatePowerups(time);
    if (this.gameState !== "playing") {
      if (this.ballGlow) {
        this.ballGlow.setPosition(this.ball.x, this.ball.y);
      }
      return;
    }

    const dt = delta / 1000;

    this.updatePlayer(time, dt);
    this.updateAi(time, dt);

    if (this.ballGlow) {
      this.ballGlow.setPosition(this.ball.x, this.ball.y);
    }

    this.checkScore();
  }

  updatePlayer(time, dt) {
    const minY = this.playerPaddleHeight / 2 + this.safeMargin;
    const maxY = this.bounds.height - this.playerPaddleHeight / 2 - this.safeMargin;
    const prevY = this.playerPaddle.y;

    let dir = 0;
    if (this.cursors.up.isDown || this.keys.W.isDown) {
      dir = -1;
    } else if (this.cursors.down.isDown || this.keys.S.isDown) {
      dir = 1;
    }

    if (dir !== 0) {
      this.playerPaddle.y = Phaser.Math.Clamp(
        this.playerPaddle.y + dir * this.playerSpeed * dt,
        minY,
        maxY
      );
      this.playerTargetY = this.playerPaddle.y;
      this.pointerActive = false;
      this.playerPaddleVelocity = (this.playerPaddle.y - prevY) / dt;
      return;
    }

    if (this.pointerActive) {
      const targetY = Phaser.Math.Clamp(this.playerTargetY, minY, maxY);
      this.playerPaddle.y = this.moveTowards(
        this.playerPaddle.y,
        targetY,
        this.playerSpeed * dt
      );

      if (
        this.pointerSource === "touch" &&
        time - this.lastPointerTime > 1200
      ) {
        this.pointerActive = false;
        this.activeTouchId = null;
      }
    }

    this.playerPaddleVelocity = (this.playerPaddle.y - prevY) / dt;
  }

  updateAi(time, dt) {
    if (!this.ballActive) {
      return;
    }

    const minY = this.aiPaddleHeight / 2 + this.safeMargin;
    const maxY = this.bounds.height - this.aiPaddleHeight / 2 - this.safeMargin;
    const isRightHanded = this.touchHandedness === "right";
    const ballMovingTowardsAi = isRightHanded
      ? this.ball.body.velocity.x < 0
      : this.ball.body.velocity.x > 0;

    if (ballMovingTowardsAi) {
      if (time > this.aiNextDecision) {
        const predicted = this.predictBallY(this.aiPaddle.x);
        const error = Phaser.Math.Between(
          -this.aiConfig.error,
          this.aiConfig.error
        );
        this.aiTargetY = Phaser.Math.Clamp(predicted + error, minY, maxY);
        this.aiNextDecision = time + this.aiConfig.reaction;
      }
    } else {
      this.aiTargetY = this.bounds.centerY;
    }

    const prevY = this.aiPaddle.y;
    this.aiPaddle.y = this.moveTowards(
      this.aiPaddle.y,
      this.aiTargetY,
      this.aiSpeed * dt
    );
    this.aiPaddleVelocity = (this.aiPaddle.y - prevY) / dt;
  }

  moveTowards(current, target, maxDelta) {
    if (Math.abs(target - current) <= maxDelta) {
      return target;
    }
    return current + Math.sign(target - current) * maxDelta;
  }

  getBallDirectionForPaddle(paddle) {
    const isRightHanded = this.touchHandedness === "right";
    const isPlayerPaddle = paddle === this.playerPaddle;
    if (isRightHanded) {
      return isPlayerPaddle ? -1 : 1;
    }
    return isPlayerPaddle ? 1 : -1;
  }

  predictBallY(targetX) {
    const ball = this.ball;
    const vx = ball.body.velocity.x;
    const vy = ball.body.velocity.y;
    const isRightHanded = this.touchHandedness === "right";
    const ballMovingTowardsTarget = isRightHanded
      ? vx < 0
      : vx > 0;

    if (!ballMovingTowardsTarget) {
      return this.bounds.centerY;
    }

    const time = Math.abs((targetX - ball.x) / vx);
    const minY = this.ballRadius + this.safeMargin;
    const maxY = this.bounds.height - this.ballRadius - this.safeMargin;
    const range = maxY - minY;

    if (range <= 0) {
      return this.bounds.centerY;
    }

    let predicted = ball.y + vy * time;
    let n = (predicted - minY) % (range * 2);
    if (n < 0) n += range * 2;
    if (n > range) n = range * 2 - n;

    return minY + n;
  }

  handlePaddleHit(ball, paddle) {
    if (this.sideState.player.magnetActive || this.sideState.ai.magnetActive) {
      return;
    }
    const now = this.time.now;
    if (this.lastPaddleHitPaddle === paddle && now - this.lastPaddleHitAt < 80) {
      return;
    }
    this.lastPaddleHitAt = now;
    this.lastPaddleHitPaddle = paddle;

    const side = this.getSideByPaddle(paddle);
    if (this.phaseOwner && this.sideState[this.phaseOwner].phaseActive) {
      const opponent = this.getOpponentSide(this.phaseOwner);
      if (side === opponent) {
        return;
      }
    }
    this.handlePowerupTriggersOnHit(side, ball, paddle);
    if (this.tryActivateMagnet(side, paddle)) {
      return;
    }

    this.playImpactSound("paddle");
    const paddleHeight =
      paddle === this.playerPaddle ? this.playerPaddleHeight : this.aiPaddleHeight;
    let diff = (ball.y - paddle.y) / (paddleHeight / 2);
    if (this.sideState[side].invertActive) {
      diff *= -1;
    }
    const speed = Phaser.Math.Clamp(
      ball.body.speed * 1.04,
      this.ballBaseSpeed,
      920
    );

    const isPlayerPaddle = paddle === this.playerPaddle;
    const dir = this.getBallDirectionForPaddle(paddle);

    const maxVy = speed * 0.85;
    const finalVy = Phaser.Math.Clamp(diff * 320, -maxVy, maxVy);
    const finalVx = Math.sqrt(speed * speed - finalVy * finalVy) * dir;

    ball.body.setVelocity(finalVx, finalVy);
    ball.setStrokeStyle(2, isPlayerPaddle ? COLORS.cyan : COLORS.magenta, 0.95);
    ball.x =
      paddle.x + dir * (this.paddleWidth / 2 + this.ballRadius + 2);
  }

  handleWorldBounds(body, up, down) {
    if (body !== this.ball.body) return;
    if (up || down) {
      this.playImpactSound("wall");
      this.wallTouchedSinceLastHit = true;
      this.rallyWallTouched = true;
      this.sideState.player.noWallHitCount = 0;
      this.sideState.ai.noWallHitCount = 0;
    }
  }

  resetBall(direction) {
    const { speed, angleRange } = this.applyServeModifiers(direction);
    const angle = Phaser.Math.DegToRad(
      Phaser.Math.Between(angleRange.min, angleRange.max)
    );
    const centerX = this.bounds.offsetX + this.bounds.width / 2;

    this.ball.body.moves = true;
    this.ball.setPosition(centerX, this.bounds.centerY);
    this.ball.body.setVelocity(
      Math.cos(angle) * speed * direction,
      Math.sin(angle) * speed
    );
    this.startRally();
  }

  holdBall() {
    this.ballActive = false;
    this.ball.body.setVelocity(0, 0);
    const centerX = this.bounds.offsetX + this.bounds.width / 2;
    this.ball.setPosition(centerX, this.bounds.centerY);
    this.phaseEmitter?.stop();
    this.turboEmitter?.stop();
    this.invertEmitter?.stop();
    this.laserEmitter?.stop();
  }

  startMatch() {
    this.hideStartScreen();
    this.hideGameOverScreen();
    this.setMenuOpen(false);
    this.resetPowerups();
    this.scoreLeft = 0;
    this.scoreRight = 0;
    this.updateScore();
    this.gameState = "playing";
    this.ballActive = true;
    this.setGameplaySettingsEnabled(false);
    if (this.serveTimer) {
      this.serveTimer.remove(false);
      this.serveTimer = null;
    }
    this.resetBall(Phaser.Math.Between(0, 1) === 0 ? -1 : 1);

    // Enter fullscreen
    const elem = document.documentElement;
    if (this.fullscreenEnabled && elem.requestFullscreen) {
      elem
        .requestFullscreen()
        .then(() => this.requestOrientationLock())
        .catch((err) => {
          console.warn("Fullscreen request failed:", err);
        });
    } else {
      this.requestOrientationLock();
    }
    this.updateOrientationState();
  }

  endMatch(winner) {
    this.gameState = "gameover";
    this.holdBall();
    this.deactivatePhase();
    this.showGameOverScreen(winner);
    this.setGameplaySettingsEnabled(true);
    if (this.serveTimer) {
      this.serveTimer.remove(false);
      this.serveTimer = null;
    }

    // Exit fullscreen
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch((err) => {
        console.warn("Exit fullscreen failed:", err);
      });
    }
  }

  scheduleServe(direction) {
    if (!this.ballActive) {
      return;
    }

    this.ballActive = false;
    this.ball.body.setVelocity(0, 0);
    const centerX = this.bounds.offsetX + this.bounds.width / 2;
    this.ball.setPosition(centerX, this.bounds.centerY);

    if (this.serveTimer) {
      this.serveTimer.remove(false);
    }
    this.serveTimer = this.time.delayedCall(550, () => {
      this.serveTimer = null;
      if (this.gameState !== "playing") {
        return;
      }
      this.ballActive = true;
      this.resetBall(direction);
    });
  }

  checkScore() {
    const x = this.ball.x;
    const outLeft = x < this.bounds.offsetX - this.ballRadius * 2;
    const outRight = x > this.bounds.offsetX + this.bounds.width + this.ballRadius * 2;
    const isRightHanded = this.touchHandedness === "right";

    if (outLeft) {
      if (isRightHanded) {
        this.handlePoint("player", "left", -1);
      } else {
        this.handlePoint("ai", "right", -1);
      }
    } else if (outRight) {
      if (isRightHanded) {
        this.handlePoint("ai", "right", 1);
      } else {
        this.handlePoint("player", "left", 1);
      }
    }
  }

  isInTouchZone(pointer) {
    if (!this.touchZoneWidth || !this.bounds) return true;
    const x = pointer.worldX;
    if (this.touchHandedness === "left") {
      return x <= this.touchZoneWidth;
    }
    return x >= this.bounds.fullWidth - this.touchZoneWidth;
  }

  checkWinTarget() {
    if (this.gameState !== "playing") {
      return;
    }
    if (this.scoreLeft >= this.winTarget) {
      this.endMatch("left");
    } else if (this.scoreRight >= this.winTarget) {
      this.endMatch("right");
    }
  }
}

const config = {
  type: Phaser.AUTO,
  parent: "app",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [PongScene],
};

new Phaser.Game(config);
