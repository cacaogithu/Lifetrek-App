import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Trash2 } from "lucide-react";
import { LeadStatusBadge } from "./LeadStatusBadge";
import { LeadPriorityIndicator } from "./LeadPriorityIndicator";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const PROJECT_TYPE_LABELS: Record<string, string> = {
  dental_implants: "Implantes Dentários",
  orthopedic_implants: "Implantes Ortopédicos",
  spinal_implants: "Implantes Espinhais",
  veterinary_implants: "Implantes Veterinários",
  surgical_instruments: "Instrumentos Cirúrgicos",
  micro_precision_parts: "Micro Precisão",
  custom_tooling: "Ferramental",
  medical_devices: "Dispositivos",
  measurement_tools: "Medição",
  other_medical: "Outros",
};

interface Lead {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string;
  project_types: string[];
  annual_volume: string | null;
  technical_requirements: string;
  message: string | null;
  status: 'new' | 'contacted' | 'in_progress' | 'quoted' | 'closed' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  admin_notes: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

interface LeadsTableProps {
  leads: Lead[];
  onViewDetails: (lead: Lead) => void;
  onDelete: (leadId: string) => void;
}

export const LeadsTable = ({ leads, onViewDetails, onDelete }: LeadsTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Prioridade</TableHead>
            <TableHead>Nome</TableHead>
        <TableHead>Empresa</TableHead>
        <TableHead>Email</TableHead>
        <TableHead>Telefone</TableHead>
        <TableHead>Tipos de Projeto</TableHead>
        <TableHead>Status</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-muted-foreground">
                Nenhum lead encontrado
              </TableCell>
            </TableRow>
          ) : (
            leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell>
                  <LeadPriorityIndicator priority={lead.priority} />
                </TableCell>
                <TableCell className="font-medium">{lead.name}</TableCell>
                <TableCell>{lead.company || '-'}</TableCell>
                <TableCell>{lead.email}</TableCell>
                <TableCell>{lead.phone}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {lead.project_types?.map((type) => (
                      <Badge key={type} variant="outline" className="text-xs">
                        {PROJECT_TYPE_LABELS[type] || type}
                      </Badge>
                    )) || <span className="text-muted-foreground">-</span>}
                  </div>
                </TableCell>
                <TableCell>
                  <LeadStatusBadge status={lead.status} />
                </TableCell>
                <TableCell>
                  {format(new Date(lead.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(lead)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(lead.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
