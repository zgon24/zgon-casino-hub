import { useState, useEffect } from "react";
import { Tv, ExternalLink, Play } from "lucide-react";
import streamOfflineImg from "@/assets/stream-offline.png";

const CHANNEL = "zgon__24";
const TWITCH_URL = "https://www.twitch.tv/zgon__24";

const TwitchSection = () => {
  const [parentDomain, setParentDomain] = useState("");
  const [showPlayer, setShowPlayer] = useState(false);

  useEffect(() => {
    setParentDomain(window.location.hostname);
  }, []);

  const embedUrl = parentDomain
    ? `https://player.twitch.tv/?channel=${CHANNEL}&parent=${parentDomain}&autoplay=true`
    : null;

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-background to-card/30">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10">
              <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-40 animate-ping" />
              <Tv className="relative w-5 h-5 text-red-500" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              <span className="text-red-500">LIVE</span> na Twitch
            </h2>
          </div>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Acompanha as streams do ZGON em direto! Slots, bonus hunts e muito mais.
          </p>
        </div>

        {/* Player container */}
        <div className="relative max-w-4xl mx-auto rounded-2xl overflow-hidden border border-border/50 shadow-2xl shadow-black/40">
          {/* Glow behind */}
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/30 via-primary/20 to-purple-600/30 rounded-2xl blur-lg pointer-events-none" />

          <div className="relative bg-card rounded-2xl overflow-hidden">
            {/* Title bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-border/30">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="w-3 h-3 rounded-full bg-yellow-400" />
                  <span className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className="text-xs text-muted-foreground ml-2 font-mono">
                  twitch.tv/{CHANNEL}
                </span>
              </div>
              <a
                href={TWITCH_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors font-medium"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Abrir na Twitch
              </a>
            </div>

            {/* Player / Offline image */}
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              {showPlayer && embedUrl ? (
                <iframe
                  src={embedUrl}
                  className="absolute inset-0 w-full h-full"
                  allowFullScreen
                  title={`${CHANNEL} Twitch Stream`}
                />
              ) : (
                <div className="absolute inset-0">
                  <img
                    src={streamOfflineImg}
                    alt="Stream Offline"
                    className="w-full h-full object-cover"
                  />
                  {/* Play overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/30">
                    <button
                      onClick={() => setShowPlayer(true)}
                      className="flex items-center gap-3 bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-bold px-8 py-4 rounded-full text-lg transition-all shadow-2xl shadow-purple-900/60"
                    >
                      <Play className="w-6 h-6 fill-white" />
                      Ver Stream
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer bar */}
            <div className="px-4 py-3 bg-zinc-900 border-t border-border/30 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                🎮 Slots, bonus hunts e muito mais — ao vivo!
              </p>
              <a
                href={TWITCH_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-3 py-1.5 rounded-full transition-colors"
              >
                <Tv className="w-3 h-3" />
                Seguir
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TwitchSection;
