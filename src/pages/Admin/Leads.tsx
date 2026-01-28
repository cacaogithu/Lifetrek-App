import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { LeadsTable } from "@/components/admin/LeadsTable";
import { LeadDetailsModal } from "@/components/admin/LeadDetailsModal";
import { LeadFilters } from "@/components/admin/LeadFilters";
import { LeadsStats } from "@/components/admin/LeadsStats";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function Leads() {
    const [leads, setLeads] = useState<any[]>([]);
    const [filteredLeads, setFilteredLeads] = useState<any[]>([]);
    const [selectedLead, setSelectedLead] = useState<any | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [leadToDelete, setLeadToDelete] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [focusFilter, setFocusFilter] = useState("all");
    const [loading, setLoading] = useState(true);

    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        fetchLeads();
    }, []);

    const applyFocusFilter = (items: any[]) => {
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        switch (focusFilter) {
            case "new_24h":
                return items.filter(lead => new Date(lead.created_at) >= oneDayAgo);
            case "high_score":
                return items.filter(lead => (lead.lead_score || 0) >= 80);
            case "needs_action":
                return items.filter(lead => ["new", "contacted", "in_progress"].includes(lead.status));
            case "stale":
                return items.filter(lead =>
                    new Date(lead.created_at) < sevenDaysAgo &&
                    !["closed", "rejected"].includes(lead.status)
                );
            default:
                return items;
        }
    };

    useEffect(() => {
        let filtered = [...leads];

        if (searchTerm) {
            filtered = filtered.filter(lead =>
                lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (lead.phone && lead.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (lead.company && lead.company.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        if (statusFilter !== "all") {
            filtered = filtered.filter(lead => lead.status === statusFilter);
        }

        if (priorityFilter !== "all") {
            filtered = filtered.filter(lead => lead.priority === priorityFilter);
        }

        filtered = applyFocusFilter(filtered);

        setFilteredLeads(filtered);
    }, [leads, searchTerm, statusFilter, priorityFilter, focusFilter]);

    const fetchLeads = async () => {
        try {
            // First get the total count and data up to 5000 records
            const { data, error, count } = await supabase
                .from("contact_leads")
                .select("*", { count: 'exact' })
                .eq("source", "website")
                .order("lead_score", { ascending: false, nullsFirst: false })
                .order("created_at", { ascending: false })
                .range(0, 4999);

            if (error) throw error;

            setLeads(data || []);
            setFilteredLeads(data || []);
            setTotalCount(count || 0);
        } catch (error) {
            console.error("Error fetching leads:", error);
            toast.error("Falha ao carregar leads");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteLead = async () => {
        if (!leadToDelete) return;

        try {
            const { error } = await supabase
                .from("contact_leads")
                .delete()
                .eq("id", leadToDelete);

            if (error) throw error;

            toast.success("Lead deletado com sucesso");
            await fetchLeads();
            setLeadToDelete(null);
        } catch (error) {
            console.error("Error deleting lead:", error);
            toast.error("Falha ao deletar lead");
        }
    };

    const handleViewDetails = (lead: any) => {
        setSelectedLead(lead);
        setIsDetailsModalOpen(true);
    };

    const calculateLeadStats = () => {
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        const newLeads = leads.filter(lead => new Date(lead.created_at) >= yesterday).length;
        const pendingLeads = leads.filter(lead =>
            lead.status === 'new' || lead.status === 'contacted' || lead.status === 'in_progress'
        ).length;
        const closedLeads = leads.filter(lead => lead.status === 'closed').length;
        const conversionRate = totalCount > 0 ? (closedLeads / totalCount) * 100 : 0;

        return {
            totalLeads: totalCount,
            newLeads,
            pendingLeads,
            conversionRate
        };
    };

    const focusCounts = (() => {
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return {
            all: totalCount,
            new_24h: leads.filter(lead => new Date(lead.created_at) >= oneDayAgo).length,
            high_score: leads.filter(lead => (lead.lead_score || 0) >= 80).length,
            needs_action: leads.filter(lead => ["new", "contacted", "in_progress"].includes(lead.status)).length,
            stale: leads.filter(lead =>
                new Date(lead.created_at) < sevenDaysAgo &&
                !["closed", "rejected"].includes(lead.status)
            ).length
        };
    })();

    const qualitySnapshot = (() => {
        const total = leads.length || 0;
        const withProjectTypes = leads.filter(lead =>
            (lead.project_types && lead.project_types.length > 0) || lead.project_type
        ).length;
        const withCompany = leads.filter(lead => !!lead.company).length;
        const withScore = leads.filter(lead => lead.lead_score !== null && lead.lead_score !== undefined);
        const avgScore = withScore.length > 0
            ? Math.round(withScore.reduce((sum, lead) => sum + (lead.lead_score || 0), 0) / withScore.length)
            : 0;

        return {
            avgScore,
            projectTypeCoverage: total > 0 ? Math.round((withProjectTypes / total) * 100) : 0,
            companyCoverage: total > 0 ? Math.round((withCompany / total) * 100) : 0
        };
    })();

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold">Leads</h1>
                <p className="text-muted-foreground">Gerencie todos os leads recebidos pelo website</p>
            </div>

            <LeadsStats {...calculateLeadStats()} />

            <Card>
                <CardHeader>
                    <CardTitle>Fila de Foco</CardTitle>
                    <CardDescription>Atalhos rápidos para o que precisa de ação agora</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {[
                            { id: "all", label: "Todos", count: focusCounts.all },
                            { id: "new_24h", label: "Novos 24h", count: focusCounts.new_24h },
                            { id: "high_score", label: "Score 80+", count: focusCounts.high_score },
                            { id: "needs_action", label: "Precisa ação", count: focusCounts.needs_action },
                            { id: "stale", label: "Parados 7d+", count: focusCounts.stale }
                        ].map((item) => (
                            <Button
                                key={item.id}
                                type="button"
                                variant={focusFilter === item.id ? "default" : "outline"}
                                size="sm"
                                className={cn("gap-2", focusFilter === item.id && "shadow-sm")}
                                onClick={() => setFocusFilter(item.id)}
                            >
                                {item.label}
                                <Badge variant="secondary" className="px-2">
                                    {item.count}
                                </Badge>
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Qualidade dos Dados</CardTitle>
                    <CardDescription>Visão rápida de completude e score médio</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Score médio</p>
                            <p className="text-2xl font-bold">{qualitySnapshot.avgScore}</p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Tipos de projeto</span>
                                <span className="font-medium">{qualitySnapshot.projectTypeCoverage}%</span>
                            </div>
                            <Progress value={qualitySnapshot.projectTypeCoverage} />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Empresa informada</span>
                                <span className="font-medium">{qualitySnapshot.companyCoverage}%</span>
                            </div>
                            <Progress value={qualitySnapshot.companyCoverage} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Filtros</CardTitle>
                </CardHeader>
                <CardContent>
                    <LeadFilters
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        statusFilter={statusFilter}
                        onStatusChange={setStatusFilter}
                        priorityFilter={priorityFilter}
                        onPriorityChange={setPriorityFilter}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Todos os Leads ({filteredLeads.length})</CardTitle>
                    <CardDescription>
                        Gerencie e acompanhe todos os leads recebidos pelo formulário de contato
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <LeadsTable
                        leads={filteredLeads}
                        onViewDetails={handleViewDetails}
                        onDelete={(id) => setLeadToDelete(id)}
                    />
                </CardContent>
            </Card>

            <LeadDetailsModal
                lead={selectedLead}
                open={isDetailsModalOpen}
                onOpenChange={setIsDetailsModalOpen}
                onUpdate={fetchLeads}
            />

            <AlertDialog open={!!leadToDelete} onOpenChange={() => setLeadToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir este lead? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteLead}>Excluir</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
