/* POST /api/revalidate: lets the Offer Calendar's Apps Script refresh a brand page as soon as the sheet changes,
   instead of waiting for the hourly ISR refresh. The request must carry the shared secret (REVALIDATE_SECRET) in the
   x-revalidate-secret header; without it, with a wrong one, or when the server has no secret set, the answer is 401.
   Only brand-page paths can be refreshed (else 400). The secret is compared in constant time and never logged.
   Next-free, so Node's test runner can drive it; app/api/revalidate/route.ts passes in revalidatePath(). */
import { createHash, timingSafeEqual } from 'node:crypto';

/** The brand pages (now and planned) a refresh may target: the path itself or anything under it. */
export const REVALIDATE_ROOTS = ['/tempur-pedic', '/sealy', '/stearns-foster'] as const;

export function isRevalidatablePath(path: unknown): path is string {
  if (typeof path !== 'string' || path.length > 200) return false;
  return REVALIDATE_ROOTS.some((root) => path === root || (path.startsWith(`${root}/`) && /^[a-z0-9\-/]+$/.test(path) && !path.includes('//')));
}

const sameSecret = (given: string, expected: string) => {
  // hash first, so the comparison takes the same time whatever the lengths
  const a = createHash('sha256').update(given).digest(), b = createHash('sha256').update(expected).digest();
  return timingSafeEqual(a, b);
};

export async function handleRevalidate(req: Request, opts: { secret: string | undefined; revalidate: (path: string) => void; now?: () => Date }): Promise<Response> {
  const given = req.headers.get('x-revalidate-secret');
  if (!opts.secret || !given || !sameSecret(given, opts.secret)) return Response.json({ revalidated: false, error: 'unauthorized' }, { status: 401 });
  let body: unknown;
  try { body = await req.json(); } catch { return Response.json({ revalidated: false, error: 'body must be JSON: {"path":"/tempur-pedic"}' }, { status: 400 }); }
  const path = typeof body === 'object' && body !== null ? (body as { path?: unknown }).path : undefined;
  if (!isRevalidatablePath(path)) return Response.json({ revalidated: false, error: `path must be ${REVALIDATE_ROOTS.join(', ')} or a page under one of them` }, { status: 400 });
  opts.revalidate(path);
  return Response.json({ revalidated: true, path, at: (opts.now ? opts.now() : new Date()).toISOString() });
}
