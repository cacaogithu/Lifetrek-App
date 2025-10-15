import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useState } from "react";
import { Microscope, Cog, Sparkles, Shield } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Capability {
  id: string;
  icon: React.ElementType;
  title: string;
  stat: string;
  description: string;
  color: string;
  bg: string;
}

const getCapabilities = (t: (key: string) => string): Capability[] => [
  {
    id: "precision",
    icon: Cog,
    title: t("interactive.capabilities.precision.title"),
    stat: t("interactive.capabilities.precision.stat"),
    description: t("interactive.capabilities.precision.description"),
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    id: "metrology",
    icon: Microscope,
    title: t("interactive.capabilities.metrology.title"),
    stat: t("interactive.capabilities.metrology.stat"),
    description: t("interactive.capabilities.metrology.description"),
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    id: "finishing",
    icon: Sparkles,
    title: t("interactive.capabilities.finishing.title"),
    stat: t("interactive.capabilities.finishing.stat"),
    description: t("interactive.capabilities.finishing.description"),
    color: "text-accent-orange",
    bg: "bg-accent-orange/10",
  },
  {
    id: "cleanroom",
    icon: Shield,
    title: t("interactive.capabilities.cleanroom.title"),
    stat: t("interactive.capabilities.cleanroom.stat"),
    description: t("interactive.capabilities.cleanroom.description"),
    color: "text-primary",
    bg: "bg-primary/10",
  },
];

export const InteractiveCapabilities = () => {
  const { elementRef, isVisible } = useScrollAnimation({
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px',
    triggerOnce: true
  });
  const [activeId, setActiveId] = useState<string | null>(null);
  const { t } = useLanguage();
  const capabilities = getCapabilities(t);

  return (
    <section ref={elementRef} className="py-20 sm:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-4 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {t("interactive.capabilities.title")}
          </h2>
          <p className={`text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto transition-all duration-1000 delay-150 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {t("interactive.capabilities.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {capabilities.map((capability, index) => {
            const isActive = activeId === capability.id;
            
            return (
              <div
                key={capability.id}
                className={`glass-card p-6 rounded-xl cursor-pointer transition-all duration-500 hover:scale-105 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                } ${isActive ? 'ring-2 ring-primary shadow-[var(--shadow-premium)]' : ''}`}
                style={{ transitionDelay: `${index * 100}ms` }}
                onMouseEnter={() => setActiveId(capability.id)}
                onMouseLeave={() => setActiveId(null)}
              >
                <div className={`text-4xl font-bold mb-4 ${capability.color} transition-all duration-300 ${isActive ? 'scale-110' : ''}`}>
                  {capability.stat}
                </div>
                
                <h3 className="text-xl font-bold mb-3">{capability.title}</h3>
                
                <div 
                  className="overflow-hidden transition-all duration-500"
                  style={{ 
                    maxHeight: isActive ? '200px' : '0px',
                    opacity: isActive ? 1 : 0 
                  }}
                >
                  <p className="text-muted-foreground leading-relaxed">
                    {capability.description}
                  </p>
                </div>
                
                {!isActive && (
                  <p className="text-sm text-muted-foreground/70 mt-2">
                    {t("interactive.capabilities.hover")}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};