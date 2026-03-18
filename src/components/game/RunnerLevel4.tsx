interface Obstacle {
  position: { x: number; y: number };
  type: 'snake' | 'spider' | 'monkey' | 'vine' | 'quicksand' | 'parrot' | 'jaguar';
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
  type: 'banana' | 'coconut' | 'flower';
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
  private leafPositions: Array<{ x: number; y: number; size: number; rot: number }> = [];
  private powerupsCollected = 0;
  private jungleOffset = 0;
  
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
    this.jungleOffset = 0;
    
    this.leafPositions = [];
    for (let i = 0; i < 10; i++) {
      this.leafPositions.push({
        x: Math.random() * 1000,
        y: 20 + Math.random() * 100,
        size: 5 + Math.random() * 10,
        rot: Math.random() * Math.PI * 2
      });
    }
  }

  update(deltaTime: number) {
    this.distanceTraveled += (this.scrollSpeed * deltaTime) / 10;
    this.jungleOffset += deltaTime;
    
    const speedIncrements = Math.floor(this.distanceTraveled / 50);
    this.scrollSpeed = 270 + (speedIncrements * 1.5);
    this.spawnInterval = Math.max(1.0, 1.6 - (speedIncrements * 0.03));
    
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i];
      obstacle.position.x -= this.scrollSpeed * deltaTime;
      
      if (obstacle.type === 'parrot' && obstacle.velocityY !== undefined) {
        obstacle.position.y += Math.sin(Date.now() / 200) * 2;
      }
      
      if (obstacle.rotation !== undefined) {
        obstacle.rotation += deltaTime * 3;
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
    
    this.leafPositions.forEach(leaf => {
      leaf.x -= this.scrollSpeed * deltaTime * 0.15;
      leaf.rot += deltaTime * 2;
      if (leaf.x < -20) {
        leaf.x = 1020;
        leaf.y = 20 + Math.random() * 100;
      }
    });
    
    this.spawnTimer += deltaTime;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnJungleObstacle();
    }
  }

  private spawnJungleObstacle() {
    const rand = Math.random();
    const x = 1000;
    
    if (rand < 0.18) {
      // Parrot (flying, needs crouch)
      this.obstacles.push({
        position: { x, y: 280 },
        type: 'parrot',
        width: 40,
        height: 30,
        requiresJump: false,
        requiresCrouch: true,
        velocityY: 1
      });
    } else if (rand < 0.33) {
      // Snakes (ground, needs jump)
      const count = 1 + Math.floor(Math.random() * 2);
      for (let i = 0; i < count; i++) {
        this.obstacles.push({
          position: { x: x + i * 45, y: 350 },
          type: 'snake',
          width: 35,
          height: 20,
          requiresJump: true,
          requiresCrouch: false
        });
      }
      if (Math.random() > 0.5) {
        this.spawnPowerup(x + 20);
      }
    } else if (rand < 0.46) {
      // Spider (hanging, needs jump)
      this.obstacles.push({
        position: { x, y: 340 },
        type: 'spider',
        width: 35,
        height: 30,
        requiresJump: true,
        requiresCrouch: false
      });
    } else if (rand < 0.58) {
      // Monkey throwing coconuts
      this.obstacles.push({
        position: { x, y: 340 },
        type: 'monkey',
        width: 35,
        height: 30,
        requiresJump: true,
        requiresCrouch: false,
        rotation: 0
      });
    } else if (rand < 0.68) {
      // Vine (tall, needs crouch)
      this.obstacles.push({
        position: { x, y: 250 },
        type: 'vine',
        width: 25,
        height: 120,
        requiresJump: false,
        requiresCrouch: true
      });
    } else if (rand < 0.80) {
      // Quicksand (needs jump)
      this.obstacles.push({
        position: { x, y: 350 },
        type: 'quicksand',
        width: 60,
        height: 20,
        requiresJump: true,
        requiresCrouch: false
      });
      this.spawnPowerup(x + 30);
    } else if (rand < 0.90) {
      // Jaguar (fast, needs jump)
      this.obstacles.push({
        position: { x, y: 335 },
        type: 'jaguar',
        width: 45,
        height: 35,
        requiresJump: true,
        requiresCrouch: false
      });
    } else {
      // Combo: snakes + parrot
      this.obstacles.push({
        position: { x, y: 350 },
        type: 'snake',
        width: 35,
        height: 20,
        requiresJump: true,
        requiresCrouch: false
      });
      
      this.obstacles.push({
        position: { x: x + 70, y: 285 },
        type: 'parrot',
        width: 40,
        height: 30,
        requiresJump: false,
        requiresCrouch: true,
        velocityY: 1
      });
      
      this.spawnPowerup(x + 35);
    }
  }

  private spawnPowerup(x: number) {
    const types: Array<'banana' | 'coconut' | 'flower'> = ['banana', 'coconut', 'flower'];
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
    // Dense jungle gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, "#0a3d0a");
    gradient.addColorStop(0.3, "#1a5c1a");
    gradient.addColorStop(0.6, "#2d7a2d");
    gradient.addColorStop(1, "#1a4a1a");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1000, 400);
    
    // Tree canopy at top
    ctx.fillStyle = "#0d4d0d";
    for (let x = 0; x < 1000; x += 60) {
      ctx.beginPath();
      ctx.arc(x + 30, 30, 40, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#1a6b1a";
    for (let x = 20; x < 1000; x += 80) {
      ctx.beginPath();
      ctx.arc(x + 20, 50, 30, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Light filtering through canopy
    ctx.save();
    ctx.globalAlpha = 0.08;
    for (let i = 0; i < 5; i++) {
      const rayX = 80 + i * 200 + Math.sin(this.jungleOffset + i) * 20;
      ctx.fillStyle = "#FFD700";
      ctx.beginPath();
      ctx.moveTo(rayX - 10, 60);
      ctx.lineTo(rayX + 10, 60);
      ctx.lineTo(rayX + 40, 370);
      ctx.lineTo(rayX - 40, 370);
      ctx.fill();
    }
    ctx.restore();
    
    // Falling leaves
    this.leafPositions.forEach(leaf => {
      ctx.save();
      ctx.translate(leaf.x, leaf.y);
      ctx.rotate(leaf.rot);
      ctx.fillStyle = "#228B22";
      ctx.beginPath();
      ctx.ellipse(0, 0, leaf.size, leaf.size / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    
    // Vines hanging from top
    ctx.strokeStyle = "#2d5a2d";
    ctx.lineWidth = 3;
    for (let i = 0; i < 8; i++) {
      const vx = 50 + i * 130;
      const sway = Math.sin(this.jungleOffset * 0.5 + i) * 10;
      ctx.beginPath();
      ctx.moveTo(vx, 0);
      ctx.quadraticCurveTo(vx + sway, 100, vx - sway * 0.5, 150 + Math.random() * 50);
      ctx.stroke();
    }
  }

  private renderGround(ctx: CanvasRenderingContext2D) {
    // Jungle floor - dirt and moss
    ctx.fillStyle = "#3d2b1f";
    ctx.fillRect(0, 370, 1000, 30);
    
    // Moss patches
    ctx.fillStyle = "#2d5a2d";
    for (let x = 0; x < 1000; x += 40) {
      ctx.fillRect(x, 370, 20, 5);
    }
    
    // Roots
    ctx.strokeStyle = "#5a3d2b";
    ctx.lineWidth = 2;
    for (let x = 0; x < 1000; x += 100) {
      ctx.beginPath();
      ctx.moveTo(x, 370);
      ctx.quadraticCurveTo(x + 20, 375, x + 40, 370);
      ctx.stroke();
    }
    
    // Small plants/mushrooms
    ctx.fillStyle = "#4a8a4a";
    for (let x = 15; x < 1000; x += 70) {
      ctx.fillRect(x, 365, 3, 5);
      ctx.beginPath();
      ctx.arc(x + 1, 364, 4, Math.PI, 0);
      ctx.fill();
    }
  }

  private renderObstacle(ctx: CanvasRenderingContext2D, obstacle: Obstacle) {
    const x = obstacle.position.x;
    const y = obstacle.position.y;
    
    switch (obstacle.type) {
      case 'snake':
        // Green snake on ground
        ctx.fillStyle = "#228B22";
        ctx.beginPath();
        ctx.moveTo(x, y + 10);
        for (let i = 0; i < obstacle.width; i += 5) {
          ctx.lineTo(x + i, y + 10 + Math.sin(i * 0.3 + this.jungleOffset * 5) * 5);
        }
        ctx.lineTo(x + obstacle.width, y + 15);
        for (let i = obstacle.width; i >= 0; i -= 5) {
          ctx.lineTo(x + i, y + 15 + Math.sin(i * 0.3 + this.jungleOffset * 5) * 5);
        }
        ctx.fill();
        // Head
        ctx.fillStyle = "#1a6b1a";
        ctx.beginPath();
        ctx.arc(x + obstacle.width, y + 10, 5, 0, Math.PI * 2);
        ctx.fill();
        // Eyes
        ctx.fillStyle = "#FFD700";
        ctx.beginPath();
        ctx.arc(x + obstacle.width + 2, y + 8, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(x + obstacle.width + 2, y + 8, 1, 0, Math.PI * 2);
        ctx.fill();
        // Tongue
        ctx.strokeStyle = "#FF0000";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + obstacle.width + 5, y + 10);
        ctx.lineTo(x + obstacle.width + 10, y + 8);
        ctx.moveTo(x + obstacle.width + 5, y + 10);
        ctx.lineTo(x + obstacle.width + 10, y + 12);
        ctx.stroke();
        break;
        
      case 'spider':
        // Body
        ctx.fillStyle = "#1a1a1a";
        ctx.beginPath();
        ctx.arc(x + 17, y + 18, 10, 0, Math.PI * 2);
        ctx.fill();
        // Head
        ctx.beginPath();
        ctx.arc(x + 17, y + 8, 6, 0, Math.PI * 2);
        ctx.fill();
        // Red marking
        ctx.fillStyle = "#FF0000";
        ctx.beginPath();
        ctx.arc(x + 17, y + 18, 4, 0, Math.PI * 2);
        ctx.fill();
        // Legs
        ctx.strokeStyle = "#1a1a1a";
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
          const legAngle = -0.5 + i * 0.4;
          ctx.beginPath();
          ctx.moveTo(x + 17, y + 15);
          ctx.lineTo(x + 17 - 15 * Math.cos(legAngle), y + 15 + 12 * Math.sin(legAngle + this.jungleOffset * 3));
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(x + 17, y + 15);
          ctx.lineTo(x + 17 + 15 * Math.cos(legAngle), y + 15 + 12 * Math.sin(legAngle + this.jungleOffset * 3 + 0.5));
          ctx.stroke();
        }
        // Eyes
        ctx.fillStyle = "#FF0000";
        ctx.beginPath();
        ctx.arc(x + 14, y + 6, 2, 0, Math.PI * 2);
        ctx.arc(x + 20, y + 6, 2, 0, Math.PI * 2);
        ctx.fill();
        // Web thread
        ctx.strokeStyle = "#ccc";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 17, y);
        ctx.lineTo(x + 17, y - 30);
        ctx.stroke();
        break;
        
      case 'monkey':
        // Brown body
        ctx.fillStyle = "#8B4513";
        ctx.beginPath();
        ctx.ellipse(x + 17, y + 15, 12, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        // Head
        ctx.beginPath();
        ctx.arc(x + 25, y + 8, 8, 0, Math.PI * 2);
        ctx.fill();
        // Face
        ctx.fillStyle = "#DEB887";
        ctx.beginPath();
        ctx.arc(x + 27, y + 10, 5, 0, Math.PI * 2);
        ctx.fill();
        // Eyes
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(x + 25, y + 8, 2, 0, Math.PI * 2);
        ctx.arc(x + 30, y + 8, 2, 0, Math.PI * 2);
        ctx.fill();
        // Tail
        ctx.strokeStyle = "#8B4513";
        ctx.lineWidth = 3;
        const tailCurl = Math.sin(this.jungleOffset * 4) * 5;
        ctx.beginPath();
        ctx.moveTo(x + 5, y + 15);
        ctx.quadraticCurveTo(x - 5, y + 5, x - 3, y - 5 + tailCurl);
        ctx.stroke();
        // Arms
        ctx.fillRect(x + 8, y + 20, 5, 10);
        ctx.fillRect(x + 22, y + 20, 5, 10);
        break;
        
      case 'vine':
        // Thick hanging vine
        ctx.strokeStyle = "#2d5a2d";
        ctx.lineWidth = 8;
        const sway = Math.sin(this.jungleOffset * 2) * 5;
        ctx.beginPath();
        ctx.moveTo(x + 12, y);
        ctx.quadraticCurveTo(x + 12 + sway, y + 60, x + 12 - sway, y + obstacle.height);
        ctx.stroke();
        // Leaves on vine
        ctx.fillStyle = "#228B22";
        for (let i = 0; i < 4; i++) {
          const ly = y + 20 + i * 25;
          const lx = x + 12 + Math.sin(this.jungleOffset * 2 + i) * 3;
          ctx.beginPath();
          ctx.ellipse(lx + 8, ly, 8, 4, 0.3, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
        
      case 'quicksand':
        // Bubbling quicksand
        ctx.fillStyle = "#C2A35A";
        ctx.fillRect(x, y, obstacle.width, obstacle.height);
        // Bubbles
        ctx.fillStyle = "#D4B56A";
        for (let i = 0; i < 4; i++) {
          const bx = x + 10 + i * 14;
          const bubbleY = y + 5 + Math.sin(Date.now() / 200 + i) * 3;
          ctx.beginPath();
          ctx.arc(bx, bubbleY, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        // Warning texture
        ctx.fillStyle = "#B8903A";
        ctx.fillRect(x + 5, y + 12, obstacle.width - 10, 3);
        break;
        
      case 'parrot':
        // Colorful parrot
        // Body
        ctx.fillStyle = "#FF4500";
        ctx.beginPath();
        ctx.ellipse(x + 20, y + 15, 12, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        // Wing
        ctx.fillStyle = "#FFD700";
        const wingFlap = Math.sin(Date.now() / 100) * 5;
        ctx.beginPath();
        ctx.moveTo(x + 10, y + 10);
        ctx.lineTo(x + 5, y + 5 + wingFlap);
        ctx.lineTo(x + 15, y + 15);
        ctx.fill();
        ctx.fillStyle = "#00BFFF";
        ctx.beginPath();
        ctx.moveTo(x + 30, y + 10);
        ctx.lineTo(x + 35, y + 5 + wingFlap);
        ctx.lineTo(x + 25, y + 15);
        ctx.fill();
        // Head
        ctx.fillStyle = "#32CD32";
        ctx.beginPath();
        ctx.arc(x + 28, y + 8, 6, 0, Math.PI * 2);
        ctx.fill();
        // Beak
        ctx.fillStyle = "#FFD700";
        ctx.beginPath();
        ctx.moveTo(x + 33, y + 8);
        ctx.lineTo(x + 38, y + 10);
        ctx.lineTo(x + 33, y + 12);
        ctx.fill();
        // Eye
        ctx.fillStyle = "#FFF";
        ctx.beginPath();
        ctx.arc(x + 30, y + 7, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(x + 30, y + 7, 1, 0, Math.PI * 2);
        ctx.fill();
        // Tail feathers
        ctx.fillStyle = "#FF4500";
        ctx.fillRect(x + 5, y + 20, 4, 10);
        ctx.fillStyle = "#FFD700";
        ctx.fillRect(x + 9, y + 20, 4, 12);
        ctx.fillStyle = "#00BFFF";
        ctx.fillRect(x + 13, y + 20, 4, 10);
        break;
        
      case 'jaguar':
        // Spotted jaguar
        ctx.fillStyle = "#DAA520";
        ctx.beginPath();
        ctx.ellipse(x + 22, y + 18, 20, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        // Head
        ctx.fillStyle = "#DAA520";
        ctx.beginPath();
        ctx.arc(x + 38, y + 12, 8, 0, Math.PI * 2);
        ctx.fill();
        // Spots
        ctx.fillStyle = "#8B4513";
        const spots = [[10, 12], [18, 20], [26, 14], [30, 22], [15, 24]];
        spots.forEach(([sx, sy]) => {
          ctx.beginPath();
          ctx.arc(x + sx, y + sy, 3, 0, Math.PI * 2);
          ctx.fill();
        });
        // Eyes
        ctx.fillStyle = "#FFD700";
        ctx.beginPath();
        ctx.arc(x + 36, y + 10, 3, 0, Math.PI * 2);
        ctx.arc(x + 42, y + 10, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(x + 37, y + 10, 1, 0, Math.PI * 2);
        ctx.arc(x + 43, y + 10, 1, 0, Math.PI * 2);
        ctx.fill();
        // Nose
        ctx.fillStyle = "#8B4513";
        ctx.beginPath();
        ctx.arc(x + 44, y + 14, 2, 0, Math.PI * 2);
        ctx.fill();
        // Ears
        ctx.fillStyle = "#DAA520";
        ctx.fillRect(x + 34, y + 3, 4, 5);
        ctx.fillRect(x + 42, y + 3, 4, 5);
        // Legs
        ctx.fillRect(x + 10, y + 27, 6, 8);
        ctx.fillRect(x + 30, y + 27, 6, 8);
        // Tail
        ctx.strokeStyle = "#DAA520";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x + 2, y + 18);
        ctx.quadraticCurveTo(x - 8, y + 10, x - 5, y + 5);
        ctx.stroke();
        break;
    }
  }

  private renderPowerup(ctx: CanvasRenderingContext2D, powerup: Powerup) {
    const x = powerup.position.x;
    const y = powerup.position.y;
    const bounce = Math.sin(Date.now() / 200) * 3;
    const glow = 0.3 + Math.sin(Date.now() / 150) * 0.2;
    
    // Glow
    ctx.fillStyle = powerup.type === 'banana' ? `rgba(255, 215, 0, ${glow})` :
                    powerup.type === 'coconut' ? `rgba(139, 90, 43, ${glow})` :
                    `rgba(255, 105, 180, ${glow})`;
    ctx.beginPath();
    ctx.arc(x + 15, y + 15 + bounce, 20, 0, Math.PI * 2);
    ctx.fill();
    
    if (powerup.type === 'banana') {
      ctx.fillStyle = "#FFD700";
      ctx.beginPath();
      ctx.moveTo(x + 5, y + 20 + bounce);
      ctx.quadraticCurveTo(x, y + bounce, x + 15, y + 5 + bounce);
      ctx.quadraticCurveTo(x + 30, y + 10 + bounce, x + 28, y + 20 + bounce);
      ctx.quadraticCurveTo(x + 20, y + 22 + bounce, x + 15, y + 18 + bounce);
      ctx.fill();
    } else if (powerup.type === 'coconut') {
      ctx.fillStyle = "#8B5A2B";
      ctx.beginPath();
      ctx.arc(x + 15, y + 15 + bounce, 10, 0, Math.PI * 2);
      ctx.fill();
      // Eyes/dots
      ctx.fillStyle = "#5a3a1a";
      ctx.beginPath();
      ctx.arc(x + 12, y + 12 + bounce, 2, 0, Math.PI * 2);
      ctx.arc(x + 18, y + 12 + bounce, 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Tropical flower
      ctx.fillStyle = "#FF69B4";
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        ctx.beginPath();
        ctx.ellipse(
          x + 15 + Math.cos(angle) * 6,
          y + 15 + bounce + Math.sin(angle) * 6,
          5, 3, angle, 0, Math.PI * 2
        );
        ctx.fill();
      }
      ctx.fillStyle = "#FFD700";
      ctx.beginPath();
      ctx.arc(x + 15, y + 15 + bounce, 4, 0, Math.PI * 2);
      ctx.fill();
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
