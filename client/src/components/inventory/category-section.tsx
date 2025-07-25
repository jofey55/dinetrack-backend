import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import InventoryTable from "@/components/inventory/inventory-table";
import { InventoryItemWithDetails, Category } from "@shared/schema";

interface CategorySectionProps {
  category: Category & { itemCount: number };
  items: InventoryItemWithDetails[];
  onUpdateQuantity?: (itemId: string, newQuantity: string) => void;
  onDeleteItem?: (itemId: string) => void;
  onOrderNow?: (itemId: string, quantity: string) => void;
  onScanQR?: (itemId: string) => void;
  onAddItem?: (categoryId: string) => void;
}

export default function CategorySection({
  category,
  items,
  onUpdateQuantity,
  onDeleteItem,
  onOrderNow,
  onScanQR,
  onAddItem
}: CategorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const categoryItems = items.filter(item => item.categoryId === category.id);
  const lowStockCount = categoryItems.filter(item => 
    parseFloat(item.currentQuantity) <= parseFloat(item.minimumLevel)
  ).length;

  const getBadgeVariant = (count: number) => {
    if (count === 0) return "bg-green-100 text-green-800";
    if (count <= 2) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <Card className="mb-4" data-testid={`card-category-${category.id}`}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader className="pb-3">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 -m-6 p-6 rounded-t-lg">
              <div className="flex items-center space-x-3">
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                )}
                <CardTitle className="text-lg" data-testid={`text-category-name-${category.id}`}>
                  {category.name}
                </CardTitle>
                <Badge variant="secondary" data-testid={`badge-item-count-${category.id}`}>
                  {category.itemCount} items
                </Badge>
                {lowStockCount > 0 && (
                  <Badge className={getBadgeVariant(lowStockCount)} data-testid={`badge-low-stock-${category.id}`}>
                    {lowStockCount} low stock
                  </Badge>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddItem?.(category.id);
                }}
                data-testid={`button-add-item-${category.id}`}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Item
              </Button>
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-0">
            {categoryItems.length > 0 ? (
              <InventoryTable
                items={categoryItems}
                onUpdateQuantity={onUpdateQuantity}
                onDeleteItem={onDeleteItem}
                onOrderNow={onOrderNow}
                onScanQR={onScanQR}
              />
            ) : (
              <div className="text-center py-8 text-gray-500" data-testid={`text-no-items-${category.id}`}>
                <p>No items in this category yet.</p>
                <Button
                  variant="outline"
                  className="mt-3"
                  onClick={() => onAddItem?.(category.id)}
                  data-testid={`button-add-first-item-${category.id}`}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Item
                </Button>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}