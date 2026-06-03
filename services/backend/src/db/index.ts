import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Creates a database connection and returns a typed Drizzle instance
 * together with the underlying client so the caller can close it.
 *
 * IMPORTANT: On Cloudflare Workers a connection (and its underlying socket
 * I/O objects) MUST NOT be shared across requests — doing so triggers
 * "Cannot perform I/O on behalf of a different request". So we create a
 * fresh client per request and the caller is responsible for closing it
 * (typically via `c.executionCtx.waitUntil(client.end())`).
 */
export function createDb(connectionString: string) {
  const client = postgres(connectionString, {
    max: 1,
    // Workers has no persistent filesystem/process; skip the type fetch
    // round-trip and keep the connection short-lived.
    fetch_types: false,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  const db = drizzle(client, { schema });
  return { db, client };
}

export type Database = ReturnType<typeof createDb>["db"];
