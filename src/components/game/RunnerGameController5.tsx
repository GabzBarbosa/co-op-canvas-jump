import { RunnerLevel4 } from "./RunnerLevel4";
import { InputHandler } from "./InputHandler";
import { Player } from "./Player";

interface RunnerGameCallbacks {
  onPlayerDeath: () => void;
  onVictory: () => void;
}

export class RunnerGameController5 {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private callbacks: RunnerGameCallbacks;
  private level: RunnerLevel4;
  private inputHandler: InputHandler;
  private player: Player;
  private animationId: number | null = null;
  private lastTime: number = 0;
  private frameTime: number = 1000 / 60;
  
  private isJumping = false;
  private isCrouching = false;
  private hasDoubleJump = true;
  private playerHealth = 3;
  private shieldActive = false;
  private shieldTimer = 0;
  private speedBoostActive = false;
  private speedBoostTimer = 0;

  constructor(
    canvas: HTMLCanvasElement,
    callbacks: RunnerGameCallbacks,
    soundGenerator?: any
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.callbacks = callbacks;
    this.level = new RunnerLevel4();
    this.inputHandler = new InputHandler(canvas, 1);
    
    const startPos = this.level.getStartPosition();
    this.player = new Player(startPos.x, startPos.y, "#ff69b4", "player1");
    this.player.setRunnerMode(true);
  }

  start() {
    this.lastTime = performance.now();
    this.update(this.lastTime);
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.inputHandler.cleanup();
  }

  private update = (currentTime: number) => {
    const deltaTime = currentTime - this.lastTime;
    
    if (deltaTime >= this.frameTime) {
      this.lastTime = currentTime;
      const dt = deltaTime / 1000;
      
      this.level.update(dt);
      this.updateRunnerPlayer(dt);
      this.handlePlayerCollisions();
      this.updatePowerUpTimers(dt);
      this.checkVictory();
      this.render();
    }
    
    this.animationId = requestAnimationFrame(this.update);
  };

  private updateRunnerPlayer(deltaTime: number) {
    const input = this.inputHandler.getPlayerInput(0);
    
    // Jump with UP or SPACE
    if (input.jump && !this.isJumping) {
      this.player.jump();
      this.isJumping = true;
      this.hasDoubleJump = true;
    } else if (input.jump && this.isJumping && this.hasDoubleJump && input.doubleJump) {
      this.player.doubleJump();
      this.hasDoubleJump = false;
    }
    
    // Crouch with DOWN
    if (input.down) {
      if (!this.isCrouching) {
        this.player.setCrouching(true);
        this.isCrouching = true;
      }
    } else {
      if (this.isCrouching) {
        this.player.setCrouching(false);
        this.isCrouching = false;
      }
    }
    
    // Check if landed
    if (this.player.velocity.y === 0 && this.isJumping && this.player.grounded) {
      this.isJumping = false;
      this.hasDoubleJump = true;
    }
    
    this.player.update(deltaTime);
    
    // Keep player at fixed X position
    const startPos = this.level.getStartPosition();
    this.player.position.x = startPos.x;
    
    // Ground collision
    if (this.player.position.y > startPos.y) {
      this.player.position.y = startPos.y;
      this.player.velocity.y = 0;
      this.player.grounded = true;
      this.isJumping = false;
      this.hasDoubleJump = true;
    }
  }

  private updatePowerUpTimers(deltaTime: number) {
    if (this.shieldActive) {
      this.shieldTimer -= deltaTime;
      if (this.shieldTimer <= 0) {
        this.shieldActive = false;
      }
    }
    
    if (this.speedBoostActive) {
      this.speedBoostTimer -= deltaTime;
      if (this.speedBoostTimer <= 0) {
        this.speedBoostActive = false;
      }
    }
  }

