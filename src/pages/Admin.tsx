import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, MessageSquare, FileText, Calendar, TrendingUp, LogOut } from "lucide-react";
import { toast } from "sonner";

type AnalyticsData = {
  chatbot_interactions: number;
  form_submissions: number;
  lead_magnets: number;
  consultations: number;
  total_companies: number;
  recent_events: Array<{
    id: string;
    event_type: string;
    company_name: string | null;
    company_email: string | null;
    created_at: string;
  }>;
};

export default function Admin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    chatbot_interactions: 0,
    form_submissions: 0,
    lead_magnets: 0,
    consultations: 0,
    total_companies: 0,
    recent_events: [],
  });

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/admin/login");
        return;
      }

      const { data: adminData } = await supabase
        .from("admin_users")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!adminData) {
        toast.error("Access denied");
        navigate("/");
        return;
      }

      setIsAdmin(true);
      await fetchAnalytics();
    } catch (error) {
      console.error("Error checking admin access:", error);
      navigate("/admin/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const { data: events, error } = await supabase
        .from("analytics_events")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const chatbot = events?.filter(e => e.event_type === "chatbot_interaction").length || 0;
      const forms = events?.filter(e => e.event_type === "form_submission").length || 0;
      const leadMagnets = events?.filter(e => e.event_type === "lead_magnet_usage").length || 0;
      const consultations = events?.filter(e => e.event_type === "consultation_scheduled").length || 0;

      const uniqueEmails = new Set(events?.map(e => e.company_email).filter(Boolean));

      setAnalytics({
        chatbot_interactions: chatbot,
        form_submissions: forms,
        lead_magnets: leadMagnets,
        consultations: consultations,
        total_companies: uniqueEmails.size,
        recent_events: events?.slice(0, 20) || [],
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to load analytics");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const stats = [
    {
      title: "Total Companies",
      value: analytics.total_companies,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Chatbot Interactions",
      value: analytics.chatbot_interactions,
      icon: MessageSquare,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      title: "Form Submissions",
      value: analytics.form_submissions,
      icon: FileText,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      title: "Lead Magnets Used",
      value: analytics.lead_magnets,
      icon: TrendingUp,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      title: "Consultations Scheduled",
      value: analytics.consultations,
      icon: Calendar,
      color: "text-pink-500",
      bg: "bg-pink-500/10",
    },
  ];

  const getEventLabel = (type: string) => {
    const labels: Record<string, string> = {
      chatbot_interaction: "Chatbot",
      form_submission: "Form",
      lead_magnet_usage: "Lead Magnet",
      consultation_scheduled: "Consultation",
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Internal team analytics</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Recent Events */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6">Recent Events</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Type</th>
                  <th className="text-left py-3 px-4">Company</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recent_events.map((event) => (
                  <tr key={event.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {getEventLabel(event.event_type)}
                      </span>
                    </td>
                    <td className="py-3 px-4">{event.company_name || "-"}</td>
                    <td className="py-3 px-4">{event.company_email || "-"}</td>
                    <td className="py-3 px-4">
                      {new Date(event.created_at).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
