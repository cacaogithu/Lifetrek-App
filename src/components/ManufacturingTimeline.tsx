import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { FileText, Cog, Microscope, Sparkles, Package, CheckCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface TimelineStep {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  bg: string;
}

const getSteps = (t: (key: string) => string): TimelineStep[] => [
  {
    icon: FileText,
    title: t("timeline.step1.title"),
    description: t("timeline.step1.description"),
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Cog,
    title: t("timeline.step2.title"),
    description: t("timeline.step2.description"),
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: Sparkles,
    title: t("timeline.step3.title"),
    description: t("timeline.step3.description"),
    color: "text-accent-orange",
    bg: "bg-accent-orange/10",
  },
  {
    icon: Microscope,
    title: t("timeline.step4.title"),
    description: t("timeline.step4.description"),
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Package,
    title: t("timeline.step5.title"),
    description: t("timeline.step5.description"),
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: CheckCircle,
    title: t("timeline.step6.title"),
    description: t("timeline.step6.description"),
    color: "text-accent-orange",
    bg: "bg-accent-orange/10",
  },
];

export const ManufacturingTimeline = () => {
  const { elementRef, isVisible } = useScrollAnimation();
  const { t } = useLanguage();
  const steps = getSteps(t);

  return (
    <section ref={elementRef} className="py-20 sm:py-32 bg-gradient-to-b from-background to-secondary/20 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-primary transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {t("timeline.title")}
          </h2>
          <p className={`text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto transition-all duration-1000 delay-150 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {t("timeline.subtitle")}
          </p>
        </div>

        <div className="relative max-w-6xl mx-auto">
          {/* Timeline Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-accent-orange" 
               style={{ 
                 transform: isVisible ? 'scaleY(1)' : 'scaleY(0)', 
                 transformOrigin: 'top',
                 transition: 'transform 2s ease-out'
               }} 
          />

          <div className="space-y-12">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`relative flex items-center gap-8 transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                {/* Mobile/Tablet Layout */}
                <div className="md:hidden flex items-start gap-6 w-full">
                  <div className={`flex-shrink-0 w-16 h-16 rounded-full ${step.bg} flex items-center justify-center shadow-lg border-4 border-background z-10`}>
                    <step.icon className={`h-7 w-7 ${step.color}`} />
                  </div>
                  <div className="flex-1 glass-card-strong p-6 rounded-xl">
                    <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden md:flex items-center gap-8 w-full">
                  {index % 2 === 0 ? (
                    <>
                      <div className="flex-1 text-right">
                        <div className="glass-card-strong p-6 rounded-xl inline-block max-w-md ml-auto">
                          <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                          <p className="text-muted-foreground">{step.description}</p>
                        </div>
                      </div>
                      <div className={`flex-shrink-0 w-16 h-16 rounded-full ${step.bg} flex items-center justify-center shadow-lg border-4 border-background z-10`}>
                        <step.icon className={`h-7 w-7 ${step.color}`} />
                      </div>
                      <div className="flex-1" />
                    </>
                  ) : (
                    <>
                      <div className="flex-1" />
                      <div className={`flex-shrink-0 w-16 h-16 rounded-full ${step.bg} flex items-center justify-center shadow-lg border-4 border-background z-10`}>
                        <step.icon className={`h-7 w-7 ${step.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="glass-card-strong p-6 rounded-xl inline-block max-w-md">
                          <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                          <p className="text-muted-foreground">{step.description}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};