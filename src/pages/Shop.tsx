import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AppSidebar from "@/components/AppSidebar";
import SidebarTrigger from "@/components/SidebarTrigger";
import { ShoppingBag, Coins, Gift, Star, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface ShopItem {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  point_cost: number;
  stock: number | null;
  is_active: boolean;
}

const Shop = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [items, setItems] = useState<ShopItem[]>([]);
  const [balance, setBalance] = useState(0);
  const [loadingItems, setLoadingItems] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [twitchUsername, setTwitchUsername] = useState<string | null>(null);
  const [editingTwitch, setEditingTwitch] = useState(false);
  const [twitchInput, setTwitchInput] = useState("");

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (user) {
      fetchBalance();
      fetchTwitchUsername();
    }
  }, [user]);

  const fetchItems = async () => {
    const { data } = await supabase.from("shop_items").select("*").eq("is_active", true);
    setItems(data ?? []);
    setLoadingItems(false);
  };

  const fetchBalance = async () => {
    const { data } = await supabase.from("user_points").select("balance").eq("user_id", user!.id).single();
    setBalance(data?.balance ?? 0);
  };

  const fetchTwitchUsername = async () => {
    const { data } = await supabase.from("profiles").select("twitch_username").eq("user_id", user!.id).single();
    setTwitchUsername(data?.twitch_username ?? null);
    setTwitchInput(data?.twitch_username ?? "");
  };

  const saveTwitchUsername = async () => {
    const username = twitchInput.trim().toLowerCase();
    if (!username) return;
    const { error } = await supabase
      .from("profiles")
      .update({ twitch_username: username })
      .eq("user_id", user!.id);
    if (error) {
      toast({ title: "Erro", description: "Não foi possível guardar o username. Talvez já esteja a ser usado.", variant: "destructive" });
    } else {
      setTwitchUsername(username);
      setEditingTwitch(false);
      toast({ title: "Guardado!", description: "O teu username da Twitch foi ligado à conta." });
    }
  };

  const handleRedeem = async (item: ShopItem) => {
    if (!user) return;
    setRedeeming(item.id);
    const { data, error } = await supabase.rpc("redeem_item", {
      p_user_id: user.id,
      p_item_id: item.id,
    });
    setRedeeming(null);

    if (error) {
      toast({ title: "Erro", description: "Ocorreu um erro ao resgatar.", variant: "destructive" });
      return;
    }

    const result = data as { success: boolean; error?: string };
    if (result?.success) {
      toast({ title: "Resgatado! 🎉", description: `Resgataste "${item.name}" com sucesso!` });
      fetchBalance();
      fetchItems();
    } else {
      toast({ title: "Erro", description: result?.error ?? "Não foi possível resgatar.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SidebarTrigger onClick={() => setSidebarOpen(true)} />
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header />

      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Title */}
          <div className="text-center mb-12 space-y-4">
            <div className="flex items-center justify-center gap-3">
              <ShoppingBag className="w-8 h-8 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">Loja de Pontos</h1>
            </div>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Ganha pontos ao assistir à live e troca por recompensas exclusivas!
            </p>
          </div>

          {/* User Info Bar */}
          {user ? (
            <div className="bg-card border border-border/50 rounded-2xl p-6 mb-10 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-xl">
                  <Coins className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Os teus pontos</p>
                  <p className="text-2xl font-bold text-foreground">{balance.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-accent/10 p-3 rounded-xl">
                  <Star className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Twitch Username</p>
                  {editingTwitch ? (
                    <div className="flex gap-2">
                      <input
                        value={twitchInput}
                        onChange={(e) => setTwitchInput(e.target.value)}
                        placeholder="o_teu_username"
                        className="bg-background border border-border rounded-lg px-3 py-1 text-sm text-foreground w-40"
                      />
                      <button onClick={saveTwitchUsername} className="text-xs bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1 rounded-lg transition-colors">
                        Guardar
                      </button>
                      <button onClick={() => setEditingTwitch(false)} className="text-xs text-muted-foreground hover:text-foreground">
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingTwitch(true)}
                      className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      {twitchUsername ? `@${twitchUsername}` : "Ligar conta →"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border/50 rounded-2xl p-6 mb-10 flex items-center gap-4 justify-center">
              <AlertCircle className="w-5 h-5 text-primary" />
              <p className="text-muted-foreground">
                <Link to="/auth" className="text-primary hover:underline font-medium">Inicia sessão</Link> para ver os teus pontos e resgatar artigos.
              </p>
            </div>
          )}

          {/* How it works */}
          <div className="bg-card/50 border border-border/30 rounded-2xl p-6 mb-10">
            <h3 className="text-lg font-semibold text-foreground mb-3">Como funciona?</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <span className="text-primary font-bold">1.</span>
                <p>Liga o teu username da Twitch à tua conta</p>
              </div>
              <div className="flex gap-3">
                <span className="text-primary font-bold">2.</span>
                <p>Assiste à live — ganhas <span className="text-foreground font-medium">15 pontos</span> a cada 20 minutos</p>
              </div>
              <div className="flex gap-3">
                <span className="text-primary font-bold">3.</span>
                <p>Troca os pontos por artigos exclusivos na loja!</p>
              </div>
            </div>
          </div>

          {/* Items Grid */}
          {loadingItems ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card border border-border/50 rounded-2xl h-64 animate-pulse" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20">
              <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">Ainda não há artigos na loja. Fica atento!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-card border border-border/50 rounded-2xl overflow-hidden hover:border-primary/30 transition-colors group"
                >
                  {item.image_url && (
                    <div className="aspect-video bg-muted overflow-hidden">
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  )}
                  <div className="p-5 space-y-3">
                    <h3 className="text-lg font-semibold text-foreground">{item.name}</h3>
                    {item.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                    )}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-1.5">
                        <Coins className="w-4 h-4 text-primary" />
                        <span className="font-bold text-foreground">{item.point_cost.toLocaleString()}</span>
                      </div>
                      {item.stock !== null && (
                        <span className="text-xs text-muted-foreground">{item.stock} restantes</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleRedeem(item)}
                      disabled={!user || balance < item.point_cost || redeeming === item.id || (item.stock !== null && item.stock <= 0)}
                      className="w-full mt-2 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      {redeeming === item.id ? (
                        "A resgatar..."
                      ) : (item.stock !== null && item.stock <= 0) ? (
                        "Esgotado"
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Resgatar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Shop;
