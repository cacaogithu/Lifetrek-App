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
    color: "text-white",
    bg: "bg-primary/10",
  },
  {
    id: "metrology",
    icon: Microscope,
    title: t("interactive.capabilities.metrology.title"),
    stat: t("interactive.capabilities.metrology.stat"),
    description: t("interactive.capabilities.metrology.description"),
    color: "text-white",
    bg: "bg-accent/10",
  },
  {
    id: "finishing",
    icon: Sparkles,
    title: t("interactive.capabilities.finishing.title"),
    stat: t("interactive.capabilities.finishing.stat"),
    description: t("interactive.capabilities.finishing.description"),
    color: "text-white",
    bg: "bg-accent-orange/10",
  },
  {
    id: "cleanroom",
    icon: Shield,
    title: t("interactive.capabilities.cleanroom.title"),
    stat: t("interactive.capabilities.cleanroom.stat"),
    description: t("interactive.capabilities.cleanroom.description"),
    color: "text-white",
    bg: "bg-primary/10",
  },
];

export const InteractiveCapabilities = () => {
  const { elementRef, isVisible } = useScrollAnimation();
  const [activeId, setActiveId] = useState<string | null>(null);
  const { t } = useLanguage();
  const capabilities = getCapabilities(t);

  return (
    <section ref={elementRef} className="py-20 sm:py-32 bg-gradient-to-br from-primary via-accent to-primary text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-4 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {t("interactive.capabilities.title")}
          </h2>
          <p className={`text-lg sm:text-xl text-white/90 max-w-3xl mx-auto transition-all duration-1000 delay-150 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
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
                } ${isActive ? 'ring-2 ring-white/50 shadow-[var(--shadow-premium)]' : ''}`}
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
                  <p className="text-white/80 leading-relaxed">
                    {capability.description}
                  </p>
                </div>
                
                {!isActive && (
                  <p className="text-sm text-white/60 mt-2">
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