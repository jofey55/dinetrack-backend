import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu, Search, Plus, Bell } from "lucide-react";
import { useState } from "react";
import AddItemModal from "@/components/inventory/add-item-modal";
import { ZawadiLogo } from "@/components/ui/zawadi-logo";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      <header className="bg-white dark:bg-card shadow-sm border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={onMenuClick}
              data-testid="button-menu"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="hidden lg:flex items-center space-x-3">
              <ZawadiLogo className="h-8 w-8" />
              <div>
                <h1 className="text-lg font-semibold text-foreground">Zawadi Inventory Tracker</h1>
                <p className="text-sm text-muted-foreground">Professional Restaurant Management</p>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search inventory items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64 lg:w-80"
                data-testid="input-search"
              />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-primary hover:bg-primary/90"
              data-testid="button-add-item"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
            <Button variant="ghost" size="icon" data-testid="button-notifications">
              <Bell className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <AddItemModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </>
  );
}