import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";

interface TitleScreenProps {
  onStartGame: (config: { playerCount: number; colors: Record<string, string> }) => void;
  showVictory?: boolean;
}

const playerColors = [
  { name: "Green", value: "#2ECC71" },
  { name: "Blue", value: "#3498DB" },
  { name: "Red", value: "#E74C3C" },
  { name: "Purple", value: "#9B59B6" },
  { name: "Orange", value: "#F39C12" },
  { name: "Pink", value: "#E91E63" },
  { name: "Cyan", value: "#1ABC9C" },
  { name: "Yellow", value: "#F1C40F" },
];

export const TitleScreen = ({ onStartGame, showVictory = false }: TitleScreenProps) => {
  const [playerCount, setPlayerCount] = useState(2);
  const [selectedColors, setSelectedColors] = useState({
    player1: "#2ECC71",
    player2: "#3498DB",
    player3: "#E74C3C",
    player4: "#9B59B6"
  });

  const handleColorSelect = (player: string, color: string) => {
    setSelectedColors(prev => ({
      ...prev,
      [player]: color
    }));
  };

  const handleStartGame = () => {
    const colors = Object.fromEntries(
      Array.from({ length: playerCount }, (_, i) => [
        `player${i + 1}`,
        selectedColors[`player${i + 1}` as keyof typeof selectedColors]
      ])
    );
    onStartGame({ playerCount, colors });
  };

  const getPlayerControls = (playerIndex: number) => {
    const controls = [
      { keys: ['A', 'D', 'W'], labels: ['Move Left', 'Move Right', 'Jump'] },
      { keys: ['←', '→', '↑'], labels: ['Move Left', 'Move Right', 'Jump'] },
      { keys: ['J', 'L', 'I'], labels: ['Move Left', 'Move Right', 'Jump'] },
      { keys: ['Num4', 'Num6', 'Num8'], labels: ['Move Left', 'Move Right', 'Jump'] }
    ];
    return controls[playerIndex] || controls[0];
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center pixel-perfect">
      <div className="mb-8">
        <h1 className={`text-6xl font-bold mb-4 ${showVictory ? 'animate-victory-glow text-game-goal' : 'text-primary'}`}>
          PIXEL PALS
        </h1>
        <p className="text-xl text-muted-foreground">
          {showVictory ? "🎉 Level Complete! Amazing teamwork! 🎉" : "A Cooperative Platformer Adventure"}
        </p>
      </div>

      <Card className="bg-card/90 p-8 mb-8 border-2 border-primary max-w-4xl">
        {/* Player Count Selection */}
        <div className="mb-6 text-center">
          <h3 className="text-lg font-bold mb-4 text-primary">Number of Players</h3>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4].map((count) => (
              <button
                key={count}
                className={`px-4 py-2 rounded border-2 font-bold transition-all ${
                  playerCount === count 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'bg-card border-border hover:border-primary'
                }`}
                onClick={() => setPlayerCount(count)}
              >
                {count} Player{count > 1 ? 's' : ''}
              </button>
            ))}
          </div>
        </div>

        <div className={`grid gap-6 text-left ${
          playerCount === 1 ? 'grid-cols-1 max-w-md mx-auto' :
          playerCount === 2 ? 'md:grid-cols-2' :
          playerCount === 3 ? 'md:grid-cols-3' :
          'md:grid-cols-2 lg:grid-cols-4'
        }`}>
          {Array.from({ length: playerCount }, (_, index) => {
            const playerKey = `player${index + 1}` as keyof typeof selectedColors;
            const controls = getPlayerControls(index);
            
            return (
              <div key={playerKey}>
                <h3 className="text-lg font-bold mb-2" style={{ color: selectedColors[playerKey] }}>
                  Player {index + 1}
                </h3>
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Choose Color:</p>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {playerColors.map((color) => (
                      <button
                        key={`${playerKey}-${color.value}`}
                        className={`w-8 h-8 rounded border-2 hover:scale-110 transition-transform ${
                          selectedColors[playerKey] === color.value ? 'border-white border-4' : 'border-gray-400'
                        }`}
                        style={{ backgroundColor: color.value }}
                        onClick={() => handleColorSelect(playerKey, color.value)}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  {controls.keys.map((key, keyIndex) => (
                    <div key={keyIndex}>
                      <kbd className="px-2 py-1 rounded text-white text-xs" style={{ backgroundColor: selectedColors[playerKey] }}>
                        {key}
                      </kbd> {controls.labels[keyIndex]}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-muted rounded border-l-4 border-accent">
          <h4 className="font-bold text-accent mb-2">
            {playerCount === 1 ? 'Solo Challenge Rules:' : 'Cooperative Rules:'}
          </h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            {playerCount === 1 ? (
              <>
                <li>• Navigate through all levels on your own</li>
                <li>• Avoid red obstacles or restart the level</li>
                <li>• Collect power-ups to gain advantages</li>
                <li>• Master precise jumps and timing</li>
              </>
            ) : (
              <>
                <li>• All players must reach the golden goal area to win</li>
                <li>• If any player touches red obstacles, everyone restarts</li>
                <li>• Work together - some platforms require teamwork!</li>
                <li>• Communication is key to success</li>
              </>
            )}
          </ul>
        </div>
      </Card>

      <Button 
        onClick={handleStartGame}
        size="lg"
        className="text-xl px-8 py-4 bg-primary hover:bg-primary/90 border-2 border-primary-foreground font-bold animate-pixel-bounce"
      >
        {showVictory ? "Play Again" : "Start Adventure"}
      </Button>

      <p className="text-xs text-muted-foreground mt-4">
        Made with ❤️ for cooperative gaming
      </p>
    </div>
  );
};