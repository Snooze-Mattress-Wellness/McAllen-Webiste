/* A brand page's offers at one store, from the promo feed (read by lib/snooze/feed.ts getPromoFeed, which throws when
   the feed can't be read, so ISR keeps the last good page). The feed is the only source: nothing live = no promo block;
   no always-on offers = no tiles and no offer FAQs. There is no static fallback. Next-free, so Node's test runner can
   load it. */
import type { AlwaysOnOffer, BrandConfig, PromoFeed, Promotion } from './types.ts';
import { selectAlwaysOn, selectPromotions, todayInStoreTime } from './promo.ts';

export type Offers = { promos: Promotion[]; tiles: AlwaysOnOffer[] };

/** The vendor promotions live today (store time) for this brand at this store, and the store's always-on offers, in
    feed order. */
export function brandOffers(brand: BrandConfig, storeId: string, feed: PromoFeed, today: string = todayInStoreTime()): Offers {
  return {
    promos: selectPromotions(feed, { vendor: brand.vendor, storeId, today }),
    tiles: selectAlwaysOn(feed, { storeId }),
  };
}
