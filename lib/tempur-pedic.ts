/* The Tempur-Pedic brand page (app/(en)/tempur-pedic/page.tsx): its store facts and its FAQ, built from the site's own
   location data (lib/location.ts) rather than the package's copy of it, so the page can never disagree with the header,
   footer and structured data. Import-free on purpose (the page passes LOCATION in), so Node's test runner can load it:
   tests/tempur-pedic.test.ts checks every string against the package's mcallen.html. */

/** The parts of lib/location.ts LOCATION this page uses. */
export type StoreFacts = {
  city: string;
  region: string;
  postalCode: string;
  street: string;
  phone: string;
  phoneHref: string;
  mapLink: string;
  areaServed: readonly string[];
  hours: { en: readonly string[] };
  openingHours: readonly { days: readonly string[]; opens: string; closes: string }[];
};

/** A FAQ answer: plain text with links in it. The visible accordion renders the links; the FAQPage JSON-LD takes the plain text. */
export type Segment = string | { text: string; href: string };
export type FaqItem = { q: string; a: Segment[] };

/** The two address lines of the store card: street, then "City, ST ZIP". */
export const addressLines = (s: StoreFacts): [string, string] => [s.street, `${s.city}, ${s.region} ${s.postalCode}`];

/** "7913 N 10th St, Suite 130, McAllen, TX 78504" */
export const addressOneLine = (s: StoreFacts) => addressLines(s).join(', ');

/** The towns the store serves besides its own city, each with its service-area page. */
export const nearbyTowns = (s: StoreFacts) =>
  s.areaServed.filter((t) => t !== s.city).map((name) => ({ name, href: `/mattress-store-${name.toLowerCase().replace(/\s+/g, '-')}` }));

/* "10:00" → { h: "10", ampm: "AM" }; "18:00" → { h: "6", ampm: "PM" } (minutes only when not :00) */
function clock(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number);
  return { h: `${h % 12 || 12}${m ? `:${String(m).padStart(2, '0')}` : ''}`, ampm: h < 12 ? 'AM' : 'PM' };
}

/** The opening hours as one sentence: "Monday to Saturday 10 AM to 7 PM and Sunday 12 to 6 PM" (the AM/PM is said once
    when both times share it, as the store's own wording does). */
export function hoursSentence(s: StoreFacts): string {
  return s.openingHours.map(({ days, opens, closes }) => {
    const d = days.length > 1 ? `${days[0]} to ${days[days.length - 1]}` : days[0];
    const o = clock(opens), c = clock(closes);
    return `${d} ${o.ampm === c.ampm ? `${o.h} to ${c.h} ${c.ampm}` : `${o.h} ${o.ampm} to ${c.h} ${c.ampm}`}`;
  }).join(' and ');
}

/** "Edinburg, Mission and Pharr" */
export const listAnd = (items: string[]) => (items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`);

/** The nearby towns as linked text: Edinburg, Mission and Pharr (the store card's "Serving" row and the last FAQ answer). */
export function townSegments(s: StoreFacts): Segment[] {
  const towns = nearbyTowns(s);
  return towns.flatMap((t, i) => [...(i === 0 ? [] : [i === towns.length - 1 ? ' and ' : ', ']), { text: t.name, href: t.href }]);
}

/** The page's FAQ, in order: the visible accordion and the FAQPage JSON-LD both render this list. */
export function faqItems(s: StoreFacts): FaqItem[] {
  const towns = nearbyTowns(s);
  const townLinks = townSegments(s);
  return [
    {
      q: `Where can I try a Tempur-Pedic mattress in ${s.city}?`,
      a: [`At Snooze Mattress, ${addressOneLine(s)}. We're open ${hoursSentence(s)}. Floor models vary, so call `, { text: s.phone, href: s.phoneHref }, ' to check which Tempur-Pedic models are on display.'],
    },
    {
      q: 'Which Tempur-Pedic mattress is right for me?',
      a: ['It depends on your body and how you sleep. ', { text: 'Dream Mapping', href: '/dream-mapping' }, ', our pressure mapping technology, shows where your body needs support. Then your Sleep Coach helps you compare models, like the Breeze collection if you sleep hot or the Adapt collection for pressure relief.'],
    },
    { q: 'Is Dream Mapping free?', a: ['Yes. Dream Mapping is always free and no purchase is needed. Every guest gets the same fitting, whatever they plan to spend.'] },
    { q: 'Do you offer financing on Tempur-Pedic mattresses?', a: ['Yes. Special financing is available: 0% interest for up to 60 months with no down payment, with approved credit. No credit check options are also available. See store for details.'] },
    { q: 'Can I use my HSA or FSA?', a: ['Snooze Mattress accepts HSA and FSA payments on eligible purchases. Eligibility depends on your plan.'] },
    ...(towns.length
      ? [{ q: `Do you serve ${listAnd(towns.map((t) => t.name))}?`, a: [`Yes. Our ${s.city} store also serves shoppers from `, ...townLinks, '.'] }]
      : []),
  ];
}

/** The dated vendor promotion (the package's Black Friday block, "Through December 1"): shown through December 1, 2026,
    23:59:59 America/Chicago, then never again. December is CST (UTC−6), so the cut-off is 2026-12-02 00:00 −06:00. The
    page checks it on the server and regenerates hourly (app/(en)/tempur-pedic/page.tsx, revalidate 3600). */
export const PROMO_END = Date.parse('2026-12-02T00:00:00-06:00');
export const isPromoLive = (now: number) => now < PROMO_END;

/** An answer as plain text (the JSON-LD acceptedAnswer). */
export const plainText = (a: Segment[]) => a.map((x) => (typeof x === 'string' ? x : x.text)).join('');
