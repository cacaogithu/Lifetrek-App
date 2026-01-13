import { ReactNode } from "react";
import { AdminHeader } from "./AdminHeader";

interface AdminLayoutProps {
    children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
    return (
        <div className="min-h-screen bg-background">
            <AdminHeader />
            <main className="flex-1">
                {children}
            </main>
        </div>
    );
}
