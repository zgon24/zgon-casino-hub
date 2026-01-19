import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CasinoCardProps {
  name: string;
  url: string;
  logoPlaceholder?: string;
}

const CasinoCard = ({ name, url, logoPlaceholder }: CasinoCardProps) => {
  const [showDialog, setShowDialog] = useState(false);

  const handleConfirm = () => {
    window.open(url, "_blank", "noopener,noreferrer");
    setShowDialog(false);
  };

  return (
    <>
      <div className="group relative card-elevated rounded-2xl p-8 border border-border/50 hover:border-primary/30 transition-all duration-500 hover:scale-[1.02]">
        {/* Glow effect on hover */}
        <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative z-10 flex flex-col items-center space-y-6">
          {/* Logo placeholder */}
          <div className="w-24 h-24 rounded-xl bg-secondary flex items-center justify-center border border-border/50 group-hover:border-primary/30 transition-colors duration-300">
            {logoPlaceholder ? (
              <img src={logoPlaceholder} alt={name} className="w-16 h-16 object-contain" />
            ) : (
              <span className="text-2xl font-bold text-muted-foreground">{name.charAt(0)}</span>
            )}
          </div>
          
          {/* Casino name */}
          <h3 className="text-xl font-semibold text-foreground">{name}</h3>
          
          {/* Play button */}
          <button
            onClick={() => setShowDialog(true)}
            className="btn-gold w-full py-4 px-8 rounded-xl font-bold text-primary-foreground uppercase tracking-wide text-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            Jogar Agora
          </button>
        </div>
      </div>

      {/* +18 Confirmation Dialog */}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-center">
              <span className="text-primary">+18</span> – Tem certeza que quer continuar?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-muted-foreground">
              Este site contém conteúdo de jogos de azar destinado apenas a maiores de 18 anos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row justify-center gap-4 sm:justify-center">
            <AlertDialogCancel className="bg-secondary hover:bg-secondary/80 text-foreground border-border m-0">
              Não
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className="btn-gold text-primary-foreground m-0"
            >
              Sim, tenho +18
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CasinoCard;
