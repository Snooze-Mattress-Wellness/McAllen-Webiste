/* The brand registry: every brand page the module can render. Adding a brand = its config here (lib/brand-pages/brands/
   <key>.ts), its vendor sections (components/brand-pages/<key>/, listed in components/brand-pages/sections.ts), its
   assets (public/brands/<key>/) and the store's entry in the location config (brand_pages.<key>). No new logic. */
import type { BrandConfig, BrandKey } from './types.ts';
import { TEMPUR_PEDIC } from './brands/tempur-pedic.ts';

export const BRANDS: Readonly<Record<BrandKey, BrandConfig>> = {
  'tempur-pedic': TEMPUR_PEDIC,
};

export { BRAND_KEYS, BRAND_PAGE_PATHS, LIVE_BRANDS } from './brand-list.ts';
