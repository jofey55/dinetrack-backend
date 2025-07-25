import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const storageAreas = pgTable("storage_areas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon").notNull(),
});

export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  storageAreaId: varchar("storage_area_id").notNull(),
});

export const inventoryItems = pgTable("inventory_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  sku: text("sku"),
  categoryId: varchar("category_id").notNull(),
  storageAreaId: varchar("storage_area_id").notNull(),
  currentQuantity: decimal("current_quantity").notNull().default("0"),
  minimumLevel: decimal("minimum_level").notNull().default("0"),
  unit: text("unit").notNull(),
  supplier: text("supplier"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  inventoryItemId: varchar("inventory_item_id").notNull(),
  suggestedQuantity: decimal("suggested_quantity").notNull(),
  isSelected: boolean("is_selected").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertStorageAreaSchema = createInsertSchema(storageAreas).omit({
  id: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export const insertInventoryItemSchema = createInsertSchema(inventoryItems).omit({
  id: true,
  lastUpdated: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
  createdAt: true,
});

export const updateInventoryItemSchema = insertInventoryItemSchema.partial();

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type StorageArea = typeof storageAreas.$inferSelect;
export type InsertStorageArea = z.infer<typeof insertStorageAreaSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;
export type UpdateInventoryItem = z.infer<typeof updateInventoryItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

// Extended types for API responses
export type InventoryItemWithDetails = InventoryItem & {
  category: Category;
  storageArea: StorageArea;
  isLowStock: boolean;
};

export type StorageAreaWithStats = StorageArea & {
  totalItems: number;
  lowStockCount: number;
  categories: (Category & { itemCount: number })[];
};

export type DashboardStats = {
  totalItems: number;
  lowStockItems: number;
  pendingOrders: number;
  wellStocked: number;
};
