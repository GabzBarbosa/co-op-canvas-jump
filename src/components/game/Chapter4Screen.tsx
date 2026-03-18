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
    <div className="fixed inset-0 bg-[#e8f4f8] flex flex-col items-center justify-center animate-fade-in">
      {/* Snowflake effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <div 
            key={i} 
            className="absolute text-white/40 animate-bounce"
            style={{ 
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              fontSize: `${10 + Math.random() * 15}px`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          >
            ❄️
          </div>
        ))}
      </div>
      
      <div className="text-center space-y-8 animate-scale-in z-10">
        <h1 className="text-6xl font-bold text-blue-600 animate-pulse">
          CHAPTER 4
        </h1>
        
        <h2 className="text-4xl font-semibold text-blue-800">
          🐻‍❄️ Ártico Congelante
        </h2>
        
        {powerupsCollected > 0 && (
          <div className="text-2xl text-blue-500 font-bold animate-bounce">
            🐟 Peixes coletados: {powerupsCollected}
          </div>
        )}
        
        <div className="space-y-4 text-blue-700 max-w-md">
          <p className="text-lg">
            🐻‍❄️ Desvie dos ursos polares!
          </p>
          <p className="text-lg">
            🧊 Pule sobre blocos de gelo
          </p>
          <p className="text-lg">
            🌊 Cuidado com as ondas geladas
          </p>
          <p className="text-lg">
            🐟 Colete peixes para pontos
          </p>
          <p className="text-lg font-semibold text-blue-600">
            🐾 Sobrevivam ao frio intenso!
          </p>
        </div>
        
        <div className="mt-8">
          {countdown > 0 ? (
            <div className="text-8xl font-bold text-blue-600 animate-pulse">
              {countdown}
            </div>
          ) : (
            <div className="text-4xl font-bold text-blue-700 animate-bounce">
              CONGELAR!
            </div>
          )}
        </div>
        
        <div className="text-sm text-blue-500">
          Meta: Percorrer 1300 metros no gelo
        </div>
      </div>
    </div>
  );
};
