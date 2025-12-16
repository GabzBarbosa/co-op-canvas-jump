interface Obstacle {
  position: { x: number; y: number };
  type: 'virus' | 'firewall' | 'bug' | 'glitch' | 'gap' | 'malware' | 'popup';
  width: number;
  height: number;
  requiresJump: boolean;
  requiresCrouch: boolean;
  glitchOffset?: number;
}

interface DataPacket {
  position: { x: number; y: number };
  collected: boolean;
  type: 'byte' | 'kilobyte';
}

export class RunnerLevel2 {
  private obstacles: Obstacle[] = [];
  private dataPackets: DataPacket[] = [];
  private scrollSpeed = 270;
  private distanceTraveled = 0;
  private targetDistance = 1300;
  private spawnTimer = 0;
  private spawnInterval = 2.0;
  private difficulty = 1;
  private glitchLines: Array<{ x: number; y: number; width: number }> = [];
  private dataCollected = 0;
  private glitchTimer = 0;
  
  public pendingCollectSound = false;

  constructor() {
    this.reset();
  }

  reset() {
    this.obstacles = [];
    this.dataPackets = [];
    this.scrollSpeed = 270;
    this.distanceTraveled = 0;
    this.spawnTimer = 0;
    this.difficulty = 1;
    this.dataCollected = 0;
    this.glitchTimer = 0;
    
    // Initialize glitch lines
    this.glitchLines = [];
    for (let i = 0; i < 8; i++) {
      this.glitchLines.push({
        x: Math.random() * 1200,
        y: Math.random() * 400,
        width: 50 + Math.random() * 150
      });
    }
  }

  update(deltaTime: number) {
    this.distanceTraveled += (this.scrollSpeed * deltaTime) / 10;
    this.glitchTimer += deltaTime;
    
    const speedIncrements = Math.floor(this.distanceTraveled / 50);
    this.scrollSpeed = 280 + (speedIncrements * 1.5);
    this.spawnInterval = Math.max(1.2, 2 - (speedIncrements * 0.04));
    
    // Update obstacles with glitch effect
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      this.obstacles[i].position.x -= this.scrollSpeed * deltaTime;
      
      // Random glitch offset for some obstacles
      if (this.obstacles[i].type === 'glitch') {
        this.obstacles[i].glitchOffset = Math.sin(this.glitchTimer * 10) * 3;
      }
      
      if (this.obstacles[i].position.x < -100) {
        this.obstacles.splice(i, 1);
      }
    }
    
    // Update data packets
    for (let i = this.dataPackets.length - 1; i >= 0; i--) {
      this.dataPackets[i].position.x -= this.scrollSpeed * deltaTime;
      
      if (this.dataPackets[i].position.x < -50) {
        this.dataPackets.splice(i, 1);
      }
    }
    
    // Update glitch lines
    this.glitchLines.forEach(line => {
      line.x -= this.scrollSpeed * deltaTime * 0.5;
      if (line.x < -200) {
        line.x = 1200;
        line.y = Math.random() * 350;
        line.width = 50 + Math.random() * 150;
      }
    });
    
