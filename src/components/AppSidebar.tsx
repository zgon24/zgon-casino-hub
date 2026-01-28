import { Dices, Share2, HelpCircle, Mail, X, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  {
    title: "Casinos",
    icon: Dices,
    href: "#casinos",
  },
  {
    title: "Redes Sociais",
    icon: Share2,
    href: "#redes-sociais",
  },
  {
    title: "Contacto",
    icon: Mail,
    href: "#contacto",
  },
  {
    title: "BonusHunt",
    icon: Trophy,
    href: "/bonushunt",
    isRoute: true,
  },
  {
    title: "Gambling Help",
    icon: HelpCircle,
    href: "https://www.jogoresponsavel.pt",
    external: true,
  },
];

const AppSidebar = ({ isOpen, onClose }: AppSidebarProps) => {
  const navigate = useNavigate();
  
  const handleClick = (href: string, external?: boolean, isRoute?: boolean) => {
    if (external) {
      window.open(href, "_blank", "noopener,noreferrer");
    } else if (isRoute) {
      navigate(href);
    } else {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-card border-r border-border z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-gradient-gold">ZGON</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary/50 transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.title}
              onClick={() => handleClick(item.href, item.external, (item as any).isRoute)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-foreground hover:bg-secondary/50 hover:text-primary transition-all duration-200 group"
            >
              <item.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="font-medium">{item.title}</span>
              {item.external && (
                <span className="ml-auto text-xs text-muted-foreground">↗</span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            +18 • Joga com responsabilidade
          </p>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
