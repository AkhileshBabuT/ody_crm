import { customInstance } from "@odyssey/api-client";
import type { OrderStatus } from "@odyssey/shared";

// ─── Shared Types ───────────────────────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ErrorResponse {
  error: { code: string; message: string; details: unknown };
}

// ─── Entity Types ───────────────────────────────────────────────────────────

export interface Order {
  id: number;
  customerId: number | null;
  totalCents: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  menuItemId: number;
  name: string;
  quantity: number;
  unitPriceCents: number;
  createdAt: string;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
  customer: Customer | null;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerWithSummary extends Customer {
  orderSummary: {
    totalOrders: number;
    totalSpentCents: number;
  };
}

export interface MenuCategory {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface MenuCategoryWithItems extends MenuCategory {
  items: MenuItem[];
}

export interface MenuItem {
  id: number;
  categoryId: number;
  name: string;
  priceCents: number;
  available: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItemWithCategory extends MenuItem {
  category: MenuCategory;
}

export interface RestaurantSetting {
  id: number;
  key: string;
  value: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenueCents: number;
  pendingOrders: number;
  ordersToday: number;
  popularItems: { menuItemId: number; name: string; totalQuantity: number }[];
}

// ─── API Functions ──────────────────────────────────────────────────────────

// Dashboard
export function getDashboardStats() {
  return customInstance<DashboardStats>({ url: "/api/dashboard/stats", method: "GET" });
}

// Orders
export function getOrders(params?: {
  page?: number;
  pageSize?: number;
  status?: OrderStatus;
  from?: string;
  to?: string;
}) {
  return customInstance<PaginatedResponse<Order>>({
    url: "/api/orders",
    method: "GET",
    params,
  });
}

export function getOrder(id: number) {
  return customInstance<OrderWithItems>({ url: `/api/orders/${id}`, method: "GET" });
}

export function createOrder(data: {
  customerId: number;
  items: { menuItemId: number; quantity: number }[];
}) {
  return customInstance<OrderWithItems>({ url: "/api/orders", method: "POST", data });
}

export function updateOrderStatus(id: number, status: OrderStatus) {
  return customInstance<Order>({
    url: `/api/orders/${id}/status`,
    method: "PATCH",
    data: { status },
  });
}

// Menu Categories
export function getMenuCategories() {
  return customInstance<{ data: MenuCategory[] }>({
    url: "/api/menu/categories",
    method: "GET",
  });
}

export function getMenuCategory(id: number) {
  return customInstance<{ data: MenuCategoryWithItems }>({
    url: `/api/menu/categories/${id}`,
    method: "GET",
  });
}

export function createMenuCategory(data: { name: string }) {
  return customInstance<{ data: MenuCategory }>({
    url: "/api/menu/categories",
    method: "POST",
    data,
  });
}

export function updateMenuCategory(id: number, data: { name?: string }) {
  return customInstance<{ data: MenuCategory }>({
    url: `/api/menu/categories/${id}`,
    method: "PUT",
    data,
  });
}

export function deleteMenuCategory(id: number) {
  return customInstance<{ data: MenuCategory }>({
    url: `/api/menu/categories/${id}`,
    method: "DELETE",
  });
}

// Menu Items
export function getMenuItems(params?: { categoryId?: number; available?: string }) {
  return customInstance<{ data: MenuItem[] }>({
    url: "/api/menu/items",
    method: "GET",
    params,
  });
}

export function getMenuItem(id: number) {
  return customInstance<{ data: MenuItemWithCategory }>({
    url: `/api/menu/items/${id}`,
    method: "GET",
  });
}

export function createMenuItem(data: {
  categoryId: number;
  name: string;
  priceCents: number;
}) {
  return customInstance<{ data: MenuItem }>({
    url: "/api/menu/items",
    method: "POST",
    data,
  });
}

export function updateMenuItem(
  id: number,
  data: Partial<{ categoryId: number; name: string; priceCents: number; available: boolean }>,
) {
  return customInstance<{ data: MenuItem }>({
    url: `/api/menu/items/${id}`,
    method: "PUT",
    data,
  });
}

export function deleteMenuItem(id: number) {
  return customInstance<{ data: MenuItem }>({
    url: `/api/menu/items/${id}`,
    method: "DELETE",
  });
}

// Customers
export function getCustomers(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
}) {
  return customInstance<PaginatedResponse<Customer>>({
    url: "/api/customers",
    method: "GET",
    params,
  });
}

export function getCustomer(id: number) {
  return customInstance<{ data: CustomerWithSummary }>({
    url: `/api/customers/${id}`,
    method: "GET",
  });
}

export function createCustomer(data: {
  name: string;
  email: string;
  phone?: string | null;
}) {
  return customInstance<{ data: Customer }>({
    url: "/api/customers",
    method: "POST",
    data,
  });
}

export function updateCustomer(
  id: number,
  data: Partial<{ name: string; email: string; phone: string | null }>,
) {
  return customInstance<{ data: Customer }>({
    url: `/api/customers/${id}`,
    method: "PUT",
    data,
  });
}

// Settings
export function getSettings() {
  return customInstance<RestaurantSetting[]>({ url: "/api/settings", method: "GET" });
}

export function getSetting(key: string) {
  return customInstance<RestaurantSetting>({
    url: `/api/settings/${encodeURIComponent(key)}`,
    method: "GET",
  });
}

export function updateSetting(key: string, value: string) {
  return customInstance<RestaurantSetting>({
    url: `/api/settings/${encodeURIComponent(key)}`,
    method: "PUT",
    data: { value },
  });
}
