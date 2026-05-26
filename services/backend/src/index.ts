import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

// ─── Types ───────────────────────────────────────────────────────────────────

type Bindings = {
  DATABASE_URL: string;
};

// ─── App ─────────────────────────────────────────────────────────────────────

const app = new OpenAPIHono<{ Bindings: Bindings }>();

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
