export class Projectile {
  public position: { x: number; y: number };
  public velocity: { x: number; y: number };
  public width: number;
  public height: number;
  public type: "boss" | "shockwave";
  private lifetime: number = 0;
  private maxLifetime: number = 8; // 8 seconds max

  constructor(
    x: number, 
    y: number, 
    velocityX: number, 
    velocityY: number, 
    type: "boss" | "shockwave" = "boss"
  ) {
    this.position = { x, y };
    this.velocity = { x: velocityX, y: velocityY };
    this.type = type;
    
    if (type === "shockwave") {
      this.width = 32;
      this.height = 16;
    } else {
      this.width = 16;
      this.height = 16;
    }
  }

  update(deltaTime: number) {
    // Update position
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    
    // Update lifetime
    this.lifetime += deltaTime;
  }

  shouldDestroy(): boolean {
    // Remove if outside screen bounds or exceeded lifetime
    return (
      this.position.x < -this.width ||
      this.position.x > 800 + this.width ||
      this.position.y < -this.height ||
      this.position.y > 450 + this.height ||
      this.lifetime > this.maxLifetime
    );
  }

  getBounds() {
    return {
      x: this.position.x,
      y: this.position.y,
      width: this.width,
      height: this.height
    };
  }

  render(ctx: CanvasRenderingContext2D) {
    const time = Date.now() / 200;
    
    if (this.type === "shockwave") {
      // Ground shockwave - horizontal energy wave
      const alpha = Math.max(0, 1 - (this.lifetime / 3)); // Fade over 3 seconds
      
      ctx.globalAlpha = alpha;
      
      // Main shockwave body
      ctx.fillStyle = "#FFD700";
      ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
      
      // Energy crackling effect
      ctx.fillStyle = "#FF6B6B";
      const crackle1 = Math.sin(time * 3) * 4;
      const crackle2 = Math.cos(time * 4) * 6;
      ctx.fillRect(this.position.x + crackle1, this.position.y - 4, this.width, 4);
      ctx.fillRect(this.position.x + crackle2, this.position.y + this.height, this.width, 4);
      
      ctx.globalAlpha = 1;
    } else {
      // Regular boss projectile - energy orb
      const pulseScale = 0.8 + 0.2 * Math.sin(time * 4);
      const glowIntensity = 0.6 + 0.4 * Math.sin(time * 3);
      
      // Glow effect
      ctx.shadowColor = "#9B59B6";
      ctx.shadowBlur = 10 * glowIntensity;
      
      // Main projectile body
      ctx.fillStyle = "#8E44AD";
      const scaledWidth = this.width * pulseScale;
      const scaledHeight = this.height * pulseScale;
      const offsetX = (this.width - scaledWidth) / 2;
      const offsetY = (this.height - scaledHeight) / 2;
      
      ctx.fillRect(
        this.position.x + offsetX,
        this.position.y + offsetY,
        scaledWidth,
        scaledHeight
      );
      
      // Inner core
      ctx.fillStyle = "#E74C3C";
      const coreSize = scaledWidth * 0.4;
      const coreOffsetX = (this.width - coreSize) / 2;
      const coreOffsetY = (this.height - coreSize) / 2;
      
      ctx.fillRect(
        this.position.x + coreOffsetX,
        this.position.y + coreOffsetY,
        coreSize,
        coreSize
      );
      
      // Trail effect
      ctx.fillStyle = "rgba(142, 68, 173, 0.3)";
      ctx.fillRect(
        this.position.x - this.velocity.x * 0.1,
        this.position.y - this.velocity.y * 0.1,
        this.width * 0.8,
        this.height * 0.8
      );
      
      ctx.shadowBlur = 0;
    }
  }
}