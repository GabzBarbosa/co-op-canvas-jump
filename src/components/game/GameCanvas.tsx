import { useEffect, useRef, useState, useCallback } from "react";
import { GameController } from "./GameController";
import { Button } from "@/components/ui/button";

interface GameCanvasProps {
  onVictory: () => void;
  onRestart: () => void;
}

export const GameCanvas = ({ onVictory, onRestart }: GameCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameControllerRef = useRef<GameController | null>(null);
  const [showDeathOverlay, setShowDeathOverlay] = useState(false);
  const [showVictoryOverlay, setShowVictoryOverlay] = useState(false);

  const handlePlayerDeath = useCallback(() => {
    setShowDeathOverlay(true);
    setTimeout(() => {
      setShowDeathOverlay(false);
      gameControllerRef.current?.restartLevel();
    }, 800);
  }, []);

  const handleVictory = useCallback(() => {
    setShowVictoryOverlay(true);
    setTimeout(() => {
      setShowVictoryOverlay(false);
      onVictory();
    }, 2000);
  }, [onVictory]);

  const handleQuickRestart = () => {
    gameControllerRef.current?.restartLevel();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size - maintaining 16:9 aspect ratio for pixel art
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (!container) return;

      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      const aspectRatio = 16 / 9;

      let canvasWidth = containerWidth;
      let canvasHeight = containerWidth / aspectRatio;

      if (canvasHeight > containerHeight) {
        canvasHeight = containerHeight;
        canvasWidth = containerHeight * aspectRatio;
      }

      // Ensure pixel-perfect scaling
      const scale = Math.max(1, Math.floor(Math.min(canvasWidth / 800, canvasHeight / 450)));
      canvas.width = 800;
      canvas.height = 450;
      canvas.style.width = `${800 * scale}px`;
      canvas.style.height = `${450 * scale}px`;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Disable image smoothing for pixel-perfect rendering
    ctx.imageSmoothingEnabled = false;

    // Initialize game controller
    gameControllerRef.current = new GameController(canvas, ctx, {
      onPlayerDeath: handlePlayerDeath,
      onVictory: handleVictory,
    });

    gameControllerRef.current.start();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      gameControllerRef.current?.stop();
    };
  }, [handlePlayerDeath, handleVictory]);

  return (
    <div className="relative w-full h-screen flex items-center justify-center bg-game-background">
      {/* Game Canvas */}
      <canvas
        ref={canvasRef}
        className="border-4 border-primary pixel-perfect bg-game-background"
        tabIndex={0}
      />

      {/* HUD */}
      <div className="absolute top-4 left-4 bg-card/90 p-3 rounded border border-border">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-game-player1 rounded"></div>
            <span>Player 1</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-game-player2 rounded"></div>
            <span>Player 2</span>
          </div>
        </div>
      </div>

      {/* Controls hint */}
      <div className="absolute top-4 right-4 bg-card/90 p-3 rounded border border-border text-xs">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-game-player1 font-bold">P1:</span> WASD
          </div>
          <div>
            <span className="text-game-player2 font-bold">P2:</span> Arrow Keys
          </div>
        </div>
      </div>

      {/* Quick Restart Button */}
      <div className="absolute bottom-4 right-4">
        <Button
          onClick={handleQuickRestart}
          variant="outline"
          size="sm"
          className="bg-card/90"
        >
          Restart Level
        </Button>
      </div>

      {/* Exit Button */}
      <div className="absolute bottom-4 left-4">
        <Button
          onClick={onRestart}
          variant="outline"
          size="sm"
          className="bg-card/90"
        >
          Exit to Menu
        </Button>
      </div>

      {/* Death Overlay */}
      {showDeathOverlay && (
        <div className="absolute inset-0 bg-game-danger/80 flex items-center justify-center z-50">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-2">OOPS!</h2>
            <p className="text-white text-lg">Restarting level...</p>
          </div>
        </div>
      )}

      {/* Victory Overlay */}
      {showVictoryOverlay && (
        <div className="absolute inset-0 bg-gradient-victory/90 flex items-center justify-center z-50">
          <div className="text-center animate-victory-glow">
            <h2 className="text-6xl font-bold text-white mb-4">VICTORY!</h2>
            <p className="text-white text-xl">Amazing teamwork!</p>
          </div>
        </div>
      )}
    </div>
  );
};