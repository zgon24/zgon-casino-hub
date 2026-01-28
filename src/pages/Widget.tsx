import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Loader2 } from "lucide-react";

interface Slot {
  id: string;
  slot_name: string;
  bet_size: number;
  cost: number;
  result: number | null;
  status: "pending" | "opened";
  slot_order: number;
}

interface BonusHunt {
  id: string;
  name: string;
  status: "active" | "completed";
  total_cost: number;
  total_result: number;
}

const Widget = () => {
  const { huntId } = useParams<{ huntId: string }>();
  const [bonusHunt, setBonusHunt] = useState<BonusHunt | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (huntId) {
      loadBonusHunt();
      
      // Set up realtime subscription
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

  const loadBonusHunt = async () => {
    if (!huntId) return;

    const { data, error } = await supabase
      .from("bonus_hunts")
      .select("*")
      .eq("id", huntId)
      .eq("status", "active")
      .single();

    if (error) {
      setError("Bonus Hunt não encontrado ou já foi concluído");
      setLoading(false);
      return;
    }

    setBonusHunt(data as BonusHunt);
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

    setSlots((data as Slot[]) || []);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !bonusHunt) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
        <div className="text-center">
          <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">{error || "Bonus Hunt não encontrado"}</p>
        </div>
      </div>
    );
  }

  const totalCost = bonusHunt.total_cost;
  const totalResult = bonusHunt.total_result;
  const profit = totalResult - totalCost;
  const profitMultiplier = totalCost > 0 ? (totalResult / totalCost).toFixed(2) : "0.00";
  const openedCount = slots.filter((s) => s.status === "opened").length;
  const pendingCount = slots.filter((s) => s.status === "pending").length;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <h1 className="text-xl font-bold">{bonusHunt.name}</h1>
        </div>
        <div className="text-sm text-gray-400">
          {openedCount}/{slots.length} abertos
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="bg-[#1a1a1a] rounded-lg p-3 border border-gray-800">
          <p className="text-xs text-gray-500 uppercase">Custo</p>
          <p className="text-lg font-bold">€{totalCost.toFixed(2)}</p>
        </div>
        <div className="bg-[#1a1a1a] rounded-lg p-3 border border-gray-800">
          <p className="text-xs text-gray-500 uppercase">Ganho</p>
          <p className="text-lg font-bold text-yellow-500">€{totalResult.toFixed(2)}</p>
        </div>
        <div className="bg-[#1a1a1a] rounded-lg p-3 border border-gray-800">
          <p className="text-xs text-gray-500 uppercase">Lucro</p>
          <p className={`text-lg font-bold ${profit >= 0 ? "text-green-500" : "text-red-500"}`}>
            €{profit.toFixed(2)}
          </p>
        </div>
        <div className="bg-[#1a1a1a] rounded-lg p-3 border border-gray-800">
          <p className="text-xs text-gray-500 uppercase">Multi</p>
          <p className="text-lg font-bold">{profitMultiplier}x</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-yellow-500 to-yellow-600 transition-all duration-500"
            style={{ width: `${slots.length > 0 ? (openedCount / slots.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Slots Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {slots.map((slot, index) => (
          <div
            key={slot.id}
            className={`rounded-lg p-3 border transition-all ${
              slot.status === "opened"
                ? "bg-yellow-500/10 border-yellow-500/50"
                : "bg-[#1a1a1a] border-gray-800"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">#{index + 1}</span>
              <span className="text-xs text-gray-500">€{slot.bet_size.toFixed(2)}</span>
            </div>
            <p className="font-medium text-sm truncate mb-1" title={slot.slot_name}>
              {slot.slot_name}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">€{slot.cost.toFixed(2)}</span>
              {slot.status === "opened" && slot.result !== null && (
                <span className="text-sm font-bold text-yellow-500">
                  €{slot.result.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pending slots info */}
      {pendingCount > 0 && (
        <div className="mt-4 text-center text-sm text-gray-500">
          {pendingCount} slot{pendingCount !== 1 ? "s" : ""} por abrir
        </div>
      )}

      {/* Branding */}
      <div className="mt-6 text-center text-xs text-gray-600">
        Powered by <span className="text-yellow-500">ZGON</span>
      </div>
    </div>
  );
};

export default Widget;
