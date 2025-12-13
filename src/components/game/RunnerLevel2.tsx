interface Obstacle {
  position: { x: number; y: number };
  type: 'pipe' | 'coin' | 'questionBlock' | 'goomba' | 'gap' | 'bulletBill' | 'boo';
  width: number;
  height: number;
  requiresJump: boolean;
  requiresCrouch: boolean;
}

interface Coin {
  position: { x: number; y: number };
  collected: boolean;
}

export class RunnerLevel2 {
  private obstacles: Obstacle[] = [];
  private coins: Coin[] = [];
  private scrollSpeed = 270; // Base speed (increased)
  private distanceTraveled = 0;
  private targetDistance = 800; // 800 meters to complete
  private spawnTimer = 0;
  private spawnInterval = 2.0;
  private difficulty = 1;
  private cloudPositions: Array<{ x: number; y: number }> = [];
  private coinsCollected = 0;
  
  // Sound event flag
  public pendingCollectSound = false;

  constructor() {
    this.reset();
  }

  reset() {
    this.obstacles = [];
    this.coins = [];
    this.scrollSpeed = 270;
    this.distanceTraveled = 0;
    this.spawnTimer = 0;
    this.difficulty = 1;
    this.coinsCollected = 0;
    
    // Initialize clouds
    this.cloudPositions = [];
    for (let i = 0; i < 5; i++) {
      this.cloudPositions.push({
        x: Math.random() * 1200,
        y: 50 + Math.random() * 100
      });
    }
  }

  update(deltaTime: number) {
    // Update distance
    this.distanceTraveled += (this.scrollSpeed * deltaTime) / 10;
    
    // Increase speed by 1.5 every 50 meters (gradual increase)
    const speedIncrements = Math.floor(this.distanceTraveled / 50);
    this.scrollSpeed = 280 + (speedIncrements * 1.5);
    this.spawnInterval = Math.max(1.2, 2 - (speedIncrements * 0.04));
    
    // Update obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      this.obstacles[i].position.x -= this.scrollSpeed * deltaTime;
      
      // Remove off-screen obstacles
      if (this.obstacles[i].position.x < -100) {
        this.obstacles.splice(i, 1);
      }
    }
    
    // Update coins
    for (let i = this.coins.length - 1; i >= 0; i--) {
      this.coins[i].position.x -= this.scrollSpeed * deltaTime;
      
      // Remove off-screen coins
      if (this.coins[i].position.x < -50) {
        this.coins.splice(i, 1);
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
    
    // Spawn new obstacles
    this.spawnTimer += deltaTime;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnMarioObstacle();
    }
  }

