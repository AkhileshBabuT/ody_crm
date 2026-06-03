import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import type { Env } from "../lib/db";
import { selectRestaurantSettingSchema } from "../db/schema.zod";
import * as settingsService from "../services/settings.service";

const app = new OpenAPIHono<Env>();

// ─── Shared Schemas ───

const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().nullable(),
  }),
});

const keyParam = z.string().min(1).openapi({ param: { name: "key", in: "path" } });

// ─── GET / — Get All Settings ───

const getAllSettingsRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Settings"],
  summary: "Get all settings",
  responses: {
    200: {
      description: "List of all settings",
      content: {
        "application/json": {
          schema: z.array(selectRestaurantSettingSchema),
        },
      },
    },
  },
});

app.openapi(getAllSettingsRoute, async (c) => {
  const db = c.var.db;
  const settings = await settingsService.getAllSettings(db);
  return c.json(settings, 200);
});

// ─── GET /:key — Get Setting By Key ───

const getSettingByKeyRoute = createRoute({
  method: "get",
  path: "/{key}",
  tags: ["Settings"],
  summary: "Get a setting by key",
  request: {
    params: z.object({ key: keyParam }),
  },
  responses: {
    200: {
      description: "The setting",
      content: {
        "application/json": {
          schema: selectRestaurantSettingSchema,
        },
      },
    },
    404: {
      description: "Setting not found",
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
    },
  },
});

app.openapi(getSettingByKeyRoute, async (c) => {
  const { key } = c.req.valid("param");
  const db = c.var.db;
  const setting = await settingsService.getSettingByKey(db, key);
  return c.json(setting, 200);
});

// ─── PUT /:key — Upsert Setting ───

const upsertSettingRoute = createRoute({
  method: "put",
  path: "/{key}",
  tags: ["Settings"],
  summary: "Update or create a setting",
  request: {
    params: z.object({ key: keyParam }),
    body: {
      content: {
        "application/json": {
          schema: z.object({ value: z.string().min(1) }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "The upserted setting",
      content: {
        "application/json": {
          schema: selectRestaurantSettingSchema,
        },
      },
    },
  },
});

app.openapi(upsertSettingRoute, async (c) => {
  const { key } = c.req.valid("param");
  const { value } = c.req.valid("json");
  const db = c.var.db;
  const setting = await settingsService.upsertSetting(db, key, value);
  return c.json(setting, 200);
});

export default app;
