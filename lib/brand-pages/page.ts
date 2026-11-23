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
