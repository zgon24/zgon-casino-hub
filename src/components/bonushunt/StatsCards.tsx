import { Card, CardContent } from "@/components/ui/card";
import { Slot, BonusHunt } from "./types";
import { Star, Zap, Trophy, Target } from "lucide-react";

interface StatsCardsProps {
  bonusHunt: BonusHunt;
  slots: Slot[];
}

const StatsCards = ({ bonusHunt, slots }: StatsCardsProps) => {
  const totalBets = slots.reduce((sum, s) => sum + s.bet_size, 0);
  const totalResult = slots.reduce((sum, s) => sum + (s.result || 0), 0);
  const profit = totalResult - bonusHunt.start_amount;
  
  const breakevenMultiplier = totalBets > 0 ? (bonusHunt.start_amount / totalBets).toFixed(2) : "0.00";
  const currentMultiplier = totalBets > 0 ? (totalResult / totalBets).toFixed(2) : "0.00";
  
  const superCount = slots.filter(s => s.is_super).length;
  const extremeCount = slots.filter(s => s.is_extreme).length;
  const openedCount = slots.filter(s => s.status === "opened").length;

  return (
    <div className="space-y-4">
      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/50 bg-card/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-blue-500" />
              <p className="text-sm text-muted-foreground">Start</p>
            </div>
            <p className="text-2xl font-bold text-foreground">€{bonusHunt.start_amount.toFixed(2)}</p>
          </CardContent>
        </Card>
        
        <Card className="border-border/50 bg-card/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-4 h-4 text-primary" />
              <p className="text-sm text-muted-foreground">Breakeven</p>
            </div>
            <p className="text-2xl font-bold text-primary">{breakevenMultiplier}x</p>
          </CardContent>
        </Card>
        
        <Card className="border-border/50 bg-card/50">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">Total Ganho</p>
            <p className="text-2xl font-bold text-foreground">€{totalResult.toFixed(2)}</p>
          </CardContent>
        </Card>
        
        <Card className="border-border/50 bg-card/50">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">Multiplicador</p>
            <p className="text-2xl font-bold text-foreground">{currentMultiplier}x</p>
          </CardContent>
        </Card>
      </div>

      {/* Bonus Counts */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bonuses</p>
                <p className="text-2xl font-bold text-primary">{slots.length}</p>
              </div>
              <div className="text-sm text-muted-foreground">
                {openedCount}/{slots.length} abertos
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-green-500/50 bg-green-500/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Super</p>
                <p className="text-2xl font-bold text-green-500">{superCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-red-500/50 bg-red-500/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Extreme</p>
                <p className="text-2xl font-bold text-red-500">{extremeCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StatsCards;
