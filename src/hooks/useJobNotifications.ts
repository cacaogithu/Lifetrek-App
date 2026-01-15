import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useJobNotifications = () => {
  useEffect(() => {
    const channel = supabase
      .channel('global-job-notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'jobs',
        },
        (payload) => {
          const newStatus = payload.new.status;
          const oldStatus = payload.old.status;
          const jobType = payload.new.job_type;
          
          // Only notify on status change
          if (newStatus === oldStatus) return;

          if (newStatus === 'completed') {
            toast.success(`Job Completed: ${jobType}`, {
              description: "Your background task has finished successfully.",
              action: {
                label: "View",
                onClick: () => window.location.href = "/admin/jobs"
              }
            });
          }

          if (newStatus === 'failed') {
            toast.error(`Job Failed: ${jobType}`, {
              description: payload.new.error || "An unknown error occurred.",
              action: {
                label: "Retry",
                onClick: () => window.location.href = "/admin/jobs"
              }
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
};
