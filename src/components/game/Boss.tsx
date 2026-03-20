import { Projectile } from "./Projectile";

export class Boss {
  public position: { x: number; y: number };
  private startPosition: { x: number; y: number };
  public width: number = 128;
  public height: number = 128;
  public maxHealth: number = 100;
  public currentHealth: number = 100;
  public isDefeated: boolean = false;
  
  private attackTimer: number = 0;
  private attackCooldown: number = 3;
  private currentPhase: number = 1;
  private projectiles: Projectile[] = [];
  private lastShockwaveTime: number = 0;
  private animationOffset: number = 0;

  // Movement
  private moveTimer: number = 0;
  private moveTargetX: number = 0;
  private moveTargetY: number = 0;
  private moveSpeed: number = 80;
  private dashTimer: number = 0;
  private isDashing: boolean = false;
  private dashTargetX: number = 0;
  private dashTargetY: number = 0;
  private canvasWidth: number = 800;
  private canvasHeight: number = 450;

  constructor(x: number, y: number) {
    this.position = { x, y };
    this.startPosition = { x, y };
    this.moveTargetX = x;
    this.moveTargetY = y;
  }

  update(deltaTime: number) {
    if (this.isDefeated) return;

    if (this.currentHealth > 70) {
      this.currentPhase = 1;
    } else if (this.currentHealth > 40) {
      this.currentPhase = 2;
    } else {
      this.currentPhase = 3;
    }

    this.attackTimer += deltaTime;
    this.animationOffset += deltaTime;
    this.moveTimer += deltaTime;

    // Movement logic per phase
    this.updateMovement(deltaTime);

    const attackInterval = this.currentPhase === 3 ? 1.5 : this.attackCooldown;
    
    if (this.attackTimer >= attackInterval) {
      this.performAttack();
      this.attackTimer = 0;
    }

    this.projectiles = this.projectiles.filter(projectile => {
      projectile.update(deltaTime);
      return !projectile.shouldDestroy();
    });

    if (this.currentHealth <= 0 && !this.isDefeated) {
      this.isDefeated = true;
    }
  }

  private updateMovement(deltaTime: number) {
    const minX = 200;
    const maxX = this.canvasWidth - this.width - 20;
    const minY = 40;
    const maxY = this.canvasHeight - this.height - 80;

    if (this.isDashing) {
      // Fast dash toward target
      const dx = this.dashTargetX - this.position.x;
      const dy = this.dashTargetY - this.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 5) {
        this.isDashing = false;
      } else {
        const speed = 300;
        this.position.x += (dx / dist) * speed * deltaTime;
        this.position.y += (dy / dist) * speed * deltaTime;
      }
      return;
    }

    switch (this.currentPhase) {
      case 1:
        // Slow side-to-side patrol
        this.position.x = this.startPosition.x + Math.sin(this.moveTimer * 0.8) * 120;
        this.position.y = this.startPosition.y + Math.sin(this.moveTimer * 0.5) * 30;
        break;

      case 2:
        // Pick new random targets periodically
        if (this.moveTimer > 2.5) {
          this.moveTimer = 0;
          this.moveTargetX = minX + Math.random() * (maxX - minX);
          this.moveTargetY = minY + Math.random() * (maxY - minY);
        }
        // Smooth move toward target
        const dx2 = this.moveTargetX - this.position.x;
        const dy2 = this.moveTargetY - this.position.y;
        const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
        if (dist2 > 3) {
          const speed2 = this.moveSpeed * 1.5;
          this.position.x += (dx2 / dist2) * speed2 * deltaTime;
          this.position.y += (dy2 / dist2) * speed2 * deltaTime;
        }
        break;

      case 3:
        // Aggressive: random dashes + circular movement
        this.dashTimer += deltaTime;
        if (this.dashTimer > 2) {
          this.dashTimer = 0;
          this.isDashing = true;
          this.dashTargetX = minX + Math.random() * (maxX - minX);
          this.dashTargetY = minY + Math.random() * (maxY - minY);
        }
        // Circular orbit when not dashing
        const cx = this.canvasWidth / 2 - this.width / 2;
        const cy = this.canvasHeight / 2 - this.height / 2 - 30;
        this.position.x = cx + Math.cos(this.moveTimer * 1.5) * 150;
        this.position.y = cy + Math.sin(this.moveTimer * 2) * 60;
        break;
    }

