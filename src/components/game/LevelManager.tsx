import { Level } from "./Level";
import { Level2 } from "./Level2";
import { Enemy } from "./Enemy";

export interface ILevel {
  getStartPosition(): { x: number; y: number };
  getCollisions(bounds: any): any;
  render(ctx: CanvasRenderingContext2D): void;
}

export class LevelManager {
  private currentLevel = 1;
  private level1: Level;
  private level2: Level2;
  private enemies: Enemy[] = [];

  constructor() {
    this.level1 = new Level();
    this.level2 = new Level2();
  }

  getCurrentLevel(): ILevel {
    return this.currentLevel === 1 ? this.level1 : this.level2;
  }

  getCurrentLevelNumber(): number {
    return this.currentLevel;
  }

  nextLevel(): boolean {
    if (this.currentLevel < 2) {
      this.currentLevel++;
      this.setupEnemies();
      return true;
    }
    return false;
  }

  restartCurrentLevel() {
    this.setupEnemies();
  }

  reset() {
    this.currentLevel = 1;
    this.enemies = [];
  }

  private setupEnemies() {
    this.enemies = [];
    
    if (this.currentLevel === 2) {
      // Horizontal enemies
      this.enemies.push(new Enemy(200, 320, "horizontal", 160, 400));
      this.enemies.push(new Enemy(500, 256, "horizontal", 450, 650));
      
      // Vertical enemies
      this.enemies.push(new Enemy(320, 200, "vertical", 150, 350));
      this.enemies.push(new Enemy(600, 100, "vertical", 80, 280));
    }
  }

  getEnemies(): Enemy[] {
    return this.enemies;
  }

  updateEnemies(deltaTime: number) {
    this.enemies.forEach(enemy => enemy.update(deltaTime));
  }

  renderEnemies(ctx: CanvasRenderingContext2D) {
    this.enemies.forEach(enemy => enemy.render(ctx));
  }
}