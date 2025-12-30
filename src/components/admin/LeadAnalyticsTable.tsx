import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LeadStatusBadge } from "./LeadStatusBadge";
import { LeadPriorityIndicator } from "./LeadPriorityIndicator";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

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

export const LeadAnalyticsTable = ({ data, onViewDetails }: LeadAnalyticsTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Detailed Lead Analytics</CardTitle>
        <CardDescription>
          Complete view of leads with project types and metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Project Types</TableHead>
              <TableHead>Annual Volume</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No leads found
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
                    {format(new Date(lead.created_at), "MM/dd/yyyy")}
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
