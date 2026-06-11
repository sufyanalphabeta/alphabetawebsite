export default ({ env }: { env: (k: string, d?: string) => string }) => ({
  connection: {
    client: "postgres",
    connection: {
      host:     env("DATABASE_HOST",     "127.0.0.1"),
      port:     Number(env("DATABASE_PORT", "5432")),
      database: env("DATABASE_NAME",     "alphabeta_dev"),
      user:     env("DATABASE_USERNAME", "alphabeta_user"),
      password: env("DATABASE_PASSWORD", "dev_password_local"),
      ssl: env("DATABASE_SSL", "false") === "true"
        ? { rejectUnauthorized: false } : false,
    },
    pool: { min: 2, max: 10, acquireTimeoutMillis: 30_000, idleTimeoutMillis: 30_000 },
    debug: env("DATABASE_DEBUG", "false") === "true",
  },
});
