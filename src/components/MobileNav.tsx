import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Building2, Package, Phone, BookOpen } from "lucide-react";

export const MobileNav = () => {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { path: "/#top", icon: Home, label: "Home" },
    { path: "/capabilities#top", icon: Building2, label: "Capabilities" },
    { path: "/products#top", icon: Package, label: "Products" },
    { path: "/resources#top", icon: BookOpen, label: "Resources" },
    { path: "/contact#top", icon: Phone, label: "Contact" },
  ];

  return (
    <nav
      className={`md:hidden fixed bottom-0 left-0 right-0 z-50 glass-card-strong border-t border-border transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="flex justify-around items-center py-2 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
