interface Obstacle {
  position: { x: number; y: number };
  type: 'blueShell' | 'banana' | 'redShell' | 'greenShell' | 'lightning' | 'fakeCube' | 'brokenHeart';
  width: number;
  height: number;
  requiresJump: boolean;
  requiresCrouch: boolean;
  velocityY?: number;
  rotation?: number;
}

interface Powerup {
  position: { x: number; y: number };
  collected: boolean;
  type: 'star' | 'mushroom' | 'heart';
}

export class RunnerLevel4 {
  private obstacles: Obstacle[] = [];
  private powerups: Powerup[] = [];
  private scrollSpeed = 270;
  private distanceTraveled = 0;
  private targetDistance = 1300;
  private spawnTimer = 0;
  private spawnInterval = 1.6;
  private difficulty = 1;
  private rainbowOffset = 0;
  private starPositions: Array<{ x: number; y: number; twinkle: number }> = [];
  private powerupsCollected = 0;
  
  public pendingCollectSound = false;
  public pendingHitSound = false;

  constructor() {
    this.reset();
  }

  reset() {
    this.obstacles = [];
    this.powerups = [];
    this.scrollSpeed = 270;
    this.distanceTraveled = 0;
    this.spawnTimer = 0;
    this.difficulty = 1;
    this.powerupsCollected = 0;
    this.rainbowOffset = 0;
    
    this.starPositions = [];
    for (let i = 0; i < 15; i++) {
      this.starPositions.push({
        x: Math.random() * 1000,
        y: 30 + Math.random() * 150,
        twinkle: Math.random() * Math.PI * 2
      });
    }
  }

  update(deltaTime: number) {
    this.distanceTraveled += (this.scrollSpeed * deltaTime) / 10;
    this.rainbowOffset += deltaTime * 50;
    
    const speedIncrements = Math.floor(this.distanceTraveled / 50);
    this.scrollSpeed = 270 + (speedIncrements * 1.5);
    this.spawnInterval = Math.max(1.0, 1.6 - (speedIncrements * 0.03));
    
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i];
      obstacle.position.x -= this.scrollSpeed * deltaTime;
      
      if (obstacle.rotation !== undefined) {
        obstacle.rotation += deltaTime * 5;
      }
      
      if (obstacle.type === 'blueShell' && obstacle.velocityY !== undefined) {
        obstacle.position.y += Math.sin(Date.now() / 200) * 2;
      }
      
