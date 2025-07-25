import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { StorageAreaWithStats, InventoryItemWithDetails } from "@shared/schema";
import { X, BarChart3, Box, Snowflake, Thermometer, ShoppingCart, FileText } from "lucide-react";
import { ZawadiLogo } from "@/components/ui/zawadi-logo";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();

  const { data: storageAreas = [] } = useQuery<StorageAreaWithStats[]>({
    queryKey: ["/api/storage-areas/with-stats"],
  });

  const { data: lowStockItems = [] } = useQuery<InventoryItemWithDetails[]>({
    queryKey: ["/api/inventory-items/low-stock"],
  });

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "box": return <Box className="w-5 h-5" />;
      case "snowflake": return <Snowflake className="w-5 h-5" />;
      case "temperature-low": return <Thermometer className="w-5 h-5" />;
      default: return <Box className="w-5 h-5" />;
    }
  };

  const getBadgeColor = (count: number) => {
    if (count === 0) return "bg-success text-success-foreground";
    if (count <= 3) return "bg-warning text-warning-foreground";
    return "bg-destructive text-destructive-foreground";
  };

  const getStorageAreaStyle = (areaId: string) => {
    switch (areaId) {
      case "dry-storage":
        return "text-yellow-700 dark:text-yellow-300";
      case "cold-storage":
        return "text-blue-700 dark:text-blue-300";
      case "freezer":
        return "text-purple-700 dark:text-purple-300";
      default:
        return "";
    }
  };

  const sidebarLinks = [
    {
      href: "/",
      label: "Overview",
      icon: <BarChart3 className="w-5 h-5" />,
      badge: null,
    },
    ...storageAreas.map((area) => ({
      href: `/storage/${area.id}`,
      label: area.name,
      icon: getIcon(area.icon),
      badge: area.lowStockCount,
    })),
    {
      href: "/order-now",
      label: "Order Now",
      icon: <ShoppingCart className="w-5 h-5" />,
      badge: lowStockItems.length,
    },
    {
      href: "/reports",
      label: "Reports", 
      icon: <FileText className="w-5 h-5" />,
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card dark:bg-card shadow-lg transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center space-x-3">
              <ZawadiLogo className="h-8 w-8" />
              <div>
                <h1 className="text-xl font-bold text-card-foreground">Zawadi Tracker</h1>
                <p className="text-sm text-muted-foreground">Inventory Management</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={onClose}
              data-testid="button-close-sidebar"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {sidebarLinks.map((link) => {
              const isActive = location === link.href || 
                (link.href.startsWith("/storage/") && location.startsWith("/storage/"));
              
              const isStorageArea = link.href.startsWith("/storage/");
              const areaId = isStorageArea ? link.href.split("/")[2] : "";
              
              return (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start relative",
                      isActive && "bg-accent text-accent-foreground",
                      isStorageArea && getStorageAreaStyle(areaId)
                    )}
                    onClick={() => onClose()}
                    data-testid={`link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <div className="flex items-center">
                      {link.icon}
                      <span className="ml-3">{link.label}</span>
                    </div>
                    {link.badge !== null && link.badge > 0 && (
                      <Badge
                        className={cn("ml-auto text-xs", getBadgeColor(link.badge))}
                        data-testid={`badge-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {link.badge}
                      </Badge>
                    )}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}