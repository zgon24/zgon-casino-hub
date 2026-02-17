import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import CasinoCard from "@/components/CasinoCard";
import { casinos } from "@/data/casinos";
import zgonAvatar from "@/assets/zgon-avatar.png";
import AppSidebar from "@/components/AppSidebar";
import SidebarTrigger from "@/components/SidebarTrigger";
import Footer from "@/components/Footer";

function getNextWednesday18h(): Date {
  const now = new Date();
  const target = new Date(now);
  const day = target.getUTCDay();
  const daysUntilWed = (3 - day + 7) % 7 || 7;
  target.setUTCDate(target.getUTCDate() + daysUntilWed);
  target.setUTCHours(18, 0, 0, 0);
  if (target <= now) target.setUTCDate(target.getUTCDate() + 7);
  return target;
}

const Casinos = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const revealDate = useMemo(() => getNextWednesday18h(), []);
  return (
    <div className="min-h-screen bg-background">
      <SidebarTrigger onClick={() => setSidebarOpen(true)} />
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Header */}
      <header className="relative py-16 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-card/50 to-background" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Voltar</span>
          </button>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full border-2 border-primary/50 overflow-hidden">
              <img src={zgonAvatar} alt="ZGON" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gradient-gold">ZGON</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Todos os casinos patrocinados pelo ZGON
          </p>
        </div>
      </header>

      {/* Casino grid */}
      <main className="px-4 pb-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {casinos.map((casino, index) => {
            const isComingSoon = index >= casinos.length - 3;
            return (
              <div
                key={casino.name}
                className="animate-fade-in transition-transform duration-300 hover:scale-105"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CasinoCard {...casino} comingSoon={isComingSoon} revealDate={revealDate} />
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Casinos;
