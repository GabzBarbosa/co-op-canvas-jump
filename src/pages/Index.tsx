import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-game-bg">
      <div className="text-center">
        <h1 className="mb-6 text-6xl font-bold text-primary animate-pixel-bounce">
          🎮 Welcome to Pixel Pals! 🎮
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Experience cooperative platforming at its finest!
        </p>
        <Link to="/game">
          <Button size="lg" className="text-xl px-8 py-4 bg-primary hover:bg-primary/90 font-bold">
            Start Your Adventure
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Index;
