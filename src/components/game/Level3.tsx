import { ILevel } from "./LevelManager";
import { PowerUp, PowerUpType } from "./PowerUp";
import { MovingPlatform } from "./MovingPlatform";

export class Level3 implements ILevel {
  private platforms: Array<{x: number, y: number, width: number, height: number}> = [];
  private deaths: Array<{x: number, y: number, width: number, height: number}> = [];
  private goals: Array<{x: number, y: number, width: number, height: number}> = [];
  private powerUps: PowerUp[] = [];
  private movingPlatforms: MovingPlatform[] = [];

  constructor() {
    this.setupLevel();
  }

  private setupLevel() {
    // Static platforms - more challenging layout
    this.platforms = [
      // Starting platform
      { x: 50, y: 360, width: 100, height: 20 },
      
      // First gap with moving platform (horizontal)
      { x: 250, y: 320, width: 80, height: 20 },
      
      // High platform requiring jump coordination
      { x: 420, y: 280, width: 60, height: 20 },
      
      // Lower platform with power-up
      { x: 550, y: 340, width: 80, height: 20 },
      
      // Final challenge area
      { x: 700, y: 300, width: 60, height: 20 },
      { x: 820, y: 260, width: 80, height: 20 },
      
      // Goal platform
      { x: 950, y: 340, width: 80, height: 20 }
    ];

    // Death zones (spikes and pits)
    this.deaths = [
      // Spikes under gaps
      { x: 180, y: 380, width: 40, height: 20 },
      { x: 360, y: 380, width: 40, height: 20 },
      { x: 650, y: 380, width: 40, height: 20 },
      
      // Bottom death zone
      { x: 0, y: 400, width: 1024, height: 100 }
    ];

    // Goal area
    this.goals = [
      { x: 960, y: 320, width: 60, height: 20 }
    ];

    // Moving platforms
    this.movingPlatforms = [
      // Horizontal platform bridging first gap
      new MovingPlatform(160, 340, 80, 16, "horizontal", 160, 240, 40),
      
      // Vertical platform creating timing challenge
      new MovingPlatform(480, 240, 60, 16, "vertical", 240, 320, 50),
      
      // Another horizontal platform for final approach
      new MovingPlatform(760, 280, 70, 16, "horizontal", 760, 850, 45)
    ];

    // Power-ups in strategic/risky locations
    this.powerUps = [
      new PowerUp(280, 290, "speed" as PowerUpType), // On first static platform
      new PowerUp(500, 210, "shield" as PowerUpType), // High risk area
      new PowerUp(580, 310, "speed" as PowerUpType), // Before final challenge
    ];
  }

  getStartPosition(): { x: number; y: number } {
    return { x: 100, y: 330 };
  }

  getCollisions(bounds: any): any {
    const result = {
      platforms: [] as any[],
      deaths: [] as any[],
      goals: [] as any[],
      movingPlatforms: [] as any[]
    };

    // Check static platforms
    this.platforms.forEach(platform => {
      if (this.isColliding(bounds, platform)) {
        result.platforms.push(platform);
      }
    });

    // Check moving platforms
    this.movingPlatforms.forEach(platform => {
      const topBounds = platform.getTopBounds();
      if (this.isColliding(bounds, topBounds)) {
        result.movingPlatforms.push(platform);
      }
    });

    // Check deaths
    this.deaths.forEach(death => {
      if (this.isColliding(bounds, death)) {
        result.deaths.push(death);
      }
    });

    // Check goals
    this.goals.forEach(goal => {
      if (this.isColliding(bounds, goal)) {
        result.goals.push(goal);
      }
    });

    return result;
  }

  private isColliding(a: any, b: any): boolean {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
  }

  update(deltaTime: number) {
    this.movingPlatforms.forEach(platform => platform.update(deltaTime));
    this.powerUps.forEach(powerUp => powerUp.update(deltaTime));
  }

  render(ctx: CanvasRenderingContext2D): void {
    // Render static platforms
    ctx.fillStyle = "#27AE60";
    this.platforms.forEach(platform => {
      ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });

    // Render death zones (spikes)
    ctx.fillStyle = "#E74C3C";
    this.deaths.forEach(death => {
      if (death.height === 20) { // Spikes
        ctx.fillRect(death.x, death.y, death.width, death.height);
        // Add spike pattern
        ctx.fillStyle = "#C0392B";
        for (let i = 0; i < death.width; i += 8) {
          ctx.fillRect(death.x + i + 2, death.y, 4, 8);
        }
        ctx.fillStyle = "#E74C3C";
      } else {
        ctx.fillRect(death.x, death.y, death.width, death.height);
      }
    });

    // Render goal
    ctx.fillStyle = "#F39C12";
    this.goals.forEach(goal => {
      ctx.fillRect(goal.x, goal.y, goal.width, goal.height);
      // Portal effect
      ctx.fillStyle = "#FFF";
      ctx.fillRect(goal.x + 10, goal.y + 4, goal.width - 20, goal.height - 8);
      ctx.fillStyle = "#F39C12";
      ctx.fillRect(goal.x + 15, goal.y + 8, goal.width - 30, goal.height - 16);
    });

    // Render moving platforms
    this.movingPlatforms.forEach(platform => platform.render(ctx));

    // Render power-ups
    this.powerUps.forEach(powerUp => powerUp.render(ctx));
  }

  getPowerUps(): PowerUp[] {
    return this.powerUps.filter(powerUp => !powerUp.collected);
  }

  getMovingPlatforms(): MovingPlatform[] {
    return this.movingPlatforms;
  }

  reset() {
    // Reset power-ups
    this.powerUps.forEach(powerUp => {
      powerUp.collected = false;
    });
  }
}