import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  bgColor: string;
  textColor: string;
  iconBgColor: string;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  bgColor,
  textColor,
  iconBgColor,
}: StatsCardProps) {
  return (
    <Card className={`${bgColor} shadow-sm`} data-testid={`card-stats-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600" data-testid={`text-stats-title-${title.toLowerCase().replace(/\s+/g, '-')}`}>
              {title}
            </p>
            <p className={`text-3xl font-bold ${textColor}`} data-testid={`text-stats-value-${title.toLowerCase().replace(/\s+/g, '-')}`}>
              {value}
            </p>
          </div>
          <div className={`${iconBgColor} p-3 rounded-full`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}