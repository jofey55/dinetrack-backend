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
  const getCardStyle = (title: string) => {
    switch (title) {
      case "Total Items":
        return "zawadi-card bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/10 border-l-4 border-l-blue-500";
      case "Low Stock Items":
        return "zawadi-card bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/10 border-l-4 border-l-red-500";
      case "Pending Orders":
        return "zawadi-card bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-950/20 dark:to-yellow-900/10 border-l-4 border-l-yellow-500";
      case "Well Stocked":
        return "zawadi-card bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/10 border-l-4 border-l-green-500";
      default:
        return "zawadi-card";
    }
  };

  const getValueColor = (title: string) => {
    switch (title) {
      case "Total Items":
        return "text-blue-700 dark:text-blue-300";
      case "Low Stock Items":
        return "text-red-600 dark:text-red-400";
      case "Pending Orders":
        return "text-yellow-600 dark:text-yellow-400";
      case "Well Stocked":
        return "text-green-600 dark:text-green-400";
      default:
        return textColor;
    }
  };

  return (
    <Card className={getCardStyle(title)} data-testid={`card-stats-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground" data-testid={`text-stats-title-${title.toLowerCase().replace(/\s+/g, '-')}`}>
              {title}
            </p>
            <p className={`text-3xl font-bold ${getValueColor(title)}`} data-testid={`text-stats-value-${title.toLowerCase().replace(/\s+/g, '-')}`}>
              {value}
            </p>
          </div>
          <div className={`${iconBgColor} p-3 rounded-full`}>
            <Icon className={`w-6 h-6 ${getValueColor(title)}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}