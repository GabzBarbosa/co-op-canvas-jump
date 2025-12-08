import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";

interface TitleScreenProps {
  onStartGame: (config: { playerCount: number; colors: Record<string, string>; startLevel: number; mode?: 'platformer' | 'runner'; runnerLevel?: number; controls?: Record<string, number> }) => void;
  showVictory?: boolean;
}

const controlSchemes = [
  { id: 0, name: 'WASD', keys: ['A', 'D', 'W', 'S'] },
  { id: 1, name: 'Setas', keys: ['←', '→', '↑', '↓'] },
  { id: 2, name: 'IJKL', keys: ['J', 'L', 'I', 'K'] },
  { id: 3, name: 'Numpad', keys: ['4', '6', '8', '5'] },
];

const playerColors = [
  { name: "Green", value: "#2ECC71" },
  { name: "Blue", value: "#3498DB" },
  { name: "Red", value: "#E74C3C" },
  { name: "Purple", value: "#9B59B6" },
  { name: "Orange", value: "#F39C12" },
  { name: "Pink", value: "#E91E63" },
  { name: "Cyan", value: "#1ABC9C" },
  { name: "Yellow", value: "#F1C40F" },
];

export const TitleScreen = ({ onStartGame, showVictory = false }: TitleScreenProps) => {
  const [playerCount, setPlayerCount] = useState(2);
  const [startLevel, setStartLevel] = useState(1);
  const [runnerLevel, setRunnerLevel] = useState(1);
  const [selectedMode, setSelectedMode] = useState<'platformer' | 'runner'>('platformer');
  const [selectedColors, setSelectedColors] = useState({
    player1: "#2ECC71",
    player2: "#3498DB",
    player3: "#E74C3C",
    player4: "#9B59B6"
  });
  const [selectedControls, setSelectedControls] = useState({
    player1: 0,
    player2: 1,
    player3: 2,
    player4: 3
  });

  const handleColorSelect = (player: string, color: string) => {
    setSelectedColors(prev => ({
      ...prev,
      [player]: color
    }));
  };

  const handleControlSelect = (player: string, controlId: number) => {
    setSelectedControls(prev => ({
      ...prev,
      [player]: controlId
    }));
  };

  const handleStartGame = () => {
    const colors = Object.fromEntries(
      Array.from({ length: playerCount }, (_, i) => [
        `player${i + 1}`,
        selectedColors[`player${i + 1}` as keyof typeof selectedColors]
      ])
    );
    const controls = Object.fromEntries(
      Array.from({ length: playerCount }, (_, i) => [
        `player${i + 1}`,
        selectedControls[`player${i + 1}` as keyof typeof selectedControls]
      ])
    );
    onStartGame({ playerCount, colors, startLevel, mode: selectedMode, runnerLevel, controls });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center pixel-perfect">
      <div className="mb-8">
        <h1 className={`text-6xl font-bold mb-4 ${showVictory ? 'animate-victory-glow text-game-goal' : 'text-primary'}`}>
          MALDITOS PIXELS
        </h1>
        <p className="text-xl text-muted-foreground">
          {showVictory ? "🎉 Parabéns! Vocês conseguiram não morrer! 🎉" : "Um Jogo Onde a Amizade Vai pro Espaço"}
        </p>
      </div>

      <Card className="bg-card/90 p-8 mb-8 border-2 border-primary max-w-4xl">
        {/* Mode Selection */}
        <div className="mb-6 text-center">
          <h3 className="text-lg font-bold mb-4 text-primary">Escolha Seu Tipo de Sofrimento</h3>
          <div className="flex justify-center gap-4 mb-6">
            <button
              className={`px-4 py-3 rounded border-2 font-bold transition-all text-center ${
                selectedMode === 'platformer' 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'bg-card border-border hover:border-primary'
              }`}
              onClick={() => setSelectedMode('platformer')}
            >
              <div className="text-lg">🏗️ Plataforma</div>
              <div className="text-xs opacity-75">Níveis cooperativos</div>
            </button>
            <button
              className={`px-4 py-3 rounded border-2 font-bold transition-all text-center ${
                selectedMode === 'runner' 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'bg-card border-border hover:border-primary'
              }`}
              onClick={() => setSelectedMode('runner')}
            >
              <div className="text-lg">🏃 Corredor</div>
              <div className="text-xs opacity-75">Velocidade e obstáculos</div>
            </button>
          </div>
        </div>

        {/* Level Selection - Only for platformer mode */}
        {selectedMode === 'platformer' && (
          <div className="mb-6 text-center">
            <h3 className="text-lg font-bold mb-4 text-primary">Escolha Sua Fase do Sofrimento</h3>
            <div className="flex justify-center gap-2 mb-6 flex-wrap">
              {[
                { level: 1, name: 'Aquecimento', desc: 'Para iniciantes' },
                { level: 2, name: 'Adaptativo', desc: 'Fica mais difícil' },
                { level: 3, name: 'Plataformas', desc: 'Com obstáculos móveis' },
                { level: 4, name: 'Boss Final', desc: 'O desafio supremo' }
              ].map(({ level, name, desc }) => (
                <button
                  key={level}
                  className={`px-3 py-2 rounded border-2 font-bold transition-all text-center ${
                    startLevel === level 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'bg-card border-border hover:border-primary'
                  }`}
                  onClick={() => setStartLevel(level)}
                >
                  <div className="text-sm">{name}</div>
                  <div className="text-xs opacity-75">{desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Level Selection - Only for runner mode */}
        {selectedMode === 'runner' && (
          <div className="mb-6 text-center">
            <h3 className="text-lg font-bold mb-4 text-primary">Escolha Sua Fase do Sofrimento</h3>
            <div className="flex justify-center gap-2 mb-6 flex-wrap">
              {[
                { level: 1, name: 'Assassinos', desc: 'Fuja dos vilões' },
                { level: 2, name: 'Mundo Mario', desc: 'Estilo clássico' },
                { level: 3, name: 'Bomberman', desc: 'Arena explosiva' }
              ].map(({ level, name, desc }) => (
                <button
                  key={level}
                  className={`px-3 py-2 rounded border-2 font-bold transition-all text-center ${
                    runnerLevel === level 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'bg-card border-border hover:border-primary'
                  }`}
                  onClick={() => setRunnerLevel(level)}
                >
                  <div className="text-sm">{name}</div>
                  <div className="text-xs opacity-75">{desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Player Count Selection */}
        <div className="mb-6 text-center">
          <h3 className="text-lg font-bold mb-4 text-primary">Quantas Vítimas?</h3>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4].map((count) => (
              <button
                key={count}
                className={`px-4 py-2 rounded border-2 font-bold transition-all ${
                  playerCount === count 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'bg-card border-border hover:border-primary'
                }`}
                onClick={() => setPlayerCount(count)}
              >
                {count} {count === 1 ? 'Corajoso' : count === 2 ? 'Desavisados' : count === 3 ? 'Teimosos' : 'Masoquistas'}
              </button>
            ))}
          </div>
        </div>

        <div className={`grid gap-6 text-left ${
          playerCount === 1 ? 'grid-cols-1 max-w-md mx-auto' :
          playerCount === 2 ? 'md:grid-cols-2' :
          playerCount === 3 ? 'md:grid-cols-3' :
          'md:grid-cols-2 lg:grid-cols-4'
        }`}>
          {Array.from({ length: playerCount }, (_, index) => {
            const playerKey = `player${index + 1}` as keyof typeof selectedColors;
            const controlKey = `player${index + 1}` as keyof typeof selectedControls;
            const selectedScheme = controlSchemes[selectedControls[controlKey]];
            
            return (
              <div key={playerKey}>
                <h3 className="text-lg font-bold mb-2" style={{ color: selectedColors[playerKey] }}>
                  Vítima {index + 1}
                </h3>
                <div className="mb-3">
                  <p className="text-sm font-medium mb-2">Cor da Derrota:</p>
                  <div className="grid grid-cols-4 gap-2">
                    {playerColors.map((color) => (
                      <button
                        key={`${playerKey}-${color.value}`}
                        className={`w-8 h-8 rounded border-2 hover:scale-110 transition-transform ${
                          selectedColors[playerKey] === color.value ? 'border-white border-4' : 'border-gray-400'
                        }`}
                        style={{ backgroundColor: color.value }}
                        onClick={() => handleColorSelect(playerKey, color.value)}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
                <div className="mb-3">
                  <p className="text-sm font-medium mb-2">Controles:</p>
                  <div className="grid grid-cols-2 gap-1">
                    {controlSchemes.map((scheme) => (
                      <button
                        key={`${playerKey}-${scheme.id}`}
                        className={`px-2 py-1 text-xs rounded border transition-all ${
                          selectedControls[controlKey] === scheme.id
                            ? 'border-2 font-bold'
                            : 'border-border hover:border-primary/50'
                        }`}
                        style={{
                          backgroundColor: selectedControls[controlKey] === scheme.id ? selectedColors[playerKey] : 'transparent',
                          color: selectedControls[controlKey] === scheme.id ? '#fff' : 'inherit',
                          borderColor: selectedControls[controlKey] === scheme.id ? selectedColors[playerKey] : undefined
                        }}
                        onClick={() => handleControlSelect(controlKey, scheme.id)}
                      >
                        {scheme.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1 text-xs">
                  <div>
                    <kbd className="px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: selectedColors[playerKey] }}>
                      {selectedScheme.keys[0]}
                    </kbd>/<kbd className="px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: selectedColors[playerKey] }}>
                      {selectedScheme.keys[1]}
                    </kbd> Mover
                  </div>
                  <div>
                    <kbd className="px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: selectedColors[playerKey] }}>
                      {selectedScheme.keys[2]}
                    </kbd> Pular (2x = Duplo)
                  </div>
                  <div>
                    <kbd className="px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: selectedColors[playerKey] }}>
                      {selectedScheme.keys[3]}
                    </kbd> Agachar
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-muted rounded border-l-4 border-accent">
          <h4 className="font-bold text-accent mb-2">
            {selectedMode === 'runner' ? 'Regras do Modo Corredor:' : (playerCount === 1 ? 'Regras para o Solitário:' : 'Regras da Discórdia:')}
          </h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            {selectedMode === 'runner' ? (
              <>
                <li>• Corra o mais longe possível sem parar</li>
                <li>• Evite obstáculos ou seja esmagado</li>
                <li>• Use pulo duplo para superar desafios</li>
                <li>• Sobreviva o máximo de tempo possível</li>
              </>
            ) : playerCount === 1 ? (
              <>
                <li>• Atravesse todos os níveis sozinho (que corajoso)</li>
                <li>• Evite obstáculos vermelhos ou recomece (surpresa!)</li>
                <li>• Colete power-ups para fingir que tem vantagem</li>
                <li>• Domine pulos precisos (boa sorte com isso)</li>
              </>
            ) : (
              <>
                <li>• TODOS devem chegar na área dourada (sem exceções, infeliz)</li>
                <li>• Se UM tocar nos obstáculos vermelhos, TODOS reiniciam (democracia)</li>
                <li>• Trabalhem juntos - algumas plataformas exigem colaboração (que novidade!)</li>
                <li>• Comunicação é fundamental (gritar não conta)</li>
              </>
            )}
          </ul>
        </div>
      </Card>

      <Button 
        onClick={handleStartGame}
        size="lg"
        className="text-xl px-8 py-4 bg-primary hover:bg-primary/90 border-2 border-primary-foreground font-bold animate-pixel-bounce"
      >
        {showVictory ? "Sofrer de Novo" : "Começar o Sofrimento"}
      </Button>

      <p className="text-xs text-muted-foreground mt-4">
        Feito com 💀 para testar amizades
      </p>
    </div>
  );
};