import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Users,
    FileCheck,
    Image,
    Sparkles,
    TrendingUp,
    Clock,
    AlertCircle,
    ArrowRight,
    Presentation,
    FileText,
    CheckCircle2,
    Eye
} from "lucide-react";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import { MarketingGoals } from "@/components/admin/MarketingGoals";

interface DashboardStats {
    totalLeads: number;
    newLeads: number;
    highPriorityLeads: number;
    pendingApprovals: number;
    pendingCarousels: number;
    pendingBlogs: number;
    totalProducts: number;
}

interface QuickAction {
    title: string;
    description: string;
    icon: React.ElementType;
    href: string;
    badge?: string;
    badgeVariant?: "default" | "destructive" | "secondary";
    requiresSuperAdmin?: boolean;
}

export function DashboardOverview() {
    const navigate = useNavigate();
    const { isSuperAdmin, displayName, userEmail, canAccessLinkedIn } = useAdminPermissions();
    const [stats, setStats] = useState<DashboardStats>({
        totalLeads: 0,
        newLeads: 0,
        highPriorityLeads: 0,
        pendingApprovals: 0,
        pendingCarousels: 0,
        pendingBlogs: 0,
        totalProducts: 0
    });
    const [recentLeads, setRecentLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch leads stats
            const { data: leads, error: leadsError } = await supabase
                .from("contact_leads")
                .select("*")
                .order("created_at", { ascending: false });

            if (leadsError) throw leadsError;

            const now = new Date();
            const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

            const newLeads = leads?.filter(l => new Date(l.created_at) >= yesterday) || [];
            const highPriority = leads?.filter(l => l.priority === 'high') || [];

            // Fetch pending content approvals
            const { data: pendingTemplates } = await supabase
                .from("content_templates")
                .select("id")
                .eq("status", "pending_approval");

            // Fetch pending carousels
            const { data: pendingCarousels } = await supabase
                .from("linkedin_carousels")
                .select("id")
                .eq("status", "pending_approval");

            // Fetch pending blogs
            const { data: pendingBlogs } = await supabase
                .from("blog_posts")
                .select("id")
                .eq("status", "pending");

            // Fetch products count
            const { data: products } = await supabase
                .from("processed_product_images")
                .select("id")
                .eq("is_visible", true);

            setStats({
                totalLeads: leads?.length || 0,
                newLeads: newLeads.length,
                highPriorityLeads: highPriority.length,
                pendingApprovals: pendingTemplates?.length || 0,
                pendingCarousels: pendingCarousels?.length || 0,
                pendingBlogs: pendingBlogs?.length || 0,
                totalProducts: products?.length || 0
            });

            setRecentLeads(leads?.slice(0, 5) || []);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const userName = displayName || userEmail?.split('@')[0] || 'Admin';

    // Quick actions based on role
    const quickActions: QuickAction[] = [
        {
            title: "Ver Leads",
            description: "Gerenciar todos os leads",
            icon: Users,
            href: "/admin/leads",
            badge: stats.newLeads > 0 ? `${stats.newLeads} novos` : undefined,
            badgeVariant: "destructive"
        },
        {
            title: "Aprovar Conteúdo",
            description: "Templates e carrosséis pendentes",
            icon: FileCheck,
            href: "/admin/content-approval",
            badge: stats.pendingApprovals + stats.pendingCarousels > 0
                ? `${stats.pendingApprovals + stats.pendingCarousels} pendentes`
                : undefined,
            badgeVariant: "secondary"
        },
        {
            title: "Otimizar Imagens",
            description: "Processar fotos de produtos",
            icon: Sparkles,
            href: "/admin/image-processor"
        },
        {
            title: "Blog",
            description: "Gerenciar artigos",
            icon: FileText,
            href: "/admin/blog",
            badge: stats.pendingBlogs > 0 ? `${stats.pendingBlogs} rascunhos` : undefined,
            badgeVariant: "secondary"
        },
        {
            title: "Galeria de Produtos",
            description: "Ver catálogo de imagens",
            icon: Image,
            href: "/admin/gallery"
        }
    ];

    // Super admin exclusive actions
    const superAdminActions: QuickAction[] = [
        {
            title: "LinkedIn Carrossel",
            description: "Criar conteúdo para LinkedIn",
            icon: Presentation,
            href: "/admin/linkedin-carousel",
            requiresSuperAdmin: true
        }
    ];

    const allActions = isSuperAdmin
        ? [...quickActions, ...superAdminActions]
        : quickActions;

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            new: "bg-blue-500/10 text-blue-600",
            contacted: "bg-yellow-500/10 text-yellow-600",
            in_progress: "bg-purple-500/10 text-purple-600",
            quoted: "bg-orange-500/10 text-orange-600",
            closed: "bg-green-500/10 text-green-600",
            rejected: "bg-red-500/10 text-red-600"
        };
        return colors[status] || "bg-muted text-muted-foreground";
    };

    const getPriorityIcon = (priority: string) => {
        if (priority === 'high') return <AlertCircle className="h-4 w-4 text-red-500" />;
        return null;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Welcome Section */}
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-semibold">
                    Olá, {userName}! 👋
                </h2>
                <p className="text-muted-foreground">
                    {isSuperAdmin
                        ? "Você tem acesso completo ao painel administrativo."
                        : "Aqui está um resumo do que precisa da sua atenção."}
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <Card className="relative overflow-hidden">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
                                <p className="text-3xl font-bold">{stats.totalLeads}</p>
                            </div>
                            <div className="p-3 rounded-full bg-primary/10">
                                <Users className="h-5 w-5 text-primary" />
                            </div>
                        </div>
                        {stats.newLeads > 0 && (
                            <Badge variant="destructive" className="absolute top-2 right-2 text-xs">
                                +{stats.newLeads} hoje
                            </Badge>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Alta Prioridade</p>
                                <p className="text-3xl font-bold">{stats.highPriorityLeads}</p>
                            </div>
                            <div className="p-3 rounded-full bg-red-500/10">
                                <AlertCircle className="h-5 w-5 text-red-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
                                <p className="text-3xl font-bold">{stats.pendingApprovals + stats.pendingCarousels}</p>
                            </div>
                            <div className="p-3 rounded-full bg-yellow-500/10">
                                <Clock className="h-5 w-5 text-yellow-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Produtos</p>
                                <p className="text-3xl font-bold">{stats.totalProducts}</p>
                            </div>
                            <div className="p-3 rounded-full bg-green-500/10">
                                <Image className="h-5 w-5 text-green-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Marketing & Sales Goals */}
            <MarketingGoals />

            {/* Quick Actions */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Ações Rápidas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allActions.map((action, index) => (
                        <Card
                            key={index}
                            className="cursor-pointer hover:shadow-md hover:border-primary/50 transition-all group"
                            onClick={() => navigate(action.href)}
                        >
                            <CardContent className="pt-6">
                                {/* ... Action Content ... */}
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                            <action.icon className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium flex items-center gap-2">
                                                {action.title}
                                                {action.badge && (
                                                    <Badge variant={action.badgeVariant || "default"} className="text-xs">
                                                        {action.badge}
                                                    </Badge>
                                                )}
                                            </h4>
                                            <p className="text-sm text-muted-foreground">{action.description}</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Recent Leads */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-lg">Leads Recentes</CardTitle>
                        <CardDescription>Últimos 5 leads recebidos</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/admin/leads')}>
                        Ver todos
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent>
                    {recentLeads.length === 0 ? (
                        <p className="text-muted-foreground text-center py-6">Nenhum lead ainda</p>
                    ) : (
                        <div className="space-y-3">
                            {recentLeads.map((lead) => (
                                <div
                                    key={lead.id}
                                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                                    onClick={() => navigate('/admin/leads')}
                                >
                                    <div className="flex items-center gap-3">
                                        {getPriorityIcon(lead.priority)}
                                        <div>
                                            <p className="font-medium">{lead.name}</p>
                                            <p className="text-sm text-muted-foreground">{lead.company || lead.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge className={getStatusColor(lead.status)} variant="outline">
                                            {lead.status}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}