interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class MovingPlatform {
  public position: { x: number; y: number };
  public readonly width: number;
  public readonly height: number;
  private velocity: { x: number; y: number };
  private readonly minX: number;
  private readonly maxX: number;
  private readonly minY: number;
  private readonly maxY: number;
  private readonly direction: "horizontal" | "vertical";
  private readonly speed: number;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    direction: "horizontal" | "vertical",
    minBound: number,
    maxBound: number,
    speed: number = 50
  ) {
    this.position = { x, y };
    this.width = width;
    this.height = height;
    this.direction = direction;
    this.speed = speed;
    
    if (direction === "horizontal") {
      this.minX = minBound;
      this.maxX = maxBound;
      this.minY = y;
      this.maxY = y;
      this.velocity = { x: this.speed, y: 0 };
    } else {
      this.minX = x;
      this.maxX = x;
      this.minY = minBound;
      this.maxY = maxBound;
      this.velocity = { x: 0, y: this.speed };
    }
  }

  update(deltaTime: number) {
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

  getBounds(): Bounds {
    return {
      x: this.position.x,
      y: this.position.y,
      width: this.width,
      height: this.height,
    };
  }

  getTopBounds(): Bounds {
    return {
      x: this.position.x,
      y: this.position.y - 2, // Small buffer for landing detection
      width: this.width,
      height: 4,
    };
  }

  render(ctx: CanvasRenderingContext2D) {
    // Main platform - dark gray
    ctx.fillStyle = "#34495E";
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    
    // Top surface - lighter gray
    ctx.fillStyle = "#5D6D7E";
    ctx.fillRect(this.position.x, this.position.y, this.width, 4);
    
    // Movement indicator
    ctx.fillStyle = "#E67E22";
    if (this.direction === "horizontal") {
      // Horizontal arrows
      for (let i = 8; i < this.width - 8; i += 16) {
        ctx.fillRect(this.position.x + i, this.position.y + this.height / 2 - 1, 8, 2);
      }
    } else {
      // Vertical arrows
      for (let i = 8; i < this.height - 8; i += 16) {
        ctx.fillRect(this.position.x + this.width / 2 - 1, this.position.y + i, 2, 8);
      }
    }
  }
}