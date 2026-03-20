export type CharacterType = 'tiger' | 'dragon' | 'eagle' | 'wolf' | 'bear' | 'fox';

export class Player {
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  width: number = 24;
  height: number = 32;
  color: string;
  id: string;
  characterType: CharacterType;
  grounded: boolean = false;
  inGoal: boolean = false;
  private jumpsUsed: number = 0;
  private readonly maxJumps = 2;
  private wasGroundedLastFrame: boolean = false;
  private canDoubleJump: boolean = false;
  
  private readonly maxSpeed = 200;
  private readonly jumpPower = 640;
  private readonly shortJumpPower = 400;
  private readonly longJumpPower = 720;
  private readonly acceleration = 800;
  private readonly friction = 600;
  private readonly gravity = 1200;
  
  private currentLevel: number = 1;
  
  public speedBoostTimer = 0;
  public hasShield = false;
  private speedMultiplier = 1;
  
  private isRunnerMode = false;
  private isCrouching = false;
  private originalHeight = 32;
  private crouchHeight = 16;
  
  private startX: number;
  private startY: number;
  private animTime = 0;

  constructor(x: number, y: number, color: string, id: string, characterType: CharacterType = 'tiger') {
    this.position = { x, y };
    this.velocity = { x: 0, y: 0 };
    this.color = color;
    this.id = id;
    this.characterType = characterType;
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
      this.canDoubleJump = true;
    }
  }

  variableJump(jumpType: 'short' | 'long' | 'double') {
    if (this.currentLevel !== 2) {
      this.jump();
      return;
    }

    if (jumpType === 'double') {
      this.doubleJump();
      return;
    }

    if (this.grounded && this.jumpsUsed === 0) {
      const power = jumpType === 'short' ? this.shortJumpPower : this.longJumpPower;
      this.velocity.y = -power;
      this.jumpsUsed++;
      this.grounded = false;
      this.canDoubleJump = true;
    }
  }

  doubleJump() {
    if (this.canDoubleJump && this.jumpsUsed === 1) {
      this.velocity.y = -this.jumpPower * 0.8;
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
    this.animTime += deltaTime;
    
    if (!this.wasGroundedLastFrame && this.grounded) {
      this.jumpsUsed = 0;
      this.canDoubleJump = false;
    }
    this.wasGroundedLastFrame = this.grounded;
    
    if (this.isRunnerMode) {
      this.velocity.x = 0;
    }
    
    if (this.speedBoostTimer > 0) {
      this.speedBoostTimer -= deltaTime;
      this.speedMultiplier = 1.2;
    } else {
      this.speedMultiplier = 1.0;
    }
    
    if (!this.grounded) {
      this.velocity.y += this.gravity * deltaTime;
    }
    
    this.grounded = false;
    this.inGoal = false;
    
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
  }

  setRunnerMode(enabled: boolean) {
    this.isRunnerMode = enabled;
  }

  setCurrentLevel(level: number) {
    this.currentLevel = level;
  }

  setCrouching(crouching: boolean) {
    const wasFraming = this.isCrouching;
    this.isCrouching = crouching;
    
    if (crouching && !wasFraming) {
      const heightDiff = this.originalHeight - this.crouchHeight;
      this.height = this.crouchHeight;
      this.position.y += heightDiff;
    } else if (!crouching && wasFraming) {
      const heightDiff = this.originalHeight - this.crouchHeight;
      this.height = this.originalHeight;
      this.position.y -= heightDiff;
    }
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
    const x = Math.floor(this.position.x);
    const y = Math.floor(this.position.y);
    const isMoving = Math.abs(this.velocity.x) > 10;
    const legFrame = Math.floor(this.animTime * 6) % 2;
    
    if (this.id === "player1") {
      this.renderTiger(ctx, x, y, isMoving, legFrame);
    } else {
      this.renderDragon(ctx, x, y, isMoving, legFrame);
    }
    
    // Goal indicator
    if (this.inGoal) {
      ctx.strokeStyle = "#F39C12";
      ctx.lineWidth = 3;
      ctx.strokeRect(x - 4, y - 4, this.width + 8, this.height + 8);
    }
    
    // Shield indicator
    if (this.hasShield) {
      ctx.strokeStyle = "rgba(100, 200, 255, 0.7)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x + this.width / 2, y + this.height / 2, this.width, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  private renderTiger(ctx: CanvasRenderingContext2D, x: number, y: number, isMoving: boolean, legFrame: number) {
    const w = this.width;
    const h = this.height;
    
    // Body - orange
    ctx.fillStyle = "#FF8C00";
    ctx.fillRect(x, y + 4, w, h - 12);
    
    // Head
    ctx.fillStyle = "#FF8C00";
    ctx.fillRect(x + 2, y, w - 4, 10);
    
    // Ears
    ctx.fillStyle = "#FF8C00";
    ctx.fillRect(x + 2, y - 4, 5, 5);
    ctx.fillRect(x + w - 7, y - 4, 5, 5);
    // Inner ears
    ctx.fillStyle = "#FFB366";
    ctx.fillRect(x + 3, y - 3, 3, 3);
    ctx.fillRect(x + w - 6, y - 3, 3, 3);
    
    // Tiger stripes (black)
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(x + 4, y + 6, 3, 5);
    ctx.fillRect(x + 10, y + 8, 3, 6);
    ctx.fillRect(x + 17, y + 6, 3, 5);
    ctx.fillRect(x + 6, y + 16, 4, 3);
    ctx.fillRect(x + 14, y + 14, 4, 3);
    
    // White belly
    ctx.fillStyle = "#FFF5E6";
    ctx.fillRect(x + 6, y + 18, w - 12, 6);
    
    // Eyes
    ctx.fillStyle = "#FFD700";
    ctx.fillRect(x + 5, y + 2, 5, 4);
    ctx.fillRect(x + w - 10, y + 2, 5, 4);
    // Pupils
    ctx.fillStyle = "#000";
    ctx.fillRect(x + 7, y + 3, 2, 3);
    ctx.fillRect(x + w - 8, y + 3, 2, 3);
    
    // Nose
    ctx.fillStyle = "#FF69B4";
    ctx.fillRect(x + w / 2 - 2, y + 6, 4, 2);
    
    // Whiskers
    ctx.strokeStyle = "#FFF";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y + 7);
    ctx.lineTo(x + 5, y + 8);
    ctx.moveTo(x + w, y + 7);
    ctx.lineTo(x + w - 5, y + 8);
    ctx.stroke();
    
    // Tail
    ctx.fillStyle = "#FF8C00";
    const tailWag = Math.sin(this.animTime * 8) * 3;
    ctx.fillRect(x - 4, y + 8 + tailWag, 5, 3);
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(x - 4, y + 9 + tailWag, 2, 1);
    
    // Legs
    ctx.fillStyle = "#FF8C00";
    if (isMoving) {
      ctx.fillRect(x + 3 + legFrame * 2, y + h - 8, 6, 8);
      ctx.fillRect(x + w - 9 - legFrame * 2, y + h - 8, 6, 8);
    } else {
      ctx.fillRect(x + 4, y + h - 8, 6, 8);
      ctx.fillRect(x + w - 10, y + h - 8, 6, 8);
    }
    // Paws
    ctx.fillStyle = "#FFF5E6";
    ctx.fillRect(x + (isMoving ? 3 + legFrame * 2 : 4), y + h - 3, 6, 3);
    ctx.fillRect(x + (isMoving ? w - 9 - legFrame * 2 : w - 10), y + h - 3, 6, 3);
  }

  private renderDragon(ctx: CanvasRenderingContext2D, x: number, y: number, isMoving: boolean, legFrame: number) {
    const w = this.width;
    const h = this.height;
    
    // Body - dark green/teal
    ctx.fillStyle = "#228B22";
    ctx.fillRect(x, y + 6, w, h - 14);
    
    // Scales pattern
    ctx.fillStyle = "#1a6b1a";
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 2; j++) {
        ctx.fillRect(x + 4 + i * 7, y + 8 + j * 8, 4, 4);
      }
    }
    
    // Head - slightly larger, dragon snout
    ctx.fillStyle = "#2E8B2E";
    ctx.fillRect(x + 1, y, w - 2, 12);
    // Snout
    ctx.fillStyle = "#228B22";
    ctx.fillRect(x + w - 2, y + 3, 4, 6);
    
    // Horns
    ctx.fillStyle = "#DAA520";
    ctx.fillRect(x + 3, y - 6, 3, 7);
    ctx.fillRect(x + w - 6, y - 6, 3, 7);
    ctx.fillRect(x + 4, y - 8, 1, 3);
    ctx.fillRect(x + w - 5, y - 8, 1, 3);
    
    // Eyes - red/fiery
    ctx.fillStyle = "#FF4500";
    ctx.fillRect(x + 6, y + 2, 4, 4);
    ctx.fillRect(x + w - 10, y + 2, 4, 4);
    // Slit pupils
    ctx.fillStyle = "#000";
    ctx.fillRect(x + 8, y + 2, 1, 4);
    ctx.fillRect(x + w - 8, y + 2, 1, 4);
    
    // Nostrils with smoke
    ctx.fillStyle = "#1a5a1a";
    ctx.fillRect(x + w, y + 4, 2, 2);
    ctx.fillRect(x + w, y + 7, 2, 2);
    
    // Smoke/fire from nostrils
    const smokeAlpha = 0.3 + Math.sin(this.animTime * 5) * 0.2;
    ctx.fillStyle = `rgba(255, 100, 0, ${smokeAlpha})`;
    ctx.beginPath();
    ctx.arc(x + w + 5, y + 5, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Light belly
    ctx.fillStyle = "#90EE90";
    ctx.fillRect(x + 5, y + 18, w - 10, 6);
    
    // Wings (small, folded)
    ctx.fillStyle = "#1a8b1a";
    const wingFlap = Math.sin(this.animTime * 4) * 2;
    // Left wing
    ctx.beginPath();
    ctx.moveTo(x - 2, y + 8);
    ctx.lineTo(x - 8, y + 4 + wingFlap);
    ctx.lineTo(x - 2, y + 16);
    ctx.fill();
    // Wing membrane
    ctx.fillStyle = "#3CB371";
    ctx.beginPath();
    ctx.moveTo(x - 2, y + 10);
    ctx.lineTo(x - 6, y + 6 + wingFlap);
    ctx.lineTo(x - 2, y + 14);
    ctx.fill();
    
    // Tail with spikes
    ctx.fillStyle = "#228B22";
    const tailWag = Math.sin(this.animTime * 6) * 4;
    ctx.fillRect(x - 6, y + 14 + tailWag, 7, 3);
    ctx.fillRect(x - 10, y + 13 + tailWag, 5, 3);
    // Tail spike
    ctx.fillStyle = "#DAA520";
    ctx.beginPath();
    ctx.moveTo(x - 10, y + 13 + tailWag);
    ctx.lineTo(x - 14, y + 11 + tailWag);
    ctx.lineTo(x - 10, y + 16 + tailWag);
    ctx.fill();
    
    // Spinal ridge
    ctx.fillStyle = "#DAA520";
    ctx.fillRect(x + 8, y - 1, 2, 3);
    ctx.fillRect(x + 12, y, 2, 3);
    ctx.fillRect(x + 16, y - 1, 2, 3);
    
    // Legs - clawed
    ctx.fillStyle = "#228B22";
    if (isMoving) {
      ctx.fillRect(x + 3 + legFrame * 2, y + h - 8, 6, 8);
      ctx.fillRect(x + w - 9 - legFrame * 2, y + h - 8, 6, 8);
    } else {
      ctx.fillRect(x + 4, y + h - 8, 6, 8);
      ctx.fillRect(x + w - 10, y + h - 8, 6, 8);
    }
    // Claws
    ctx.fillStyle = "#DAA520";
    const legX1 = isMoving ? x + 3 + legFrame * 2 : x + 4;
    const legX2 = isMoving ? x + w - 9 - legFrame * 2 : x + w - 10;
    ctx.fillRect(legX1, y + h - 2, 2, 2);
    ctx.fillRect(legX1 + 4, y + h - 2, 2, 2);
    ctx.fillRect(legX2, y + h - 2, 2, 2);
    ctx.fillRect(legX2 + 4, y + h - 2, 2, 2);
  }

  applyPowerUp(type: string) {
    if (type === "speed") {
      this.speedBoostTimer = 5;
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
    this.isRunnerMode = false;
    this.isCrouching = false;
    this.height = this.originalHeight;
  }
}
