// app.config.ts
import { defineConfig } from "@tanstack/start/config";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
var app_config_default = defineConfig({
  vite: {
    plugins: [
      tailwindcss(),
      TanStackRouterVite({ autoCodeSplitting: true })
    ]
  },
  server: { preset: "node-server" },
  routers: {
    ssr: { entry: "./app/ssr.tsx" },
    client: { entry: "./app/client.tsx" }
  }
});
export {
  app_config_default as default
};
