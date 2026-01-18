import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AgentChat } from '@/components/agents/AgentChat';

export default function Copywriter() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        checkAdminAccess();
    }, []);

    const checkAdminAccess = async () => {
        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();

            if (userError || !user) {
                navigate('/admin/login');
                return;
            }

            const { data: adminData, error: adminError } = await supabase
                .from('admin_users')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (adminError || !adminData) {
                toast.error('Unauthorized access');
                navigate('/admin/login');
                return;
            }

            setIsAdmin(true);
        } catch (error) {
            console.error('Access check error:', error);
            navigate('/admin/login');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAdmin) {
        return null;
    }

    return (
        <div className="p-6">
            <AgentChat agentType="copywriter" />
        </div>
    );
}
