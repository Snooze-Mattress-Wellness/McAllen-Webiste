// Stearns & Foster brand page (/stearns-foster), in the (en) route group so it renders inside the English header, ticker and
// footer. Same as /tempur-pedic: the brand-page module renders the package's brands/stearns-foster/template.html with the
// shared partials, for this store (lib/brand-pages/site.ts), with the offers from the promo feed (vendor "Stearns & Foster").
// English only: /es/stearns-foster 308s here (next.config.ts).
import type { Metadata } from 'next';
import { BrandPage } from '@/components/brand-pages/BrandPage';
import { PageSchema } from '@/components/PageSchema';
import { BRANDS } from '@/lib/brand-pages/registry';
import { brandPageMetadata } from '@/lib/brand-pages/metadata';
import { getPromoFeed } from '@/lib/snooze/feed';
import { BRAND_LOCATION } from '@/lib/brand-pages/site';

/* Static, regenerated at most hourly (ISR), like /tempur-pedic: the offers follow the Offer Calendar feed within about
   an hour and POST /api/revalidate refreshes it at once. If the feed can't be read, getPromoFeed() throws: the build
   fails, and a regeneration fails so ISR keeps serving the last good page. */
export const revalidate = 3600;

export const metadata: Metadata = brandPageMetadata(BRANDS['stearns-foster'], BRAND_LOCATION);

export default async function StearnsFosterPage() {
  const feed = await getPromoFeed();
  return (
    <BrandPage
      brand="stearns-foster"
      location={BRAND_LOCATION}
      feed={feed}
      // the page's one JSON-LD graph (site nodes + WebPage, BreadcrumbList, FAQPage)
      renderSchema={(items) => <PageSchema items={items} locale="en" />}
    />
  );
}
