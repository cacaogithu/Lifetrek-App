import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, Clock, TrendingUp } from "lucide-react";

interface LeadsStatsProps {
  totalLeads: number;
  newLeads: number;
  pendingLeads: number;
  conversionRate: number;
}

export const LeadsStats = ({ totalLeads, newLeads, pendingLeads, conversionRate }: LeadsStatsProps) => {
  const stats = [
    {
      title: "Total de Leads",
      value: totalLeads,
      icon: Users,
      description: "Todos os leads recebidos"
    },
    {
      title: "Leads Novos",
      value: newLeads,
      icon: UserPlus,
      description: "Últimas 24 horas"
    },
    {
      title: "Em Andamento",
      value: pendingLeads,
      icon: Clock,
      description: "Aguardando ação"
    },
    {
      title: "Taxa de Conversão",
      value: `${conversionRate.toFixed(1)}%`,
      icon: TrendingUp,
      description: "Leads fechados"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
