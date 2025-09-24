interface PlayerInput {
  left: boolean;
  right: boolean;
  jump: boolean;
  doubleJump: boolean;
  down: boolean;
  // Level 2 specific: variable jump system
  jumpType: 'none' | 'short' | 'long' | 'double';
  jumpDuration: number;
}

export class InputHandler {
  private playerInputs: PlayerInput[] = [];
  private playerCount: number;
  
  private keysPressed: Set<string> = new Set();
  private lastJumpTimes: number[] = [];
  private jumpPressCount: number[] = [];
  private jumpStartTimes: number[] = []; // Track when jump key was pressed
  private jumpEndTimes: number[] = []; // Track when jump key was released
  private canvas: HTMLCanvasElement;
  private handleKeyDown!: (event: KeyboardEvent) => void;
  private handleKeyUp!: (event: KeyboardEvent) => void;

  constructor(canvas: HTMLCanvasElement, playerCount: number = 2) {
    this.canvas = canvas;
    this.playerCount = playerCount;
    
    // Initialize input states for all players
    for (let i = 0; i < playerCount; i++) {
      this.playerInputs.push({ 
        left: false, right: false, jump: false, doubleJump: false, down: false,
        jumpType: 'none', jumpDuration: 0
      });
      this.lastJumpTimes.push(0);
      this.jumpPressCount.push(0);
      this.jumpStartTimes.push(0);
      this.jumpEndTimes.push(0);
    }
    
    this.setupEventListeners();
  }

  // Legacy getters for backward compatibility
  get player1Input() { 
    return this.playerInputs[0] || { 
      left: false, right: false, jump: false, doubleJump: false, down: false,
      jumpType: 'none', jumpDuration: 0
    }; 
  }
  get player2Input() { 
    return this.playerInputs[1] || { 
      left: false, right: false, jump: false, doubleJump: false, down: false,
      jumpType: 'none', jumpDuration: 0
    }; 
  }

  getPlayerInput(index: number) {
    return this.playerInputs[index] || { 
      left: false, right: false, jump: false, doubleJump: false, down: false,
      jumpType: 'none', jumpDuration: 0
    };
  }

  private setupEventListeners() {
    // Make sure canvas can receive keyboard events
    this.canvas.tabIndex = 0;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      
      // Check for jump key double press
      const currentTime = Date.now();
      const controlMaps = [
        { left: 'KeyA', right: 'KeyD', jump: 'KeyW', down: 'KeyS' },
        { left: 'ArrowLeft', right: 'ArrowRight', jump: 'ArrowUp', down: 'ArrowDown' },
        { left: 'KeyJ', right: 'KeyL', jump: 'KeyI', down: 'KeyK' },
        { left: 'Numpad4', right: 'Numpad6', jump: 'Numpad8', down: 'Numpad2' }
      ];
      
      for (let i = 0; i < this.playerCount; i++) {
        const controls = controlMaps[i] || controlMaps[0];
        if (event.code === controls.jump) {
          const timeSinceLastJump = currentTime - this.lastJumpTimes[i];
          
          // Track when jump key was pressed for duration calculation
          this.jumpStartTimes[i] = currentTime;
          
          if (timeSinceLastJump < 300) { // 300ms window for double tap (more responsive)
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
          }, 400);
          
          break;
        }
      }
      
      this.keysPressed.add(event.code);
      this.updateInputStates();
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      event.preventDefault();
      
      // Track jump key release for duration calculation
      const currentTime = Date.now();
      const controlMaps = [
        { left: 'KeyA', right: 'KeyD', jump: 'KeyW', down: 'KeyS' },
        { left: 'ArrowLeft', right: 'ArrowRight', jump: 'ArrowUp', down: 'ArrowDown' },
        { left: 'KeyJ', right: 'KeyL', jump: 'KeyI', down: 'KeyK' },
        { left: 'Numpad4', right: 'Numpad6', jump: 'Numpad8', down: 'Numpad2' }
      ];
      
      for (let i = 0; i < this.playerCount; i++) {
        const controls = controlMaps[i] || controlMaps[0];
        if (event.code === controls.jump && this.jumpStartTimes[i] > 0) {
          this.jumpEndTimes[i] = currentTime;
          break;
        }
      }
      
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
      { left: 'KeyA', right: 'KeyD', jump: 'KeyW', down: 'KeyS' },
      // Player 2: Arrow keys
      { left: 'ArrowLeft', right: 'ArrowRight', jump: 'ArrowUp', down: 'ArrowDown' },
      // Player 3: JIL
      { left: 'KeyJ', right: 'KeyL', jump: 'KeyI', down: 'KeyK' },
      // Player 4: Numpad
      { left: 'Numpad4', right: 'Numpad6', jump: 'Numpad8', down: 'Numpad2' }
    ];

    for (let i = 0; i < this.playerCount; i++) {
      const controls = controlMaps[i] || controlMaps[0]; // Fallback to first control scheme
      
      // Calculate jump duration and type
      let jumpType: 'none' | 'short' | 'long' | 'double' = 'none';
      let jumpDuration = 0;
      
      if (this.jumpEndTimes[i] > this.jumpStartTimes[i] && this.jumpStartTimes[i] > 0) {
        jumpDuration = this.jumpEndTimes[i] - this.jumpStartTimes[i];
        
        if (this.jumpPressCount[i] >= 2) {
          jumpType = 'double';
        } else if (jumpDuration > 0) {
          jumpType = jumpDuration < 120 ? 'short' : 'long'; // 120ms threshold (mais sensível)
        }
        
        // Reset after processing
        this.jumpStartTimes[i] = 0;
        this.jumpEndTimes[i] = 0;
      } else if (this.keysPressed.has(controls.jump) && this.jumpStartTimes[i] > 0) {
        // Jump key is still held - calculate current duration
        jumpDuration = Date.now() - this.jumpStartTimes[i];
        if (jumpDuration >= 50) { // Minimum hold time to register
          jumpType = jumpDuration < 120 ? 'short' : 'long';
        }
      }
      
      this.playerInputs[i] = {
        left: this.keysPressed.has(controls.left),
        right: this.keysPressed.has(controls.right),
        jump: this.keysPressed.has(controls.jump),
        doubleJump: this.jumpPressCount[i] >= 2,
        down: this.keysPressed.has(controls.down),
        jumpType: jumpType,
        jumpDuration: jumpDuration
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