import { Player } from "./Player";
import { RunnerLevel3 } from "./RunnerLevel3";
import { InputHandler } from "./InputHandler";

interface RunnerGameCallbacks {
  onPlayerDeath: () => void;
  onVictory: () => void;
}

export class RunnerGameController3 {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private callbacks: RunnerGameCallbacks;
  
  public players: Player[] = [];
  private level: RunnerLevel3;
  private inputHandler: InputHandler;
  private playerCount: number;
  
  private gameLoop: number | null = null;
  private lastTime = 0;
  private readonly targetFPS = 60;
  private readonly frameTime = 1000 / this.targetFPS;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, callbacks: RunnerGameCallbacks, gameConfig: { playerCount: number; colors: Record<string, string>; controls?: Record<string, number> }) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.callbacks = callbacks;
    this.playerCount = gameConfig.playerCount;

    // Initialize game objects
    this.level = new RunnerLevel3();
    this.inputHandler = new InputHandler(canvas, gameConfig.playerCount, gameConfig.controls);
    
    // Create players at starting positions - centered on screen
    const centerX = 300;
    const startPos = this.level.getStartPosition();
    for (let i = 0; i < gameConfig.playerCount; i++) {
      const offset = i * 40;
      const color = gameConfig.colors[`player${i + 1}`] || `hsl(${i * 60}, 70%, 50%)`;
      const player = new Player(centerX + offset, startPos.y, color, `player${i + 1}`);
      
      // Set runner mode - players stay in place, world moves
      player.setRunnerMode(true);
      this.players.push(player);
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
      
      // Update players with runner controls
      this.players.forEach((player, index) => {
        const input = this.inputHandler.getPlayerInput(index);
        this.updateRunnerPlayer(player, input, dt);
      });
      
      // Update level
      this.level.update(dt);
      
      // Check collisions
      this.checkCollisions();
      
      // Check victory condition
      this.checkVictory();
      
      // Render everything
      this.render();
      
      this.lastTime = currentTime;
    }
    
    this.gameLoop = requestAnimationFrame(this.update);
  };

  private updateRunnerPlayer(player: Player, input: any, deltaTime: number) {
    // In runner mode, only handle jump and crouch
    if (input.jump && player.canJump()) {
      player.jump();
    } else if (input.doubleJump && player.canPerformDoubleJump()) {
      player.doubleJump();
    }
    
    // Crouch control (down arrow)
    if (input.down) {
      player.setCrouching(true);
    } else {
      player.setCrouching(false);
    }
    
    // Update physics
    player.update(deltaTime);
    
    // Handle collisions with level
    this.handlePlayerCollisions(player);
  }

  private handlePlayerCollisions(player: Player) {
    const collisions = this.level.getCollisions(player.getBounds());
    
    // Check obstacle collisions
    if (collisions.obstacles.length > 0) {
      // Player hit obstacle - game over
      this.callbacks.onPlayerDeath();
      return;
    }
    
    // Keep players in vertical bounds
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
    
    // Keep player centered horizontally (no drift)
    const centerX = 300;
    if (Math.abs(player.position.x - centerX) > 1) {
      player.position.x = centerX;
    }
  }

  private checkCollisions() {
    // All collision logic is in handlePlayerCollisions for runner mode
  }

  private checkVictory() {
    if (this.level.isComplete()) {
      this.callbacks.onVictory();
    }
  }

  private render() {
    // Clear canvas
    this.ctx.fillStyle = "#1a1a2e";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Render level
    this.level.render(this.ctx);
    
    // Render players
    this.players.forEach(player => player.render(this.ctx));
    
    // Render HUD
    this.renderHUD();
  }

  private renderHUD() {
    // Distance progress bar
    const barWidth = 300;
    const barHeight = 20;
    const barX = (this.canvas.width - barWidth) / 2;
    const barY = 20;
    
    // Background
    this.ctx.fillStyle = "#1a1a1a";
    this.ctx.fillRect(barX - 4, barY - 4, barWidth + 8, barHeight + 8);
    
    // Progress bar background
    this.ctx.fillStyle = "#3a3a3a";
    this.ctx.fillRect(barX, barY, barWidth, barHeight);
    
    // Progress bar fill
    const progressPercent = this.level.getProgressPercentage() / 100;
    const fillWidth = barWidth * progressPercent;
    
    // Gradient fill
    const gradient = this.ctx.createLinearGradient(barX, barY, barX + fillWidth, barY);
    gradient.addColorStop(0, "#ff6b35");
    gradient.addColorStop(1, "#ff4500");
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(barX, barY, fillWidth, barHeight);
    
    // Distance text
    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.font = "16px monospace";
    this.ctx.textAlign = "center";
    this.ctx.fillText(
      `${this.level.getDistanceTraveled()}m / ${this.level.getTargetDistance()}m`,
      this.canvas.width / 2,
      barY - 8
    );
    
    // Chapter title
    this.ctx.font = "12px monospace";
    this.ctx.textAlign = "left";
    this.ctx.fillText("CHAPTER 4: BOMBERMAN'S ARENA!", 20, 30);
    
    // Difficulty indicator
    const difficulty = this.level.getDifficulty();
    this.ctx.fillStyle = difficulty === 1 ? "#00ff00" : difficulty === 2 ? "#ffff00" : "#ff0000";
    this.ctx.fillText(`💀 DIFICULDADE: ${difficulty}`, 20, 50);
    
    // Powerups collected
    this.ctx.fillStyle = "#ff6b35";
    this.ctx.fillText(`⚡ ${this.level.getPowerupsCollected()}`, 20, 70);
    
    // Controls reminder
    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.textAlign = "right";
    this.ctx.fillText("↑ PULAR (2x)  ↓ ABAIXAR", this.canvas.width - 20, 30);
    
    // Warning for bombs
    this.ctx.fillStyle = "#ff6b35";
    this.ctx.font = "10px monospace";
    this.ctx.fillText("💣 CUIDADO COM AS BOMBAS!", this.canvas.width - 20, 50);
  }

  restartLevel() {
    this.level.reset();
    const centerX = 300;
    const startPos = this.level.getStartPosition();
    this.players.forEach((player, index) => {
      const offset = index * 40;
      player.reset(centerX + offset, startPos.y);
      player.setRunnerMode(true);
    });
  }

  getDistanceProgress() {
    return {
      current: this.level.getDistanceTraveled(),
      target: this.level.getTargetDistance(),
      percentage: this.level.getProgressPercentage()
    };
  }

  getPowerupsCollected() {
    return this.level.getPowerupsCollected();
  }
}