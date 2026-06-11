export default ({ env }: { env: (k: string, d?: string) => string }) => ({
  auth:      { secret: env("ADMIN_JWT_SECRET") },
  apiToken:  { salt:   env("API_TOKEN_SALT") },
  transfer:  { token:  { salt: env("TRANSFER_TOKEN_SALT") } },
  flags:     { nps: false, promoteEE: false },
  locales:   ["ar", "en"],
});
