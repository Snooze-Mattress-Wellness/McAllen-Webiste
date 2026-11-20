/* A brand page at one store: the brand config plus the store's entry for it (path, asset folder, local FAQ). */
import type { BrandConfig, BrandLocation } from './types.ts';

export function brandPage(brand: BrandConfig, loc: BrandLocation) {
  const page = loc.brand_pages[brand.key];
  if (!page) throw new Error(`No brand_pages["${brand.key}"] in the location config of store "${loc.store_id}"`);
  return { ...page, url: `${loc.site_url}${page.page_path}`, img: `${brand.asset_base}img/`, css: `${brand.asset_base}css/`, js: `${brand.asset_base}js/` };
}
