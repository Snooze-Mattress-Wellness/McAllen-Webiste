/* A brand page (/tempur-pedic; Beautyrest, Sealy and Stearns & Foster to follow) inside the site's own header and
   footer. The body is the package's (snooze-local-pages v4): the brand's template.html with the shared partials (visit,
   promo, why, faq) filled from the store's config, the promo feed and the brand's brand.json (lib/brand-pages/render.ts),
   so every brand's local sections are the same markup. The brand's stylesheets (brand.json "styles", in order: vendor CSS,
   then the shared snooze-brand-local.css last) load on this route only (React hoists them into <head>); every selector in
   them is scoped to the template's wrapper, so nothing leaks into the site header or footer.
   The package's browser scripts are not loaded: the offers are rendered on the server (snooze-promo.js runs there), and a
   brand's own scripts are ported to client components (components/brand-pages/parts.ts). */
import type { ReactNode } from 'react';
import { BRANDS } from '@/lib/brand-pages/registry';
import { assetUrl, brandPage } from '@/lib/brand-pages/page';
import { PARTIALS } from '@/lib/brand-pages/files';
import { renderBrandBody } from '@/lib/brand-pages/render';
import { brandPageJsonLd, type JsonLd } from '@/lib/brand-pages/jsonld';
import { brandFaq } from '@/lib/brand-pages/faq';
import { brandOffers } from '@/lib/brand-pages/offers';
import type { BrandKey, BrandLocation, PromoFeed } from '@/lib/brand-pages/types';
import { BRAND_PARTS } from './parts';
import BrandTracking from './BrandTracking';

type Props = {
  brand: BrandKey;
  location: BrandLocation;
  /** the promo feed (lib/snooze/feed.ts getPromoFeed: it throws when the feed can't be read, so there is always one) */
  feed: PromoFeed;
  /** renders the page's structured data (the site puts it in its one JSON-LD graph) */
  renderSchema?: (items: JsonLd[]) => ReactNode;
};

export function BrandPage({ brand: key, location: l, feed, renderSchema }: Props) {
  const brand = BRANDS[key];
  const own = BRAND_PARTS[key];
  const page = brandPage(brand, l);
  // the offers: the vendor promotions live today (store time) and the always-on tiles, in feed order
  const { promos, tiles } = brandOffers(brand.json, l.store_id, feed);
  // the local questions with the offers' own questions (always_on[].faq): one list for the accordion and the JSON-LD
  const faq = brandFaq(brand.json, l, tiles);
  const body = renderBrandBody({ brand: brand.json, template: brand.template, partials: PARTIALS, location: l, promos, tiles, faq });

  return (
    <>
      {renderSchema?.(brandPageJsonLd(brand, l, faq))}
      {brand.json.styles.map((s) => assetUrl(brand, s)).map((href) => <link key={href} rel="stylesheet" href={href} precedence={brand.key} />)}
      {/* brand.json preload_images (the hero image of each layout), fetched early as in the package's <head> */}
      {(brand.json.preload_images || []).map((p) => ({ href: assetUrl(brand, p.href), media: p.media })).map((p) => (
        <link key={p.href} rel="preload" as="image" href={p.href} media={p.media} />
      ))}
      {/* the font's CSS variable for the vendor CSS; data-snz-store-id: public/snz-events.js adds it to phone_click and
          directions_click on this page */}
      <div className={own.fontClass} data-snz-store-id={l.store_id} dangerouslySetInnerHTML={{ __html: body }} />
      {own.Scripts && <own.Scripts brand={brand} js={page.js} />}
      {/* view_promotion, select_promotion, cta_click (dataLayer only) */}
      <BrandTracking
        storeId={l.store_id}
        brand={brand.json.vendor}
        wrapperClass={brand.site.wrapper_class}
        promoSlot={brand.site.promo_slot}
        // promotion_name: the block's headline; a block with no headline row (Serta's) reports "<vendor> <event>"
        promos={promos.map((b) => ({ block: b.block, headline: b.headline || `${b.vendor} ${b.event}`, event: b.event }))}
        ctaSelector={brand.site.tracking.cta_selector}
        ctaSections={brand.site.tracking.cta_sections}
      />
    </>
  );
}
