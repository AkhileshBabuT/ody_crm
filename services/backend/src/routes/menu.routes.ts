import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import type { Env } from "../lib/db";
import {
  insertMenuCategorySchema,
  selectMenuCategorySchema,
  insertMenuItemSchema,
  selectMenuItemSchema,
  menuItemWithCategorySchema,
} from "../db/schema.zod";
import {
  listCategories,
  getCategory,
  createCategory,
  editCategory,
  removeCategory,
  listItems,
  getItem,
  createItem,
  editItem,
  removeItem,
} from "../services/menu.service";

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

const categoryWithItemsSchema = selectMenuCategorySchema.extend({
  items: z.array(selectMenuItemSchema),
});

// ─── Category Routes ───

const listCategoriesRoute = createRoute({
  method: "get",
  path: "/categories",
  tags: ["Menu"],
  summary: "List all categories",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({ data: z.array(selectMenuCategorySchema) }),
        },
      },
      description: "List of categories",
    },
  },
});

app.openapi(listCategoriesRoute, async (c) => {
  const db = c.var.db;
  const result = await listCategories(db);
  return c.json({ data: result }, 200);
});

const getCategoryRoute = createRoute({
  method: "get",
  path: "/categories/{id}",
  tags: ["Menu"],
  summary: "Get category with its items",
  request: {
    params: z.object({ id: idParam }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({ data: categoryWithItemsSchema }),
        },
      },
      description: "Category with items",
    },
    404: {
      content: { "application/json": { schema: errorResponseSchema } },
      description: "Category not found",
    },
  },
});

app.openapi(getCategoryRoute, async (c) => {
  const db = c.var.db;
  const { id } = c.req.valid("param");
  const result = await getCategory(db, id);
  return c.json({ data: result }, 200);
});

const createCategoryRoute = createRoute({
  method: "post",
  path: "/categories",
  tags: ["Menu"],
  summary: "Create category",
  request: {
    body: {
      content: {
        "application/json": { schema: insertMenuCategorySchema },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: z.object({ data: selectMenuCategorySchema }),
        },
      },
      description: "Created category",
    },
  },
});

app.openapi(createCategoryRoute, async (c) => {
  const db = c.var.db;
  const body = c.req.valid("json");
  const result = await createCategory(db, body);
  return c.json({ data: result }, 201);
});

const updateCategoryRoute = createRoute({
  method: "put",
  path: "/categories/{id}",
  tags: ["Menu"],
  summary: "Update category",
  request: {
    params: z.object({ id: idParam }),
    body: {
      content: {
        "application/json": { schema: insertMenuCategorySchema.partial() },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({ data: selectMenuCategorySchema }),
        },
      },
      description: "Updated category",
    },
    404: {
      content: { "application/json": { schema: errorResponseSchema } },
      description: "Category not found",
    },
  },
});

app.openapi(updateCategoryRoute, async (c) => {
  const db = c.var.db;
  const { id } = c.req.valid("param");
  const body = c.req.valid("json");
  const result = await editCategory(db, id, body);
  return c.json({ data: result }, 200);
});

const deleteCategoryRoute = createRoute({
  method: "delete",
  path: "/categories/{id}",
  tags: ["Menu"],
  summary: "Delete category (cascades items)",
  request: {
    params: z.object({ id: idParam }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({ data: selectMenuCategorySchema }),
        },
      },
      description: "Deleted category",
    },
    404: {
      content: { "application/json": { schema: errorResponseSchema } },
      description: "Category not found",
    },
  },
});

app.openapi(deleteCategoryRoute, async (c) => {
  const db = c.var.db;
  const { id } = c.req.valid("param");
  const result = await removeCategory(db, id);
  return c.json({ data: result }, 200);
});

// ─── Item Routes ───

const listItemsRoute = createRoute({
  method: "get",
  path: "/items",
  tags: ["Menu"],
  summary: "List menu items",
  request: {
    query: z.object({
      categoryId: z
        .string()
        .pipe(z.coerce.number().int().positive())
        .optional(),
      available: z
        .enum(["true", "false"])
        .transform((v) => v === "true")
        .optional(),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({ data: z.array(selectMenuItemSchema) }),
        },
      },
      description: "List of menu items",
    },
  },
});

app.openapi(listItemsRoute, async (c) => {
  const db = c.var.db;
  const { categoryId, available } = c.req.valid("query");
  const result = await listItems(db, { categoryId, available });
  return c.json({ data: result }, 200);
});

const getItemRoute = createRoute({
  method: "get",
  path: "/items/{id}",
  tags: ["Menu"],
  summary: "Get menu item with category",
  request: {
    params: z.object({ id: idParam }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({ data: menuItemWithCategorySchema }),
        },
      },
      description: "Menu item with category",
    },
    404: {
      content: { "application/json": { schema: errorResponseSchema } },
      description: "Menu item not found",
    },
  },
});

app.openapi(getItemRoute, async (c) => {
  const db = c.var.db;
  const { id } = c.req.valid("param");
  const result = await getItem(db, id);
  return c.json({ data: result }, 200);
});

const createItemRoute = createRoute({
  method: "post",
  path: "/items",
  tags: ["Menu"],
  summary: "Create menu item",
  request: {
    body: {
      content: {
        "application/json": { schema: insertMenuItemSchema },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: z.object({ data: selectMenuItemSchema }),
        },
      },
      description: "Created menu item",
    },
    404: {
      content: { "application/json": { schema: errorResponseSchema } },
      description: "Category not found",
    },
  },
});

app.openapi(createItemRoute, async (c) => {
  const db = c.var.db;
  const body = c.req.valid("json");
  const result = await createItem(db, body);
  return c.json({ data: result }, 201);
});

const updateItemRoute = createRoute({
  method: "put",
  path: "/items/{id}",
  tags: ["Menu"],
  summary: "Update menu item",
  request: {
    params: z.object({ id: idParam }),
    body: {
      content: {
        "application/json": { schema: insertMenuItemSchema.partial() },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({ data: selectMenuItemSchema }),
        },
      },
      description: "Updated menu item",
    },
    404: {
      content: { "application/json": { schema: errorResponseSchema } },
      description: "Menu item not found",
    },
  },
});

app.openapi(updateItemRoute, async (c) => {
  const db = c.var.db;
  const { id } = c.req.valid("param");
  const body = c.req.valid("json");
  const result = await editItem(db, id, body);
  return c.json({ data: result }, 200);
});

const deleteItemRoute = createRoute({
  method: "delete",
  path: "/items/{id}",
  tags: ["Menu"],
  summary: "Delete menu item",
  request: {
    params: z.object({ id: idParam }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({ data: selectMenuItemSchema }),
        },
      },
      description: "Deleted menu item",
    },
    404: {
      content: { "application/json": { schema: errorResponseSchema } },
      description: "Menu item not found",
    },
    409: {
      content: { "application/json": { schema: errorResponseSchema } },
      description: "Cannot delete item with existing orders",
    },
  },
});

app.openapi(deleteItemRoute, async (c) => {
  const db = c.var.db;
  const { id } = c.req.valid("param");
  const result = await removeItem(db, id);
  return c.json({ data: result }, 200);
});

export default app;
