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

  const statsCards = [
    {
      title: "Total Items",
      value: stats?.totalItems || 0,
      icon: Boxes,
      bgColor: "bg-white",
      textColor: "text-gray-900",
      iconBgColor: "bg-blue-100",
    },
    {
      title: "Low Stock Items", 
      value: stats?.lowStockItems || 0,
      icon: AlertTriangle,
      bgColor: "bg-white",
      textColor: "text-red-600",
      iconBgColor: "bg-red-100",
    },
    {
      title: "Pending Orders",
      value: stats?.pendingOrders || 0,
      icon: Clock,
      bgColor: "bg-white", 
      textColor: "text-yellow-600",
      iconBgColor: "bg-yellow-100",
    },
    {
      title: "Well Stocked",
      value: stats?.wellStocked || 0,
      icon: CheckCircle,
      bgColor: "bg-white",
      textColor: "text-green-600", 
      iconBgColor: "bg-green-100",
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
          <Card key={area.id} data-testid={`card-storage-${area.id}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg" data-testid={`text-area-name-${area.id}`}>
                  {area.name}
                </CardTitle>
                {area.lowStockCount > 0 && (
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full" data-testid={`badge-low-count-${area.id}`}>
                    {area.lowStockCount} Low
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {area.categories.slice(0, 3).map((category) => (
                  <div key={category.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600" data-testid={`text-category-${category.id}`}>
                      {category.name}
                    </span>
                    <span className="font-medium" data-testid={`text-item-count-${category.id}`}>
                      {category.itemCount} items
                    </span>
                  </div>
                ))}
              </div>
              <Link href={`/storage/${area.id}`}>
                <Button 
                  variant="outline" 
                  className="w-full mt-6 hover:bg-gray-50"
                  data-testid={`button-view-details-${area.id}`}
                >
                  View Details
                </Button>
              </Link>
            </CardContent>
          </Card>
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