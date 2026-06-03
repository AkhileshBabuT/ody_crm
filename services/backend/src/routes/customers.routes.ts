import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import type { Env } from "../lib/db";
import { insertCustomerSchema, selectCustomerSchema } from "../db/schema.zod";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "@odyssey/shared";
import {
  listCustomers,
  getCustomerById,
  createCustomer,
  editCustomer,
} from "../services/customer.service";

const app = new OpenAPIHono<Env>();

// ─── Shared Schemas ───

const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().nullable(),
  }),
});

const idParam = z
  .string()
  .pipe(z.coerce.number().int().positive())
  .openapi({ param: { name: "id", in: "path" } });

const customerWithOrderSummarySchema = selectCustomerSchema.extend({
  orderSummary: z.object({
    totalOrders: z.number(),
    totalSpentCents: z.number(),
  }),
});

const paginatedCustomersSchema = z.object({
  data: z.array(selectCustomerSchema),
  meta: z.object({
    page: z.number(),
    pageSize: z.number(),
    totalCount: z.number(),
    totalPages: z.number(),
  }),
});

// ─── List Customers ───

const listCustomersRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Customers"],
  summary: "List customers",
  request: {
    query: z.object({
      page: z.coerce.number().int().positive().default(1).optional(),
      pageSize: z.coerce
        .number()
        .int()
        .positive()
        .max(MAX_PAGE_SIZE)
        .default(DEFAULT_PAGE_SIZE)
        .optional(),
      search: z.string().optional(),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": { schema: paginatedCustomersSchema },
      },
      description: "Paginated list of customers",
    },
  },
});

app.openapi(listCustomersRoute, async (c) => {
  const db = c.var.db;
  const { page = 1, pageSize = DEFAULT_PAGE_SIZE, search } = c.req.valid("query");
  const result = await listCustomers(db, { page, pageSize, search });
  return c.json(result, 200);
});

// ─── Get Customer ───

const getCustomerRoute = createRoute({
  method: "get",
  path: "/{id}",
  tags: ["Customers"],
  summary: "Get customer with order summary",
  request: {
    params: z.object({ id: idParam }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({ data: customerWithOrderSummarySchema }),
        },
      },
      description: "Customer with order summary",
    },
    404: {
      content: { "application/json": { schema: errorResponseSchema } },
      description: "Customer not found",
    },
  },
});

app.openapi(getCustomerRoute, async (c) => {
  const db = c.var.db;
  const { id } = c.req.valid("param");
  const result = await getCustomerById(db, id);
  return c.json({ data: result }, 200);
});

// ─── Create Customer ───

const createCustomerRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Customers"],
  summary: "Create customer",
  request: {
    body: {
      content: {
        "application/json": { schema: insertCustomerSchema },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: z.object({ data: selectCustomerSchema }),
        },
      },
      description: "Created customer",
    },
    409: {
      content: { "application/json": { schema: errorResponseSchema } },
      description: "Email already exists",
    },
  },
});

app.openapi(createCustomerRoute, async (c) => {
  const db = c.var.db;
  const body = c.req.valid("json");
  const result = await createCustomer(db, body);
  return c.json({ data: result }, 201);
});

// ─── Update Customer ───

const updateCustomerRoute = createRoute({
  method: "put",
  path: "/{id}",
  tags: ["Customers"],
  summary: "Update customer",
  request: {
    params: z.object({ id: idParam }),
    body: {
      content: {
        "application/json": { schema: insertCustomerSchema.partial() },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({ data: selectCustomerSchema }),
        },
      },
      description: "Updated customer",
    },
    404: {
      content: { "application/json": { schema: errorResponseSchema } },
      description: "Customer not found",
    },
    409: {
      content: { "application/json": { schema: errorResponseSchema } },
      description: "Email already exists",
    },
  },
});

app.openapi(updateCustomerRoute, async (c) => {
  const db = c.var.db;
  const { id } = c.req.valid("param");
  const body = c.req.valid("json");
  const result = await editCustomer(db, id, body);
  return c.json({ data: result }, 200);
});

export default app;
