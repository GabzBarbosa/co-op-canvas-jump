import { Player } from "./Player";
import { Level } from "./Level";
import { InputHandler } from "./InputHandler";
import { LevelManager } from "./LevelManager";
import { Enemy } from "./Enemy";

interface GameCallbacks {
  onPlayerDeath: () => void;
  onVictory: () => void;
  onLevelComplete: () => void;
}

export class GameController {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private callbacks: GameCallbacks;
  
  private player1: Player;
  private player2: Player;
  private levelManager: LevelManager;
  private inputHandler: InputHandler;
  
  private gameLoop: number | null = null;
  private lastTime = 0;
  private readonly targetFPS = 60;
  private readonly frameTime = 1000 / this.targetFPS;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, callbacks: GameCallbacks) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.callbacks = callbacks;

    // Initialize game objects
    this.levelManager = new LevelManager();
    this.inputHandler = new InputHandler(canvas);
    
    // Create players at starting positions
    const startPos = this.levelManager.getCurrentLevel().getStartPosition();
    this.player1 = new Player(startPos.x - 32, startPos.y, "#2ECC71", "player1"); // Green
    this.player2 = new Player(startPos.x + 32, startPos.y, "#3498DB", "player2"); // Blue
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
      const dt = deltaTime / 1000; // Convert to seconds
      
      // Update players
      this.updatePlayer(this.player1, this.inputHandler.player1Input, dt);
      this.updatePlayer(this.player2, this.inputHandler.player2Input, dt);
      
      // Update enemies
      this.levelManager.updateEnemies(dt);
      
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

  private updatePlayer(player: Player, input: any, deltaTime: number) {
    // Apply input
    if (input.left && !input.right) {
      player.moveLeft();
    } else if (input.right && !input.left) {
      player.moveRight();
    } else {
      player.stopMoving();
    }
    
    if (input.jump && player.canJump()) {
      player.jump();
    }
    
    // Update physics
    player.update(deltaTime);
    
    // Handle collisions with level
    this.handlePlayerCollisions(player);
  }

  private handlePlayerCollisions(player: Player) {
    const collisions = this.levelManager.getCurrentLevel().getCollisions(player.getBounds());
    
    // Handle platform collisions
    collisions.platforms.forEach(platform => {
      if (player.velocity.y > 0 && player.position.y < platform.y) {
        // Landing on top of platform
        player.position.y = platform.y - player.height;
        player.velocity.y = 0;
        player.grounded = true;
      }
    });
    
    // Handle death collisions
    if (collisions.deaths.length > 0) {
      this.callbacks.onPlayerDeath();
    }
    
    // Handle goal collisions
    player.inGoal = collisions.goals.length > 0;
    
    // Keep players in bounds
    if (player.position.x < 0) {
      player.position.x = 0;
      player.velocity.x = 0;
    }
    if (player.position.x + player.width > this.canvas.width) {
      player.position.x = this.canvas.width - player.width;
      player.velocity.x = 0;
    }
    if (player.position.y > this.canvas.height) {
      this.callbacks.onPlayerDeath();
    }
  }

  private checkCollisions() {
    // Check player-enemy collisions
    const enemies = this.levelManager.getEnemies();
    const player1Bounds = this.player1.getBounds();
    const player2Bounds = this.player2.getBounds();
    
    enemies.forEach(enemy => {
      const enemyBounds = enemy.getBounds();
      if (this.isColliding(player1Bounds, enemyBounds) || 
          this.isColliding(player2Bounds, enemyBounds)) {
        this.callbacks.onPlayerDeath();
      }
    });
  }
  
  private isColliding(a: any, b: any): boolean {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
  }

  private checkVictory() {
    if (this.player1.inGoal && this.player2.inGoal) {
      if (this.levelManager.getCurrentLevelNumber() === 1) {
        this.callbacks.onLevelComplete();
      } else {
        this.callbacks.onVictory();
      }
    }
  }

  private render() {
    // Clear canvas
    this.ctx.fillStyle = "#1a1a2e";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Render level
    this.levelManager.getCurrentLevel().render(this.ctx);
    
    // Render enemies
    this.levelManager.renderEnemies(this.ctx);
    
    // Render players
    this.player1.render(this.ctx);
    this.player2.render(this.ctx);
  }

  restartLevel() {
    this.levelManager.restartCurrentLevel();
    const startPos = this.levelManager.getCurrentLevel().getStartPosition();
    this.player1.reset(startPos.x - 32, startPos.y);
    this.player2.reset(startPos.x + 32, startPos.y);
  }

  nextLevel(): boolean {
    if (this.levelManager.nextLevel()) {
      const startPos = this.levelManager.getCurrentLevel().getStartPosition();
      this.player1.reset(startPos.x - 32, startPos.y);
      this.player2.reset(startPos.x + 32, startPos.y);
      return true;
    }
    return false;
  }

  getCurrentLevelNumber(): number {
    return this.levelManager.getCurrentLevelNumber();
  }

  resetToLevel1() {
    this.levelManager.reset();
    const startPos = this.levelManager.getCurrentLevel().getStartPosition();
    this.player1.reset(startPos.x - 32, startPos.y);
    this.player2.reset(startPos.x + 32, startPos.y);
  }
}
