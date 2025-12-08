import { useEffect, useState } from "react";

interface Chapter4ScreenProps {
  onStart: () => void;
  powerupsCollected?: number;
}

export const Chapter4Screen = ({ onStart, powerupsCollected = 0 }: Chapter4ScreenProps) => {
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
        <h1 className="text-6xl font-bold text-orange-500 animate-pulse">
          CHAPTER 4
        </h1>
        
        <h2 className="text-4xl font-semibold text-foreground">
          Bomberman's Arena!
        </h2>
        
        {powerupsCollected > 0 && (
          <div className="text-2xl text-orange-400 font-bold animate-bounce">
            ⚡ Power-ups coletados: {powerupsCollected}
          </div>
        )}
        
        <div className="space-y-4 text-muted-foreground max-w-md">
          <p className="text-lg">
            💣 Arena inspirada em Bomberman!
          </p>
          <p className="text-lg">
            🔥 Desvie das explosões e chamas
          </p>
          <p className="text-lg">
            🧱 Pule sobre caixotes e tijolos
          </p>
          <p className="text-lg">
            ⚡ Colete power-ups para pontos
          </p>
          <p className="text-lg font-semibold text-orange-500">
            🤝 Sobrevivam juntos nessa arena!
          </p>
        </div>
        
        <div className="mt-8">
          {countdown > 0 ? (
            <div className="text-8xl font-bold text-orange-500 animate-pulse">
              {countdown}
            </div>
          ) : (
            <div className="text-4xl font-bold text-orange-500 animate-bounce">
              BOOM TIME!
            </div>
          )}
        </div>
        
        <div className="text-sm text-muted-foreground">
          Meta: Percorrer 900 metros sem explodir
        </div>
      </div>
    </div>
  );
};