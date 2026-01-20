import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type PermissionLevel = "super_admin" | "admin" | "none";

interface AdminUser {
  id: string;
  email: string;
  permission_level: PermissionLevel;
  display_name: string | null;
}

interface ImpersonationContextType {
  isImpersonating: boolean;
  impersonatedUser: AdminUser | null;
  availableUsers: AdminUser[];
  startImpersonation: (user: AdminUser) => void;
  stopImpersonation: () => void;
  getEffectivePermissionLevel: () => PermissionLevel;
  getEffectiveDisplayName: () => string | null;
  getEffectiveEmail: () => string | null;
}

const ImpersonationContext = createContext<ImpersonationContextType | undefined>(undefined);

export function ImpersonationProvider({ children }: { children: ReactNode }) {
  const [impersonatedUser, setImpersonatedUser] = useState<AdminUser | null>(null);
  const [availableUsers, setAvailableUsers] = useState<AdminUser[]>([]);
  const [realUserPermission, setRealUserPermission] = useState<PermissionLevel>("none");
  const [realUserEmail, setRealUserEmail] = useState<string | null>(null);
  const [realDisplayName, setRealDisplayName] = useState<string | null>(null);

  useEffect(() => {
    fetchAvailableUsers();
  }, []);

  const fetchAvailableUsers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) return;

      // Check if current user is super_admin
      const { data: currentUserData } = await supabase
        .from("admin_permissions")
        .select("*")
        .eq("email", user.email)
        .single();

      if (!currentUserData || currentUserData.permission_level !== "super_admin") {
        return; // Only super_admins can impersonate
      }

      setRealUserPermission(currentUserData.permission_level as PermissionLevel);
      setRealUserEmail(user.email);
      setRealDisplayName(currentUserData.display_name);

      // Fetch all admin users for impersonation dropdown
      const { data: allAdmins } = await supabase
        .from("admin_permissions")
        .select("*")
        .order("display_name");

      if (allAdmins) {
        setAvailableUsers(allAdmins.map(a => ({
          id: a.id,
          email: a.email,
          permission_level: a.permission_level as PermissionLevel,
          display_name: a.display_name
        })));
      }
    } catch (error) {
      console.error("Error fetching users for impersonation:", error);
    }
  };

  const startImpersonation = (user: AdminUser) => {
    // Can only impersonate if you're a super_admin
    if (realUserPermission !== "super_admin") return;
    setImpersonatedUser(user);
  };

  const stopImpersonation = () => {
    setImpersonatedUser(null);
  };

  const getEffectivePermissionLevel = (): PermissionLevel => {
    if (impersonatedUser) {
      return impersonatedUser.permission_level;
    }
    return realUserPermission;
  };

  const getEffectiveDisplayName = (): string | null => {
    if (impersonatedUser) {
      return impersonatedUser.display_name;
    }
    return realDisplayName;
  };

  const getEffectiveEmail = (): string | null => {
    if (impersonatedUser) {
      return impersonatedUser.email;
    }
    return realUserEmail;
  };

  return (
    <ImpersonationContext.Provider
      value={{
        isImpersonating: impersonatedUser !== null,
        impersonatedUser,
        availableUsers,
        startImpersonation,
        stopImpersonation,
        getEffectivePermissionLevel,
        getEffectiveDisplayName,
        getEffectiveEmail,
      }}
    >
      {children}
    </ImpersonationContext.Provider>
  );
}

export function useImpersonation() {
  const context = useContext(ImpersonationContext);
  if (context === undefined) {
    throw new Error("useImpersonation must be used within an ImpersonationProvider");
  }
  return context;
}
