import { useEffect, useRef, useState, useCallback } from "react";
import { GameController } from "./GameController";
import { RunnerGameController } from "./RunnerGameController";
import { Button } from "@/components/ui/button";

interface GameCanvasProps {
  onVictory: () => void;
  onRestart: () => void;
  onLevelComplete: () => void;
  gameConfig: { playerCount: number; colors: Record<string, string>; startLevel: number };
  mode?: "platformer" | "runner";
}

export const GameCanvas = ({ onVictory, onRestart, onLevelComplete, gameConfig, mode = "platformer" }: GameCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameControllerRef = useRef<GameController | RunnerGameController | null>(null);
  const [showDeathOverlay, setShowDeathOverlay] = useState(false);
  const [showVictoryOverlay, setShowVictoryOverlay] = useState(false);
  const [showLevelCompleteOverlay, setShowLevelCompleteOverlay] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);

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

  const handleLevelComplete = useCallback(() => {
    setShowLevelCompleteOverlay(true);
  }, []);

  const handleContinueToNextLevel = () => {
    setShowLevelCompleteOverlay(false);
    if (gameControllerRef.current && 'nextLevel' in gameControllerRef.current) {
      if ((gameControllerRef.current as GameController).nextLevel()) {
        const newLevel = (gameControllerRef.current as GameController).getCurrentLevelNumber();
        setCurrentLevel(newLevel);
      }
    }
  };

  const handleQuickRestart = () => {
    gameControllerRef.current?.restartLevel();
    if (gameControllerRef.current && 'getCurrentLevelNumber' in gameControllerRef.current) {
      setCurrentLevel((gameControllerRef.current as GameController).getCurrentLevelNumber() || 1);
    }
  };

  const handleFullRestart = () => {
    if (gameControllerRef.current && 'resetToLevel1' in gameControllerRef.current) {
      (gameControllerRef.current as GameController).resetToLevel1();
      setCurrentLevel(1);
    }
    onRestart();
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

    // Initialize game controller based on mode
    if (mode === "runner") {
      gameControllerRef.current = new RunnerGameController(canvas, ctx, {
        onPlayerDeath: handlePlayerDeath,
        onVictory: handleVictory,
      }, gameConfig);
    } else {
      gameControllerRef.current = new GameController(canvas, ctx, {
        onPlayerDeath: handlePlayerDeath,
        onVictory: handleVictory,
        onLevelComplete: handleLevelComplete,
      }, gameConfig);
    }

    gameControllerRef.current.start();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      gameControllerRef.current?.stop();
    };
  }, [handlePlayerDeath, handleVictory, handleLevelComplete, gameConfig, mode]);

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
          <div className="text-primary font-bold">
            {mode === "runner" ? "CHAPTER 2: RUN FOR YOUR LIFE!" : 
             currentLevel === 4 ? "BOSS FIGHT" : `Inferno ${currentLevel}`}
          </div>
          {mode === "runner" && gameControllerRef.current && (
            <div className="text-white font-bold">
              {(gameControllerRef.current as RunnerGameController).getDistanceProgress?.()?.current || 0}m / {(gameControllerRef.current as RunnerGameController).getDistanceProgress?.()?.target || 500}m
            </div>
          )}
          {mode === "platformer" && (currentLevel === 1 || currentLevel === 2 || currentLevel === 3) && (
            <div className="text-game-danger font-bold">
              Assassinos: {(gameControllerRef.current as GameController)?.getDifficultyInfo?.()?.enemyCount || 0}
            </div>
          )}
          {mode === "platformer" && currentLevel === 3 && gameControllerRef.current && gameConfig.playerCount <= 2 && (
            <div className="text-xs space-y-1">
              <div>P1: {(gameControllerRef.current as GameController).player1?.speedBoostTimer > 0 ? "⚡SPEED" : ""} {(gameControllerRef.current as GameController).player1?.hasShield ? "🛡️SHIELD" : ""}</div>
              {gameConfig.playerCount > 1 && <div>P2: {(gameControllerRef.current as GameController).player2?.speedBoostTimer > 0 ? "⚡SPEED" : ""} {(gameControllerRef.current as GameController).player2?.hasShield ? "🛡️SHIELD" : ""}</div>}
            </div>
          )}
          {mode === "platformer" && currentLevel === 4 && (
            <div className="text-xs text-yellow-400 font-bold animate-pulse">
              Pisar nos botões VERMELHOS JUNTOS para atacar o boss!
            </div>
          )}
          <div className="flex items-center gap-3">
            {Array.from({ length: gameConfig.playerCount }, (_, i) => (
              <div key={i} className="flex items-center gap-1">
                <div 
                  className="w-3 h-3 rounded" 
                  style={{ backgroundColor: gameConfig.colors[`player${i + 1}`] }}
                ></div>
                <span className="text-xs">P{i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Controls hint */}
      <div className="absolute top-4 right-4 bg-card/90 p-3 rounded border border-border text-xs">
        {mode === "runner" ? (
          <div className="text-center">
            <div className="text-white font-bold mb-1">CONTROLES:</div>
            <div>↑ PULAR  ↓ ABAIXAR</div>
            <div className="text-yellow-400 text-xs mt-1">Todos devem sobreviver!</div>
          </div>
        ) : (
          <div className={`grid gap-2 ${
            gameConfig.playerCount === 1 ? 'grid-cols-1' :
            gameConfig.playerCount === 2 ? 'grid-cols-2' :
            gameConfig.playerCount === 3 ? 'grid-cols-3' :
            'grid-cols-2'
          }`}>
            {Array.from({ length: gameConfig.playerCount }, (_, i) => {
              const controls = [
                { keys: ['A', 'D', 'W'], color: gameConfig.colors[`player${i + 1}`] },
                { keys: ['←', '→', '↑'], color: gameConfig.colors[`player${i + 1}`] },
                { keys: ['J', 'L', 'I'], color: gameConfig.colors[`player${i + 1}`] },
                { keys: ['4', '6', '8'], color: gameConfig.colors[`player${i + 1}`] }
              ];
              const playerControls = controls[i] || controls[0];
              
              return (
                <div key={i}>
                  <span className="font-bold" style={{ color: playerControls.color }}>P{i + 1}:</span>
                  <span className="ml-1">{playerControls.keys.join('/')}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Restart Button */}
      <div className="absolute bottom-4 right-4">
        <Button
          onClick={handleQuickRestart}
          variant="outline"
          size="sm"
          className="bg-card/90"
        >
          Recomeçar Tortura
        </Button>
      </div>

      {/* Exit Button */}
      <div className="absolute bottom-4 left-4">
        <Button
          onClick={handleFullRestart}
          variant="outline"
          size="sm"
          className="bg-card/90"
        >
          Desistir (Covardia)
        </Button>
      </div>

      {/* Death Overlay */}
      {showDeathOverlay && (
        <div className="absolute inset-0 bg-game-danger/80 flex items-center justify-center z-50">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-2">QUE SURPRESA!</h2>
            <p className="text-white text-lg">Preparando sua próxima humilhação...</p>
          </div>
        </div>
      )}

      {/* Level Complete Overlay */}
      {showLevelCompleteOverlay && (
        <div className="absolute inset-0 bg-gradient-victory/90 flex items-center justify-center z-50">
          <div className="text-center animate-victory-glow">
            <h2 className="text-5xl font-bold text-white mb-4">INFERNO {currentLevel} CONQUISTADO!</h2>
            <p className="text-white text-lg mb-6">
              {gameConfig.playerCount === 1 ? 
                (currentLevel === 1 ? "Preparado para o Inferno 2 com inimigos móveis?" : 
                 currentLevel === 2 ? "Pronto para o Inferno 3 com power-ups e plataformas traiçoeiras?" :
                 "Chegou a hora do BOSS FIGHT final! Vocês precisarão cooperar REALMENTE para vencer!") :
                (currentLevel === 1 ? "Preparados para o Inferno 2 com assassinos móveis?" : 
                 currentLevel === 2 ? "Prontos para o Inferno 3 com power-ups e plataformas?" :
                 "Chegou a hora do BOSS FIGHT final! Ambos devem pisar nos botões ao mesmo tempo!")
              }
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={handleContinueToNextLevel}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg"
              >
                {currentLevel === 3 ? "ENFRENTAR O BOSS!" : "Continuar Sofrendo"}
              </Button>
              <Button
                onClick={handleFullRestart}
                variant="outline" 
                className="bg-white/10 hover:bg-white/20 text-white border-white/30 px-8 py-3 text-lg"
              >
                Fugir Covardemente
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Victory Overlay */}
      {showVictoryOverlay && (
        <div className="absolute inset-0 bg-gradient-victory/90 flex items-center justify-center z-50">
        <div className="text-center animate-victory-glow">
          <h2 className="text-6xl font-bold text-white mb-4">BOSS DERROTADO!</h2>
          <p className="text-white text-xl mb-4">
            {gameConfig.playerCount === 1 ? 
              "Impossível! Você realmente derrotou o boss sozinho nos quatro infernos!" : 
              "INCRÍVEL! A cooperação perfeita de vocês derrotou o boss final!"}
          </p>
          <p className="text-white text-lg">
            🏆 PARABÉNS, MESTRES DOS MALDITOS PIXELS! 🏆
          </p>
        </div>
        </div>
      )}
    </div>
  );
};