export default ({ env }: { env: (k: string, d?: string) => string }) => ({
  i18n: {
    enabled: true,
    config: { defaultLocale: "ar", locales: ["ar", "en"] },
  },
  upload: {
    config: {
      provider: "local",
      providerOptions: { sizeLimit: 50 * 1024 * 1024 },
      actionOptions: { upload: {}, uploadStream: {}, delete: {} },
    },
  },
  email: {
    config: {
      provider: "nodemailer",
      providerOptions: {
        host:   env("SMTP_HOST",  "smtp.brevo.com"),
        port:   Number(env("SMTP_PORT", "587")),
        secure: false,
        auth:   { user: env("SMTP_USER", ""), pass: env("SMTP_PASS", "") },
      },
      settings: {
        defaultFrom:    env("EMAIL_FROM",    "noreply@alphabeta.ly"),
        defaultReplyTo: env("EMAIL_REPLY_TO","info@alphabeta.ly"),
      },
    },
  },
  "users-permissions": {
    config: {
      jwtSecret: env("JWT_SECRET", ""),
      jwt:       { expiresIn: "7d" },
    },
  },
});
