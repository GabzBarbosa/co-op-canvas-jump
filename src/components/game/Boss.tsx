import { Projectile } from "./Projectile";

export class Boss {
  public position: { x: number; y: number };
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

  constructor(x: number, y: number) {
    this.position = { x, y };
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
