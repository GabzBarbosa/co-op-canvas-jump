interface Obstacle {
  position: { x: number; y: number };
  type: 'bomb' | 'explosion' | 'brick' | 'fire' | 'crate' | 'powerup' | 'spike';
  width: number;
  height: number;
  requiresJump: boolean;
  requiresCrouch: boolean;
  timer?: number;
  explosionTimer?: number;
}

interface Powerup {
  position: { x: number; y: number };
  collected: boolean;
  type: 'bombUp' | 'speedUp' | 'fireUp';
}

export class RunnerLevel3 {
  private obstacles: Obstacle[] = [];
  private powerups: Powerup[] = [];
  private scrollSpeed = 260;
  private distanceTraveled = 0;
  private targetDistance = 1300;
  private spawnTimer = 0;
  private spawnInterval = 1.8;
  private difficulty = 1;
  private firePositions: Array<{ x: number; y: number; frame: number }> = [];
  private powerupsCollected = 0;
  private gridOffset = 0;
  
  // Sound event flags
  public pendingExplosionSound = false;
  public pendingCollectSound = false;

  constructor() {
    this.reset();
  }

  reset() {
    this.obstacles = [];
    this.powerups = [];
    this.scrollSpeed = 260;
    this.distanceTraveled = 0;
    this.spawnTimer = 0;
    this.difficulty = 1;
    this.powerupsCollected = 0;
    this.gridOffset = 0;
    
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
    // Update distance
    this.distanceTraveled += (this.scrollSpeed * deltaTime) / 10;
    
    // Update grid offset for background animation
    this.gridOffset = (this.gridOffset + this.scrollSpeed * deltaTime) % 40;
    
    // Increase speed by 1.5 every 50 meters (gradual increase)
    const speedIncrements = Math.floor(this.distanceTraveled / 50);
    this.scrollSpeed = 260 + (speedIncrements * 1.5);
    this.spawnInterval = Math.max(1.0, 1.8 - (speedIncrements * 0.04));
    
    // Update obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      this.obstacles[i].position.x -= this.scrollSpeed * deltaTime;
      
      // Update bomb timers
      if (this.obstacles[i].type === 'bomb' && this.obstacles[i].timer !== undefined) {
        this.obstacles[i].timer! -= deltaTime;
        if (this.obstacles[i].timer! <= 0) {
          // Convert bomb to explosion
          this.obstacles[i].type = 'explosion';
          this.obstacles[i].explosionTimer = 0.5;
          this.obstacles[i].width = 80;
          this.obstacles[i].height = 80;
          this.obstacles[i].position.y -= 25;
          this.pendingExplosionSound = true;
        }
      }
      
      // Update explosion timers
      if (this.obstacles[i].type === 'explosion' && this.obstacles[i].explosionTimer !== undefined) {
        this.obstacles[i].explosionTimer! -= deltaTime;
        if (this.obstacles[i].explosionTimer! <= 0) {
          this.obstacles.splice(i, 1);
          continue;
        }
      }
      
      // Remove off-screen obstacles
      if (this.obstacles[i].position.x < -100) {
        this.obstacles.splice(i, 1);
      }
    }
    
    // Update powerups
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      this.powerups[i].position.x -= this.scrollSpeed * deltaTime;
      
