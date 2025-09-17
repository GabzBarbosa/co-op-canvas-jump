interface PlayerInput {
  left: boolean;
  right: boolean;
  jump: boolean;
  doubleJump: boolean;
}

export class InputHandler {
  private playerInputs: PlayerInput[] = [];
  private playerCount: number;
  
  private keysPressed: Set<string> = new Set();
  private lastJumpTimes: number[] = [];
  private jumpPressCount: number[] = [];
  private canvas: HTMLCanvasElement;
  private handleKeyDown!: (event: KeyboardEvent) => void;
  private handleKeyUp!: (event: KeyboardEvent) => void;

  constructor(canvas: HTMLCanvasElement, playerCount: number = 2) {
    this.canvas = canvas;
    this.playerCount = playerCount;
    
    // Initialize input states for all players
    for (let i = 0; i < playerCount; i++) {
      this.playerInputs.push({ left: false, right: false, jump: false, doubleJump: false });
      this.lastJumpTimes.push(0);
      this.jumpPressCount.push(0);
    }
    
    this.setupEventListeners();
  }

  // Legacy getters for backward compatibility
  get player1Input() { return this.playerInputs[0] || { left: false, right: false, jump: false, doubleJump: false }; }
  get player2Input() { return this.playerInputs[1] || { left: false, right: false, jump: false, doubleJump: false }; }

  getPlayerInput(index: number) {
    return this.playerInputs[index] || { left: false, right: false, jump: false, doubleJump: false };
  }

  private setupEventListeners() {
    // Make sure canvas can receive keyboard events
    this.canvas.tabIndex = 0;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      
      // Check for jump key double press
      const currentTime = Date.now();
      const controlMaps = [
        { left: 'KeyA', right: 'KeyD', jump: 'KeyW' },
        { left: 'ArrowLeft', right: 'ArrowRight', jump: 'ArrowUp' },
        { left: 'KeyJ', right: 'KeyL', jump: 'KeyI' },
        { left: 'Numpad4', right: 'Numpad6', jump: 'Numpad8' }
      ];
      
      for (let i = 0; i < this.playerCount; i++) {
        const controls = controlMaps[i] || controlMaps[0];
        if (event.code === controls.jump) {
          const timeSinceLastJump = currentTime - this.lastJumpTimes[i];
          
          if (timeSinceLastJump < 500) { // 500ms window for double tap
            this.jumpPressCount[i]++;
          } else {
            this.jumpPressCount[i] = 1;
          }
          
          this.lastJumpTimes[i] = currentTime;
          
          // Reset count after a short delay
          setTimeout(() => {
            if (this.jumpPressCount[i] > 0) {
              this.jumpPressCount[i] = 0;
            }
          }, 600);
          
          break;
        }
      }
      
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

  private updateInputStates() {
    // Player controls mapping
    const controlMaps = [
      // Player 1: WASD
      { left: 'KeyA', right: 'KeyD', jump: 'KeyW' },
      // Player 2: Arrow keys
      { left: 'ArrowLeft', right: 'ArrowRight', jump: 'ArrowUp' },
      // Player 3: JIL
      { left: 'KeyJ', right: 'KeyL', jump: 'KeyI' },
      // Player 4: Numpad
      { left: 'Numpad4', right: 'Numpad6', jump: 'Numpad8' }
    ];

    for (let i = 0; i < this.playerCount; i++) {
      const controls = controlMaps[i] || controlMaps[0]; // Fallback to first control scheme
      this.playerInputs[i] = {
        left: this.keysPressed.has(controls.left),
        right: this.keysPressed.has(controls.right),
        jump: this.keysPressed.has(controls.jump),
        doubleJump: this.jumpPressCount[i] >= 2
      };
    }
  }

  cleanup() {
    this.canvas.removeEventListener('keydown', this.handleKeyDown);
    this.canvas.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }
}