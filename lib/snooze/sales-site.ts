/* This site's glue for the Sales page (/mattress-sales; the renderer is the package's lib/snooze/snooze-sales.js,
   unchanged):
   - getClearanceItems(): McAllen's real clearance items, from the same source and with the same visibility rules as the
     live /clearance page (lib/clearance.ts: the published sheet at CLEARANCE_URL, location "McAllen", not hidden, inside
     the 30-day listing window), minus anything sold (no SOLD-ribbon items) or out of stock, mapped to the shape
     snooze-sales.js wants. Any error → [] (the section and its H2 hide).
   - withLiveBrandLinks(feed): a copy of the feed whose brands[].brand_page_url is kept only when it is a brand page
     live on this site (lib/brand-pages/brand-list.ts); the other brand cards then show "Try {Brand} in store" →
     booking, the renderer's own fallback.
   - withoutBareProducts(jsonld): the Sales page's JSON-LD without Product nodes that Google cannot use (see below). */
import { getClearance, isVisible, SETTINGS, type ClearanceSettings, type Listing } from '../clearance.ts';
import { BRAND_PAGE_PATHS } from '../brand-pages/brand-list.ts';

export type SalesClearanceItem = {
  id: string;
  brand: string;
  name: string;
  size: string;
  price: number;
  retail: number;
  savings_pct: number;
  qty: number;
  label: 'Floor model' | 'Clearance';
  image: string;
  url: string;
};

/** round((retail − sale) / retail × 100); 0 when there is no retail price or it isn't above the sale price */
export const savingsPct = (retail: number, sale: number) => (retail > 0 && retail > sale ? Math.round(((retail - sale) / retail) * 100) : 0);

/** "Floor model" when the sheet's condition mentions "floor" (any case), else "Clearance" */
export const clearanceLabel = (condition: string): SalesClearanceItem['label'] => (/floor/i.test(condition) ? 'Floor model' : 'Clearance');

/** The listings the Sales page may show, mapped. Same visibility as /clearance (isVisible), without sold or qty-0 items. */
export function clearanceForSales(listings: readonly Listing[], now: number = Date.now(), settings: ClearanceSettings = SETTINGS): SalesClearanceItem[] {
  return listings
    .filter((l) => isVisible(l, now, settings) && l.status !== 'sold' && l.qty > 0)
    .map((l) => ({
      id: l.id,
      brand: l.brand,
      name: l.model || l.category,
      size: l.size,
      price: l.sale,
      retail: l.retail,
      savings_pct: savingsPct(l.retail, l.sale),
      qty: l.qty,
      label: clearanceLabel(l.condition),
      image: l.photos[0] || '', // the same (lh3) URL /clearance shows
      url: `/clearance#${l.id}`, // each /clearance card's id is the listing id
    }));
}

/** McAllen's clearance items for the Sales page; [] on any error. */
export async function getClearanceItems(): Promise<SalesClearanceItem[]> {
  try {
    // read hourly, like the page (revalidate 3600): /clearance's 60-second read would make this page regenerate every minute
    const data = await getClearance({ revalidate: 3600 });
    return clearanceForSales(data.listings, Date.now(), data.settings);
  } catch (err) {
    console.warn('[sales] clearance items unavailable:', err instanceof Error ? err.message : err);
    return [];
  }
}

type FeedWithBrands = { brands?: { brand: string; brand_page_url?: string }[] };

/** A copy of the feed with brand page links only for the brand pages live on this site: a row keeps its brand_page_url
    when that URL is a live brand page's path. Matched by path, not by name: the feed's row for Copper by Spring Air is
    "Spring Air" (the vendor; display_name "Copper by Spring Air"), so its card links once the Brands tab sets
    /copper-by-spring-air. */
export function withLiveBrandLinks<F extends FeedWithBrands>(feed: F): F {
  const live = new Set<string>(BRAND_PAGE_PATHS);
  const isLive = (url?: string) => !!url && live.has(url.replace(/(.)\/$/, '$1'));
  return { ...feed, brands: (feed.brands || []).map((b) => ({ ...b, brand_page_url: isLive(b.brand_page_url) ? b.brand_page_url : '' })) };
}

/* Google Search Console "Product snippets", critical (November 2026): 'Either "offers", "review", or "aggregateRating"
   should be specified'. The shared salesJsonLd() (lib/snooze/snooze-sales.js, Travis's file, unchanged) gives every
   Offer of the deals ItemList an itemOffered Product with only a name and a brand; the site has no prices or ratings to
   give them, so the Product goes rather than inventing either. This returns a copy of the JSON-LD with every Product
   node that has none of offers / review / aggregateRating removed wherever it sits: a property holding one is deleted
   (the Offers keep name, description, validFrom, validThrough and seller), an array drops it. Everything else is
   unchanged, and with no such Product (e.g. if the shared code stops emitting one) the copy equals the input. */
type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
const isBareProduct = (v: Json): boolean => {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return false;
  const t = v['@type'];
  const types = Array.isArray(t) ? t : [t];
  return types.includes('Product') && !('offers' in v) && !('review' in v) && !('aggregateRating' in v);
};
export function withoutBareProducts<T>(jsonld: T): T {
  const clean = (v: Json): Json => {
    if (Array.isArray(v)) return v.filter((x) => !isBareProduct(x)).map(clean);
    if (!v || typeof v !== 'object') return v;
    const out: { [key: string]: Json } = {};
    for (const [k, x] of Object.entries(v)) if (!isBareProduct(x)) out[k] = clean(x);
    return out;
  };
  return clean(jsonld as Json) as T;
}
