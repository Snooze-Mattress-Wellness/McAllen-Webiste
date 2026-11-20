// POST /api/revalidate { "path": "/tempur-pedic" } with header x-revalidate-secret: <REVALIDATE_SECRET>
// → revalidatePath(path) → { revalidated: true, path, at }. 401 without the right secret (or when REVALIDATE_SECRET is
// unset), 400 for any path outside the brand pages. Called by the Offer Calendar's Apps Script when the sheet changes;
// the page otherwise refreshes hourly (ISR). Logic and checks: lib/brand-pages/revalidate.ts. The secret is never logged.
import { revalidatePath } from 'next/cache';
import { handleRevalidate } from '@/lib/brand-pages/revalidate';

export const dynamic = 'force-dynamic';

export function POST(req: Request) {
  return handleRevalidate(req, {
    secret: process.env.REVALIDATE_SECRET,
    revalidate: (path) => {
      revalidatePath(path);
      console.info(`[revalidate] ${path}`);
    },
  });
}
