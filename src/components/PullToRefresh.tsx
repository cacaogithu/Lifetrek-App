import { useState, useRef } from "react";
import { RefreshCw } from "lucide-react";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export const PullToRefresh = ({ onRefresh, children }: PullToRefreshProps) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const maxPull = 80;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (window.scrollY === 0 && !isRefreshing) {
      const currentY = e.touches[0].clientY;
      const distance = currentY - startY.current;
      
      if (distance > 0) {
        setPullDistance(Math.min(distance, maxPull));
      }
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= maxPull && !isRefreshing) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
    setPullDistance(0);
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-200"
        style={{
          height: `${pullDistance}px`,
          opacity: pullDistance / maxPull,
        }}
      >
        <RefreshCw
          className={`h-6 w-6 text-primary ${
            isRefreshing ? "animate-spin" : ""
          }`}
          style={{
            transform: `rotate(${(pullDistance / maxPull) * 360}deg)`,
          }}
        />
      </div>
      
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isRefreshing ? "transform 0.2s" : "none",
        }}
      >
        {children}
      </div>
    </div>
  );
};