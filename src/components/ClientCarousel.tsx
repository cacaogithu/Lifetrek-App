import { useRef, useEffect } from "react";

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<number>();
  const isUserInteractingRef = useRef(false);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let scrollPosition = 0;
    const scrollSpeed = 0.5;

    const animate = () => {
      if (!isUserInteractingRef.current) {
        scrollPosition += scrollSpeed;
        
        if (scrollPosition >= scrollContainer.scrollWidth / 2) {
          scrollPosition = 0;
        }
        
        scrollContainer.scrollLeft = scrollPosition;
      }
      autoScrollRef.current = requestAnimationFrame(animate);
    };

    autoScrollRef.current = requestAnimationFrame(animate);

    // Handle user interaction
    const handleInteractionStart = () => {
      isUserInteractingRef.current = true;
    };

    const handleInteractionEnd = () => {
      setTimeout(() => {
        isUserInteractingRef.current = false;
      }, 1000);
    };

    scrollContainer.addEventListener('touchstart', handleInteractionStart);
    scrollContainer.addEventListener('mousedown', handleInteractionStart);
    scrollContainer.addEventListener('touchend', handleInteractionEnd);
    scrollContainer.addEventListener('mouseup', handleInteractionEnd);

    return () => {
      if (autoScrollRef.current) {
        cancelAnimationFrame(autoScrollRef.current);
      }
      scrollContainer.removeEventListener('touchstart', handleInteractionStart);
      scrollContainer.removeEventListener('mousedown', handleInteractionStart);
      scrollContainer.removeEventListener('touchend', handleInteractionEnd);
      scrollContainer.removeEventListener('mouseup', handleInteractionEnd);
    };
  }, []);

  // Double the items for seamless loop
  const doubledClients = [...clients, ...clients];

  return (
    <div className="relative overflow-hidden py-8">
      <div 
        ref={scrollRef}
        className="flex gap-12 overflow-x-auto whitespace-nowrap scrollbar-hide cursor-grab active:cursor-grabbing"
        style={{ 
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
        }}
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
            />
          </div>
        ))}
      </div>
    </div>
  );
};