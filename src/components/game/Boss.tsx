import { Projectile } from "./Projectile";

export class Boss {
  public position: { x: number; y: number };
  public width: number = 128;
  public height: number = 128;
  public maxHealth: number = 100;
  public currentHealth: number = 100;
  public isDefeated: boolean = false;
  
  private attackTimer: number = 0;
  private attackCooldown: number = 3; // 3 seconds between attacks
  private currentPhase: number = 1; // 1, 2, or 3
  private projectiles: Projectile[] = [];
  private lastShockwaveTime: number = 0;
  private animationOffset: number = 0;

  constructor(x: number, y: number) {
    this.position = { x, y };
  }

  update(deltaTime: number) {
    if (this.isDefeated) return;

    // Update phase based on health
    if (this.currentHealth > 70) {
      this.currentPhase = 1;
    } else if (this.currentHealth > 40) {
      this.currentPhase = 2;
    } else {
      this.currentPhase = 3;
    }

    // Update attack timer
    this.attackTimer += deltaTime;
    this.animationOffset += deltaTime;

    // Attack based on phase
    const attackInterval = this.currentPhase === 3 ? 1.5 : this.attackCooldown;
    
    if (this.attackTimer >= attackInterval) {
      this.performAttack();
      this.attackTimer = 0;
    }

    // Update projectiles
    this.projectiles = this.projectiles.filter(projectile => {
      projectile.update(deltaTime);
      return !projectile.shouldDestroy();
    });

    // Check if defeated
    if (this.currentHealth <= 0 && !this.isDefeated) {
      this.isDefeated = true;
    }
  }

  private performAttack() {
    const currentTime = Date.now();
    
    switch (this.currentPhase) {
      case 1:
        // Phase 1: Slow projectiles
        this.shootProjectiles(80, 3); // 80px/s speed, 3 projectiles
        break;
        
      case 2:
        // Phase 2: Fast projectiles + ground waves
        this.shootProjectiles(120, 5); // 120px/s speed, 5 projectiles
        
        // Add shockwave every other attack
        if (currentTime - this.lastShockwaveTime > 6000) {
          this.createShockwave();
          this.lastShockwaveTime = currentTime;
        }
        break;
        
      case 3:
        // Phase 3: Very fast projectiles + frequent shockwaves
        this.shootProjectiles(160, 7); // 160px/s speed, 7 projectiles
        
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
    // Create ground-level projectiles that move horizontally
    const groundY = 370; // Just above the floor
    
    // Left-moving shockwave
    this.projectiles.push(new Projectile(
      400, groundY, -150, 0, "shockwave"
    ));
    
    // Right-moving shockwave
    this.projectiles.push(new Projectile(
      400, groundY, 150, 0, "shockwave"
    ));
  }

  takeDamage(damage: number) {
    if (this.isDefeated) return;
    
    this.currentHealth = Math.max(0, this.currentHealth - damage);
    
    // Visual damage feedback
    this.animationOffset = 0; // Reset animation for damage flash
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

    const centerX = this.position.x + this.width / 2;
    const centerY = this.position.y + this.height / 2;
    
    // Boss body with phase-based colors
    let primaryColor = "#8E44AD"; // Purple
    let secondaryColor = "#9B59B6";
    
    if (this.currentPhase === 2) {
      primaryColor = "#E74C3C"; // Red
      secondaryColor = "#C0392B";
    } else if (this.currentPhase === 3) {
      primaryColor = "#2C3E50"; // Dark blue/black
      secondaryColor = "#34495E";
    }
    
    // Damage flash effect
    const flashIntensity = Math.max(0, 1 - (this.animationOffset * 10));
    if (flashIntensity > 0) {
      primaryColor = "#FFFFFF";
      secondaryColor = "#F8F8F8";
    }
    
    // Main body - large imposing rectangle
    ctx.fillStyle = primaryColor;
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    
    // Body details
    ctx.fillStyle = secondaryColor;
    ctx.fillRect(this.position.x + 16, this.position.y + 16, this.width - 32, this.height - 32);
    
    // Eyes - menacing red glow
    const eyeGlow = Math.sin(this.animationOffset * 4) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(255, 0, 0, ${eyeGlow})`;
    ctx.fillRect(this.position.x + 32, this.position.y + 40, 16, 16);
    ctx.fillRect(this.position.x + 80, this.position.y + 40, 16, 16);
    
    // Floating animation
    const floatOffset = Math.sin(this.animationOffset * 2) * 4;
    ctx.save();
    ctx.translate(0, floatOffset);
    
    // Phase indicators (spikes/decorations based on phase)
    ctx.fillStyle = "#FF6B6B";
    for (let i = 0; i < this.currentPhase; i++) {
      const spikeX = this.position.x + 20 + (i * 30);
      const spikeY = this.position.y - 8;
      
      // Draw spike
      ctx.fillRect(spikeX, spikeY, 8, 16);
      ctx.fillRect(spikeX + 2, spikeY - 4, 4, 8);
    }
    
    ctx.restore();
    
    // Render all projectiles
    this.projectiles.forEach(projectile => {
      projectile.render(ctx);
    });
  }

  private renderDefeatAnimation(ctx: CanvasRenderingContext2D) {
    // Dramatic defeat animation with explosion effect
    const time = Date.now() / 100;
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
      
      // Flash effect
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