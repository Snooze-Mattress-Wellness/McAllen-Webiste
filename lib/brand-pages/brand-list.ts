/* The brand-page registry list: every brand page this site has or plans, with its menu name, path, menu order and
   whether it is live. Kept apart from the brand configs (registry.ts) so light code can read it: the header's
   "Our Brands" menu group, the footer, the language switch, the GA4 content group, llms.txt and /api/revalidate.

   live: true = the page is built and may be linked. TypeScript then requires the brand's config (registry.ts BRANDS)
   and its client parts (components/brand-pages/parts.ts), and a test requires the store's brand_pages entry, so nothing
   links a brand page that isn't built. Planned brands stay live: false (never linked). Adding Helix or Brooklyn
   Bedding later = one entry here, live: false until its page is built. */
export type BrandListEntry = { key: string; name: string; path: string; order: number; live: boolean };

export const BRAND_LIST = [
  { key: 'tempur-pedic', name: 'Tempur-Pedic', path: '/tempur-pedic', order: 1, live: true },
  { key: 'beautyrest', name: 'Beautyrest', path: '/beautyrest', order: 2, live: true },
  { key: 'serta', name: 'Serta', path: '/serta', order: 3, live: true },
  { key: 'sealy', name: 'Sealy', path: '/sealy', order: 4, live: true },
  { key: 'stearns-foster', name: 'Stearns & Foster', path: '/stearns-foster', order: 5, live: true },
  { key: 'copper-by-spring-air', name: 'Copper by Spring Air', path: '/copper-by-spring-air', order: 6, live: true },
] as const satisfies readonly BrandListEntry[];

type LiveEntry = Extract<(typeof BRAND_LIST)[number], { live: true }>;

/** A live (built) brand page's key: its folder name. */
export type BrandKey = LiveEntry['key'];

/** The live brand pages, in menu order (the "Our Brands" group, the footer, llms.txt). */
export const LIVE_BRANDS: readonly LiveEntry[] = BRAND_LIST.filter((b): b is LiveEntry => b.live).sort((a, b) => a.order - b.order);
export const BRAND_KEYS: readonly BrandKey[] = LIVE_BRANDS.map((b) => b.key);
/** ['/tempur-pedic', '/beautyrest', '/serta', '/sealy', '/stearns-foster', '/copper-by-spring-air'] */
export const BRAND_PAGE_PATHS: readonly string[] = LIVE_BRANDS.map((b) => b.path);
/** Every listed brand page's path, live or planned (POST /api/revalidate accepts these). */
export const ALL_BRAND_PATHS: readonly string[] = BRAND_LIST.map((b) => b.path);
