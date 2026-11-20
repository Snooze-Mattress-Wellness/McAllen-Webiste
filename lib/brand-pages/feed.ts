/* The promo feed: reading it, checking its shape, and turning it into a brand page's offers. The feed (the Offer
   Calendar's Apps Script web app, PROMO_FEED_URL) carries offers only and is the source of truth whenever it can be
   read: an empty feed means no promo block, no offer tiles and no offer FAQs. The brand's static fallback offers show
   only when the feed cannot be read (or is not a feed) and no copy of it is cached. Feed problems never fail the page.
   Next-free, so Node's test runner can load it; lib/brand-pages/feed-loader.ts adds Next's cache. */
import type { AlwaysOnOffer, BrandConfig, PromoFeed, Promotion } from './types.ts';
import { selectAlwaysOn, selectPromotions, todayInStoreTime } from './promo.ts';

/** re-read the feed at most hourly */
export const FEED_REVALIDATE = 3600;
/** give up on a feed request after 8 seconds */
export const FEED_TIMEOUT_MS = 8000;

const isObj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);
const isStr = (x: unknown): x is string => typeof x === 'string';

/** The feed's shape (version, stores, promotions, always_on and the fields the page reads); throws what is wrong. */
export function validateFeed(json: unknown): PromoFeed {
  if (!isObj(json)) throw new Error('not a JSON object');
  if (typeof json.version !== 'number') throw new Error('no numeric "version"');
  if (!isObj(json.stores)) throw new Error('no "stores" object');
  if (!Array.isArray(json.promotions)) throw new Error('no "promotions" array');
  if (!Array.isArray(json.always_on)) throw new Error('no "always_on" array');
  for (const [id, s] of Object.entries(json.stores)) if (!isObj(s) || !Array.isArray(s.brands)) throw new Error(`stores.${id}: no "brands" list`);
  json.promotions.forEach((b: unknown, i) => {
    if (!isObj(b) || ![b.block, b.vendor, b.event, b.start, b.end, b.headline].every(isStr) || !Array.isArray(b.items)) throw new Error(`promotions[${i}]: missing block/vendor/event/start/end/headline/items`);
    b.items.forEach((it: unknown, k) => { if (!isObj(it) || ![it.text, it.start, it.end].every(isStr)) throw new Error(`promotions[${i}].items[${k}]: missing text/start/end`); });
  });
  json.always_on.forEach((o: unknown, i) => { if (!isObj(o) || ![o.title, o.body].every(isStr)) throw new Error(`always_on[${i}]: missing title/body`); });
  return json as unknown as PromoFeed;
}

/** Fetches and checks the feed (follows the Apps Script /exec redirect; 8-second timeout). Throws on any problem. */
export async function fetchFeed(url: string, fetchImpl: typeof fetch = fetch): Promise<PromoFeed> {
  const res = await fetchImpl(url, {
    next: { revalidate: FEED_REVALIDATE },
    redirect: 'follow',
    signal: AbortSignal.timeout(FEED_TIMEOUT_MS),
  } as RequestInit);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return validateFeed(await res.json());
}

/** The feed for the page, or null when it cannot be had: no URL, or the read failed and no copy is cached. A failure
    is logged as a warning (never the URL's query, never a secret) and never thrown. */
export async function resolveFeed(
  url: string | undefined,
  read: (url: string) => Promise<PromoFeed>,
  lastGood: { get: () => PromoFeed | null; set: (f: PromoFeed) => void },
  warn: (msg: string) => void = console.warn,
): Promise<PromoFeed | null> {
  if (!url) { warn('[brand-pages] PROMO_FEED_URL is not set: showing the static fallback offers'); return null; }
  let host = 'the feed';
  try { host = new URL(url).host; } catch { /* reported by the read below */ }
  try {
    const feed = await read(url);
    lastGood.set(feed);
    return feed;
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    const cached = lastGood.get();
    if (cached) { warn(`[brand-pages] promo feed (${host}) unavailable (${reason}): using the last good copy`); return cached; }
    warn(`[brand-pages] promo feed (${host}) unavailable (${reason}) and no cached copy: showing the static fallback offers`);
    return null;
  }
}

export type Offers = { promos: Promotion[]; tiles: AlwaysOnOffer[]; source: 'feed' | 'fallback' };

/** A brand page's offers at one store: from the feed when there is one (even when it is empty), else the brand's
    static fallback (no promo block, its always-on tiles). Feed order is kept everywhere. */
export function brandOffers(brand: BrandConfig, storeId: string, feed: PromoFeed | null, today: string = todayInStoreTime()): Offers {
  if (!feed) return { promos: [], tiles: [...brand.fallback.always_on], source: 'fallback' };
  return {
    promos: selectPromotions(feed, { vendor: brand.vendor, storeId, today }),
    tiles: selectAlwaysOn(feed, { storeId }),
    source: 'feed',
  };
}