      if (obstacle.position.x < -100) {
        this.obstacles.splice(i, 1);
      }
    }
    
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      this.powerups[i].position.x -= this.scrollSpeed * deltaTime;
      if (this.powerups[i].position.x < -50) {
        this.powerups.splice(i, 1);
      }
    }
    
    this.starPositions.forEach(star => {
      star.x -= this.scrollSpeed * deltaTime * 0.1;
      star.twinkle += deltaTime * 3;
      if (star.x < -20) {
        star.x = 1020;
        star.y = 30 + Math.random() * 150;
      }
    });
    
    this.spawnTimer += deltaTime;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnFriendshipObstacle();
    }
  }

  private spawnFriendshipObstacle() {
    const rand = Math.random();
    const x = 1000;
    
    if (rand < 0.18) {
      // Blue Shell (flying, needs crouch)
      this.obstacles.push({
        position: { x, y: 280 },
        type: 'blueShell',
        width: 45,
        height: 35,
        requiresJump: false,
        requiresCrouch: true,
        velocityY: 1
      });
    } else if (rand < 0.35) {
      // Banana peel (needs jump)
      const count = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        this.obstacles.push({
          position: { x: x + i * 50, y: 345 },
          type: 'banana',
          width: 35,
          height: 25,
          requiresJump: true,
          requiresCrouch: false
        });
      }
      
      if (Math.random() > 0.5) {
        this.spawnPowerup(x + 25);
      }
    } else if (rand < 0.48) {
      // Red Shell (homing, needs jump)
      this.obstacles.push({
        position: { x, y: 340 },
        type: 'redShell',
        width: 40,
        height: 30,
        requiresJump: true,
        requiresCrouch: false,
        rotation: 0
      });
    } else if (rand < 0.58) {
      // Green Shell (bouncing)
      this.obstacles.push({
        position: { x, y: 340 },
        type: 'greenShell',
        width: 40,
        height: 30,
        requiresJump: true,
        requiresCrouch: false,
        rotation: 0
      });
    } else if (rand < 0.68) {
      // Lightning bolt (tall, needs crouch)
      this.obstacles.push({
        position: { x, y: 250 },
        type: 'lightning',
        width: 30,
        height: 120,
        requiresJump: false,
        requiresCrouch: true
      });
    } else if (rand < 0.80) {
      // Fake item cube (needs jump)
      this.obstacles.push({
        position: { x, y: 320 },
        type: 'fakeCube',
        width: 40,
        height: 40,
        requiresJump: true,
        requiresCrouch: false
      });
      
      this.spawnPowerup(x + 80);
    } else if (rand < 0.90) {
      // Broken heart (emotional damage! needs jump)
      this.obstacles.push({
        position: { x, y: 330 },
        type: 'brokenHeart',
        width: 50,
        height: 45,
        requiresJump: true,
        requiresCrouch: false
      });
    } else {
      // Combo: bananas + blue shell
      this.obstacles.push({
        position: { x, y: 345 },
        type: 'banana',
        width: 35,
        height: 25,
        requiresJump: true,
        requiresCrouch: false
      });
      
      this.obstacles.push({
        position: { x: x + 80, y: 285 },
        type: 'blueShell',
        width: 45,
        height: 35,
        requiresJump: false,
        requiresCrouch: true,
        velocityY: 1
      });
      
      this.spawnPowerup(x + 40);
    }
  }

  private spawnPowerup(x: number) {
    const types: Array<'star' | 'mushroom' | 'heart'> = ['star', 'mushroom', 'heart'];
    this.powerups.push({
      position: { x, y: 270 + Math.random() * 40 },
      collected: false,
      type: types[Math.floor(Math.random() * types.length)]
    });
  }

  getCollisions(playerBounds: any) {
    const collisions = {
      obstacles: [] as Obstacle[],
      powerups: [] as Powerup[]
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
    
    for (const powerup of this.powerups) {
      if (!powerup.collected && this.isColliding(playerBounds, {
        x: powerup.position.x,
        y: powerup.position.y,
        width: 30,
        height: 30
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
    this.renderBackground(ctx);
    this.renderGround(ctx);
    
    this.powerups.forEach(powerup => {
      if (!powerup.collected) {
        this.renderPowerup(ctx, powerup);
      }
    });
    
    this.obstacles.forEach(obstacle => {
      this.renderObstacle(ctx, obstacle);
    });
  }

  private renderBackground(ctx: CanvasRenderingContext2D) {
    // Dark purple party background
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, "#1a0a2e");
    gradient.addColorStop(0.5, "#2d1b4e");
    gradient.addColorStop(1, "#4a2c7a");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1000, 400);
    
    // Rainbow road stripes in background
    const colors = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#8b00ff'];
    for (let i = 0; i < colors.length; i++) {
      const y = 200 + Math.sin((this.rainbowOffset / 100) + i * 0.5) * 30;
      ctx.strokeStyle = colors[i] + '40';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(0, y + i * 15);
      ctx.lineTo(1000, y + i * 15 + Math.sin(this.rainbowOffset / 50) * 20);
      ctx.stroke();
    }
    
    // Twinkling stars
    this.starPositions.forEach(star => {
      const alpha = 0.5 + Math.sin(star.twinkle) * 0.5;
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, 2 + Math.sin(star.twinkle) * 1, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // "DESTRUIR AMIZADES" text effect
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.font = "bold 60px Arial";
    ctx.textAlign = "center";
    const hue = (Date.now() / 20) % 360;
    ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
    ctx.fillText("💔", 500, 100);
    ctx.restore();
  }

  private renderGround(ctx: CanvasRenderingContext2D) {
    // Rainbow road ground
    const colors = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#8b00ff'];
    const stripeWidth = 1000 / colors.length;
    
    for (let i = 0; i < colors.length; i++) {
      const offset = (this.rainbowOffset + i * stripeWidth) % (stripeWidth * colors.length);
      ctx.fillStyle = colors[(i + Math.floor(this.rainbowOffset / 50)) % colors.length];
      ctx.fillRect(i * stripeWidth, 370, stripeWidth, 30);
    }
    
    // Road edges
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 368, 1000, 4);
    
    // Checkered pattern overlay
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    for (let x = -Math.floor(this.rainbowOffset) % 40; x < 1000; x += 40) {
      for (let i = 0; i < 2; i++) {
        if ((Math.floor(x / 40) + i) % 2 === 0) {
          ctx.fillRect(x, 370 + i * 15, 20, 15);
        }
      }
    }
  }

  private renderObstacle(ctx: CanvasRenderingContext2D, obstacle: Obstacle) {
    const x = obstacle.position.x;
    const y = obstacle.position.y;
    
    switch (obstacle.type) {
      case 'blueShell':
        this.renderBlueShell(ctx, x, y, obstacle);
        break;
      case 'banana':
        this.renderBanana(ctx, x, y);
        break;
      case 'redShell':
        this.renderRedShell(ctx, x, y, obstacle);
        break;
      case 'greenShell':
        this.renderGreenShell(ctx, x, y, obstacle);
        break;
      case 'lightning':
        this.renderLightning(ctx, x, y, obstacle);
        break;
      case 'fakeCube':
        this.renderFakeCube(ctx, x, y);
        break;
      case 'brokenHeart':
        this.renderBrokenHeart(ctx, x, y);
        break;
    }
  }

  private renderBlueShell(ctx: CanvasRenderingContext2D, x: number, y: number, obstacle: Obstacle) {
    // Wings
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.ellipse(x - 5, y + 15, 12, 8, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + obstacle.width + 5, y + 15, 12, 8, 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Shell body
    ctx.fillStyle = "#0066ff";
    ctx.beginPath();
    ctx.ellipse(x + obstacle.width / 2, y + obstacle.height / 2, obstacle.width / 2, obstacle.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Shell pattern
    ctx.fillStyle = "#0044aa";
    ctx.beginPath();
    ctx.ellipse(x + obstacle.width / 2, y + obstacle.height / 2 + 5, obstacle.width / 3, obstacle.height / 3, 0, 0, Math.PI);
    ctx.fill();
    
    // Spikes
    ctx.fillStyle = "#ffcc00";
    for (let i = 0; i < 3; i++) {
      const spikeX = x + 10 + i * 12;
      ctx.beginPath();
      ctx.moveTo(spikeX, y + 5);
      ctx.lineTo(spikeX + 5, y - 8);
      ctx.lineTo(spikeX + 10, y + 5);
      ctx.fill();
    }
    
    // Glow effect
    ctx.strokeStyle = "#00aaff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(x + obstacle.width / 2, y + obstacle.height / 2, obstacle.width / 2 + 5, obstacle.height / 2 + 5, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  private renderBanana(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.fillStyle = "#ffdd00";
    ctx.beginPath();
    ctx.moveTo(x + 5, y + 20);
    ctx.quadraticCurveTo(x, y, x + 15, y + 5);
    ctx.quadraticCurveTo(x + 30, y + 10, x + 30, y + 20);
    ctx.quadraticCurveTo(x + 25, y + 25, x + 15, y + 22);
    ctx.quadraticCurveTo(x + 5, y + 25, x + 5, y + 20);
    ctx.fill();
    
    // Brown tips
    ctx.fillStyle = "#8B4513";
    ctx.beginPath();
    ctx.arc(x + 5, y + 20, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 15, y + 5, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Spots
    ctx.fillStyle = "#cc9900";
    ctx.beginPath();
    ctx.arc(x + 18, y + 15, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderRedShell(ctx: CanvasRenderingContext2D, x: number, y: number, obstacle: Obstacle) {
    ctx.save();
    ctx.translate(x + obstacle.width / 2, y + obstacle.height / 2);
    ctx.rotate(obstacle.rotation || 0);
    
    // Shell
    ctx.fillStyle = "#ff0000";
    ctx.beginPath();
    ctx.ellipse(0, 0, obstacle.width / 2, obstacle.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Pattern
    ctx.fillStyle = "#cc0000";
    ctx.beginPath();
    ctx.ellipse(0, 5, obstacle.width / 3, obstacle.height / 3, 0, 0, Math.PI);
    ctx.fill();
    
    // White ring
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, obstacle.width / 2 - 5, obstacle.height / 2 - 5, 0, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.restore();
  }

  private renderGreenShell(ctx: CanvasRenderingContext2D, x: number, y: number, obstacle: Obstacle) {
    ctx.save();
    ctx.translate(x + obstacle.width / 2, y + obstacle.height / 2);
    ctx.rotate(obstacle.rotation || 0);
    
    ctx.fillStyle = "#00cc00";
    ctx.beginPath();
    ctx.ellipse(0, 0, obstacle.width / 2, obstacle.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = "#009900";
    ctx.beginPath();
    ctx.ellipse(0, 5, obstacle.width / 3, obstacle.height / 3, 0, 0, Math.PI);
    ctx.fill();
    
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, obstacle.width / 2 - 5, obstacle.height / 2 - 5, 0, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.restore();
  }

  private renderLightning(ctx: CanvasRenderingContext2D, x: number, y: number, obstacle: Obstacle) {
    const flash = Math.sin(Date.now() / 50) * 0.3 + 0.7;
    
    // Glow
    ctx.fillStyle = `rgba(255, 255, 0, ${flash * 0.3})`;
    ctx.beginPath();
    ctx.ellipse(x + 15, y + 60, 40, 70, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Lightning bolt
    ctx.fillStyle = `rgba(255, 255, 0, ${flash})`;
    ctx.beginPath();
    ctx.moveTo(x + 15, y);
    ctx.lineTo(x + 25, y + 45);
    ctx.lineTo(x + 18, y + 45);
    ctx.lineTo(x + 28, y + obstacle.height);
    ctx.lineTo(x + 8, y + 70);
    ctx.lineTo(x + 15, y + 70);
    ctx.lineTo(x + 5, y + 45);
    ctx.lineTo(x + 12, y + 45);
    ctx.closePath();
    ctx.fill();
    
    // White core
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(x + 14, y + 10);
    ctx.lineTo(x + 20, y + 45);
    ctx.lineTo(x + 16, y + 45);
    ctx.lineTo(x + 22, y + 100);
    ctx.lineTo(x + 12, y + 75);
    ctx.lineTo(x + 15, y + 75);
    ctx.lineTo(x + 10, y + 45);
    ctx.lineTo(x + 13, y + 45);
    ctx.closePath();
    ctx.fill();
  }

  private renderFakeCube(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Fake question block with upside-down question mark
    ctx.fillStyle = "#ff6600";
    ctx.fillRect(x, y, 40, 40);
    
    // Border
    ctx.strokeStyle = "#cc4400";
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, 40, 40);
    
    // Upside-down question mark (trap!)
    ctx.fillStyle = "#fff";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.save();
    ctx.translate(x + 20, y + 28);
    ctx.rotate(Math.PI);
    ctx.fillText("?", 0, 0);
    ctx.restore();
    
    // Evil eyes
    ctx.fillStyle = "#ff0000";
    ctx.beginPath();
    ctx.arc(x + 12, y + 12, 3, 0, Math.PI * 2);
    ctx.arc(x + 28, y + 12, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderBrokenHeart(ctx: CanvasRenderingContext2D, x: number, y: number) {
    const pulse = 1 + Math.sin(Date.now() / 200) * 0.1;
    
    ctx.save();
    ctx.translate(x + 25, y + 22);
    ctx.scale(pulse, pulse);
    
    // Left half
    ctx.fillStyle = "#ff0066";
    ctx.beginPath();
    ctx.moveTo(-2, 0);
    ctx.bezierCurveTo(-25, -15, -25, -35, -12, -35);
    ctx.bezierCurveTo(-5, -35, -2, -25, -2, -20);
    ctx.closePath();
    ctx.fill();
    
    // Right half (offset for broken effect)
    ctx.fillStyle = "#ff3388";
    ctx.beginPath();
    ctx.moveTo(4, 2);
    ctx.bezierCurveTo(27, -13, 27, -33, 14, -33);
    ctx.bezierCurveTo(7, -33, 4, -23, 4, -18);
    ctx.closePath();
    ctx.fill();
    
    // Crack line
    ctx.strokeStyle = "#1a0a2e";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -35);
    ctx.lineTo(-3, -20);
    ctx.lineTo(3, -10);
    ctx.lineTo(-2, 5);
    ctx.lineTo(2, 20);
    ctx.stroke();
    
    // Tear drops
    ctx.fillStyle = "#66ccff";
    ctx.beginPath();
    ctx.ellipse(-15, 10, 3, 5, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(17, 12, 3, 5, -0.3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }

  private renderPowerup(ctx: CanvasRenderingContext2D, powerup: Powerup) {
    const x = powerup.position.x;
    const y = powerup.position.y;
    const bounce = Math.sin(Date.now() / 200) * 3;
    const glow = 0.3 + Math.sin(Date.now() / 150) * 0.2;
    
    // Glow
    ctx.fillStyle = powerup.type === 'star' ? `rgba(255, 215, 0, ${glow})` :
                    powerup.type === 'mushroom' ? `rgba(255, 100, 100, ${glow})` :
                    `rgba(255, 100, 150, ${glow})`;
    ctx.beginPath();
    ctx.arc(x + 15, y + 15 + bounce, 25, 0, Math.PI * 2);
    ctx.fill();
    
    if (powerup.type === 'star') {
      // Star powerup
      ctx.fillStyle = "#ffd700";
      this.drawStar(ctx, x + 15, y + 15 + bounce, 15, 5);
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(x + 12, y + 12 + bounce, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (powerup.type === 'mushroom') {
      // Mushroom powerup
      ctx.fillStyle = "#ff4444";
      ctx.beginPath();
      ctx.arc(x + 15, y + 10 + bounce, 12, Math.PI, 0);
      ctx.fill();
      
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(x + 10, y + 8 + bounce, 4, 0, Math.PI * 2);
      ctx.arc(x + 20, y + 8 + bounce, 4, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = "#ffe4c4";
      ctx.fillRect(x + 10, y + 10 + bounce, 10, 15);
    } else {
      // Heart powerup
      ctx.fillStyle = "#ff69b4";
      ctx.beginPath();
      ctx.moveTo(x + 15, y + 25 + bounce);
      ctx.bezierCurveTo(x, y + 15 + bounce, x, y + bounce, x + 15, y + 8 + bounce);
      ctx.bezierCurveTo(x + 30, y + bounce, x + 30, y + 15 + bounce, x + 15, y + 25 + bounce);
      ctx.fill();
      
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(x + 10, y + 10 + bounce, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, points: number) {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? radius : radius / 2;
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
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
