import { useState } from "react";
import { TitleScreen } from "@/components/game/TitleScreen";
import { GameCanvas } from "@/components/game/GameCanvas";
import { Helmet } from "react-helmet-async";

type GameState = "title" | "playing" | "victory";

const Game = () => {
  const [gameState, setGameState] = useState<GameState>("title");
  const [gameConfig, setGameConfig] = useState({
    playerCount: 2,
    colors: {} as Record<string, string>
  });

  const handleStartGame = (config: { playerCount: number; colors: Record<string, string> }) => {
    setGameConfig(config);
    setGameState("playing");
  };

  const handleGameVictory = () => {
    setGameState("victory");
  };

  const handleRestart = () => {
    setGameState("title");
  };

  return (
    <>
      <Helmet>
        <title>Pixel Pals - Cooperative Platformer</title>
        <meta name="description" content="A cozy 2-player pixel-art platformer where teamwork is everything. Play together, restart together, win together!" />
        <meta property="og:title" content="Pixel Pals - Cooperative Platformer" />
        <meta property="og:description" content="A cozy 2-player pixel-art platformer where teamwork is everything. Play together, restart together, win together!" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-game-bg flex items-center justify-center p-4">
        <div className="w-full max-w-6xl">
          {gameState === "title" && (
            <TitleScreen onStartGame={handleStartGame} />
          )}
          
          {gameState === "playing" && (
            <GameCanvas 
              onVictory={handleGameVictory}
              onRestart={handleRestart}
              onLevelComplete={() => {}} // Level progression handled internally in GameCanvas
              gameConfig={gameConfig}
            />
          )}
          
          {gameState === "victory" && (
            <TitleScreen 
              onStartGame={handleStartGame}
              showVictory={true}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Game;