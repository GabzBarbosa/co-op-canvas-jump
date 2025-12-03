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
  private lastBossDamageTime: number = 0;
  private lastBossTouchDamageTime: number = 0;
  
  private gameLoop: number | null = null;
  private lastTime = 0;
  private readonly targetFPS = 60;
  private readonly frameTime = 1000 / this.targetFPS;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, callbacks: GameCallbacks, gameConfig: { playerCount: number; colors: Record<string, string>; startLevel?: number; controls?: Record<string, number> }) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.callbacks = callbacks;
    this.playerCount = gameConfig.playerCount;

    // Initialize game objects
    this.levelManager = new LevelManager();
    this.inputHandler = new InputHandler(canvas, gameConfig.playerCount, gameConfig.controls);
    
    // Set starting level if specified
    if (gameConfig.startLevel && gameConfig.startLevel > 1) {
      this.levelManager.setLevel(gameConfig.startLevel);
    }
    
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
      
      // Check boss mechanics (Level 4)
      if (this.levelManager.isBossLevel()) {
        this.checkBossMechanics();
      }
      
      // Check victory condition
      this.checkVictory();
      
      // Render everything
      this.render();
      
      this.lastTime = currentTime;
    }
    
    this.gameLoop = requestAnimationFrame(this.update);
  };

  private updatePlayer(player: Player, input: any, deltaTime: number) {
    // Set current level for player-specific mechanics
    player.setCurrentLevel(this.getCurrentLevelNumber());
    
    // Apply input
    if (input.left && !input.right) {
      player.moveLeft();
    } else if (input.right && !input.left) {
      player.moveRight();
    } else {
      player.stopMoving();
    }
    
    // Handle jumping based on level and input type
    if (this.getCurrentLevelNumber() === 2) {
      // Level 2: Variable jump system
      if (input.jumpType && input.jumpType !== 'none') {
        player.variableJump(input.jumpType as 'short' | 'long' | 'double');
      }
    } else {
      // Other levels: Standard jump system
      if (input.jump && player.canJump()) {
        player.jump();
      } else if (input.doubleJump && player.canPerformDoubleJump()) {
        player.doubleJump();
      }
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
    if (collisions.movingPlatforms) {
      collisions.movingPlatforms.forEach(platform => {
        if (player.velocity.y > 0 && player.position.y < platform.y + 2) {
          // Landing on top of moving platform
          player.position.y = platform.y - player.height;
          player.velocity.y = 0;
          player.grounded = true;
        }
      });
    }
    
    // Handle button collisions (Level 4)
    if (collisions.buttons && this.levelManager.isBossLevel()) {
      collisions.buttons.forEach(button => {
        if (button.buttonId) {
          this.levelManager.activateButton(button.buttonId);
        }
      });
    }
    
    // Deactivate buttons when player leaves them
    if (this.levelManager.isBossLevel()) {
      const currentButtons = collisions.buttons || [];
      const allButtons = ["button1", "button2"];
      
      allButtons.forEach(buttonId => {
        const isOnButton = currentButtons.some(button => button.buttonId === buttonId);
        if (!isOnButton) {
          // Check if any other player is on this button
          const otherPlayersOnButton = this.players.some(otherPlayer => {
            if (otherPlayer === player) return false;
            const otherCollisions = this.levelManager.getCurrentLevel().getCollisions(otherPlayer.getBounds());
            return (otherCollisions.buttons || []).some(button => button.buttonId === buttonId);
          });
          
          if (!otherPlayersOnButton) {
            this.levelManager.deactivateButton(buttonId);
          }
        }
      });
    }
    
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

    // Check boss collisions (Level 4)
    if (this.levelManager.isBossLevel()) {
      const boss = this.levelManager.getBoss();
      if (boss && !boss.isDefeated) {
        const bossBounds = boss.getBounds();
        
        this.players.forEach(player => {
          const playerBounds = player.getBounds();
          
          // Boss body collision - damage boss on touch
          if (this.isColliding(playerBounds, bossBounds)) {
            const currentTime = Date.now();
            if (!this.lastBossTouchDamageTime || currentTime - this.lastBossTouchDamageTime > 500) {
              boss.takeDamage(1); // 1 damage per touch with 0.5s cooldown
              this.lastBossTouchDamageTime = currentTime;
            }
          }
          
          // Boss projectile collisions
          const projectiles = boss.getProjectiles();
          projectiles.forEach(projectile => {
            const projectileBounds = projectile.getBounds();
            if (this.isColliding(playerBounds, projectileBounds)) {
              if (!player.useShield()) {
                this.callbacks.onPlayerDeath();
              }
            }
          });
        });
      }
    }
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

  private checkBossMechanics() {
    const boss = this.levelManager.getBoss();
    if (!boss || boss.isDefeated) return;

    // Check if both buttons are activated to damage boss
    if (this.levelManager.areBothButtonsActivated()) {
      // Deal damage every 0.5 seconds when both buttons are held
      const currentTime = Date.now();
      if (!this.lastBossDamageTime || currentTime - this.lastBossDamageTime > 500) {
        boss.takeDamage(5); // 5 damage per 0.5 seconds = 10 DPS
        this.lastBossDamageTime = currentTime;
      }
    }
  }
  
  private isColliding(a: any, b: any): boolean {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
  }

  private checkVictory() {
    // Level 4 (Boss fight) - check if boss is defeated
    if (this.levelManager.isBossLevel()) {
      const boss = this.levelManager.getBoss();
      if (boss && boss.isDefeated) {
        this.callbacks.onVictory(); // Final victory for boss defeat
      }
      return;
    }

    // For single player, only check player 1
    if (this.playerCount === 1) {
      if (this.players[0]?.inGoal) {
        const currentLevel = this.levelManager.getCurrentLevelNumber();
        if (currentLevel === 1 || currentLevel === 2 || currentLevel === 3) {
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
        if (currentLevel === 1 || currentLevel === 2 || currentLevel === 3) {
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
    
    // Render boss (Level 4)
    this.levelManager.renderBoss(this.ctx);
    
    // Render players
    this.players.forEach(player => player.render(this.ctx));
    
    // Render boss health bar (Level 4)
    if (this.levelManager.isBossLevel()) {
      this.renderBossHealthBar();
    }
  }

  private renderBossHealthBar() {
    const boss = this.levelManager.getBoss();
    if (!boss) return;

    const barWidth = 300;
    const barHeight = 20;
    const barX = (this.canvas.width - barWidth) / 2;
    const barY = 20;
    
    // Background
    this.ctx.fillStyle = "#2C3E50";
    this.ctx.fillRect(barX - 4, barY - 4, barWidth + 8, barHeight + 8);
    
    // Health bar background
    this.ctx.fillStyle = "#34495E";
    this.ctx.fillRect(barX, barY, barWidth, barHeight);
    
    // Health bar fill
    const healthPercent = boss.getHealthPercentage() / 100;
    const fillWidth = barWidth * healthPercent;
    
    // Color based on health
    let healthColor = "#27AE60"; // Green
    if (healthPercent < 0.7) healthColor = "#F39C12"; // Orange
    if (healthPercent < 0.4) healthColor = "#E74C3C"; // Red
    
    this.ctx.fillStyle = healthColor;
    this.ctx.fillRect(barX, barY, fillWidth, barHeight);
    
    // Boss name and phase
    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.font = "16px monospace";
    this.ctx.textAlign = "center";
    this.ctx.fillText(`BOSS - FASE ${boss.getCurrentPhase()}`, this.canvas.width / 2, barY - 8);
    
    // Health text
    this.ctx.font = "12px monospace";
    this.ctx.fillText(`${Math.ceil(boss.currentHealth)}/${boss.maxHealth}`, this.canvas.width / 2, barY + 14);
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
