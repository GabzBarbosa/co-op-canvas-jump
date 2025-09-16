interface PlayerInput {
  left: boolean;
  right: boolean;
  jump: boolean;
}

export class InputHandler {
  public player1Input: PlayerInput = { left: false, right: false, jump: false };
  public player2Input: PlayerInput = { left: false, right: false, jump: false };
  
  private keysPressed: Set<string> = new Set();
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Make sure canvas can receive keyboard events
    this.canvas.tabIndex = 0;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      this.keysPressed.add(event.code);
      this.updateInputStates();
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      event.preventDefault();
      this.keysPressed.delete(event.code);
      this.updateInputStates();
    };

    // Add event listeners to the canvas for focus-based input
    this.canvas.addEventListener('keydown', handleKeyDown);
    this.canvas.addEventListener('keyup', handleKeyUp);
    
    // Also listen to window events for global input (more reliable)
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Store references for cleanup
    this.handleKeyDown = handleKeyDown;
    this.handleKeyUp = handleKeyUp;
  }

  private handleKeyDown!: (event: KeyboardEvent) => void;
  private handleKeyUp!: (event: KeyboardEvent) => void;

  private updateInputStates() {
    // Player 1 controls (WASD)
    this.player1Input.left = this.keysPressed.has('KeyA');
    this.player1Input.right = this.keysPressed.has('KeyD');
    this.player1Input.jump = this.keysPressed.has('KeyW');

    // Player 2 controls (Arrow keys)
    this.player2Input.left = this.keysPressed.has('ArrowLeft');
    this.player2Input.right = this.keysPressed.has('ArrowRight');
    this.player2Input.jump = this.keysPressed.has('ArrowUp');
  }

  cleanup() {
    this.canvas.removeEventListener('keydown', this.handleKeyDown);
    this.canvas.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }
}