  private spawnMarioObstacle() {
    const rand = Math.random();
    const x = 1000;
    
    if (rand < 0.3) {
      // Spawn pipe (smaller height)
      const height = 50 + Math.floor(Math.random() * 2) * 20;
      this.obstacles.push({
        position: { x, y: 370 - height },
        type: 'pipe',
        width: 40,
        height,
        requiresJump: true,
        requiresCrouch: false
      });
      
      // Add coins above pipe
      for (let i = 0; i < 3; i++) {
        this.coins.push({
          position: { x: x + 10 + i * 20, y: 370 - height - 40 },
          collected: false
        });
      }
    } else if (rand < 0.5) {
      // Spawn question blocks with coins
      const blockCount = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < blockCount; i++) {
        this.obstacles.push({
          position: { x: x + i * 40, y: 250 },
          type: 'questionBlock',
          width: 30,
          height: 30,
          requiresJump: false,
          requiresCrouch: false
        });
        
        // Add coin above each block
        this.coins.push({
          position: { x: x + i * 40 + 5, y: 220 },
          collected: false
        });
      }
    } else if (rand < 0.6) {
      // Spawn goomba enemy
      this.obstacles.push({
        position: { x, y: 340 },
        type: 'goomba',
        width: 30,
        height: 30,
        requiresJump: true,
        requiresCrouch: false
      });
    } else if (rand < 0.72) {
      // Spawn Bullet Bill (requires crouch)
      this.obstacles.push({
        position: { x, y: 300 },
        type: 'bulletBill',
        width: 50,
        height: 30,
        requiresJump: false,
        requiresCrouch: true
      });
    } else if (rand < 0.84) {
      // Spawn Boo ghost (requires crouch)
      this.obstacles.push({
        position: { x, y: 280 },
        type: 'boo',
        width: 40,
        height: 40,
        requiresJump: false,
        requiresCrouch: true
      });
    } else if (rand < 0.92) {
      // Spawn gap (needs jump) - smaller gap
      this.obstacles.push({
        position: { x, y: 370 },
        type: 'gap',
        width: 60 + Math.random() * 30,
        height: 200,
        requiresJump: true,
        requiresCrouch: false
      });
    } else {
      // Spawn combo: pipe + coins + goomba
      const pipeHeight = 50;
      this.obstacles.push({
        position: { x, y: 370 - pipeHeight },
        type: 'pipe',
        width: 50,
        height: pipeHeight,
        requiresJump: true,
        requiresCrouch: false
      });
      
      this.obstacles.push({
        position: { x: x + 100, y: 340 },
        type: 'goomba',
        width: 30,
        height: 30,
        requiresJump: true,
        requiresCrouch: false
      });
      
      // Coins in arc
      for (let i = 0; i < 5; i++) {
        const angle = (i / 4) * Math.PI;
        this.coins.push({
          position: { 
            x: x + 75 + Math.cos(angle) * 40, 
            y: 300 - Math.sin(angle) * 60 
          },
          collected: false
        });
      }
    }
  }

  getCollisions(playerBounds: any) {
    const collisions = {
      obstacles: [] as Obstacle[],
      coins: [] as Coin[]
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
    
    // Check coin collisions
    for (const coin of this.coins) {
      if (!coin.collected && this.isColliding(playerBounds, {
        x: coin.position.x,
        y: coin.position.y,
        width: 20,
        height: 20
      })) {
        coin.collected = true;
        this.coinsCollected++;
        this.pendingCollectSound = true;
        collisions.coins.push(coin);
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
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(0, 370, 1000, 30);
    
    // Ground pattern (brick-like)
    ctx.strokeStyle = "#654321";
    ctx.lineWidth = 2;
    for (let x = 0; x < 1000; x += 40) {
      ctx.strokeRect(x, 370, 40, 30);
    }
    
    // Render coins
    this.coins.forEach(coin => {
      if (!coin.collected) {
        ctx.fillStyle = "#FFD700";
        ctx.beginPath();
        ctx.arc(coin.position.x + 10, coin.position.y + 10, 10, 0, Math.PI * 2);
        ctx.fill();
        
        // Shine effect
        ctx.fillStyle = "#FFF";
        ctx.beginPath();
        ctx.arc(coin.position.x + 7, coin.position.y + 7, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    
    // Render obstacles
    this.obstacles.forEach(obstacle => {
      switch (obstacle.type) {
        case 'pipe':
          // Green pipe
          ctx.fillStyle = "#2ECC40";
          ctx.fillRect(
            obstacle.position.x,
            obstacle.position.y,
            obstacle.width,
            obstacle.height
          );
          
          // Pipe rim
          ctx.fillStyle = "#01FF70";
          ctx.fillRect(
            obstacle.position.x - 5,
            obstacle.position.y,
            obstacle.width + 10,
            15
          );
          
          // Pipe details
          ctx.strokeStyle = "#1a8c28";
          ctx.lineWidth = 2;
          ctx.strokeRect(
            obstacle.position.x,
            obstacle.position.y,
            obstacle.width,
            obstacle.height
          );
          break;
          
        case 'questionBlock':
          // Yellow question block
          ctx.fillStyle = "#F39C12";
          ctx.fillRect(
            obstacle.position.x,
            obstacle.position.y,
            obstacle.width,
            obstacle.height
          );
          
          // Question mark
          ctx.fillStyle = "#FFF";
          ctx.font = "bold 20px Arial";
          ctx.textAlign = "center";
          ctx.fillText(
            "?",
            obstacle.position.x + obstacle.width / 2,
            obstacle.position.y + obstacle.height / 2 + 7
          );
          
          // Border
          ctx.strokeStyle = "#D68910";
          ctx.lineWidth = 2;
          ctx.strokeRect(
            obstacle.position.x,
            obstacle.position.y,
            obstacle.width,
            obstacle.height
          );
          break;
          
        case 'goomba':
          // Brown goomba enemy
          ctx.fillStyle = "#8B4513";
          ctx.beginPath();
          ctx.arc(
            obstacle.position.x + obstacle.width / 2,
            obstacle.position.y + obstacle.height / 2,
            obstacle.width / 2,
            0,
            Math.PI * 2
          );
          ctx.fill();
          
          // Eyes
          ctx.fillStyle = "#FFF";
          ctx.beginPath();
          ctx.arc(obstacle.position.x + 10, obstacle.position.y + 12, 4, 0, Math.PI * 2);
          ctx.arc(obstacle.position.x + 20, obstacle.position.y + 12, 4, 0, Math.PI * 2);
          ctx.fill();
          
          // Pupils
          ctx.fillStyle = "#000";
          ctx.beginPath();
          ctx.arc(obstacle.position.x + 10, obstacle.position.y + 12, 2, 0, Math.PI * 2);
          ctx.arc(obstacle.position.x + 20, obstacle.position.y + 12, 2, 0, Math.PI * 2);
          ctx.fill();
          
          // Angry brow
          ctx.strokeStyle = "#000";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(obstacle.position.x + 5, obstacle.position.y + 8);
          ctx.lineTo(obstacle.position.x + 12, obstacle.position.y + 10);
          ctx.moveTo(obstacle.position.x + 25, obstacle.position.y + 8);
          ctx.lineTo(obstacle.position.x + 18, obstacle.position.y + 10);
          ctx.stroke();
          break;
          
        case 'gap':
          // Dark void
          ctx.fillStyle = "#000";
          ctx.fillRect(
            obstacle.position.x,
            obstacle.position.y,
            obstacle.width,
            obstacle.height
          );
          break;
          
        case 'bulletBill':
          // Black bullet
          ctx.fillStyle = "#1a1a1a";
          ctx.beginPath();
          ctx.ellipse(
            obstacle.position.x + obstacle.width / 2,
            obstacle.position.y + obstacle.height / 2,
            obstacle.width / 2,
            obstacle.height / 2,
            0, 0, Math.PI * 2
          );
          ctx.fill();
          
          // White eyes
          ctx.fillStyle = "#FFF";
          ctx.beginPath();
          ctx.arc(obstacle.position.x + 35, obstacle.position.y + 10, 5, 0, Math.PI * 2);
          ctx.arc(obstacle.position.x + 35, obstacle.position.y + 20, 5, 0, Math.PI * 2);
          ctx.fill();
          
          // Red arm bands
          ctx.fillStyle = "#E74C3C";
          ctx.fillRect(obstacle.position.x + 5, obstacle.position.y + 5, 8, obstacle.height - 10);
          break;
          
        case 'boo':
          // White ghost body
          ctx.fillStyle = "#FFF";
          ctx.beginPath();
          ctx.arc(
            obstacle.position.x + obstacle.width / 2,
            obstacle.position.y + obstacle.height / 2,
            obstacle.width / 2,
            0, Math.PI * 2
          );
          ctx.fill();
          
          // Ghost tail
          ctx.beginPath();
          ctx.moveTo(obstacle.position.x, obstacle.position.y + obstacle.height / 2);
          ctx.quadraticCurveTo(
            obstacle.position.x - 15, obstacle.position.y + obstacle.height,
            obstacle.position.x + 10, obstacle.position.y + obstacle.height - 5
          );
          ctx.fill();
          
          // Eyes
          ctx.fillStyle = "#000";
          ctx.beginPath();
          ctx.arc(obstacle.position.x + 12, obstacle.position.y + 15, 5, 0, Math.PI * 2);
          ctx.arc(obstacle.position.x + 28, obstacle.position.y + 15, 5, 0, Math.PI * 2);
          ctx.fill();
          
          // Tongue
          ctx.fillStyle = "#E74C3C";
          ctx.beginPath();
          ctx.ellipse(obstacle.position.x + 20, obstacle.position.y + 30, 6, 4, 0, 0, Math.PI * 2);
          ctx.fill();
          break;
      }
    });
  }

  private renderBackground(ctx: CanvasRenderingContext2D) {
    // Sky gradient (Mario-style blue)
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, "#5C94FC");
    gradient.addColorStop(1, "#3A7BD5");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1000, 400);
    
    // Clouds
    this.cloudPositions.forEach(cloud => {
      ctx.fillStyle = "#FFF";
      
      // Cloud body
      ctx.beginPath();
      ctx.arc(cloud.x, cloud.y, 20, 0, Math.PI * 2);
      ctx.arc(cloud.x + 25, cloud.y, 25, 0, Math.PI * 2);
      ctx.arc(cloud.x + 50, cloud.y, 20, 0, Math.PI * 2);
      ctx.fill();
    });
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
    return Math.min((this.distanceTraveled / this.targetDistance) * 100, 100);
  }

  isComplete() {
    return this.distanceTraveled >= this.targetDistance;
  }

  getCoinsCollected() {
    return this.coinsCollected;
  }
}
