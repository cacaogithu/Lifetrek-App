import { useEffect, useRef, useState } from 'react';

interface StaggerAnimationOptions {
  threshold?: number;
  staggerDelay?: number;
}

export const useStaggerAnimation = (
  itemCount: number,
  options: StaggerAnimationOptions = {}
) => {
  const { threshold = 0.1, staggerDelay = 100 } = options;
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleItems, setVisibleItems] = useState<boolean[]>(
    new Array(itemCount).fill(false)
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Trigger stagger animation
            const newVisibleItems = [...visibleItems];
            newVisibleItems.forEach((_, index) => {
              setTimeout(() => {
                setVisibleItems((prev) => {
                  const updated = [...prev];
                  updated[index] = true;
                  return updated;
                });
              }, index * staggerDelay);
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold }
    );

    observer.observe(container);

    return () => {
      if (container) {
        observer.unobserve(container);
      }
    };
  }, [itemCount, threshold, staggerDelay]);

  return { containerRef, visibleItems };
};