import { ProgressiveImage } from "./ProgressiveImage";

interface ImageGalleryProps {
  images: { src: string; alt: string }[];
  columns?: 2 | 3 | 4;
}

export const ImageGallery = ({ images, columns = 3 }: ImageGalleryProps) => {
  return (
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
          className="relative overflow-hidden rounded-xl aspect-square bg-muted shadow-lg"
        >
          <ProgressiveImage
            src={image.src}
            alt={image.alt}
            className="w-full h-full object-contain p-4"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  );
};