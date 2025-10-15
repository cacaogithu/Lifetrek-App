import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, MessageSquare, FileText, Calendar, TrendingUp, LogOut, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { logError } from "@/utils/errorLogger";

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

      // Check if user has admin role using new role system
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleData) {
        toast.error("Access denied. Not an admin user.");
        navigate("/");
        return;
      }

      setIsAdmin(true);
      await fetchAnalytics();
    } catch (error) {
      logError(error, "Admin access check");
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
      logError(error, "Fetch analytics");
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
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Internal management portal</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="analytics">
              <TrendingUp className="mr-2 h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="brand">
              <BookOpen className="mr-2 h-4 w-4" />
              Brand Book
            </TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
          </TabsContent>

          {/* Brand Book Tab */}
          <TabsContent value="brand">
            <Card className="p-8">
              <div className="prose prose-slate max-w-none">
                <h1 className="text-4xl font-bold mb-2">Lifetrek Medical Brand Book</h1>
                <p className="text-muted-foreground mb-8">Version 1.0 | Internal Documentation</p>

                {/* Brand Overview */}
                <section className="mb-12">
                  <h2 className="text-3xl font-bold mb-4 text-primary border-b-2 border-primary pb-2">Brand Overview</h2>
                  
                  <h3 className="text-2xl font-semibold mt-6 mb-3">Who We Are</h3>
                  <p className="text-lg leading-relaxed mb-4">
                    Lifetrek Medical is a precision manufacturing company specializing in high-quality medical and dental components. 
                    With 30+ years of experience, we are ISO 13485 certified and ANVISA approved, serving leading medical device companies worldwide.
                  </p>

                  <h3 className="text-2xl font-semibold mt-6 mb-3">Brand Positioning</h3>
                  <p className="text-xl font-bold mb-3">Precision Engineering for Life-Saving Technology</p>
                  <ul className="space-y-2 mb-4">
                    <li><strong>Technical Experts:</strong> Leaders in CNC precision manufacturing</li>
                    <li><strong>Quality Partners:</strong> ISO-certified with uncompromising standards</li>
                    <li><strong>Innovation Drivers:</strong> Cutting-edge equipment and processes</li>
                    <li><strong>Trusted Collaborators:</strong> Long-term strategic partnerships</li>
                  </ul>
                </section>

                {/* Color System */}
                <section className="mb-12">
                  <h2 className="text-3xl font-bold mb-4 text-primary border-b-2 border-primary pb-2">Color System</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="border rounded-lg p-4">
                      <div className="bg-primary h-24 rounded mb-3"></div>
                      <h4 className="font-bold mb-1">Corporate Blue</h4>
                      <p className="text-sm text-muted-foreground">HSL: 210° 100% 28%</p>
                      <p className="text-sm mt-2">Primary brand color, CTAs, headers</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <div className="bg-accent h-24 rounded mb-3"></div>
                      <h4 className="font-bold mb-1">Innovation Green</h4>
                      <p className="text-sm text-muted-foreground">HSL: 142° 70% 35%</p>
                      <p className="text-sm mt-2">Success states, innovation highlights</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <div className="bg-accent-orange h-24 rounded mb-3"></div>
                      <h4 className="font-bold mb-1">Energy Orange</h4>
                      <p className="text-sm text-muted-foreground">HSL: 25° 90% 52%</p>
                      <p className="text-sm mt-2">Attention, highlights, energy</p>
                    </div>
                  </div>
                </section>

                {/* Typography */}
                <section className="mb-12">
                  <h2 className="text-3xl font-bold mb-4 text-primary border-b-2 border-primary pb-2">Typography</h2>
                  
                  <div className="space-y-6">
                    <div className="border rounded-lg p-6 bg-muted/30">
                      <h1 className="mb-2">H1 - Hero Headlines</h1>
                      <p className="text-sm text-muted-foreground">Font: Inter, Weight: 800, Size: 60px desktop / 36px mobile</p>
                    </div>
                    <div className="border rounded-lg p-6 bg-muted/30">
                      <h2 className="mb-2">H2 - Section Headers</h2>
                      <p className="text-sm text-muted-foreground">Font: Inter, Weight: 700, Size: 48px desktop / 30px mobile</p>
                    </div>
                    <div className="border rounded-lg p-6 bg-muted/30">
                      <h3 className="mb-2">H3 - Subsection Headers</h3>
                      <p className="text-sm text-muted-foreground">Font: Inter, Weight: 700, Size: 30px desktop / 24px mobile</p>
                    </div>
                    <div className="border rounded-lg p-6 bg-muted/30">
                      <p className="mb-2">Body Text - Regular paragraphs and content</p>
                      <p className="text-sm text-muted-foreground">Font: Inter, Weight: 400, Size: 16px, Line Height: 1.7</p>
                    </div>
                  </div>
                </section>

                {/* Core Values */}
                <section className="mb-12">
                  <h2 className="text-3xl font-bold mb-4 text-primary border-b-2 border-primary pb-2">Core Values</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border-l-4 border-primary pl-4">
                      <h4 className="text-xl font-bold mb-2">Excellence</h4>
                      <p>Commitment to the highest standards in every component we manufacture. ISO 13485 certified with uncompromising quality.</p>
                    </div>
                    <div className="border-l-4 border-accent-orange pl-4">
                      <h4 className="text-xl font-bold mb-2">Innovation</h4>
                      <p>Continuous investment in cutting-edge technology. From Citizen CNC machines to advanced metrology equipment.</p>
                    </div>
                    <div className="border-l-4 border-accent pl-4">
                      <h4 className="text-xl font-bold mb-2">Ethics</h4>
                      <p>Operating with integrity and transparency. Honest communication and fair practices with all stakeholders.</p>
                    </div>
                    <div className="border-l-4 border-primary pl-4">
                      <h4 className="text-xl font-bold mb-2">Respect</h4>
                      <p>Valuing every team member, client, and partner. Collaborative environments and long-term partnerships.</p>
                    </div>
                  </div>
                </section>

                {/* Mission & Vision */}
                <section className="mb-12">
                  <h2 className="text-3xl font-bold mb-4 text-primary border-b-2 border-primary pb-2">Mission & Vision</h2>
                  
                  <div className="glass-card p-6 mb-6">
                    <h3 className="text-2xl font-semibold mb-3">Mission Statement</h3>
                    <p className="text-lg italic">
                      "To deliver precision-engineered components that meet the most demanding quality standards in medical manufacturing, 
                      enabling our partners to bring life-changing medical technologies to patients worldwide."
                    </p>
                  </div>

                  <div className="glass-card p-6">
                    <h3 className="text-2xl font-semibold mb-3">Vision Statement</h3>
                    <p className="text-lg italic">
                      "To be recognized as the premier precision manufacturing partner for medical device companies globally, 
                      known for uncompromising quality, technological excellence, and collaborative partnerships."
                    </p>
                  </div>
                </section>

                {/* Brand Voice */}
                <section className="mb-12">
                  <h2 className="text-3xl font-bold mb-4 text-primary border-b-2 border-primary pb-2">Brand Voice & Tone</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-accent/10 border-l-4 border-accent p-4 rounded">
                      <h4 className="font-bold mb-3 text-accent">✓ Do's</h4>
                      <ul className="space-y-2">
                        <li>• Professional and confident</li>
                        <li>• Technical specificity</li>
                        <li>• Partnership language</li>
                        <li>• Focus on quality</li>
                        <li>• Active voice</li>
                      </ul>
                    </div>
                    <div className="bg-destructive/10 border-l-4 border-destructive p-4 rounded">
                      <h4 className="font-bold mb-3 text-destructive">✗ Don'ts</h4>
                      <ul className="space-y-2">
                        <li>• Casual tone</li>
                        <li>• Marketing clichés</li>
                        <li>• Unsupported claims</li>
                        <li>• Jargon without context</li>
                        <li>• Passive voice</li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 p-6 bg-muted/30 rounded-lg">
                    <h4 className="font-bold mb-3">Example Copy Styles</h4>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Hero Section:</p>
                        <p className="text-accent font-medium">✓ "Engineering Excellence for Healthcare Innovation"</p>
                        <p className="text-destructive">✗ "The Best Manufacturing You'll Ever Find!"</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">CTA Button:</p>
                        <p className="text-accent font-medium">✓ "Schedule Manufacturing Consultation"</p>
                        <p className="text-destructive">✗ "Click Here Now!"</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* UI Components */}
                <section className="mb-12">
                  <h2 className="text-3xl font-bold mb-4 text-primary border-b-2 border-primary pb-2">UI Components</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-bold mb-3">Buttons</h4>
                      <div className="flex flex-wrap gap-4">
                        <Button>Primary Button</Button>
                        <Button variant="secondary">Secondary Button</Button>
                        <Button variant="outline">Outline Button</Button>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold mb-3">Cards</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="p-4">
                          <p className="font-semibold mb-2">Standard Card</p>
                          <p className="text-sm text-muted-foreground">Default card styling</p>
                        </Card>
                        <div className="glass-card p-4">
                          <p className="font-semibold mb-2">Glass Card</p>
                          <p className="text-sm text-muted-foreground">Glassmorphic effect</p>
                        </div>
                        <div className="glass-card-strong p-4">
                          <p className="font-semibold mb-2">Premium Card</p>
                          <p className="text-sm text-muted-foreground">Enhanced glass effect</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Footer */}
                <section className="mt-12 pt-6 border-t">
                  <p className="text-sm text-muted-foreground text-center">
                    <strong>Document Version:</strong> 1.0 | <strong>Last Updated:</strong> 2025 | <strong>Next Review:</strong> Quarterly
                  </p>
                  <p className="text-sm text-muted-foreground text-center mt-2">
                    <strong>Confidential:</strong> This brand book is for internal use and approved partners only.
                  </p>
                </section>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
