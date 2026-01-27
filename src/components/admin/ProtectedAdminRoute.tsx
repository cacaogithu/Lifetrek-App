import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const ALLOWED_EMAIL_DOMAINS = ["lifetrek-medical.com"];
const ALLOWED_EMAILS = ["rafacrvg@icloud.com"]; // Super admin exceptions

export function ProtectedAdminRoute() {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAllowedDomain, setIsAllowedDomain] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error || !session?.user) {
                    console.log("[ProtectedAdminRoute] No valid session found");
                    setIsAuthenticated(false);
                    setIsLoading(false);
                    return;
                }

                const userEmail = session.user.email || "";
                const emailDomain = userEmail.split("@")[1]?.toLowerCase();
                const isDomainAllowed = ALLOWED_EMAIL_DOMAINS.includes(emailDomain) || ALLOWED_EMAILS.includes(userEmail.toLowerCase());

                console.log(`[ProtectedAdminRoute] User: ${userEmail}, Domain allowed: ${isDomainAllowed}`);

                if (!isDomainAllowed) {
                    // Sign out users from non-allowed domains
                    await supabase.auth.signOut();
                    setIsAllowedDomain(false);
                    setIsAuthenticated(false);
                } else {
                    setIsAllowedDomain(true);
                    setIsAuthenticated(true);
                }
            } catch (err) {
                console.error("[ProtectedAdminRoute] Error checking auth:", err);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log(`[ProtectedAdminRoute] Auth event: ${event}`);
            if (event === "SIGNED_OUT" || !session) {
                setIsAuthenticated(false);
            } else if (event === "SIGNED_IN" && session?.user) {
                const userEmail = session.user.email || "";
                const emailDomain = userEmail.split("@")[1]?.toLowerCase();
                const isDomainAllowed = ALLOWED_EMAIL_DOMAINS.includes(emailDomain) || ALLOWED_EMAILS.includes(userEmail.toLowerCase());

                if (isDomainAllowed) {
                    setIsAuthenticated(true);
                    setIsAllowedDomain(true);
                } else {
                    setIsAuthenticated(false);
                    setIsAllowedDomain(false);
                }
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <LoadingSpinner />
            </div>
        );
    }

    if (!isAuthenticated) {
        // Redirect to login with the intended destination
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    if (!isAllowedDomain) {
        // This shouldn't happen since we sign them out, but just in case
        return <Navigate to="/admin/login" state={{ error: "domain_not_allowed" }} replace />;
    }

    return <Outlet />;
}
