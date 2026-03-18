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
    <div className="fixed inset-0 bg-[#2a1a00] flex flex-col items-center justify-center animate-fade-in">
      <div className="text-center space-y-8 animate-scale-in">
        <h1 className="text-6xl font-bold text-amber-400 animate-pulse">
          CHAPTER 2
        </h1>
        
        <h2 className="text-4xl font-semibold text-yellow-300">
          🦁 Savana Selvagem
        </h2>
        
        <div className="space-y-4 text-amber-200 max-w-md">
          <p className="text-lg">
            🦁 Cuidado com os leões famintos!
          </p>
          <p className="text-lg">
            🦏 Desvie dos rinocerontes furiosos
          </p>
          <p className="text-lg">
            🦅 Abaixe-se para evitar as águias
          </p>
          <p className="text-lg font-semibold text-amber-400">
            🐾 Corram juntos pela savana!
          </p>
        </div>
        
        <div className="mt-8">
          {countdown > 0 ? (
            <div className="text-8xl font-bold text-amber-400 animate-pulse">
              {countdown}
            </div>
          ) : (
            <div className="text-4xl font-bold text-yellow-300 animate-bounce">
              RUGIR!
            </div>
          )}
        </div>
        
        <div className="text-sm text-amber-200/70">
          Meta: Percorrer 1300 metros pela savana
        </div>
      </div>
    </div>
  );
};
