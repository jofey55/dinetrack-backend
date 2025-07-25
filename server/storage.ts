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
  type DashboardStats
} from "@shared/schema";
import { randomUUID } from "crypto";

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

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private storageAreas: Map<string, StorageArea>;
  private categories: Map<string, Category>;
  private inventoryItems: Map<string, InventoryItem>;
  private orderItems: Map<string, OrderItem>;

  constructor() {
    this.users = new Map();
    this.storageAreas = new Map();
    this.categories = new Map();
    this.inventoryItems = new Map();
    this.orderItems = new Map();
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
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

    this.storageAreas.set(dryStorage.id, dryStorage);
    this.storageAreas.set(coldStorage.id, coldStorage);
    this.storageAreas.set(freezer.id, freezer);

    // Initialize default categories
    const categories = [
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

    categories.forEach(category => {
      this.categories.set(category.id, category);
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Storage area methods
  async getAllStorageAreas(): Promise<StorageArea[]> {
    return Array.from(this.storageAreas.values());
  }

  async getStorageAreaById(id: string): Promise<StorageArea | undefined> {
    return this.storageAreas.get(id);
  }

  async createStorageArea(storageArea: InsertStorageArea): Promise<StorageArea> {
    const id = randomUUID();
    const newStorageArea: StorageArea = { 
      ...storageArea, 
      id,
      description: storageArea.description || null
    };
    this.storageAreas.set(id, newStorageArea);
    return newStorageArea;
  }

  async getStorageAreasWithStats(): Promise<StorageAreaWithStats[]> {
    const areas = Array.from(this.storageAreas.values());
    const result: StorageAreaWithStats[] = [];

    for (const area of areas) {
      const categories = await this.getCategoriesByStorageArea(area.id);
      const items = Array.from(this.inventoryItems.values()).filter(
        item => item.storageAreaId === area.id
      );
      
      const categoriesWithCount = categories.map(category => ({
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
    return Array.from(this.categories.values()).filter(
      category => category.storageAreaId === storageAreaId
    );
  }

  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
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

export const storage = new MemStorage();
