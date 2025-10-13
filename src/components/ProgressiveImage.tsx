import { useState, useEffect } from "react";

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: string | number;
  height?: string | number;
  loading?: "lazy" | "eager";
}

export const ProgressiveImage = ({
  src,
  alt,
  className = "",
  width,
  height,
  loading = "lazy"
}: ProgressiveImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState("");

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setCurrentSrc(src);
      setIsLoaded(true);
    };
  }, [src]);

  return (
    <div className="relative overflow-hidden">
      {/* Blur placeholder */}
      <div
        className={`absolute inset-0 bg-gradient-to-br from-muted to-muted/50 transition-opacity duration-500 ${
          isLoaded ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-muted-foreground/5 to-transparent" />
      </div>

      {/* Actual image */}
      <img
        src={currentSrc || src}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        className={`${className} transition-all duration-700 ${
          isLoaded ? "opacity-100 blur-0 scale-100" : "opacity-0 blur-lg scale-105"
        }`}
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
};