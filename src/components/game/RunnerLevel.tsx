import { RunnerObstacle, ObstacleType } from "./RunnerObstacle";

export class RunnerLevel {
  private obstacles: RunnerObstacle[] = [];
  private scrollSpeed: number = 260;
  private distanceTraveled: number = 0;
  private targetDistance: number = 1300;
  private lastObstacleSpawn: number = 0;
  private obstacleSpawnInterval: number = 2;
  private difficulty: number = 1;
  private groundY: number = 370;
  private treePosX: number[] = [];
  private cloudPositions: Array<{ x: number; y: number }> = [];

  constructor() {
    // Initialize savana trees
    for (let i = 0; i < 5; i++) {
      this.treePosX.push(100 + i * 200);
    }
    for (let i = 0; i < 4; i++) {
      this.cloudPositions.push({ x: Math.random() * 1000, y: 30 + Math.random() * 60 });
    }
    this.spawnInitialObstacles();
  }

  private spawnInitialObstacles() {
    const obstacleTypes: ObstacleType[] = ["log", "hole", "spike", "enemy"];
    
    for (let i = 0; i < 3; i++) {
      const x = 800 + (i * 200);
      const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
      const y = type === "hole" ? this.groundY : this.groundY - 40;
      
      this.obstacles.push(new RunnerObstacle(x, y, type));
    }
  }

  update(deltaTime: number) {
    this.distanceTraveled += (this.scrollSpeed * deltaTime) / 10;
    
    const speedIncrements = Math.floor(this.distanceTraveled / 50);
    this.scrollSpeed = 260 + (speedIncrements * 1.5);
    this.obstacleSpawnInterval = Math.max(1.0, 2 - (speedIncrements * 0.04));
    
    this.obstacles = this.obstacles.filter(obstacle => {
      obstacle.update(deltaTime, this.scrollSpeed);
      return !obstacle.shouldDestroy();
    });
    
    // Move trees
    this.treePosX = this.treePosX.map(x => {
      x -= this.scrollSpeed * deltaTime * 0.3;
      if (x < -50) x += 1200;
      return x;
    });
    
    // Move clouds
    this.cloudPositions.forEach(cloud => {
      cloud.x -= this.scrollSpeed * deltaTime * 0.1;
      if (cloud.x < -80) {
        cloud.x = 1000;
        cloud.y = 30 + Math.random() * 60;
      }
    });
    
    this.lastObstacleSpawn += deltaTime;
    if (this.lastObstacleSpawn >= this.obstacleSpawnInterval) {
      this.spawnObstacle();
      this.lastObstacleSpawn = 0;
    }
  }

  private spawnObstacle() {
    const obstacleTypes: ObstacleType[] = ["log", "hole", "spike", "enemy"];
    
    if (this.difficulty > 2) {
      if (Math.random() < 0.3) {
        this.spawnObstacleCombo();
        return;
      }
    }
    
    const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
    const x = 800 + Math.random() * 100;
    const y = type === "hole" ? this.groundY : this.groundY - 40;
    
    this.obstacles.push(new RunnerObstacle(x, y, type));
  }

  private spawnObstacleCombo() {
    const x = 800;
    this.obstacles.push(new RunnerObstacle(x, this.groundY - 40, "log"));
    this.obstacles.push(new RunnerObstacle(x + 80, this.groundY - 80, "spike"));
  }

  getCollisions(playerBounds: any) {
    const collisions = {
      obstacles: [] as RunnerObstacle[]
    };

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
    // Savana sky gradient - warm orange/yellow sunset
    const gradient = ctx.createLinearGradient(0, 0, 0, 450);
    gradient.addColorStop(0, "#FF8C00");
    gradient.addColorStop(0.3, "#FFB347");
    gradient.addColorStop(0.6, "#FFDEAD");
    gradient.addColorStop(1, "#C2B280");
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 450);
    
    // Sun
    ctx.fillStyle = "#FFD700";
    ctx.beginPath();
    ctx.arc(650, 60, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#FFF8DC";
    ctx.beginPath();
    ctx.arc(650, 60, 30, 0, Math.PI * 2);
    ctx.fill();
    
    // Clouds
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    this.cloudPositions.forEach(cloud => {
      ctx.beginPath();
      ctx.arc(cloud.x, cloud.y, 15, 0, Math.PI * 2);
      ctx.arc(cloud.x + 20, cloud.y, 20, 0, Math.PI * 2);
      ctx.arc(cloud.x + 40, cloud.y, 15, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Acacia trees (savana silhouettes)
    this.treePosX.forEach(treeX => {
      // Trunk
      ctx.fillStyle = "#5C4033";
      ctx.fillRect(treeX + 12, this.groundY - 80, 6, 80);
      // Canopy - flat acacia shape
      ctx.fillStyle = "#556B2F";
      ctx.beginPath();
      ctx.ellipse(treeX + 15, this.groundY - 80, 35, 15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#6B8E23";
      ctx.beginPath();
      ctx.ellipse(treeX + 15, this.groundY - 85, 25, 10, 0, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Savana ground
    ctx.fillStyle = "#C2B280";
    ctx.fillRect(0, this.groundY, 800, 80);
    
    // Dry grass patches
    ctx.fillStyle = "#DAA520";
    for (let x = 0; x < 800; x += 15) {
      const grassH = 5 + Math.sin(x * 0.5) * 3;
      ctx.fillRect(x, this.groundY - grassH, 3, grassH);
    }
    
    // Ground texture
    ctx.fillStyle = "#B8A070";
    for (let x = 0; x < 800; x += 20) {
      ctx.fillRect(x, this.groundY + 5, 10, 5);
    }
    
    // Render obstacles
    this.obstacles.forEach(obstacle => obstacle.render(ctx));
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
    this.scrollSpeed = 260;
    this.spawnInitialObstacles();
  }

  getStartPosition() {
    return { x: 100, y: this.groundY - 64 };
  }
}