  private handlePlayerCollisions() {
    const playerBounds = this.player.getBounds();
    const collisions = this.level.getCollisions(playerBounds);
    
    // Handle obstacle collisions
    for (const obstacle of collisions.obstacles) {
      if (this.shieldActive) {
        this.shieldActive = false;
        continue;
      }
      
      this.playerHealth--;
      if (this.playerHealth <= 0) {
        this.callbacks.onPlayerDeath();
        return;
      }
    }
    
    // Handle powerup collisions
    for (const powerup of collisions.powerups) {
      switch (powerup.type) {
        case 'star':
          this.shieldActive = true;
          this.shieldTimer = 5;
          break;
        case 'mushroom':
          this.speedBoostActive = true;
          this.speedBoostTimer = 3;
          break;
        case 'heart':
          this.playerHealth = Math.min(5, this.playerHealth + 1);
          break;
      }
    }
  }

  private checkVictory() {
    if (this.level.isComplete()) {
      this.callbacks.onVictory();
    }
  }

  private render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.level.render(this.ctx);
    
    // Render player with effects
    this.ctx.save();
    
    if (this.shieldActive) {
      // Rainbow shield effect
      const hue = (Date.now() / 10) % 360;
      this.ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
      this.ctx.shadowBlur = 20;
    }
    
    if (this.speedBoostActive) {
      // Speed lines
      this.ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      const pos = this.player.position;
      for (let i = 0; i < 5; i++) {
        this.ctx.fillRect(pos.x - 20 - i * 15, pos.y + 10 + i * 8, 20, 3);
      }
    }
    
    this.player.render(this.ctx);
    this.ctx.restore();
    
    this.renderHUD();
  }

  private renderHUD() {
    // Theme label
    this.ctx.fillStyle = "#ff69b4";
    this.ctx.font = "bold 16px Arial";
    this.ctx.textAlign = "left";
    this.ctx.fillText("💔 DESTRUIR AMIZADES", 10, 25);
    
    // Distance progress
    const distance = this.level.getDistanceTraveled();
    const target = this.level.getTargetDistance();
    const progress = this.level.getProgressPercentage();
    
    this.ctx.fillStyle = "#fff";
    this.ctx.font = "14px Arial";
    this.ctx.fillText(`${distance}m / ${target}m`, 10, 45);
    
    // Progress bar
    this.ctx.fillStyle = "#333";
    this.ctx.fillRect(10, 55, 200, 10);
    
    // Rainbow progress bar
    const gradient = this.ctx.createLinearGradient(10, 0, 210, 0);
    gradient.addColorStop(0, "#ff0000");
    gradient.addColorStop(0.2, "#ff7f00");
    gradient.addColorStop(0.4, "#ffff00");
    gradient.addColorStop(0.6, "#00ff00");
    gradient.addColorStop(0.8, "#0000ff");
    gradient.addColorStop(1, "#8b00ff");
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(10, 55, (progress / 100) * 200, 10);
    
    // Health hearts
    this.ctx.font = "20px Arial";
    for (let i = 0; i < 5; i++) {
      this.ctx.fillText(i < this.playerHealth ? "❤️" : "🖤", 10 + i * 25, 90);
    }
    
    // Shield indicator
    if (this.shieldActive) {
      this.ctx.fillStyle = "#ffd700";
      this.ctx.font = "12px Arial";
      this.ctx.fillText(`⭐ ${this.shieldTimer.toFixed(1)}s`, 150, 90);
    }
    
    // Speed indicator
    if (this.speedBoostActive) {
      this.ctx.fillStyle = "#ff4444";
      this.ctx.font = "12px Arial";
      this.ctx.fillText(`🍄 ${this.speedBoostTimer.toFixed(1)}s`, 200, 90);
    }
    
    // Controls hint
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    this.ctx.font = "11px Arial";
    this.ctx.textAlign = "right";
    this.ctx.fillText("⬆️/SPACE: Pular | ⬇️: Abaixar", this.canvas.width - 10, 25);
    this.ctx.fillText("Desvie dos itens que destroem amizades!", this.canvas.width - 10, 40);
  }

  restartLevel() {
    this.level.reset();
    const startPos = this.level.getStartPosition();
    this.player.reset(startPos.x, startPos.y);
    this.player.setRunnerMode(true);
    this.playerHealth = 3;
    this.shieldActive = false;
    this.speedBoostActive = false;
    this.isJumping = false;
    this.isCrouching = false;
    this.hasDoubleJump = true;
  }

  getDistanceProgress(): number {
    return this.level.getProgressPercentage();
  }
}
