import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import type { Env } from "../lib/db";
import * as dashboardService from "../services/dashboard.service";

const app = new OpenAPIHono<Env>();

// ─── Shared Schemas ───

const dashboardStatsSchema = z.object({
  totalOrders: z.number(),
  totalRevenueCents: z.number(),
  pendingOrders: z.number(),
  ordersToday: z.number(),
  popularItems: z.array(
    z.object({
      menuItemId: z.number(),
      name: z.string(),
      totalQuantity: z.number(),
    })
  ),
});

// ─── GET /stats — Dashboard KPIs ───

const getDashboardStatsRoute = createRoute({
  method: "get",
  path: "/stats",
  tags: ["Dashboard"],
  summary: "Get dashboard KPI stats",
  responses: {
    200: {
      description: "Dashboard statistics",
      content: {
        "application/json": {
          schema: dashboardStatsSchema,
        },
      },
    },
  },
});

app.openapi(getDashboardStatsRoute, async (c) => {
  const db = c.var.db;
  const stats = await dashboardService.getDashboardStats(db);
  return c.json(stats, 200);
});

export default app;
