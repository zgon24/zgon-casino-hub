import CasinoCard from "./CasinoCard";
import stakeLogo from "@/assets/stake-logo.png";
import flagmanLogo from "@/assets/flagman-logo.png";
import lebullLogo from "@/assets/lebull-logo.png";

const casinos = [
  {
    name: "Stake",
    url: "https://stake.com/",
    logo: stakeLogo,
    note: "(Necessário VPN para aceder)",
  },
  {
    name: "Flagman",
    url: "https://flagman-fjfjy.com/",
    logo: flagmanLogo,
  },
  {
    name: "LeBull",
    url: "https://www.lebull.pt/?partner=p71175p72304p7426#registration",
    logo: lebullLogo,
  },
];

const CasinosSection = () => {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Casinos <span className="text-gradient-gold">Patrocinados</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Os melhores casinos online recomendados pelo ZGON. Joga com responsabilidade.
          </p>
        </div>

        {/* Casino cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {casinos.map((casino, index) => (
            <div
              key={casino.name}
              className="animate-fadeIn"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <CasinoCard
                name={casino.name}
                url={casino.url}
                logo={casino.logo}
                note={(casino as any).note}
              />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default CasinosSection;
