import { useCallback, useMemo, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import CasinoCard from "./CasinoCard";
import { casinos } from "@/data/casinos";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";

function getNextWednesday18h(): Date {
  const now = new Date();
  const target = new Date(now);
  const day = target.getUTCDay();
  const daysUntilWed = (3 - day + 7) % 7 || 7;
  target.setUTCDate(target.getUTCDate() + daysUntilWed);
  target.setUTCHours(18, 0, 0, 0);
  if (target <= now) target.setUTCDate(target.getUTCDate() + 7);
  return target;
}

const SPEED = 1.2; // pixels per frame

const CasinosSection = () => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const isHoveredRef = useRef(false);
  const rafRef = useRef<number>();

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    dragFree: true,
    watchDrag: true,
  });

  const tick = useCallback(() => {
    if (!emblaApi || isHoveredRef.current) return;
    const engine = (emblaApi as any).internalEngine();
    if (!engine) return;
    engine.location.add(-SPEED);
    engine.target.set(engine.location);
    engine.scrollLooper.loop(-1);
    engine.slideLooper.loop();
    engine.translate.to(engine.location);
    rafRef.current = requestAnimationFrame(tick);
  }, [emblaApi]);

  // Start loop when embla is ready
  useEffect(() => {
    if (!emblaApi) return;
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [emblaApi, tick]);

  const handleMouseEnter = useCallback(() => {
    isHoveredRef.current = true;
    setIsHovered(true);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  const handleMouseLeave = useCallback(() => {
    isHoveredRef.current = false;
    setIsHovered(false);
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const revealDate = useMemo(() => getNextWednesday18h(), []);

  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Casinos <span className="text-gradient-gold">Patrocinados</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Os melhores casinos online recomendados pelo ZGON. Joga com responsabilidade.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto group/carousel">
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
            className="overflow-hidden cursor-grab active:cursor-grabbing"
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
