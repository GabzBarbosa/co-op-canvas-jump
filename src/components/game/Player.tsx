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
    
    switch (this.characterType) {
      case 'tiger': this.renderTiger(ctx, x, y, isMoving, legFrame); break;
      case 'dragon': this.renderDragon(ctx, x, y, isMoving, legFrame); break;
      case 'eagle': this.renderEagle(ctx, x, y, isMoving, legFrame); break;
      case 'wolf': this.renderWolf(ctx, x, y, isMoving, legFrame); break;
      case 'bear': this.renderBear(ctx, x, y, isMoving, legFrame); break;
      case 'fox': this.renderFox(ctx, x, y, isMoving, legFrame); break;
      default: this.renderTiger(ctx, x, y, isMoving, legFrame);
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

  private renderEagle(ctx: CanvasRenderingContext2D, x: number, y: number, isMoving: boolean, legFrame: number) {
    const w = this.width;
    const h = this.height;
    // Body - brown
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(x + 2, y + 8, w - 4, h - 16);
    // Head - white (bald eagle)
    ctx.fillStyle = "#FFF";
    ctx.fillRect(x + 3, y, w - 6, 12);
    // Beak
    ctx.fillStyle = "#FFD700";
    ctx.beginPath();
    ctx.moveTo(x + w, y + 4);
    ctx.lineTo(x + w + 6, y + 7);
    ctx.lineTo(x + w, y + 10);
    ctx.fill();
    // Eyes
    ctx.fillStyle = "#000";
    ctx.fillRect(x + w - 7, y + 3, 3, 3);
    // Eye ring
    ctx.fillStyle = "#FFD700";
    ctx.fillRect(x + w - 8, y + 2, 1, 5);
    // Wings
    ctx.fillStyle = "#5C3317";
    const wingFlap = Math.sin(this.animTime * 8) * 6;
    ctx.beginPath();
    ctx.moveTo(x, y + 10);
    ctx.lineTo(x - 10, y + 4 + wingFlap);
    ctx.lineTo(x - 4, y + 20);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + w, y + 10);
    ctx.lineTo(x + w + 8, y + 4 - wingFlap);
    ctx.lineTo(x + w + 4, y + 20);
    ctx.fill();
    // Tail feathers
    ctx.fillStyle = "#FFF";
    ctx.fillRect(x - 4, y + 16, 6, 4);
    ctx.fillRect(x - 6, y + 14, 4, 3);
    // Talons
    ctx.fillStyle = "#FFD700";
    if (isMoving) {
      ctx.fillRect(x + 5 + legFrame * 2, y + h - 6, 4, 6);
      ctx.fillRect(x + w - 9 - legFrame * 2, y + h - 6, 4, 6);
    } else {
      ctx.fillRect(x + 6, y + h - 6, 4, 6);
      ctx.fillRect(x + w - 10, y + h - 6, 4, 6);
    }
    // Chest feathers
    ctx.fillStyle = "#D2B48C";
    ctx.fillRect(x + 6, y + 14, w - 12, 6);
  }

  private renderWolf(ctx: CanvasRenderingContext2D, x: number, y: number, isMoving: boolean, legFrame: number) {
    const w = this.width;
    const h = this.height;
    // Body - grey
    ctx.fillStyle = "#708090";
    ctx.fillRect(x, y + 6, w, h - 14);
    // Fur pattern
    ctx.fillStyle = "#5A6978";
    ctx.fillRect(x + 2, y + 8, 4, 4);
    ctx.fillRect(x + w - 6, y + 8, 4, 4);
    ctx.fillRect(x + 8, y + 12, 4, 4);
    // Head
    ctx.fillStyle = "#808080";
    ctx.fillRect(x + 2, y, w - 4, 10);
    // Snout
    ctx.fillStyle = "#A9A9A9";
    ctx.fillRect(x + w - 2, y + 3, 5, 5);
    // Nose
    ctx.fillStyle = "#333";
    ctx.fillRect(x + w + 2, y + 4, 3, 3);
    // Ears - pointy
    ctx.fillStyle = "#708090";
    ctx.beginPath();
    ctx.moveTo(x + 4, y);
    ctx.lineTo(x + 2, y - 8);
    ctx.lineTo(x + 9, y);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + w - 9, y);
    ctx.lineTo(x + w - 2, y - 8);
    ctx.lineTo(x + w - 4, y);
    ctx.fill();
    // Inner ear
    ctx.fillStyle = "#D3A0A0";
    ctx.beginPath();
    ctx.moveTo(x + 5, y);
    ctx.lineTo(x + 4, y - 5);
    ctx.lineTo(x + 8, y);
    ctx.fill();
    // Eyes - yellow, glowing
    const glow = 0.7 + Math.sin(this.animTime * 3) * 0.3;
    ctx.fillStyle = `rgba(255, 200, 0, ${glow})`;
    ctx.fillRect(x + 7, y + 2, 4, 3);
    ctx.fillRect(x + w - 11, y + 2, 4, 3);
    ctx.fillStyle = "#000";
    ctx.fillRect(x + 9, y + 3, 1, 2);
    ctx.fillRect(x + w - 9, y + 3, 1, 2);
    // Belly
    ctx.fillStyle = "#C0C0C0";
    ctx.fillRect(x + 5, y + 18, w - 10, 5);
    // Tail - bushy
    ctx.fillStyle = "#708090";
    const tailWag = Math.sin(this.animTime * 5) * 4;
    ctx.fillRect(x - 6, y + 12 + tailWag, 8, 5);
    ctx.fillRect(x - 10, y + 10 + tailWag, 6, 4);
    ctx.fillStyle = "#C0C0C0";
    ctx.fillRect(x - 10, y + 13 + tailWag, 4, 2);
    // Legs
    ctx.fillStyle = "#708090";
    if (isMoving) {
      ctx.fillRect(x + 3 + legFrame * 2, y + h - 8, 6, 8);
      ctx.fillRect(x + w - 9 - legFrame * 2, y + h - 8, 6, 8);
    } else {
      ctx.fillRect(x + 4, y + h - 8, 6, 8);
      ctx.fillRect(x + w - 10, y + h - 8, 6, 8);
    }
    // Paws
    ctx.fillStyle = "#555";
    ctx.fillRect(x + (isMoving ? 3 + legFrame * 2 : 4), y + h - 3, 6, 3);
    ctx.fillRect(x + (isMoving ? w - 9 - legFrame * 2 : w - 10), y + h - 3, 6, 3);
  }

  private renderBear(ctx: CanvasRenderingContext2D, x: number, y: number, isMoving: boolean, legFrame: number) {
    const w = this.width;
    const h = this.height;
    // Body - large brown
    ctx.fillStyle = "#6B3A2A";
    ctx.fillRect(x - 1, y + 4, w + 2, h - 10);
    // Fur texture
    ctx.fillStyle = "#5A2E1F";
    ctx.fillRect(x + 2, y + 8, 3, 3);
    ctx.fillRect(x + 10, y + 6, 3, 3);
    ctx.fillRect(x + w - 6, y + 10, 3, 3);
    // Head - round
    ctx.fillStyle = "#7B4A3A";
    ctx.fillRect(x + 2, y - 2, w - 4, 12);
    // Snout
    ctx.fillStyle = "#D2B48C";
    ctx.fillRect(x + w - 4, y + 2, 6, 6);
    // Nose
    ctx.fillStyle = "#333";
    ctx.fillRect(x + w + 1, y + 3, 3, 3);
    // Round ears
    ctx.fillStyle = "#6B3A2A";
    ctx.beginPath();
    ctx.arc(x + 5, y - 2, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + w - 5, y - 2, 5, 0, Math.PI * 2);
    ctx.fill();
    // Inner ear
    ctx.fillStyle = "#D2B48C";
    ctx.beginPath();
    ctx.arc(x + 5, y - 2, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + w - 5, y - 2, 3, 0, Math.PI * 2);
    ctx.fill();
    // Eyes - small
    ctx.fillStyle = "#000";
    ctx.fillRect(x + 7, y + 2, 3, 3);
    ctx.fillRect(x + w - 10, y + 2, 3, 3);
    // Eye shine
    ctx.fillStyle = "#FFF";
    ctx.fillRect(x + 8, y + 2, 1, 1);
    ctx.fillRect(x + w - 9, y + 2, 1, 1);
    // Belly
    ctx.fillStyle = "#D2B48C";
    ctx.fillRect(x + 4, y + 16, w - 8, 8);
    // Legs - thick
    ctx.fillStyle = "#6B3A2A";
    if (isMoving) {
      ctx.fillRect(x + 1 + legFrame * 2, y + h - 8, 8, 8);
      ctx.fillRect(x + w - 9 - legFrame * 2, y + h - 8, 8, 8);
    } else {
      ctx.fillRect(x + 2, y + h - 8, 8, 8);
      ctx.fillRect(x + w - 10, y + h - 8, 8, 8);
    }
    // Paw pads
    ctx.fillStyle = "#5A2E1F";
    ctx.fillRect(x + (isMoving ? 3 + legFrame * 2 : 4), y + h - 3, 4, 3);
    ctx.fillRect(x + (isMoving ? w - 7 - legFrame * 2 : w - 8), y + h - 3, 4, 3);
  }

  private renderFox(ctx: CanvasRenderingContext2D, x: number, y: number, isMoving: boolean, legFrame: number) {
    const w = this.width;
    const h = this.height;
    // Body - orange-red
    ctx.fillStyle = "#D2691E";
    ctx.fillRect(x, y + 6, w, h - 14);
    // White chest
    ctx.fillStyle = "#FFF5E6";
    ctx.fillRect(x + 5, y + 12, w - 10, 10);
    // Head
    ctx.fillStyle = "#E87A30";
    ctx.fillRect(x + 2, y, w - 4, 10);
    // Pointy snout
    ctx.fillStyle = "#D2691E";
    ctx.fillRect(x + w - 2, y + 2, 6, 6);
    ctx.fillRect(x + w + 2, y + 3, 4, 4);
    // Nose
    ctx.fillStyle = "#333";
    ctx.fillRect(x + w + 5, y + 4, 2, 2);
    // Big ears - tall and pointy
    ctx.fillStyle = "#E87A30";
    ctx.beginPath();
    ctx.moveTo(x + 3, y);
    ctx.lineTo(x, y - 10);
    ctx.lineTo(x + 8, y);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + w - 8, y);
    ctx.lineTo(x + w, y - 10);
    ctx.lineTo(x + w - 3, y);
    ctx.fill();
    // Inner ear
    ctx.fillStyle = "#FFF5E6";
    ctx.beginPath();
    ctx.moveTo(x + 4, y);
    ctx.lineTo(x + 2, y - 6);
    ctx.lineTo(x + 7, y);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + w - 7, y);
    ctx.lineTo(x + w - 2, y - 6);
    ctx.lineTo(x + w - 4, y);
    ctx.fill();
    // Eyes - cunning, slanted
    ctx.fillStyle = "#ADFF2F";
    ctx.fillRect(x + 6, y + 2, 4, 3);
    ctx.fillRect(x + w - 10, y + 2, 4, 3);
    ctx.fillStyle = "#000";
    ctx.fillRect(x + 8, y + 3, 1, 2);
    ctx.fillRect(x + w - 8, y + 3, 1, 2);
    // Bushy tail - big and flowing
    ctx.fillStyle = "#D2691E";
    const tailWag = Math.sin(this.animTime * 6) * 5;
    ctx.fillRect(x - 6, y + 10 + tailWag, 8, 6);
    ctx.fillRect(x - 12, y + 8 + tailWag, 8, 5);
    // White tail tip
    ctx.fillStyle = "#FFF5E6";
    ctx.fillRect(x - 14, y + 9 + tailWag, 4, 3);
    // Legs - slim
    ctx.fillStyle = "#333";
    if (isMoving) {
      ctx.fillRect(x + 4 + legFrame * 2, y + h - 8, 5, 8);
      ctx.fillRect(x + w - 9 - legFrame * 2, y + h - 8, 5, 8);
    } else {
      ctx.fillRect(x + 5, y + h - 8, 5, 8);
      ctx.fillRect(x + w - 10, y + h - 8, 5, 8);
    }
    // Paws
    ctx.fillStyle = "#222";
    ctx.fillRect(x + (isMoving ? 4 + legFrame * 2 : 5), y + h - 3, 5, 3);
    ctx.fillRect(x + (isMoving ? w - 9 - legFrame * 2 : w - 10), y + h - 3, 5, 3);
  }

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
