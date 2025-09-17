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
  
  public players: Player[] = [];
  // Keep legacy references for backward compatibility
  public get player1() { return this.players[0]; }
  public get player2() { return this.players[1]; }
  
  private levelManager: LevelManager;
  private inputHandler: InputHandler;
  private playerCount: number;
  
  private gameLoop: number | null = null;
  private lastTime = 0;
  private readonly targetFPS = 60;
  private readonly frameTime = 1000 / this.targetFPS;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, callbacks: GameCallbacks, gameConfig: { playerCount: number; colors: Record<string, string> }) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.callbacks = callbacks;
    this.playerCount = gameConfig.playerCount;

    // Initialize game objects
    this.levelManager = new LevelManager();
    this.inputHandler = new InputHandler(canvas, gameConfig.playerCount);
    
    // Create players at starting positions
    const startPos = this.levelManager.getCurrentLevel().getStartPosition();
    for (let i = 0; i < gameConfig.playerCount; i++) {
      const offset = (i - (gameConfig.playerCount - 1) / 2) * 64; // Spread players out
      const color = gameConfig.colors[`player${i + 1}`] || `hsl(${i * 60}, 70%, 50%)`;
      this.players.push(new Player(startPos.x + offset, startPos.y, color, `player${i + 1}`));
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
      const dt = deltaTime / 1000; // Convert to seconds
      
      // Update players
      this.players.forEach((player, index) => {
        const input = this.inputHandler.getPlayerInput(index);
        this.updatePlayer(player, input, dt);
      });
      
      // Update level (enemies, moving platforms, power-ups)
      this.levelManager.update(dt);
      
      // Check collisions
      this.checkCollisions();
      
      // Check power-up collisions (Level 3 only)
      this.checkPowerUpCollisions();
      
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
    
    // Handle moving platform collisions (Level 3)
    collisions.movingPlatforms?.forEach(platform => {
      if (player.velocity.y > 0 && player.position.y < platform.y + 2) {
        // Landing on top of moving platform
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
    
    this.players.forEach(player => {
      const playerBounds = player.getBounds();
      enemies.forEach(enemy => {
        const enemyBounds = enemy.getBounds();
        if (this.isColliding(playerBounds, enemyBounds)) {
          if (!player.useShield()) {
            this.callbacks.onPlayerDeath();
          }
        }
      });
    });
  }
  
  private checkPowerUpCollisions() {
    const currentLevel = this.levelManager.getCurrentLevel();
    if (!currentLevel.getPowerUps) return;
    
    const powerUps = currentLevel.getPowerUps();
    
    this.players.forEach(player => {
      const playerBounds = player.getBounds();
      powerUps.forEach(powerUp => {
        const powerUpBounds = powerUp.getBounds();
        if (this.isColliding(playerBounds, powerUpBounds)) {
          if (powerUp.collect()) {
            player.applyPowerUp(powerUp.type);
          }
        }
      });
    });
  }
  
  private isColliding(a: any, b: any): boolean {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
  }

  private checkVictory() {
    // For single player, only check player 1
    if (this.playerCount === 1) {
      if (this.players[0]?.inGoal) {
        const currentLevel = this.levelManager.getCurrentLevelNumber();
        if (currentLevel === 1 || currentLevel === 2) {
          this.callbacks.onLevelComplete();
        } else {
          this.callbacks.onVictory();
        }
      }
    } else {
      // For multiplayer, all players must be in goal
      const allInGoal = this.players.every(player => player.inGoal);
      if (allInGoal) {
        const currentLevel = this.levelManager.getCurrentLevelNumber();
        if (currentLevel === 1 || currentLevel === 2) {
          this.callbacks.onLevelComplete();
        } else {
          this.callbacks.onVictory();
        }
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
    this.players.forEach(player => player.render(this.ctx));
  }

  restartLevel() {
    this.levelManager.restartCurrentLevel();
    const startPos = this.levelManager.getCurrentLevel().getStartPosition();
    this.players.forEach((player, index) => {
      const offset = (index - (this.players.length - 1) / 2) * 64;
      player.reset(startPos.x + offset, startPos.y);
    });
  }

  nextLevel(): boolean {
    if (this.levelManager.nextLevel()) {
      const startPos = this.levelManager.getCurrentLevel().getStartPosition();
      this.players.forEach((player, index) => {
        const offset = (index - (this.players.length - 1) / 2) * 64;
        player.reset(startPos.x + offset, startPos.y);
      });
      return true;
    }
    return false;
  }

  getCurrentLevelNumber(): number {
    return this.levelManager.getCurrentLevelNumber();
  }

  getDifficultyInfo() {
    return this.levelManager.getDifficultyInfo();
  }

  resetToLevel1() {
    this.levelManager.reset();
    const startPos = this.levelManager.getCurrentLevel().getStartPosition();
    this.players.forEach((player, index) => {
      const offset = (index - (this.players.length - 1) / 2) * 64;
      player.reset(startPos.x + offset, startPos.y);
    });
  }
}
