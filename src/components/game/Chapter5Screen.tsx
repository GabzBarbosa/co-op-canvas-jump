import { useEffect, useState } from "react";

interface Chapter5ScreenProps {
  onStart: () => void;
}

export const Chapter5Screen = ({ onStart }: Chapter5ScreenProps) => {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimeout(onStart, 500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onStart]);

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center animate-fade-in">
      <div className="text-center space-y-8 animate-scale-in">
        <h1 className="text-6xl font-bold text-red-500 animate-pulse">
          CHAPTER 5
        </h1>
        
        <h2 className="text-4xl font-semibold text-foreground">
          THE ULTIMATE BOSS!
        </h2>
        
        <div className="space-y-4 text-muted-foreground max-w-md">
          <p className="text-lg">
            🌀 Todos os 3 mundos se fundiram!
          </p>
          <p className="text-lg text-green-400">
            🏃 Assassinos da floresta
          </p>
          <p className="text-lg text-blue-400">
            🍄 Inimigos do mundo Mario
          </p>
          <p className="text-lg text-orange-400">
            💣 Explosões do Bomberman
          </p>
          <p className="text-lg font-semibold text-red-500">
            👹 ENFRENTEM O CHEFÃO FINAL!
          </p>
        </div>
        
        <div className="mt-8">
          {countdown > 0 ? (
            <div className="text-8xl font-bold text-red-500 animate-pulse">
              {countdown}
            </div>
          ) : (
            <div className="text-4xl font-bold text-red-500 animate-bounce">
              FIGHT!
            </div>
          )}
        </div>
        
        <div className="text-sm text-muted-foreground">
          Meta: Derrotar o boss coletando power-ups e sobrevivendo!
        </div>
      </div>
    </div>
  );
};
