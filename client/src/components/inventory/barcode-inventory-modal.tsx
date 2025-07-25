import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BarcodeScanner } from "@/components/barcode/barcode-scanner";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Scan, Package, AlertTriangle } from "lucide-react";
import type { InventoryItem } from "@shared/schema";

// Define the detailed inventory item type for this component
interface InventoryItemWithDetails extends InventoryItem {
  categoryName: string;
  storageAreaName: string;
  quantity: number;
}

const updateQuantitySchema = z.object({
  quantity: z.number().min(0, "Quantity must be 0 or greater"),
  operation: z.enum(["set", "add", "subtract"]),
});

type UpdateQuantityForm = z.infer<typeof updateQuantitySchema>;

interface BarcodeInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  storageAreaId?: string;
}

export function BarcodeInventoryModal({ isOpen, onClose, storageAreaId }: BarcodeInventoryModalProps) {
  const [scannedBarcode, setScannedBarcode] = useState<string>("");
  const [showScanner, setShowScanner] = useState(false);
  const [foundItem, setFoundItem] = useState<InventoryItemWithDetails | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<UpdateQuantityForm>({
    resolver: zodResolver(updateQuantitySchema),
    defaultValues: {
      quantity: 0,
      operation: "set",
    },
  });

  // Search for item by barcode
  const { data: searchResults, isLoading: isSearching } = useQuery<InventoryItemWithDetails[]>({
    queryKey: ["/api/inventory-items/search", scannedBarcode],
    enabled: !!scannedBarcode,
    select: (data) => data.filter((item) => item.barcode === scannedBarcode),
  });

  const updateInventoryMutation = useMutation({
    mutationFn: async (data: { itemId: string } & UpdateQuantityForm) => {
      const response = await apiRequest("PATCH", `/api/inventory-items/${data.itemId}`, {
        quantity: data.quantity,
        operation: data.operation,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Inventory Updated",
        description: "Item quantity has been updated successfully.",
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/inventory-items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      
      // Reset form and close
      form.reset();
      setScannedBarcode("");
      setFoundItem(null);
      onClose();
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update inventory. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleBarcodeScanned = (barcode: string) => {
    setScannedBarcode(barcode);
    setShowScanner(false);
    
    // Auto-search when barcode is scanned
    setTimeout(() => {
      if (searchResults && searchResults.length > 0) {
        setFoundItem(searchResults[0]);
      }
    }, 500);
  };

  const handleSubmit = (data: UpdateQuantityForm) => {
    if (!foundItem) return;
    
    updateInventoryMutation.mutate({
      itemId: foundItem.id,
      ...data,
    });
  };

  const resetSearch = () => {
    setScannedBarcode("");
    setFoundItem(null);
    form.reset();
  };

  const calculateNewQuantity = (currentQuantity: number, operation: string, changeAmount: number) => {
    switch (operation) {
      case "add":
        return currentQuantity + changeAmount;
      case "subtract":
        return Math.max(0, currentQuantity - changeAmount);
      case "set":
      default:
        return changeAmount;
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Scan className="h-5 w-5" />
              Barcode Inventory Update
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Barcode Input Section */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter or scan barcode..."
                  value={scannedBarcode}
                  onChange={(e) => setScannedBarcode(e.target.value)}
                  data-testid="input-barcode"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowScanner(true)}
                  data-testid="button-open-scanner"
                >
                  <Scan className="h-4 w-4" />
                </Button>
              </div>

              {scannedBarcode && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    Barcode: {scannedBarcode}
                  </Badge>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={resetSearch}
                    data-testid="button-reset-search"
                  >
                    Clear
                  </Button>
                </div>
              )}
            </div>

            <Separator />

            {/* Search Results */}
            {isSearching && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-600 mt-2">Searching for item...</p>
              </div>
            )}

            {scannedBarcode && !isSearching && searchResults && searchResults.length === 0 && (
              <div className="text-center py-4 text-yellow-600">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">No item found with this barcode</p>
                <p className="text-xs text-gray-500">Try scanning again or check the barcode</p>
              </div>
            )}

            {foundItem && (
              <div className="space-y-4">
                {/* Found Item Display */}
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Package className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-medium text-green-800" data-testid="text-found-item-name">
                        {foundItem.name}
                      </h3>
                      <p className="text-sm text-green-600">
                        SKU: {foundItem.sku} | Current: {foundItem.quantity} {foundItem.unit}
                      </p>
                      <p className="text-xs text-green-600">
                        {foundItem.categoryName} • {foundItem.storageAreaName}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Update Form */}
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name="operation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Action</FormLabel>
                            <FormControl>
                              <select
                                {...field}
                                className="w-full px-3 py-2 border rounded-md"
                                data-testid="select-operation"
                              >
                                <option value="set">Set to</option>
                                <option value="add">Add</option>
                                <option value="subtract">Remove</option>
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                data-testid="input-quantity"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Preview new quantity */}
                    {form.watch("quantity") !== null && (
                      <div className="p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                        <span className="text-blue-800">
                          New quantity will be: {" "}
                          <strong>
                            {calculateNewQuantity(
                              foundItem.quantity,
                              form.watch("operation"),
                              form.watch("quantity")
                            )} {foundItem.unit}
                          </strong>
                        </span>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="flex-1"
                        data-testid="button-cancel"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={updateInventoryMutation.isPending}
                        className="flex-1"
                        data-testid="button-update-inventory"
                      >
                        {updateInventoryMutation.isPending ? "Updating..." : "Update Inventory"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <BarcodeScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScanSuccess={handleBarcodeScanned}
      />
    </>
  );
}