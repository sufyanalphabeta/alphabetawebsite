export default ({ env }: { env: (k: string, d?: string) => string }) => ({
  host:    env("HOST", "0.0.0.0"),
  port:    Number(env("PORT", "1337")),
  url:     env("PUBLIC_URL", "http://localhost:1337"),
  app:     { keys: env("APP_KEYS", "build,build,build,build").split(",") },
  webhooks:{ populateRelations: false },
});
