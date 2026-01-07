import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Images, 
  Presentation, 
  FileText, 
  CheckCircle, 
  BookOpen,
  Upload,
  LogOut,
  Camera,
  Database
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const adminNavItems = [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/product-assets", label: "Assets & Produtos", icon: Upload },
  { path: "/admin/environment-assets", label: "Ambiente", icon: Camera },
  { path: "/admin/image-processor", label: "Galeria", icon: Images },
  { path: "/admin/linkedin-carousel", label: "LinkedIn", icon: Presentation },
  { path: "/admin/blog", label: "Blog", icon: FileText },
  { path: "/admin/content-approval", label: "Aprovação", icon: CheckCircle },
  { path: "/admin/knowledge-base", label: "Knowledge", icon: BookOpen },
  { path: "/admin/leads", label: "Leads", icon: Database },
];

export function AdminHeader() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logout realizado com sucesso");
    navigate("/admin/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 gap-4">
        {/* Logo */}
        <Link to="/admin" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">LT</span>
          </div>
          <span className="font-semibold text-sm hidden sm:inline">Admin</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1 flex-1 overflow-x-auto">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="shrink-0"
        >
          <LogOut className="h-4 w-4 mr-1.5" />
          <span className="hidden sm:inline">Sair</span>
        </Button>
      </div>
    </header>
  );
}
