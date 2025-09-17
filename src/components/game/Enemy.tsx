interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class Enemy {
  public position: { x: number; y: number };
  public readonly width = 24;
  public readonly height = 24;
  private velocity: { x: number; y: number };
  private baseSpeed: number;
  private currentSpeed: number;
  private readonly minX: number;
  private readonly maxX: number;
  private readonly minY: number;
  private readonly maxY: number;
  private readonly direction: "horizontal" | "vertical";
  private animationTime = 0;

  constructor(
    x: number, 
    y: number, 
    direction: "horizontal" | "vertical",
    minBound: number,
    maxBound: number,
    baseSpeed: number = 80
  ) {
    this.position = { x, y };
    this.direction = direction;
    this.baseSpeed = baseSpeed;
    this.currentSpeed = baseSpeed;
    
    if (direction === "horizontal") {
      this.minX = minBound;
      this.maxX = maxBound;
      this.minY = y;
      this.maxY = y;
      this.velocity = { x: this.currentSpeed, y: 0 };
    } else {
      this.minX = x;
      this.maxX = x;
      this.minY = minBound;
      this.maxY = maxBound;
      this.velocity = { x: 0, y: this.currentSpeed };
    }
  }

  update(deltaTime: number) {
    this.animationTime += deltaTime;
    
    // Update position
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    
    // Bounce off boundaries
    if (this.direction === "horizontal") {
      if (this.position.x <= this.minX || this.position.x + this.width >= this.maxX) {
        this.velocity.x *= -1;
        this.position.x = Math.max(this.minX, Math.min(this.maxX - this.width, this.position.x));
      }
    } else {
      if (this.position.y <= this.minY || this.position.y + this.height >= this.maxY) {
        this.velocity.y *= -1;
        this.position.y = Math.max(this.minY, Math.min(this.maxY - this.height, this.position.y));
      }
    }
  }

  setSpeedMultiplier(multiplier: number) {
    const newSpeed = this.baseSpeed * multiplier;
    const speedChange = newSpeed / this.currentSpeed;
    
    this.currentSpeed = newSpeed;
    this.velocity.x *= speedChange;
    this.velocity.y *= speedChange;
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
    // Main enemy body - red with pixel art style
    ctx.fillStyle = "#E74C3C";
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    
    // Add animated details
    const frame = Math.floor(this.animationTime * 4) % 2;
    
    // Eyes that blink
    ctx.fillStyle = "#FFFFFF";
    if (frame === 0) {
      ctx.fillRect(this.position.x + 6, this.position.y + 6, 4, 4);
      ctx.fillRect(this.position.x + 14, this.position.y + 6, 4, 4);
    } else {
      ctx.fillRect(this.position.x + 6, this.position.y + 8, 4, 2);
      ctx.fillRect(this.position.x + 14, this.position.y + 8, 4, 2);
    }
    
    // Direction indicator
    ctx.fillStyle = "#C0392B";
    if (this.direction === "horizontal") {
      // Horizontal spikes
      ctx.fillRect(this.position.x, this.position.y + 10, 4, 4);
      ctx.fillRect(this.position.x + this.width - 4, this.position.y + 10, 4, 4);
    } else {
      // Vertical spikes
      ctx.fillRect(this.position.x + 10, this.position.y, 4, 4);
      ctx.fillRect(this.position.x + 10, this.position.y + this.height - 4, 4, 4);
    }
  }
}