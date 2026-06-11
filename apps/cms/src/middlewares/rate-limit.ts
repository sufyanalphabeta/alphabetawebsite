interface Ctx {
  request: { ip?: string; body?: unknown };
  status: number;
  body: unknown;
}

const counters = new Map<string, { count: number; resetAt: number }>();

const middleware = () => async (ctx: Ctx, next: () => Promise<void>) => {
  const ip  = String(ctx.request.ip ?? "unknown");
  const now = Date.now();
  let rec = counters.get(ip);
  if (!rec || now > rec.resetAt) {
    rec = { count: 0, resetAt: now + 60_000 };
    counters.set(ip, rec);
  }
  rec.count++;
  if (rec.count > 15) {
    ctx.status = 429;
    ctx.body   = { error: { status: 429, name: "TooManyRequests", message: "Rate limit exceeded" } };
    return;
  }
  const body = ctx.request.body as Record<string, unknown> | undefined;
  if (body?.data && (body.data as Record<string, unknown>).website) {
    ctx.status = 200; ctx.body = { data: { id: 0 } }; return;
  }
  await next();
};

export default middleware;
