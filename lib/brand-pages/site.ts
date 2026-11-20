/* The adapter: the ONE file of the brand-page module that reads this site's own data. It maps the site's location data
   (lib/location.ts) and structured-data ids (lib/schema.ts) onto the module's BrandLocation. A store site that installs
   the module supplies its own version of this file; nothing else in lib/brand-pages/ or components/brand-pages/ imports
   site code. */
import { LOCATION } from '@/lib/location';
import { ORG_ID, SITE_URL, STORE_ID, WEBSITE_ID } from '@/lib/schema';
import type { BrandLocation, FaqEntry } from './types';
import { listAnd } from './faq';

const L = LOCATION;

/* "10:00" → { h: "10", ampm: "AM" }; "18:00" → { h: "6", ampm: "PM" } (minutes only when not :00) */
function clock(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number);
  return { h: `${h % 12 || 12}${m ? `:${String(m).padStart(2, '0')}` : ''}`, ampm: h < 12 ? 'AM' : 'PM' };
}
/** "Monday to Saturday 10 AM to 7 PM and Sunday 12 to 6 PM" (AM/PM said once when both times share it) */
const hoursSentence = L.openingHours.map(({ days, opens, closes }) => {
  const d = days.length > 1 ? `${days[0]} to ${days[days.length - 1]}` : days[0];
  const o = clock(opens), c = clock(closes);
  return `${d} ${o.ampm === c.ampm ? `${o.h} to ${c.h} ${c.ampm}` : `${o.h} ${o.ampm} to ${c.h} ${c.ampm}`}`;
}).join(' and ');

const nearby = L.areaServed.filter((t) => t !== L.city).map((name) => ({ name, path: `/mattress-store-${name.toLowerCase().replace(/\s+/g, '-')}` }));
const addressLine2 = `${L.city}, ${L.region} ${L.postalCode}`;
const DREAM_MAPPING = '/dream-mapping';

const tempurFaq: FaqEntry[] = [
  {
    question: `Where can I try a Tempur-Pedic mattress in ${L.city}?`,
    answer: `At Snooze Mattress, ${L.street}, ${addressLine2}. We're open ${hoursSentence}. Floor models vary, so call ${L.phone} to check which Tempur-Pedic models are on display.`,
    links: [{ text: L.phone, href: L.phoneHref }],
  },
  {
    question: 'Which Tempur-Pedic mattress is right for me?',
    answer: 'It depends on your body and how you sleep. Dream Mapping, our pressure mapping technology, shows where your body needs support. Then your Sleep Coach helps you compare models, like the Breeze collection if you sleep hot or the Adapt collection for pressure relief.',
    links: [{ text: 'Dream Mapping', href: DREAM_MAPPING }],
  },
  { question: 'Is Dream Mapping free?', answer: 'Yes. Dream Mapping is always free and no purchase is needed. Every guest gets the same fitting, whatever they plan to spend.' },
  { question: 'Do you offer financing on Tempur-Pedic mattresses?', answer: 'Yes. Special financing is available: 0% interest for up to 60 months with no down payment, with approved credit. No credit check options are also available. See store for details.' },
  { question: 'Can I use my HSA or FSA?', answer: 'Snooze Mattress accepts HSA and FSA payments on eligible purchases. Eligibility depends on your plan.' },
  ...(nearby.length
    ? [{
        question: `Do you serve ${listAnd(nearby.map((t) => t.name))}?`,
        answer: `Yes. Our ${L.city} store also serves shoppers from ${listAnd(nearby.map((t) => t.name))}.`,
        links: nearby.map((t) => ({ text: t.name, href: t.path })),
      }]
    : []),
];

export const BRAND_LOCATION: BrandLocation = {
  store_id: 'mcallen',
  business_name: L.name,
  city: L.city,
  state: L.region,
  site_url: SITE_URL,
  site_name: `${L.name} ${L.city}`,
  street_short: L.street.split(',')[0],
  address_line1: L.street,
  address_line2: addressLine2,
  hours_lines: L.hours.en,
  hours_sentence: hoursSentence,
  phone_display: L.phone,
  phone_e164: L.phoneHref.replace(/^tel:/, ''),
  maps_url: L.mapLink,
  nearby,
  links: {
    home: '/',
    mattresses: '/mattresses',
    booking: '/booking',
    dream_mapping: DREAM_MAPPING,
    memory_foam: '/memory-foam-mattresses',
    cooling: '/cooling-mattresses',
    bases: '/adjustable-mattress-bases',
    pillows: '/pillows',
    contact: '/contact-us',
    financing: '/mattress-financing',
  },
  brand_pages: {
    'tempur-pedic': { page_path: '/tempur-pedic', asset_base: '/brands/tempur-pedic/', faq: tempurFaq },
  },
  schema_ids: { organization: ORG_ID, website: WEBSITE_ID, store: STORE_ID },
  // the site's tab icon (the converted pages carry it in their head; without it the browser asks for /favicon.ico, a 404)
  site_icon: '/assets/filesafe/qR8peonBlnjGI3ZuLHQP/media/695b9e7d17768458ae206a19.png',
};
