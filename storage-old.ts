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
import { randomUUID } from "crypto";
import { eq, and, sql } from "drizzle-orm";
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
  searchInventoryItems(query: string): Promise<InventoryItemWithDetails[]>;

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
      icon: "temperature-low"
    };

    // Check if data already exists
    const existingAreas = await db.select().from(storageAreas);
    if (existingAreas.length > 0) return;

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

    // Add sample inventory items
    const inventoryData: InsertInventoryItem[] = [
      // Dry Storage Items - Paper Goods
      { id: "napkins", name: "Paper Napkins", sku: "PPR001", categoryId: "paper-goods", storageAreaId: "dry-storage", currentQuantity: "150", minimumLevel: "200", unit: "packs", supplier: "Restaurant Supply Co", lastUpdated: new Date() },
      { id: "takeout-containers", name: "Takeout Containers", sku: "PPR002", categoryId: "paper-goods", storageAreaId: "dry-storage", currentQuantity: "45", minimumLevel: "100", unit: "packs", supplier: "Restaurant Supply Co", lastUpdated: new Date() },
      
      // Dry Storage Items - Dry Ingredients
      { id: "flour", name: "All-Purpose Flour", sku: "DRY001", categoryId: "dry-ingredients", storageAreaId: "dry-storage", currentQuantity: "12", minimumLevel: "20", unit: "kg", supplier: "Baker's Wholesale", lastUpdated: new Date() },
      { id: "sugar", name: "Granulated Sugar", sku: "DRY002", categoryId: "dry-ingredients", storageAreaId: "dry-storage", currentQuantity: "8", minimumLevel: "15", unit: "kg", supplier: "Baker's Wholesale", lastUpdated: new Date() },
      { id: "rice", name: "Jasmine Rice", sku: "DRY003", categoryId: "dry-ingredients", storageAreaId: "dry-storage", currentQuantity: "18", minimumLevel: "25", unit: "kg", supplier: "Asian Imports", lastUpdated: new Date() },
      
      // Dry Storage Items - Canned Goods
      { id: "tomatoes-canned", name: "Diced Tomatoes", sku: "CAN001", categoryId: "canned-goods", storageAreaId: "dry-storage", currentQuantity: "24", minimumLevel: "36", unit: "cans", supplier: "Food Distributors", lastUpdated: new Date() },
      { id: "beans-black", name: "Black Beans", sku: "CAN002", categoryId: "canned-goods", storageAreaId: "dry-storage", currentQuantity: "8", minimumLevel: "18", unit: "cans", supplier: "Food Distributors", lastUpdated: new Date() },
      
      // Cold Storage Items - Fresh Produce
      { id: "lettuce", name: "Iceberg Lettuce", sku: "PRD001", categoryId: "fresh-produce", storageAreaId: "cold-storage", currentQuantity: "12", minimumLevel: "18", unit: "heads", supplier: "Farm Fresh", lastUpdated: new Date() },
      { id: "tomatoes", name: "Roma Tomatoes", sku: "PRD002", categoryId: "fresh-produce", storageAreaId: "cold-storage", currentQuantity: "6", minimumLevel: "12", unit: "kg", supplier: "Farm Fresh", lastUpdated: new Date() },
      { id: "onions", name: "Yellow Onions", sku: "PRD003", categoryId: "fresh-produce", storageAreaId: "cold-storage", currentQuantity: "15", minimumLevel: "20", unit: "kg", supplier: "Farm Fresh", lastUpdated: new Date() },
      
      // Cold Storage Items - Dairy Products
      { id: "milk", name: "Whole Milk", sku: "DAI001", categoryId: "dairy-products", storageAreaId: "cold-storage", currentQuantity: "8", minimumLevel: "15", unit: "liters", supplier: "Daily Dairy", lastUpdated: new Date() },
      { id: "cheese-cheddar", name: "Cheddar Cheese", sku: "DAI002", categoryId: "dairy-products", storageAreaId: "cold-storage", currentQuantity: "3", minimumLevel: "6", unit: "kg", supplier: "Daily Dairy", lastUpdated: new Date() },
      { id: "butter", name: "Unsalted Butter", sku: "DAI003", categoryId: "dairy-products", storageAreaId: "cold-storage", currentQuantity: "2", minimumLevel: "5", unit: "kg", supplier: "Daily Dairy", lastUpdated: new Date() },
      
      // Freezer Items - Frozen Meats
      { id: "chicken-breast", name: "Chicken Breast", sku: "FMT001", categoryId: "frozen-meats", storageAreaId: "freezer", currentQuantity: "8", minimumLevel: "15", unit: "kg", supplier: "Fresh Meats Inc", lastUpdated: new Date() },
      { id: "ground-beef", name: "Ground Beef", sku: "FMT002", categoryId: "frozen-meats", storageAreaId: "freezer", currentQuantity: "4", minimumLevel: "10", unit: "kg", supplier: "Fresh Meats Inc", lastUpdated: new Date() },
      
      // Freezer Items - Frozen Vegetables
      { id: "peas-frozen", name: "Frozen Green Peas", sku: "FVG001", categoryId: "frozen-vegetables", storageAreaId: "freezer", currentQuantity: "6", minimumLevel: "12", unit: "kg", supplier: "Frozen Foods Ltd", lastUpdated: new Date() },
      { id: "corn-frozen", name: "Frozen Corn", sku: "FVG002", categoryId: "frozen-vegetables", storageAreaId: "freezer", currentQuantity: "4", minimumLevel: "8", unit: "kg", supplier: "Frozen Foods Ltd", lastUpdated: new Date() }
    ];

    await db.insert(inventoryItems).values(inventoryData);
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

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(insertCategory).returning();
    return category;
  }

  async deleteCategory(id: string): Promise<boolean> {
    return this.categories.delete(id);
  }

  // Inventory item methods
  async getAllInventoryItems(): Promise<InventoryItem[]> {
    return Array.from(this.inventoryItems.values());
  }

  async getInventoryItemsByStorageArea(storageAreaId: string): Promise<InventoryItemWithDetails[]> {
    const items = Array.from(this.inventoryItems.values()).filter(
      item => item.storageAreaId === storageAreaId
    );
    
    return this.enrichInventoryItems(items);
  }

  async getInventoryItemsByCategory(categoryId: string): Promise<InventoryItemWithDetails[]> {
    const items = Array.from(this.inventoryItems.values()).filter(
      item => item.categoryId === categoryId
    );
    
    return this.enrichInventoryItems(items);
  }

  async getInventoryItemById(id: string): Promise<InventoryItem | undefined> {
    return this.inventoryItems.get(id);
  }

  async createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem> {
    const id = randomUUID();
    const newItem: InventoryItem = { 
      ...item, 
      id,
      lastUpdated: new Date(),
      sku: item.sku || null,
      supplier: item.supplier || null,
      currentQuantity: item.currentQuantity || "0",
      minimumLevel: item.minimumLevel || "0"
    };
    this.inventoryItems.set(id, newItem);
    return newItem;
  }

  async updateInventoryItem(id: string, updates: UpdateInventoryItem): Promise<InventoryItem | undefined> {
    const item = this.inventoryItems.get(id);
    if (!item) return undefined;

    const updatedItem: InventoryItem = {
      ...item,
      ...updates,
      lastUpdated: new Date()
    };
    
    this.inventoryItems.set(id, updatedItem);
    return updatedItem;
  }

  async deleteInventoryItem(id: string): Promise<boolean> {
    return this.inventoryItems.delete(id);
  }

  async getLowStockItems(): Promise<InventoryItemWithDetails[]> {
    const items = Array.from(this.inventoryItems.values()).filter(item => 
      parseFloat(item.currentQuantity) <= parseFloat(item.minimumLevel)
    );
    
    return this.enrichInventoryItems(items);
  }

  async searchInventoryItems(query: string): Promise<InventoryItemWithDetails[]> {
    const lowerQuery = query.toLowerCase();
    const items = Array.from(this.inventoryItems.values()).filter(item => 
      item.name.toLowerCase().includes(lowerQuery) ||
      (item.sku && item.sku.toLowerCase().includes(lowerQuery))
    );
    
    return this.enrichInventoryItems(items);
  }

  private async enrichInventoryItems(items: InventoryItem[]): Promise<InventoryItemWithDetails[]> {
    return items.map(item => {
      const category = this.categories.get(item.categoryId)!;
      const storageArea = this.storageAreas.get(item.storageAreaId)!;
      const isLowStock = parseFloat(item.currentQuantity) <= parseFloat(item.minimumLevel);
      
      return {
        ...item,
        category,
        storageArea,
        isLowStock
      };
    });
  }

  // Dashboard methods
  async getDashboardStats(): Promise<DashboardStats> {
    const items = Array.from(this.inventoryItems.values());
    const lowStockItems = items.filter(item => 
      parseFloat(item.currentQuantity) <= parseFloat(item.minimumLevel)
    );
    const wellStocked = items.filter(item => 
      parseFloat(item.currentQuantity) > parseFloat(item.minimumLevel)
    );
    const pendingOrders = Array.from(this.orderItems.values()).length;

    return {
      totalItems: items.length,
      lowStockItems: lowStockItems.length,
      pendingOrders,
      wellStocked: wellStocked.length
    };
  }

  // Order methods
  async getOrderItems(): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values());
  }

  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const id = randomUUID();
    const newOrderItem: OrderItem = { 
      ...orderItem, 
      id,
      createdAt: new Date(),
      isSelected: orderItem.isSelected ?? true
    };
    this.orderItems.set(id, newOrderItem);
    return newOrderItem;
  }

  async updateOrderItem(id: string, updates: Partial<OrderItem>): Promise<OrderItem | undefined> {
    const orderItem = this.orderItems.get(id);
    if (!orderItem) return undefined;

    const updatedOrderItem: OrderItem = { ...orderItem, ...updates };
    this.orderItems.set(id, updatedOrderItem);
    return updatedOrderItem;
  }

  async deleteOrderItem(id: string): Promise<boolean> {
    return this.orderItems.delete(id);
  }

  async clearOrderItems(): Promise<void> {
    this.orderItems.clear();
  }
}

export const storage = new DatabaseStorage();
