import { Player } from "./Player";
import { RunnerBossLevel } from "./RunnerBossLevel";
import { InputHandler } from "./InputHandler";
import { soundGenerator } from "@/hooks/useSoundEffects";

interface RunnerGameCallbacks {
  onPlayerDeath: () => void;
  onVictory: () => void;
}

export class RunnerGameController4 {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private callbacks: RunnerGameCallbacks;
  
  public players: Player[] = [];
  private level: RunnerBossLevel;
  private inputHandler: InputHandler;
  private playerCount: number;
  
  private gameLoop: number | null = null;
  private lastTime = 0;
  private readonly targetFPS = 60;
  private readonly frameTime = 1000 / this.targetFPS;
  
  // Player power-up states
  private playerShields: boolean[] = [];
  private playerSpeedBoosts: number[] = [];

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, callbacks: RunnerGameCallbacks, gameConfig: { playerCount: number; colors: Record<string, string>; controls?: Record<string, number> }) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.callbacks = callbacks;
    this.playerCount = gameConfig.playerCount;

    // Initialize game objects
    this.level = new RunnerBossLevel();
    this.inputHandler = new InputHandler(canvas, gameConfig.playerCount, gameConfig.controls);
    
    // Create players
    const centerX = 300;
    const startPos = this.level.getStartPosition();
    for (let i = 0; i < gameConfig.playerCount; i++) {
      const offset = i * 40;
      const color = gameConfig.colors[`player${i + 1}`] || `hsl(${i * 60}, 70%, 50%)`;
      const player = new Player(centerX + offset, startPos.y, color, `player${i + 1}`);
      player.setRunnerMode(true);
      this.players.push(player);
      this.playerShields.push(false);
      this.playerSpeedBoosts.push(0);
    }
  }

  start() {
    this.canvas.focus();
    this.lastTime = performance.now();
    this.gameLoop = requestAnimationFrame((time) => this.update(time));
  }

  stop() {
    if (this.gameLoop) {
      cancelAnimationFrame(this.gameLoop);
      this.gameLoop = null;
    }
    this.inputHandler.cleanup();
  }

  private update = (currentTime: number) => {
    const deltaTime = currentTime - this.lastTime;
    
    if (deltaTime >= this.frameTime) {
      const dt = deltaTime / 1000;
      
      // Update power-up timers
      for (let i = 0; i < this.playerSpeedBoosts.length; i++) {
        if (this.playerSpeedBoosts[i] > 0) {
          this.playerSpeedBoosts[i] -= dt;
        }
      }
      
      // Update players
      this.players.forEach((player, index) => {
        const input = this.inputHandler.getPlayerInput(index);
        this.updateRunnerPlayer(player, input, dt, index);
      });
      
      // Update level
      this.level.update(dt);
      
      // Check collisions
      this.checkCollisions();
      
      // Check victory
      this.checkVictory();
      
      // Handle sound events
      this.handleSoundEvents();
      
      // Render
      this.render();
      
      this.lastTime = currentTime;
    }
    
    this.gameLoop = requestAnimationFrame(this.update);
  };

  private updateRunnerPlayer(player: Player, input: any, deltaTime: number, playerIndex: number) {
    // Handle jump
    if (input.jump && player.canJump()) {
      player.jump();
      soundGenerator.playJump();
    } else if (input.doubleJump && player.canPerformDoubleJump()) {
      player.doubleJump();
      soundGenerator.playDoubleJump();
    }
    
    // Handle crouch
    if (input.down) {
      player.setCrouching(true);
    } else {
      player.setCrouching(false);
    }
    
    // Update physics
    player.update(deltaTime);
    
    // Handle collisions
    this.handlePlayerCollisions(player, playerIndex);
  }

  private handlePlayerCollisions(player: Player, playerIndex: number) {
    const collisions = this.level.getCollisions(player.getBounds());
    
    // Check obstacle collisions
    if (collisions.obstacles.length > 0) {
      // Check if player has shield
      if (this.playerShields[playerIndex]) {
        this.playerShields[playerIndex] = false;
        soundGenerator.playHit();
      } else {
        soundGenerator.playHit();
        this.callbacks.onPlayerDeath();
        return;
      }
    }
    
    // Handle power-up effects
    for (const powerUp of collisions.powerUps) {
      if (powerUp.type === 'shield') {
        this.playerShields[playerIndex] = true;
      } else if (powerUp.type === 'speed') {
        this.playerSpeedBoosts[playerIndex] = 5; // 5 seconds
      }
    }
    
    // Keep players in bounds
    if (player.position.y > this.canvas.height) {
      this.callbacks.onPlayerDeath();
    }
    
    // Ground collision
    const groundY = 370;
    if (player.position.y + player.height > groundY) {
      player.position.y = groundY - player.height;
      player.velocity.y = 0;
      player.grounded = true;
    }
    
    // Keep player centered
    const centerX = 300;
    if (Math.abs(player.position.x - centerX) > 1) {
      player.position.x = centerX;
    }
  }

  private checkCollisions() {
    // All collision logic in handlePlayerCollisions
  }

  private checkVictory() {
    if (this.level.isComplete()) {
      this.callbacks.onVictory();
    }
  }

  private handleSoundEvents() {
    if (this.level.pendingExplosionSound) {
      soundGenerator.playExplosion();
      this.level.pendingExplosionSound = false;
    }
    if (this.level.pendingCollectSound) {
      soundGenerator.playCollect();
      this.level.pendingCollectSound = false;
    }
    if (this.level.pendingBossHitSound) {
      soundGenerator.playHit();
      this.level.pendingBossHitSound = false;
    }
  }

  private render() {
    // Clear canvas
    this.ctx.fillStyle = "#1a1a2e";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Render level
    this.level.render(this.ctx);
    
    // Render players with effects
    this.players.forEach((player, index) => {
      // Shield effect
      if (this.playerShields[index]) {
        this.ctx.strokeStyle = "#3498DB";
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(
          player.position.x + player.width / 2,
          player.position.y + player.height / 2,
          player.width,
          0,
          Math.PI * 2
        );
        this.ctx.stroke();
      }
      
      // Speed boost effect
      if (this.playerSpeedBoosts[index] > 0) {
        this.ctx.fillStyle = "rgba(241, 196, 15, 0.3)";
        this.ctx.fillRect(
          player.position.x - 10,
          player.position.y,
          player.width + 20,
          player.height
        );
      }
      
      player.render(this.ctx);
    });
    
    // Render HUD
    this.renderHUD();
  }

  private renderHUD() {
    // Theme indicator
    const theme = this.level.getCurrentTheme();
    let themeColor = "#228B22";
    let themeName = "FLORESTA";
    
    if (theme === 'mario') {
      themeColor = "#5C94FC";
      themeName = "MARIO WORLD";
    } else if (theme === 'bomberman') {
      themeColor = "#FF6B35";
      themeName = "BOMBERMAN";
    }
    
    this.ctx.fillStyle = themeColor;
    this.ctx.font = "bold 16px monospace";
    this.ctx.textAlign = "center";
    this.ctx.fillText(`MUNDO: ${themeName}`, this.canvas.width / 2, 30);
    
    // Boss fight title
    this.ctx.fillStyle = "#FF0000";
    this.ctx.font = "bold 14px monospace";
    this.ctx.fillText("CHAPTER 5: BOSS FINAL DAS CORRIDAS!", this.canvas.width / 2, 50);
    
    // Player status
    this.ctx.textAlign = "left";
    this.ctx.font = "12px monospace";
    this.players.forEach((player, index) => {
      const y = 70 + index * 20;
      this.ctx.fillStyle = "#FFF";
      let status = `P${index + 1}: `;
      if (this.playerShields[index]) status += "🛡️ ";
      if (this.playerSpeedBoosts[index] > 0) status += "⚡ ";
      this.ctx.fillText(status, 20, y);
    });
    
    // Controls reminder
    this.ctx.textAlign = "right";
    this.ctx.fillStyle = "#FFF";
    this.ctx.fillText("↑ PULAR  ↓ ABAIXAR  ⚔ COLETE PARA ATACAR", this.canvas.width - 20, 70);
  }

  restartLevel() {
    this.level.reset();
    const centerX = 300;
    const startPos = this.level.getStartPosition();
    this.players.forEach((player, index) => {
      const offset = index * 40;
      player.reset(centerX + offset, startPos.y);
      player.setRunnerMode(true);
      this.playerShields[index] = false;
      this.playerSpeedBoosts[index] = 0;
    });
  }

  getDistanceProgress() {
    return {
      current: this.level.getDistanceTraveled(),
      target: 0,
      percentage: this.level.getProgressPercentage()
    };
  }

  getBossHealthPercentage() {
    return this.level.getBossHealthPercentage();
  }
}
