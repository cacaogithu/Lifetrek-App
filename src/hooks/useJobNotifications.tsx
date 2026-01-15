
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Job } from '@/types/jobs';

export function useJobNotifications() {
    const lastNotifiedStatus = useRef(new Map<string, Job['status']>());

    useEffect(() => {
        let channel: ReturnType<typeof supabase.channel> | null = null;
        let isActive = true;

        const handleUpdate = (payload: { new: Job; old: Job | null }) => {
            const job = payload.new as Job;
            const previous = payload.old?.status;

            if (previous === job.status) {
                return;
            }

            if (lastNotifiedStatus.current.get(job.id) === job.status) {
                return;
            }

            lastNotifiedStatus.current.set(job.id, job.status);

            if (job.status === 'completed') {
                toast.success(`Job completed: ${job.type}`, {
                    description: 'Click to view details',
                });
            } else if (job.status === 'failed') {
                toast.error(`Job failed: ${job.type}`, {
                    description: job.error || 'Unknown error occurred',
                });
            }
        };

        const setup = async () => {
            const { data } = await supabase.auth.getUser();
            const userId = data.user?.id;

            if (!isActive || !userId) {
                return;
            }

            const listenOptions: { event: 'UPDATE'; schema: 'public'; table: 'jobs'; filter?: string } = {
                event: 'UPDATE',
                schema: 'public',
                table: 'jobs',
                filter: `user_id=eq.${userId}`
            };

            channel = supabase
                .channel('job-notifications')
                .on('postgres_changes', listenOptions, handleUpdate)
                .subscribe();
        };

        setup();

        return () => {
            isActive = false;
            if (channel) {
                supabase.removeChannel(channel);
            }
        };
    }, []);
}
