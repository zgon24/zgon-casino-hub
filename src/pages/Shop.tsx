import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AppSidebar from "@/components/AppSidebar";
import SidebarTrigger from "@/components/SidebarTrigger";
import { ShoppingBag, Coins, Gift, AlertCircle, CheckCircle, LogOut, Twitch, BadgeCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

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
  const { user, loading: authLoading, signOut } = useAuth();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [items, setItems] = useState<ShopItem[]>([]);
  const [balance, setBalance] = useState(0);
  const [loadingItems, setLoadingItems] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [twitchUsername, setTwitchUsername] = useState<string | null>(null);
  const [twitchAvatar, setTwitchAvatar] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);

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
    const { data } = await supabase
      .from("profiles")
      .select("twitch_username, twitch_avatar_url, display_name")
      .eq("user_id", user!.id)
      .single();
    setTwitchUsername(data?.twitch_username ?? null);
    setTwitchAvatar(data?.twitch_avatar_url ?? null);
    setDisplayName(data?.display_name ?? null);
  };

  const handleSignOut = async () => {
    await signOut();
    toast({ title: "Sessão terminada", description: "Até à próxima!" });
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
            <div className="relative bg-gradient-to-br from-card via-card to-[#9146FF]/5 border border-border/50 rounded-2xl p-6 mb-10 overflow-hidden">
              {/* decorative glow */}
              <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 bg-[#9146FF]/10 blur-3xl rounded-full" />
              <div className="pointer-events-none absolute -bottom-20 -left-20 w-64 h-64 bg-primary/10 blur-3xl rounded-full" />

              <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                {/* Points */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full" />
                    <div className="relative bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 p-3.5 rounded-2xl">
                      <Coins className="w-7 h-7 text-primary" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Os teus pontos</p>
                    <p className="text-3xl font-extrabold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                      {balance.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Divider on desktop */}
                <div className="hidden md:block h-16 w-px bg-border/50" />

                {/* Twitch profile */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-[#9146FF]/40 blur-lg rounded-full" />
                    <Avatar className="relative w-14 h-14 ring-2 ring-[#9146FF] ring-offset-2 ring-offset-card">
                      <AvatarImage src={twitchAvatar ?? undefined} alt={twitchUsername ?? "Avatar"} />
                      <AvatarFallback className="bg-[#9146FF]/20 text-[#9146FF] font-bold">
                        {(twitchUsername ?? user.email ?? "?").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 bg-[#9146FF] rounded-full p-1 ring-2 ring-card">
                      <Twitch className="w-3 h-3 text-white fill-white" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Conta Twitch</p>
                      <BadgeCheck className="w-3.5 h-3.5 text-[#9146FF]" />
                    </div>
                    <p className="text-base font-bold text-foreground">
                      {displayName ?? twitchUsername ?? "—"}
                    </p>
                    {twitchUsername && (
                      <p className="text-xs text-[#9146FF]">@{twitchUsername}</p>
                    )}
                  </div>
                </div>

                {/* Logout */}
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  size="sm"
                  className="border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
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
                <p>Entra com a tua conta Twitch</p>
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
