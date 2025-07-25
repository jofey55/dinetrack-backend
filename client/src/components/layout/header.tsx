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
      <header className="sticky top-0 z-50 modern-header-glass px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-white hover:bg-white/20 rounded-lg transition-all duration-200"
              onClick={onMenuClick}
              data-testid="button-menu"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center space-x-4">
              <div className="p-2 header-logo-container rounded-xl">
                <ZawadiLogo className="h-8 w-8 text-white drop-shadow-sm" />
              </div>
              <div className="hidden lg:block">
                <h1 className="text-xl font-bold text-white tracking-tight">Zawadi Inventory Tracker</h1>
                <p className="text-sm text-blue-100 font-medium">Professional Restaurant Management</p>
              </div>
            </div>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search inventory items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64 lg:w-80 bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-lg placeholder:text-slate-500 text-slate-700 font-medium focus:bg-white transition-all duration-200"
                data-testid="input-search"
              />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-yellow-500 hover:bg-yellow-400 text-slate-800 font-semibold px-4 py-2 rounded-lg shadow-lg hover:scale-105 transition-all duration-200"
              data-testid="button-add-item"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-all duration-200" 
              data-testid="button-notifications"
            >
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