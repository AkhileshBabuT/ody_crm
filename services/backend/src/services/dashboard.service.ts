import type { Database } from "../db";
import * as dashboardRepo from "../repositories/dashboard.repository";

// ─── Get Dashboard Stats ───

export async function getDashboardStats(db: Database) {
  const [orderStats, pendingOrders, ordersToday, popularItems] =
    await Promise.all([
      dashboardRepo.getOrderStats(db),
      dashboardRepo.getPendingOrdersCount(db),
      dashboardRepo.getOrdersTodayCount(db),
      dashboardRepo.getPopularItems(db),
    ]);

  return {
    totalOrders: orderStats.totalOrders,
    totalRevenueCents: orderStats.totalRevenueCents,
    pendingOrders,
    ordersToday,
    popularItems,
  };
}
