import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";

interface ProjectTypeData {
  project_type: string;
  count: number;
  converted_count: number;
  conversion_rate: number;
}

interface ProjectTypeDistributionProps {
  data: ProjectTypeData[];
}

const PROJECT_TYPE_LABELS: Record<string, string> = {
  dental_implants: "Implantes Dentários",
  orthopedic_implants: "Implantes Ortopédicos",
  spinal_implants: "Implantes Espinhais",
  veterinary_implants: "Implantes Veterinários",
  surgical_instruments: "Instrumentos Cirúrgicos",
  micro_precision_parts: "Micro Precisão",
  custom_tooling: "Ferramentas Sob Medida",
  medical_devices: "Dispositivos Médicos",
  measurement_tools: "Ferramentas de Medição",
  other_medical: "Outros Médicos",
};

export const ProjectTypeDistribution = ({ data }: ProjectTypeDistributionProps) => {
  const chartData = data.map((item) => ({
    name: PROJECT_TYPE_LABELS[item.project_type] || item.project_type,
    total: item.count,
    converted: item.converted_count,
    rate: item.conversion_rate,
  }));

  const chartConfig = {
    total: {
      label: "Total de Leads",
      color: "hsl(var(--primary))",
    },
    converted: {
      label: "Convertidos",
      color: "hsl(var(--success))",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição por Tipo de Projeto</CardTitle>
        <CardDescription>
          Análise de leads por categoria de projeto e taxa de conversão
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
                className="text-xs"
              />
              <YAxis className="text-xs" />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => `${value}`}
                    formatter={(value, name) => {
                      if (name === "rate") {
                        return [`${value}%`, "Taxa de Conversão"];
                      }
                      return [value, name === "total" ? "Total" : "Convertidos"];
                    }}
                  />
                }
              />
              <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="converted" fill="var(--color-converted)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};