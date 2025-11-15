import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LeadStatusBadge } from "./LeadStatusBadge";
import { LeadPriorityIndicator } from "./LeadPriorityIndicator";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface LeadAnalytics {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string;
  project_types: string[];
  annual_volume: string | null;
  status: 'new' | 'contacted' | 'in_progress' | 'quoted' | 'closed' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  time_bucket: string;
  is_converted: boolean;
}

interface LeadAnalyticsTableProps {
  data: LeadAnalytics[];
  onViewDetails: (lead: any) => void;
}

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

export const LeadAnalyticsTable = ({ data, onViewDetails }: LeadAnalyticsTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Análise Detalhada de Leads</CardTitle>
        <CardDescription>
          Visualização completa dos leads com tipos de projeto e métricas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Tipos de Projeto</TableHead>
              <TableHead>Volume Anual</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead>Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Nenhum lead encontrado
                </TableCell>
              </TableRow>
            ) : (
              data.map((lead) => (
                <TableRow
                  key={lead.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onViewDetails(lead)}
                >
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell>{lead.company || "-"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {lead.project_types.map((type) => (
                        <Badge key={type} variant="outline" className="text-xs">
                          {PROJECT_TYPE_LABELS[type] || type}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{lead.annual_volume || "-"}</TableCell>
                  <TableCell>
                    <LeadStatusBadge status={lead.status} />
                  </TableCell>
                  <TableCell>
                    <LeadPriorityIndicator priority={lead.priority} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(lead.created_at), "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};