      if (this.powerups[i].position.x < -50) {
        this.powerups.splice(i, 1);
      }
    }
    
    // Update fire animation
    this.firePositions.forEach(fire => {
      fire.x -= this.scrollSpeed * deltaTime * 0.2;
      fire.frame += deltaTime * 8;
      if (fire.x < -50) {
        fire.x = 1000;
        fire.y = 40 + Math.random() * 60;
      }
    });
    
    // Spawn new obstacles
    this.spawnTimer += deltaTime;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnBombermanObstacle();
    }
  }

  private spawnBombermanObstacle() {
    const rand = Math.random();
    const x = 1000;
    
    if (rand < 0.25) {
      // Spawn bomb (needs jump before it explodes)
      this.obstacles.push({
        position: { x, y: 330 },
        type: 'bomb',
        width: 40,
        height: 40,
        requiresJump: true,
        requiresCrouch: false,
        timer: 2.5
      });
      
      // Add powerup near bomb
      if (Math.random() > 0.6) {
        const types: Array<'bombUp' | 'speedUp' | 'fireUp'> = ['bombUp', 'speedUp', 'fireUp'];
        this.powerups.push({
          position: { x: x + 60, y: 280 },
          collected: false,
          type: types[Math.floor(Math.random() * types.length)]
        });
      }
    } else if (rand < 0.45) {
      // Spawn brick wall (needs jump)
      const brickCount = 1 + Math.floor(Math.random() * 2);
      for (let i = 0; i < brickCount; i++) {
        this.obstacles.push({
          position: { x: x + i * 45, y: 330 },
          type: 'brick',
          width: 40,
          height: 40,
          requiresJump: true,
          requiresCrouch: false
        });
      }
    } else if (rand < 0.58) {
      // Spawn fire wave (needs crouch)
      this.obstacles.push({
        position: { x, y: 290 },
        type: 'fire',
        width: 60,
        height: 50,
        requiresJump: false,
        requiresCrouch: true
      });
    } else if (rand < 0.70) {
      // Spawn explosion (immediate danger - needs crouch if high, jump if low)
      const isHigh = Math.random() > 0.5;
      this.obstacles.push({
        position: { x, y: isHigh ? 280 : 320 },
        type: 'explosion',
        width: 70,
        height: 70,
        requiresJump: !isHigh,
        requiresCrouch: isHigh,
        explosionTimer: 3
      });
    } else if (rand < 0.82) {
      // Spawn crate stack (needs jump)
      const crateHeight = 2 + Math.floor(Math.random() * 2);
      for (let i = 0; i < crateHeight; i++) {
        this.obstacles.push({
          position: { x, y: 330 - i * 35 },
          type: 'crate',
          width: 35,
          height: 35,
          requiresJump: true,
          requiresCrouch: false
        });
      }
    } else if (rand < 0.92) {
      // Spawn spike row (needs jump)
      this.obstacles.push({
        position: { x, y: 350 },
        type: 'spike',
        width: 50,
        height: 20,
        requiresJump: true,
        requiresCrouch: false
      });
    } else {
      // Spawn combo: bombs + fire
      this.obstacles.push({
        position: { x, y: 330 },
        type: 'bomb',
        width: 40,
        height: 40,
        requiresJump: true,
        requiresCrouch: false,
        timer: 2
      });
      
      this.obstacles.push({
        position: { x: x + 100, y: 290 },
        type: 'fire',
        width: 60,
        height: 50,
        requiresJump: false,
        requiresCrouch: true
      });
      
      // Power-up in arc
      this.powerups.push({
        position: { x: x + 50, y: 250 },
        collected: false,
        type: 'fireUp'
      });
    }
  }

  getCollisions(playerBounds: any) {
    const collisions = {
      obstacles: [] as Obstacle[],
      powerups: [] as Powerup[]
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
    
    // Check powerup collisions
    for (const powerup of this.powerups) {
      if (!powerup.collected && this.isColliding(playerBounds, {
        x: powerup.position.x,
        y: powerup.position.y,
        width: 25,
        height: 25
      })) {
        powerup.collected = true;
        this.powerupsCollected++;
        this.pendingCollectSound = true;
        collisions.powerups.push(powerup);
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
    // Render background
    this.renderBackground(ctx);
    
    // Render ground
    this.renderGround(ctx);
    
    // Render powerups
    this.powerups.forEach(powerup => {
      if (!powerup.collected) {
        this.renderPowerup(ctx, powerup);
      }
    });
    
    // Render obstacles
    this.obstacles.forEach(obstacle => {
      this.renderObstacle(ctx, obstacle);
    });
  }

  private renderBackground(ctx: CanvasRenderingContext2D) {
    // Dark green/gray Bomberman-style background
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, "#1a1a2e");
    gradient.addColorStop(1, "#16213e");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1000, 400);
    
    // Grid pattern (Bomberman style)
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
    
    // Animated fire decorations in background
    this.firePositions.forEach(fire => {
      const flicker = Math.sin(fire.frame) * 3;
      ctx.fillStyle = "#ff6b3530";
      ctx.beginPath();
      ctx.arc(fire.x, fire.y + flicker, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffa50030";
      ctx.beginPath();
      ctx.arc(fire.x, fire.y - 5 + flicker, 10, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  private renderGround(ctx: CanvasRenderingContext2D) {
    // Bomberman-style brick floor
    ctx.fillStyle = "#4a4a4a";
    ctx.fillRect(0, 370, 1000, 30);
    
    // Brick pattern
    ctx.fillStyle = "#5a5a5a";
    for (let x = -this.gridOffset; x < 1000; x += 40) {
      ctx.fillRect(x, 370, 38, 14);
      ctx.fillRect(x + 20, 384, 38, 14);
    }
    
    // Brick outlines
    ctx.strokeStyle = "#3a3a3a";
    ctx.lineWidth = 1;
    for (let x = -this.gridOffset; x < 1000; x += 40) {
      ctx.strokeRect(x, 370, 40, 15);
      ctx.strokeRect(x + 20, 385, 40, 15);
    }
  }

  private renderObstacle(ctx: CanvasRenderingContext2D, obstacle: Obstacle) {
    switch (obstacle.type) {
      case 'bomb':
        this.renderBomb(ctx, obstacle);
        break;
      case 'explosion':
        this.renderExplosion(ctx, obstacle);
        break;
      case 'brick':
        this.renderBrick(ctx, obstacle);
        break;
      case 'fire':
        this.renderFire(ctx, obstacle);
        break;
      case 'crate':
        this.renderCrate(ctx, obstacle);
        break;
      case 'spike':
        this.renderSpike(ctx, obstacle);
        break;
    }
  }

  private renderBomb(ctx: CanvasRenderingContext2D, obstacle: Obstacle) {
    const x = obstacle.position.x;
    const y = obstacle.position.y;
    const pulseScale = 1 + Math.sin(Date.now() / 100) * 0.05;
    
    // Bomb body
    ctx.fillStyle = "#1a1a1a";
    ctx.beginPath();
    ctx.arc(x + 20, y + 25, 18 * pulseScale, 0, Math.PI * 2);
    ctx.fill();
    
    // Bomb highlight
    ctx.fillStyle = "#3a3a3a";
    ctx.beginPath();
    ctx.arc(x + 14, y + 18, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Fuse
    ctx.strokeStyle = "#8B4513";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 20, y + 5);
    ctx.quadraticCurveTo(x + 30, y - 5, x + 25, y - 10);
    ctx.stroke();
    
    // Fuse spark
    if (obstacle.timer && obstacle.timer < 1.5) {
      ctx.fillStyle = "#ff6b35";
      ctx.beginPath();
      ctx.arc(x + 25, y - 12, 4 + Math.sin(Date.now() / 50) * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffff00";
      ctx.beginPath();
      ctx.arc(x + 25, y - 12, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Timer indicator
    if (obstacle.timer !== undefined) {
      ctx.fillStyle = "#ff4444";
      ctx.font = "bold 12px Arial";
      ctx.textAlign = "center";
      ctx.fillText(obstacle.timer.toFixed(1), x + 20, y + 30);
    }
  }

  private renderExplosion(ctx: CanvasRenderingContext2D, obstacle: Obstacle) {
    const x = obstacle.position.x + obstacle.width / 2;
    const y = obstacle.position.y + obstacle.height / 2;
    const maxTimer = obstacle.explosionTimer && obstacle.explosionTimer > 0.5 ? obstacle.explosionTimer : 0.5;
    const progress = Math.min(1, (obstacle.explosionTimer || 0) / maxTimer);
    
    // Ensure radius is always positive
    const outerRadius = Math.max(5, 35 * (1 + (1 - progress) * 0.5));
    const middleRadius = Math.max(3, 25 * (1 + (1 - progress) * 0.5));
    const innerRadius = Math.max(2, 12 * (1 + (1 - progress) * 0.5));
    
    // Outer explosion
    ctx.fillStyle = `rgba(255, 107, 53, ${Math.min(1, progress * 0.8)})`;
    ctx.beginPath();
    ctx.arc(x, y, outerRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Middle explosion
    ctx.fillStyle = `rgba(255, 200, 0, ${Math.min(1, progress)})`;
    ctx.beginPath();
    ctx.arc(x, y, middleRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Inner explosion
    ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, progress)})`;
    ctx.beginPath();
    ctx.arc(x, y, innerRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Explosion rays
    ctx.strokeStyle = `rgba(255, 107, 53, ${Math.min(1, progress * 0.6)})`;
    ctx.lineWidth = 8;
    const rayLength = Math.max(5, 40 * (1 + (1 - progress) * 0.5));
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + Date.now() / 200;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(
        x + Math.cos(angle) * rayLength,
        y + Math.sin(angle) * rayLength
      );
      ctx.stroke();
    }
  }

  private renderBrick(ctx: CanvasRenderingContext2D, obstacle: Obstacle) {
    const x = obstacle.position.x;
    const y = obstacle.position.y;
    
    // Main brick
    ctx.fillStyle = "#8B7355";
    ctx.fillRect(x, y, obstacle.width, obstacle.height);
    
    // Brick pattern
    ctx.fillStyle = "#a08060";
    ctx.fillRect(x + 2, y + 2, obstacle.width - 4, (obstacle.height / 2) - 2);
    ctx.fillRect(x + 2, y + obstacle.height / 2 + 1, obstacle.width - 4, (obstacle.height / 2) - 3);
    
    // Border
    ctx.strokeStyle = "#5a4a3a";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, obstacle.width, obstacle.height);
    
    // Highlight
    ctx.fillStyle = "#c0a080";
    ctx.fillRect(x + 3, y + 3, 8, 4);
  }

  private renderFire(ctx: CanvasRenderingContext2D, obstacle: Obstacle) {
    const x = obstacle.position.x;
    const y = obstacle.position.y;
    const time = Date.now() / 100;
    
    // Fire glow
    ctx.fillStyle = "rgba(255, 100, 0, 0.3)";
    ctx.beginPath();
    ctx.ellipse(x + 30, y + 40, 40, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Fire flames
    for (let i = 0; i < 5; i++) {
      const flameX = x + 10 + i * 12;
      const flicker = Math.sin(time + i) * 5;
      
      // Outer flame
      ctx.fillStyle = "#ff4500";
      ctx.beginPath();
      ctx.moveTo(flameX, y + obstacle.height);
      ctx.quadraticCurveTo(flameX - 8, y + 25 + flicker, flameX, y + flicker);
      ctx.quadraticCurveTo(flameX + 8, y + 25 + flicker, flameX, y + obstacle.height);
      ctx.fill();
      
      // Inner flame
      ctx.fillStyle = "#ffa500";
      ctx.beginPath();
      ctx.moveTo(flameX, y + obstacle.height);
      ctx.quadraticCurveTo(flameX - 4, y + 30 + flicker, flameX, y + 15 + flicker);
      ctx.quadraticCurveTo(flameX + 4, y + 30 + flicker, flameX, y + obstacle.height);
      ctx.fill();
      
      // Core
      ctx.fillStyle = "#ffff00";
      ctx.beginPath();
      ctx.moveTo(flameX, y + obstacle.height);
      ctx.quadraticCurveTo(flameX - 2, y + 35 + flicker, flameX, y + 25 + flicker);
      ctx.quadraticCurveTo(flameX + 2, y + 35 + flicker, flameX, y + obstacle.height);
      ctx.fill();
    }
  }

  private renderCrate(ctx: CanvasRenderingContext2D, obstacle: Obstacle) {
    const x = obstacle.position.x;
    const y = obstacle.position.y;
    
    // Crate body
    ctx.fillStyle = "#deb887";
    ctx.fillRect(x, y, obstacle.width, obstacle.height);
    
    // Wood grain
    ctx.strokeStyle = "#8B4513";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 5, y);
    ctx.lineTo(x + 5, y + obstacle.height);
    ctx.moveTo(x + obstacle.width - 5, y);
    ctx.lineTo(x + obstacle.width - 5, y + obstacle.height);
    ctx.stroke();
    
    // Cross pattern
    ctx.strokeStyle = "#654321";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + obstacle.width, y + obstacle.height);
    ctx.moveTo(x + obstacle.width, y);
    ctx.lineTo(x, y + obstacle.height);
    ctx.stroke();
    
    // Border
    ctx.strokeStyle = "#5a3a1a";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, obstacle.width, obstacle.height);
  }

  private renderSpike(ctx: CanvasRenderingContext2D, obstacle: Obstacle) {
    const x = obstacle.position.x;
    const y = obstacle.position.y;
    
    // Spike base
    ctx.fillStyle = "#4a4a4a";
    ctx.fillRect(x, y + 15, obstacle.width, 5);
    
    // Spikes
    ctx.fillStyle = "#c0c0c0";
    const spikeCount = 5;
    const spikeWidth = obstacle.width / spikeCount;
    for (let i = 0; i < spikeCount; i++) {
      ctx.beginPath();
      ctx.moveTo(x + i * spikeWidth, y + 15);
      ctx.lineTo(x + i * spikeWidth + spikeWidth / 2, y);
      ctx.lineTo(x + (i + 1) * spikeWidth, y + 15);
      ctx.closePath();
      ctx.fill();
      
      // Spike shine
      ctx.fillStyle = "#e0e0e0";
      ctx.beginPath();
      ctx.moveTo(x + i * spikeWidth + 2, y + 13);
      ctx.lineTo(x + i * spikeWidth + spikeWidth / 2, y + 3);
      ctx.lineTo(x + i * spikeWidth + spikeWidth / 2 + 2, y + 13);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#c0c0c0";
    }
  }

  private renderPowerup(ctx: CanvasRenderingContext2D, powerup: Powerup) {
    const x = powerup.position.x;
    const y = powerup.position.y;
    const bounce = Math.sin(Date.now() / 200) * 3;
    
    // Glow effect
    ctx.fillStyle = powerup.type === 'bombUp' ? "rgba(255, 100, 0, 0.3)" :
                    powerup.type === 'speedUp' ? "rgba(0, 200, 255, 0.3)" :
                    "rgba(255, 50, 50, 0.3)";
    ctx.beginPath();
    ctx.arc(x + 12, y + 12 + bounce, 18, 0, Math.PI * 2);
    ctx.fill();
    
    // Powerup body
    ctx.fillStyle = powerup.type === 'bombUp' ? "#ff6b35" :
                    powerup.type === 'speedUp' ? "#00d4ff" :
                    "#ff3333";
    ctx.beginPath();
    ctx.roundRect(x, y + bounce, 25, 25, 5);
    ctx.fill();
    
    // Icon
    ctx.fillStyle = "#fff";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      powerup.type === 'bombUp' ? "💣" :
      powerup.type === 'speedUp' ? "⚡" : "🔥",
      x + 12, y + 18 + bounce
    );
  }

  getStartPosition() {
    return { x: 300, y: 300 };
  }

  getDistanceTraveled() {
    return Math.floor(this.distanceTraveled);
  }

  getTargetDistance() {
    return this.targetDistance;
  }

  getProgressPercentage() {
    return Math.min(100, (this.distanceTraveled / this.targetDistance) * 100);
  }

  isComplete() {
    return this.distanceTraveled >= this.targetDistance;
  }

  getPowerupsCollected() {
    return this.powerupsCollected;
  }

  getDifficulty() {
    return this.difficulty;
  }
}