import Phaser from "phaser";
import "./style.css";

const ui = {
  difficultySelect: document.getElementById("difficulty"),
  handednessSelect: document.getElementById("handedness"),
  winTargetInput: document.getElementById("win-target"),
  languageSelect: document.getElementById("language"),
  menuToggle: document.getElementById("menu-toggle"),
  menuPanel: document.getElementById("menu-panel"),
  menuBackdrop: document.getElementById("menu-backdrop"),
  startScreen: document.getElementById("start-screen"),
  startButton: document.getElementById("start-button"),
  infoButton: document.getElementById("info-button"),
  infoScreen: document.getElementById("info-screen"),
  infoClose: document.getElementById("info-close"),
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
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.bg);

    this.playerSpeed = 560;
    this.ballBaseSpeed = 430;

    this.arena = this.add.graphics().setDepth(0);
    this.midLine = this.add.graphics().setDepth(0);

    this.createPaddles();
    this.createBall();
    this.createScore();

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

  setDifficulty(name) {
    this.aiConfig = DIFFICULTIES[name] || DIFFICULTIES.medium;
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

    this.setDifficulty(ui.difficultySelect?.value || "medium");
    this.touchHandedness = ui.handednessSelect?.value || "right";
    this.winTarget = this.readWinTarget();
    this.updateWinTargetLabels();

    ui.difficultySelect?.addEventListener("change", (event) => {
      this.setDifficulty(event.target.value);
    });

    ui.winTargetInput?.addEventListener("change", () => {
      this.winTarget = this.readWinTarget();
      this.updateWinTargetLabels();
      this.checkWinTarget();
    });

    ui.handednessSelect?.addEventListener("change", (event) => {
      this.touchHandedness = event.target.value === "left" ? "left" : "right";
      this.onResize(this.scale.gameSize);
    });

    ui.languageSelect?.addEventListener("change", (event) => {
      this.setLanguage(event.target.value);
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

    this.paddleHeight = Math.max(90, height * 0.18);
    this.paddleWidth = Math.max(12, fieldWidth * 0.012);
    this.ballRadius = Math.max(6, Math.min(fieldWidth, height) * 0.012);

    const marginX = Math.max(20, fieldWidth * 0.04);
    const minY = this.paddleHeight / 2 + this.safeMargin;
    const maxY = height - this.paddleHeight / 2 - this.safeMargin;

    this.playerPaddle.setSize(this.paddleWidth, this.paddleHeight);
    this.playerPaddle.setPosition(
      isRightHanded ? this.bounds.offsetX + fieldWidth - marginX : this.bounds.offsetX + marginX,
      Phaser.Math.Clamp(this.playerPaddle.y || height / 2, minY, maxY)
    );
    this.playerPaddle.body.setSize(this.paddleWidth, this.paddleHeight, true);

    this.aiPaddle.setSize(this.paddleWidth, this.paddleHeight);
    this.aiPaddle.setPosition(
      isRightHanded ? this.bounds.offsetX + marginX : this.bounds.offsetX + fieldWidth - marginX,
      Phaser.Math.Clamp(this.aiPaddle.y || height / 2, minY, maxY)
    );
    this.aiPaddle.body.setSize(this.paddleWidth, this.paddleHeight, true);

    this.ball.setRadius(this.ballRadius);
    this.ball.body.setCircle(this.ballRadius, -this.ballRadius, -this.ballRadius);
    this.ballGlow.setRadius(this.ballRadius * 2.4);

    this.updateScoreLayout();
    this.drawArena();
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

  update(time, delta) {
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
    const minY = this.paddleHeight / 2 + this.safeMargin;
    const maxY = this.bounds.height - this.paddleHeight / 2 - this.safeMargin;

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
  }

  updateAi(time, dt) {
    if (!this.ballActive) {
      return;
    }

    const minY = this.paddleHeight / 2 + this.safeMargin;
    const maxY = this.bounds.height - this.paddleHeight / 2 - this.safeMargin;
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

    this.aiPaddle.y = this.moveTowards(
      this.aiPaddle.y,
      this.aiTargetY,
      this.aiConfig.speed * dt
    );
  }

  moveTowards(current, target, maxDelta) {
    if (Math.abs(target - current) <= maxDelta) {
      return target;
    }
    return current + Math.sign(target - current) * maxDelta;
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
    const now = this.time.now;
    if (this.lastPaddleHitPaddle === paddle && now - this.lastPaddleHitAt < 80) {
      return;
    }
    this.lastPaddleHitAt = now;
    this.lastPaddleHitPaddle = paddle;

    this.playImpactSound("paddle");
    const diff = (ball.y - paddle.y) / (this.paddleHeight / 2);
    const speed = Phaser.Math.Clamp(
      ball.body.speed * 1.04,
      this.ballBaseSpeed,
      920
    );

    const isRightHanded = this.touchHandedness === "right";
    const isPlayerPaddle = paddle === this.playerPaddle;
    let dir;

    if (isRightHanded) {
      dir = isPlayerPaddle ? -1 : 1;
    } else {
      dir = isPlayerPaddle ? 1 : -1;
    }

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
    }
  }

  resetBall(direction) {
    const angle = Phaser.Math.DegToRad(Phaser.Math.Between(-40, 40));
    const speed = this.ballBaseSpeed;
    const centerX = this.bounds.offsetX + this.bounds.width / 2;

    this.ball.setPosition(centerX, this.bounds.centerY);
    this.ball.body.setVelocity(
      Math.cos(angle) * speed * direction,
      Math.sin(angle) * speed
    );
  }

  holdBall() {
    this.ballActive = false;
    this.ball.body.setVelocity(0, 0);
    const centerX = this.bounds.offsetX + this.bounds.width / 2;
    this.ball.setPosition(centerX, this.bounds.centerY);
  }

  startMatch() {
    this.hideStartScreen();
    this.hideGameOverScreen();
    this.setMenuOpen(false);
    this.scoreLeft = 0;
    this.scoreRight = 0;
    this.updateScore();
    this.gameState = "playing";
    this.ballActive = true;
    this.resetBall(Phaser.Math.Between(0, 1) === 0 ? -1 : 1);

    // Enter fullscreen
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch((err) => {
        console.warn("Fullscreen request failed:", err);
      });
    }
  }

  endMatch(winner) {
    this.gameState = "gameover";
    this.holdBall();
    this.showGameOverScreen(winner);

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

    this.time.delayedCall(550, () => {
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
        this.scoreLeft += 1;
        this.updateScore();
        this.playGoalSound("left");
        if (this.scoreLeft >= this.winTarget) {
          this.endMatch("left");
          return;
        }
      } else {
        this.scoreRight += 1;
        this.updateScore();
        this.playGoalSound("right");
        if (this.scoreRight >= this.winTarget) {
          this.endMatch("right");
          return;
        }
      }
      this.scheduleServe(-1);
    } else if (outRight) {
      if (isRightHanded) {
        this.scoreRight += 1;
        this.updateScore();
        this.playGoalSound("right");
        if (this.scoreRight >= this.winTarget) {
          this.endMatch("right");
          return;
        }
      } else {
        this.scoreLeft += 1;
        this.updateScore();
        this.playGoalSound("left");
        if (this.scoreLeft >= this.winTarget) {
          this.endMatch("left");
          return;
        }
      }
      this.scheduleServe(1);
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
