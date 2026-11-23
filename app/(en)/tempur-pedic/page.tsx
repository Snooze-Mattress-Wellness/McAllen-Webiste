// Tempur-Pedic brand page (/tempur-pedic), in the (en) route group so it renders inside the English header, ticker and
// footer. The page itself is the brand-page module (components/brand-pages/, lib/brand-pages/); this route only picks the
// brand and the store (lib/brand-pages/site.ts, the adapter that reads the site's location data) and reads the promo
// feed on the server (lib/snooze/feed.ts, shared with the Sales page). English only: /es/tempur-pedic 308s here (next.config.ts).
import type { Metadata } from 'next';
import { BrandPage } from '@/components/brand-pages/BrandPage';
import { PageSchema } from '@/components/PageSchema';
import { BRANDS } from '@/lib/brand-pages/registry';
import { brandPageMetadata } from '@/lib/brand-pages/metadata';
import { getPromoFeed } from '@/lib/snooze/feed';
import { BRAND_LOCATION } from '@/lib/brand-pages/site';

/* Static, regenerated at most hourly (ISR): the offers follow the Offer Calendar feed (SNOOZE_PROMO_FEED_URL) within
   about an hour, dated promotions come and go on their own, and POST /api/revalidate refreshes it at once. If the feed
   can't be read, getPromoFeed() throws: the build fails, and a regeneration fails so ISR keeps serving the last good
   page. There is no static fallback. */
export const revalidate = 3600;

export const metadata: Metadata = brandPageMetadata(BRANDS['tempur-pedic'], BRAND_LOCATION);

export default async function TempurPedicPage() {
  const feed = await getPromoFeed();
  return (
    <BrandPage
      brand="tempur-pedic"
      location={BRAND_LOCATION}
      feed={feed}
      // the page's one JSON-LD graph (site nodes + WebPage, BreadcrumbList, FAQPage)
      renderSchema={(items) => <PageSchema items={items} locale="en" />}
    />
  );
}
