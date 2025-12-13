interface Obstacle {
  position: { x: number; y: number };
  type: 'log' | 'spike' | 'pipe' | 'goomba' | 'bulletBill' | 'bomb' | 'explosion' | 'bossProjectile';
  width: number;
  height: number;
  requiresJump: boolean;
  requiresCrouch: boolean;
  timer?: number;
  explosionTimer?: number;
  velocityY?: number;
}

interface PowerUp {
  position: { x: number; y: number };
  collected: boolean;
  type: 'attackBoss' | 'shield' | 'speed';
}

export class RunnerBossLevel {
  private obstacles: Obstacle[] = [];
  private powerUps: PowerUp[] = [];
  private scrollSpeed = 280;
  private distanceTraveled = 0;
  private spawnTimer = 0;
  private spawnInterval = 1.8;
  private cloudPositions: Array<{ x: number; y: number }> = [];
  private firePositions: Array<{ x: number; y: number; frame: number }> = [];
  private gridOffset = 0;
  private currentTheme: 'forest' | 'mario' | 'bomberman' = 'forest';
  private themeTimer = 0;
  private themeDuration = 8; // 8 seconds per theme
  
  // Boss properties
  private bossHealth = 100;
  private bossMaxHealth = 100;
  private bossPosition = { x: 700, y: 80 };
  private bossAttackTimer = 0;
  private bossAttackInterval = 3;
  private bossPhase = 1;
  private bossDefeated = false;
  private bossAnimOffset = 0;
  
  // Sound flags
  public pendingExplosionSound = false;
  public pendingCollectSound = false;
  public pendingBossHitSound = false;

  constructor() {
    this.reset();
  }

  reset() {
    this.obstacles = [];
    this.powerUps = [];
    this.scrollSpeed = 280;
    this.distanceTraveled = 0;
    this.spawnTimer = 0;
    this.currentTheme = 'forest';
    this.themeTimer = 0;
    this.bossHealth = 100;
    this.bossDefeated = false;
    this.bossPhase = 1;
    this.bossAttackTimer = 0;
    this.bossAnimOffset = 0;
    this.gridOffset = 0;
    
    // Initialize clouds
    this.cloudPositions = [];
    for (let i = 0; i < 5; i++) {
      this.cloudPositions.push({
        x: Math.random() * 1200,
        y: 50 + Math.random() * 100
      });
    }
    
    // Initialize fire decorations
    this.firePositions = [];
    for (let i = 0; i < 3; i++) {
      this.firePositions.push({
        x: 200 + Math.random() * 600,
        y: 40 + Math.random() * 60,
        frame: Math.random() * Math.PI * 2
      });
    }
  }

  update(deltaTime: number) {
    if (this.bossDefeated) return;
    
    // Update distance
    this.distanceTraveled += (this.scrollSpeed * deltaTime) / 10;
    this.gridOffset = (this.gridOffset + this.scrollSpeed * deltaTime) % 40;
    this.bossAnimOffset += deltaTime;
    
    // Update theme cycle
    this.themeTimer += deltaTime;
    if (this.themeTimer >= this.themeDuration) {
      this.themeTimer = 0;
      this.cycleTheme();
    }
    
    // Update boss phase based on health
    if (this.bossHealth > 70) {
      this.bossPhase = 1;
    } else if (this.bossHealth > 40) {
      this.bossPhase = 2;
    } else {
      this.bossPhase = 3;
    }
    
    // Increase speed and difficulty based on phase
    this.scrollSpeed = 280 + (3 - this.bossPhase) * -20 + this.bossPhase * 30;
    this.spawnInterval = Math.max(1.0, 1.8 - (this.bossPhase * 0.2));
    this.bossAttackInterval = Math.max(1.5, 3 - (this.bossPhase * 0.5));
    
    // Update obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i];
      obstacle.position.x -= this.scrollSpeed * deltaTime;
      
      // Update boss projectiles (move towards player)
      if (obstacle.type === 'bossProjectile' && obstacle.velocityY) {
        obstacle.position.y += obstacle.velocityY * deltaTime;
      }
      
      // Update bomb timers
      if (obstacle.type === 'bomb' && obstacle.timer !== undefined) {
        obstacle.timer -= deltaTime;
        if (obstacle.timer <= 0) {
          obstacle.type = 'explosion';
          obstacle.explosionTimer = 0.5;
          obstacle.width = 80;
          obstacle.height = 80;
          obstacle.position.y -= 25;
          this.pendingExplosionSound = true;
        }
      }
      
      // Update explosion timers
      if (obstacle.type === 'explosion' && obstacle.explosionTimer !== undefined) {
        obstacle.explosionTimer -= deltaTime;
        if (obstacle.explosionTimer <= 0) {
          this.obstacles.splice(i, 1);
          continue;
        }
      }
      
      // Remove off-screen obstacles
      if (obstacle.position.x < -100) {
        this.obstacles.splice(i, 1);
      }
    }
    
