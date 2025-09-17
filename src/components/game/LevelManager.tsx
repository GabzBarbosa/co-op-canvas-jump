import { Level } from "./Level";
import { Level2 } from "./Level2";
import { Level3 } from "./Level3";
import { Enemy } from "./Enemy";

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
  private enemies: Enemy[] = [];
  private difficultyTimer = 0;
  private difficultyLevel = 1; // 1: easy, 2: medium, 3: hard

  constructor() {
    this.level1 = new Level();
    this.level2 = new Level2();
    this.level3 = new Level3();
  }

  getCurrentLevel(): ILevel {
    if (this.currentLevel === 1) return this.level1;
    if (this.currentLevel === 2) return this.level2;
    return this.level3;
  }

  getCurrentLevelNumber(): number {
    return this.currentLevel;
  }

  nextLevel(): boolean {
    if (this.currentLevel < 3) {
      this.currentLevel++;
      this.setupEnemies();
      return true;
    }
    return false;
  }

  restartCurrentLevel() {
    this.difficultyTimer = 0;
    this.difficultyLevel = 1;
    this.setupEnemies();
    
    // Reset level-specific elements
    const currentLevel = this.getCurrentLevel();
    if (currentLevel.reset) {
      currentLevel.reset();
    }
  }

  reset() {
    this.currentLevel = 1;
    this.enemies = [];
    this.difficultyTimer = 0;
    this.difficultyLevel = 1;
  }

  private setupEnemies() {
    this.enemies = [];
    
    if (this.currentLevel === 2) {
      const baseSpeed = 80;
      
      // Difficulty progression: 2 -> 4 -> 6 enemies
      // Speed multipliers: 1.0 -> 1.2 -> 1.4
      const speedMultiplier = 1 + (this.difficultyLevel - 1) * 0.2;
      const currentSpeed = baseSpeed * speedMultiplier;
      
      // Always start with 2 basic enemies
      this.enemies.push(new Enemy(200, 320, "horizontal", 160, 400, currentSpeed));
      this.enemies.push(new Enemy(500, 256, "horizontal", 450, 650, currentSpeed));
      
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
  }

  getEnemies(): Enemy[] {
    return this.enemies;
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
    
    this.enemies.forEach(enemy => enemy.update(deltaTime));
  }

  renderEnemies(ctx: CanvasRenderingContext2D) {
    this.enemies.forEach(enemy => enemy.render(ctx));
  }

  getDifficultyInfo() {
    return {
      level: this.difficultyLevel,
      timer: this.difficultyTimer,
      enemyCount: this.enemies.length
    };
  }
}