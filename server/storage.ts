import { 
  type User, 
  type InsertUser, 
  type StorageArea, 
  type InsertStorageArea,
  type Category,
  type InsertCategory,
  type InventoryItem,
  type InsertInventoryItem,
  type UpdateInventoryItem,
  type OrderItem,
  type InsertOrderItem,
  type InventoryItemWithDetails,
  type StorageAreaWithStats,
  type DashboardStats,
  users,
  storageAreas,
  categories,
  inventoryItems,
  orderItems
} from "@shared/schema";
import { eq, and, sql, like, or } from "drizzle-orm";
import { db } from "./db";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Storage area methods
  getAllStorageAreas(): Promise<StorageArea[]>;
  getStorageAreaById(id: string): Promise<StorageArea | undefined>;
  createStorageArea(storageArea: InsertStorageArea): Promise<StorageArea>;
  getStorageAreasWithStats(): Promise<StorageAreaWithStats[]>;

  // Category methods
  getCategoriesByStorageArea(storageAreaId: string): Promise<Category[]>;
  getAllCategories(): Promise<Category[]>;
  getCategoriesWithSubcategories(storageAreaId?: string): Promise<any[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  deleteCategory(id: string): Promise<boolean>;

  // Inventory item methods
  getAllInventoryItems(): Promise<InventoryItem[]>;
  getInventoryItemsByStorageArea(storageAreaId: string): Promise<InventoryItemWithDetails[]>;
  getInventoryItemsByCategory(categoryId: string): Promise<InventoryItemWithDetails[]>;
  getInventoryItemById(id: string): Promise<InventoryItem | undefined>;
  createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  updateInventoryItem(id: string, updates: UpdateInventoryItem): Promise<InventoryItem | undefined>;
  deleteInventoryItem(id: string): Promise<boolean>;
  getLowStockItems(): Promise<InventoryItemWithDetails[]>;
  searchInventoryItems(filters: { barcode?: string; sku?: string; name?: string }): Promise<InventoryItemWithDetails[]>;

  // Dashboard methods
  getDashboardStats(): Promise<DashboardStats>;

  // Order methods
  getOrderItems(): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  updateOrderItem(id: string, updates: Partial<OrderItem>): Promise<OrderItem | undefined>;
  deleteOrderItem(id: string): Promise<boolean>;
  clearOrderItems(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializeDefaultData();
  }

  private async initializeDefaultData() {
    try {
      // Check if data already exists
      const existingAreas = await db.select().from(storageAreas);
      if (existingAreas.length > 0) return;

      // Initialize default storage areas
      const dryStorage: StorageArea = {
        id: "dry-storage",
        name: "Dry Storage",
        description: "Non-perishable items and paper goods",
        icon: "box"
      };
      
      const coldStorage: StorageArea = {
        id: "cold-storage", 
        name: "Cold Storage",
        description: "Refrigerated items and fresh produce",
        icon: "snowflake"
      };
      
      const freezer: StorageArea = {
        id: "freezer",
        name: "Freezer",
        description: "Frozen items and ice cream",
        icon: "thermometer-snowflake"
      };

      // Insert storage areas
      await db.insert(storageAreas).values([dryStorage, coldStorage, freezer]);

      // Initialize default categories
      const categoryData = [
        { id: "paper-goods", name: "Paper Goods", storageAreaId: "dry-storage" },
        { id: "dry-ingredients", name: "Dry Ingredients", storageAreaId: "dry-storage" },
        { id: "canned-goods", name: "Canned Goods", storageAreaId: "dry-storage" },
        { id: "fresh-produce", name: "Fresh Produce", storageAreaId: "cold-storage" },
        { id: "dairy-products", name: "Dairy Products", storageAreaId: "cold-storage" },
        { id: "sauces-condiments", name: "Sauces & Condiments", storageAreaId: "cold-storage" },
        { id: "frozen-meats", name: "Frozen Meats", storageAreaId: "freezer" },
        { id: "frozen-vegetables", name: "Frozen Vegetables", storageAreaId: "freezer" },
        { id: "ice-cream-desserts", name: "Ice Cream & Desserts", storageAreaId: "freezer" }
      ];

      await db.insert(categories).values(categoryData);

      // Add sample inventory items (will auto-generate UUIDs)
      const inventoryData: InsertInventoryItem[] = [
        // Dry Storage Items - Paper Goods
        { name: "Paper Napkins", sku: "PPR001", categoryId: "paper-goods", storageAreaId: "dry-storage", currentQuantity: "150", minimumLevel: "200", unit: "packs", supplier: "Restaurant Supply Co" },
        { name: "Takeout Containers", sku: "PPR002", categoryId: "paper-goods", storageAreaId: "dry-storage", currentQuantity: "45", minimumLevel: "100", unit: "packs", supplier: "Restaurant Supply Co" },
        // Dry Ingredients
        { name: "All-Purpose Flour", sku: "DRY001", categoryId: "dry-ingredients", storageAreaId: "dry-storage", currentQuantity: "25", minimumLevel: "50", unit: "kg", supplier: "Bulk Foods Inc" },
        { name: "Granulated Sugar", sku: "DRY002", categoryId: "dry-ingredients", storageAreaId: "dry-storage", currentQuantity: "30", minimumLevel: "40", unit: "kg", supplier: "Bulk Foods Inc" },
        // Canned Goods
        { name: "Canned Tomatoes", sku: "CAN001", categoryId: "canned-goods", storageAreaId: "dry-storage", currentQuantity: "24", minimumLevel: "36", unit: "cans", supplier: "Food Distributors Ltd" },
        { name: "Black Beans", sku: "CAN002", categoryId: "canned-goods", storageAreaId: "dry-storage", currentQuantity: "18", minimumLevel: "24", unit: "cans", supplier: "Food Distributors Ltd" },
        
        // Cold Storage Items - Fresh Produce
        { name: "Romaine Lettuce", sku: "PRD001", categoryId: "fresh-produce", storageAreaId: "cold-storage", currentQuantity: "12", minimumLevel: "18", unit: "heads", supplier: "Fresh Farm Co" },
        { name: "Fresh Tomatoes", sku: "PRD002", categoryId: "fresh-produce", storageAreaId: "cold-storage", currentQuantity: "8", minimumLevel: "15", unit: "kg", supplier: "Fresh Farm Co" },
        // Dairy Products
        { name: "Whole Milk", sku: "DAI001", categoryId: "dairy-products", storageAreaId: "cold-storage", currentQuantity: "6", minimumLevel: "12", unit: "liters", supplier: "Dairy Co" },
        { name: "Cheddar Cheese", sku: "DAI002", categoryId: "dairy-products", storageAreaId: "cold-storage", currentQuantity: "3", minimumLevel: "5", unit: "kg", supplier: "Dairy Co" },
        // Sauces & Condiments
        { name: "Ketchup", sku: "SAU001", categoryId: "sauces-condiments", storageAreaId: "cold-storage", currentQuantity: "4", minimumLevel: "8", unit: "bottles", supplier: "Condiment Corp" },
        { name: "Mayonnaise", sku: "SAU002", categoryId: "sauces-condiments", storageAreaId: "cold-storage", currentQuantity: "2", minimumLevel: "6", unit: "jars", supplier: "Condiment Corp" },
        
        // Freezer Items - Frozen Meats
        { name: "Chicken Breast", sku: "FMT001", categoryId: "frozen-meats", storageAreaId: "freezer", currentQuantity: "15", minimumLevel: "25", unit: "kg", supplier: "Meat Packers Inc" },
        { name: "Ground Beef", sku: "FMT002", categoryId: "frozen-meats", storageAreaId: "freezer", currentQuantity: "8", minimumLevel: "20", unit: "kg", supplier: "Meat Packers Inc" },
        // Frozen Vegetables
        { name: "Frozen Green Peas", sku: "FVG001", categoryId: "frozen-vegetables", storageAreaId: "freezer", currentQuantity: "6", minimumLevel: "12", unit: "kg", supplier: "Frozen Foods Ltd" },
        { name: "Frozen Corn", sku: "FVG002", categoryId: "frozen-vegetables", storageAreaId: "freezer", currentQuantity: "4", minimumLevel: "8", unit: "kg", supplier: "Frozen Foods Ltd" }
      ];

      await db.insert(inventoryItems).values(inventoryData);
    } catch (error) {
      console.error("Error initializing database:", error);
    }
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Storage area methods
  async getAllStorageAreas(): Promise<StorageArea[]> {
    return await db.select().from(storageAreas);
  }

  async getStorageAreaById(id: string): Promise<StorageArea | undefined> {
    const [storageArea] = await db.select().from(storageAreas).where(eq(storageAreas.id, id));
    return storageArea || undefined;
  }

  async createStorageArea(insertStorageArea: InsertStorageArea): Promise<StorageArea> {
    const [storageArea] = await db.insert(storageAreas).values(insertStorageArea).returning();
    return storageArea;
  }

  async getStorageAreasWithStats(): Promise<StorageAreaWithStats[]> {
    const areas = await db.select().from(storageAreas);
    const result: StorageAreaWithStats[] = [];

    for (const area of areas) {
      const areaCategories = await db.select().from(categories).where(eq(categories.storageAreaId, area.id));
      const items = await db.select().from(inventoryItems).where(eq(inventoryItems.storageAreaId, area.id));
      
      const categoriesWithCount = areaCategories.map(category => ({
        ...category,
        itemCount: items.filter(item => item.categoryId === category.id).length
      }));

      const lowStockCount = items.filter(item => 
        parseFloat(item.currentQuantity) <= parseFloat(item.minimumLevel)
      ).length;

      result.push({
        ...area,
        totalItems: items.length,
        lowStockCount,
        categories: categoriesWithCount
      });
    }

    return result;
  }

  // Category methods
  async getCategoriesByStorageArea(storageAreaId: string): Promise<Category[]> {
    return await db.select().from(categories).where(eq(categories.storageAreaId, storageAreaId));
  }

  async getAllCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategoriesWithSubcategories(storageAreaId?: string): Promise<any[]> {
    const whereClause = storageAreaId 
      ? eq(categories.storageAreaId, storageAreaId)
      : undefined;

    // Get all categories for the storage area (or all if no filter)
    const allCategories = whereClause
      ? await db.select().from(categories).where(whereClause)
      : await db.select().from(categories);

    // Get only parent categories (parentCategoryId is null)
    const parentCategories = allCategories.filter(cat => cat.parentCategoryId === null);

    // For each parent category, find its subcategories
    const result = parentCategories.map(parent => ({
      ...parent,
      subcategories: allCategories.filter(cat => cat.parentCategoryId === parent.id)
    }));

    return result;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(insertCategory).returning();
    return category;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id)).returning();
    if (result.length > 0) {
      // Also delete all inventory items in this category
      await db.delete(inventoryItems).where(eq(inventoryItems.categoryId, id));
      return true;
    }
    return false;
  }

  // Inventory item methods
  async getAllInventoryItems(): Promise<InventoryItem[]> {
    return await db.select().from(inventoryItems);
  }

  async getInventoryItemsByStorageArea(storageAreaId: string): Promise<InventoryItemWithDetails[]> {
    const items = await db.select({
      id: inventoryItems.id,
      name: inventoryItems.name,
      sku: inventoryItems.sku,
      categoryId: inventoryItems.categoryId,
      storageAreaId: inventoryItems.storageAreaId,
      currentQuantity: inventoryItems.currentQuantity,
      minimumLevel: inventoryItems.minimumLevel,
      unit: inventoryItems.unit,
      supplier: inventoryItems.supplier,
      lastUpdated: inventoryItems.lastUpdated,
      category: {
        id: categories.id,
        name: categories.name,
        description: categories.description,
        color: categories.color,
        storageAreaId: categories.storageAreaId,
        parentCategoryId: categories.parentCategoryId,
        createdAt: categories.createdAt
      },
      storageArea: {
        id: storageAreas.id,
        name: storageAreas.name,
        description: storageAreas.description,
        icon: storageAreas.icon
      }
    })
    .from(inventoryItems)
    .leftJoin(categories, eq(inventoryItems.categoryId, categories.id))
    .leftJoin(storageAreas, eq(inventoryItems.storageAreaId, storageAreas.id))
    .where(eq(inventoryItems.storageAreaId, storageAreaId));
    
    return items.map(item => ({
      ...item,
      isLowStock: parseFloat(item.currentQuantity) <= parseFloat(item.minimumLevel)
    })) as InventoryItemWithDetails[];
  }

  async getInventoryItemsByCategory(categoryId: string): Promise<InventoryItemWithDetails[]> {
    const items = await db.select({
      id: inventoryItems.id,
      name: inventoryItems.name,
      sku: inventoryItems.sku,
      categoryId: inventoryItems.categoryId,
      storageAreaId: inventoryItems.storageAreaId,
      currentQuantity: inventoryItems.currentQuantity,
      minimumLevel: inventoryItems.minimumLevel,
      unit: inventoryItems.unit,
      supplier: inventoryItems.supplier,
      lastUpdated: inventoryItems.lastUpdated,
      category: {
        id: categories.id,
        name: categories.name,
        storageAreaId: categories.storageAreaId
      },
      storageArea: {
        id: storageAreas.id,
        name: storageAreas.name,
        description: storageAreas.description,
        icon: storageAreas.icon
      }
    })
    .from(inventoryItems)
    .leftJoin(categories, eq(inventoryItems.categoryId, categories.id))
    .leftJoin(storageAreas, eq(inventoryItems.storageAreaId, storageAreas.id))
    .where(eq(inventoryItems.categoryId, categoryId));
    
    return items.map(item => ({
      ...item,
      isLowStock: parseFloat(item.currentQuantity) <= parseFloat(item.minimumLevel)
    }));
  }

  async getInventoryItemById(id: string): Promise<InventoryItem | undefined> {
    const [item] = await db.select().from(inventoryItems).where(eq(inventoryItems.id, id));
    return item || undefined;
  }

  async createInventoryItem(insertItem: InsertInventoryItem): Promise<InventoryItem> {
    const [item] = await db.insert(inventoryItems).values(insertItem).returning();
    return item;
  }

  async updateInventoryItem(id: string, updates: UpdateInventoryItem): Promise<InventoryItem | undefined> {
    const [item] = await db.update(inventoryItems)
      .set({ ...updates, lastUpdated: new Date() })
      .where(eq(inventoryItems.id, id))
      .returning();
    return item || undefined;
  }

  async deleteInventoryItem(id: string): Promise<boolean> {
    const result = await db.delete(inventoryItems).where(eq(inventoryItems.id, id)).returning();
    return result.length > 0;
  }

  async getLowStockItems(): Promise<InventoryItemWithDetails[]> {
    const items = await db.select({
      id: inventoryItems.id,
      name: inventoryItems.name,
      sku: inventoryItems.sku,
      categoryId: inventoryItems.categoryId,
      storageAreaId: inventoryItems.storageAreaId,
      currentQuantity: inventoryItems.currentQuantity,
      minimumLevel: inventoryItems.minimumLevel,
      unit: inventoryItems.unit,
      supplier: inventoryItems.supplier,
      lastUpdated: inventoryItems.lastUpdated,
      category: {
        id: categories.id,
        name: categories.name,
        storageAreaId: categories.storageAreaId
      },
      storageArea: {
        id: storageAreas.id,
        name: storageAreas.name,
        description: storageAreas.description,
        icon: storageAreas.icon
      }
    })
    .from(inventoryItems)
    .leftJoin(categories, eq(inventoryItems.categoryId, categories.id))
    .leftJoin(storageAreas, eq(inventoryItems.storageAreaId, storageAreas.id))
    .where(sql`CAST(${inventoryItems.currentQuantity} AS DECIMAL) <= CAST(${inventoryItems.minimumLevel} AS DECIMAL)`);
    
    return items.map(item => ({
      ...item,
      isLowStock: true
    }));
  }

  async searchInventoryItems(query: string): Promise<InventoryItemWithDetails[]> {
    const items = await db.select({
      id: inventoryItems.id,
      name: inventoryItems.name,
      sku: inventoryItems.sku,
      categoryId: inventoryItems.categoryId,
      storageAreaId: inventoryItems.storageAreaId,
      currentQuantity: inventoryItems.currentQuantity,
      minimumLevel: inventoryItems.minimumLevel,
      unit: inventoryItems.unit,
      supplier: inventoryItems.supplier,
      lastUpdated: inventoryItems.lastUpdated,
      category: {
        id: categories.id,
        name: categories.name,
        storageAreaId: categories.storageAreaId
      },
      storageArea: {
        id: storageAreas.id,
        name: storageAreas.name,
        description: storageAreas.description,
        icon: storageAreas.icon
      }
    })
    .from(inventoryItems)
    .leftJoin(categories, eq(inventoryItems.categoryId, categories.id))
    .leftJoin(storageAreas, eq(inventoryItems.storageAreaId, storageAreas.id))
    .where(
      or(
        like(inventoryItems.name, `%${query}%`),
        like(inventoryItems.sku, `%${query}%`)
      )
    );
    
    return items.map(item => ({
      ...item,
      isLowStock: parseFloat(item.currentQuantity) <= parseFloat(item.minimumLevel)
    }));
  }

  // Dashboard methods
  async getDashboardStats(): Promise<DashboardStats> {
    const allItems = await db.select().from(inventoryItems);
    const lowStockItems = allItems.filter(item => 
      parseFloat(item.currentQuantity) <= parseFloat(item.minimumLevel)
    );
    const outOfStockItems = allItems.filter(item => 
      parseFloat(item.currentQuantity) === 0
    );
    const allCategories = await db.select().from(categories);
    const allStorageAreas = await db.select().from(storageAreas);

    return {
      totalItems: allItems.length,
      lowStockItems: lowStockItems.length,
      totalCategories: allCategories.length,
      totalStorageAreas: allStorageAreas.length,
      outOfStockItems: outOfStockItems.length,
      recentlyUpdated: allItems.filter(item => {
        const dayAgo = new Date();
        dayAgo.setDate(dayAgo.getDate() - 1);
        return item.lastUpdated > dayAgo;
      }).length
    };
  }

  // Order methods
  async getOrderItems(): Promise<OrderItem[]> {
    return await db.select().from(orderItems);
  }

  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const [orderItem] = await db.insert(orderItems).values(insertOrderItem).returning();
    return orderItem;
  }

  async updateOrderItem(id: string, updates: Partial<OrderItem>): Promise<OrderItem | undefined> {
    const [orderItem] = await db.update(orderItems)
      .set(updates)
      .where(eq(orderItems.id, id))
      .returning();
    return orderItem || undefined;
  }

  async deleteOrderItem(id: string): Promise<boolean> {
    const result = await db.delete(orderItems).where(eq(orderItems.id, id)).returning();
    return result.length > 0;
  }

  async clearOrderItems(): Promise<void> {
    await db.delete(orderItems);
  }
}

export const storage = new DatabaseStorage();