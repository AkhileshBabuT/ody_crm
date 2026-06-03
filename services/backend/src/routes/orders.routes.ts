import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import type { Env } from "../lib/db";
import {
  ORDER_STATUS,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from "@odyssey/shared";
import {
  selectOrderSchema,
  selectOrderItemSchema,
  selectCustomerSchema,
  orderWithItemsSchema,
} from "../db/schema.zod";
import * as orderService from "../services/order.service";

// ─── Shared Schemas ───

const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().nullable(),
  }),
});

const idParamSchema = z.object({
  id: z
    .string()
    .pipe(z.coerce.number().int().positive())
    .openapi({ param: { name: "id", in: "path" } }),
});

const paginationMetaSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
  totalCount: z.number(),
  totalPages: z.number(),
});

const orderStatusEnum = z.enum([
  ORDER_STATUS.PENDING,
  ORDER_STATUS.ACCEPTED,
  ORDER_STATUS.PREPARING,
  ORDER_STATUS.READY,
  ORDER_STATUS.COMPLETED,
  ORDER_STATUS.CANCELLED,
]);

// ─── App ───

const app = new OpenAPIHono<Env>();

// ─── List Orders ───

const listOrdersRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Orders"],
  summary: "List orders",
  request: {
    query: z.object({
      page: z.coerce
        .number()
        .int()
        .positive()
        .default(1)
        .optional(),
      pageSize: z.coerce
        .number()
        .int()
        .positive()
        .max(MAX_PAGE_SIZE)
        .default(DEFAULT_PAGE_SIZE)
        .optional(),
      status: orderStatusEnum.optional(),
      from: z.string().datetime().optional(),
      to: z.string().datetime().optional(),
    }),
  },
  responses: {
    200: {
      description: "List of orders",
      content: {
        "application/json": {
          schema: z.object({
            data: z.array(selectOrderSchema),
            meta: paginationMetaSchema,
          }),
        },
      },
    },
  },
});

app.openapi(listOrdersRoute, async (c) => {
  const db = c.var.db;
  const { page = 1, pageSize = DEFAULT_PAGE_SIZE, status, from, to } = c.req.valid("query");

  const result = await orderService.listOrders(db, {
    status,
    from,
    to,
    page,
    pageSize,
  });

  return c.json(
    {
      data: result.orders,
      meta: {
        page,
        pageSize,
        totalCount: result.totalCount,
        totalPages: Math.ceil(result.totalCount / pageSize),
      },
    },
    200,
  );
});

// ─── Get Order By ID ───

const getOrderRoute = createRoute({
  method: "get",
  path: "/{id}",
  tags: ["Orders"],
  summary: "Get order by ID",
  request: {
    params: idParamSchema,
  },
  responses: {
    200: {
      description: "Order with items and customer info",
      content: {
        "application/json": {
          schema: orderWithItemsSchema.extend({
            customer: selectCustomerSchema.nullable().optional(),
          }),
        },
      },
    },
    404: {
      description: "Order not found",
      content: {
        "application/json": { schema: errorResponseSchema },
      },
    },
  },
});

app.openapi(getOrderRoute, async (c) => {
  const db = c.var.db;
  const { id } = c.req.valid("param");
  const order = await orderService.getOrderById(db, id);
  return c.json(order as any, 200);
});

// ─── Create Order ───

const createOrderRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Orders"],
  summary: "Create a new order",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            customerId: z.number().int().positive(),
            items: z
              .array(
                z.object({
                  menuItemId: z.number().int().positive(),
                  quantity: z.number().int().positive(),
                }),
              )
              .min(1),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: "Order created successfully",
      content: {
        "application/json": {
          schema: orderWithItemsSchema,
        },
      },
    },
    404: {
      description: "Customer not found",
      content: {
        "application/json": { schema: errorResponseSchema },
      },
    },
    422: {
      description: "Unavailable items",
      content: {
        "application/json": { schema: errorResponseSchema },
      },
    },
  },
});

app.openapi(createOrderRoute, async (c) => {
  const db = c.var.db;
  const body = c.req.valid("json");
  const order = await orderService.createOrder(db, body);
  return c.json(order as any, 201);
});

// ─── Update Order Status ───

const updateOrderStatusRoute = createRoute({
  method: "patch",
  path: "/{id}/status",
  tags: ["Orders"],
  summary: "Update order status",
  request: {
    params: idParamSchema,
    body: {
      content: {
        "application/json": {
          schema: z.object({
            status: orderStatusEnum,
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Order status updated",
      content: {
        "application/json": {
          schema: selectOrderSchema,
        },
      },
    },
    404: {
      description: "Order not found",
      content: {
        "application/json": { schema: errorResponseSchema },
      },
    },
    422: {
      description: "Invalid state transition",
      content: {
        "application/json": { schema: errorResponseSchema },
      },
    },
  },
});

app.openapi(updateOrderStatusRoute, async (c) => {
  const db = c.var.db;
  const { id } = c.req.valid("param");
  const { status } = c.req.valid("json");
  const updated = await orderService.updateOrderStatus(db, id, status);
  return c.json(updated as any, 200);
});

export default app;
