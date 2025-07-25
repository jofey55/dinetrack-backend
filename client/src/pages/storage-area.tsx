import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Plus, Grid3x3, List, ChevronDown } from "lucide-react";
import InventoryTable from "@/components/inventory/inventory-table";
import { InventoryItemWithDetails, StorageArea as StorageAreaType, Category } from "@shared/schema";
import { useState } from "react";

export default function StorageArea() {
  const { areaId } = useParams<{ areaId: string }>();
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");

  const { data: storageArea } = useQuery<StorageAreaType>({
    queryKey: ["/api/storage-areas", areaId],
    enabled: !!areaId,
  });

  const { data: items = [] } = useQuery<InventoryItemWithDetails[]>({
    queryKey: ["/api/inventory-items", areaId],
    enabled: !!areaId,
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories", areaId],
    enabled: !!areaId,
  });

  // Filter items based on selected filters
  const filteredItems = items.filter(item => {
    const categoryMatch = categoryFilter === "all" || item.categoryId === categoryFilter;
    const stockMatch = stockFilter === "all" || 
      (stockFilter === "low" && item.isLowStock) ||
      (stockFilter === "good" && !item.isLowStock);
    
    return categoryMatch && stockMatch;
  });

  // Group items by category
  const itemsByCategory = categories.map(category => {
    const categoryItems = filteredItems.filter(item => item.categoryId === category.id);
    const lowStockCount = categoryItems.filter(item => item.isLowStock).length;
    
    return {
      category,
      items: categoryItems,
      lowStockCount,
    };
  }).filter(group => group.items.length > 0);

  const totalLowStock = items.filter(item => item.isLowStock).length;

  if (!storageArea) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" data-testid="text-area-title">
            {storageArea.name}
          </h1>
          <p className="text-gray-600 mt-1" data-testid="text-area-subtitle">
            {items.length} items • {categories.length} categories • {totalLowStock} low stock alerts
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" data-testid="button-export">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button data-testid="button-add-category">
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Filter and Sort Controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]" data-testid="select-category-filter">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={stockFilter} onValueChange={setStockFilter}>
            <SelectTrigger className="w-[180px]" data-testid="select-stock-filter">
              <SelectValue placeholder="All Stock Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stock Levels</SelectItem>
              <SelectItem value="low">Low Stock Only</SelectItem>
              <SelectItem value="good">Well Stocked</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-2 ml-auto">
            <Button variant="ghost" size="icon" title="Grid View" data-testid="button-grid-view">
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-blue-600" title="List View" data-testid="button-list-view">
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Inventory Items by Category */}
      <div className="space-y-8">
        {itemsByCategory.length > 0 ? (
          itemsByCategory.map(({ category, items, lowStockCount }) => (
            <InventoryTable
              key={category.id}
              items={items}
              categoryName={category.name}
              lowStockCount={lowStockCount}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500" data-testid="text-no-items">
              No items found matching the selected filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
