import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import StatsCard from "@/components/ui/stats-card";
import { Link } from "wouter";
import { 
  Boxes, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  ArrowRight 
} from "lucide-react";
import { DashboardStats, StorageAreaWithStats } from "@shared/schema";

export default function Dashboard() {
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: storageAreas = [] } = useQuery<StorageAreaWithStats[]>({
    queryKey: ["/api/storage-areas/with-stats"],
  });

  const getStorageAreaCardStyle = (areaId: string) => {
    switch (areaId) {
      case "dry-storage":
        return "storage-area-card-dry";
      case "cold-storage":
        return "storage-area-card-cold";
      case "freezer":
        return "storage-area-card-freezer";
      default:
        return "zawadi-card";
    }
  };

  const getStorageAreaTextStyle = (areaId: string) => {
    switch (areaId) {
      case "dry-storage":
        return "text-amber-900 font-bold";
      case "cold-storage":
        return "text-blue-900 font-bold";
      case "freezer":
        return "text-purple-900 font-bold";
      default:
        return "text-foreground";
    }
  };

  const statsCards = [
    {
      title: "Total Items",
      value: stats?.totalItems || 0,
      icon: Boxes,
      bgColor: "bg-white",
      textColor: "text-gray-900",
      iconBgColor: "bg-blue-100",
      href: "/storage-area/dry-storage", // Navigate to main inventory view
      clickable: true,
    },
    {
      title: "Low Stock Items", 
      value: stats?.lowStockItems || 0,
      icon: AlertTriangle,
      bgColor: "bg-white",
      textColor: "text-red-600",
      iconBgColor: "bg-red-100",
      href: "/order-now", // Navigate to order page
      clickable: true,
    },
    {
      title: "Pending Orders",
      value: stats?.pendingOrders || 0,
      icon: Clock,
      bgColor: "bg-white", 
      textColor: "text-yellow-600",
      iconBgColor: "bg-yellow-100",
      href: "/order-now", // Navigate to order page
      clickable: true,
    },
    {
      title: "Well Stocked",
      value: stats?.wellStocked || 0,
      icon: CheckCircle,
      bgColor: "bg-white",
      textColor: "text-green-600", 
      iconBgColor: "bg-green-100",
      href: "/storage-area/dry-storage", // Navigate to inventory view filtered for well-stocked
      clickable: true,
    },
  ];

  return (
    <main className="p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((card) => (
          <StatsCard key={card.title} {...card} />
        ))}
      </div>

      {/* Low Stock Alert */}
      {stats && stats.lowStockItems > 0 && (
        <Alert className="bg-red-50 border-red-200 mb-6" data-testid="alert-low-stock">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium" data-testid="text-alert-title">
                  {stats.lowStockItems} items need immediate attention
                </h3>
                <p className="mt-1" data-testid="text-alert-description">
                  Several items are below minimum stock levels. Review your inventory and place orders to avoid stockouts.
                </p>
              </div>
              <Link href="/order-now">
                <Button variant="outline" className="text-red-700 border-red-300 hover:bg-red-100" data-testid="button-view-items">
                  View Items <ArrowRight className="ml-1 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Storage Areas Quick View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {storageAreas.map((area) => (
          <div key={area.id} className={`p-6 ${getStorageAreaCardStyle(area.id)}`} data-testid={`card-storage-${area.id}`}>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xl font-bold ${getStorageAreaTextStyle(area.id)}`} data-testid={`text-area-name-${area.id}`}>
                  {area.name}
                </h3>
                {area.lowStockCount > 0 && (
                  <span className="bg-red-600 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg" data-testid={`badge-low-count-${area.id}`}>
                    {area.lowStockCount} Low
                  </span>
                )}
              </div>
              
              <div className="space-y-3 mb-6">
                {area.categories.slice(0, 3).map((category) => (
                  <div key={category.id} className="flex items-center justify-between bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30">
                    <span className={`font-medium ${getStorageAreaTextStyle(area.id)}`} data-testid={`text-category-${category.id}`}>
                      {category.name}
                    </span>
                    <span className={`font-bold ${getStorageAreaTextStyle(area.id)}`} data-testid={`text-item-count-${category.id}`}>
                      {category.itemCount} items
                    </span>
                  </div>
                ))}
              </div>
              
              <Link href={`/storage/${area.id}`}>
                <Button 
                  className="w-full bg-white/90 hover:bg-white text-slate-800 font-semibold py-3 rounded-lg shadow-lg hover:scale-105 transition-all duration-200"
                  data-testid={`button-view-details-${area.id}`}
                >
                  View Details
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle data-testid="text-recent-activity-title">Recent Inventory Updates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500" data-testid="text-no-activity">
              No recent activity to display
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}