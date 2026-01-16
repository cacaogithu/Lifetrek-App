import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

import { LeadsTable } from "@/components/admin/LeadsTable";
import { LeadDetailsModal } from "@/components/admin/LeadDetailsModal";
import { LeadFilters } from "@/components/admin/LeadFilters";
import { LeadsStats } from "@/components/admin/LeadsStats";
import { LeadsImporter } from "@/components/admin/LeadsImporter";
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
    const [loading, setLoading] = useState(true);

    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        fetchLeads();
    }, []);

    useEffect(() => {
        let filtered = [...leads];

        if (searchTerm) {
            filtered = filtered.filter(lead =>
                lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (lead.company && lead.company.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        if (statusFilter !== "all") {
            filtered = filtered.filter(lead => lead.status === statusFilter);
        }

        if (priorityFilter !== "all") {
            filtered = filtered.filter(lead => lead.priority === priorityFilter);
        }

        setFilteredLeads(filtered);
    }, [leads, searchTerm, statusFilter, priorityFilter]);

    const fetchLeads = async () => {
        try {
            // First get the total count and data up to 5000 records
            const { data, error, count } = await supabase
                .from("contact_leads")
                .select("*", { count: 'exact' })
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
                <p className="text-muted-foreground">Gerencie todos os leads recebidos</p>
            </div>

            <LeadsStats {...calculateLeadStats()} />

            <LeadsImporter onImportComplete={fetchLeads} />

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
