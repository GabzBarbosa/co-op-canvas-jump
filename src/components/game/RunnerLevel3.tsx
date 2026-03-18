interface Obstacle {
  position: { x: number; y: number };
  type: 'polarBear' | 'iceberg' | 'snowball' | 'avalanche' | 'icicle' | 'seal' | 'frostWave';
  width: number;
  height: number;
  requiresJump: boolean;
  requiresCrouch: boolean;
  timer?: number;
  explosionTimer?: number;
}

interface Collectible {
  position: { x: number; y: number };
  collected: boolean;
  type: 'fish' | 'goldenFish' | 'snowflake';
}

export class RunnerLevel3 {
  private obstacles: Obstacle[] = [];
  private collectibles: Collectible[] = [];
  private scrollSpeed = 260;
  private distanceTraveled = 0;
  private targetDistance = 1300;
  private spawnTimer = 0;
  private spawnInterval = 1.8;
  private difficulty = 1;
  private snowflakePositions: Array<{ x: number; y: number; speed: number; size: number }> = [];
  private powerupsCollected = 0;
  private snowOffset = 0;
  
  public pendingExplosionSound = false;
  public pendingCollectSound = false;

  constructor() {
    this.reset();
  }

  reset() {
    this.obstacles = [];
    this.collectibles = [];
    this.scrollSpeed = 260;
    this.distanceTraveled = 0;
    this.spawnTimer = 0;
    this.difficulty = 1;
    this.powerupsCollected = 0;
    this.snowOffset = 0;
    
    this.snowflakePositions = [];
    for (let i = 0; i < 30; i++) {
      this.snowflakePositions.push({
        x: Math.random() * 1200,
        y: Math.random() * 400,
        speed: 30 + Math.random() * 60,
        size: 2 + Math.random() * 4
      });
    }
  }

  update(deltaTime: number) {
    this.distanceTraveled += (this.scrollSpeed * deltaTime) / 10;
    this.snowOffset += deltaTime;
    
    const speedIncrements = Math.floor(this.distanceTraveled / 50);
    this.scrollSpeed = 260 + (speedIncrements * 1.5);
    this.spawnInterval = Math.max(1.0, 1.8 - (speedIncrements * 0.04));
    
    // Update obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      this.obstacles[i].position.x -= this.scrollSpeed * deltaTime;
      
      // Snowball grows
      if (this.obstacles[i].type === 'snowball' && this.obstacles[i].timer !== undefined) {
        this.obstacles[i].timer! -= deltaTime;
        if (this.obstacles[i].timer! <= 0) {
          // Snowball becomes avalanche
          this.obstacles[i].type = 'avalanche';
          this.obstacles[i].explosionTimer = 0.8;
          this.obstacles[i].width = 90;
          this.obstacles[i].height = 60;
          this.obstacles[i].position.y -= 15;
          this.pendingExplosionSound = true;
        }
      }
      
      if (this.obstacles[i].type === 'avalanche' && this.obstacles[i].explosionTimer !== undefined) {
        this.obstacles[i].explosionTimer! -= deltaTime;
        if (this.obstacles[i].explosionTimer! <= 0) {
          this.obstacles.splice(i, 1);
          continue;
        }
      }
      
      if (this.obstacles[i].position.x < -100) {
        this.obstacles.splice(i, 1);
      }
    }
    
