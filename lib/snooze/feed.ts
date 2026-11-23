// lib/snooze/feed.ts – one cached fetch of the Offer Calendar feed, shared by brand pages and the Sales page.
// IMPORTANT: if the feed can't be read, THROW. Next.js then keeps serving the last good page
// instead of caching a page with no offers (that is what an empty "promos": [] looks like).
export type PromoFeed = {
  version: number; generated_at: string; stores: Record<string, { city: string; brands: string[] }>;
  events?: { id: string; name: string; headline?: string; start: string; end: string }[];
  promotions: any[]; always_on: any[]; brands?: any[];
};

export async function getPromoFeed(): Promise<PromoFeed> {
  const url = process.env.SNOOZE_PROMO_FEED_URL; // the Apps Script /exec URL, set in Vercel for Production + Preview
  if (!url) throw new Error("SNOOZE_PROMO_FEED_URL is not set");
  const res = await fetch(url, { next: { revalidate: 3600, tags: ["promo-feed"] } });
  if (!res.ok) throw new Error(`Promo feed HTTP ${res.status}`);
  const feed = (await res.json()) as PromoFeed;
  if (!feed || !Array.isArray(feed.promotions)) throw new Error("Promo feed: bad shape");
  return feed;
}
