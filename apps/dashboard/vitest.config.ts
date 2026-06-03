import { defineConfig } from "vitest/config";
import path from "node:path";

// Minimal vitest config for the dashboard.
// We test PURE LOGIC and presentational mappings only (node environment),
// deliberately avoiding the heavy React Native Web + jsdom render setup.
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    globals: false,
  },
});