    // Update collectibles
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      this.collectibles[i].position.x -= this.scrollSpeed * deltaTime;
      if (this.collectibles[i].position.x < -50) {
        this.collectibles.splice(i, 1);
      }
    }
    
    // Update snowflakes
    this.snowflakePositions.forEach(flake => {
      flake.y += flake.speed * deltaTime;
      flake.x -= this.scrollSpeed * deltaTime * 0.3 + Math.sin(this.snowOffset + flake.x * 0.01) * 15 * deltaTime;
      if (flake.y > 400) {
        flake.y = -10;
        flake.x = Math.random() * 1200;
      }
      if (flake.x < -20) flake.x = 1200;
    });
    
    // Spawn
    this.spawnTimer += deltaTime;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnArcticObstacle();
    }
  }

  private spawnArcticObstacle() {
    const rand = Math.random();
    const x = 1000;
    
    if (rand < 0.22) {
      // Polar bear
      this.obstacles.push({
        position: { x, y: 330 },
        type: 'polarBear',
        width: 45,
        height: 40,
        requiresJump: true,
        requiresCrouch: false
      });
      
      if (Math.random() > 0.5) {
        this.collectibles.push({
          position: { x: x + 20, y: 280 },
          collected: false,
          type: 'fish'
        });
      }
    } else if (rand < 0.40) {
      // Iceberg stack
      const count = 1 + Math.floor(Math.random() * 2);
      for (let i = 0; i < count; i++) {
        this.obstacles.push({
          position: { x: x + i * 40, y: 335 },
          type: 'iceberg',
          width: 35,
          height: 35,
          requiresJump: true,
          requiresCrouch: false
        });
      }
    } else if (rand < 0.52) {
      // Icicle (hanging, crouch)
      this.obstacles.push({
        position: { x, y: 290 },
        type: 'icicle',
        width: 20,
        height: 80,
        requiresJump: false,
        requiresCrouch: true
      });
    } else if (rand < 0.64) {
      // Frost wave (crouch)
      this.obstacles.push({
        position: { x, y: 290 },
        type: 'frostWave',
        width: 60,
        height: 50,
        requiresJump: false,
        requiresCrouch: true
      });
    } else if (rand < 0.76) {
      // Snowball (turns to avalanche)
      this.obstacles.push({
        position: { x, y: 335 },
        type: 'snowball',
        width: 35,
        height: 35,
        requiresJump: true,
        requiresCrouch: false,
        timer: 2.5
      });
      
      if (Math.random() > 0.6) {
        this.collectibles.push({
          position: { x: x + 50, y: 280 },
          collected: false,
          type: Math.random() > 0.7 ? 'goldenFish' : 'fish'
        });
      }
    } else if (rand < 0.88) {
      // Seal (jump over)
      this.obstacles.push({
        position: { x, y: 345 },
        type: 'seal',
        width: 40,
        height: 25,
        requiresJump: true,
        requiresCrouch: false
      });
    } else {
      // Combo: iceberg + frost wave
      this.obstacles.push({
        position: { x, y: 335 },
        type: 'iceberg',
        width: 35,
        height: 35,
        requiresJump: true,
        requiresCrouch: false
      });
      
      this.obstacles.push({
        position: { x: x + 80, y: 290 },
        type: 'frostWave',
        width: 60,
        height: 50,
        requiresJump: false,
        requiresCrouch: true
      });
      
      this.collectibles.push({
        position: { x: x + 40, y: 260 },
        collected: false,
        type: 'goldenFish'
      });
    }
  }

  getCollisions(playerBounds: any) {
    const collisions = {
      obstacles: [] as Obstacle[],
      powerups: [] as Collectible[]
    };
    
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
    
    for (const item of this.collectibles) {
      if (!item.collected && this.isColliding(playerBounds, {
        x: item.position.x,
        y: item.position.y,
        width: 25,
        height: 25
      })) {
        item.collected = true;
        this.powerupsCollected++;
        this.pendingCollectSound = true;
        collisions.powerups.push(item);
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
    this.renderBackground(ctx);
    this.renderGround(ctx);
    
    // Render collectibles
    this.collectibles.forEach(item => {
      if (!item.collected) {
        this.renderCollectible(ctx, item);
      }
    });
    
    this.obstacles.forEach(obstacle => {
      this.renderObstacle(ctx, obstacle);
    });
    
    // Render snow on top
    this.renderSnow(ctx);
  }

  private renderBackground(ctx: CanvasRenderingContext2D) {
    // Arctic sky
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, "#87CEEB");
    gradient.addColorStop(0.3, "#B0E0E6");
    gradient.addColorStop(0.7, "#E0F0FF");
    gradient.addColorStop(1, "#F0F8FF");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1000, 400);
    
    // Mountains in background
    ctx.fillStyle = "#D4E6F1";
    ctx.beginPath();
    ctx.moveTo(0, 300);
    ctx.lineTo(100, 180);
    ctx.lineTo(200, 250);
    ctx.lineTo(350, 150);
    ctx.lineTo(500, 220);
    ctx.lineTo(600, 170);
    ctx.lineTo(750, 200);
    ctx.lineTo(900, 160);
    ctx.lineTo(1000, 230);
    ctx.lineTo(1000, 400);
    ctx.lineTo(0, 400);
    ctx.fill();
    
    // Snow caps
    ctx.fillStyle = "#FFF";
    ctx.beginPath();
    ctx.moveTo(80, 200);
    ctx.lineTo(100, 180);
    ctx.lineTo(120, 200);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(330, 170);
    ctx.lineTo(350, 150);
    ctx.lineTo(370, 170);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(580, 190);
    ctx.lineTo(600, 170);
    ctx.lineTo(620, 190);
    ctx.fill();
  }

  private renderGround(ctx: CanvasRenderingContext2D) {
    // Ice/snow ground
    ctx.fillStyle = "#E8F4F8";
    ctx.fillRect(0, 370, 1000, 30);
    
    // Ice cracks
    ctx.strokeStyle = "#B8D4E3";
    ctx.lineWidth = 1;
    for (let x = 20; x < 1000; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 370);
      ctx.lineTo(x + 10, 380);
      ctx.lineTo(x - 5, 390);
      ctx.stroke();
    }
    
    // Snow drifts
    ctx.fillStyle = "#FFF";
    for (let x = 0; x < 1000; x += 80) {
      ctx.beginPath();
      ctx.ellipse(x + 40, 370, 30, 5, 0, Math.PI, 0);
      ctx.fill();
    }
  }

  private renderSnow(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "#FFF";
    this.snowflakePositions.forEach(flake => {
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.arc(flake.x, flake.y, flake.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  private renderObstacle(ctx: CanvasRenderingContext2D, obstacle: Obstacle) {
    const x = obstacle.position.x;
    const y = obstacle.position.y;
    
    switch (obstacle.type) {
      case 'polarBear':
        // White body
        ctx.fillStyle = "#F5F5F5";
        ctx.fillRect(x + 5, y + 10, 35, 25);
        // Head
        ctx.fillRect(x + 30, y + 5, 15, 18);
        // Ears
        ctx.beginPath();
        ctx.arc(x + 33, y + 5, 4, 0, Math.PI * 2);
        ctx.arc(x + 43, y + 5, 4, 0, Math.PI * 2);
        ctx.fill();
        // Eyes
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(x + 36, y + 12, 2, 0, Math.PI * 2);
        ctx.arc(x + 42, y + 12, 2, 0, Math.PI * 2);
        ctx.fill();
        // Nose
        ctx.fillStyle = "#333";
        ctx.beginPath();
        ctx.arc(x + 44, y + 16, 3, 0, Math.PI * 2);
        ctx.fill();
        // Legs
        ctx.fillStyle = "#F5F5F5";
        ctx.fillRect(x + 8, y + 32, 8, 8);
        ctx.fillRect(x + 28, y + 32, 8, 8);
        // Claws
        ctx.fillStyle = "#333";
        ctx.fillRect(x + 8, y + 38, 2, 2);
        ctx.fillRect(x + 14, y + 38, 2, 2);
        ctx.fillRect(x + 28, y + 38, 2, 2);
        ctx.fillRect(x + 34, y + 38, 2, 2);
        break;
        
      case 'iceberg':
        // Ice blue block
        ctx.fillStyle = "#B0E0E6";
        ctx.fillRect(x, y, obstacle.width, obstacle.height);
        ctx.fillStyle = "#87CEEB";
        ctx.fillRect(x + 3, y + 3, obstacle.width - 6, obstacle.height - 6);
        // Ice shine
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.fillRect(x + 5, y + 5, 8, 4);
        // Cracks
        ctx.strokeStyle = "#A0D0E0";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 10, y);
        ctx.lineTo(x + 15, y + 15);
        ctx.lineTo(x + 8, y + obstacle.height);
        ctx.stroke();
        break;
        
      case 'snowball':
        // Rolling snowball
        const pulseScale = 1 + Math.sin(Date.now() / 100) * 0.05;
        ctx.fillStyle = "#FFF";
        ctx.beginPath();
        ctx.arc(x + 17, y + 20, 16 * pulseScale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#E8E8E8";
        ctx.beginPath();
        ctx.arc(x + 14, y + 16, 6, 0, Math.PI * 2);
        ctx.fill();
        // Timer
        if (obstacle.timer !== undefined && obstacle.timer < 1.5) {
          ctx.fillStyle = "#FF4444";
          ctx.font = "bold 10px Arial";
          ctx.textAlign = "center";
          ctx.fillText(obstacle.timer.toFixed(1), x + 17, y + 24);
        }
        break;
        
      case 'avalanche':
        // Large snow mass
        const progress = Math.min(1, (obstacle.explosionTimer || 0) / 0.8);
        const alpha = progress;
        ctx.fillStyle = `rgba(220, 230, 240, ${alpha})`;
        ctx.beginPath();
        ctx.ellipse(x + 45, y + 30, 45, 30, 0, 0, Math.PI * 2);
        ctx.fill();
        // Snow particles
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
        for (let i = 0; i < 8; i++) {
          const px = x + Math.random() * 90;
          const py = y + Math.random() * 60;
          ctx.beginPath();
          ctx.arc(px, py, 3 + Math.random() * 4, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
        
      case 'icicle':
        // Hanging icicle
        ctx.fillStyle = "#B0E0E6";
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + obstacle.width, y);
        ctx.lineTo(x + obstacle.width / 2, y + obstacle.height);
        ctx.fill();
        // Shine
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.beginPath();
        ctx.moveTo(x + 3, y);
        ctx.lineTo(x + 8, y);
        ctx.lineTo(x + obstacle.width / 2 - 2, y + obstacle.height - 10);
        ctx.fill();
        break;
        
      case 'seal':
        // Gray seal
        ctx.fillStyle = "#808080";
        ctx.beginPath();
        ctx.ellipse(x + 20, y + 12, 18, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        // Head
        ctx.beginPath();
        ctx.arc(x + 35, y + 8, 7, 0, Math.PI * 2);
        ctx.fill();
        // Eye
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(x + 37, y + 6, 2, 0, Math.PI * 2);
        ctx.fill();
        // Nose
        ctx.fillStyle = "#333";
        ctx.beginPath();
        ctx.arc(x + 40, y + 9, 2, 0, Math.PI * 2);
        ctx.fill();
        // Flippers
        ctx.fillStyle = "#707070";
        ctx.beginPath();
        ctx.ellipse(x + 5, y + 18, 6, 4, 0.3, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'frostWave':
        // Cold wind wave
        ctx.save();
        ctx.globalAlpha = 0.5;
        const waveGrad = ctx.createLinearGradient(x, y, x + obstacle.width, y);
        waveGrad.addColorStop(0, "rgba(150, 220, 255, 0)");
        waveGrad.addColorStop(0.5, "rgba(150, 220, 255, 0.8)");
        waveGrad.addColorStop(1, "rgba(150, 220, 255, 0)");
        ctx.fillStyle = waveGrad;
        ctx.fillRect(x, y, obstacle.width, obstacle.height);
        
        // Ice crystals
        ctx.fillStyle = "rgba(200, 240, 255, 0.7)";
        for (let i = 0; i < 5; i++) {
          const cx = x + 10 + i * 12;
          const cy = y + 15 + Math.sin(Date.now() / 200 + i) * 5;
          ctx.fillRect(cx - 2, cy - 2, 4, 4);
          ctx.fillRect(cx - 1, cy - 4, 2, 8);
          ctx.fillRect(cx - 4, cy - 1, 8, 2);
        }
        ctx.restore();
        break;
    }
  }

  private renderCollectible(ctx: CanvasRenderingContext2D, item: Collectible) {
    const x = item.position.x;
    const y = item.position.y;
    const bounce = Math.sin(Date.now() / 200) * 3;
    
    if (item.type === 'goldenFish') {
      ctx.fillStyle = "#FFD700";
      ctx.beginPath();
      ctx.ellipse(x + 12, y + 12 + bounce, 10, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x + 2, y + 12 + bounce);
      ctx.lineTo(x - 4, y + 6 + bounce);
      ctx.lineTo(x - 4, y + 18 + bounce);
      ctx.fill();
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.arc(x + 18, y + 10 + bounce, 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (item.type === 'fish') {
      ctx.fillStyle = "#87CEEB";
      ctx.beginPath();
      ctx.ellipse(x + 12, y + 12 + bounce, 8, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x + 4, y + 12 + bounce);
      ctx.lineTo(x - 2, y + 7 + bounce);
      ctx.lineTo(x - 2, y + 17 + bounce);
      ctx.fill();
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.arc(x + 16, y + 10 + bounce, 1.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Snowflake
      ctx.fillStyle = "#FFF";
      ctx.font = "16px Arial";
      ctx.textAlign = "center";
      ctx.fillText("❄", x + 12, y + 16 + bounce);
    }
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
