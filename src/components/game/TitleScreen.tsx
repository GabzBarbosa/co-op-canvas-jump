import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface TitleScreenProps {
  onStartGame: () => void;
  showVictory?: boolean;
}

export const TitleScreen = ({ onStartGame, showVictory = false }: TitleScreenProps) => {
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
            <h3 className="text-lg font-bold text-game-player1 mb-2">Player 1 (Green)</h3>
            <div className="space-y-1 text-sm">
              <div><kbd className="bg-game-player1 text-background px-2 py-1 rounded">A</kbd> Move Left</div>
              <div><kbd className="bg-game-player1 text-background px-2 py-1 rounded">D</kbd> Move Right</div>
              <div><kbd className="bg-game-player1 text-background px-2 py-1 rounded">W</kbd> Jump</div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-game-player2 mb-2">Player 2 (Blue)</h3>
            <div className="space-y-1 text-sm">
              <div><kbd className="bg-game-player2 text-background px-2 py-1 rounded">←</kbd> Move Left</div>
              <div><kbd className="bg-game-player2 text-background px-2 py-1 rounded">→</kbd> Move Right</div>
              <div><kbd className="bg-game-player2 text-background px-2 py-1 rounded">↑</kbd> Jump</div>
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
        onClick={onStartGame}
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