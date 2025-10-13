import { useEffect, useState } from 'react';

interface StatCardProps {
  value: string;
  label: string;
  delay?: number;
}

export const StatCard = ({ value, label, delay = 0 }: StatCardProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`glass-card-strong p-6 rounded-xl text-primary-foreground transform transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="text-4xl md:text-5xl font-bold mb-2 animate-pulse-glow">
        {value}
      </div>
      <div className="text-sm md:text-base opacity-90 font-medium tracking-wide">
        {label}
      </div>
    </div>
  );
};
