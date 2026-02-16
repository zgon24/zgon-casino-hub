import { useState } from "react";
import { HelpCircle } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CasinoCardProps {
  name: string;
  url: string;
  logo?: string;
  banner?: string;
  code?: string;
  codeHelp?: string;
  note?: string;
  freeSpins?: number;
}

const CasinoCard = ({ name, url, logo, banner, code, codeHelp, note, freeSpins }: CasinoCardProps) => {
  const [showDialog, setShowDialog] = useState(false);

  const handleConfirm = () => {
    window.open(url, "_blank", "noopener,noreferrer");
    setShowDialog(false);
  };

  return (
    <>
      {banner ? (
        /* Banner-style card for casinos with promotional images */
        <div
          onClick={() => setShowDialog(true)}
          className="group relative rounded-2xl overflow-hidden border border-border/50 hover:border-primary/30 transition-all duration-500 hover:scale-[1.02] cursor-pointer"
        >
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
          {freeSpins && (
            <div className="absolute top-3 right-3 z-20 bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-lg">
              🎰 {freeSpins} Free Spins
            </div>
          )}
          <img src={banner} alt={name} className="w-full h-auto object-cover" />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/95 via-background/60 to-transparent p-4 pt-10">
            <button
              onClick={(e) => { e.stopPropagation(); setShowDialog(true); }}
              className="btn-gold w-full py-3 px-6 rounded-xl font-bold text-primary-foreground uppercase tracking-wide text-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              Registar Agora
            </button>
          </div>
        </div>
      ) : (
        /* Original logo-style card */
        <div 
          onClick={() => setShowDialog(true)}
          className="group relative card-elevated rounded-2xl p-8 border border-border/50 hover:border-primary/30 transition-all duration-500 hover:scale-[1.02] cursor-pointer"
        >
          <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative z-10 flex flex-col items-center space-y-6">
            <div className="w-32 h-32 rounded-xl bg-secondary/50 flex items-center justify-center border border-border/50 group-hover:border-primary/30 transition-colors duration-300 overflow-hidden">
              {logo ? (
                <img src={logo} alt={name} className="w-full h-full object-contain p-2" />
              ) : (
                <span className="text-2xl font-bold text-muted-foreground">{name.charAt(0)}</span>
              )}
            </div>
            
            <h3 className="text-xl font-semibold text-foreground">{name}</h3>
            {code && (
              <div className="flex items-center gap-1.5 -mt-4">
                <p className="text-sm text-primary font-medium">
                  Código: <span className="font-bold">{code}</span>
                </p>
                {codeHelp && (
                  <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-muted-foreground hover:text-primary transition-colors">
                          <HelpCircle className="w-4 h-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent 
                        side="top" 
                        className="max-w-xs bg-card border-border text-foreground p-3 text-xs leading-relaxed"
                      >
                        {codeHelp}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            )}
            {note && (
              <p className="text-xs text-muted-foreground -mt-3">{note}</p>
            )}
            
            <button
              onClick={() => setShowDialog(true)}
              className="btn-gold w-full py-4 px-8 rounded-xl font-bold text-primary-foreground uppercase tracking-wide text-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              Jogar Agora
            </button>
          </div>
        </div>
      )}

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
