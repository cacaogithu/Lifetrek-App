import { useState, useEffect, useRef } from "react";

interface Client {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

interface ClientCarouselProps {
  clients: Client[];
}

export const ClientCarousel = ({ clients }: ClientCarouselProps) => {
  const [isPaused, setIsPaused] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const doubledClients = [...clients, ...clients];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(container);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    observer.observe(container);

    return () => {
      if (container) observer.unobserve(container);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative overflow-hidden py-8">
      {isVisible && (
        <div 
          className="flex gap-12 animate-scroll"
          style={{ 
            animationPlayState: isPaused ? 'paused' : 'running'
          }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {doubledClients.map((client, index) => (
            <div
              key={index}
              className="inline-flex items-center justify-center flex-shrink-0 w-32 sm:w-40 h-20 grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110"
            >
              <img 
                src={client.src} 
                alt={client.alt} 
                className="max-h-16 w-auto object-contain" 
                loading="lazy"
                width={client.width}
                height={client.height}
                decoding="async"
              />
            </div>
          ))}
        </div>
      )}
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 40s linear infinite;
        }
      `}</style>
    </div>
  );
};