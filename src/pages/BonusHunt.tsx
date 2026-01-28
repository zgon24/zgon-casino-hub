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
  Trash2, 
  Play, 
  Check, 
  Copy, 
  LogOut, 
  Trophy,
  ArrowLeft,
  Loader2,
  GripVertical
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  created_at: string;
}

const BonusHuntPage = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [bonusHunt, setBonusHunt] = useState<BonusHunt | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [huntName, setHuntName] = useState("Bonus Hunt");

  // New slot form
  const [newSlotName, setNewSlotName] = useState("");
  const [newBetSize, setNewBetSize] = useState("");
  const [newCost, setNewCost] = useState("");

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
    
    // Try to find an active bonus hunt
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
      const hunt = hunts[0] as BonusHunt;
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

    setSlots((data as Slot[]) || []);
  };

  const createNewBonusHunt = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("bonus_hunts")
      .insert({
        user_id: user.id,
        name: huntName,
        status: "active",
        total_cost: 0,
        total_result: 0,
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

    setBonusHunt(data as BonusHunt);
    setSlots([]);
    toast({
      title: "Bonus Hunt criado!",
      description: "Podes agora adicionar slots",
    });
  };

  const addSlot = async () => {
    if (!bonusHunt || !newSlotName || !newBetSize || !newCost) return;

    const betSize = parseFloat(newBetSize);
    const cost = parseFloat(newCost);

    if (isNaN(betSize) || isNaN(cost)) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Valores inválidos",
      });
      return;
    }

    const { data, error } = await supabase
      .from("slots")
      .insert({
        bonus_hunt_id: bonusHunt.id,
        slot_name: newSlotName,
        bet_size: betSize,
        cost: cost,
        status: "pending",
        slot_order: slots.length,
      })
      .select()
      .single();

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível adicionar o slot",
      });
      return;
    }

    setSlots([...slots, data as Slot]);
    setNewSlotName("");
    setNewBetSize("");
    setNewCost("");

    // Update total cost
    await updateTotals([...slots, data as Slot]);
  };

  const openSlot = async (slotId: string, result: number) => {
    const { error } = await supabase
      .from("slots")
      .update({ status: "opened", result })
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
      s.id === slotId ? { ...s, status: "opened" as const, result } : s
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

    const totalCost = currentSlots.reduce((sum, s) => sum + s.cost, 0);
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalCost = bonusHunt?.total_cost || 0;
  const totalResult = bonusHunt?.total_result || 0;
  const profit = totalResult - totalCost;
  const profitMultiplier = totalCost > 0 ? (totalResult / totalCost).toFixed(2) : "0.00";

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
              <Input
                placeholder="Nome do Bonus Hunt"
                value={huntName}
                onChange={(e) => setHuntName(e.target.value)}
                className="bg-secondary/50"
              />
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
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-border/50 bg-card/50">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Total Gasto</p>
                  <p className="text-2xl font-bold text-foreground">€{totalCost.toFixed(2)}</p>
                </CardContent>
              </Card>
              <Card className="border-border/50 bg-card/50">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Total Ganho</p>
                  <p className="text-2xl font-bold text-primary">€{totalResult.toFixed(2)}</p>
                </CardContent>
              </Card>
              <Card className="border-border/50 bg-card/50">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Lucro/Prejuízo</p>
                  <p className={`text-2xl font-bold ${profit >= 0 ? "text-green-500" : "text-destructive"}`}>
                    €{profit.toFixed(2)}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/50 bg-card/50">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Multiplicador</p>
                  <p className="text-2xl font-bold text-foreground">{profitMultiplier}x</p>
                </CardContent>
              </Card>
            </div>

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
                  <Button 
                    onClick={copyWidgetUrl} 
                    variant="outline"
                    className="shrink-0"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar Link
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Add Slot Form */}
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle className="text-lg">Adicionar Slot</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <Input
                    placeholder="Nome da Slot"
                    value={newSlotName}
                    onChange={(e) => setNewSlotName(e.target.value)}
                    className="bg-secondary/50"
                  />
                  <Input
                    placeholder="Bet Size (€)"
                    type="number"
                    step="0.01"
                    value={newBetSize}
                    onChange={(e) => setNewBetSize(e.target.value)}
                    className="bg-secondary/50"
                  />
                  <Input
                    placeholder="Custo Total (€)"
                    type="number"
                    step="0.01"
                    value={newCost}
                    onChange={(e) => setNewCost(e.target.value)}
                    className="bg-secondary/50"
                  />
                  <Button 
                    onClick={addSlot} 
                    className="btn-gold text-primary-foreground font-semibold"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Slots Table */}
            <Card className="border-border/50 bg-card/50 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg">
                  Slots ({slots.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/50">
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Slot</TableHead>
                        <TableHead className="text-right">Bet</TableHead>
                        <TableHead className="text-right">Custo</TableHead>
                        <TableHead className="text-right">Resultado</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {slots.map((slot, index) => (
                        <SlotRow
                          key={slot.id}
                          slot={slot}
                          index={index}
                          onOpen={openSlot}
                          onDelete={deleteSlot}
                        />
                      ))}
                      {slots.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            Ainda não adicionaste nenhuma slot
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

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

// Slot Row Component
interface SlotRowProps {
  slot: Slot;
  index: number;
  onOpen: (id: string, result: number) => void;
  onDelete: (id: string) => void;
}

const SlotRow = ({ slot, index, onOpen, onDelete }: SlotRowProps) => {
  const [result, setResult] = useState("");
  const [showResultInput, setShowResultInput] = useState(false);

  const handleOpen = () => {
    const resultValue = parseFloat(result);
    if (!isNaN(resultValue)) {
      onOpen(slot.id, resultValue);
      setShowResultInput(false);
      setResult("");
    }
  };

  return (
    <TableRow className="border-border/50">
      <TableCell className="font-mono text-muted-foreground">{index + 1}</TableCell>
      <TableCell className="font-medium">{slot.slot_name}</TableCell>
      <TableCell className="text-right">€{slot.bet_size.toFixed(2)}</TableCell>
      <TableCell className="text-right">€{slot.cost.toFixed(2)}</TableCell>
      <TableCell className="text-right">
        {slot.status === "opened" ? (
          <span className="text-primary font-semibold">€{slot.result?.toFixed(2)}</span>
        ) : showResultInput ? (
          <div className="flex items-center gap-2 justify-end">
            <Input
              type="number"
              step="0.01"
              value={result}
              onChange={(e) => setResult(e.target.value)}
              className="w-24 h-8 bg-secondary/50 text-right"
              placeholder="€"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleOpen()}
            />
            <Button size="sm" variant="ghost" onClick={handleOpen}>
              <Check className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell className="text-center">
        {slot.status === "opened" ? (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
            Aberto
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary text-muted-foreground">
            Pendente
          </span>
        )}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          {slot.status === "pending" && !showResultInput && (
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setShowResultInput(true)}
              className="text-primary hover:text-primary"
            >
              <Play className="w-4 h-4" />
            </Button>
          )}
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => onDelete(slot.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default BonusHuntPage;
