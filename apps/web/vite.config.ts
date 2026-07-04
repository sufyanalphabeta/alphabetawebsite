import { defineConfig }       from "vite";
import react                  from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tailwindcss            from "@tailwindcss/vite";
import path                   from "path";

/** Vite plugin: intercepts Content-Type headers and ensures charset=utf-8
 *  is always appended to text/html responses. */
function htmlCharsetPlugin() {
  return {
    name: "html-charset",
    configureServer(server: { middlewares: { use: Function } }) {
      server.middlewares.use((_req: unknown, res: { setHeader: Function; getHeader: Function }, next: Function) => {
        const orig = res.setHeader.bind(res) as (name: string, value: string) => void;
        res.setHeader = (name: string, value: string) => {
          if (
            typeof name === "string" &&
            name.toLowerCase() === "content-type" &&
            typeof value === "string" &&
            value.startsWith("text/html") &&
            !value.includes("charset")
          ) {
            return orig(name, `${value}; charset=utf-8`);
          }
          return orig(name, value);
        };
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [
    TanStackRouterVite({
      autoCodeSplitting:  true,
      routesDirectory:    "./app/routes",
      generatedRouteTree: "./app/routeTree.gen.ts",
    }),
    react(),
    tailwindcss(),
    htmlCharsetPlugin(),
  ],
  resolve: {
    alias: { "~": path.resolve(__dirname, "app") },
  },
  server: {
    port: 3000,
  },
});
