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
  dental_implants: "Dental Implants",
  orthopedic_implants: "Orthopedic Implants",
  spinal_implants: "Spinal Implants",
  veterinary_implants: "Veterinary Implants",
  surgical_instruments: "Surgical Instruments",
  micro_precision_parts: "Micro Precision Parts",
  custom_tooling: "Custom Tooling",
  medical_devices: "Medical Devices",
  measurement_tools: "Measurement Tools",
  other_medical: "Other Medical",
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
      label: "Total Leads",
      color: "hsl(var(--primary))",
    },
    converted: {
      label: "Converted",
      color: "hsl(var(--success))",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribution by Project Type</CardTitle>
        <CardDescription>
          Lead analysis by project category and conversion rate
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
                        return [`${value}%`, "Conversion Rate"];
                      }
                      return [value, name === "total" ? "Total" : "Converted"];
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
