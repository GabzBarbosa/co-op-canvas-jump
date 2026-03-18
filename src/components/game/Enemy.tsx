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
    
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    
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
    const x = this.position.x;
    const y = this.position.y;
    const frame = Math.floor(this.animationTime * 4) % 2;
    
    // Wolf enemy - dark gray with yellow eyes
    ctx.fillStyle = "#555";
    ctx.fillRect(x, y, this.width, this.height);
    
    // Wolf body details
    ctx.fillStyle = "#444";
    ctx.fillRect(x + 2, y + 2, this.width - 4, this.height - 4);
    
    // Ears
    ctx.fillStyle = "#555";
    ctx.fillRect(x + 2, y - 4, 5, 5);
    ctx.fillRect(x + this.width - 7, y - 4, 5, 5);
    
    // Eyes - yellow wolf eyes
    ctx.fillStyle = "#FFD700";
    if (frame === 0) {
      ctx.fillRect(x + 5, y + 6, 4, 4);
      ctx.fillRect(x + 15, y + 6, 4, 4);
    } else {
      ctx.fillRect(x + 5, y + 7, 4, 2);
      ctx.fillRect(x + 15, y + 7, 4, 2);
    }
    
    // Pupils
    ctx.fillStyle = "#000";
    ctx.fillRect(x + 7, y + 7, 2, 2);
    ctx.fillRect(x + 17, y + 7, 2, 2);
    
    // Snout
    ctx.fillStyle = "#666";
    if (this.direction === "horizontal") {
      const dir = this.velocity.x > 0 ? 1 : -1;
      ctx.fillRect(x + (dir > 0 ? this.width : -4), y + 10, 4, 6);
      // Nose
      ctx.fillStyle = "#333";
      ctx.fillRect(x + (dir > 0 ? this.width : -3), y + 11, 2, 3);
    } else {
      ctx.fillRect(x + 8, y + (this.velocity.y > 0 ? this.height : -4), 8, 4);
      ctx.fillStyle = "#333";
      ctx.fillRect(x + 10, y + (this.velocity.y > 0 ? this.height : -3), 4, 2);
    }
    
    // Tail
    ctx.fillStyle = "#555";
    const tailWag = Math.sin(this.animationTime * 8) * 3;
    if (this.direction === "horizontal") {
      const dir = this.velocity.x > 0 ? -1 : 1;
      ctx.fillRect(x + (dir > 0 ? this.width : -6), y + 4 + tailWag, 6, 3);
    }
  }
}
