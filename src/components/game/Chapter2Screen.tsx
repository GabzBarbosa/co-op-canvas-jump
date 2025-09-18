import { useEffect, useState } from "react";

interface Chapter2ScreenProps {
  onStart: () => void;
}

export const Chapter2Screen = ({ onStart }: Chapter2ScreenProps) => {
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
          CHAPTER 2
        </h1>
        
        <h2 className="text-4xl font-semibold text-foreground">
          Run for your Life!
        </h2>
        
        <div className="space-y-4 text-muted-foreground max-w-md">
          <p className="text-lg">
            🏃‍♂️ Corram automaticamente para a direita
          </p>
          <p className="text-lg">
            ⬆️ Pulem sobre obstáculos
          </p>
          <p className="text-lg">
            ⬇️ Abaixem-se para evitar perigos
          </p>
          <p className="text-lg font-semibold text-primary">
            🤝 Cooperem para sobreviver!
          </p>
        </div>
        
        <div className="mt-8">
          {countdown > 0 ? (
            <div className="text-8xl font-bold text-primary animate-pulse">
              {countdown}
            </div>
          ) : (
            <div className="text-4xl font-bold text-primary animate-bounce">
              GO!
            </div>
          )}
        </div>
        
        <div className="text-sm text-muted-foreground">
          Meta: Percorrer 500 metros
        </div>
      </div>
    </div>
  );
};