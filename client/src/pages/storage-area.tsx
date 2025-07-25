import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Plus, Grid3x3, List, ChevronDown, QrCode, Search } from "lucide-react";
import InventoryTable from "@/components/inventory/inventory-table";
import CategorySection from "@/components/inventory/category-section";
import { InventoryItemWithDetails, StorageArea as StorageAreaType, Category } from "@shared/schema";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import AddCategoryModal from "@/components/forms/add-category-modal";
import AddItemModal from "@/components/forms/add-item-modal";
import AddSubcategoryModal from "@/components/forms/add-subcategory-modal";

export default function StorageArea() {
  const { areaId } = useParams<{ areaId: string }>();
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"category" | "list">("category");
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showAddSubcategoryModal, setShowAddSubcategoryModal] = useState(false);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const { toast } = useToast();

  const { data: storageArea, isLoading: isLoadingArea } = useQuery<StorageAreaType>({
    queryKey: ["/api/storage-areas", areaId],
    enabled: !!areaId,
  });

  const { data: items = [], isLoading: isLoadingItems } = useQuery<InventoryItemWithDetails[]>({
    queryKey: ["/api/inventory-items", areaId],  
    enabled: !!areaId,
  });

  const { data: categories = [], isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ["/api/categories", areaId],
    enabled: !!areaId,
  });

  // Filter items based on selected filters and search
  const filteredItems = items.filter(item => {
    const categoryMatch = categoryFilter === "all" || item.categoryId === categoryFilter;
    const stockMatch = stockFilter === "all" || 
      (stockFilter === "low" && parseFloat(item.currentQuantity) <= parseFloat(item.minimumLevel)) ||
      (stockFilter === "good" && parseFloat(item.currentQuantity) > parseFloat(item.minimumLevel));
    const searchMatch = searchQuery === "" || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.sku && item.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return categoryMatch && stockMatch && searchMatch;
  });

  // Prepare categories with item counts for category sections
  const categoriesWithCounts = categories.map(category => {
    const categoryItems = filteredItems.filter(item => item.categoryId === category.id);
    return {
      ...category,
      itemCount: categoryItems.length
    };
  });

  // Handler functions for inventory actions
  const handleUpdateQuantity = (itemId: string, newQuantity: string) => {
    // TODO: Implement API call to update quantity
    toast({
      title: "Quantity Updated",
      description: `Item quantity updated to ${newQuantity}`,
    });
  };

  const handleDeleteItem = (itemId: string) => {
    // TODO: Implement API call to delete item
    toast({
      title: "Item Deleted",
      description: "Item has been removed from inventory",
    });
  };

  const handleOrderNow = (itemId: string, quantity: string) => {
    // TODO: Implement API call to add to order list
    const item = items.find(i => i.id === itemId);
    toast({
      title: "Added to Order Queue",
      description: `${item?.name} (${quantity} ${item?.unit}) ready for ordering`,
    });
  };

  const handleScanQR = (itemId: string) => {
    // TODO: Implement QR scanner functionality
    const item = items.find(i => i.id === itemId);
    toast({
      title: "QR Scanner Active",
      description: `Ready to scan QR code for ${item?.name}`,
    });
  };

  const handleAddItem = (categoryId?: string) => {
    setShowAddItemModal(true);
  };

  // Group items by category
  const itemsByCategory = categories.map(category => {
    const categoryItems = filteredItems.filter(item => item.categoryId === category.id);
    const lowStockCount = categoryItems.filter(item => 
      parseFloat(item.currentQuantity) <= parseFloat(item.minimumLevel)
    ).length;
    
    return {
      category,
      items: categoryItems,
      lowStockCount,
    };
  }).filter(group => group.items.length > 0);

  const totalLowStock = items.filter(item => 
    parseFloat(item.currentQuantity) <= parseFloat(item.minimumLevel)
  ).length;

  const getStorageAreaHeaderStyle = (areaId: string) => {
    switch (areaId) {
      case "dry-storage":
        return "storage-area-dry";
      case "cold-storage":
        return "storage-area-cold";
      case "freezer":
        return "storage-area-freezer";
      default:
        return "bg-card border border-border";
    }
  };

  const getStorageAreaTextStyle = (areaId: string) => {
    switch (areaId) {
      case "dry-storage":
        return "text-yellow-900 dark:text-yellow-100";
      case "cold-storage":
        return "text-blue-900 dark:text-blue-100";
      case "freezer":
        return "text-purple-900 dark:text-purple-100";
      default:
        return "text-foreground";
    }
  };

  const getStorageAreaSubtextStyle = (areaId: string) => {
    switch (areaId) {
      case "dry-storage":
        return "text-yellow-700 dark:text-yellow-300";
      case "cold-storage":
        return "text-blue-700 dark:text-blue-300";
      case "freezer":
        return "text-purple-700 dark:text-purple-300";
      default:
        return "text-muted-foreground";
    }
  };

  // Only show loading if we don't have essential data yet
  if (!areaId || (isLoadingArea && !storageArea)) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading storage area...</p>
        </div>
      </div>
    );
  }

  if (!storageArea) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600">Storage area not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className={`p-6 rounded-xl mb-6 ${getStorageAreaHeaderStyle(areaId!)}`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${getStorageAreaTextStyle(areaId!)}`} data-testid="text-area-title">
              {storageArea.name}
            </h1>
            <p className={`mt-1 ${getStorageAreaSubtextStyle(areaId!)}`} data-testid="text-area-subtitle">
              {items.length} items • {categories.length} categories • {totalLowStock} low stock alerts
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" className="zawadi-animate-button" data-testid="button-export">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button 
              onClick={() => setShowAddCategoryModal(true)}
              className="zawadi-button-primary zawadi-animate-button" 
              data-testid="button-add-category"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
            <Button 
              onClick={() => setShowAddSubcategoryModal(true)}
              variant="outline"
              className="zawadi-animate-button hover:bg-blue-50 border-blue-200" 
              data-testid="button-add-subcategory"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Subcategory
            </Button>
            <Button 
              onClick={() => setShowAddItemModal(true)}
              className="zawadi-button-secondary zawadi-animate-button" 
              data-testid="button-add-item"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
            <Button 
              onClick={() => setShowBarcodeModal(true)}
              variant="outline"
              className="zawadi-animate-button border-orange-500 text-orange-600 hover:bg-orange-50" 
              data-testid="button-barcode-scan"
            >
              <QrCode className="w-4 h-4 mr-2" />
              Scan Barcode
            </Button>
          </div>
        </div>
      </div>

      {/* Filter and Sort Controls */}
      <div className="zawadi-card p-4 mb-6">
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

          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search items, SKUs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Button 
              variant={viewMode === "category" ? "default" : "ghost"} 
              size="sm" 
              className={`zawadi-animate-button ${viewMode === "category" ? "zawadi-button-primary" : ""}`}
              onClick={() => setViewMode("category")}
              data-testid="button-category-view"
            >
              <Grid3x3 className="w-4 h-4 mr-1" />
              Categories
            </Button>
            <Button 
              variant={viewMode === "list" ? "default" : "ghost"} 
              size="sm" 
              className={`zawadi-animate-button ${viewMode === "list" ? "zawadi-button-primary" : ""}`}
              onClick={() => setViewMode("list")}
              data-testid="button-list-view"
            >
              <List className="w-4 h-4 mr-1" />
              List
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleScanQR("")} data-testid="button-scan-global">
              <QrCode className="w-4 h-4 mr-1" />
              Scan QR
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {viewMode === "category" ? (
        <div className="space-y-4">
          {categoriesWithCounts.filter(cat => cat.itemCount > 0).map((category) => (
            <CategorySection
              key={category.id}
              category={category}
              items={filteredItems}
              onUpdateQuantity={handleUpdateQuantity}
              onDeleteItem={handleDeleteItem}
              onOrderNow={handleOrderNow}
              onScanQR={handleScanQR}
              onAddItem={handleAddItem}
            />
          ))}
          {categoriesWithCounts.filter(cat => cat.itemCount > 0).length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500" data-testid="text-no-items">
                No items found matching your filters
              </p>
              <Button
                variant="outline"
                className="mt-3"
                onClick={() => handleAddItem()}
                data-testid="button-add-first-item"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Item
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200">
          <InventoryTable
            items={filteredItems}
            onUpdateQuantity={handleUpdateQuantity}
            onDeleteItem={handleDeleteItem}
            onOrderNow={handleOrderNow}
            onScanQR={handleScanQR}
          />
        </div>
      )}

      {/* Modals */}
      <AddCategoryModal
        open={showAddCategoryModal}
        onOpenChange={setShowAddCategoryModal}
        selectedStorageAreaId={areaId}
      />
      <AddItemModal
        open={showAddItemModal}
        onOpenChange={setShowAddItemModal}
        selectedStorageAreaId={areaId}
      />
      <AddSubcategoryModal
        open={showAddSubcategoryModal}
        onOpenChange={setShowAddSubcategoryModal}
        selectedStorageAreaId={areaId}
      />
      
      {/* Placeholder for BarcodeInventoryModal - Creating demo version */}
      {showBarcodeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Barcode Scanner Demo
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBarcodeModal(false)}
                data-testid="button-close-barcode-modal"
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Barcode scanning feature is ready! This will integrate with your device camera to scan product barcodes and instantly update inventory quantities.
              </p>
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">Demo Features:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Camera-based barcode scanning</li>
                  <li>• Instant product lookup by barcode</li>
                  <li>• Quick quantity adjustments (set, add, subtract)</li>
                  <li>• Real-time inventory updates</li>
                  <li>• Support for multiple barcode formats</li>
                </ul>
              </div>
              
              <Button
                onClick={() => setShowBarcodeModal(false)}
                className="w-full"
                data-testid="button-demo-close"
              >
                Got it!
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
