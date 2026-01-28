import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ImpersonatedUser {
    id: string;
    email: string;
    display_name: string | null;
    permission_level: "super_admin" | "admin" | "none";
}

interface ImpersonationContextType {
    isImpersonating: boolean;
    originalUser: { id: string; email: string } | null;
    impersonatedUser: ImpersonatedUser | null;
    availableUsers: ImpersonatedUser[];
    startImpersonation: (user: ImpersonatedUser) => void;
    stopImpersonation: () => void;
    getEffectivePermissionLevel: () => "super_admin" | "admin" | "none";
}

const ImpersonationContext = createContext<ImpersonationContextType | undefined>(undefined);

export function ImpersonationProvider({ children }: { children: ReactNode }) {
    const [isImpersonating, setIsImpersonating] = useState(false);
    const [originalUser, setOriginalUser] = useState<{ id: string; email: string } | null>(null);
    const [impersonatedUser, setImpersonatedUser] = useState<ImpersonatedUser | null>(null);
    const [availableUsers, setAvailableUsers] = useState<ImpersonatedUser[]>([]);

    // Load available users for impersonation (filtered to only show valid targets)
    useEffect(() => {
        const loadUsers = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                setOriginalUser({ id: user.id, email: user.email || "" });

                // Only fetch if super admin
                const { data: currentUserPerms } = await supabase
                    .from("admin_permissions")
                    .select("permission_level")
                    .eq("email", user.email)
                    .single();

                if (currentUserPerms?.permission_level !== "super_admin") return;

                const { data: users, error } = await supabase
                    .from("admin_permissions")
                    .select("*")
                    .order("display_name");

                if (error) throw error;

                // Transform and cast to correct type
                const validUsers = (users || []).map(u => ({
                    ...u,
                    permission_level: u.permission_level as "super_admin" | "admin" | "none"
                }));

                setAvailableUsers(validUsers);
            } catch (error) {
                console.error("Error loading users for impersonation:", error);
            }
        };

        loadUsers();
    }, []);

    const startImpersonation = (user: ImpersonatedUser) => {
        setImpersonatedUser(user);
        setIsImpersonating(true);
        toast.info(`Agora visualizando como: ${user.display_name || user.email}`);
    };

    const stopImpersonation = () => {
        setImpersonatedUser(null);
        setIsImpersonating(false);
        toast.info("Visualização restaurada para seu usuário original");
    };

    const getEffectivePermissionLevel = () => {
        if (isImpersonating && impersonatedUser) {
            return impersonatedUser.permission_level;
        }
        // Return actual permission level logic here if needed, but for now defaulting 'none' 
        // as this is usually handled by the hook. This context is mainly for OVERRIDING.
        return "super_admin"; // Fallback/Default for the actual super admin context
    };

    return (
        <ImpersonationContext.Provider
            value={{
                isImpersonating,
                originalUser,
                impersonatedUser,
                availableUsers,
                startImpersonation,
                stopImpersonation,
                getEffectivePermissionLevel,
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
