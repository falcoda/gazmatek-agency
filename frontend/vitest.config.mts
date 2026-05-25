/// <reference types="vitest" />
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import svgr from "vite-plugin-svgr";
import { defineConfig } from "vitest/config";

/**
 * Dedicated Vitest configuration.
 *
 * It is intentionally self-contained (rather than merging `vite.config.mts`)
 * so the test runner does not pull in the dev server / proxy settings. It
 * reuses the same `@` / `src` path aliases and the global SCSS preprocessor
 * options as `vite.config.mts`, so `@/` imports and `.scss` files resolve the
 * same way inside tests as in the app.
 */
export default defineConfig({
  plugins: [svgr(), nodePolyfills(), react()],
  resolve: {
    alias: {
      buffer: "buffer",
      "@": resolve(__dirname, "src"),
      src: resolve(__dirname, "src"),
      "@tests": resolve(__dirname, "tests"),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
            @use "src/assets/styles/typography.scss" as *;
            @use "src/assets/styles/variables.scss" as *;
            @use "src/assets/styles/mixins.scss" as *;
            @use "src/covaltech-react-ui/index.scss" as *;
            @use "src/assets/styles/react-ui.config.scss" as *;
        `,
      },
    },
    modules: {
      generateScopedName: "[name]__[local]__[hash:base64:5]",
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setupEnv.ts"],
    css: true,
    include: ["tests/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "html", "json-summary"],
      reportsDirectory: "./coverage",
      all: true,
      include: ["src/components/**/*.{ts,tsx}", "src/pages/**/*.{ts,tsx}"],
      exclude: [
        "**/*.scss",
        "**/*.test.{ts,tsx}",
        "**/types.ts",
        "**/constants.ts",
      ],
    },
  },
});
