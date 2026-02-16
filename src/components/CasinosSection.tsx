import { useRef } from "react";
import CasinoCard from "./CasinoCard";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import stakeLogo from "@/assets/stake-logo.png";
import flagmanLogo from "@/assets/flagman-logo.png";
import lebullLogo from "@/assets/lebull-logo.png";
import legzoBanner from "@/assets/legzo-banner.png";
import flagmanBanner from "@/assets/flagman-banner.png";
import oneGoBanner from "@/assets/1go-banner.png";

const casinos = [
  {
    name: "Stake",
    url: "https://stake.com/?c=r4QBeW03",
    logo: stakeLogo,
    code: "zgonstake",
    codeHelp: "Esqueceste de inserir o código? Podes adicionar até 24h após o registo: Ícone de utilizador → Settings → Offers → Welcome Code",
    note: "(Necessário VPN para aceder)",
  },
  {
    name: "LeBull",
    url: "https://www.lebull.pt/?partner=p71175p72532p7138&utm_source=aff&utm_medium=affiliate&utm_campaign=2026&utm_content=reg-page#registration",
    logo: lebullLogo,
  },
  {
    name: "Legzo",
    url: "https://legzo133.casino/?stag=238310_699379f303fa62b2c7e3e647",
    banner: legzoBanner,
    freeSpins: 50,
  },
  {
    name: "Flagman",
    url: "https://casinoflagman27.com/registration?stag=238310_69937a810bc39d9889c93223&affb_id=97&al_id=546cf128de5df31eafb67fc98352820e&cmp=1325484&prm=250316&tr_src=streamer",
    banner: flagmanBanner,
    freeSpins: 50,
  },
  {
    name: "1Go",
    url: "https://1gocasino62.com/registration?stag=238310_69937a980bc39d9889c93260&affb_id=91&al_id=1e17b6c0b5f25a37a11a616f2d40d59d&cmp=1325487&prm=250319&tr_src=streamer&vredir=2",
    banner: oneGoBanner,
    freeSpins: 50,
  },
];

const CasinosSection = () => {
  const autoplayPlugin = useRef(
    Autoplay({ delay: 2500, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  return (
    <section id="casinos" className="py-20 px-4">
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

        {/* Casino cards carousel */}
        <div className="max-w-5xl mx-auto px-12">
          <Carousel
            opts={{ align: "start", loop: true }}
            plugins={[autoplayPlugin.current]}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {casinos.map((casino) => (
                <CarouselItem key={casino.name} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                  <div className="transition-transform duration-300 hover:scale-105">
                    <CasinoCard
                      name={casino.name}
                      url={casino.url}
                      logo={(casino as any).logo}
                      banner={(casino as any).banner}
                      code={(casino as any).code}
                      codeHelp={(casino as any).codeHelp}
                      note={(casino as any).note}
                      freeSpins={(casino as any).freeSpins}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="border-border bg-card text-foreground hover:bg-primary hover:text-primary-foreground" />
            <CarouselNext className="border-border bg-card text-foreground hover:bg-primary hover:text-primary-foreground" />
          </Carousel>
        </div>

      </div>
    </section>
  );
};

export default CasinosSection;
