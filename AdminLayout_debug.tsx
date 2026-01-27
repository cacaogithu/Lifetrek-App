import { ReactNode, useEffect } from "react";
import { AdminHeader } from "./AdminHeader";

interface AdminLayoutProps {
    children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
    useEffect(() => {
        // Apply dark mode to document for Tailwind dark: classes to work
        document.documentElement.classList.add('dark');
        return () => {
            document.documentElement.classList.remove('dark');
        };
    }, []);

    return (
        <div className="min-h-screen bg-background text-foreground dark">
            <AdminHeader />
            <main className="flex-1">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
