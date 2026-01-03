import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircleQuestion, X } from "lucide-react";
import { AdminSupportChat } from "./AdminSupportChat";
import { supabase } from "@/integrations/supabase/client";

export function AdminSupportButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkAdminStatus();
    }, []);

    const checkAdminStatus = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setIsAdmin(false);
                setIsLoading(false);
                return;
            }

            // Check if user is in admin_users table
            const { data: adminUser, error } = await supabase
                .from('admin_users')
                .select('id')
                .eq('user_id', user.id)
                .single();

            setIsAdmin(!!adminUser && !error);
        } catch (error) {
            console.error("Error checking admin status:", error);
            setIsAdmin(false);
        } finally {
            setIsLoading(false);
        }
    };

    // Don't render anything if not an admin or still loading
    if (isLoading || !isAdmin) {
        return null;
    }

    return (
        <>
            {!isOpen && (
                <Button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-4 right-4 z-40 h-14 w-14 rounded-full shadow-2xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:scale-110"
                    size="icon"
                >
                    <MessageCircleQuestion className="h-6 w-6 text-white" />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                    </span>
                </Button>
            )}

            {isOpen && (
                <AdminSupportChat
                    onClose={() => setIsOpen(false)}
                    minimized={false}
                />
            )}
        </>
    );
}
