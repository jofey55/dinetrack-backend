import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Trash2, ShoppingCart, QrCode } from "lucide-react";
import { InventoryItemWithDetails } from "@shared/schema";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface InventoryTableProps {
  items: InventoryItemWithDetails[];
  onUpdateQuantity?: (itemId: string, newQuantity: string) => void;
  onDeleteItem?: (itemId: string) => void;
  onOrderNow?: (itemId: string, quantity: string) => void;
  onScanQR?: (itemId: string) => void;
}

export default function InventoryTable({ items, onUpdateQuantity, onDeleteItem, onOrderNow, onScanQR }: InventoryTableProps) {
  const [editingQuantity, setEditingQuantity] = useState<string | null>(null);
  const [tempQuantity, setTempQuantity] = useState<string>("");
  const [orderQuantities, setOrderQuantities] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleEditQuantity = (itemId: string, currentQuantity: string) => {
    setEditingQuantity(itemId);
    setTempQuantity(currentQuantity);
  };

  const handleSaveQuantity = (itemId: string) => {
    if (onUpdateQuantity) {
      onUpdateQuantity(itemId, tempQuantity);
    }
    setEditingQuantity(null);
    setTempQuantity("");
  };

  const handleCancelEdit = () => {
    setEditingQuantity(null);
    setTempQuantity("");
  };

  const getStockStatus = (item: InventoryItemWithDetails) => {
    const current = parseFloat(item.currentQuantity);
    const minimum = parseFloat(item.minimumLevel);
    
    if (current <= minimum * 0.5) {
      return { status: "critical", color: "text-red-600", bgColor: "bg-red-50", needsOrder: true };
    } else if (current <= minimum) {
      return { status: "low", color: "text-yellow-600", bgColor: "bg-yellow-50", needsOrder: true };
    } else {
      return { status: "good", color: "text-green-600", bgColor: "bg-green-50", needsOrder: false };
    }
  };

  const getSuggestedOrderQuantity = (item: InventoryItemWithDetails) => {
    const current = parseFloat(item.currentQuantity);
    const minimum = parseFloat(item.minimumLevel);
    const suggested = Math.max(minimum * 2 - current, minimum);
    return Math.ceil(suggested).toString();
  };

  const handleOrderQuantityChange = (itemId: string, quantity: string) => {
    setOrderQuantities(prev => ({ ...prev, [itemId]: quantity }));
  };

  const handleOrderNow = (item: InventoryItemWithDetails) => {
    const quantity = orderQuantities[item.id] || getSuggestedOrderQuantity(item);
    if (onOrderNow) {
      onOrderNow(item.id, quantity);
      toast({
        title: "Added to Order List",
        description: `${item.name} (${quantity} ${item.unit}) added to your order queue.`,
      });
    }
  };

  const handleScanQR = (item: InventoryItemWithDetails) => {
    if (onScanQR) {
      onScanQR(item.id);
      toast({
        title: "QR Scanner Ready",
        description: `Scan QR code to update ${item.name} inventory`,
      });
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead>Item Name</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Current Quantity</TableHead>
            <TableHead>Minimum Level</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead>Quick Order</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const stockStatus = getStockStatus(item);
            return (
              <TableRow key={item.id} data-testid={`row-inventory-${item.id}`}>
                <TableCell>
                  <div className="font-medium" data-testid={`text-item-name-${item.id}`}>
                    {item.name}
                  </div>
                  <div className="text-sm text-gray-500" data-testid={`text-category-${item.id}`}>
                    {item.category.name}
                  </div>
                </TableCell>
                <TableCell data-testid={`text-sku-${item.id}`}>
                  {item.sku || "—"}
                </TableCell>
                <TableCell>
                  {editingQuantity === item.id ? (
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        value={tempQuantity}
                        onChange={(e) => setTempQuantity(e.target.value)}
                        className="w-20"
                        data-testid={`input-edit-quantity-${item.id}`}
                      />
                      <Button
                        size="sm"
                        onClick={() => handleSaveQuantity(item.id)}
                        data-testid={`button-save-quantity-${item.id}`}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                        data-testid={`button-cancel-edit-${item.id}`}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div 
                      className="cursor-pointer hover:bg-gray-50 p-1 rounded"
                      onClick={() => handleEditQuantity(item.id, item.currentQuantity)}
                      data-testid={`text-current-quantity-${item.id}`}
                    >
                      {item.currentQuantity}
                    </div>
                  )}
                </TableCell>
                <TableCell data-testid={`text-minimum-level-${item.id}`}>
                  {item.minimumLevel}
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <span 
                      className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color} ${stockStatus.bgColor}`}
                      data-testid={`badge-status-${item.id}`}
                    >
                      {stockStatus.status === "critical" ? "Critical" : 
                       stockStatus.status === "low" ? "Low Stock" : "Good"}
                    </span>
                    {stockStatus.needsOrder && (
                      <div className="ml-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" data-testid={`indicator-needs-order-${item.id}`} />
                    )}
                  </div>
                </TableCell>
                <TableCell data-testid={`text-supplier-${item.id}`}>
                  {item.supplier || "—"}
                </TableCell>
                <TableCell>
                  {stockStatus.needsOrder ? (
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={orderQuantities[item.id] || getSuggestedOrderQuantity(item)}
                        onChange={(e) => handleOrderQuantityChange(item.id, e.target.value)}
                        className="w-16 text-sm"
                        data-testid={`input-order-quantity-${item.id}`}
                      />
                      <span className="text-xs text-gray-500">{item.unit}</span>
                      <Button
                        size="sm"
                        onClick={() => handleOrderNow(item)}
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                        data-testid={`button-order-now-${item.id}`}
                      >
                        <ShoppingCart className="w-3 h-3 mr-1" />
                        ORDER NOW
                      </Button>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">Well Stocked</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleScanQR(item)}
                      title="Scan QR to update quantity"
                      data-testid={`button-scan-qr-${item.id}`}
                    >
                      <QrCode className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditQuantity(item.id, item.currentQuantity)}
                      data-testid={`button-edit-${item.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDeleteItem?.(item.id)}
                      data-testid={`button-delete-${item.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {items.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500" data-testid="text-no-items">
            No items found
          </p>
        </div>
      )}
    </div>
  );
}