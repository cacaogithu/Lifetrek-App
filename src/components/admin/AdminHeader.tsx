import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  BarChart3,
  Target,
  Crown,
  Users,
  Sparkles,
  LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";

interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
  requiresSuperAdmin?: boolean;
}

const allNavItems: NavItem[] = [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/leads", label: "Leads", icon: Users },
  { path: "/admin/image-processor", label: "Imagens", icon: Sparkles },
  { path: "/admin/gallery", label: "Galeria", icon: Images },
  { path: "/admin/blog", label: "Blog", icon: FileText },
  { path: "/admin/content-approval", label: "Aprovação", icon: CheckCircle },
  { path: "/admin/linkedin-carousel", label: "LinkedIn", icon: Presentation, requiresSuperAdmin: true },
  { path: "/admin/campaigns", label: "Campanhas", icon: Target, requiresSuperAdmin: true },
  { path: "/admin/product-assets", label: "Assets", icon: Upload, requiresSuperAdmin: true },
  { path: "/admin/environment-assets", label: "Ambiente", icon: Camera, requiresSuperAdmin: true },
  { path: "/admin/rejection-analytics", label: "Rejeições", icon: BarChart3, requiresSuperAdmin: true },
  { path: "/admin/knowledge-base", label: "Knowledge", icon: BookOpen, requiresSuperAdmin: true },
];

export function AdminHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isSuperAdmin, displayName, userEmail, isLoading } = useAdminPermissions();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logout realizado com sucesso");
    navigate("/admin/login");
  };

  // Filter nav items based on permissions
  const navItems = allNavItems.filter(item => {
    if (item.requiresSuperAdmin && !isSuperAdmin) {
      return false;
    }
    return true;
  });

  const userName = displayName || userEmail?.split('@')[0] || 'Admin';

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
          {navItems.map((item) => {
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

        {/* User info & Role badge */}
        <div className="flex items-center gap-2 shrink-0">
          {!isLoading && (
            <>
              <span className="text-sm text-muted-foreground hidden lg:inline">
                {userName}
              </span>
              {isSuperAdmin && (
                <Badge variant="default" className="gap-1 bg-amber-500 hover:bg-amber-600">
                  <Crown className="h-3 w-3" />
                  <span className="hidden sm:inline">Super</span>
                </Badge>
              )}
            </>
          )}
          
          {/* Logout */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-1.5" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