    // Clamp to bounds
    this.position.x = Math.max(minX, Math.min(maxX, this.position.x));
    this.position.y = Math.max(minY, Math.min(maxY, this.position.y));
  }

  private performAttack() {
    const currentTime = Date.now();
    
    switch (this.currentPhase) {
      case 1:
        this.shootProjectiles(80, 3);
        break;
      case 2:
        this.shootProjectiles(120, 5);
        if (currentTime - this.lastShockwaveTime > 6000) {
          this.createShockwave();
          this.lastShockwaveTime = currentTime;
        }
        break;
      case 3:
        this.shootProjectiles(160, 7);
        if (currentTime - this.lastShockwaveTime > 3000) {
          this.createShockwave();
          this.lastShockwaveTime = currentTime;
        }
        break;
    }
  }

  private shootProjectiles(speed: number, count: number) {
    const centerX = this.position.x + this.width / 2;
    const centerY = this.position.y + this.height / 2;
    
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const velocityX = Math.cos(angle) * speed;
      const velocityY = Math.sin(angle) * speed;
      
      this.projectiles.push(new Projectile(
        centerX - 8,
        centerY - 8,
        velocityX,
        velocityY,
        "boss"
      ));
    }
  }

  private createShockwave() {
    const groundY = 370;
    this.projectiles.push(new Projectile(400, groundY, -150, 0, "shockwave"));
    this.projectiles.push(new Projectile(400, groundY, 150, 0, "shockwave"));
  }

  takeDamage(damage: number) {
    if (this.isDefeated) return;
    this.currentHealth = Math.max(0, this.currentHealth - damage);
    this.animationOffset = 0;
  }

  getProjectiles(): Projectile[] {
    return this.projectiles;
  }

  getBounds() {
    return {
      x: this.position.x,
      y: this.position.y,
      width: this.width,
      height: this.height
    };
  }

  getHealthPercentage(): number {
    return (this.currentHealth / this.maxHealth) * 100;
  }

  getCurrentPhase(): number {
    return this.currentPhase;
  }

  render(ctx: CanvasRenderingContext2D) {
    if (this.isDefeated) {
      this.renderDefeatAnimation(ctx);
      return;
    }

    const x = this.position.x;
    const y = this.position.y;
    const w = this.width;
    const h = this.height;
    
    // Damage flash
    const flashIntensity = Math.max(0, 1 - (this.animationOffset * 10));
    
    // Floating animation
    const floatOffset = Math.sin(this.animationOffset * 2) * 6;
    
    ctx.save();
    ctx.translate(0, floatOffset);
    
    if (flashIntensity > 0) {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(x, y, w, h);
      ctx.restore();
      this.projectiles.forEach(p => p.render(ctx));
      return;
    }
    
    // Dragon Anciã Boss - Large dragon
    // Body
    ctx.fillStyle = this.currentPhase === 1 ? "#8B0000" : 
                    this.currentPhase === 2 ? "#B22222" : "#FF4500";
    ctx.fillRect(x + 20, y + 30, w - 40, h - 50);
    
    // Scales
    ctx.fillStyle = this.currentPhase === 1 ? "#660000" : 
                    this.currentPhase === 2 ? "#8B0000" : "#CC3300";
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 3; j++) {
        ctx.fillRect(x + 30 + i * 18, y + 40 + j * 20, 10, 10);
      }
    }
    
    // Head
    ctx.fillStyle = this.currentPhase === 1 ? "#8B0000" : 
                    this.currentPhase === 2 ? "#B22222" : "#FF4500";
    ctx.fillRect(x + 10, y + 10, 50, 40);
    // Snout
    ctx.fillRect(x, y + 20, 20, 20);
    
    // Horns
    ctx.fillStyle = "#DAA520";
    ctx.beginPath();
    ctx.moveTo(x + 15, y + 10);
    ctx.lineTo(x + 10, y - 15);
    ctx.lineTo(x + 25, y + 10);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + 40, y + 10);
    ctx.lineTo(x + 45, y - 15);
    ctx.lineTo(x + 55, y + 10);
    ctx.fill();
    
    // Eyes - menacing
    const eyeGlow = Math.sin(this.animationOffset * 4) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(255, 255, 0, ${eyeGlow})`;
    ctx.fillRect(x + 20, y + 20, 12, 10);
    ctx.fillRect(x + 40, y + 20, 12, 10);
    // Slit pupils
    ctx.fillStyle = "#000";
    ctx.fillRect(x + 25, y + 20, 3, 10);
    ctx.fillRect(x + 45, y + 20, 3, 10);
    
    // Nostrils with fire
    ctx.fillStyle = "#FF6600";
    const fireFlicker = Math.sin(this.animationOffset * 10) * 3;
    ctx.beginPath();
    ctx.arc(x + 5, y + 25, 4 + fireFlicker, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 5, y + 35, 4 + fireFlicker, 0, Math.PI * 2);
    ctx.fill();
    
    // Wings
    ctx.fillStyle = this.currentPhase === 1 ? "#660000" : 
                    this.currentPhase === 2 ? "#8B0000" : "#CC3300";
    const wingFlap = Math.sin(this.animationOffset * 3) * 10;
    // Left wing
    ctx.beginPath();
    ctx.moveTo(x + w - 20, y + 30);
    ctx.lineTo(x + w + 20, y + 10 + wingFlap);
    ctx.lineTo(x + w + 30, y + 30 + wingFlap);
    ctx.lineTo(x + w + 15, y + 50);
    ctx.lineTo(x + w - 20, y + 60);
    ctx.fill();
    // Wing membrane
    ctx.fillStyle = this.currentPhase === 1 ? "#8B0000" : 
                    this.currentPhase === 2 ? "#B22222" : "#FF6600";
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(x + w - 10, y + 35);
    ctx.lineTo(x + w + 15, y + 15 + wingFlap);
    ctx.lineTo(x + w + 10, y + 50);
    ctx.fill();
    ctx.globalAlpha = 1;
    
    // Tail
    ctx.fillStyle = this.currentPhase === 1 ? "#8B0000" : 
                    this.currentPhase === 2 ? "#B22222" : "#FF4500";
    const tailWag = Math.sin(this.animationOffset * 4) * 8;
    ctx.fillRect(x + w - 30, y + h - 30, 40, 10);
    ctx.fillRect(x + w - 10, y + h - 35 + tailWag, 30, 10);
    // Tail spike
    ctx.fillStyle = "#DAA520";
    ctx.beginPath();
    ctx.moveTo(x + w + 20, y + h - 35 + tailWag);
    ctx.lineTo(x + w + 35, y + h - 30 + tailWag);
    ctx.lineTo(x + w + 20, y + h - 25 + tailWag);
    ctx.fill();
    
    // Spinal spikes based on phase
    ctx.fillStyle = "#DAA520";
    for (let i = 0; i < this.currentPhase + 2; i++) {
      const spikeX = x + 25 + (i * 20);
      ctx.beginPath();
      ctx.moveTo(spikeX, y + 30);
      ctx.lineTo(spikeX + 5, y + 15);
      ctx.lineTo(spikeX + 10, y + 30);
      ctx.fill();
    }
    
    // Legs/claws
    ctx.fillStyle = this.currentPhase === 1 ? "#8B0000" : 
                    this.currentPhase === 2 ? "#B22222" : "#FF4500";
    ctx.fillRect(x + 25, y + h - 25, 15, 20);
    ctx.fillRect(x + w - 55, y + h - 25, 15, 20);
    // Claws
    ctx.fillStyle = "#DAA520";
    ctx.fillRect(x + 25, y + h - 8, 4, 4);
    ctx.fillRect(x + 32, y + h - 8, 4, 4);
    ctx.fillRect(x + w - 55, y + h - 8, 4, 4);
    ctx.fillRect(x + w - 48, y + h - 8, 4, 4);
    
    ctx.restore();
    
    // Render projectiles
    this.projectiles.forEach(projectile => {
      projectile.render(ctx);
    });
  }

  private renderDefeatAnimation(ctx: CanvasRenderingContext2D) {
    const alpha = Math.max(0, 1 - (this.animationOffset * 2));
    
    if (alpha > 0) {
      ctx.globalAlpha = alpha;
      
      // Explosion particles
      ctx.fillStyle = "#FFD700";
      for (let i = 0; i < 20; i++) {
        const angle = (Math.PI * 2 * i) / 20;
        const distance = this.animationOffset * 100;
        const x = this.position.x + this.width / 2 + Math.cos(angle) * distance;
        const y = this.position.y + this.height / 2 + Math.sin(angle) * distance;
        
        ctx.fillRect(x - 4, y - 4, 8, 8);
      }
      
      // Flash
      const time = Date.now() / 100;
      if (Math.sin(time) > 0) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.fillRect(0, 0, 800, 450);
      }
      
      ctx.globalAlpha = 1;
    }
  }

  reset() {
    this.currentHealth = this.maxHealth;
    this.isDefeated = false;
    this.attackTimer = 0;
    this.currentPhase = 1;
    this.projectiles = [];
    this.lastShockwaveTime = 0;
    this.animationOffset = 0;
  }
}
