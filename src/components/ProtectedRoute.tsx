import { useEffect, useState, ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "./LoadingSpinner";

interface ProtectedRouteProps {
  children: ReactNode;
}

// Routes that require super_admin access
const superAdminRoutes = [
  "/admin/linkedin-carousel",
  "/admin/campaigns",
  "/admin/knowledge-base",
  "/admin/rejection-analytics",
  "/admin/product-assets",
  "/admin/environment-assets",
];

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      // Check admin_permissions table first
      if (user.email) {
        const { data: permData } = await supabase
          .from("admin_permissions")
          .select("permission_level")
          .eq("email", user.email)
          .single();

        if (permData) {
          setIsAdmin(true);
          setIsSuperAdmin(permData.permission_level === "super_admin");
          setIsLoading(false);
          return;
        }
      }

      // Fallback to legacy admin_users table
      const { data: adminData } = await supabase
        .from("admin_users")
        .select("*")
        .eq("user_id", user.id)
        .single();

      setIsAdmin(!!adminData);
      setIsSuperAdmin(false); // Legacy admins are regular admins
    } catch (error) {
      console.error("Error checking admin access:", error);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (isAdmin === false) {
    return <Navigate to="/admin/login" replace />;
  }

  // Check if trying to access super_admin route without permission
  const isSuperAdminRoute = superAdminRoutes.some(route => 
    location.pathname === route || location.pathname.startsWith(route + "/")
  );

  if (isSuperAdminRoute && !isSuperAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}
