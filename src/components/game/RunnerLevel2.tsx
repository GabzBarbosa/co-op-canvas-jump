interface Obstacle {
  position: { x: number; y: number };
  type: 'shark' | 'jellyfish' | 'coral' | 'octopus' | 'urchin' | 'anglerfish' | 'current';
  width: number;
  height: number;
  requiresJump: boolean;
  requiresCrouch: boolean;
  glitchOffset?: number;
}

interface Collectible {
  position: { x: number; y: number };
  collected: boolean;
  type: 'shell' | 'pearl';
}

export class RunnerLevel2 {
  private obstacles: Obstacle[] = [];
  private collectibles: Collectible[] = [];
  private scrollSpeed = 270;
  private distanceTraveled = 0;
  private targetDistance = 1300;
  private spawnTimer = 0;
  private spawnInterval = 2.0;
  private difficulty = 1;
  private bubblePositions: Array<{ x: number; y: number; size: number; speed: number }> = [];
  private collectiblesCount = 0;
  private waveOffset = 0;
  
  public pendingCollectSound = false;

  constructor() {
    this.reset();
  }

  reset() {
    this.obstacles = [];
    this.collectibles = [];
    this.scrollSpeed = 270;
    this.distanceTraveled = 0;
    this.spawnTimer = 0;
    this.difficulty = 1;
    this.collectiblesCount = 0;
    this.waveOffset = 0;
    
    this.bubblePositions = [];
    for (let i = 0; i < 12; i++) {
      this.bubblePositions.push({
        x: Math.random() * 1200,
        y: Math.random() * 350,
        size: 3 + Math.random() * 8,
        speed: 20 + Math.random() * 40
      });
    }
  }

