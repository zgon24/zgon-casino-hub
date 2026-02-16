import { useRef, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CasinoCard from "./CasinoCard";
import { casinos } from "@/data/casinos";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";

const CasinosSection = () => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    dragFree: true,
  });

  // Continuous smooth scroll via requestAnimationFrame
  const rafRef = useRef<number>();
  const speedRef = useRef(0.5); // pixels per frame

  const animate = useCallback(() => {
    if (!emblaApi) return;
    const engine = (emblaApi as any).internalEngine();
    if (!engine) return;
    engine.location.add(-speedRef.current);
    engine.target.set(engine.location);
    engine.scrollLooper.loop(-1);
    engine.slideLooper.loop();
    engine.translate.to(engine.location);
    rafRef.current = requestAnimationFrame(animate);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    if (!isHovered) {
      rafRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [emblaApi, isHovered, animate]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

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

        {/* Carousel */}
        <div className="relative max-w-5xl mx-auto group/carousel">
          {/* Arrows */}
          <button
            onClick={scrollPrev}
            className="absolute -left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full border border-border bg-card text-foreground flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors opacity-0 group-hover/carousel:opacity-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full border border-border bg-card text-foreground flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors opacity-0 group-hover/carousel:opacity-100"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div
            ref={emblaRef}
            className="overflow-hidden"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="flex gap-6">
              {casinos.map((casino) => (
                <div
                  key={casino.name}
                  className="flex-[0_0_280px] min-w-0 transition-transform duration-300 hover:scale-105"
                >
                  <CasinoCard {...casino} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ver todos link */}
        <div className="text-center mt-10">
          <button
            onClick={() => navigate("/casinos")}
            className="text-primary hover:text-primary/80 font-semibold text-sm uppercase tracking-wider transition-colors"
          >
            Ver todos os casinos →
          </button>
        </div>
      </div>
    </section>
  );
};

export default CasinosSection;
