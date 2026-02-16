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
import type { Casino } from "@/data/casinos";

interface CasinoCardProps extends Casino {
  compact?: boolean;
}

const CasinoCard = ({ name, url, image, code, codeHelp, note, highlight, compact }: CasinoCardProps) => {
  const [showDialog, setShowDialog] = useState(false);

  const handleConfirm = () => {
    window.open(url, "_blank", "noopener,noreferrer");
    setShowDialog(false);
  };

  return (
    <>
      <div
        onClick={() => setShowDialog(true)}
        className="group relative card-elevated rounded-2xl border border-border/50 hover:border-primary/30 transition-all duration-500 cursor-pointer flex flex-col overflow-hidden h-full"
      >
        <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Image area - fixed aspect ratio */}
        <div className="relative w-full aspect-[16/10] bg-secondary/30 flex items-center justify-center overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info area */}
        <div className="relative z-10 p-4 flex flex-col items-center gap-2 flex-1">
          <h3 className="text-lg font-bold text-foreground">{name}</h3>

          {highlight && (
            <span className="text-xs font-extrabold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
              {highlight}
            </span>
          )}

          {code && (
            <div className="flex items-center gap-1.5">
              <p className="text-sm text-primary font-medium">
                Código: <span className="font-bold">{code}</span>
              </p>
              {codeHelp && (
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
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
            <p className="text-xs text-muted-foreground">{note}</p>
          )}

          <button
            onClick={(e) => { e.stopPropagation(); setShowDialog(true); }}
            className="btn-gold w-full py-3 px-6 rounded-xl font-bold text-primary-foreground uppercase tracking-wide text-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 mt-auto"
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
