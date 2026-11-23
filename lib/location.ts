/* The store. Used by the footer (address, map, social links) and the site-wide structured data (lib/schema.ts).
   scripts/relocate.mjs carries the same values for the generated GoHighLevel pages: change both together.
   Business name and NAP as the client wrote them for the SEO audit (October 2026): "Snooze Mattress + Wellness",
   7913 N 10th St, Suite 130, McAllen, TX 78504 · (956) 586-5646 · Mon–Sat 10 AM–7 PM, Sun 12–6 PM
   (scripts/brand-nap.mjs applies the same wording to the generated pages). No legal entity name is asserted anywhere:
   the registered name is NEEDS CLIENT INPUT. */
import type { BrandLocation, FaqEntry } from './brand-pages/types';

export const LOCATION = {
  name: 'Snooze Mattress + Wellness',
  legalName: 'Snooze Mattress + Wellness', // confirmed by the client (October 22, 2026): the legal name is the display name
  street: '7913 N 10th St, Suite 130',
  city: 'McAllen',
  region: 'TX',
  postalCode: '78504',
  country: 'US',
  phone: '(956) 586-5646',
  phoneHref: 'tel:+19565865646',
  phoneIntl: '+1 956-586-5646',
  email: 'northmcallen@snoozemattresscompany.com',
  /* coordinates of the storefront (10th & Auburn): the pin of the Google Business Profile listing, resolved from the
     Place ID below (November 3, 2026) */
  geo: { latitude: 26.2746879, longitude: -98.2189774 },
  social: {
    facebook: 'https://www.facebook.com/p/Snooze-Mattress-Wellness-61575812121380/',
    instagram: 'https://www.instagram.com/snoozemcallen',
    youtube: 'https://www.youtube.com/@SnoozeMcAllen',
    linkedin: 'https://www.linkedin.com/company/snooze-mattress-mcallen',
  },
  /* Google Maps: the query is the business name + the exact NAP, so the map and the directions link resolve to the
     store's own listing (SEO audit, October 2026 — section 6b; scripts/brand-nap.mjs writes the same URLs into the
     generated pages' location cards). */
  /* The store's Google Business Profile listing (Place ID supplied by the client, October 21, 2026): the top bar's
     address link and the footer's "Get Directions" / "Open Maps" links open it, the LocalBusiness schema lists it in
     sameAs and hasMap. The footer map embed keeps its business-name query. */
  placeId: 'ChIJBYBxOXChZYYR48f71GAS7YY',
  gbpUrl: 'https://www.google.com/maps/place/?q=place_id:ChIJBYBxOXChZYYR48f71GAS7YY',
  mapLink: 'https://www.google.com/maps/place/?q=place_id:ChIJBYBxOXChZYYR48f71GAS7YY',
  mapEmbed: 'https://www.google.com/maps?q=Snooze+Mattress+%2B+Wellness%2C+7913+N+10th+St%2C+Suite+130%2C+McAllen%2C+TX+78504&output=embed',
  /* the store's schema node (lib/schema.ts #store, SEO audit section 5a) */
  storefrontImage: '/assets/filesafe/ARD47WoZpqaZSQ9MSxLD/media/684480ff2c95c570cfc22e24.jpeg.webp', // the storefront photo of the location card
  priceRange: '$$',
  areaServed: ['McAllen', 'Edinburg', 'Mission', 'Pharr'],
  hours: {
    en: ['Mon–Sat 10 AM–7 PM', 'Sun 12–6 PM'],
    es: ['Lun–Sáb 10 AM–7 PM', 'Dom 12–6 PM'],
  },
  openingHours: [
    { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], opens: '10:00', closes: '19:00' },
    { days: ['Sunday'], opens: '12:00', closes: '18:00' },
  ],
} as const;

/* ---------- Brand pages (/tempur-pedic; lib/brand-pages/) ----------
   The dev handoff's location config (section 4), in its field names, for this store. Every value is derived from
   LOCATION above (or is a route of this site), so the brand pages can never disagree with the header, footer and
   structured data. The package's config/locations/mcallen.json has the same values; where the two ever differ, this
   file wins. lib/brand-pages/site.ts adds the site's structured-data ids. */

/* "10:00" → { h: "10", ampm: "AM" }; "18:00" → { h: "6", ampm: "PM" } (minutes only when not :00) */
function clock(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number);
  return { h: `${h % 12 || 12}${m ? `:${String(m).padStart(2, '0')}` : ''}`, ampm: h < 12 ? 'AM' : 'PM' };
}
/** The opening hours as one sentence: "Monday to Saturday 10 AM to 7 PM and Sunday 12 to 6 PM" (AM/PM said once when
    both times share it, as the store's own wording does). */
