import { Menu } from "lucide-react";

interface SidebarTriggerProps {
  onClick: () => void;
}

const SidebarTrigger = ({ onClick }: SidebarTriggerProps) => {
  return (
    <button
      onClick={onClick}
      className="fixed top-4 left-4 z-30 p-3 rounded-xl bg-card/80 backdrop-blur-sm border border-border/50 hover:border-primary/30 hover:bg-card transition-all duration-200 group"
      aria-label="Abrir menu"
    >
      <Menu className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
    </button>
  );
};

export default SidebarTrigger;
