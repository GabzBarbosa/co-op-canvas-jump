interface Tile {
  type: "empty" | "platform" | "death" | "goal";
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Collisions {
  platforms: Tile[];
  deaths: Tile[];
  goals: Tile[];
}

export class Level {
  private tiles: Tile[] = [];
  private readonly tileSize = 32;
  private readonly levelWidth = 25; // 800px / 32px
  private readonly levelHeight = 14; // 450px / 32px

  constructor() {
    this.generateLevel();
  }

  private generateLevel() {
    // Level layout - 0: empty, 1: platform, 2: death, 3: goal
    const levelData = [
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,2,2,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,2,2,0,0,0,0,0,0,0,0,0,0,0],
      [1,1,1,1,0,0,0,0,0,0,0,0,2,2,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,2,2,0,0,0,0,0,0,0,0,0,0,0],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ];

    this.tiles = [];
    
    for (let row = 0; row < levelData.length; row++) {
      for (let col = 0; col < levelData[row].length; col++) {
        const tileType = levelData[row][col];
        if (tileType !== 0) {
          let type: Tile["type"];
          switch (tileType) {
            case 1: type = "platform"; break;
            case 2: type = "death"; break;
            case 3: type = "goal"; break;
            default: type = "empty";
          }
          
          this.tiles.push({
            type,
            x: col * this.tileSize,
            y: row * this.tileSize,
            width: this.tileSize,
            height: this.tileSize,
          });
        }
      }
    }
  }

  getStartPosition() {
    // Start position on the first platform
    return { x: 64, y: 320 }; // Above the starting platform
  }

  getCollisions(bounds: Bounds): Collisions {
    const collisions: Collisions = {
      platforms: [],
      deaths: [],
      goals: [],
    };

    this.tiles.forEach(tile => {
      if (this.isColliding(bounds, tile)) {
        switch (tile.type) {
          case "platform":
            collisions.platforms.push(tile);
            break;
          case "death":
            collisions.deaths.push(tile);
            break;
          case "goal":
            collisions.goals.push(tile);
            break;
        }
      }
    });

    return collisions;
  }

  private isColliding(a: Bounds, b: Bounds): boolean {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
  }

  render(ctx: CanvasRenderingContext2D) {
    this.tiles.forEach(tile => {
      switch (tile.type) {
        case "platform":
          // Draw platform with pixel art style
          ctx.fillStyle = "#34495E";
          ctx.fillRect(tile.x, tile.y, tile.width, tile.height);
          
          // Add some detail/texture
          ctx.fillStyle = "#2C3E50";
          ctx.fillRect(tile.x, tile.y, tile.width, 4); // Top edge
          ctx.fillStyle = "#3D5665";
          ctx.fillRect(tile.x, tile.y + tile.height - 4, tile.width, 4); // Bottom edge
          break;
          
        case "death":
          // Draw spikes/danger
          ctx.fillStyle = "#E74C3C";
          ctx.fillRect(tile.x, tile.y, tile.width, tile.height);
          
          // Add spike pattern
          ctx.fillStyle = "#C0392B";
          for (let i = 0; i < tile.width; i += 8) {
            ctx.fillRect(tile.x + i, tile.y, 4, tile.height);
          }
          break;
          
        case "goal":
          // Draw goal with golden color and animation
          const time = Date.now() / 1000;
          const alpha = 0.7 + 0.3 * Math.sin(time * 3);
          
          ctx.fillStyle = `rgba(241, 196, 15, ${alpha})`;
          ctx.fillRect(tile.x, tile.y, tile.width, tile.height);
          
          // Add sparkle effect
          ctx.fillStyle = "#F39C12";
          const sparkleOffset = Math.sin(time * 2) * 4;
          ctx.fillRect(tile.x + 8 + sparkleOffset, tile.y + 8, 16, 16);
          ctx.fillRect(tile.x + 16, tile.y + 4 - sparkleOffset, 8, 24);
          break;
      }
    });

    // Draw background elements for atmosphere
    this.renderBackground(ctx);
  }

  private renderBackground(ctx: CanvasRenderingContext2D) {
    // Simple starfield background
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    for (let i = 0; i < 50; i++) {
      const x = (i * 137) % 800; // Pseudo-random x
      const y = (i * 113) % 450; // Pseudo-random y
      const twinkle = Math.sin(Date.now() / 1000 + i) * 0.5 + 0.5;
      
      ctx.globalAlpha = twinkle * 0.6;
      ctx.fillRect(x, y, 2, 2);
    }
    ctx.globalAlpha = 1;
  }
}