import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Calendar } from "lucide-react";
import { MagneticButton } from "./MagneticButton";

export const StickyCTA = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollTop = window.scrollY;
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const progress = (scrollTop / docHeight) * 100;
          
          setScrollProgress(progress);
          setIsVisible(scrollTop > 800);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getCtaContent = () => {
    return {
      icon: Calendar,
      text: "Schedule Free Assessment",
      link: "/assessment"
    };
  };

  const cta = getCtaContent();
  const Icon = cta.icon;

  return (
    <div
      className={`hidden md:block fixed bottom-0 left-0 right-0 z-50 transition-all duration-500 ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      {/* Progress bar */}
      <div className="h-1 bg-secondary">
        <div 
          className="h-full bg-gradient-to-r from-primary via-accent to-accent-orange transition-all duration-300"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
      
      {/* CTA Bar */}
      <div className="glass-card-strong border-t border-border/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm font-medium">
                Ready to elevate your medical device manufacturing?
              </p>
              <p className="text-xs text-muted-foreground">
                ISO 13485 certified • 30+ years experience • ±0.001mm precision
              </p>
            </div>
            
            <Link to={cta.link}>
              <MagneticButton 
                size="lg" 
                className="shadow-[var(--shadow-premium)] group"
              >
                <Icon className="mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                {cta.text}
              </MagneticButton>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};