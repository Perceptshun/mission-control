import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { execSync } from "child_process";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    {
      name: "build-tasks-json",
      apply: "build",
      enforce: "pre",
      async buildStart() {
        console.log("📝 Building tasks.json from board.md...");
        try {
          const scriptPath = resolve(__dirname, "scripts/build-tasks-json.ts");
          execSync(`bun run "${scriptPath}"`, {
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
  base: '/mission-control/',
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
