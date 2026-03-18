export type ObstacleType = "log" | "hole" | "spike" | "enemy";

export class RunnerObstacle {
  public position: { x: number; y: number };
  public width: number;
  public height: number;
  public type: ObstacleType;
  public requiresJump: boolean;
  public requiresCrouch: boolean;
  private animTime = 0;

  constructor(x: number, y: number, type: ObstacleType) {
    this.position = { x, y };
    this.type = type;
    
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
        this.height = 20;
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
    this.animTime += deltaTime;
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
    const x = this.position.x;
    const y = this.position.y;
    
    switch (this.type) {
      case "log":
        // Rock/boulder obstacle
        ctx.fillStyle = "#8B7355";
        ctx.beginPath();
        ctx.ellipse(x + this.width / 2, y + this.height / 2, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#6B5335";
        ctx.beginPath();
        ctx.ellipse(x + this.width / 2 - 3, y + this.height / 2 - 3, this.width / 3, this.height / 3, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case "hole":
        // Mud pit
        ctx.fillStyle = "#3d2b1f";
        ctx.fillRect(x, y, this.width, this.height);
        ctx.fillStyle = "#5a3d2b";
        // Bubbles
        const bubbleOffset = Math.sin(this.animTime * 3) * 2;
        ctx.beginPath();
        ctx.arc(x + 15, y + 10 + bubbleOffset, 5, 0, Math.PI * 2);
        ctx.arc(x + 40, y + 20 - bubbleOffset, 4, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case "spike":
        // Eagle/hawk flying overhead (needs crouch)
        ctx.fillStyle = "#8B4513";
        // Body
        ctx.fillRect(x + 8, y + 8, 16, 8);
        // Wings spread
        const wingFlap = Math.sin(this.animTime * 8) * 3;
        ctx.beginPath();
        ctx.moveTo(x, y + 10 + wingFlap);
        ctx.lineTo(x + 8, y + 12);
        ctx.lineTo(x + 4, y + 5 + wingFlap);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x + 32, y + 10 + wingFlap);
        ctx.lineTo(x + 24, y + 12);
        ctx.lineTo(x + 28, y + 5 + wingFlap);
        ctx.fill();
        // Head
        ctx.fillStyle = "#FFF";
        ctx.fillRect(x + 22, y + 8, 6, 5);
        // Beak
        ctx.fillStyle = "#FFD700";
        ctx.fillRect(x + 28, y + 9, 4, 3);
        // Eye
        ctx.fillStyle = "#000";
        ctx.fillRect(x + 24, y + 9, 2, 2);
        break;
        
      case "enemy":
        // Hyena enemy
        ctx.fillStyle = "#C4A35A";
        ctx.fillRect(x, y, this.width, this.height);
        ctx.fillStyle = "#8B7040";
        // Spots
        ctx.fillRect(x + 5, y + 5, 4, 4);
        ctx.fillRect(x + 15, y + 10, 4, 4);
        ctx.fillRect(x + 22, y + 5, 4, 4);
        // Eyes
        ctx.fillStyle = "#FFD700";
        ctx.fillRect(x + 8, y + 8, 4, 4);
        ctx.fillRect(x + 20, y + 8, 4, 4);
        ctx.fillStyle = "#000";
        ctx.fillRect(x + 9, y + 9, 2, 2);
        ctx.fillRect(x + 21, y + 9, 2, 2);
        // Mouth/teeth
        ctx.fillStyle = "#FFF";
        ctx.fillRect(x + 10, y + 18, 3, 3);
        ctx.fillRect(x + 18, y + 18, 3, 3);
        break;
    }
  }

  shouldDestroy(): boolean {
    return this.position.x + this.width < -50;
  }
}
