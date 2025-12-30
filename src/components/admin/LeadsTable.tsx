import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Trash2 } from "lucide-react";
import { LeadStatusBadge } from "./LeadStatusBadge";
import { LeadPriorityIndicator } from "./LeadPriorityIndicator";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const PROJECT_TYPE_LABELS: Record<string, string> = {
  dental_implants: "Dental Implants",
  orthopedic_implants: "Orthopedic Implants",
  spinal_implants: "Spinal Implants",
  veterinary_implants: "Veterinary Implants",
  surgical_instruments: "Surgical Instruments",
  micro_precision_parts: "Micro Precision",
  custom_tooling: "Custom Tooling",
  medical_devices: "Medical Devices",
  measurement_tools: "Measurement Tools",
  other_medical: "Other Medical",
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
  lead_score: number | null;
  score_breakdown: any | null;
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
            <TableHead>Score</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Project Types</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center text-muted-foreground">
                No leads found
              </TableCell>
            </TableRow>
          ) : (
            leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell>
                  {lead.lead_score !== null ? (
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={
                          lead.lead_score >= 80 ? "default" : 
                          lead.lead_score >= 60 ? "secondary" : 
                          "outline"
                        }
                        className={
                          lead.lead_score >= 80 ? "bg-red-500 hover:bg-red-600" : 
                          lead.lead_score >= 60 ? "bg-amber-500 hover:bg-amber-600" : 
                          ""
                        }
                      >
                        {lead.lead_score >= 80 ? "🔥" : lead.lead_score >= 60 ? "⚡" : "❄️"} {lead.lead_score}
                      </Badge>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>
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
                  {format(new Date(lead.created_at), "MM/dd/yyyy HH:mm")}
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