export function hoursSentence(openingHours: readonly { days: readonly string[]; opens: string; closes: string }[]): string {
  return openingHours.map(({ days, opens, closes }) => {
    const d = days.length > 1 ? `${days[0]} to ${days[days.length - 1]}` : days[0];
    const o = clock(opens), c = clock(closes);
    return `${d} ${o.ampm === c.ampm ? `${o.h} to ${c.h} ${c.ampm}` : `${o.h} ${o.ampm} to ${c.h} ${c.ampm}`}`;
  }).join(' and ');
}
const and = (items: readonly string[]) => (items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`);

const L = LOCATION;
/* the towns served besides McAllen, each with its service-area page (/mattress-store-edinburg, -mission, -pharr) */
const NEARBY = L.areaServed.filter((t) => t !== L.city).map((name) => ({ name, path: `/mattress-store-${name.toLowerCase().replace(/\s+/g, '-')}` }));
const ADDRESS_LINE2 = `${L.city}, ${L.region} ${L.postalCode}`;
const LINKS = {
  home: '/',
  mattresses: '/mattresses',
  booking: '/booking',
  dream_mapping: '/dream-mapping',
  memory_foam: '/memory-foam-mattresses',
  cooling: '/cooling-mattresses',
  bases: '/adjustable-mattress-bases',
  pillows: '/pillows',
  contact: '/contact-us',
  financing: '/mattress-financing',
  clearance: '/clearance',
};

/* The local FAQ of the Tempur-Pedic page: one entry per question, rendered to both the visible accordion and the
   FAQPage JSON-LD (a new question = one entry here). `links` names the pieces of the answer that link (first match
   after the previous link). The offer FAQs (financing, HSA/FSA) are not here: they come with the offers from the promo
   feed and follow these. */
const TEMPUR_PEDIC_FAQ: FaqEntry[] = [
  {
    question: `Where can I try a Tempur-Pedic mattress in ${L.city}?`,
    answer: `At Snooze Mattress, ${L.street}, ${ADDRESS_LINE2}. We're open ${hoursSentence(L.openingHours)}. Floor models vary, so call ${L.phone} to check which Tempur-Pedic models are on display.`,
    links: [{ text: L.phone, href: L.phoneHref }],
  },
  {
    question: 'Which Tempur-Pedic mattress is right for me?',
    answer: 'It depends on your body and how you sleep. Dream Mapping, our pressure mapping technology, shows where your body needs support. Then your Sleep Coach helps you compare models, like the Breeze collection if you sleep hot or the Adapt collection for pressure relief.',
    links: [{ text: 'Dream Mapping', href: LINKS.dream_mapping }],
  },
  {
    question: 'Is Dream Mapping free?',
    answer: 'Yes. Dream Mapping is always free and no purchase is needed. Every guest gets the same fitting, whatever they plan to spend.',
  },
  ...(NEARBY.length
    ? [{
        question: `Do you serve ${and(NEARBY.map((t) => t.name))}?`,
        answer: `Yes. Our ${L.city} store also serves shoppers from ${and(NEARBY.map((t) => t.name))}.`,
        links: NEARBY.map((t) => ({ text: t.name, href: t.path })),
      }]
    : []),
];

export const BRAND_PAGE_LOCATION = {
  /* The store's id in the promo feed: must match the Offer Calendar's Stores tab exactly ("mcallen"), or the store gets
     no vendor promotions. Other stores use hyphenated ids there (castle-rock, fort-collins, pueblo-west, el-paso,
     san-antonio), NOT the promo banner's STORE_KEYs. */
  store_id: 'mcallen',
  business_name: L.name,
  city: L.city,
  state: L.region,
  site_url: 'https://mcallen.snoozemattresscompany.com', // = lib/schema.ts SITE_URL (lib/brand-pages/site.ts checks)
  site_name: `${L.name} ${L.city}`, // "Snooze Mattress + Wellness McAllen"
  address_short: L.street.split(',')[0], // "7913 N 10th St" (the street without the suite; the answer sentence)
  address_line1: L.street,
  address_line2: ADDRESS_LINE2,
  hours_lines: L.hours.en,
  hours_sentence: hoursSentence(L.openingHours),
  phone_display: L.phone,
  phone_e164: L.phoneHref.replace(/^tel:/, ''),
  maps_url: L.mapLink,
  nearby: NEARBY,
  links: LINKS,
  /* The Sales page (/mattress-sales, lib/snooze/snooze-sales.js; package snooze-local-pages v4). local_intro is the
     McAllen entry of the package's config/sales/local-intros.json, verbatim (marked there "draft: store manager to
     confirm"). */
  timezone: 'America/Chicago',
  sales_path: '/mattress-sales',
  local_intro: "Snooze Mattress on North 10th Street serves the Rio Grande Valley, including Edinburg, Mission, Pharr and Weslaco. Hot Valley nights make the right fit and cooling matter, so start with free Dream Mapping and let a Sleep Coach match you to this month's best deal.",
  brand_pages: {
    'tempur-pedic': { page_path: '/tempur-pedic', asset_base: '/brands/tempur-pedic/', faq: TEMPUR_PEDIC_FAQ },
  },
} satisfies Omit<BrandLocation, 'schema_ids' | 'site_icon'>;