    // Spawn new obstacles
    this.spawnTimer += deltaTime;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnGlitchObstacle();
    }
  }

  private spawnGlitchObstacle() {
    const rand = Math.random();
    const x = 1000;
    
    if (rand < 0.25) {
      // Spawn virus (ground obstacle - jump over)
      const size = 35 + Math.random() * 15;
      this.obstacles.push({
        position: { x, y: 370 - size },
        type: 'virus',
        width: size,
        height: size,
        requiresJump: true,
        requiresCrouch: false
      });
      
      // Add data packets above
      for (let i = 0; i < 3; i++) {
        this.dataPackets.push({
          position: { x: x + i * 25, y: 370 - size - 50 },
          collected: false,
          type: Math.random() > 0.7 ? 'kilobyte' : 'byte'
        });
      }
    } else if (rand < 0.45) {
      // Spawn firewall barriers
      const barrierCount = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < barrierCount; i++) {
        this.obstacles.push({
          position: { x: x + i * 45, y: 250 },
          type: 'firewall',
          width: 35,
          height: 35,
          requiresJump: false,
          requiresCrouch: false
        });
        
        this.dataPackets.push({
          position: { x: x + i * 45 + 7, y: 215 },
          collected: false,
          type: 'kilobyte'
        });
      }
    } else if (rand < 0.58) {
      // Spawn bug (computer bug - ground enemy)
      this.obstacles.push({
        position: { x, y: 340 },
        type: 'bug',
        width: 35,
        height: 30,
        requiresJump: true,
        requiresCrouch: false
      });
    } else if (rand < 0.70) {
      // Spawn malware (flying - crouch)
      this.obstacles.push({
        position: { x, y: 315 },
        type: 'malware',
        width: 50,
        height: 35,
        requiresJump: false,
        requiresCrouch: true
      });
    } else if (rand < 0.82) {
      // Spawn popup (annoying popup - crouch)
      this.obstacles.push({
        position: { x, y: 305 },
        type: 'popup',
        width: 60,
        height: 50,
        requiresJump: false,
        requiresCrouch: true
      });
    } else if (rand < 0.90) {
      // Spawn gap (system crash)
      this.obstacles.push({
        position: { x, y: 370 },
        type: 'gap',
        width: 60 + Math.random() * 30,
        height: 200,
        requiresJump: true,
        requiresCrouch: false
      });
    } else {
      // Combo: virus + bug + data
      this.obstacles.push({
        position: { x, y: 320 },
        type: 'virus',
        width: 50,
        height: 50,
        requiresJump: true,
        requiresCrouch: false
      });
      
      this.obstacles.push({
        position: { x: x + 120, y: 340 },
        type: 'bug',
        width: 35,
        height: 30,
        requiresJump: true,
        requiresCrouch: false
      });
      
      // Data packets in arc
      for (let i = 0; i < 5; i++) {
        const angle = (i / 4) * Math.PI;
        this.dataPackets.push({
          position: { 
            x: x + 85 + Math.cos(angle) * 40, 
            y: 290 - Math.sin(angle) * 60 
          },
          collected: false,
          type: i === 2 ? 'kilobyte' : 'byte'
        });
      }
    }
  }

  getCollisions(playerBounds: any) {
    const collisions = {
      obstacles: [] as Obstacle[],
      coins: [] as DataPacket[]
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
    
    for (const packet of this.dataPackets) {
      if (!packet.collected && this.isColliding(playerBounds, {
        x: packet.position.x,
        y: packet.position.y,
        width: 20,
        height: 20
      })) {
        packet.collected = true;
        this.dataCollected += packet.type === 'kilobyte' ? 10 : 1;
        this.pendingCollectSound = true;
        collisions.coins.push(packet);
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
    
    // Render ground (circuit board style)
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 370, 1000, 30);
    
    // Circuit pattern
    ctx.strokeStyle = "#00ff88";
    ctx.lineWidth = 1;
    for (let x = 0; x < 1000; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 370);
      ctx.lineTo(x, 400);
      ctx.stroke();
      
      // Horizontal lines
      if (x % 60 === 0) {
        ctx.beginPath();
        ctx.moveTo(x, 385);
        ctx.lineTo(x + 30, 385);
        ctx.stroke();
      }
    }
    
    // Render data packets
    this.dataPackets.forEach(packet => {
      if (!packet.collected) {
        if (packet.type === 'kilobyte') {
          // Golden data packet
          ctx.fillStyle = "#ffd700";
          ctx.fillRect(packet.position.x, packet.position.y, 20, 20);
          ctx.fillStyle = "#ffaa00";
          ctx.font = "bold 12px monospace";
          ctx.textAlign = "center";
          ctx.fillText("KB", packet.position.x + 10, packet.position.y + 15);
        } else {
          // Blue byte
          ctx.fillStyle = "#00ffff";
          ctx.beginPath();
          ctx.arc(packet.position.x + 10, packet.position.y + 10, 8, 0, Math.PI * 2);
          ctx.fill();
          
          // Binary effect
          ctx.fillStyle = "#003333";
          ctx.font = "6px monospace";
          ctx.fillText("01", packet.position.x + 5, packet.position.y + 12);
        }
      }
    });
    
    // Render obstacles
    this.obstacles.forEach(obstacle => {
      const glitchY = obstacle.glitchOffset || 0;
      
      switch (obstacle.type) {
        case 'virus':
          // Red virus sphere with spikes
          ctx.fillStyle = "#ff3333";
          ctx.beginPath();
          ctx.arc(
            obstacle.position.x + obstacle.width / 2,
            obstacle.position.y + obstacle.height / 2 + glitchY,
            obstacle.width / 2 - 5,
            0, Math.PI * 2
          );
          ctx.fill();
          
          // Virus spikes
          ctx.strokeStyle = "#ff6666";
          ctx.lineWidth = 3;
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + this.glitchTimer * 2;
            const cx = obstacle.position.x + obstacle.width / 2;
            const cy = obstacle.position.y + obstacle.height / 2 + glitchY;
            const innerR = obstacle.width / 2 - 5;
            const outerR = obstacle.width / 2 + 5;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR);
            ctx.lineTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR);
            ctx.stroke();
          }
          
          // Skull icon
          ctx.fillStyle = "#000";
          ctx.font = "16px Arial";
          ctx.textAlign = "center";
          ctx.fillText("☠", obstacle.position.x + obstacle.width / 2, obstacle.position.y + obstacle.height / 2 + 5);
          break;
          
        case 'firewall':
          // Orange/red firewall block
          const gradient = ctx.createLinearGradient(
            obstacle.position.x, obstacle.position.y,
            obstacle.position.x, obstacle.position.y + obstacle.height
          );
          gradient.addColorStop(0, "#ff6600");
          gradient.addColorStop(0.5, "#ff3300");
          gradient.addColorStop(1, "#cc0000");
          ctx.fillStyle = gradient;
          ctx.fillRect(
            obstacle.position.x,
            obstacle.position.y,
            obstacle.width,
            obstacle.height
          );
          
          // Firewall icon
          ctx.fillStyle = "#fff";
          ctx.font = "bold 16px monospace";
          ctx.textAlign = "center";
          ctx.fillText("🔥", obstacle.position.x + obstacle.width / 2, obstacle.position.y + obstacle.height / 2 + 6);
          
          // Border
          ctx.strokeStyle = "#ffaa00";
          ctx.lineWidth = 2;
          ctx.strokeRect(
            obstacle.position.x,
            obstacle.position.y,
            obstacle.width,
            obstacle.height
          );
          break;
          
        case 'bug':
          // Green computer bug
          ctx.fillStyle = "#00cc00";
          ctx.beginPath();
          ctx.ellipse(
            obstacle.position.x + obstacle.width / 2,
            obstacle.position.y + obstacle.height / 2,
            obstacle.width / 2,
            obstacle.height / 2,
            0, 0, Math.PI * 2
          );
          ctx.fill();
          
          // Bug legs
          ctx.strokeStyle = "#006600";
          ctx.lineWidth = 2;
          for (let i = 0; i < 3; i++) {
            const legY = obstacle.position.y + 8 + i * 8;
            ctx.beginPath();
            ctx.moveTo(obstacle.position.x, legY);
            ctx.lineTo(obstacle.position.x - 8, legY + 5);
            ctx.moveTo(obstacle.position.x + obstacle.width, legY);
            ctx.lineTo(obstacle.position.x + obstacle.width + 8, legY + 5);
            ctx.stroke();
          }
          
          // Bug eyes
          ctx.fillStyle = "#ff0000";
          ctx.beginPath();
          ctx.arc(obstacle.position.x + 10, obstacle.position.y + 10, 4, 0, Math.PI * 2);
          ctx.arc(obstacle.position.x + 25, obstacle.position.y + 10, 4, 0, Math.PI * 2);
          ctx.fill();
          
          // Antennae
          ctx.strokeStyle = "#00cc00";
          ctx.beginPath();
          ctx.moveTo(obstacle.position.x + 10, obstacle.position.y);
          ctx.lineTo(obstacle.position.x + 5, obstacle.position.y - 10);
          ctx.moveTo(obstacle.position.x + 25, obstacle.position.y);
          ctx.lineTo(obstacle.position.x + 30, obstacle.position.y - 10);
          ctx.stroke();
          break;
          
        case 'gap':
          // Digital void with matrix effect
          ctx.fillStyle = "#000";
          ctx.fillRect(
            obstacle.position.x,
            obstacle.position.y,
            obstacle.width,
            obstacle.height
          );
          
          // Matrix rain effect
          ctx.fillStyle = "#00ff00";
          ctx.font = "10px monospace";
          for (let i = 0; i < 3; i++) {
            const charX = obstacle.position.x + 10 + i * 20;
            for (let j = 0; j < 8; j++) {
              const char = Math.random() > 0.5 ? "1" : "0";
              ctx.globalAlpha = Math.random() * 0.5 + 0.3;
              ctx.fillText(char, charX, obstacle.position.y + 10 + j * 15);
            }
          }
          ctx.globalAlpha = 1;
          break;
          
        case 'malware':
          // Purple malware blob
          ctx.fillStyle = "#9900ff";
          ctx.beginPath();
          ctx.ellipse(
            obstacle.position.x + obstacle.width / 2,
            obstacle.position.y + obstacle.height / 2,
            obstacle.width / 2,
            obstacle.height / 2,
            0, 0, Math.PI * 2
          );
          ctx.fill();
          
          // Glitch effect lines
          ctx.strokeStyle = "#ff00ff";
          ctx.lineWidth = 2;
          for (let i = 0; i < 3; i++) {
            const offsetY = Math.sin(this.glitchTimer * 15 + i) * 3;
            ctx.beginPath();
            ctx.moveTo(obstacle.position.x, obstacle.position.y + 10 + i * 10 + offsetY);
            ctx.lineTo(obstacle.position.x + obstacle.width, obstacle.position.y + 10 + i * 10 + offsetY);
            ctx.stroke();
          }
          
          // Malware icon
          ctx.fillStyle = "#fff";
          ctx.font = "18px Arial";
          ctx.textAlign = "center";
          ctx.fillText("⚠", obstacle.position.x + obstacle.width / 2, obstacle.position.y + obstacle.height / 2 + 6);
          break;
          
        case 'popup':
          // Annoying popup window
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(
            obstacle.position.x,
            obstacle.position.y,
            obstacle.width,
            obstacle.height
          );
          
          // Title bar
          ctx.fillStyle = "#0066cc";
          ctx.fillRect(obstacle.position.x, obstacle.position.y, obstacle.width, 15);
          
          // Close button
          ctx.fillStyle = "#ff0000";
          ctx.fillRect(obstacle.position.x + obstacle.width - 15, obstacle.position.y, 15, 15);
          ctx.fillStyle = "#fff";
          ctx.font = "bold 10px Arial";
          ctx.fillText("X", obstacle.position.x + obstacle.width - 10, obstacle.position.y + 11);
          
          // Popup content
          ctx.fillStyle = "#333";
          ctx.font = "8px Arial";
          ctx.textAlign = "center";
          ctx.fillText("ERRO!", obstacle.position.x + obstacle.width / 2, obstacle.position.y + 30);
          ctx.fillText("CLIQUE", obstacle.position.x + obstacle.width / 2, obstacle.position.y + 42);
          
          // Border
          ctx.strokeStyle = "#333";
          ctx.lineWidth = 2;
          ctx.strokeRect(obstacle.position.x, obstacle.position.y, obstacle.width, obstacle.height);
          break;
      }
    });
  }

  private renderBackground(ctx: CanvasRenderingContext2D) {
    // Dark digital background
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, "#0a0a1a");
    gradient.addColorStop(0.5, "#1a1a3a");
    gradient.addColorStop(1, "#0d0d2a");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1000, 400);
    
    // Matrix-style glitch lines
    ctx.strokeStyle = "#00ff8844";
    ctx.lineWidth = 1;
    this.glitchLines.forEach(line => {
      ctx.beginPath();
      ctx.moveTo(line.x, line.y);
      ctx.lineTo(line.x + line.width, line.y);
      ctx.stroke();
      
      // Random binary text
      ctx.fillStyle = "#00ff8833";
      ctx.font = "8px monospace";
      const binary = Math.random() > 0.5 ? "10110" : "01001";
      ctx.fillText(binary, line.x, line.y - 2);
    });
    
    // Scanlines effect
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    for (let y = 0; y < 400; y += 4) {
      ctx.fillRect(0, y, 1000, 2);
    }
    
    // Random glitch rectangles
    if (Math.random() > 0.95) {
      ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, 255, 0.1)`;
      ctx.fillRect(
        Math.random() * 800,
        Math.random() * 300,
        50 + Math.random() * 100,
        10 + Math.random() * 30
      );
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
    return this.dataCollected;
  }
}
