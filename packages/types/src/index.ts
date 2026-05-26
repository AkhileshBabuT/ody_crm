// Re-export all Zod schemas and TypeScript types derived from the Drizzle schema.
// Frontend and other packages import from @odyssey/types instead of @odyssey/backend.

export {
  // Menu Categories
  type MenuCategory,
  type InsertMenuCategory,
  insertMenuCategorySchema,
  selectMenuCategorySchema,
  // Menu Items
  type MenuItem,
  type InsertMenuItem,
  insertMenuItemSchema,
  selectMenuItemSchema,
  // Customers
  type Customer,
  type InsertCustomer,
  insertCustomerSchema,
  selectCustomerSchema,
  // Orders
  type Order,
  type InsertOrder,
  insertOrderSchema,
  selectOrderSchema,
  // Order Items
  type OrderItem,
  type InsertOrderItem,
  insertOrderItemSchema,
  selectOrderItemSchema,
  // Restaurant Settings
  type RestaurantSetting,
  type InsertRestaurantSetting,
  insertRestaurantSettingSchema,
  selectRestaurantSettingSchema,
  // Composite types
  type OrderWithItems,
  orderWithItemsSchema,
  type MenuItemWithCategory,
  menuItemWithCategorySchema,
} from "@odyssey/backend/db/schema.zod";

// Re-export table objects for packages that need them
export {
  menuCategories,
  menuItems,
  customers,
  orders,
  orderItems,
  restaurantSettings,
  orderStatusEnum,
} from "@odyssey/backend/db/schema";
