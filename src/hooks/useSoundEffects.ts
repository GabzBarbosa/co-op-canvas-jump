import { useCallback, useRef, useEffect } from 'react';

type LevelMusic = 'sonic' | 'mario' | 'bomberman' | 'platformer' | null;

class MusicGenerator {
  private audioContext: AudioContext | null = null;
  private currentMusic: LevelMusic = null;
  private oscillators: OscillatorNode[] = [];
  private gainNodes: GainNode[] = [];
  private masterGain: GainNode | null = null;
  private intervalId: number | null = null;
  private isPlaying: boolean = false;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    return this.audioContext;
  }

  private createMasterGain(): GainNode {
    const ctx = this.getContext();
    if (!this.masterGain) {
      this.masterGain = ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.15, ctx.currentTime);
      this.masterGain.connect(ctx.destination);
    }
    return this.masterGain;
  }

  stopMusic() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.oscillators.forEach(osc => {
      try { osc.stop(); } catch (e) {}
    });
    this.oscillators = [];
    this.gainNodes = [];
    this.currentMusic = null;
  }

  playMusic(level: LevelMusic) {
    if (this.currentMusic === level && this.isPlaying) return;
    
    this.stopMusic();
    this.currentMusic = level;
    this.isPlaying = true;

    switch (level) {
      case 'sonic':
        this.playSonicMusic();
        break;
      case 'mario':
        this.playMarioMusic();
        break;
      case 'bomberman':
        this.playBombermanMusic();
        break;
      case 'platformer':
        this.playPlatformerMusic();
        break;
    }
  }

  private playSonicMusic() {
    const ctx = this.getContext();
    const master = this.createMasterGain();
    
    // Green Hill Zone inspired melody
    const melody = [
      { note: 659, duration: 0.15 }, // E5
      { note: 784, duration: 0.15 }, // G5
      { note: 880, duration: 0.15 }, // A5
      { note: 988, duration: 0.3 },  // B5
      { note: 880, duration: 0.15 }, // A5
      { note: 784, duration: 0.15 }, // G5
      { note: 659, duration: 0.15 }, // E5
      { note: 587, duration: 0.3 },  // D5
      { note: 523, duration: 0.15 }, // C5
      { note: 587, duration: 0.15 }, // D5
      { note: 659, duration: 0.15 }, // E5
      { note: 784, duration: 0.3 },  // G5
      { note: 659, duration: 0.15 }, // E5
      { note: 587, duration: 0.15 }, // D5
      { note: 523, duration: 0.3 },  // C5
      { note: 0, duration: 0.3 },    // Rest
    ];

    let noteIndex = 0;
    const playNote = () => {
      if (!this.isPlaying) return;
      
      const { note, duration } = melody[noteIndex];
      noteIndex = (noteIndex + 1) % melody.length;

      if (note > 0) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(note, ctx.currentTime);
        
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration * 0.9);
        
        osc.connect(gain);
        gain.connect(master);
        
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duration);
      }

      setTimeout(playNote, duration * 1000);
    };

    playNote();
  }

  private playMarioMusic() {
    const ctx = this.getContext();
    const master = this.createMasterGain();
    
    // Super Mario inspired melody
    const melody = [
      { note: 659, duration: 0.12 }, // E5
      { note: 659, duration: 0.12 }, // E5
      { note: 0, duration: 0.12 },   // Rest
      { note: 659, duration: 0.12 }, // E5
      { note: 0, duration: 0.12 },   // Rest
      { note: 523, duration: 0.12 }, // C5
      { note: 659, duration: 0.24 }, // E5
      { note: 784, duration: 0.24 }, // G5
      { note: 0, duration: 0.24 },   // Rest
      { note: 392, duration: 0.24 }, // G4
      { note: 0, duration: 0.24 },   // Rest
      { note: 523, duration: 0.18 }, // C5
      { note: 0, duration: 0.06 },   // Rest
      { note: 392, duration: 0.18 }, // G4
      { note: 0, duration: 0.06 },   // Rest
      { note: 330, duration: 0.24 }, // E4
      { note: 440, duration: 0.18 }, // A4
      { note: 494, duration: 0.18 }, // B4
      { note: 466, duration: 0.12 }, // Bb4
      { note: 440, duration: 0.24 }, // A4
    ];

    let noteIndex = 0;
    const playNote = () => {
      if (!this.isPlaying) return;
      
      const { note, duration } = melody[noteIndex];
      noteIndex = (noteIndex + 1) % melody.length;

      if (note > 0) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(note, ctx.currentTime);
        
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration * 0.8);
        
        osc.connect(gain);
        gain.connect(master);
        
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duration);
      }

      setTimeout(playNote, duration * 1000);
    };

    playNote();
  }

  private playBombermanMusic() {
    const ctx = this.getContext();
    const master = this.createMasterGain();
    
    // Bomberman inspired upbeat melody
    const melody = [
      { note: 523, duration: 0.15 }, // C5
      { note: 587, duration: 0.15 }, // D5
      { note: 659, duration: 0.15 }, // E5
      { note: 523, duration: 0.15 }, // C5
      { note: 659, duration: 0.15 }, // E5
      { note: 784, duration: 0.3 },  // G5
      { note: 659, duration: 0.15 }, // E5
      { note: 587, duration: 0.15 }, // D5
      { note: 523, duration: 0.15 }, // C5
      { note: 494, duration: 0.15 }, // B4
      { note: 523, duration: 0.3 },  // C5
      { note: 0, duration: 0.15 },   // Rest
      { note: 392, duration: 0.15 }, // G4
      { note: 440, duration: 0.15 }, // A4
      { note: 494, duration: 0.15 }, // B4
      { note: 523, duration: 0.3 },  // C5
    ];

    let noteIndex = 0;
    const playNote = () => {
      if (!this.isPlaying) return;
      
      const { note, duration } = melody[noteIndex];
      noteIndex = (noteIndex + 1) % melody.length;

      if (note > 0) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note, ctx.currentTime);
        
        gain.gain.setValueAtTime(0.35, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration * 0.85);
        
        osc.connect(gain);
        gain.connect(master);
        
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duration);
      }

      setTimeout(playNote, duration * 1000);
    };

    playNote();
  }

  private playPlatformerMusic() {
    const ctx = this.getContext();
    const master = this.createMasterGain();
    
    // Adventure platformer melody
    const melody = [
      { note: 392, duration: 0.2 },  // G4
      { note: 440, duration: 0.2 },  // A4
      { note: 494, duration: 0.2 },  // B4
      { note: 523, duration: 0.4 },  // C5
      { note: 494, duration: 0.2 },  // B4
      { note: 440, duration: 0.2 },  // A4
      { note: 392, duration: 0.4 },  // G4
      { note: 330, duration: 0.2 },  // E4
      { note: 349, duration: 0.2 },  // F4
      { note: 392, duration: 0.2 },  // G4
      { note: 440, duration: 0.4 },  // A4
      { note: 0, duration: 0.2 },    // Rest
      { note: 349, duration: 0.2 },  // F4
      { note: 330, duration: 0.2 },  // E4
      { note: 294, duration: 0.4 },  // D4
      { note: 0, duration: 0.2 },    // Rest
    ];

    let noteIndex = 0;
    const playNote = () => {
      if (!this.isPlaying) return;
      
      const { note, duration } = melody[noteIndex];
      noteIndex = (noteIndex + 1) % melody.length;

      if (note > 0) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(note, ctx.currentTime);
        
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration * 0.9);
        
        osc.connect(gain);
        gain.connect(master);
        
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duration);
      }

      setTimeout(playNote, duration * 1000);
    };

    playNote();
  }
}

