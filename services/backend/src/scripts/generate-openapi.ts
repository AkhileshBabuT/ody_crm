import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import app from "../index";

const doc = app.getOpenAPI31Document({
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

const outPath = resolve(__dirname, "../../openapi.json");
writeFileSync(outPath, JSON.stringify(doc, null, 2));
console.log(`OpenAPI spec written to ${outPath}`);
