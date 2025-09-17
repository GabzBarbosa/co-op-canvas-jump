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

    // Render goal - Boss Portal
    const time = Date.now() / 1000;
    this.goals.forEach(goal => {
      // Portal base
      ctx.fillStyle = "#8E44AD"; // Purple base for boss portal
      ctx.fillRect(goal.x, goal.y, goal.width, goal.height);
      
      // Animated portal ring
      const pulseScale = 0.9 + 0.1 * Math.sin(time * 4);
      const ringAlpha = 0.7 + 0.3 * Math.sin(time * 3);
      
      ctx.globalAlpha = ringAlpha;
      ctx.fillStyle = "#9B59B6";
      const ringWidth = goal.width * pulseScale;
      const ringHeight = goal.height * pulseScale;
      const offsetX = (goal.width - ringWidth) / 2;
      const offsetY = (goal.height - ringHeight) / 2;
      ctx.fillRect(goal.x + offsetX, goal.y + offsetY, ringWidth, ringHeight);
      
      // Inner portal swirl
      ctx.fillStyle = "#2C3E50";
      const innerSize = ringWidth * 0.6;
      const innerOffsetX = (goal.width - innerSize) / 2;
      const innerOffsetY = (goal.height - innerSize) / 2;
      ctx.fillRect(goal.x + innerOffsetX, goal.y + innerOffsetY, innerSize, innerSize);
      
      // Swirling energy effect
      ctx.fillStyle = "#E74C3C";
      const energyOffset = Math.sin(time * 6) * 4;
      ctx.fillRect(goal.x + 20 + energyOffset, goal.y + 6, 8, 8);
      ctx.fillRect(goal.x + 35 - energyOffset, goal.y + 10, 6, 6);
      
      ctx.globalAlpha = 1;
      
      // Portal label
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "10px monospace";
      ctx.textAlign = "center";
      ctx.fillText("BOSS", goal.x + goal.width / 2, goal.y - 8);
      ctx.fillText("PORTAL", goal.x + goal.width / 2, goal.y + goal.height + 18);
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