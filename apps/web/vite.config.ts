import { defineConfig }       from "vite";
import react                  from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tailwindcss            from "@tailwindcss/vite";
import path                   from "path";

export default defineConfig({
  plugins: [
    TanStackRouterVite({
      autoCodeSplitting:  true,
      routesDirectory:    "./app/routes",
      generatedRouteTree: "./app/routeTree.gen.ts",
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: { "~": path.resolve(__dirname, "app") },
  },
  server: {
    port: 3000,
  },
});
