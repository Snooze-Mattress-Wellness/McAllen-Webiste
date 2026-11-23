/* A brand page (/tempur-pedic; Sealy and Stearns & Foster to follow) inside the site's own header and footer: the brand's
   vendor sections, the store's local sections and the offers, in the order the brand config lists them. The brand's
   stylesheets load on this route only (React hoists them into <head>); every selector in them is scoped to the brand's
   wrapper class, so nothing leaks into the site header or footer. */
import { Fragment, type ReactNode } from 'react';
import { BRANDS } from '@/lib/brand-pages/registry';
import { brandPage } from '@/lib/brand-pages/page';
import { brandPageJsonLd, type JsonLd } from '@/lib/brand-pages/jsonld';
import { pageFaq } from '@/lib/brand-pages/faq';
import { brandOffers } from '@/lib/brand-pages/offers';
import type { BrandKey, BrandLocation, PromoFeed, SectionKey } from '@/lib/brand-pages/types';
import { BRAND_SECTIONS } from './sections';
import { Faq, Promo, Visit, WhyBuy } from './local';
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
  const own = BRAND_SECTIONS[key];
  const page = brandPage(brand, l);
  // the offers: the vendor promotions live today (store time) and the always-on tiles, in feed order
  const { promos, tiles } = brandOffers(brand, l.store_id, feed);
  // the store's local questions, then the offers' own questions (always_on[].faq)
  const faq = pageFaq(page.faq, tiles, brand.name);
  const props = { brand, location: l, img: page.img };

  const section = (s: SectionKey): ReactNode => {
    switch (s) {
      case 'hero': return <own.Hero {...props} />;
      case 'visit': return <Visit brand={brand} location={l} />;
      case 'promo': return <Promo brand={brand} location={l} promos={promos} img={page.img} />;
      case 'vendor': return <own.Vendor {...props} />;
      case 'why-buy': return <WhyBuy brand={brand} location={l} tiles={tiles} />;
      case 'faq': return <Faq brand={brand} location={l} faq={faq} />;
      case 'disclaimers': return <own.Disclaimers {...props} />;
    }
  };

  return (
    <>
      {renderSchema?.(brandPageJsonLd(brand, l, faq))}
      {brand.stylesheets.map((f) => <link key={f} rel="stylesheet" href={`${page.css}${f}`} precedence={brand.key} />)}
      {/* the hero background (CSS) for each layout, fetched early as in the package's <head> */}
      {brand.preloads.map((p) => <link key={p.file} rel="preload" as="image" href={`${page.img}${p.file}`} media={p.media} />)}
      {/* data-snz-store-id: public/snz-events.js adds it to phone_click and directions_click on this page */}
      <div className={`${brand.wrapper_class} ${own.fontClass}`} data-snz-store-id={l.store_id}>
        {brand.sections.map((s) => <Fragment key={s}>{section(s)}</Fragment>)}
      </div>
      <own.Scripts {...props} js={page.js} />
      {/* view_promotion, select_promotion, cta_click (dataLayer only) */}
      <BrandTracking
        storeId={l.store_id}
        brand={brand.vendor}
        wrapperClass={brand.wrapper_class}
        promoSlot={brand.promo_slot}
        promos={promos.map((b) => ({ block: b.block, headline: b.headline, event: b.event }))}
        ctaSelector={brand.tracking.cta_selector}
        ctaSections={brand.tracking.cta_sections}
      />
    </>
  );
}
