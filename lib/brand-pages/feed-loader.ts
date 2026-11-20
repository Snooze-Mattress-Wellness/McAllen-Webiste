/* Server-side read of the promo feed for a brand page, with Next's cache around it.

   unstable_cache keeps the last good feed: it is re-read at most hourly (FEED_REVALIDATE, the page's ISR period), a
   failed or invalid re-read keeps serving the cached copy (Next returns the stale value when the refresh throws), and
   an invalid feed is never cached (validateFeed throws inside). revalidatePath() on the page (POST /api/revalidate)
   also drops this entry, so the next render reads the sheet's latest feed. The fetch inside is the one the handoff
   specifies (next.revalidate 3600, redirects followed, 8-second timeout); Next treats a fetch inside unstable_cache as
   no-store, so the feed is cached once, here. When nothing is cached and the read fails, this server instance's last
   good copy is used, else the brand's static fallback (feed.ts resolveFeed). */
import { unstable_cache } from 'next/cache';
import type { PromoFeed } from './types.ts';
import { FEED_REVALIDATE, fetchFeed, resolveFeed } from './feed.ts';

const cachedFeed = unstable_cache((url: string) => fetchFeed(url), ['brand-pages-promo-feed'], { revalidate: FEED_REVALIDATE, tags: ['promo-feed'] });

let lastGood: PromoFeed | null = null;

/** The promo feed (PROMO_FEED_URL), or null for the static fallback. Never throws. */
export function loadPromoFeed(url: string | undefined = process.env.PROMO_FEED_URL): Promise<PromoFeed | null> {
  return resolveFeed(url, cachedFeed, { get: () => lastGood, set: (f) => { lastGood = f; } });
}
