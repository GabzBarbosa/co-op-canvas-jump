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
    <div className="fixed inset-0 bg-[#1a0000] flex flex-col items-center justify-center animate-fade-in">
      {/* Lava particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 15 }).map((_, i) => (
          <div 
            key={i} 
            className="absolute rounded-full animate-pulse"
            style={{ 
              left: `${Math.random() * 100}%`,
              bottom: `${Math.random() * 30}%`,
              width: `${5 + Math.random() * 15}px`,
              height: `${5 + Math.random() * 15}px`,
              backgroundColor: `rgba(255, ${Math.floor(50 + Math.random() * 100)}, 0, 0.4)`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      
      <div className="text-center space-y-8 animate-scale-in z-10">
        <h1 className="text-6xl font-bold text-red-500 animate-pulse">
          CHAPTER 5
        </h1>
        
        <h2 className="text-4xl font-semibold text-orange-400">
          🌋 Vulcão do Dragão Ancião!
        </h2>
        
        <div className="space-y-4 text-orange-200 max-w-md">
          <p className="text-lg">
            🌋 Todos os biomas se fundiram!
          </p>
          <p className="text-lg text-amber-400">
            🦁 Predadores da savana
          </p>
          <p className="text-lg text-cyan-400">
            🦈 Criaturas do oceano
          </p>
          <p className="text-lg text-blue-300">
            🐻‍❄️ Feras do ártico
          </p>
          <p className="text-lg font-semibold text-red-500">
            🐉 ENFRENTEM O DRAGÃO ANCIÃO!
          </p>
        </div>
        
        <div className="mt-8">
          {countdown > 0 ? (
            <div className="text-8xl font-bold text-red-500 animate-pulse">
              {countdown}
            </div>
          ) : (
            <div className="text-4xl font-bold text-orange-400 animate-bounce">
              RUGIR!
            </div>
          )}
        </div>
        
        <div className="text-sm text-orange-300/70">
          Meta: Derrotar o Dragão Ancião!
        </div>
      </div>
    </div>
  );
};
