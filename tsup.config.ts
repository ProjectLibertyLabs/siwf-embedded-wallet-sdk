import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  splitting: false,
  sourcemap: false,
  clean: true,
  format: "cjs",
  platform: "browser",
  outDir: "dist/cjs",
  outExtension() {
    return {
      js: `.js`,
    };
  },
});
