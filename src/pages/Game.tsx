import { useState } from "react";
import { TitleScreen } from "@/components/game/TitleScreen";
import { GameCanvas } from "@/components/game/GameCanvas";
import { Chapter2Screen } from "@/components/game/Chapter2Screen";
import { Chapter3Screen } from "@/components/game/Chapter3Screen";
import { Chapter4Screen } from "@/components/game/Chapter4Screen";
import { Chapter5Screen } from "@/components/game/Chapter5Screen";
import { Helmet } from "react-helmet-async";

type GameState = "title" | "playing" | "victory" | "chapter2" | "runner" | "chapter3" | "runner2" | "chapter4" | "runner3" | "chapter5" | "runnerBoss" | "chapter6" | "runner4";

const Game = () => {
  const [gameState, setGameState] = useState<GameState>("title");
  const [gameConfig, setGameConfig] = useState({
    playerCount: 2,
    colors: {} as Record<string, string>,
    startLevel: 1,
    mode: 'platformer' as 'platformer' | 'runner',
    runnerLevel: 1,
    controls: {} as Record<string, number>
  });

  const handleStartGame = (config: { playerCount: number; colors: Record<string, string>; startLevel: number; mode?: 'platformer' | 'runner'; runnerLevel?: number; controls?: Record<string, number> }) => {
    setGameConfig({ 
      ...config, 
      mode: config.mode || 'platformer', 
      runnerLevel: config.runnerLevel || 1,
      controls: config.controls || {}
    });
    if (config.mode === 'runner') {
      if (config.runnerLevel === 5) {
        setGameState("runnerBoss");
      } else if (config.runnerLevel === 4) {
        setGameState("runner4");
      } else if (config.runnerLevel === 3) {
        setGameState("runner3");
      } else if (config.runnerLevel === 2) {
        setGameState("runner2");
      } else {
        setGameState("runner");
      }
    } else {
      setGameState("playing");
    }
  };

  const handleGameVictory = () => {
    // This should only transition to Chapter 2 after boss victory (level 4)
    setGameState("chapter2");
  };

  const handleChapter2Start = () => {
    setGameState("runner");
  };

  const handleRunnerVictory = () => {
    setGameState("chapter3");
  };

  const handleChapter3Start = () => {
    setGameState("runner2");
  };

  const handleRunner2Victory = () => {
    setGameState("chapter4");
  };

  const handleChapter4Start = () => {
    setGameState("runner3");
  };

  const handleRunner3Victory = () => {
    setGameState("chapter5");
  };

  const handleChapter5Start = () => {
    setGameState("runnerBoss");
  };

  const handleRunnerBossVictory = () => {
    setGameState("victory");
  };

  const handleRestart = () => {
    setGameState("title");
  };

  return (
    <>
      <Helmet>
        <title>Malditos Pixels - Teste de Amizade</title>
        <meta name="description" content="Um jogo pixel-art onde a cooperação é tudo. Joguem juntos, morram juntos, vençam juntos (se conseguirem)!" />
        <meta property="og:title" content="Malditos Pixels - Teste de Amizade" />
        <meta property="og:description" content="Um jogo pixel-art onde a cooperação é tudo. Joguem juntos, morram juntos, vençam juntos (se conseguirem)!" />
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
              onLevelComplete={() => {}}
              gameConfig={gameConfig}
              mode="platformer"
            />
          )}
          
          {gameState === "chapter2" && (
            <Chapter2Screen onStart={handleChapter2Start} />
          )}
          
          {gameState === "runner" && (
            <GameCanvas 
              onVictory={handleRunnerVictory}
              onRestart={handleRestart}
              onLevelComplete={() => {}}
              gameConfig={gameConfig}
              mode="runner"
            />
          )}

          {gameState === "chapter3" && (
            <Chapter3Screen onStart={handleChapter3Start} />
          )}
          
          {gameState === "runner2" && (
            <GameCanvas 
              onVictory={handleRunner2Victory}
              onRestart={handleRestart}
              onLevelComplete={() => {}}
              gameConfig={gameConfig}
              mode="runner2"
            />
          )}

          {gameState === "chapter4" && (
            <Chapter4Screen onStart={handleChapter4Start} />
          )}
          
          {gameState === "runner3" && (
            <GameCanvas 
              onVictory={handleRunner3Victory}
              onRestart={handleRestart}
              onLevelComplete={() => {}}
              gameConfig={gameConfig}
              mode="runner3"
            />
          )}

          {gameState === "chapter5" && (
            <Chapter5Screen onStart={handleChapter5Start} />
          )}
          
          {gameState === "runnerBoss" && (
            <GameCanvas 
              onVictory={handleRunnerBossVictory}
              onRestart={handleRestart}
              onLevelComplete={() => {}}
              gameConfig={gameConfig}
              mode="runnerBoss"
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