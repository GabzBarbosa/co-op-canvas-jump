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
    <div className="fixed inset-0 bg-[#0a0a1a] flex flex-col items-center justify-center animate-fade-in">
      {/* Scanline effect */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        {Array.from({ length: 100 }).map((_, i) => (
          <div key={i} className="w-full h-[2px] bg-green-500/20" style={{ marginTop: i * 4 }} />
        ))}
      </div>
      
      <div className="text-center space-y-8 animate-scale-in z-10">
        <h1 className="text-6xl font-bold text-green-400 animate-pulse font-mono">
          CHAPTER 3
        </h1>
        
        <h2 className="text-4xl font-semibold text-cyan-400 font-mono">
          Glitch Digital
        </h2>
        
        {coinsCollected > 0 && (
          <div className="text-2xl text-cyan-300 font-bold animate-bounce font-mono">
            💾 Dados coletados: {coinsCollected} bytes
          </div>
        )}
        
        <div className="space-y-4 text-gray-300 max-w-md font-mono">
          <p className="text-lg">
            🦠 Cuidado com os vírus digitais!
          </p>
          <p className="text-lg">
            🔥 Desvie das firewalls
          </p>
          <p className="text-lg">
            🐛 Evite os bugs do sistema
          </p>
          <p className="text-lg">
            💾 Colete pacotes de dados
          </p>
          <p className="text-lg font-semibold text-green-400">
            🤝 Trabalhem juntos para hackear o sistema!
          </p>
        </div>
        
        <div className="mt-8">
          {countdown > 0 ? (
            <div className="text-8xl font-bold text-green-400 animate-pulse font-mono">
              {countdown}
            </div>
          ) : (
            <div className="text-4xl font-bold text-cyan-400 animate-bounce font-mono">
              SYSTEM BREACH!
            </div>
          )}
        </div>
        
        <div className="text-sm text-gray-400 font-mono">
          Meta: Percorrer 1300 metros de dados
        </div>
      </div>
      
      {/* Random glitch effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-2 bg-red-500/30 animate-pulse" />
        <div className="absolute top-1/2 right-1/3 w-24 h-1 bg-cyan-500/40 animate-pulse" />
        <div className="absolute bottom-1/3 left-1/2 w-40 h-2 bg-green-500/20 animate-pulse" />
      </div>
    </div>
  );
};
