export class Player {
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  width: number = 24;
  height: number = 32;
  color: string;
  id: string;
  grounded: boolean = false;
  inGoal: boolean = false;
  private jumpsUsed: number = 0;
  private readonly maxJumps = 2;
  private wasGroundedLastFrame: boolean = false;
  private canDoubleJump: boolean = false;
  
  private readonly maxSpeed = 200;
  private readonly jumpPower = 320;
  private readonly acceleration = 800;
  private readonly friction = 600;
  private readonly gravity = 1200;
  
  // Power-up effects
  public speedBoostTimer = 0;
  public hasShield = false;
  private speedMultiplier = 1;
  
  private startX: number;
  private startY: number;

  constructor(x: number, y: number, color: string, id: string) {
    this.position = { x, y };
    this.velocity = { x: 0, y: 0 };
    this.color = color;
    this.id = id;
    this.startX = x;
    this.startY = y;
  }

  moveLeft() {
    const currentMaxSpeed = this.maxSpeed * this.speedMultiplier;
    this.velocity.x = Math.max(this.velocity.x - this.acceleration * (1/60), -currentMaxSpeed);
  }

  moveRight() {
    const currentMaxSpeed = this.maxSpeed * this.speedMultiplier;
    this.velocity.x = Math.min(this.velocity.x + this.acceleration * (1/60), currentMaxSpeed);
  }

  stopMoving() {
    if (this.grounded) {
      if (this.velocity.x > 0) {
        this.velocity.x = Math.max(0, this.velocity.x - this.friction * (1/60));
      } else if (this.velocity.x < 0) {
        this.velocity.x = Math.min(0, this.velocity.x + this.friction * (1/60));
      }
    }
  }

  jump() {
    if (this.grounded && this.jumpsUsed === 0) {
      this.velocity.y = -this.jumpPower;
      this.jumpsUsed++;
      this.grounded = false;
      this.canDoubleJump = true; // Enable double jump after first jump
    }
  }

  doubleJump() {
    if (this.canDoubleJump && this.jumpsUsed === 1) {
      this.velocity.y = -this.jumpPower * 0.8; // Slightly weaker second jump
      this.jumpsUsed++;
      this.canDoubleJump = false;
    }
  }

  canJump(): boolean {
    return this.grounded && this.jumpsUsed === 0;
  }

  canPerformDoubleJump(): boolean {
    return this.canDoubleJump && this.jumpsUsed === 1;
  }

  update(deltaTime: number) {
    // Reset jump count when landing (check at start of frame)
    if (!this.wasGroundedLastFrame && this.grounded) {
      this.jumpsUsed = 0;
      this.canDoubleJump = false;
    }
    this.wasGroundedLastFrame = this.grounded;
    
    // Update power-up effects
    if (this.speedBoostTimer > 0) {
      this.speedBoostTimer -= deltaTime;
      this.speedMultiplier = 1.2;
    } else {
      this.speedMultiplier = 1.0;
    }
    
    // Apply gravity
    if (!this.grounded) {
      this.velocity.y += this.gravity * deltaTime;
    }
    
    // Reset grounded state (will be set to true by collision detection if on ground)
    this.grounded = false;
    this.inGoal = false;
    
    // Update position
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
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
    // Draw player as a simple colored rectangle with pixel art style
    ctx.fillStyle = this.color;
    
    // Main body
    ctx.fillRect(
      Math.floor(this.position.x), 
      Math.floor(this.position.y), 
      this.width, 
      this.height
    );
    
    // Add some pixel art details
    ctx.fillStyle = this.id === "player1" ? "#27AE60" : "#2980B9"; // Slightly darker shade
    
    // Eyes
    ctx.fillRect(Math.floor(this.position.x + 6), Math.floor(this.position.y + 8), 4, 4);
    ctx.fillRect(Math.floor(this.position.x + 14), Math.floor(this.position.y + 8), 4, 4);
    
    // Simple animation based on movement
    if (Math.abs(this.velocity.x) > 10) {
      // Moving - add simple "legs"
      const offset = Math.floor(Date.now() / 200) % 2;
      ctx.fillRect(Math.floor(this.position.x + 4 + offset * 2), Math.floor(this.position.y + this.height - 8), 6, 8);
      ctx.fillRect(Math.floor(this.position.x + 14 - offset * 2), Math.floor(this.position.y + this.height - 8), 6, 8);
    } else {
      // Standing still
      ctx.fillRect(Math.floor(this.position.x + 6), Math.floor(this.position.y + this.height - 8), 6, 8);
      ctx.fillRect(Math.floor(this.position.x + 12), Math.floor(this.position.y + this.height - 8), 6, 8);
    }
    
    // Goal indicator
    if (this.inGoal) {
      ctx.strokeStyle = "#F39C12";
      ctx.lineWidth = 3;
      ctx.strokeRect(
        Math.floor(this.position.x - 4), 
        Math.floor(this.position.y - 4), 
        this.width + 8, 
        this.height + 8
      );
    }
  }

  applyPowerUp(type: string) {
    if (type === "speed") {
      this.speedBoostTimer = 5; // 5 seconds
    } else if (type === "shield") {
      this.hasShield = true;
    }
  }

  useShield(): boolean {
    if (this.hasShield) {
      this.hasShield = false;
      return true;
    }
    return false;
  }

  reset(x: number, y: number) {
    this.position.x = x;
    this.position.y = y;
    this.velocity.x = 0;
    this.velocity.y = 0;
    this.grounded = false;
    this.inGoal = false;
    this.jumpsUsed = 0;
    this.canDoubleJump = false;
    this.wasGroundedLastFrame = false;
    this.speedBoostTimer = 0;
    this.hasShield = false;
    this.speedMultiplier = 1.0;
  }
}