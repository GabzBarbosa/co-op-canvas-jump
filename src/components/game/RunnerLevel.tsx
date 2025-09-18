import { RunnerObstacle, ObstacleType } from "./RunnerObstacle";

export class RunnerLevel {
  private obstacles: RunnerObstacle[] = [];
  private scrollSpeed: number = 150; // pixels per second
  private distanceTraveled: number = 0;
  private targetDistance: number = 500; // meters to win
  private lastObstacleSpawn: number = 0;
  private obstacleSpawnInterval: number = 2; // seconds
  private difficulty: number = 1;
  
  // Ground level
  private groundY: number = 370;

  constructor() {
    this.spawnInitialObstacles();
  }

  private spawnInitialObstacles() {
    // Spawn some obstacles ahead
    const obstacleTypes: ObstacleType[] = ["log", "hole", "spike", "enemy"];
    
    for (let i = 0; i < 3; i++) {
      const x = 800 + (i * 200);
      const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
      const y = type === "hole" ? this.groundY : this.groundY - 40;
      
      this.obstacles.push(new RunnerObstacle(x, y, type));
    }
  }

  update(deltaTime: number) {
    // Update distance traveled
    this.distanceTraveled += (this.scrollSpeed * deltaTime) / 100; // Convert to meters
    
    // Increase difficulty over time
    this.difficulty = 1 + (this.distanceTraveled / 100);
    this.scrollSpeed = 150 + (this.difficulty * 20);
    this.obstacleSpawnInterval = Math.max(1, 2 - (this.difficulty * 0.1));
    
    // Update obstacles
    this.obstacles = this.obstacles.filter(obstacle => {
      obstacle.update(deltaTime, this.scrollSpeed);
      return !obstacle.shouldDestroy();
    });
    
    // Spawn new obstacles
    this.lastObstacleSpawn += deltaTime;
    if (this.lastObstacleSpawn >= this.obstacleSpawnInterval) {
      this.spawnObstacle();
      this.lastObstacleSpawn = 0;
    }
  }

  private spawnObstacle() {
    const obstacleTypes: ObstacleType[] = ["log", "hole", "spike", "enemy"];
    
    // More complex patterns as difficulty increases
    if (this.difficulty > 2) {
      // Sometimes spawn combinations
      if (Math.random() < 0.3) {
        this.spawnObstacleCombo();
        return;
      }
    }
    
    const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
    const x = 800 + Math.random() * 100; // Slight variation
    const y = type === "hole" ? this.groundY : this.groundY - 40;
    
    this.obstacles.push(new RunnerObstacle(x, y, type));
  }

  private spawnObstacleCombo() {
    // Spawn jump + crouch combo
    const x = 800;
    
    // First obstacle (jump)
    this.obstacles.push(new RunnerObstacle(x, this.groundY - 40, "log"));
    
    // Second obstacle (crouch) - spaced appropriately
    this.obstacles.push(new RunnerObstacle(x + 80, this.groundY - 80, "spike"));
  }

  getCollisions(playerBounds: any) {
    const collisions = {
      obstacles: [] as RunnerObstacle[]
    };

    // Check obstacle collisions
    this.obstacles.forEach(obstacle => {
      const obstacleBounds = obstacle.getBounds();
      if (this.isColliding(playerBounds, obstacleBounds)) {
        collisions.obstacles.push(obstacle);
      }
    });

    return collisions;
  }

  private isColliding(a: any, b: any): boolean {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
  }

  render(ctx: CanvasRenderingContext2D) {
    // Clear background with moving pattern
    const gradient = ctx.createLinearGradient(0, 0, 0, 450);
    gradient.addColorStop(0, "#87CEEB"); // Sky blue
    gradient.addColorStop(0.7, "#FF6B6B"); // Light red
    gradient.addColorStop(1, "#DC143C"); // Crimson red
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 450);
    
    // Draw ground
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(0, this.groundY, 800, 80);
    
    // Ground texture
    ctx.fillStyle = "#654321";
    for (let x = 0; x < 800; x += 20) {
      ctx.fillRect(x, this.groundY + 5, 10, 5);
    }
    
    // Render moving background elements (clouds, trees)
    this.renderBackground(ctx);
    
    // Render obstacles
    this.obstacles.forEach(obstacle => obstacle.render(ctx));
  }

  private renderBackground(ctx: CanvasRenderingContext2D) {
    // Simple clouds that move
    const cloudOffset = (this.distanceTraveled * 20) % 1000;
    
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    for (let i = 0; i < 5; i++) {
      const x = (i * 200 - cloudOffset) % 1000;
      const y = 50 + (i * 20);
      
      // Simple cloud shape
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.arc(x + 25, y, 25, 0, Math.PI * 2);
      ctx.arc(x + 50, y, 20, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  getDistanceTraveled(): number {
    return Math.floor(this.distanceTraveled);
  }

  getTargetDistance(): number {
    return this.targetDistance;
  }

  getProgressPercentage(): number {
    return Math.min(100, (this.distanceTraveled / this.targetDistance) * 100);
  }

  isComplete(): boolean {
    return this.distanceTraveled >= this.targetDistance;
  }

  reset() {
    this.obstacles = [];
    this.distanceTraveled = 0;
    this.lastObstacleSpawn = 0;
    this.difficulty = 1;
    this.scrollSpeed = 150;
    this.spawnInitialObstacles();
  }

  getStartPosition() {
    return { x: 100, y: this.groundY - 64 };
  }
}