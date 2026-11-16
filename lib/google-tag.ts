/* The Google tag (gtag.js) the site configures itself — components/Tracking.tsx renders it in <head> on every page —
   and the helpers that feed it. The GTM container (GTM-TVPN94M) is a separate thing managed in Tag Manager: nothing
   here changes it, and the dataLayer events in public/snz-events.js that it depends on keep their names.
     GA4_PRIMARY_ID / GA4_SECONDARY_ID   the two GA4 properties, both intentional (never merge or dedupe them)
     ADS_ID                              the Google Ads account, configured right after the first GA4 config
     BOOKING_CONVERSION                  "Dream Mapping booked": sent once per load of the booking confirmation page
                                         (/dream/map/thank/you, /es/…), after the configs (components/Tracking.tsx)
     CALL_CONVERSION                     website call tracking: configured right after the Ads config on every page,
                                         so Google can swap the visible store number for a forwarding number for
                                         visitors who came from an ad. The number must be the one the pages show
                                         (LOCATION.phone in lib/location.ts; a unit test pins the two together,
                                         since this module stays import-free for Node's test runner).
     contentGroup / pageLanguage         GA4 config parameters derived from the pathname: content_group (home, product,
                                         booking, quiz, clearance, location, blog, financing, contact, other) and
                                         page_language (en | es) ride on every event of the page. */
export const GA4_PRIMARY_ID = 'G-9R1JGVBRBR';
export const GA4_SECONDARY_ID = 'G-TS1RXQVPYT';
export const ADS_ID = 'AW-17532275127';

/** gtag('event', 'conversion', BOOKING_CONVERSION): the Google Ads conversion for a booked Dream Mapping appointment. */
export const BOOKING_CONVERSION = { send_to: `${ADS_ID}/LVkqCI324J8cELeThahB`, value: 100.0, currency: 'USD' } as const;

/** gtag('config', CALL_CONVERSION.send_to, { phone_conversion_number }): Google Ads website call tracking. */
export const CALL_CONVERSION = { send_to: `${ADS_ID}/pDDQCNjqipgbELeThahB`, phone_conversion_number: '(956) 586-5646' } as const;

/** The booking confirmation pages: the Dream Mapping calendar's post-booking redirect lands on the English one. */
export function isBookingConfirmation(pathname: string): boolean {
  return sitePath(pathname) === '/dream/map/thank/you';
}

export type ContentGroup = 'home' | 'product' | 'booking' | 'quiz' | 'clearance' | 'location' | 'blog' | 'financing' | 'contact' | 'other';
export type PageLanguage = 'en' | 'es';

/** The product and category pages (the generated pages that present something to buy), by first path segment. */
const PRODUCT_PAGES = new Set([
  'mattresses', 'queen-mattresses', 'king-mattresses', 'full-twin-mattresses', 'cooling-mattresses', 'memory-foam-mattresses',
  'mattresses-for-back-pain', 'adjustable-mattress-bases', 'massage-chairs', 'sleep-recliner', 'pillows', 'premium-sheets',
  'mattress-protectors', 'at-home-sleep-test-kit-by-sleepcorner', 'mattress-sales',
]);

/** The path without the /es prefix and without trailing slashes: '/es/blog/x/' → '/blog/x', '/es' → '/'. */
function sitePath(pathname: string): string {
  const path = (pathname || '/').replace(/\/+$/, '') || '/';
  return path === '/es' ? '/' : path.replace(/^\/es(?=\/)/, '');
}

/** 'es' for /es and everything under it, 'en' otherwise. */
export function pageLanguage(pathname: string): PageLanguage {
  const path = (pathname || '/').replace(/\/+$/, '') || '/';
  return path === '/es' || path.startsWith('/es/') ? 'es' : 'en';
}

/** The page's content_group, the same for a page and its Spanish copy. */
export function contentGroup(pathname: string): ContentGroup {
  const path = sitePath(pathname);
  if (path === '/') return 'home';
  const seg = path.split('/')[1];
  if (seg === 'booking' || seg === 'dream-mapping' || path === '/dream/map/thank/you') return 'booking';
  if (seg === 'sleep-quiz') return 'quiz';
  if (seg === 'clearance') return 'clearance';
  if (seg.startsWith('mattress-store-')) return 'location';
  if (seg === 'blog') return 'blog';
  if (seg === 'mattress-financing') return 'financing';
  if (seg === 'contact-us' || path === '/thank/you') return 'contact';
  if (PRODUCT_PAGES.has(seg)) return 'product';
  return 'other';
}

/** The parameters both GA4 config calls carry for a page (components/Tracking.tsx). */
export function ga4PageParams(pathname: string): { content_group: ContentGroup; page_language: PageLanguage } {
  return { content_group: contentGroup(pathname), page_language: pageLanguage(pathname) };
}
