import { useState } from "react";

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
  const doubledClients = [...clients, ...clients];

  return (
    <div className="relative overflow-hidden py-8">
      <div 
        className="flex gap-12 animate-scroll"
        style={{ 
          animationPlayState: isPaused ? 'paused' : 'running',
          willChange: isPaused ? 'auto' : 'transform'
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
              width={client.width || 128}
              height={client.height || 64}
              decoding="async"
            />
          </div>
        ))}
      </div>
      <style>{`
        @keyframes scroll {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        .animate-scroll {
          animation: scroll 40s linear infinite;
        }
      `}</style>
    </div>
  );
};