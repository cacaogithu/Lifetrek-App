import { useState, useEffect } from "react";

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: string | number;
  height?: string | number;
  loading?: "lazy" | "eager";
  srcSet?: string;
  sizes?: string;
}

export const ProgressiveImage = ({
  src,
  alt,
  className = "",
  width,
  height,
  loading = "lazy",
  srcSet,
  sizes
}: ProgressiveImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

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
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        decoding="async"
        className={`${className} transition-all duration-700 ${
          isLoaded ? "opacity-100 blur-0 scale-100" : "opacity-0 blur-lg scale-105"
        }`}
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
};