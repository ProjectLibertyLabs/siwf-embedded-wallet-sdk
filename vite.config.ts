import { defineConfig } from "vite";

export default defineConfig({
  test: {
    include: ["src/**/*.{test,spec}.{js,ts}"],
    coverage: {
      exclude: [
        "src/types",
        "src/base64url.ts",
        "./*.*s",
        "test-mocks",
        "scripts",
        "dist",
      ],
    },
    mockReset: true,
  },
});
