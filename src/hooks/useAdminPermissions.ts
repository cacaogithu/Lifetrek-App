import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type PermissionLevel = "super_admin" | "admin" | "none";

interface AdminPermission {
  email: string;
  permission_level: PermissionLevel;
  display_name: string | null;
}

export function useAdminPermissions() {
  const [permissionLevel, setPermissionLevel] = useState<PermissionLevel>("none");
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.email) {
        setPermissionLevel("none");
        setIsLoading(false);
        return;
      }

      setUserEmail(user.email);

      // Query admin_permissions table
      const { data, error } = await supabase
        .from("admin_permissions")
        .select("*")
        .eq("email", user.email)
        .single();

      if (error || !data) {
        // Fallback: check if they're in admin_users (legacy support)
        const { data: adminData } = await supabase
          .from("admin_users")
          .select("*")
          .eq("user_id", user.id)
          .single();
        
        if (adminData) {
          // Default legacy admins to "admin" level
          setPermissionLevel("admin");
        } else {
          setPermissionLevel("none");
        }
      } else {
        setPermissionLevel(data.permission_level as PermissionLevel);
        setDisplayName(data.display_name);
      }
    } catch (error) {
      console.error("Error checking permissions:", error);
      setPermissionLevel("none");
    } finally {
      setIsLoading(false);
    }
  };

  const isSuperAdmin = permissionLevel === "super_admin";
  const isAdmin = permissionLevel === "admin" || permissionLevel === "super_admin";

  // Define what each role can access
  const canAccessLinkedIn = isSuperAdmin;
  const canAccessCampaigns = isSuperAdmin;
  const canAccessKnowledgeBase = isSuperAdmin;
  const canAccessRejectionAnalytics = isSuperAdmin;
  const canAccessProductAssets = isSuperAdmin;
  const canAccessEnvironmentAssets = isSuperAdmin;
  
  // All admins can access these
  const canAccessDashboard = isAdmin;
  const canAccessGallery = isAdmin;
  const canAccessBlog = isAdmin;
  const canAccessContentApproval = isAdmin;

  return {
    permissionLevel,
    displayName,
    userEmail,
    isLoading,
    isSuperAdmin,
    isAdmin,
    // Feature permissions
    canAccessLinkedIn,
    canAccessCampaigns,
    canAccessKnowledgeBase,
    canAccessRejectionAnalytics,
    canAccessProductAssets,
    canAccessEnvironmentAssets,
    canAccessDashboard,
    canAccessGallery,
    canAccessBlog,
    canAccessContentApproval,
  };
}
