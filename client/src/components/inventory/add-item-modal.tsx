import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddItemModal({ isOpen, onClose }: AddItemModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    categoryId: "",
    storageAreaId: "",
    currentQuantity: "",
    minimumLevel: "",
    unit: "",
    supplier: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement item creation
    console.log("Creating item:", formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent data-testid="modal-add-item">
        <DialogHeader>
          <DialogTitle data-testid="text-modal-title">Add New Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Item Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                data-testid="input-item-name"
              />
            </div>
            <div>
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                data-testid="input-item-sku"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="currentQuantity">Current Quantity</Label>
              <Input
                id="currentQuantity"
                type="number"
                value={formData.currentQuantity}
                onChange={(e) => setFormData(prev => ({ ...prev, currentQuantity: e.target.value }))}
                required
                data-testid="input-current-quantity"
              />
            </div>
            <div>
              <Label htmlFor="minimumLevel">Minimum Level</Label>
              <Input
                id="minimumLevel"
                type="number"
                value={formData.minimumLevel}
                onChange={(e) => setFormData(prev => ({ ...prev, minimumLevel: e.target.value }))}
                required
                data-testid="input-minimum-level"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="unit">Unit</Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}>
                <SelectTrigger data-testid="select-unit">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="lbs">lbs</SelectItem>
                  <SelectItem value="pieces">pieces</SelectItem>
                  <SelectItem value="liters">liters</SelectItem>
                  <SelectItem value="gallons">gallons</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                data-testid="input-supplier"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel">
              Cancel
            </Button>
            <Button type="submit" data-testid="button-save">
              Add Item
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}