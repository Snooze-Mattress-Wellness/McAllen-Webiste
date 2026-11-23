/* A brand page at one store: the brand plus the store's entry for it (path, asset folder), and where its files are
   served. */
import type { BrandConfig, BrandLocation } from './types.ts';

export function brandPage(brand: BrandConfig, loc: BrandLocation) {
  const page = loc.brand_pages[brand.key];
  if (!page) throw new Error(`No brand_pages["${brand.key}"] in the location config of store "${loc.store_id}"`);
  const base = `/brands/${brand.json.slug}/`;
  return { ...page, url: `${loc.site_url}${page.page_path}`, base, img: `${base}img/`, css: `${base}css/`, js: `${base}js/` };
}

/** A brand.json styles / scripts / preload path ("{brand}css/x.css", "{shared}css/y.css") → the URL this site serves,
    after the brand's own path swaps (BrandSite.style_paths). */
export function assetUrl(brand: BrandConfig, p: string): string {
  const swap = brand.site.style_paths?.[p];
  if (swap) return swap;
  return p.replace('{shared}', '/brands/shared/').replace('{brand}', `/brands/${brand.json.slug}/`);
}

/** One of a brand's browser scripts, as components/brand-pages/BrandScripts.tsx loads it. */
export type BrandScript = { src: string; once: boolean };

/** brand.json scripts in order, as URLs, for brands whose vendor scripts run as delivered (Stearns & Foster, Sealy).
    Left out: the shared snooze-promo.js (the offers are rendered on the server; its browser fallback would fetch the
    empty data-snz-feed-url). once: a library (the shared Swiper bundle, a vendor *.min.js) that is loaded once per
    document; the brand's own page script runs again on every mount, on the markup of that mount. */
export function brandScripts(brand: BrandConfig): BrandScript[] {
  return brand.json.scripts
    .filter((p) => !p.endsWith('snooze-promo.js'))
    .map((p) => ({ src: assetUrl(brand, p), once: p.startsWith('{shared}') || p.endsWith('.min.js') }));
}
