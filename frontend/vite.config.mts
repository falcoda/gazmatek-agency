import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [svgr(), nodePolyfills(), react()],
  server: {
    port: 3001,
    proxy: {
      "/api": {
        target: "http://localhost:4001",
        changeOrigin: true,
      },
    },
  },
  build: {
    sourcemap: true,
    outDir: "build",
  },
  resolve: {
    alias: {
      buffer: "buffer",
      src: resolve("src"),
      "@": resolve(__dirname, "src"),
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
});
