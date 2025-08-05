import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { StorageArea, CategoryWithSubcategories } from "@shared/schema";
import { Plus, Package } from "lucide-react";

interface AddItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedStorageAreaId?: string;
  selectedCategoryId?: string;
}

export default function AddItemModal({ 
  open, 
  onOpenChange, 
  selectedStorageAreaId, 
  selectedCategoryId 
}: AddItemModalProps) {
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [currentQuantity, setCurrentQuantity] = useState("");
  const [minimumLevel, setMinimumLevel] = useState("");
  const [unit, setUnit] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [supplier, setSupplier] = useState("");
  const [storageAreaId, setStorageAreaId] = useState(selectedStorageAreaId || "");
  const [categoryId, setCategoryId] = useState(selectedCategoryId || "");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: storageAreas = [] } = useQuery<StorageArea[]>({
    queryKey: ["/api/storage-areas"],
  });

  const { data: categories = [] } = useQuery<CategoryWithSubcategories[]>({
    queryKey: ["/api/categories-with-subcategories", storageAreaId],
    enabled: !!storageAreaId,
  });

  const createItemMutation = useMutation({
    mutationFn: async (itemData: any) => {
      return apiRequest(`/api/inventory-items`, "POST", itemData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Item created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory-items"] });
      resetForm();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create item",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setName("");
    setSku("");
    setCurrentQuantity("");
    setMinimumLevel("");
    setUnit("");
    setPricePerUnit("");
    setSupplier("");
    setStorageAreaId(selectedStorageAreaId || "");
    setCategoryId(selectedCategoryId || "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !storageAreaId || !categoryId || !currentQuantity || !minimumLevel || !unit) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createItemMutation.mutate({
      name: name.trim(),
      sku: sku.trim() || null,
      storageAreaId,
      categoryId,
      currentQuantity: currentQuantity.toString(),
      minimumLevel: minimumLevel.toString(),
      unit: unit.trim(),
      pricePerUnit: pricePerUnit ? parseFloat(pricePerUnit).toString() : null,
      supplier: supplier.trim() || null,
    });
  };

  // Get all categories (parent + subcategories) for selection
  const allCategories = categories.reduce((acc, category) => {
    // Add parent category
    acc.push(category);
    // Add subcategories
    if (category.subcategories) {
      category.subcategories.forEach(sub => acc.push(sub));
    }
    return acc;
  }, [] as CategoryWithSubcategories[]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Add Inventory Item
          </DialogTitle>
          <DialogDescription>
            Add a new item to your inventory management system.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Item Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter item name"
                data-testid="input-item-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="Enter SKU (optional)"
                data-testid="input-item-sku"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="storage-area">Storage Area *</Label>
            <Select value={storageAreaId} onValueChange={setStorageAreaId}>
              <SelectTrigger data-testid="select-storage-area">
                <SelectValue placeholder="Select storage area" />
              </SelectTrigger>
              <SelectContent>
                {storageAreas.map((area) => (
                  <SelectItem key={area.id} value={area.id}>
                    {area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={categoryId} onValueChange={setCategoryId} disabled={!storageAreaId}>
              <SelectTrigger data-testid="select-category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {allCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.parentCategoryId ? `  ↳ ${category.name}` : category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current-quantity">Current Quantity *</Label>
              <Input
                id="current-quantity"
                type="number"
                step="0.01"
                value={currentQuantity}
                onChange={(e) => setCurrentQuantity(e.target.value)}
                placeholder="0"
                data-testid="input-current-quantity"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minimum-level">Minimum Level *</Label>
              <Input
                id="minimum-level"
                type="number"
                step="0.01"
                value={minimumLevel}
                onChange={(e) => setMinimumLevel(e.target.value)}
                placeholder="0"
                data-testid="input-minimum-level"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit *</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger data-testid="select-unit">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lbs">lbs (pounds)</SelectItem>
                  <SelectItem value="kg">kg (kilograms)</SelectItem>
                  <SelectItem value="pcs">pcs (pieces)</SelectItem>
                  <SelectItem value="bags">bags</SelectItem>
                  <SelectItem value="gallons">gallons</SelectItem>
                  <SelectItem value="liters">liters</SelectItem>
                  <SelectItem value="cans">cans</SelectItem>
                  <SelectItem value="boxes">boxes</SelectItem>
                  <SelectItem value="packs">packs</SelectItem>
                  <SelectItem value="bottles">bottles</SelectItem>
                  <SelectItem value="dozen">dozen</SelectItem>
                  <SelectItem value="cases">cases</SelectItem>
                  <SelectItem value="oz">oz (ounces)</SelectItem>
                  <SelectItem value="grams">grams</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price per Unit (optional)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={pricePerUnit}
                onChange={(e) => setPricePerUnit(e.target.value)}
                placeholder="0.00"
                data-testid="input-price-per-unit"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="Enter supplier name (optional)"
                data-testid="input-supplier"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createItemMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition-colors"
              data-testid="button-create-item"
            >
              {createItemMutation.isPending ? (
                <>Creating...</>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Item
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}