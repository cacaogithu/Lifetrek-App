import { useState } from "react";
import { X, ZoomIn } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ProgressiveImage } from "./ProgressiveImage";

interface ImageGalleryProps {
  images: { src: string; alt: string }[];
  columns?: 2 | 3 | 4;
}

export const ImageGallery = ({ images, columns = 3 }: ImageGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    const newScale = Math.min(Math.max(1, scale + delta), 3);
    setScale(newScale);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      (e.target as any).lastPinchDistance = distance;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      const lastDistance = (e.target as any).lastPinchDistance;
      
      if (lastDistance) {
        const delta = (distance - lastDistance) * 0.01;
        const newScale = Math.min(Math.max(1, scale + delta), 3);
        setScale(newScale);
      }
      
      (e.target as any).lastPinchDistance = distance;
    }
  };

  return (
    <>
      <div
        className={`grid gap-4 ${
          columns === 2
            ? "grid-cols-2"
            : columns === 3
            ? "grid-cols-2 md:grid-cols-3"
            : "grid-cols-2 md:grid-cols-4"
        }`}
      >
        {images.map((image, index) => (
          <div
            key={index}
            className="relative group cursor-pointer overflow-hidden rounded-xl aspect-square bg-muted"
            onClick={() => setSelectedImage(index)}
          >
            <ProgressiveImage
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <ZoomIn className="h-8 w-8 text-white" />
            </div>
          </div>
        ))}
      </div>

      <Dialog open={selectedImage !== null} onOpenChange={() => {
        setSelectedImage(null);
        setScale(1);
        setPosition({ x: 0, y: 0 });
      }}>
        <DialogContent className="max-w-7xl h-[90vh] p-0 bg-black/95 border-none">
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="h-6 w-6 text-white" />
          </button>
          
          {selectedImage !== null && (
            <div className="w-full h-full flex items-center justify-center overflow-hidden">
              <img
                src={images[selectedImage].src}
                alt={images[selectedImage].alt}
                className="max-w-full max-h-full object-contain transition-transform duration-200 cursor-move"
                style={{
                  transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
                }}
                onWheel={handleWheel}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                draggable={false}
              />
            </div>
          )}
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded-full">
            {selectedImage !== null && `${selectedImage + 1} / ${images.length}`}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};