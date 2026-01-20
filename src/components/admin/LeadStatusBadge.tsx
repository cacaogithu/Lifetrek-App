import { Badge } from "@/components/ui/badge";

type LeadStatus = 'new' | 'contacted' | 'in_progress' | 'quoted' | 'closed' | 'rejected';

interface LeadStatusBadgeProps {
  status: LeadStatus;
}

export const LeadStatusBadge = ({ status }: LeadStatusBadgeProps) => {
  const variants = {
    new: { label: 'Novo', variant: 'default' as const, className: 'bg-blue-500 hover:bg-blue-600' },
    contacted: { label: 'Contatado', variant: 'secondary' as const, className: 'bg-purple-500 hover:bg-purple-600' },
    in_progress: { label: 'Em Andamento', variant: 'default' as const, className: 'bg-yellow-500 hover:bg-yellow-600 text-foreground' },
    quoted: { label: 'Orçado', variant: 'default' as const, className: 'bg-cyan-500 hover:bg-cyan-600' },
    closed: { label: 'Fechado', variant: 'default' as const, className: 'bg-green-500 hover:bg-green-600' },
    rejected: { label: 'Rejeitado', variant: 'destructive' as const, className: '' }
  };

  const config = variants[status] || variants.new;

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
};