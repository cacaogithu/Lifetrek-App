import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState("fadeIn");

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage("fadeOut");
    }
  }, [location, displayLocation]);

  useEffect(() => {
    if (transitionStage === "fadeOut") {
      const timeout = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage("fadeIn");
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [transitionStage, location]);

  return (
    <div
      className={`transition-all duration-300 ${
        transitionStage === "fadeOut"
          ? "opacity-0 -translate-y-4"
          : "opacity-100 translate-y-0"
      }`}
    >
      {children}
    </div>
  );
};