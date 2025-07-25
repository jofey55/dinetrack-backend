import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, ShoppingCart, AlertTriangle } from "lucide-react";
import { InventoryItemWithDetails } from "@shared/schema";
import { useState } from "react";

export default function OrderNow() {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [orderQuantities, setOrderQuantities] = useState<Record<string, string>>({});

  const { data: lowStockItems = [] } = useQuery<InventoryItemWithDetails[]>({
    queryKey: ["/api/inventory-items/low-stock"],
  });

  // Group items by storage area
  const itemsByArea = lowStockItems.reduce((acc, item) => {
    const areaName = item.storageArea.name;
    if (!acc[areaName]) {
      acc[areaName] = [];
    }
    acc[areaName].push(item);
    return acc;
  }, {} as Record<string, InventoryItemWithDetails[]>);

  const handleItemSelect = (itemId: string, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(itemId);
    } else {
      newSelected.delete(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAllArea = (areaItems: InventoryItemWithDetails[], checked: boolean) => {
    const newSelected = new Set(selectedItems);
    areaItems.forEach(item => {
      if (checked) {
        newSelected.add(item.id);
      } else {
        newSelected.delete(item.id);
      }
    });
    setSelectedItems(newSelected);
  };

  const handleQuantityChange = (itemId: string, quantity: string) => {
    setOrderQuantities(prev => ({ ...prev, [itemId]: quantity }));
  };

  const getSuggestedQuantity = (item: InventoryItemWithDetails) => {
    const current = parseFloat(item.currentQuantity);
    const minimum = parseFloat(item.minimumLevel);
    const suggested = Math.max(minimum * 2 - current, minimum);
    return Math.ceil(suggested).toString();
  };

  const getAreaBadgeColor = (itemCount: number) => {
    if (itemCount <= 3) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getStockIndicatorColor = (item: InventoryItemWithDetails) => {
    const current = parseFloat(item.currentQuantity);
    const minimum = parseFloat(item.minimumLevel);
    if (current <= minimum * 0.5) return "bg-red-500";
    if (current <= minimum) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" data-testid="text-page-title">
            Order Now
          </h1>
          <p className="text-gray-600 mt-1" data-testid="text-page-subtitle">
            {lowStockItems.length} items below minimum stock levels across all storage areas
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" data-testid="button-export-order">
            <Download className="w-4 h-4 mr-2" />
            Export List
          </Button>
          <Button data-testid="button-process-order">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Process Order
          </Button>
        </div>
      </div>

      {/* Order Summary Alert */}
      {lowStockItems.length > 0 && (
        <Alert className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200 mb-6" data-testid="alert-order-summary">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold" data-testid="text-critical-alert-title">
                  Critical Stock Alert
                </h3>
                <p className="mt-1" data-testid="text-critical-alert-description">
                  Multiple items require immediate reordering to prevent stockouts
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-red-800" data-testid="text-items-count">
                  {lowStockItems.length}
                </div>
                <div className="text-sm text-red-600">Items to Order</div>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Items to Order by Storage Area */}
      <div className="space-y-6">
        {Object.entries(itemsByArea).map(([areaName, areaItems]) => (
          <Card key={areaName} data-testid={`card-area-${areaName.toLowerCase().replace(/\s+/g, '-')}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle data-testid={`text-area-name-${areaName.toLowerCase().replace(/\s+/g, '-')}`}>
                  {areaName}
                </CardTitle>
                <span 
                  className={`text-sm font-medium px-3 py-1 rounded-full ${getAreaBadgeColor(areaItems.length)}`}
                  data-testid={`badge-area-count-${areaName.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {areaItems.length} Items
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-12">
                      <Checkbox
                        checked={areaItems.every(item => selectedItems.has(item.id))}
                        onCheckedChange={(checked) => handleSelectAllArea(areaItems, checked as boolean)}
                        data-testid={`checkbox-select-all-${areaName.toLowerCase().replace(/\s+/g, '-')}`}
                      />
                    </TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Current</TableHead>
                    <TableHead>Minimum</TableHead>
                    <TableHead>Suggested Order</TableHead>
                    <TableHead>Supplier</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {areaItems.map((item) => (
                    <TableRow key={item.id} data-testid={`row-order-item-${item.id}`}>
                      <TableCell>
                        <Checkbox
                          checked={selectedItems.has(item.id)}
                          onCheckedChange={(checked) => handleItemSelect(item.id, checked as boolean)}
                          data-testid={`checkbox-item-${item.id}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div 
                            className={`w-2 h-2 rounded-full mr-3 ${getStockIndicatorColor(item)}`}
                            data-testid={`indicator-stock-${item.id}`}
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900" data-testid={`text-order-item-name-${item.id}`}>
                              {item.name}
                            </div>
                            <div className="text-sm text-gray-500" data-testid={`text-order-item-details-${item.id}`}>
                              {item.category.name} • {item.sku || "No SKU"}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span 
                          className={`text-sm font-medium ${item.isLowStock ? "text-red-600" : "text-yellow-600"}`}
                          data-testid={`text-order-current-${item.id}`}
                        >
                          {item.currentQuantity} {item.unit}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-900" data-testid={`text-order-minimum-${item.id}`}>
                          {item.minimumLevel} {item.unit}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={orderQuantities[item.id] || getSuggestedQuantity(item)}
                            onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                            className="w-20 text-sm"
                            data-testid={`input-order-quantity-${item.id}`}
                          />
                          <span className="ml-2 text-sm text-gray-500" data-testid={`text-order-unit-${item.id}`}>
                            {item.unit}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-900" data-testid={`text-order-supplier-${item.id}`}>
                          {item.supplier || "No supplier"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>

      {lowStockItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500" data-testid="text-no-low-stock">
            No items currently need reordering
          </p>
        </div>
      )}
    </div>
  );
}