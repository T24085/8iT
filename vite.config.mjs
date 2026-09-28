import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const root = path.dirname(fileURLToPath(import.meta.url));
const isGithubPages = process.env.GITHUB_ACTIONS === "true";
const siteBase = process.env.VITE_BASE_PATH ?? (isGithubPages ? "/8iT/" : "/");

export default defineConfig({
  base: siteBase,
  build: {
    outDir: "dist/client",
    rollupOptions: {
      input: {
        main: path.resolve(root, "index.html"),
        shop: path.resolve(root, "shop.html"),
        admin: path.resolve(root, "admin.html"),
        stats: path.resolve(root, "stats.html"),
      },
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local", "taylor.tail5d09b2.ts.net"],
    warmup: {
      clientFiles: ["./src/main.jsx"],
    },
  },
  plugins: [react()],
});
