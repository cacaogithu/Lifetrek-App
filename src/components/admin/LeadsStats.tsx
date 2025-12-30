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
      title: "Total Leads",
      value: totalLeads,
      icon: Users,
      description: "All leads received"
    },
    {
      title: "New Leads",
      value: newLeads,
      icon: UserPlus,
      description: "Last 24 hours"
    },
    {
      title: "In Progress",
      value: pendingLeads,
      icon: Clock,
      description: "Awaiting action"
    },
    {
      title: "Conversion Rate",
      value: `${conversionRate.toFixed(1)}%`,
      icon: TrendingUp,
      description: "Closed leads"
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
