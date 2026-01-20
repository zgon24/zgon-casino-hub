import { Music2, Twitter } from "lucide-react";

// Custom brand icons with official colors
const DiscordIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#5865F2">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

const TelegramIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#26A5E4">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

const TwitchIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#9146FF">
    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/>
  </svg>
);

const YouTubeIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#FF0000">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

interface SocialLink {
  name: string;
  icon: React.ReactNode;
  url: string | null;
  comingSoon?: boolean;
}

const socialLinks: SocialLink[] = [
  {
    name: "Discord",
    icon: <DiscordIcon />,
    url: "https://discord.gg/zE9cEUqq",
    comingSoon: false,
  },
  {
    name: "Telegram",
    icon: <TelegramIcon />,
    url: "https://t.me/+fRwEvWUMGzA3YWE0",
    comingSoon: false,
  },
  {
    name: "Twitch",
    icon: <TwitchIcon />,
    url: "https://www.twitch.tv/zgon__24",
    comingSoon: false,
  },
  {
    name: "YouTube",
    icon: <YouTubeIcon />,
    url: "https://www.youtube.com/@zgon24",
    comingSoon: false,
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
];

const SocialLinks = () => {
  return (
    <section id="redes-sociais" className="py-20 px-4 bg-gradient-to-b from-background to-card/30">
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
