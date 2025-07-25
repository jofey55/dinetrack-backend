import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { StorageArea, Category, CategoryWithSubcategories } from "@shared/schema";
import { Plus, Folder, FolderOpen } from "lucide-react";

interface AddCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedStorageAreaId?: string;
  parentCategoryId?: string;
}

const colorOptions = [
  { value: "#3b82f6", label: "Blue", class: "bg-blue-500" },
  { value: "#ef4444", label: "Red", class: "bg-red-500" },
  { value: "#22c55e", label: "Green", class: "bg-green-500" },
  { value: "#f59e0b", label: "Yellow", class: "bg-yellow-500" },
  { value: "#8b5cf6", label: "Purple", class: "bg-purple-500" },
  { value: "#06b6d4", label: "Cyan", class: "bg-cyan-500" },
  { value: "#f97316", label: "Orange", class: "bg-orange-500" },
  { value: "#84cc16", label: "Lime", class: "bg-lime-500" },
];

export default function AddCategoryModal({ 
  open, 
  onOpenChange, 
  selectedStorageAreaId, 
  parentCategoryId 
}: AddCategoryModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [storageAreaId, setStorageAreaId] = useState(selectedStorageAreaId || "");
  const [selectedParentId, setSelectedParentId] = useState(parentCategoryId || "");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: storageAreas = [] } = useQuery<StorageArea[]>({
    queryKey: ["/api/storage-areas"],
  });

  const { data: categories = [] } = useQuery<CategoryWithSubcategories[]>({
    queryKey: ["/api/categories-with-subcategories", storageAreaId],
    enabled: !!storageAreaId,
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (categoryData: any) => {
      return apiRequest(`/api/categories`, "POST", categoryData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `${selectedParentId ? 'Subcategory' : 'Category'} created successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      resetForm();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || `Failed to create ${selectedParentId ? 'subcategory' : 'category'}`,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setName("");
    setDescription("");
    setColor("#3b82f6");
    setStorageAreaId(selectedStorageAreaId || "");
    setSelectedParentId(parentCategoryId || "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !storageAreaId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createCategoryMutation.mutate({
      name: name.trim(),
      description: description.trim() || null,
      color,
      storageAreaId,
      parentCategoryId: selectedParentId || null,
    });
  };

  const parentCategories = categories.filter(cat => !cat.parentCategoryId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {selectedParentId ? <FolderOpen className="h-5 w-5" /> : <Folder className="h-5 w-5" />}
            Add {selectedParentId ? 'Subcategory' : 'Category'}
          </DialogTitle>
          <DialogDescription>
            Create a new {selectedParentId ? 'subcategory' : 'category'} to organize your inventory items.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`Enter ${selectedParentId ? 'subcategory' : 'category'} name`}
              data-testid="input-category-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              data-testid="textarea-category-description"
              rows={3}
            />
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

          {!parentCategoryId && storageAreaId && parentCategories.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="parent-category">Parent Category</Label>
              <Select value={selectedParentId} onValueChange={setSelectedParentId}>
                <SelectTrigger data-testid="select-parent-category">
                  <SelectValue placeholder="Select parent category (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None (Main Category)</SelectItem>
                  {parentCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((colorOption) => (
                <button
                  key={colorOption.value}
                  type="button"
                  onClick={() => setColor(colorOption.value)}
                  className={`w-8 h-8 rounded-full ${colorOption.class} border-2 ${
                    color === colorOption.value ? "border-slate-900 scale-110" : "border-slate-300"
                  } transition-all hover:scale-105`}
                  title={colorOption.label}
                  data-testid={`color-${colorOption.label.toLowerCase()}`}
                />
              ))}
            </div>
            <Badge variant="outline" style={{ backgroundColor: color, color: "white" }}>
              {colorOptions.find(c => c.value === color)?.label || "Custom"}
            </Badge>
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
              disabled={createCategoryMutation.isPending}
              className="zawadi-button-primary"
              data-testid="button-create-category"
            >
              {createCategoryMutation.isPending ? (
                <>Creating...</>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create {selectedParentId ? 'Subcategory' : 'Category'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}