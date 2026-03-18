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
    <div className="fixed inset-0 bg-[#001a33] flex flex-col items-center justify-center animate-fade-in">
      {/* Water bubbles effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div 
            key={i} 
            className="absolute rounded-full bg-cyan-400/10 animate-pulse"
            style={{ 
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${10 + Math.random() * 20}px`,
              height: `${10 + Math.random() * 20}px`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      
      <div className="text-center space-y-8 animate-scale-in z-10">
        <h1 className="text-6xl font-bold text-cyan-400 animate-pulse">
          CHAPTER 3
        </h1>
        
        <h2 className="text-4xl font-semibold text-blue-300">
          🦈 Fundo do Oceano
        </h2>
        
        {coinsCollected > 0 && (
          <div className="text-2xl text-cyan-300 font-bold animate-bounce">
            🐚 Conchas coletadas: {coinsCollected}
          </div>
        )}
        
        <div className="space-y-4 text-blue-200 max-w-md">
          <p className="text-lg">
            🦈 Cuidado com os tubarões!
          </p>
          <p className="text-lg">
            🪸 Desvie dos corais venenosos
          </p>
          <p className="text-lg">
            🐙 Evite os tentáculos do polvo
          </p>
          <p className="text-lg">
            🐚 Colete conchas e pérolas
          </p>
          <p className="text-lg font-semibold text-cyan-400">
            🐾 Nadem juntos pelas profundezas!
          </p>
        </div>
        
        <div className="mt-8">
          {countdown > 0 ? (
            <div className="text-8xl font-bold text-cyan-400 animate-pulse">
              {countdown}
            </div>
          ) : (
            <div className="text-4xl font-bold text-blue-300 animate-bounce">
              MERGULHAR!
            </div>
          )}
        </div>
        
        <div className="text-sm text-blue-300/70">
          Meta: Percorrer 1300 metros nas profundezas
        </div>
      </div>
    </div>
  );
};
