interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type PowerUpType = "speed" | "shield";

export class PowerUp {
  public position: { x: number; y: number };
  public readonly width = 20;
  public readonly height = 20;
  public type: PowerUpType;
  public collected = false;
  private lifeTimer = 0;
  private readonly maxLifetime = 10; // 10 seconds
  private animationTime = 0;

  constructor(x: number, y: number, type: PowerUpType) {
    this.position = { x, y };
    this.type = type;
  }

  update(deltaTime: number) {
    if (this.collected) return;
    
    this.lifeTimer += deltaTime;
    this.animationTime += deltaTime;
    
    // Disappear after maxLifetime
    if (this.lifeTimer >= this.maxLifetime) {
      this.collected = true;
    }
  }

  collect(): boolean {
    if (!this.collected) {
      this.collected = true;
      return true;
    }
    return false;
  }

  getBounds(): Bounds {
    return {
      x: this.position.x,
      y: this.position.y,
      width: this.width,
      height: this.height,
    };
  }

  render(ctx: CanvasRenderingContext2D) {
    if (this.collected) return;

    // Pulsing effect as it gets closer to expiring
    const pulseIntensity = Math.max(0, (this.maxLifetime - this.lifeTimer) / this.maxLifetime);
    const pulse = 0.8 + 0.2 * Math.sin(this.animationTime * 8) * pulseIntensity;
    
    ctx.save();
    ctx.globalAlpha = pulse;

    if (this.type === "speed") {
      // Speed boost - yellow/orange
      ctx.fillStyle = "#F39C12";
      ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
      
      // Lightning bolt pattern
      ctx.fillStyle = "#FFF";
      ctx.fillRect(this.position.x + 8, this.position.y + 4, 4, 8);
      ctx.fillRect(this.position.x + 6, this.position.y + 8, 8, 4);
      ctx.fillRect(this.position.x + 8, this.position.y + 8, 4, 8);
    } else if (this.type === "shield") {
      // Shield - blue/cyan
      ctx.fillStyle = "#3498DB";
      ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
      
      // Shield pattern
      ctx.fillStyle = "#FFF";
      ctx.fillRect(this.position.x + 6, this.position.y + 4, 8, 12);
      ctx.fillStyle = "#3498DB";
      ctx.fillRect(this.position.x + 8, this.position.y + 6, 4, 8);
    }

    ctx.restore();
  }
}