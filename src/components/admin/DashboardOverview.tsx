import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import { useImpersonation } from "@/contexts/ImpersonationContext";
import { SuperAdminDashboard } from "./dashboards/SuperAdminDashboard";
import { SalesDashboard } from "./dashboards/SalesDashboard";
import { Loader2 } from "lucide-react";

export function DashboardOverview() {
    const { isSuperAdmin: realIsSuperAdmin, displayName, userEmail, isLoading: permissionsLoading } = useAdminPermissions();
    const { isImpersonating, impersonatedUser, getEffectivePermissionLevel } = useImpersonation();

    const isLoading = permissionsLoading;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Determine effective role and name
    const effectivePermissionLevel = isImpersonating 
        ? getEffectivePermissionLevel() 
        : (realIsSuperAdmin ? 'super_admin' : 'admin'); // Fallback, hook gives better granular data but this is simplified

    const effectiveIsSuperAdmin = effectivePermissionLevel === 'super_admin';
    
    const effectiveName = isImpersonating
        ? (impersonatedUser?.display_name || impersonatedUser?.email?.split('@')[0] || 'User')
        : (displayName || userEmail?.split('@')[0] || 'User');

    // Render appropriate dashboard
    if (effectiveIsSuperAdmin) {
        return <SuperAdminDashboard userName={effectiveName} />;
    }

    return <SalesDashboard userName={effectiveName} />;
}