import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";

interface TitleScreenProps {
  onStartGame: (colors: { player1: string; player2: string }) => void;
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
  const [selectedColors, setSelectedColors] = useState({
    player1: "#2ECC71",
    player2: "#3498DB"
  });

  const handleColorSelect = (player: "player1" | "player2", color: string) => {
    setSelectedColors(prev => ({
      ...prev,
      [player]: color
    }));
  };

  const handleStartGame = () => {
    onStartGame(selectedColors);
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

      <Card className="bg-card/90 p-8 mb-8 border-2 border-primary max-w-2xl">
        <div className="grid md:grid-cols-2 gap-6 text-left">
          <div>
            <h3 className="text-lg font-bold mb-2" style={{ color: selectedColors.player1 }}>Player 1</h3>
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Choose Color:</p>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {playerColors.map((color) => (
                  <button
                    key={`p1-${color.value}`}
                    className={`w-8 h-8 rounded border-2 hover:scale-110 transition-transform ${
                      selectedColors.player1 === color.value ? 'border-white border-4' : 'border-gray-400'
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => handleColorSelect("player1", color.value)}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-1 text-sm">
              <div><kbd className="px-2 py-1 rounded text-white" style={{ backgroundColor: selectedColors.player1 }}>A</kbd> Move Left</div>
              <div><kbd className="px-2 py-1 rounded text-white" style={{ backgroundColor: selectedColors.player1 }}>D</kbd> Move Right</div>
              <div><kbd className="px-2 py-1 rounded text-white" style={{ backgroundColor: selectedColors.player1 }}>W</kbd> Jump</div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-2" style={{ color: selectedColors.player2 }}>Player 2</h3>
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Choose Color:</p>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {playerColors.map((color) => (
                  <button
                    key={`p2-${color.value}`}
                    className={`w-8 h-8 rounded border-2 hover:scale-110 transition-transform ${
                      selectedColors.player2 === color.value ? 'border-white border-4' : 'border-gray-400'
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => handleColorSelect("player2", color.value)}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-1 text-sm">
              <div><kbd className="px-2 py-1 rounded text-white" style={{ backgroundColor: selectedColors.player2 }}>←</kbd> Move Left</div>
              <div><kbd className="px-2 py-1 rounded text-white" style={{ backgroundColor: selectedColors.player2 }}>→</kbd> Move Right</div>
              <div><kbd className="px-2 py-1 rounded text-white" style={{ backgroundColor: selectedColors.player2 }}>↑</kbd> Jump</div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-muted rounded border-l-4 border-accent">
          <h4 className="font-bold text-accent mb-2">Cooperative Rules:</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Both players must reach the golden goal area to win</li>
            <li>• If either player touches red obstacles, both restart</li>
            <li>• Work together - some platforms require teamwork!</li>
            <li>• Communication is key to success</li>
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