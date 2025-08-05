import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InventoryItemWithDetails, StorageAreaWithStats } from "@shared/schema";
import { BarChart3, Download, FileText, TrendingDown, TrendingUp, Package, AlertTriangle } from "lucide-react";
import { useState } from "react";

export default function Reports() {
  const [reportType, setReportType] = useState("inventory-summary");
  const [timeRange, setTimeRange] = useState("30-days");

  const { data: storageAreas = [] } = useQuery<StorageAreaWithStats[]>({
    queryKey: ["/api/storage-areas/with-stats"],
  });

  const { data: lowStockItems = [] } = useQuery<InventoryItemWithDetails[]>({
    queryKey: ["/api/inventory-items/low-stock"],
  });

  const { data: allItems = [] } = useQuery<InventoryItemWithDetails[]>({
    queryKey: ["/api/inventory-items"],
  });

  const totalItems = allItems.length;
  const totalValue = allItems.reduce((sum, item) => {
    return sum + (parseFloat(item.currentQuantity) * 10); // Assuming $10 average value per unit
  }, 0);

  const generateReport = () => {
    // TODO: Implement report generation
    console.log(`Generating ${reportType} report for ${timeRange}`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="zawadi-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900" data-testid="text-reports-title">
              Reports & Analytics
            </h1>
            <p className="text-gray-600 mt-1" data-testid="text-reports-subtitle">
              Generate detailed reports and view inventory analytics
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[140px]" data-testid="select-time-range">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7-days">Last 7 Days</SelectItem>
                <SelectItem value="30-days">Last 30 Days</SelectItem>
                <SelectItem value="90-days">Last 90 Days</SelectItem>
                <SelectItem value="1-year">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={generateReport} className="zawadi-button-primary" data-testid="button-generate-report">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="zawadi-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-items">{totalItems}</div>
            <p className="text-xs text-muted-foreground">
              Across {storageAreas.length} storage areas
            </p>
          </CardContent>
        </Card>

        <Card className="zawadi-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-inventory-value">
              ${totalValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Estimated total value
            </p>
          </CardContent>
        </Card>

        <Card className="zawadi-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive" data-testid="text-low-stock-count">
              {lowStockItems.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Items need reordering
            </p>
          </CardContent>
        </Card>

        <Card className="zawadi-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Areas</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-storage-areas-count">
              {storageAreas.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Active locations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="zawadi-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Inventory Summary Report
            </CardTitle>
            <CardDescription>
              Complete overview of all inventory items across storage areas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => setReportType("inventory-summary")}
              data-testid="button-inventory-summary-report"
            >
              Generate Summary Report
            </Button>
          </CardContent>
        </Card>

        <Card className="zawadi-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingDown className="w-5 h-5 mr-2" />
              Low Stock Report
            </CardTitle>
            <CardDescription>
              Items that need immediate attention and reordering
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => setReportType("low-stock")}
              data-testid="button-low-stock-report"
            >
              Generate Low Stock Report
            </Button>
          </CardContent>
        </Card>

        <Card className="zawadi-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Usage Analytics
            </CardTitle>
            <CardDescription>
              Track inventory usage patterns and trends over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => setReportType("usage-analytics")}
              data-testid="button-usage-analytics-report"
            >
              Generate Analytics Report
            </Button>
          </CardContent>
        </Card>

        <Card className="zawadi-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Category Breakdown
            </CardTitle>
            <CardDescription>
              Detailed analysis by categories and storage areas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => setReportType("category-breakdown")}
              data-testid="button-category-breakdown-report"
            >
              Generate Category Report
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Storage Areas Performance */}
      <Card className="zawadi-card">
        <CardHeader>
          <CardTitle>Storage Areas Overview</CardTitle>
          <CardDescription>Current status and performance by storage location</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {storageAreas.map((area) => (
              <div key={area.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium" data-testid={`text-area-${area.id}`}>{area.name}</h3>
                  <p className="text-sm text-gray-600">
                    {area.totalItems} items • {area.lowStockCount} low stock
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {area.lowStockCount === 0 ? (
                      <span className="text-green-600">All Good</span>
                    ) : (
                      <span className="text-red-600">Needs Attention</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}