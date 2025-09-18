interface Tile {
  type: "empty" | "platform" | "death" | "goal" | "button";
  x: number;
  y: number;
  width: number;
  height: number;
  buttonId?: string;
  activated?: boolean;
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
  buttons: Tile[];
}

export class Level4 {
  private tiles: Tile[] = [];
  private readonly tileSize = 32;
  private readonly levelWidth = 25; // 800px / 32px
  private readonly levelHeight = 14; // 450px / 32px
  private buttonStates: Record<string, boolean> = {};

  constructor() {
    this.generateLevel();
  }

  private generateLevel() {
    // Boss arena layout - enclosed arena with interactive buttons
    const levelData = [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ];

    this.tiles = [];
    this.buttonStates = { button1: false, button2: false };
    
    for (let row = 0; row < levelData.length; row++) {
      for (let col = 0; col < levelData[row].length; col++) {
        const tileType = levelData[row][col];
        if (tileType !== 0) {
          let type: Tile["type"];
          let buttonId: string | undefined;
          
          switch (tileType) {
            case 1: type = "platform"; break;
            case 2: type = "death"; break;
            case 3: type = "goal"; break;
            case 4: 
              type = "button"; 
              buttonId = "button1";
              break;
            case 5: 
              type = "button"; 
              buttonId = "button2";
              break;
            default: type = "empty";
          }
          
          this.tiles.push({
            type,
            x: col * this.tileSize,
            y: row * this.tileSize,
            width: this.tileSize,
            height: this.tileSize,
            buttonId,
            activated: false
          });
        }
      }
    }
  }

  getStartPosition() {
    // Start in the center of the arena
    return { x: 400, y: 300 };
  }

  getCollisions(bounds: Bounds): Collisions {
    const collisions: Collisions = {
      platforms: [],
      deaths: [],
      goals: [],
      buttons: [],
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
          case "button":
            collisions.buttons.push(tile);
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

  activateButton(buttonId: string) {
    this.buttonStates[buttonId] = true;
    // Find and update the button tile
    const buttonTile = this.tiles.find(tile => tile.buttonId === buttonId);
    if (buttonTile) {
      buttonTile.activated = true;
    }
  }

  deactivateButton(buttonId: string) {
    this.buttonStates[buttonId] = false;
    // Find and update the button tile
    const buttonTile = this.tiles.find(tile => tile.buttonId === buttonId);
    if (buttonTile) {
      buttonTile.activated = false;
    }
  }

  areBothButtonsActivated(): boolean {
    return this.buttonStates.button1 && this.buttonStates.button2;
  }

  reset() {
    this.buttonStates = { button1: false, button2: false };
    this.tiles.forEach(tile => {
      if (tile.type === "button") {
        tile.activated = false;
      }
    });
  }

  render(ctx: CanvasRenderingContext2D) {
    this.tiles.forEach(tile => {
      switch (tile.type) {
        case "platform":
          // Boss arena walls - darker, more imposing
          ctx.fillStyle = "#1A1A1A";
          ctx.fillRect(tile.x, tile.y, tile.width, tile.height);
          
          // Add metal texture
          ctx.fillStyle = "#2D2D2D";
          ctx.fillRect(tile.x, tile.y, tile.width, 4);
          ctx.fillStyle = "#0F0F0F";
          ctx.fillRect(tile.x, tile.y + tile.height - 4, tile.width, 4);
          break;
          
        case "button":
          // Draw interactive buttons
          const isActivated = tile.activated;
          ctx.fillStyle = isActivated ? "#E74C3C" : "#8B0000";
          ctx.fillRect(tile.x + 4, tile.y + 8, tile.width - 8, tile.height - 16);
          
          // Button glow effect when activated
          if (isActivated) {
            ctx.shadowColor = "#27AE60";
            ctx.shadowBlur = 10;
            ctx.fillStyle = "#2ECC71";
            ctx.fillRect(tile.x + 8, tile.y + 12, tile.width - 16, tile.height - 24);
            ctx.shadowBlur = 0;
          }
          
          // Button ID indicator
          ctx.fillStyle = "#FFFFFF";
          ctx.font = "12px monospace";
          ctx.textAlign = "center";
          ctx.fillText(
            tile.buttonId === "button1" ? "1" : "2", 
            tile.x + tile.width / 2, 
            tile.y + tile.height / 2 + 4
          );
          break;
      }
    });

    // Draw arena background
    this.renderBackground(ctx);
  }

  private renderBackground(ctx: CanvasRenderingContext2D) {
    // Dark, ominous background for boss fight
    const gradient = ctx.createRadialGradient(400, 225, 0, 400, 225, 400);
    gradient.addColorStop(0, "rgba(139, 69, 19, 0.1)"); // Dark orange center
    gradient.addColorStop(1, "rgba(0, 0, 0, 0.3)"); // Black edges
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 450);
    
    // Lightning effect for dramatic atmosphere
    const time = Date.now() / 100;
    if (Math.sin(time) > 0.95) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      ctx.fillRect(0, 0, 800, 450);
    }
  }
}