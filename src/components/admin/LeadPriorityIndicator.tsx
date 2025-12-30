import { ArrowUp, ArrowDown, Minus } from "lucide-react";

type LeadPriority = 'low' | 'medium' | 'high';

interface LeadPriorityIndicatorProps {
  priority: LeadPriority;
}

export const LeadPriorityIndicator = ({ priority }: LeadPriorityIndicatorProps) => {
  const configs = {
    low: { icon: ArrowDown, className: 'text-green-500', label: 'Low' },
    medium: { icon: Minus, className: 'text-yellow-500', label: 'Medium' },
    high: { icon: ArrowUp, className: 'text-red-500', label: 'High' }
  };

  const config = configs[priority] || configs.medium;
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-1" title={config.label}>
      <Icon className={`h-4 w-4 ${config.className}`} />
    </div>
  );
};
