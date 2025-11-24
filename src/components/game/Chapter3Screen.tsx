import { useEffect, useState } from "react";

interface Chapter3ScreenProps {
  onStart: () => void;
  coinsCollected?: number;
}

export const Chapter3Screen = ({ onStart, coinsCollected = 0 }: Chapter3ScreenProps) => {
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
        <h1 className="text-6xl font-bold text-primary animate-pulse">
          CHAPTER 3
        </h1>
        
        <h2 className="text-4xl font-semibold text-foreground">
          Mario's World!
        </h2>
        
        {coinsCollected > 0 && (
          <div className="text-2xl text-yellow-500 font-bold animate-bounce">
            🪙 Moedas coletadas: {coinsCollected}
          </div>
        )}
        
        <div className="space-y-4 text-muted-foreground max-w-md">
          <p className="text-lg">
            🌟 Mundo inspirado em Mario!
          </p>
          <p className="text-lg">
            🟢 Pulem sobre canos verdes
          </p>
          <p className="text-lg">
            🪙 Coletem moedas no caminho
          </p>
          <p className="text-lg">
            🍄 Cuidado com os Goombas!
          </p>
          <p className="text-lg font-semibold text-primary">
            🤝 Trabalhem juntos para vencer!
          </p>
        </div>
        
        <div className="mt-8">
          {countdown > 0 ? (
            <div className="text-8xl font-bold text-primary animate-pulse">
              {countdown}
            </div>
          ) : (
            <div className="text-4xl font-bold text-primary animate-bounce">
              LET'S-A GO!
            </div>
          )}
        </div>
        
        <div className="text-sm text-muted-foreground">
          Meta: Percorrer 800 metros
        </div>
      </div>
    </div>
  );
};
