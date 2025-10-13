import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useState } from "react";
import { Microscope, Cog, Sparkles, Shield } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface Capability {
  id: string;
  icon: React.ElementType;
  title: string;
  stat: string;
  description: string;
  color: string;
  bg: string;
}

const capabilities: Capability[] = [
  {
    id: "precision",
    icon: Cog,
    title: "Swiss CNC Precision",
    stat: "±0.001mm",
    description: "Multi-axis Swiss-type CNC lathes with live tooling. Capable of producing complex medical components with micron-level accuracy for implants and instruments.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    id: "metrology",
    icon: Microscope,
    title: "Advanced Metrology",
    stat: "ISO 17025",
    description: "ZEISS CMM 3D coordinate measuring, optical comparators, and metallographic analysis. Complete dimensional verification and material testing capabilities.",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    id: "finishing",
    icon: Sparkles,
    title: "Electropolishing",
    stat: "Ra < 0.1μm",
    description: "State-of-the-art electropolishing line producing mirror finishes. Enhances corrosion resistance and biocompatibility for surgical and implantable devices.",
    color: "text-accent-orange",
    bg: "bg-accent-orange/10",
  },
  {
    id: "cleanroom",
    icon: Shield,
    title: "ISO 7 Cleanroom",
    stat: "Class 10,000",
    description: "Climate-controlled cleanroom environments for sterile medical device assembly and packaging. Full traceability and documentation for regulatory compliance.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
];

export const InteractiveCapabilities = () => {
  const { elementRef, isVisible } = useScrollAnimation();
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <section ref={elementRef} className="py-20 sm:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-4 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            Core Capabilities
          </h2>
          <p className={`text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto transition-all duration-1000 delay-150 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            World-class manufacturing and quality assurance systems
          </p>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full max-w-7xl mx-auto"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {capabilities.map((capability, index) => {
              const isActive = activeId === capability.id;
              
              return (
                <CarouselItem key={capability.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                  <div
                    className={`glass-card p-6 rounded-xl cursor-pointer transition-all duration-500 hover:scale-105 h-full ${
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
                        Hover for details
                      </p>
                    )}
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      </div>
    </section>
  );
};