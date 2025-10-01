export type ObstacleType = "log" | "hole" | "spike" | "enemy";

export class RunnerObstacle {
  public position: { x: number; y: number };
  public width: number;
  public height: number;
  public type: ObstacleType;
  public requiresJump: boolean;
  public requiresCrouch: boolean;

  constructor(x: number, y: number, type: ObstacleType) {
    this.position = { x, y };
    this.type = type;
    
    // Set dimensions and requirements based on type
    switch (type) {
      case "log":
        this.width = 40;
        this.height = 30;
        this.requiresJump = true;
        this.requiresCrouch = false;
        break;
      case "hole":
        this.width = 60;
        this.height = 80;
        this.requiresJump = true;
        this.requiresCrouch = false;
        break;
      case "spike":
        this.width = 32;
        this.height = 20; // Altura reduzida para permitir agachar
        this.requiresJump = false;
        this.requiresCrouch = true;
        break;
      case "enemy":
        this.width = 32;
        this.height = 32;
        this.requiresJump = true;
        this.requiresCrouch = false;
        break;
    }
  }

  update(deltaTime: number, scrollSpeed: number) {
    this.position.x -= scrollSpeed * deltaTime;
  }

  getBounds() {
    return {
      x: this.position.x,
      y: this.position.y,
      width: this.width,
      height: this.height
    };
  }

  render(ctx: CanvasRenderingContext2D) {
    switch (this.type) {
      case "log":
        // Brown log
        ctx.fillStyle = "#8B4513";
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
        ctx.fillStyle = "#654321";
        ctx.fillRect(this.position.x + 4, this.position.y + 4, this.width - 8, this.height - 8);
        break;
        
      case "hole":
        // Black hole in ground
        ctx.fillStyle = "#000000";
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
        ctx.strokeStyle = "#444444";
        ctx.lineWidth = 2;
        ctx.strokeRect(this.position.x, this.position.y, this.width, this.height);
        break;
        
      case "spike":
        // Gray spikes pointing down from above (player needs to crouch)
        ctx.fillStyle = "#666666";
        ctx.fillRect(this.position.x, this.position.y, this.width, 8);
        
        // Draw spike points facing down
        ctx.fillStyle = "#888888";
        for (let i = 0; i < 4; i++) {
          const spikeX = this.position.x + (i * 8);
          ctx.beginPath();
          ctx.moveTo(spikeX, this.position.y + 8);
          ctx.lineTo(spikeX + 4, this.position.y + 20);
          ctx.lineTo(spikeX + 8, this.position.y + 8);
          ctx.fill();
        }
        break;
        
      case "enemy":
        // Red enemy square
        ctx.fillStyle = "#E74C3C";
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
        ctx.fillStyle = "#C0392B";
        ctx.fillRect(this.position.x + 4, this.position.y + 4, this.width - 8, this.height - 8);
        
        // Simple eyes
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(this.position.x + 8, this.position.y + 8, 4, 4);
        ctx.fillRect(this.position.x + 20, this.position.y + 8, 4, 4);
        break;
    }
  }

  shouldDestroy(): boolean {
    return this.position.x + this.width < -50;
  }
}