// Tempur-Pedic brand page (/tempur-pedic), in the (en) route group so it renders inside the English header, ticker and
// footer. The page itself is the brand-page module (components/brand-pages/, lib/brand-pages/); this route only picks the
// brand and the store (lib/brand-pages/site.ts, the adapter that reads the site's location data). English only:
// /es/tempur-pedic 308s here (next.config.ts).
import type { Metadata } from 'next';
import { BrandPage } from '@/components/brand-pages/BrandPage';
import { PageSchema } from '@/components/PageSchema';
import { BRANDS } from '@/lib/brand-pages/registry';
import { brandPageMetadata } from '@/lib/brand-pages/metadata';
import { BRAND_LOCATION } from '@/lib/brand-pages/site';

/* Static, regenerated at most hourly (ISR), so dated offers come and go on their own without a redeploy. */
export const revalidate = 3600;

export const metadata: Metadata = brandPageMetadata(BRANDS['tempur-pedic'], BRAND_LOCATION);

export default function TempurPedicPage() {
  return (
    <BrandPage
      brand="tempur-pedic"
      location={BRAND_LOCATION}
      // the page's one JSON-LD graph (site nodes + WebPage, BreadcrumbList, FAQPage)
      renderSchema={(items) => <PageSchema items={items} locale="en" />}
    />
  );
}