class SoundGenerator {
  private audioContext: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    return this.audioContext;
  }

  playJump() {
    const ctx = this.getContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(300, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.15);
  }

  playDoubleJump() {
    const ctx = this.getContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(400, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.08);
    oscillator.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.12);

    gainNode.gain.setValueAtTime(0.25, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.12);
  }

  playExplosion() {
    const ctx = this.getContext();
    
    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    noise.start(ctx.currentTime);
  }

  playCollect() {
    const ctx = this.getContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    
    oscillator.frequency.setValueAtTime(587, ctx.currentTime);
    oscillator.frequency.setValueAtTime(880, ctx.currentTime + 0.08);

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime + 0.08);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.2);
  }

  playPowerUp() {
    const ctx = this.getContext();
    
    const notes = [523, 659, 784, 1047];
    
    notes.forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.08);

      const startTime = ctx.currentTime + index * 0.08;
      gainNode.gain.setValueAtTime(0.2, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.15);
    });
  }

  playHit() {
    const ctx = this.getContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(200, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.2);

    gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.2);
  }
}

const soundGenerator = new SoundGenerator();
const musicGenerator = new MusicGenerator();

export const useSoundEffects = () => {
  const playJump = useCallback(() => {
    soundGenerator.playJump();
  }, []);

  const playDoubleJump = useCallback(() => {
    soundGenerator.playDoubleJump();
  }, []);

  const playExplosion = useCallback(() => {
    soundGenerator.playExplosion();
  }, []);

  const playCollect = useCallback(() => {
    soundGenerator.playCollect();
  }, []);

  const playPowerUp = useCallback(() => {
    soundGenerator.playPowerUp();
  }, []);

  const playHit = useCallback(() => {
    soundGenerator.playHit();
  }, []);

  return {
    playJump,
    playDoubleJump,
    playExplosion,
    playCollect,
    playPowerUp,
    playHit
  };
};

export const useBackgroundMusic = (level: LevelMusic) => {
  const musicRef = useRef<LevelMusic>(null);

  useEffect(() => {
    if (level && level !== musicRef.current) {
      musicRef.current = level;
      musicGenerator.playMusic(level);
    }

    return () => {
      musicGenerator.stopMusic();
      musicRef.current = null;
    };
  }, [level]);

  const stopMusic = useCallback(() => {
    musicGenerator.stopMusic();
    musicRef.current = null;
  }, []);

  return { stopMusic };
};

export { soundGenerator, musicGenerator };
