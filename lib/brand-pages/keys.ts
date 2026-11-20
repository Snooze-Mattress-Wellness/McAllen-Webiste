/* The brand pages this site has. Each key is the brand's folder name and its page's path (/<key>). Kept apart from the
   brand configs so light code (the header's language switch, the GA4 content group, llms.txt) knows the brand-page paths
   without loading the configs. Adding a key makes TypeScript require its config (registry.ts) and its sections
   (components/brand-pages/sections.ts). */
export const BRAND_KEYS = ['tempur-pedic'] as const;
export type BrandKey = (typeof BRAND_KEYS)[number];

/** '/tempur-pedic' */
export const BRAND_PAGE_PATHS: readonly string[] = BRAND_KEYS.map((k) => `/${k}`);
