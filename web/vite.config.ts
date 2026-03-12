import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { execSync } from "child_process";
import { resolve } from "path";

export default defineConfig({
  plugins: [
    {
      name: "build-tasks-json",
      apply: "build",
      enforce: "pre",
      async buildStart() {
        console.log("📝 Building tasks.json from board.md...");
        try {
          execSync(`bun run ${resolve(import.meta.dir, "scripts/build-tasks-json.ts")}`, {
            stdio: "inherit",
          });
        } catch (error) {
          console.error("Failed to build tasks.json", error);
        }
      },
    },
    react(),
  ],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
