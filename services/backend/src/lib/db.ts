import { createMiddleware } from "hono/factory";
import type { Context } from "hono";
import { createDb, type Database } from "../db";

// ─── Types ──────────────────────────────────────────────────────────────────

export type Env = {
  Bindings: { DATABASE_URL: string };
  Variables: { db: Database };
};

// ─── Middleware ──────────────────────────────────────────────────────────────

/**
 * Creates a Drizzle DB instance per request and sets it on c.var.db.
 *
 * The underlying client is closed after the response is sent. On Cloudflare
 * Workers a connection cannot outlive the request that created it, so we must
 * NOT cache/reuse it across requests — see createDb's note.
 */
export const dbMiddleware = createMiddleware<Env>(async (c, next) => {
  const { db, client } = createDb(c.env.DATABASE_URL);
  c.set("db", db);
  try {
    await next();
  } finally {
    // Close the connection without leaking it. Prefer waitUntil so closing
    // doesn't delay the response, but executionCtx is not always available
    // (e.g. under app.request() in tests) and accessing it throws — so guard.
    const ctx = getExecutionCtx(c);
    if (ctx) {
      ctx.waitUntil(client.end({ timeout: 5 }));
    } else {
      await client.end({ timeout: 5 });
    }
  }
});

/** Safely read executionCtx, which throws when none is present. */
function getExecutionCtx(c: Context): ExecutionContext | undefined {
  try {
    return c.executionCtx;
  } catch {
    return undefined;
  }
}
