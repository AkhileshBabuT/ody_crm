import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { dbMiddleware, type Env } from "./lib/db";
import { AppError, errorResponse } from "./lib/errors";
import menuRoutes from "./routes/menu.routes";
import ordersRoutes from "./routes/orders.routes";
import customersRoutes from "./routes/customers.routes";
import settingsRoutes from "./routes/settings.routes";
import dashboardRoutes from "./routes/dashboard.routes";

// ─── App ─────────────────────────────────────────────────────────────────────

const app = new OpenAPIHono<Env>();

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: ["http://localhost:8081", "http://localhost:19006"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);
app.use("/api/*", dbMiddleware);

// ─── Global Error Handler ───────────────────────────────────────────────────

app.onError((err, c) => {
  if (err instanceof AppError) {
    return c.json(errorResponse(err), err.status as any);
  }
  console.error("Unhandled error:", err);
  return c.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
        details: null,
      },
    },
    500,
  );
});

// ─── API Routes ─────────────────────────────────────────────────────────────

app.route("/api/menu", menuRoutes);
app.route("/api/orders", ordersRoutes);
app.route("/api/customers", customersRoutes);
app.route("/api/settings", settingsRoutes);
app.route("/api/dashboard", dashboardRoutes);

// ─── Health Check ────────────────────────────────────────────────────────────

app.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "odyssey-backend",
  });
});

// ─── OpenAPI Spec ────────────────────────────────────────────────────────────

app.doc("/openapi.json", {
  openapi: "3.1.0",
  info: {
    title: "Odyssey Restaurant Operations API",
    version: "0.1.0",
    description: "Backend API for the Odyssey restaurant operations dashboard",
  },
  servers: [
    {
      url: "http://localhost:8787",
      description: "Local development",
    },
  ],
});

// ─── Swagger UI (optional dev tool) ──────────────────────────────────────────

app.get("/swagger", (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Odyssey API — Swagger UI</title>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js" crossorigin></script>
        <script>
          SwaggerUIBundle({
            url: '/openapi.json',
            dom_id: '#swagger-ui',
            presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
            layout: "StandaloneLayout",
          });
        </script>
      </body>
    </html>
  `);
});

// ─── Export ──────────────────────────────────────────────────────────────────

export default app;
