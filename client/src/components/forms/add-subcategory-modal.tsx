import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { StorageArea, CategoryWithSubcategories } from "@shared/schema";
import { Plus, FolderTree } from "lucide-react";

interface AddSubcategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedStorageAreaId?: string;
  selectedParentCategoryId?: string;
}

export default function AddSubcategoryModal({ 
  open, 
  onOpenChange, 
  selectedStorageAreaId, 
  selectedParentCategoryId 
}: AddSubcategoryModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#3b85db");
  const [storageAreaId, setStorageAreaId] = useState(selectedStorageAreaId || "");
  const [parentCategoryId, setParentCategoryId] = useState(selectedParentCategoryId || "");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: storageAreas = [] } = useQuery<StorageArea[]>({
    queryKey: ["/api/storage-areas"],
  });

  const { data: categories = [] } = useQuery<CategoryWithSubcategories[]>({
    queryKey: ["/api/categories-with-subcategories", storageAreaId],
    enabled: !!storageAreaId,
  });

  const createSubcategoryMutation = useMutation({
    mutationFn: async (subcategoryData: any) => {
      return apiRequest(`/api/categories`, "POST", subcategoryData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Subcategory created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories-with-subcategories"] });
      resetForm();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create subcategory",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setName("");
    setDescription("");
    setColor("#3b85db");
    setStorageAreaId(selectedStorageAreaId || "");
    setParentCategoryId(selectedParentCategoryId || "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !storageAreaId || !parentCategoryId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createSubcategoryMutation.mutate({
      name: name.trim(),
      description: description.trim() || null,
      color: color,
      storageAreaId,
      parentCategoryId,
    });
  };

  // Get only parent categories (no subcategories)
  const parentCategories = categories.filter(cat => !cat.parentCategoryId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderTree className="h-5 w-5" />
            Add Subcategory
          </DialogTitle>
          <DialogDescription>
            Create a subcategory under an existing main category.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Label htmlFor="parent-category">Parent Category *</Label>
            <Select value={parentCategoryId} onValueChange={setParentCategoryId} disabled={!storageAreaId}>
              <SelectTrigger data-testid="select-parent-category">
                <SelectValue placeholder="Select parent category" />
              </SelectTrigger>
              <SelectContent>
                {parentCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subcategory-name">Subcategory Name *</Label>
            <Input
              id="subcategory-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter subcategory name"
              data-testid="input-subcategory-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description (optional)"
              rows={3}
              data-testid="textarea-description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <div className="flex items-center space-x-3">
              <Input
                id="color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-16 h-10 p-1 rounded"
                data-testid="input-color"
              />
              <Input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#3b85db"
                className="flex-1"
                data-testid="input-color-text"
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
              disabled={createSubcategoryMutation.isPending}
              className="zawadi-button-primary"
              data-testid="button-create-subcategory"
            >
              {createSubcategoryMutation.isPending ? (
                <>Creating...</>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Subcategory
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}