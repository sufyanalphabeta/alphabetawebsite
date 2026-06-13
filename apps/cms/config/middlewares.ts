export default ({ env }: { env: (k: string, d?: string) => string }) => [
  "strapi::logger",
  "strapi::errors",
  {
    name: "strapi::security",
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "connect-src":  ["'self'", "https:"],
          "img-src":      ["'self'", "data:", "blob:", "https://market-assets.strapi.io"],
          "media-src":    ["'self'", "data:", "blob:", "https://market-assets.strapi.io"],
          // upgradeInsecureRequests deliberately omitted — HTTPS enforced at nginx layer
        },
      },
    },
  },
  {
    name: "strapi::cors",
    config: {
      // Prod: CORS_ORIGINS=https://alphabeta.com.ly,https://www.alphabeta.com.ly
      // Dev:  CORS_ORIGINS=http://localhost:3000
      origin:          env("CORS_ORIGINS", "http://localhost:3000").split(","),
      methods:         ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"],
      headers:         ["Content-Type", "Authorization", "Origin", "Accept"],
      keepHeaderOnError: true,
    },
  },
  // strapi::poweredBy removed — avoids leaking server stack in X-Powered-By header
  "strapi::query",
  "strapi::body",
  "strapi::session",
  "strapi::favicon",
  "strapi::public",
];