  update(deltaTime: number) {
    this.distanceTraveled += (this.scrollSpeed * deltaTime) / 10;
    this.waveOffset += deltaTime * 2;
    
    const speedIncrements = Math.floor(this.distanceTraveled / 50);
    this.scrollSpeed = 280 + (speedIncrements * 1.5);
    this.spawnInterval = Math.max(1.2, 2 - (speedIncrements * 0.04));
    
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      this.obstacles[i].position.x -= this.scrollSpeed * deltaTime;
      
      if (this.obstacles[i].type === 'jellyfish') {
        this.obstacles[i].position.y += Math.sin(Date.now() / 300 + i) * 1.5;
      }
      
      if (this.obstacles[i].position.x < -100) {
        this.obstacles.splice(i, 1);
      }
    }
    
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      this.collectibles[i].position.x -= this.scrollSpeed * deltaTime;
      if (this.collectibles[i].position.x < -50) {
        this.collectibles.splice(i, 1);
      }
    }
    
    // Update bubbles
    this.bubblePositions.forEach(bubble => {
      bubble.y -= bubble.speed * deltaTime;
      bubble.x -= this.scrollSpeed * deltaTime * 0.2;
      if (bubble.y < -20) {
        bubble.y = 400;
        bubble.x = Math.random() * 1200;
      }
      if (bubble.x < -20) {
        bubble.x = 1200;
      }
    });
    
    this.spawnTimer += deltaTime;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnOceanObstacle();
    }
  }

  private spawnOceanObstacle() {
    const rand = Math.random();
    const x = 1000;
    
    if (rand < 0.22) {
      // Shark
      this.obstacles.push({
        position: { x, y: 340 },
        type: 'shark',
        width: 50,
        height: 30,
        requiresJump: true,
        requiresCrouch: false
      });
      
      // Shells above
      for (let i = 0; i < 2; i++) {
        this.collectibles.push({
          position: { x: x + i * 25, y: 290 },
          collected: false,
          type: Math.random() > 0.7 ? 'pearl' : 'shell'
        });
      }
    } else if (rand < 0.40) {
      // Coral reef (multiple)
      const count = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        this.obstacles.push({
          position: { x: x + i * 40, y: 345 },
          type: 'coral',
          width: 30,
          height: 25,
          requiresJump: true,
          requiresCrouch: false
        });
      }
      this.collectibles.push({
        position: { x: x + 15, y: 305 },
        collected: false,
        type: 'pearl'
      });
    } else if (rand < 0.55) {
      // Jellyfish (floating, crouch)
      this.obstacles.push({
        position: { x, y: 310 },
        type: 'jellyfish',
        width: 30,
        height: 35,
        requiresJump: false,
        requiresCrouch: true
      });
    } else if (rand < 0.68) {
      // Octopus tentacles (crouch)
      this.obstacles.push({
        position: { x, y: 300 },
        type: 'octopus',
        width: 50,
        height: 45,
        requiresJump: false,
        requiresCrouch: true
      });
    } else if (rand < 0.78) {
      // Sea urchin (jump)
      this.obstacles.push({
        position: { x, y: 350 },
        type: 'urchin',
        width: 25,
        height: 25,
        requiresJump: true,
        requiresCrouch: false
      });
    } else if (rand < 0.88) {
      // Anglerfish (ground)
      this.obstacles.push({
        position: { x, y: 335 },
        type: 'anglerfish',
        width: 45,
        height: 35,
        requiresJump: true,
        requiresCrouch: false
      });
    } else {
      // Current (wide obstacle, crouch)
      this.obstacles.push({
        position: { x, y: 305 },
        type: 'current',
        width: 80,
        height: 40,
        requiresJump: false,
        requiresCrouch: true
      });
      
      // Shells in arc
      for (let i = 0; i < 3; i++) {
        this.collectibles.push({
          position: { x: x + 20 + i * 20, y: 260 },
          collected: false,
          type: i === 1 ? 'pearl' : 'shell'
        });
      }
    }
  }

  getCollisions(playerBounds: any) {
    const collisions = {
      obstacles: [] as Obstacle[],
      coins: [] as Collectible[]
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
        width: 20,
        height: 20
      })) {
        item.collected = true;
        this.collectiblesCount += item.type === 'pearl' ? 10 : 1;
        this.pendingCollectSound = true;
        collisions.coins.push(item);
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
        const bounce = Math.sin(Date.now() / 300) * 3;
        if (item.type === 'pearl') {
          ctx.fillStyle = "#FFF8DC";
          ctx.beginPath();
          ctx.arc(item.position.x + 10, item.position.y + 10 + bounce, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
          ctx.beginPath();
          ctx.arc(item.position.x + 7, item.position.y + 7 + bounce, 3, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = "#DEB887";
          ctx.beginPath();
          ctx.arc(item.position.x + 10, item.position.y + 12 + bounce, 8, Math.PI, 0);
          ctx.fill();
          ctx.strokeStyle = "#8B7355";
          ctx.lineWidth = 1;
          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            ctx.moveTo(item.position.x + 10, item.position.y + 12 + bounce);
            const angle = Math.PI + (i / 4) * Math.PI;
            ctx.lineTo(item.position.x + 10 + Math.cos(angle) * 8, item.position.y + 12 + bounce + Math.sin(angle) * 8);
          }
          ctx.stroke();
        }
      }
    });
    
    // Render obstacles
    this.obstacles.forEach(obstacle => {
      this.renderObstacle(ctx, obstacle);
    });
  }

  private renderBackground(ctx: CanvasRenderingContext2D) {
    // Deep ocean gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, "#001a33");
    gradient.addColorStop(0.3, "#003366");
    gradient.addColorStop(0.7, "#004080");
    gradient.addColorStop(1, "#002244");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1000, 400);
    
    // Light rays from surface
    ctx.save();
    ctx.globalAlpha = 0.05;
    for (let i = 0; i < 5; i++) {
      const rayX = 100 + i * 200 + Math.sin(this.waveOffset + i) * 30;
      ctx.fillStyle = "#87CEEB";
      ctx.beginPath();
      ctx.moveTo(rayX - 20, 0);
      ctx.lineTo(rayX + 20, 0);
      ctx.lineTo(rayX + 60, 400);
      ctx.lineTo(rayX - 60, 400);
      ctx.fill();
    }
    ctx.restore();
    
    // Bubbles
    ctx.fillStyle = "rgba(150, 220, 255, 0.3)";
    this.bubblePositions.forEach(bubble => {
      ctx.beginPath();
      ctx.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2);
      ctx.fill();
      // Bubble highlight
      ctx.fillStyle = "rgba(200, 240, 255, 0.4)";
      ctx.beginPath();
      ctx.arc(bubble.x - 1, bubble.y - 1, bubble.size * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(150, 220, 255, 0.3)";
    });
    
    // Seaweed in background
    ctx.fillStyle = "#006633";
    for (let i = 0; i < 6; i++) {
      const swayX = i * 180 + 50;
      const sway = Math.sin(this.waveOffset + i * 0.5) * 8;
      ctx.beginPath();
      ctx.moveTo(swayX, 400);
      ctx.quadraticCurveTo(swayX + sway, 350, swayX + sway * 0.5, 310);
      ctx.quadraticCurveTo(swayX - sway * 0.3, 340, swayX, 400);
      ctx.fill();
    }
  }

  private renderGround(ctx: CanvasRenderingContext2D) {
    // Sandy ocean floor
    ctx.fillStyle = "#C2B280";
    ctx.fillRect(0, 370, 1000, 30);
    
    // Sand ripples
    ctx.fillStyle = "#B8A870";
    for (let x = 0; x < 1000; x += 25) {
      const rippleY = 375 + Math.sin(x * 0.1 + this.waveOffset) * 2;
      ctx.fillRect(x, rippleY, 15, 3);
    }
    
    // Small rocks
    ctx.fillStyle = "#8B7355";
    for (let x = 30; x < 1000; x += 120) {
      ctx.beginPath();
      ctx.ellipse(x, 380, 8, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private renderObstacle(ctx: CanvasRenderingContext2D, obstacle: Obstacle) {
    const x = obstacle.position.x;
    const y = obstacle.position.y;
    
    switch (obstacle.type) {
      case 'shark':
        // Shark body
        ctx.fillStyle = "#708090";
        ctx.beginPath();
        ctx.ellipse(x + 25, y + 15, 25, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        // Dorsal fin
        ctx.beginPath();
        ctx.moveTo(x + 20, y + 5);
        ctx.lineTo(x + 25, y - 10);
        ctx.lineTo(x + 35, y + 5);
        ctx.fill();
        // Tail
        ctx.beginPath();
        ctx.moveTo(x, y + 10);
        ctx.lineTo(x - 10, y);
        ctx.lineTo(x - 5, y + 15);
        ctx.lineTo(x - 10, y + 25);
        ctx.lineTo(x, y + 20);
        ctx.fill();
        // White belly
        ctx.fillStyle = "#D3D3D3";
        ctx.beginPath();
        ctx.ellipse(x + 25, y + 20, 20, 6, 0, 0, Math.PI);
        ctx.fill();
        // Eye
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(x + 38, y + 12, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#FFF";
        ctx.beginPath();
        ctx.arc(x + 37, y + 11, 1, 0, Math.PI * 2);
        ctx.fill();
        // Teeth
        ctx.fillStyle = "#FFF";
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
          ctx.moveTo(x + 40 + i * 3, y + 18);
          ctx.lineTo(x + 41.5 + i * 3, y + 22);
          ctx.lineTo(x + 43 + i * 3, y + 18);
        }
        ctx.fill();
        break;
        
      case 'jellyfish':
        // Bell
        const pulse = 1 + Math.sin(Date.now() / 200) * 0.1;
        ctx.fillStyle = "rgba(200, 100, 255, 0.6)";
        ctx.beginPath();
        ctx.ellipse(x + 15, y + 10, 14 * pulse, 10 * pulse, 0, 0, Math.PI);
        ctx.fill();
        // Inner glow
        ctx.fillStyle = "rgba(255, 150, 255, 0.4)";
        ctx.beginPath();
        ctx.ellipse(x + 15, y + 8, 8, 6, 0, 0, Math.PI);
        ctx.fill();
        // Tentacles
        ctx.strokeStyle = "rgba(200, 100, 255, 0.5)";
        ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) {
          const tentX = x + 5 + i * 5;
          ctx.beginPath();
          ctx.moveTo(tentX, y + 15);
          ctx.quadraticCurveTo(tentX + Math.sin(Date.now() / 200 + i) * 3, y + 25, tentX, y + 35);
          ctx.stroke();
        }
        break;
        
      case 'coral':
        // Coral branches
        const colors = ['#FF6B6B', '#FF8E8E', '#FF4757'];
        colors.forEach((color, i) => {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.moveTo(x + 5 + i * 8, y + obstacle.height);
          ctx.lineTo(x + 5 + i * 8 - 3, y + 5 + i * 3);
          ctx.lineTo(x + 5 + i * 8 + 6, y + 5 + i * 3);
          ctx.fill();
          // Coral bumps
          ctx.beginPath();
          ctx.arc(x + 5 + i * 8, y + 5 + i * 3, 4, 0, Math.PI * 2);
          ctx.fill();
        });
        break;
        
      case 'octopus':
        // Body
        ctx.fillStyle = "#9B59B6";
        ctx.beginPath();
        ctx.ellipse(x + 25, y + 15, 18, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        // Eyes
        ctx.fillStyle = "#FFF";
        ctx.beginPath();
        ctx.arc(x + 18, y + 12, 5, 0, Math.PI * 2);
        ctx.arc(x + 32, y + 12, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(x + 19, y + 13, 2, 0, Math.PI * 2);
        ctx.arc(x + 33, y + 13, 2, 0, Math.PI * 2);
        ctx.fill();
        // Tentacles
        ctx.strokeStyle = "#8E44AD";
        ctx.lineWidth = 3;
        for (let i = 0; i < 6; i++) {
          const tentX = x + 8 + i * 7;
          const wave = Math.sin(Date.now() / 150 + i) * 5;
          ctx.beginPath();
          ctx.moveTo(tentX, y + 25);
          ctx.quadraticCurveTo(tentX + wave, y + 35, tentX - wave, y + 45);
          ctx.stroke();
        }
        break;
        
      case 'urchin':
        // Black round body
        ctx.fillStyle = "#1a1a2e";
        ctx.beginPath();
        ctx.arc(x + 12, y + 12, 10, 0, Math.PI * 2);
        ctx.fill();
        // Spines
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 2;
        for (let i = 0; i < 12; i++) {
          const angle = (i / 12) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(x + 12 + Math.cos(angle) * 8, y + 12 + Math.sin(angle) * 8);
          ctx.lineTo(x + 12 + Math.cos(angle) * 14, y + 12 + Math.sin(angle) * 14);
          ctx.stroke();
        }
        break;
        
      case 'anglerfish':
        // Dark body
        ctx.fillStyle = "#2d1b4e";
        ctx.beginPath();
        ctx.ellipse(x + 22, y + 18, 20, 15, 0, 0, Math.PI * 2);
        ctx.fill();
        // Big mouth
        ctx.fillStyle = "#1a0a2e";
        ctx.beginPath();
        ctx.arc(x + 38, y + 20, 8, -0.5, 0.5);
        ctx.fill();
        // Teeth
        ctx.fillStyle = "#FFF";
        for (let i = 0; i < 3; i++) {
          ctx.fillRect(x + 35, y + 15 + i * 4, 2, 3);
          ctx.fillRect(x + 38, y + 16 + i * 4, 2, 3);
        }
        // Lure (glowing)
        const glow = 0.5 + Math.sin(Date.now() / 100) * 0.5;
        ctx.fillStyle = `rgba(0, 255, 200, ${glow})`;
        ctx.beginPath();
        ctx.arc(x + 15, y, 5, 0, Math.PI * 2);
        ctx.fill();
        // Lure stalk
        ctx.strokeStyle = "#4a2c7a";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 15, y + 5);
        ctx.quadraticCurveTo(x + 10, y + 10, x + 15, y + 15);
        ctx.stroke();
        // Eye
        ctx.fillStyle = "#FFD700";
        ctx.beginPath();
        ctx.arc(x + 30, y + 14, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(x + 31, y + 14, 2, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'current':
        // Water current effect
        ctx.save();
        ctx.globalAlpha = 0.4;
        const streamGrad = ctx.createLinearGradient(x, y, x + obstacle.width, y);
        streamGrad.addColorStop(0, "rgba(0, 150, 255, 0)");
        streamGrad.addColorStop(0.5, "rgba(0, 150, 255, 0.6)");
        streamGrad.addColorStop(1, "rgba(0, 150, 255, 0)");
        ctx.fillStyle = streamGrad;
        ctx.fillRect(x, y, obstacle.width, obstacle.height);
        
        // Stream lines
        ctx.strokeStyle = "rgba(100, 200, 255, 0.5)";
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
          const lineY = y + 8 + i * 10;
          const wave = Math.sin(Date.now() / 100 + i) * 5;
          ctx.beginPath();
          ctx.moveTo(x, lineY);
          ctx.quadraticCurveTo(x + obstacle.width / 2, lineY + wave, x + obstacle.width, lineY);
          ctx.stroke();
        }
        ctx.restore();
        break;
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

  getCoinsCollected() {
    return this.collectiblesCount;
  }

  getDifficulty() {
    return this.difficulty;
  }
}
