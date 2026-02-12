import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Copy, 
  LogOut, 
  Trophy,
  ArrowLeft,
  Loader2,
  Play,
  Check
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Slot, BonusHunt } from "@/components/bonushunt/types";
import SlotCard from "@/components/bonushunt/SlotCard";
import AddSlotForm from "@/components/bonushunt/AddSlotForm";
import StatsCards from "@/components/bonushunt/StatsCards";
import { Label } from "@/components/ui/label";

const BonusHuntPage = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [bonusHunt, setBonusHunt] = useState<BonusHunt | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [huntName, setHuntName] = useState("Bonus Hunt");
  const [startAmount, setStartAmount] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadActiveBonusHunt();
    }
  }, [user]);

  const loadActiveBonusHunt = async () => {
    if (!user) return;
    
    setLoading(true);
    
    const { data: hunts, error } = await supabase
      .from("bonus_hunts")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      console.error("Error loading bonus hunt:", error);
      setLoading(false);
      return;
    }

    if (hunts && hunts.length > 0) {
      const hunt = hunts[0] as unknown as BonusHunt;
      setBonusHunt(hunt);
      setHuntName(hunt.name);
      await loadSlots(hunt.id);
    }
    
    setLoading(false);
  };

  const loadSlots = async (huntId: string) => {
    const { data, error } = await supabase
      .from("slots")
      .select("*")
      .eq("bonus_hunt_id", huntId)
      .order("slot_order", { ascending: true });

    if (error) {
      console.error("Error loading slots:", error);
      return;
    }

    setSlots((data as unknown as Slot[]) || []);
  };

  const createNewBonusHunt = async () => {
    if (!user) return;

    const start = parseFloat(startAmount) || 0;

    const { data, error } = await supabase
      .from("bonus_hunts")
      .insert({
        user_id: user.id,
        name: huntName,
        status: "active",
        total_cost: 0,
        total_result: 0,
        start_amount: start,
        hunt_phase: "collecting",
      })
      .select()
      .single();

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível criar o bonus hunt",
      });
      return;
    }

    setBonusHunt(data as unknown as BonusHunt);
    setSlots([]);
    toast({
      title: "Bonus Hunt criado!",
      description: "Podes agora adicionar slots",
    });
  };

  const startHunt = async () => {
    if (!bonusHunt || slots.length === 0) return;

    const { error } = await supabase
      .from("bonus_hunts")
      .update({ hunt_phase: "opening" })
      .eq("id", bonusHunt.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível iniciar o bonus hunt",
      });
      return;
    }

    setBonusHunt({ ...bonusHunt, hunt_phase: "opening" });
    toast({
      title: "Bonus Hunt iniciado!",
      description: "Agora podes abrir os bónus",
    });
  };

  const openSlot = async (slotId: string, result: number, isSuper: boolean, isExtreme: boolean) => {
    const { error } = await supabase
      .from("slots")
      .update({ status: "opened", result, is_super: isSuper, is_extreme: isExtreme })
      .eq("id", slotId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar o slot",
      });
      return;
    }

    const updatedSlots = slots.map((s) =>
      s.id === slotId ? { ...s, status: "opened" as const, result, is_super: isSuper, is_extreme: isExtreme } : s
    );
    setSlots(updatedSlots);
    await updateTotals(updatedSlots);
  };

  const deleteSlot = async (slotId: string) => {
    const { error } = await supabase.from("slots").delete().eq("id", slotId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível remover o slot",
      });
      return;
    }

    const updatedSlots = slots.filter((s) => s.id !== slotId);
    setSlots(updatedSlots);
    await updateTotals(updatedSlots);
  };

  const updateTotals = async (currentSlots: Slot[]) => {
    if (!bonusHunt) return;

    const totalCost = currentSlots.reduce((sum, s) => sum + s.bet_size, 0);
    const totalResult = currentSlots.reduce((sum, s) => sum + (s.result || 0), 0);

    await supabase
      .from("bonus_hunts")
      .update({ total_cost: totalCost, total_result: totalResult })
      .eq("id", bonusHunt.id);

    setBonusHunt({ ...bonusHunt, total_cost: totalCost, total_result: totalResult });
  };

  const completeBonusHunt = async () => {
    if (!bonusHunt) return;

    await supabase
      .from("bonus_hunts")
      .update({ status: "completed" })
      .eq("id", bonusHunt.id);

    setBonusHunt(null);
    setSlots([]);
    toast({
      title: "Bonus Hunt concluído!",
      description: "Podes criar um novo",
    });
  };

  const copyWidgetUrl = () => {
    if (!bonusHunt) return;
    const url = `${window.location.origin}/widget/${bonusHunt.id}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copiado!",
      description: "Podes usar este link no OBS",
    });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleSlotAdded = () => {
    if (bonusHunt) {
      loadSlots(bonusHunt.id);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Find the current slot to open (first pending slot)
  const currentSlotIndex = slots.findIndex(s => s.status === "pending");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              to="/" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold text-gradient-gold">BonusHunt</h1>
            </div>
            <Link 
              to="/slot-catalog" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              📚 Catálogo
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.email}
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {!bonusHunt ? (
          /* Create new bonus hunt */
          <Card className="border-border/50 bg-card/50 max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle>Criar Novo Bonus Hunt</CardTitle>
              <CardDescription>
                Começa um novo bonus hunt para a tua live
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Nome do Bonus Hunt</Label>
                <Input
                  placeholder="Ex: Bonus Hunt #1"
                  value={huntName}
                  onChange={(e) => setHuntName(e.target.value)}
                  className="bg-secondary/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Valor Inicial (€)</Label>
                <Input
                  placeholder="Ex: 1000.00"
                  type="number"
                  step="0.01"
                  value={startAmount}
                  onChange={(e) => setStartAmount(e.target.value)}
                  className="bg-secondary/50"
                />
              </div>
              <Button 
                onClick={createNewBonusHunt} 
                className="w-full btn-gold text-primary-foreground font-semibold"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Bonus Hunt
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stats */}
            <StatsCards bonusHunt={bonusHunt} slots={slots} />

            {/* Widget URL */}
            <Card className="border-border/50 bg-card/50">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                  <div>
                    <p className="font-semibold">Widget para OBS/StreamElements</p>
                    <p className="text-sm text-muted-foreground">
                      Usa este link como Browser Source
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={copyWidgetUrl} 
                      variant="outline"
                      className="shrink-0"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar Link
                    </Button>
                    {bonusHunt.hunt_phase === "collecting" && slots.length > 0 && (
                      <Button 
                        onClick={startHunt}
                        className="btn-gold text-primary-foreground font-semibold shrink-0"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Iniciar Hunt
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Add Slot Form - Only show during collecting phase */}
            {bonusHunt.hunt_phase === "collecting" && (
              <AddSlotForm 
                bonusHuntId={bonusHunt.id} 
                slotsCount={slots.length}
                onSlotAdded={handleSlotAdded}
              />
            )}

            {/* Hunt Phase Indicator */}
            <div className="flex items-center justify-center gap-4">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                bonusHunt.hunt_phase === "collecting" 
                  ? "bg-primary/20 text-primary" 
                  : "bg-secondary text-muted-foreground"
              }`}>
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">A Colecionar</span>
              </div>
              <div className="w-8 h-0.5 bg-border" />
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                bonusHunt.hunt_phase === "opening" 
                  ? "bg-primary/20 text-primary" 
                  : "bg-secondary text-muted-foreground"
              }`}>
                <Play className="w-4 h-4" />
                <span className="text-sm font-medium">A Abrir</span>
              </div>
            </div>

            {/* Slots Grid */}
            <div>
              <h2 className="text-lg font-semibold mb-4">
                Slots ({slots.length})
              </h2>
              {slots.length === 0 ? (
                <Card className="border-border/50 bg-card/50">
                  <CardContent className="py-12 text-center text-muted-foreground">
                    Ainda não adicionaste nenhuma slot
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {slots.map((slot, index) => (
                    <SlotCard
                      key={slot.id}
                      slot={slot}
                      index={index}
                      huntPhase={bonusHunt.hunt_phase}
                      isCurrentSlot={index === currentSlotIndex}
                      onOpen={openSlot}
                      onDelete={deleteSlot}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Complete Hunt Button */}
            <div className="flex justify-center">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
                    <Check className="w-4 h-4 mr-2" />
                    Concluir Bonus Hunt
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-card border-border">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Concluir Bonus Hunt?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação vai marcar o bonus hunt como concluído. 
                      Poderás depois criar um novo.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={completeBonusHunt}>
                      Concluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default BonusHuntPage;
