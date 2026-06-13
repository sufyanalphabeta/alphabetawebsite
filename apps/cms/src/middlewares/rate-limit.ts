interface Ctx {
  request: { ip?: string; body?: unknown; method?: string };
  status: number;
  body: unknown;
}

const readCounters  = new Map<string, { count: number; resetAt: number }>();
const writeCounters = new Map<string, { count: number; resetAt: number }>();

function isExceeded(
  map: Map<string, { count: number; resetAt: number }>,
  key: string,
  limit: number,
): boolean {
  const now = Date.now();
  let rec = map.get(key);
  if (!rec || now > rec.resetAt) {
    rec = { count: 0, resetAt: now + 60_000 };
    map.set(key, rec);
  }
  rec.count++;
  return rec.count > limit;
}

const middleware = () => async (ctx: Ctx, next: () => Promise<void>) => {
  const ip     = String(ctx.request.ip ?? "unknown");
  const method = String(ctx.request.method ?? "GET").toUpperCase();
  const isWrite = method !== "GET" && method !== "HEAD" && method !== "OPTIONS";

  // Read endpoints: 300 req/min (homepage fires ~6 parallel calls)
  // Write endpoints: 20 req/min (contact/demo form submissions)
  const exceeded = isWrite
    ? isExceeded(writeCounters, ip, 20)
    : isExceeded(readCounters,  ip, 300);

  if (exceeded) {
    ctx.status = 429;
    ctx.body   = { error: { status: 429, name: "TooManyRequests", message: "Rate limit exceeded" } };
    return;
  }

  // Honeypot: silently accept bot form submissions that fill the 'website' trap field
  const body = ctx.request.body as Record<string, unknown> | undefined;
  if (body?.data && (body.data as Record<string, unknown>).website) {
    ctx.status = 200;
    ctx.body   = { data: { id: 0 } };
    return;
  }

  await next();
};

export default middleware;