    // Update power-ups
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      this.powerUps[i].position.x -= this.scrollSpeed * deltaTime;
      if (this.powerUps[i].position.x < -50) {
        this.powerUps.splice(i, 1);
      }
    }
    
    // Update clouds
    this.cloudPositions.forEach(cloud => {
      cloud.x -= this.scrollSpeed * deltaTime * 0.3;
      if (cloud.x < -100) {
        cloud.x = 1200;
        cloud.y = 50 + Math.random() * 100;
      }
    });
    
    // Update fire decorations
    this.firePositions.forEach(fire => {
      fire.x -= this.scrollSpeed * deltaTime * 0.2;
      fire.frame += deltaTime * 8;
      if (fire.x < -50) {
        fire.x = 1000;
        fire.y = 40 + Math.random() * 60;
      }
    });
    
    // Spawn new obstacles based on theme
    this.spawnTimer += deltaTime;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnObstacle();
    }
    
    // Boss attacks
    this.bossAttackTimer += deltaTime;
    if (this.bossAttackTimer >= this.bossAttackInterval) {
      this.bossAttackTimer = 0;
      this.bossAttack();
    }
    
    // Spawn power-ups periodically
    if (Math.random() < deltaTime * 0.3) {
      this.spawnPowerUp();
    }
  }

  private cycleTheme() {
    const themes: Array<'forest' | 'mario' | 'bomberman'> = ['forest', 'mario', 'bomberman'];
    const currentIndex = themes.indexOf(this.currentTheme);
    this.currentTheme = themes[(currentIndex + 1) % themes.length];
  }

  private spawnObstacle() {
    const x = 1000;
    
    switch (this.currentTheme) {
      case 'forest':
        this.spawnForestObstacle(x);
        break;
      case 'mario':
        this.spawnMarioObstacle(x);
        break;
      case 'bomberman':
        this.spawnBombermanObstacle(x);
        break;
    }
  }

  private spawnForestObstacle(x: number) {
    const rand = Math.random();
    
    if (rand < 0.5) {
      // Log (jump)
      this.obstacles.push({
        position: { x, y: 330 },
        type: 'log',
        width: 60,
        height: 40,
        requiresJump: true,
        requiresCrouch: false
      });
    } else {
      // Spike (jump)
      this.obstacles.push({
        position: { x, y: 350 },
        type: 'spike',
        width: 40,
        height: 20,
        requiresJump: true,
        requiresCrouch: false
      });
    }
  }

  private spawnMarioObstacle(x: number) {
    const rand = Math.random();
    
    if (rand < 0.4) {
      // Pipe
      this.obstacles.push({
        position: { x, y: 320 },
        type: 'pipe',
        width: 40,
        height: 50,
        requiresJump: true,
        requiresCrouch: false
      });
    } else if (rand < 0.7) {
      // Goomba
      this.obstacles.push({
        position: { x, y: 340 },
        type: 'goomba',
        width: 30,
        height: 30,
        requiresJump: true,
        requiresCrouch: false
      });
    } else {
      // Bullet Bill (crouch)
      this.obstacles.push({
        position: { x, y: 320 },
        type: 'bulletBill',
        width: 50,
        height: 30,
        requiresJump: false,
        requiresCrouch: true
      });
    }
  }

  private spawnBombermanObstacle(x: number) {
    const rand = Math.random();
    
    if (rand < 0.5) {
      // Bomb
      this.obstacles.push({
        position: { x, y: 330 },
        type: 'bomb',
        width: 40,
        height: 40,
        requiresJump: true,
        requiresCrouch: false,
        timer: 2.5
      });
    } else {
      // Immediate explosion (crouch if high)
      const isHigh = Math.random() > 0.5;
      this.obstacles.push({
        position: { x, y: isHigh ? 290 : 320 },
        type: 'explosion',
        width: 70,
        height: 70,
        requiresJump: !isHigh,
        requiresCrouch: isHigh,
        explosionTimer: 3
      });
    }
  }

  private bossAttack() {
    const projectileCount = this.bossPhase + 2;
    
    for (let i = 0; i < projectileCount; i++) {
      const offsetY = (i - (projectileCount - 1) / 2) * 40;
      this.obstacles.push({
        position: { 
          x: this.bossPosition.x, 
          y: this.bossPosition.y + 50 + offsetY 
        },
        type: 'bossProjectile',
        width: 20,
        height: 20,
        requiresJump: Math.random() > 0.5,
        requiresCrouch: Math.random() > 0.5,
        velocityY: (Math.random() - 0.5) * 100
      });
    }
  }

  private spawnPowerUp() {
    const types: Array<'attackBoss' | 'shield' | 'speed'> = ['attackBoss', 'attackBoss', 'shield', 'speed'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    this.powerUps.push({
      position: { x: 900, y: 250 + Math.random() * 80 },
      collected: false,
      type
    });
  }

  damageBoss(damage: number) {
    if (this.bossDefeated) return;
    
    this.bossHealth = Math.max(0, this.bossHealth - damage);
    this.pendingBossHitSound = true;
    
    if (this.bossHealth <= 0) {
      this.bossDefeated = true;
    }
  }

  getCollisions(playerBounds: any) {
    const collisions = {
      obstacles: [] as Obstacle[],
      powerUps: [] as PowerUp[]
    };
    
    // Check obstacle collisions
    for (const obstacle of this.obstacles) {
      if (this.isColliding(playerBounds, {
        x: obstacle.position.x,
        y: obstacle.position.y,
        width: obstacle.width,
        height: obstacle.height
      })) {
        collisions.obstacles.push(obstacle);
      }
    }
    
    // Check power-up collisions
    for (const powerUp of this.powerUps) {
      if (!powerUp.collected && this.isColliding(playerBounds, {
        x: powerUp.position.x,
        y: powerUp.position.y,
        width: 30,
        height: 30
      })) {
        powerUp.collected = true;
        this.pendingCollectSound = true;
        collisions.powerUps.push(powerUp);
        
        // Attack boss if it's an attack power-up
        if (powerUp.type === 'attackBoss') {
          this.damageBoss(10);
        }
      }
    }
    
    return collisions;
  }

  private isColliding(a: any, b: any): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  render(ctx: CanvasRenderingContext2D) {
    // Render background based on current theme
    this.renderBackground(ctx);
    
    // Render ground
    this.renderGround(ctx);
    
    // Render power-ups
    this.powerUps.forEach(powerUp => {
      if (!powerUp.collected) {
        this.renderPowerUp(ctx, powerUp);
      }
    });
    
    // Render obstacles
    this.obstacles.forEach(obstacle => {
      this.renderObstacle(ctx, obstacle);
    });
    
    // Render boss
    this.renderBoss(ctx);
    
    // Render boss health bar
    this.renderBossHealthBar(ctx);
  }

  private renderBackground(ctx: CanvasRenderingContext2D) {
    let gradient: CanvasGradient;
    
    switch (this.currentTheme) {
      case 'forest':
        gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, "#87CEEB");
        gradient.addColorStop(0.7, "#98FB98");
        gradient.addColorStop(1, "#228B22");
        break;
      case 'mario':
        gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, "#5C94FC");
        gradient.addColorStop(1, "#3A7BD5");
        break;
      case 'bomberman':
        gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, "#1a1a2e");
        gradient.addColorStop(1, "#16213e");
        break;
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1000, 400);
    
    // Theme-specific decorations
    if (this.currentTheme === 'mario' || this.currentTheme === 'forest') {
      // Clouds
      ctx.fillStyle = "#FFF";
      this.cloudPositions.forEach(cloud => {
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, 20, 0, Math.PI * 2);
        ctx.arc(cloud.x + 25, cloud.y, 25, 0, Math.PI * 2);
        ctx.arc(cloud.x + 50, cloud.y, 20, 0, Math.PI * 2);
        ctx.fill();
      });
    }
    
    if (this.currentTheme === 'bomberman') {
      // Grid pattern
      ctx.strokeStyle = "#2d3a4a";
      ctx.lineWidth = 1;
      for (let x = -this.gridOffset; x < 1000; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 370);
        ctx.stroke();
      }
      for (let y = 0; y < 370; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1000, y);
        ctx.stroke();
      }
      
      // Fire decorations
      this.firePositions.forEach(fire => {
        const flicker = Math.sin(fire.frame) * 3;
        ctx.fillStyle = "#ff6b3530";
        ctx.beginPath();
        ctx.arc(fire.x, fire.y + flicker, 15, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }

  private renderGround(ctx: CanvasRenderingContext2D) {
    switch (this.currentTheme) {
      case 'forest':
        ctx.fillStyle = "#8B4513";
        ctx.fillRect(0, 370, 1000, 30);
        ctx.fillStyle = "#654321";
        for (let x = 0; x < 1000; x += 20) {
          ctx.fillRect(x, 375, 10, 5);
        }
        break;
      case 'mario':
        ctx.fillStyle = "#8B4513";
        ctx.fillRect(0, 370, 1000, 30);
        ctx.strokeStyle = "#654321";
        ctx.lineWidth = 2;
        for (let x = 0; x < 1000; x += 40) {
          ctx.strokeRect(x, 370, 40, 30);
        }
        break;
      case 'bomberman':
        ctx.fillStyle = "#4a4a4a";
        ctx.fillRect(0, 370, 1000, 30);
        ctx.fillStyle = "#5a5a5a";
        for (let x = -this.gridOffset; x < 1000; x += 40) {
          ctx.fillRect(x, 370, 38, 14);
          ctx.fillRect(x + 20, 384, 38, 14);
        }
        break;
    }
  }

  private renderObstacle(ctx: CanvasRenderingContext2D, obstacle: Obstacle) {
    const x = obstacle.position.x;
    const y = obstacle.position.y;
    
    switch (obstacle.type) {
      case 'log':
        ctx.fillStyle = "#8B4513";
        ctx.fillRect(x, y, obstacle.width, obstacle.height);
        ctx.strokeStyle = "#654321";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, obstacle.width, obstacle.height);
        // Wood rings
        ctx.strokeStyle = "#A0522D";
        ctx.beginPath();
        ctx.arc(x + 10, y + obstacle.height / 2, 8, 0, Math.PI * 2);
        ctx.stroke();
        break;
        
      case 'spike':
        ctx.fillStyle = "#7F8C8D";
        ctx.beginPath();
        ctx.moveTo(x, y + obstacle.height);
        ctx.lineTo(x + obstacle.width / 2, y);
        ctx.lineTo(x + obstacle.width, y + obstacle.height);
        ctx.closePath();
        ctx.fill();
        break;
        
      case 'pipe':
        ctx.fillStyle = "#2ECC40";
        ctx.fillRect(x, y, obstacle.width, obstacle.height);
        ctx.fillStyle = "#01FF70";
        ctx.fillRect(x - 5, y, obstacle.width + 10, 15);
        break;
        
      case 'goomba':
        ctx.fillStyle = "#8B4513";
        ctx.beginPath();
        ctx.arc(x + obstacle.width / 2, y + obstacle.height / 2, obstacle.width / 2, 0, Math.PI * 2);
        ctx.fill();
        // Eyes
        ctx.fillStyle = "#FFF";
        ctx.beginPath();
        ctx.arc(x + 10, y + 12, 4, 0, Math.PI * 2);
        ctx.arc(x + 20, y + 12, 4, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'bulletBill':
        ctx.fillStyle = "#1a1a1a";
        ctx.beginPath();
        ctx.ellipse(x + obstacle.width / 2, y + obstacle.height / 2, obstacle.width / 2, obstacle.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#FFF";
        ctx.beginPath();
        ctx.arc(x + 35, y + 10, 5, 0, Math.PI * 2);
        ctx.arc(x + 35, y + 20, 5, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'bomb':
        const pulseScale = 1 + Math.sin(Date.now() / 100) * 0.05;
        ctx.fillStyle = "#1a1a1a";
        ctx.beginPath();
        ctx.arc(x + 20, y + 25, 18 * pulseScale, 0, Math.PI * 2);
        ctx.fill();
        // Fuse spark
        if (obstacle.timer && obstacle.timer < 1.5) {
          ctx.fillStyle = "#ff6b35";
          ctx.beginPath();
          ctx.arc(x + 25, y - 5, 4, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
        
      case 'explosion':
        const progress = obstacle.explosionTimer ? obstacle.explosionTimer / 0.5 : 1;
        ctx.fillStyle = `rgba(255, 107, 53, ${progress * 0.8})`;
        ctx.beginPath();
        ctx.arc(x + obstacle.width / 2, y + obstacle.height / 2, 35 * (2 - progress), 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(255, 200, 0, ${progress})`;
        ctx.beginPath();
        ctx.arc(x + obstacle.width / 2, y + obstacle.height / 2, 25 * (2 - progress), 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'bossProjectile':
        ctx.fillStyle = "#FF0000";
        ctx.beginPath();
        ctx.arc(x + 10, y + 10, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#FF6B6B";
        ctx.beginPath();
        ctx.arc(x + 8, y + 8, 4, 0, Math.PI * 2);
        ctx.fill();
        break;
    }
  }

  private renderPowerUp(ctx: CanvasRenderingContext2D, powerUp: PowerUp) {
    const x = powerUp.position.x;
    const y = powerUp.position.y;
    const bounce = Math.sin(Date.now() / 200) * 3;
    
    ctx.save();
    ctx.translate(x + 15, y + 15 + bounce);
    
    switch (powerUp.type) {
      case 'attackBoss':
        // Red attack orb
        ctx.fillStyle = "#FF0000";
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#FFD700";
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("⚔", 0, 0);
        break;
        
      case 'shield':
        // Blue shield
        ctx.fillStyle = "#3498DB";
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#FFF";
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🛡", 0, 0);
        break;
        
      case 'speed':
        // Yellow speed boost
        ctx.fillStyle = "#F1C40F";
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#FFF";
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("⚡", 0, 0);
        break;
    }
    
    ctx.restore();
  }

  private renderBoss(ctx: CanvasRenderingContext2D) {
    if (this.bossDefeated) {
      this.renderBossDefeat(ctx);
      return;
    }
    
    const x = this.bossPosition.x;
    const y = this.bossPosition.y + Math.sin(this.bossAnimOffset * 2) * 10;
    
    // Boss colors based on phase
    let primaryColor = "#8E44AD";
    let secondaryColor = "#9B59B6";
    
    if (this.bossPhase === 2) {
      primaryColor = "#E74C3C";
      secondaryColor = "#C0392B";
    } else if (this.bossPhase === 3) {
      primaryColor = "#2C3E50";
      secondaryColor = "#34495E";
    }
    
    // Main body
    ctx.fillStyle = primaryColor;
    ctx.fillRect(x, y, 80, 80);
    
    // Inner body
    ctx.fillStyle = secondaryColor;
    ctx.fillRect(x + 10, y + 10, 60, 60);
    
    // Eyes
    const eyeGlow = Math.sin(this.bossAnimOffset * 4) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(255, 0, 0, ${eyeGlow})`;
    ctx.fillRect(x + 20, y + 25, 12, 12);
    ctx.fillRect(x + 48, y + 25, 12, 12);
    
    // Crown/spikes based on phase
    ctx.fillStyle = "#FFD700";
    for (let i = 0; i < this.bossPhase; i++) {
      const spikeX = x + 15 + i * 20;
      ctx.beginPath();
      ctx.moveTo(spikeX, y);
      ctx.lineTo(spikeX + 10, y - 15);
      ctx.lineTo(spikeX + 20, y);
      ctx.closePath();
      ctx.fill();
    }
  }

  private renderBossDefeat(ctx: CanvasRenderingContext2D) {
    const alpha = Math.max(0, 1 - this.bossAnimOffset);
    if (alpha <= 0) return;
    
    ctx.globalAlpha = alpha;
    
    // Explosion particles
    ctx.fillStyle = "#FFD700";
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 * i) / 20;
      const distance = this.bossAnimOffset * 150;
      const x = this.bossPosition.x + 40 + Math.cos(angle) * distance;
      const y = this.bossPosition.y + 40 + Math.sin(angle) * distance;
      ctx.fillRect(x - 5, y - 5, 10, 10);
    }
    
    ctx.globalAlpha = 1;
  }

  private renderBossHealthBar(ctx: CanvasRenderingContext2D) {
    const barWidth = 200;
    const barHeight = 20;
    const barX = 600;
    const barY = 20;
    
    // Background
    ctx.fillStyle = "#333";
    ctx.fillRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);
    
    // Health bar background
    ctx.fillStyle = "#8B0000";
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    // Health bar fill
    const healthPercent = this.bossHealth / this.bossMaxHealth;
    ctx.fillStyle = this.bossPhase === 3 ? "#FF0000" : this.bossPhase === 2 ? "#FF6B00" : "#00FF00";
    ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
    
    // Boss name
    ctx.fillStyle = "#FFF";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "left";
    ctx.fillText("BOSS", barX, barY - 5);
    
    // Phase indicator
    ctx.textAlign = "right";
    ctx.fillText(`PHASE ${this.bossPhase}`, barX + barWidth, barY - 5);
  }

  isBossDefeated(): boolean {
    return this.bossDefeated;
  }

  isComplete(): boolean {
    return this.bossDefeated;
  }

  getStartPosition() {
    return { x: 300, y: 300 };
  }

  getDistanceTraveled() {
    return Math.floor(this.distanceTraveled);
  }

  getTargetDistance() {
    return 0; // Boss fight, no distance target
  }

  getProgressPercentage() {
    return ((this.bossMaxHealth - this.bossHealth) / this.bossMaxHealth) * 100;
  }

  getBossHealthPercentage() {
    return (this.bossHealth / this.bossMaxHealth) * 100;
  }

  getCurrentTheme() {
    return this.currentTheme;
  }
}
