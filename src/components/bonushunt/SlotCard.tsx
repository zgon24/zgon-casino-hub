import { useState } from "react";
import { Slot } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Play, Check, Star, Zap, ImageIcon } from "lucide-react";

interface SlotCardProps {
  slot: Slot;
  index: number;
  huntPhase: "collecting" | "opening";
  isCurrentSlot: boolean;
  onOpen: (id: string, result: number, isSuper: boolean, isExtreme: boolean) => void;
  onDelete: (id: string) => void;
}

const SlotCard = ({ slot, index, huntPhase, isCurrentSlot, onOpen, onDelete }: SlotCardProps) => {
  const [result, setResult] = useState("");
  const [isSuper, setIsSuper] = useState(false);
  const [isExtreme, setIsExtreme] = useState(false);
  const [showResultInput, setShowResultInput] = useState(false);

  const handleOpen = () => {
    const resultValue = parseFloat(result);
    if (!isNaN(resultValue)) {
      onOpen(slot.id, resultValue, isSuper, isExtreme);
      setShowResultInput(false);
      setResult("");
      setIsSuper(false);
      setIsExtreme(false);
    }
  };

  const multiplier = slot.result !== null && slot.bet_size > 0 
    ? (slot.result / slot.bet_size).toFixed(1) 
    : null;

  return (
    <div
      className={`relative rounded-xl overflow-hidden border transition-all duration-300 ${
        slot.status === "opened"
          ? slot.is_extreme
            ? "bg-red-500/10 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
            : slot.is_super
            ? "bg-green-500/10 border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
            : "bg-primary/10 border-primary/50"
          : isCurrentSlot && huntPhase === "opening"
          ? "bg-primary/20 border-primary animate-pulse"
          : "bg-card border-border/50"
      }`}
    >
      {/* Slot Image */}
      <div className="relative h-24 bg-secondary/50 flex items-center justify-center overflow-hidden">
        {slot.image_url ? (
          <img 
            src={slot.image_url} 
            alt={slot.slot_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
        )}
        
        {/* Index badge */}
        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded">
          #{index + 1}
        </div>

        {/* Super/Extreme badges */}
        {slot.is_super && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
            <Star className="w-3 h-3" /> SUPER
          </div>
        )}
        {slot.is_extreme && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
            <Zap className="w-3 h-3" /> EXTREME
          </div>
        )}
      </div>

      {/* Slot Info */}
      <div className="p-3 space-y-2">
        <p className="font-semibold text-sm truncate" title={slot.slot_name}>
          {slot.slot_name}
        </p>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Bet: €{slot.bet_size.toFixed(2)}</span>
          {slot.status === "opened" && multiplier && (
            <span className={`font-bold ${
              slot.is_extreme ? "text-red-500" : slot.is_super ? "text-green-500" : "text-primary"
            }`}>
              {multiplier}x
            </span>
          )}
        </div>

        {/* Result section */}
        {slot.status === "opened" ? (
          <div className="text-center py-2">
            <span className={`text-xl font-bold ${
              slot.is_extreme ? "text-red-500" : slot.is_super ? "text-green-500" : "text-primary"
            }`}>
              €{slot.result?.toFixed(2)}
            </span>
          </div>
        ) : showResultInput ? (
          <div className="space-y-2">
            <Input
              type="number"
              step="0.01"
              value={result}
              onChange={(e) => setResult(e.target.value)}
              className="h-8 bg-secondary/50 text-center"
              placeholder="Resultado €"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleOpen()}
            />
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={isSuper ? "default" : "outline"}
                className={`flex-1 h-7 text-xs ${isSuper ? "bg-green-500 hover:bg-green-600" : ""}`}
                onClick={() => { setIsSuper(!isSuper); setIsExtreme(false); }}
              >
                <Star className="w-3 h-3 mr-1" /> Super
              </Button>
              <Button
                size="sm"
                variant={isExtreme ? "default" : "outline"}
                className={`flex-1 h-7 text-xs ${isExtreme ? "bg-red-500 hover:bg-red-600" : ""}`}
                onClick={() => { setIsExtreme(!isExtreme); setIsSuper(false); }}
              >
                <Zap className="w-3 h-3 mr-1" /> Extreme
              </Button>
            </div>
            <Button size="sm" className="w-full h-8" onClick={handleOpen}>
              <Check className="w-4 h-4 mr-1" /> Confirmar
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            {huntPhase === "opening" && (
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1 h-8 text-primary border-primary/50 hover:bg-primary/10"
                onClick={() => setShowResultInput(true)}
              >
                <Play className="w-4 h-4 mr-1" /> Abrir
              </Button>
            )}
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-8 text-destructive hover:text-destructive"
              onClick={() => onDelete(slot.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SlotCard;
