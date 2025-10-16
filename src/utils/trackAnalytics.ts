import { supabase } from "@/integrations/supabase/client";

type EventType = "chatbot_interaction" | "form_submission" | "lead_magnet_usage" | "consultation_scheduled";

interface TrackEventParams {
  eventType: EventType;
  companyName?: string;
  companyEmail?: string;
  metadata?: Record<string, any>;
}

export const trackAnalyticsEvent = async ({
  eventType,
  companyName,
  companyEmail,
  metadata,
}: TrackEventParams) => {
  try {
    const { error } = await supabase.from("analytics_events").insert({
      event_type: eventType,
      company_name: companyName,
      company_email: companyEmail,
      metadata: metadata || {},
    });

    if (error) {
      console.error("Failed to track analytics event:", error);
    }
  } catch (error) {
    console.error("Error tracking analytics:", error);
  }
};
