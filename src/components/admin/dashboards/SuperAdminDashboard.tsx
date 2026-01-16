import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, AlertCircle, Clock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

interface DashboardStats {
    totalLeads: number;
    newLeads: number;
    highPriorityLeads: number;
    pendingApprovals: number;
}

export function SuperAdminDashboard({ userName }: { userName: string }) {
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats>({
        totalLeads: 0,
        newLeads: 0,
        highPriorityLeads: 0,
        pendingApprovals: 0
    });

    useEffect(() => {
        const fetchData = async () => {
             // Fetch leads stats
             const { data: leads } = await supabase
                .from("contact_leads")
                .select("*")
                .order("created_at", { ascending: false });

            const now = new Date();
            const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

            const newLeads = leads?.filter(l => new Date(l.created_at) >= yesterday) || [];
            const highPriority = leads?.filter(l => l.priority === 'high') || [];

            // Fetch pending content approvals
            const { data: pendingTemplates } = await supabase
                .from("content_templates")
                .select("id")
                .eq("status", "pending_approval");

             setStats({
                totalLeads: leads?.length || 0,
                newLeads: newLeads.length,
                highPriorityLeads: highPriority.length,
                pendingApprovals: pendingTemplates?.length || 0
            });
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Welcome */}
            <div>
                <h2 className="text-2xl font-bold">Painel Executivo</h2>
                <p className="text-muted-foreground">Bem-vindo, {userName}. Visão geral de alta performance.</p>
            </div>

            {/* High-Level Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
                                <h3 className="text-3xl font-bold text-primary">{stats.totalLeads}</h3>
                            </div>
                            <div className="p-2 bg-primary/20 rounded-lg">
                                <Users className="h-5 w-5 text-primary" />
                            </div>
                        </div>
                        {stats.newLeads > 0 && (
                            <div className="mt-2 flex items-center gap-1 text-xs text-green-600 font-medium">
                                <span>+{stats.newLeads} novos hoje</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                     <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Atenção Necessária</p>
                                <h3 className="text-3xl font-bold text-destructive">{stats.highPriorityLeads}</h3>
                            </div>
                            <div className="p-2 bg-destructive/10 rounded-lg">
                                <AlertCircle className="h-5 w-5 text-destructive" />
                            </div>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">Leads de alta prioridade</p>
                    </CardContent>
                </Card>

                 <Card>
                     <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Aprovações</p>
                                <h3 className="text-3xl font-bold text-amber-600">{stats.pendingApprovals}</h3>
                            </div>
                            <div className="p-2 bg-amber-100 rounded-lg">
                                <Clock className="h-5 w-5 text-amber-600" />
                            </div>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">Conteúdos aguardando revisão</p>
                    </CardContent>
                </Card>
            </div>
            
            {/* Placeholder for future Analytics */}
            <Card className="border-dashed">
                <CardHeader>
                    <CardTitle className="text-lg">Website & Analytics (Em Breve)</CardTitle>
                    <CardDescription>Integração com dados de tráfego e conversão via Unipile/GA4.</CardDescription>
                </CardHeader>
                <CardContent className="h-32 flex items-center justify-center text-muted-foreground text-sm">
                    Aguardando API de dados...
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={() => navigate('/admin/leads')} variant="outline" className="gap-2">
                    Gerenciar Leads <ArrowRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
