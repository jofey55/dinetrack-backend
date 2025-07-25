import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertStorageAreaSchema,
  insertCategorySchema,
  insertInventoryItemSchema,
  updateInventoryItemSchema,
  insertOrderItemSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Storage areas
  app.get("/api/storage-areas", async (req, res) => {
    try {
      const storageAreas = await storage.getAllStorageAreas();
      res.json(storageAreas);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch storage areas" });
    }
  });

  app.get("/api/storage-areas/with-stats", async (req, res) => {
    try {
      const areasWithStats = await storage.getStorageAreasWithStats();
      res.json(areasWithStats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch storage areas with stats" });
    }
  });

  app.get("/api/storage-areas/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const storageArea = await storage.getStorageAreaById(id);
      if (storageArea) {
        res.json(storageArea);
      } else {
        res.status(404).json({ message: "Storage area not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch storage area" });
    }
  });

  app.post("/api/storage-areas", async (req, res) => {
    try {
      const validatedData = insertStorageAreaSchema.parse(req.body);
      const storageArea = await storage.createStorageArea(validatedData);
      res.status(201).json(storageArea);
    } catch (error) {
      res.status(400).json({ message: "Invalid storage area data" });
    }
  });

  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const { storageAreaId } = req.query;
      const categories = storageAreaId 
        ? await storage.getCategoriesByStorageArea(storageAreaId as string)
        : await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get("/api/categories-with-subcategories/:storageAreaId?", async (req, res) => {
    try {
      const { storageAreaId } = req.params;
      const categories = await storage.getCategoriesWithSubcategories(storageAreaId === 'all' ? undefined : storageAreaId);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories with subcategories" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const validatedData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ message: "Invalid category data" });
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteCategory(id);
      if (success) {
        res.status(204).send();
      } else {
        res.status(404).json({ message: "Category not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Inventory items
  app.get("/api/inventory-items", async (req, res) => {
    try {
      const { storageAreaId, categoryId, search } = req.query;
      
      let items;
      if (search) {
        items = await storage.searchInventoryItems(search as string);
      } else if (storageAreaId) {
        items = await storage.getInventoryItemsByStorageArea(storageAreaId as string);
      } else if (categoryId) {
        items = await storage.getInventoryItemsByCategory(categoryId as string);
      } else {
        const allItems = await storage.getAllInventoryItems();
        items = await Promise.all(allItems.map(async (item) => {
          const category = (await storage.getAllCategories()).find(c => c.id === item.categoryId)!;
          const storageArea = (await storage.getAllStorageAreas()).find(sa => sa.id === item.storageAreaId)!;
          const isLowStock = parseFloat(item.currentQuantity) <= parseFloat(item.minimumLevel);
          return {
            ...item,
            category,
            storageArea,
            isLowStock
          };
        }));
      }
      
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory items" });
    }
  });

  app.get("/api/inventory-items/low-stock", async (req, res) => {
    try {
      const lowStockItems = await storage.getLowStockItems();
      res.json(lowStockItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch low stock items" });
    }
  });

  app.get("/api/inventory-items/search", async (req, res) => {
    try {
      const { barcode, sku, name } = req.query;
      const items = await storage.searchInventoryItems({
        barcode: barcode as string,
        sku: sku as string, 
        name: name as string,
      });
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to search inventory items" });
    }
  });

  app.get("/api/inventory-items/:storageAreaId", async (req, res) => {
    try {
      const { storageAreaId } = req.params;
      const items = await storage.getInventoryItemsByStorageArea(storageAreaId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory items" });
    }
  });

  app.post("/api/inventory-items", async (req, res) => {
    try {
      const validatedData = insertInventoryItemSchema.parse(req.body);
      const item = await storage.createInventoryItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ message: "Invalid inventory item data" });
    }
  });

  app.patch("/api/inventory-items/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = updateInventoryItemSchema.parse(req.body);
      const item = await storage.updateInventoryItem(id, validatedData);
      if (item) {
        res.json(item);
      } else {
        res.status(404).json({ message: "Inventory item not found" });
      }
    } catch (error) {
      res.status(400).json({ message: "Invalid inventory item data" });
    }
  });

  app.delete("/api/inventory-items/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteInventoryItem(id);
      if (success) {
        res.status(204).send();
      } else {
        res.status(404).json({ message: "Inventory item not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete inventory item" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Order items
  app.get("/api/order-items", async (req, res) => {
    try {
      const orderItems = await storage.getOrderItems();
      res.json(orderItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order items" });
    }
  });

  app.post("/api/order-items", async (req, res) => {
    try {
      const validatedData = insertOrderItemSchema.parse(req.body);
      const orderItem = await storage.createOrderItem(validatedData);
      res.status(201).json(orderItem);
    } catch (error) {
      res.status(400).json({ message: "Invalid order item data" });
    }
  });

  app.patch("/api/order-items/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const orderItem = await storage.updateOrderItem(id, req.body);
      if (orderItem) {
        res.json(orderItem);
      } else {
        res.status(404).json({ message: "Order item not found" });
      }
    } catch (error) {
      res.status(400).json({ message: "Invalid order item data" });
    }
  });

  app.delete("/api/order-items/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteOrderItem(id);
      if (success) {
        res.status(204).send();
      } else {
        res.status(404).json({ message: "Order item not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete order item" });
    }
  });

  app.delete("/api/order-items", async (req, res) => {
    try {
      await storage.clearOrderItems();
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to clear order items" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
