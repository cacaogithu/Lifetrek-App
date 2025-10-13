import { useRef, useEffect } from "react";

interface Client {
  src: string;
  alt: string;
}

interface ClientCarouselProps {
  clients: Client[];
}

export const ClientCarousel = ({ clients }: ClientCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let scrollPosition = 0;
    const scrollSpeed = 0.5;

    const animate = () => {
      scrollPosition += scrollSpeed;
      
      if (scrollPosition >= scrollContainer.scrollWidth / 2) {
        scrollPosition = 0;
      }
      
      scrollContainer.scrollLeft = scrollPosition;
      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, []);

  // Double the items for seamless loop
  const doubledClients = [...clients, ...clients];

  return (
    <div className="relative overflow-hidden py-8">
      <div 
        ref={scrollRef}
        className="flex gap-12 overflow-x-hidden whitespace-nowrap"
        style={{ scrollBehavior: 'auto' }}
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
            />
          </div>
        ))}
      </div>
    </div>
  );
};