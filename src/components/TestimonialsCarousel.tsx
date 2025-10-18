import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Quote } from "lucide-react";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Testimonial {
  quote: string;
  author: string;
  company: string;
  logo?: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    quote: "Exceptional precision and quality in every component. Their Swiss CNC capabilities have significantly improved our product reliability.",
    author: "Dr. Carlos Silva",
    company: "Leading Medical Device Manufacturer",
    rating: 5,
  },
  {
    quote: "30+ years of partnership speaks for itself. Consistently delivering on-time with zero defects. Their ISO certification gives us complete confidence.",
    author: "Maria Santos",
    company: "Orthopedic Implant Specialist",
    rating: 5,
  },
  {
    quote: "The electropolishing finish quality is outstanding. Perfect for our surgical instruments requiring biocompatible surfaces.",
    author: "João Mendes",
    company: "Surgical Instruments Division",
    rating: 5,
  },
  {
    quote: "Their metrology lab capabilities ensure every part meets our stringent specifications. The ZEISS CMM reports are comprehensive and reliable.",
    author: "Ana Costa",
    company: "Quality Assurance Director",
    rating: 5,
  },
];

export const TestimonialsCarousel = () => {
  const { t } = useLanguage();
  const { elementRef, isVisible } = useScrollAnimation();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section ref={elementRef} className="py-20 sm:py-32 bg-gradient-to-b from-secondary/20 to-background">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-4 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {t("testimonials.title")}
          </h2>
          <p className={`text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto transition-all duration-1000 delay-150 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {t("testimonials.subtitle")}
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="glass-card-strong p-8 sm:p-12 rounded-2xl min-h-[320px] flex flex-col justify-center">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`absolute inset-8 sm:inset-12 transition-all duration-700 ${
                  currentIndex === index 
                    ? 'opacity-100 translate-x-0' 
                    : index < currentIndex 
                      ? 'opacity-0 -translate-x-8' 
                      : 'opacity-0 translate-x-8'
                }`}
              >
                <Quote className="h-12 w-12 text-primary/30 mb-6" />
                <blockquote className="text-xl sm:text-2xl font-medium mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex items-center gap-2 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-accent-orange fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <div>
                  <div className="font-bold text-lg">{testimonial.author}</div>
                  <div className="text-muted-foreground">{testimonial.company}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center gap-3 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentIndex === index 
                    ? 'bg-primary w-8' 
                    : 'bg-muted hover:bg-muted-foreground/50'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};