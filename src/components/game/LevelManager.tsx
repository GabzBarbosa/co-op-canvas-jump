import { Level } from "./Level";
import { Level2 } from "./Level2";
import { Level3 } from "./Level3";
import { Level4 } from "./Level4";
import { Enemy } from "./Enemy";
import { Boss } from "./Boss";

export interface ILevel {
  getStartPosition(): { x: number; y: number };
  getCollisions(bounds: any): any;
  render(ctx: CanvasRenderingContext2D): void;
  update?(deltaTime: number): void;
  getPowerUps?(): any[];
  getMovingPlatforms?(): any[];
  reset?(): void;
}

export class LevelManager {
  private currentLevel = 1;
  private level1: Level;
  private level2: Level2;
  private level3: Level3;
  private level4: Level4;
  private enemies: Enemy[] = [];
  private boss: Boss | null = null;
  private difficultyTimer = 0;
  private difficultyLevel = 1; // 1: easy, 2: medium, 3: hard

  constructor() {
    this.level1 = new Level();
    this.level2 = new Level2();
    this.level3 = new Level3();
    this.level4 = new Level4();
  }

  getCurrentLevel(): ILevel {
    if (this.currentLevel === 1) return this.level1;
    if (this.currentLevel === 2) return this.level2;
    if (this.currentLevel === 3) return this.level3;
    return this.level4;
  }

  getCurrentLevelNumber(): number {
    return this.currentLevel;
  }

  setLevel(level: number): void {
    if (level >= 1 && level <= 4) {
      this.currentLevel = level;
      this.setupEnemies();
      this.setupBoss();
    }
  }

  nextLevel(): boolean {
    if (this.currentLevel < 4) {
      this.currentLevel++;
      this.setupEnemies();
      this.setupBoss();
      return true;
    }
    return false;
  }

  restartCurrentLevel() {
    this.difficultyTimer = 0;
    this.difficultyLevel = 1;
    this.setupEnemies();
    this.setupBoss();
    
    // Reset level-specific elements
    const currentLevel = this.getCurrentLevel();
    if (currentLevel.reset) {
      currentLevel.reset();
    }
  }

  reset() {
    this.currentLevel = 1;
    this.enemies = [];
    this.boss = null;
    this.difficultyTimer = 0;
    this.difficultyLevel = 1;
  }

  private setupEnemies() {
    this.enemies = [];
    
    if (this.currentLevel === 1) {
      // Level 1: Basic enemies for introduction + 2 more
      this.enemies.push(new Enemy(300, 320, "horizontal", 280, 450, 60));
      this.enemies.push(new Enemy(600, 280, "vertical", 200, 350, 50));
      this.enemies.push(new Enemy(150, 280, "horizontal", 100, 250, 55));
      this.enemies.push(new Enemy(700, 320, "vertical", 280, 380, 65));
    }
    
    if (this.currentLevel === 2) {
      const baseSpeed = 80;
      
      // Difficulty progression: 2 -> 4 -> 6 enemies
      // Speed multipliers: 1.0 -> 1.2 -> 1.4
      const speedMultiplier = 1 + (this.difficultyLevel - 1) * 0.2;
      const currentSpeed = baseSpeed * speedMultiplier;
      
      // Always start with 4 basic enemies (2 more added)
      this.enemies.push(new Enemy(200, 320, "horizontal", 160, 400, currentSpeed));
      this.enemies.push(new Enemy(500, 256, "horizontal", 450, 650, currentSpeed));
      this.enemies.push(new Enemy(350, 300, "vertical", 250, 380, currentSpeed));
      this.enemies.push(new Enemy(120, 280, "horizontal", 80, 300, currentSpeed));
      
      // Add more enemies based on difficulty level
      if (this.difficultyLevel >= 2) {
        this.enemies.push(new Enemy(320, 200, "vertical", 150, 350, currentSpeed));
        this.enemies.push(new Enemy(600, 100, "vertical", 80, 280, currentSpeed));
      }
      
      if (this.difficultyLevel >= 3) {
        this.enemies.push(new Enemy(100, 180, "horizontal", 80, 300, currentSpeed));
        this.enemies.push(new Enemy(700, 300, "vertical", 250, 400, currentSpeed));
      }
    }
    
    if (this.currentLevel === 3) {
      // Level 3: Enemies that interact with moving platforms + 2 more
      this.enemies.push(new Enemy(250, 300, "horizontal", 200, 400, 70));
      this.enemies.push(new Enemy(500, 200, "vertical", 180, 320, 65));
      this.enemies.push(new Enemy(650, 320, "horizontal", 600, 750, 75));
      this.enemies.push(new Enemy(420, 250, "horizontal", 380, 480, 68));
      this.enemies.push(new Enemy(150, 250, "vertical", 200, 350, 72));
    }
  }

  private setupBoss() {
    if (this.currentLevel === 4) {
      if (!this.boss || this.boss.isDefeated) {
        this.boss = new Boss(336, 64); // Center-top of arena
      } else {
        this.boss.reset();
      }
    } else {
      this.boss = null;
    }
  }

  getEnemies(): Enemy[] {
    return this.enemies;
  }

  getBoss(): Boss | null {
    return this.boss;
  }

  isBossLevel(): boolean {
    return this.currentLevel === 4;
  }

  activateButton(buttonId: string) {
    if (this.currentLevel === 4) {
      this.level4.activateButton(buttonId);
    }
  }

  deactivateButton(buttonId: string) {
    if (this.currentLevel === 4) {
      this.level4.deactivateButton(buttonId);
    }
  }

  areBothButtonsActivated(): boolean {
    if (this.currentLevel === 4) {
      return this.level4.areBothButtonsActivated();
    }
    return false;
  }

  update(deltaTime: number) {
    // Update level-specific elements
    const currentLevel = this.getCurrentLevel();
    if (currentLevel.update) {
      currentLevel.update(deltaTime);
    }
    
    // Only update difficulty in level 2
    if (this.currentLevel === 2) {
      this.difficultyTimer += deltaTime;
      
      // Increase difficulty every 25 seconds
      const newDifficultyLevel = Math.min(3, Math.floor(this.difficultyTimer / 25) + 1);
      
      if (newDifficultyLevel > this.difficultyLevel) {
        this.difficultyLevel = newDifficultyLevel;
        this.setupEnemies(); // Respawn enemies with new difficulty
      }
    }
    
    // Update boss in level 4
    if (this.currentLevel === 4 && this.boss) {
      this.boss.update(deltaTime);
    }
    
    this.enemies.forEach(enemy => enemy.update(deltaTime));
  }

  renderEnemies(ctx: CanvasRenderingContext2D) {
    this.enemies.forEach(enemy => enemy.render(ctx));
  }

  renderBoss(ctx: CanvasRenderingContext2D) {
    if (this.boss && this.currentLevel === 4) {
      this.boss.render(ctx);
    }
  }

  getDifficultyInfo() {
    return {
      level: this.difficultyLevel,
      timer: this.difficultyTimer,
      enemyCount: this.enemies.length
    };
  }
}