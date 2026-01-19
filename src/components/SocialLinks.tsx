import { MessageCircle, Send, Music2, Twitter, Twitch, Youtube } from "lucide-react";

interface SocialLink {
  name: string;
  icon: React.ReactNode;
  url: string | null;
  comingSoon?: boolean;
}

const socialLinks: SocialLink[] = [
  {
    name: "Discord",
    icon: <MessageCircle className="w-6 h-6" />,
    url: null,
    comingSoon: true,
  },
  {
    name: "Telegram",
    icon: <Send className="w-6 h-6" />,
    url: null,
    comingSoon: true,
  },
  {
    name: "TikTok",
    icon: <Music2 className="w-6 h-6" />,
    url: null,
    comingSoon: true,
  },
  {
    name: "X",
    icon: <Twitter className="w-6 h-6" />,
    url: null,
    comingSoon: true,
  },
  {
    name: "Twitch",
    icon: <Twitch className="w-6 h-6" />,
    url: null,
    comingSoon: true,
  },
  {
    name: "YouTube",
    icon: <Youtube className="w-6 h-6" />,
    url: null,
    comingSoon: true,
  },
];

const SocialLinks = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-card/30">
      <div className="max-w-4xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Redes <span className="text-gradient-gold">Sociais</span>
          </h2>
          <p className="text-muted-foreground">
            Segue o ZGON em todas as plataformas
          </p>
        </div>

        {/* Social icons grid */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 md:gap-6">
          {socialLinks.map((social, index) => (
            <div
              key={social.name}
              className="animate-fadeIn"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {social.url && !social.comingSoon ? (
                <a
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center gap-3 p-4 rounded-xl bg-secondary/50 border border-border/50 hover:border-primary/50 hover:bg-secondary transition-all duration-300"
                >
                  <div className="text-muted-foreground group-hover:text-primary transition-colors duration-300">
                    {social.icon}
                  </div>
                  <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                    {social.name}
                  </span>
                </a>
              ) : (
                <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-secondary/30 border border-border/30 opacity-60 cursor-not-allowed">
                  <div className="text-muted-foreground/50">
                    {social.icon}
                  </div>
                  <span className="text-xs font-medium text-muted-foreground/50">
                    Em breve
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialLinks;
