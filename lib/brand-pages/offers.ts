/* A brand page's offers at one store, from the promo feed (read by lib/snooze/feed.ts getPromoFeed, which throws when
   the feed can't be read, so ISR keeps the last good page). The selection is the package's shared offer logic
   (snooze-promo.js v4, unchanged): the vendor's promotions live today in store time, and the store's always-on offers,
   in feed order. There is no static fallback. */
import Promo from './snooze-promo.js';
import type { AlwaysOnOffer, BrandJson, PromoFeed, Promotion } from './types.ts';

export type Offers = { promos: Promotion[]; tiles: AlwaysOnOffer[] };

export function brandOffers(brand: BrandJson, storeId: string, feed: PromoFeed, today: string = Promo.todayInStoreTime()): Offers {
  return {
    promos: Promo.selectPromotions(feed, { vendor: brand.vendor, storeId, today }),
    tiles: Promo.selectAlwaysOn(feed, { storeId }),
  };
}

export { Promo };
