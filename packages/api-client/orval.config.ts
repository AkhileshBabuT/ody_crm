import { defineConfig } from "orval";

export default defineConfig({
  odyssey: {
    input: {
      target: "../../services/backend/openapi.json",
    },
    output: {
      target: "./src/generated/endpoints.ts",
      schemas: "./src/generated/schemas",
      client: "react-query",
      mode: "tags-split",
      override: {
        mutator: {
          path: "./src/custom-instance.ts",
          name: "customInstance",
        },
        query: {
          useQuery: true,
          useMutation: true,
        },
      },
    },
  },
});
