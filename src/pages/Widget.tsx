import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Star, Zap, Target, Trophy, ImageIcon } from "lucide-react";

interface Slot {
  id: string;
  slot_name: string;
  bet_size: number;
  cost: number;
  result: number | null;
  status: "pending" | "opened";
  slot_order: number;
  image_url: string | null;
  is_super: boolean;
  is_extreme: boolean;
}

interface BonusHunt {
  id: string;
  name: string;
  status: "active" | "completed";
  total_cost: number;
  total_result: number;
  start_amount: number;
  hunt_phase: "collecting" | "opening";
}

const Widget = () => {
  const { huntId } = useParams<{ huntId: string }>();
  const [bonusHunt, setBonusHunt] = useState<BonusHunt | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentSlotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (huntId) {
      loadBonusHunt();
      
      const channel = supabase
        .channel(`bonus_hunt_${huntId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "slots",
            filter: `bonus_hunt_id=eq.${huntId}`,
          },
          () => {
            loadSlots();
          }
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "bonus_hunts",
            filter: `id=eq.${huntId}`,
          },
          () => {
            loadBonusHunt();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [huntId]);

  // Auto-scroll to current slot during opening phase
  useEffect(() => {
    if (bonusHunt?.hunt_phase === "opening" && currentSlotRef.current) {
      currentSlotRef.current.scrollIntoView({ 
        behavior: "smooth", 
        block: "center" 
      });
    }
  }, [slots, bonusHunt?.hunt_phase]);

  const loadBonusHunt = async () => {
    if (!huntId) return;

    const { data, error } = await supabase
      .from("bonus_hunts")
      .select("*")
      .eq("id", huntId)
      .eq("status", "active")
      .maybeSingle();

    if (error) {
      setError("Erro ao carregar bonus hunt");
      setLoading(false);
      return;
    }

    if (!data) {
      setError("Bonus Hunt não encontrado ou já foi concluído");
      setLoading(false);
      return;
    }

    setBonusHunt(data as unknown as BonusHunt);
    await loadSlots();
    setLoading(false);
  };

  const loadSlots = async () => {
    if (!huntId) return;

    const { data } = await supabase
      .from("slots")
      .select("*")
      .eq("bonus_hunt_id", huntId)
      .order("slot_order", { ascending: true });

    setSlots((data as unknown as Slot[]) || []);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  if (error || !bonusHunt) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
        <div className="text-center">
          <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">{error || "Bonus Hunt não encontrado"}</p>
        </div>
      </div>
    );
  }

  const totalBets = slots.reduce((sum, s) => sum + s.bet_size, 0);
  const totalResult = slots.reduce((sum, s) => sum + (s.result || 0), 0);
  const breakevenMultiplier = totalBets > 0 ? (bonusHunt.start_amount / totalBets).toFixed(2) : "0.00";
  const superCount = slots.filter(s => s.is_super).length;
  const extremeCount = slots.filter(s => s.is_extreme).length;
  const openedCount = slots.filter(s => s.status === "opened").length;
  const currentSlotIndex = slots.findIndex(s => s.status === "pending");

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      {/* Stats Header Bar */}
      <div className="sticky top-0 z-50 bg-gradient-to-b from-[#0a0a0a] to-transparent pb-2">
        {/* Top Row - Start & Breakeven */}
        <div className="bg-gradient-to-r from-blue-900/90 to-blue-800/90 px-3 py-2 flex items-center justify-between rounded-b-lg mx-1">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-blue-300 font-medium">START</span>
            <span className="text-sm font-bold text-white">€{bonusHunt.start_amount.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="text-xs text-blue-300 font-medium">BREAKEVEN</span>
            <span className="text-sm font-bold text-yellow-400">{breakevenMultiplier}x</span>
          </div>
        </div>

        {/* Bonuses Row */}
        <div className="bg-gradient-to-r from-orange-600/90 to-orange-500/90 px-3 py-2 flex items-center justify-center gap-4 mt-1 rounded-lg mx-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-orange-200 font-medium">🎰 BONUSES</span>
            <span className="text-lg font-bold text-white">{slots.length}</span>
          </div>
        </div>

        {/* Super & Extreme Row */}
        <div className="flex gap-1 mt-1 mx-1">
          <div className="flex-1 bg-gradient-to-r from-green-700/90 to-green-600/90 px-3 py-2 rounded-lg flex items-center justify-center gap-2">
            <Star className="w-4 h-4 text-green-300 fill-green-300" />
            <span className="text-xs text-green-200 font-medium">SUPER</span>
            <span className="text-lg font-bold text-white">{superCount}</span>
          </div>
          <div className="flex-1 bg-gradient-to-r from-red-700/90 to-red-600/90 px-3 py-2 rounded-lg flex items-center justify-center gap-2">
            <Zap className="w-4 h-4 text-red-300 fill-red-300" />
            <span className="text-xs text-red-200 font-medium">EXTREME</span>
            <span className="text-lg font-bold text-white">{extremeCount}</span>
          </div>
        </div>

        {/* Progress indicator */}
        {bonusHunt.hunt_phase === "opening" && (
          <div className="bg-gradient-to-r from-gray-800/90 to-gray-700/90 px-3 py-2 mt-1 rounded-lg mx-1 flex items-center justify-center">
            <span className="text-sm font-bold text-white">
              {openedCount + 1}/{slots.length}
            </span>
          </div>
        )}
      </div>

      {/* Slots List - Vertical Scroll */}
      <div 
        ref={containerRef}
        className="px-2 pb-4 space-y-2 overflow-y-auto"
        style={{ maxHeight: "calc(100vh - 180px)" }}
      >
        {slots.map((slot, index) => {
          const isCurrentSlot = index === currentSlotIndex && bonusHunt.hunt_phase === "opening";
          const multiplier = slot.result !== null && slot.bet_size > 0 
            ? (slot.result / slot.bet_size).toFixed(1) 
            : null;

          return (
            <div
              key={slot.id}
              ref={isCurrentSlot ? currentSlotRef : undefined}
              className={`
                relative rounded-xl overflow-hidden border-2 transition-all duration-500
                ${slot.status === "opened"
                  ? slot.is_extreme
                    ? "border-red-500 bg-gradient-to-r from-red-900/40 to-red-800/30 shadow-[0_0_30px_rgba(239,68,68,0.4)]"
                    : slot.is_super
                    ? "border-green-500 bg-gradient-to-r from-green-900/40 to-green-800/30 shadow-[0_0_30px_rgba(34,197,94,0.4)]"
                    : "border-yellow-500/50 bg-gradient-to-r from-yellow-900/20 to-yellow-800/10"
                  : isCurrentSlot
                  ? "border-yellow-400 bg-gradient-to-r from-yellow-900/30 to-yellow-800/20 animate-pulse shadow-[0_0_20px_rgba(250,204,21,0.3)]"
                  : "border-gray-700 bg-gradient-to-r from-gray-800/50 to-gray-900/50 opacity-60"
                }
              `}
            >
              <div className="flex items-center gap-3 p-2">
                {/* Slot Image */}
                <div className="w-16 h-16 rounded-lg bg-gray-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {slot.image_url ? (
                    <img 
                      src={slot.image_url} 
                      alt={slot.slot_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-gray-600" />
                  )}
                </div>

                {/* Slot Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-gray-700/80 text-gray-300 px-2 py-0.5 rounded font-mono">
                      #{index + 1}
                    </span>
                    {slot.is_super && (
                      <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded font-bold flex items-center gap-1">
                        <Star className="w-3 h-3 fill-white" /> SUPER
                      </span>
                    )}
                    {slot.is_extreme && (
                      <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded font-bold flex items-center gap-1">
                        <Zap className="w-3 h-3 fill-white" /> EXTREME
                      </span>
                    )}
                  </div>
                  <p className="font-bold text-sm truncate mt-1 text-white">
                    {slot.slot_name}
                  </p>
                  <p className="text-xs text-gray-400">
                    Bet: €{slot.bet_size.toFixed(2)}
                  </p>
                </div>

                {/* Result */}
                <div className="text-right flex-shrink-0">
                  {slot.status === "opened" && slot.result !== null ? (
                    <div>
                      <p className={`text-xl font-bold ${
                        slot.is_extreme ? "text-red-400" : slot.is_super ? "text-green-400" : "text-yellow-400"
                      }`}>
                        €{slot.result.toFixed(2)}
                      </p>
                      {multiplier && (
                        <p className={`text-xs font-medium ${
                          slot.is_extreme ? "text-red-300" : slot.is_super ? "text-green-300" : "text-yellow-300"
                        }`}>
                          {multiplier}x
                        </p>
                      )}
                    </div>
                  ) : isCurrentSlot ? (
                    <div className="w-12 h-12 rounded-full border-2 border-yellow-400 flex items-center justify-center animate-spin-slow">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                    </div>
                  ) : (
                    <span className="text-gray-600 text-sm">-</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {slots.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>A aguardar slots...</p>
          </div>
        )}
      </div>

      {/* Bottom Stats Bar */}
      {bonusHunt.hunt_phase === "opening" && slots.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#0a0a0a] to-transparent pt-4 pb-2">
          <div className="bg-gradient-to-r from-gray-800 to-gray-700 mx-2 rounded-lg px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="text-center">
                <p className="text-xs text-gray-400">GANHO</p>
                <p className="text-lg font-bold text-yellow-400">€{totalResult.toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">MULTI</p>
                <p className="text-lg font-bold text-white">
                  {totalBets > 0 ? (totalResult / totalBets).toFixed(2) : "0.00"}x
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">PROFIT</p>
                <p className={`text-lg font-bold ${totalResult - bonusHunt.start_amount >= 0 ? "text-green-400" : "text-red-400"}`}>
                  €{(totalResult - bonusHunt.start_amount).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom styles for slow spin animation */}
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Widget;
