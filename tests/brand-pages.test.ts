// The brand-page module (lib/brand-pages/): FAQ links, structured data and metadata, with McAllen's values, against the
// exact strings of the package's mcallen.html. Node's built-in test runner: `npm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { BrandLocation } from '../lib/brand-pages/types.ts';
import { BRANDS, BRAND_KEYS } from '../lib/brand-pages/registry.ts';
import { answerSegments, listAnd, plainText, townSegments } from '../lib/brand-pages/faq.ts';
import { brandPageJsonLd } from '../lib/brand-pages/jsonld.ts';
import { brandPage } from '../lib/brand-pages/page.ts';

const TP = BRANDS['tempur-pedic'];
const SITE = 'https://mcallen.snoozemattresscompany.com';
const NEARBY = [{ name: 'Edinburg', path: '/mattress-store-edinburg' }, { name: 'Mission', path: '/mattress-store-mission' }, { name: 'Pharr', path: '/mattress-store-pharr' }];
const LOC: BrandLocation = {
  store_id: 'mcallen', business_name: 'Snooze Mattress + Wellness', city: 'McAllen', state: 'TX', site_url: SITE, site_name: 'Snooze Mattress + Wellness McAllen',
  street_short: '7913 N 10th St', address_line1: '7913 N 10th St, Suite 130', address_line2: 'McAllen, TX 78504',
  hours_lines: ['Mon–Sat 10 AM–7 PM', 'Sun 12–6 PM'], hours_sentence: 'Monday to Saturday 10 AM to 7 PM and Sunday 12 to 6 PM',
  phone_display: '(956) 586-5646', phone_e164: '+19565865646', maps_url: 'https://www.google.com/maps/place/?q=place_id:ChIJBYBxOXChZYYR48f71GAS7YY',
  nearby: NEARBY,
  links: { home: '/', mattresses: '/mattresses', booking: '/booking', dream_mapping: '/dream-mapping', memory_foam: '/memory-foam-mattresses', cooling: '/cooling-mattresses', bases: '/adjustable-mattress-bases', pillows: '/pillows', contact: '/contact-us', financing: '/mattress-financing' },
  brand_pages: {
    'tempur-pedic': {
      page_path: '/tempur-pedic', asset_base: '/brands/tempur-pedic/',
      faq: [
        { question: 'Is Dream Mapping free?', answer: 'Yes. Dream Mapping is always free and no purchase is needed. Every guest gets the same fitting, whatever they plan to spend.' },
        { question: 'Do you serve Edinburg, Mission and Pharr?', answer: 'Yes. Our McAllen store also serves shoppers from Edinburg, Mission and Pharr.', links: NEARBY.map((t) => ({ text: t.name, href: t.path })) },
      ],
    },
  },
  schema_ids: { organization: `${SITE}/#organization`, website: `${SITE}/#website`, store: `${SITE}/#store` },
};

test('registry: Tempur-Pedic, vendor spelled as in the feed, assets under /brands/tempur-pedic/', () => {
  assert.deepEqual(BRAND_KEYS, ['tempur-pedic']);
  assert.equal(TP.vendor, 'Tempur-Pedic');
  assert.equal(TP.asset_base, '/brands/tempur-pedic/');
  assert.equal(TP.promo_slot, 'tempur_promo');
  assert.deepEqual(Object.keys(TP.images), ['base', 'breeze', 'adapt', 'activebreeze', 'splitking', 'pillows']);
  const p = brandPage(TP, LOC);
  assert.equal(p.url, `${SITE}/tempur-pedic`);
  assert.equal(p.img, '/brands/tempur-pedic/img/');
});

test('copy: the package strings, with the city and state filled in', () => {
  assert.equal(TP.seo.title(LOC), 'Tempur-Pedic Mattresses in McAllen, TX | Snooze Mattress');
  assert.equal(TP.seo.description(LOC), 'Try Tempur-Pedic Adapt, Breeze and smart adjustable bases at Snooze Mattress in McAllen. Get a free Dream Mapping fitting to find the right fit for your body.');
  assert.equal(TP.copy.h1(LOC), 'Tempur-Pedic Mattresses in McAllen, TX');
  assert.equal(TP.copy.visit_heading(LOC), 'Try Tempur-Pedic in McAllen');
  assert.equal(TP.copy.why_heading(LOC), 'Why Buy Tempur-Pedic at Snooze Mattress in McAllen');
  assert.equal(TP.copy.faq_heading(LOC), 'Tempur-Pedic in McAllen: Common Questions');
});

test('answerSegments: each link takes the first occurrence of its text after the previous link', () => {
  const towns = LOC.brand_pages['tempur-pedic']!.faq[1];
  assert.deepEqual(answerSegments(towns), [
    'Yes. Our McAllen store also serves shoppers from ',
    { text: 'Edinburg', href: '/mattress-store-edinburg' }, ', ',
    { text: 'Mission', href: '/mattress-store-mission' }, ' and ',
    { text: 'Pharr', href: '/mattress-store-pharr' }, '.',
  ]);
  assert.equal(plainText(answerSegments(towns)), towns.answer);
  assert.deepEqual(answerSegments({ question: 'q', answer: 'plain' }), ['plain']);
  assert.throws(() => answerSegments({ question: 'q', answer: 'abc', links: [{ text: 'x', href: '/' }] }), /not in the answer/);
  assert.equal(listAnd(['A']), 'A'); assert.equal(listAnd(['A', 'B']), 'A and B'); assert.equal(listAnd(['A', 'B', 'C']), 'A, B and C');
  assert.equal(plainText(townSegments(NEARBY)), 'Edinburg, Mission and Pharr');
});

test('structured data: WebPage, BreadcrumbList and FAQPage; the FAQPage text is the visible answer text', () => {
  const faq = LOC.brand_pages['tempur-pedic']!.faq;
  const [webPage, crumbs, faqPage] = brandPageJsonLd(TP, LOC, faq);
  assert.equal(webPage['@id'], `${SITE}/tempur-pedic#webpage`);
  assert.equal(webPage.name, 'Tempur-Pedic Mattresses in McAllen, TX | Snooze Mattress');
  assert.deepEqual(webPage.isPartOf, { '@id': `${SITE}/#website` });
  assert.deepEqual(webPage.publisher, { '@id': `${SITE}/#organization` });
  assert.deepEqual((crumbs.itemListElement as { item: string }[]).map((c) => c.item), [`${SITE}/`, `${SITE}/mattresses`, `${SITE}/tempur-pedic`]);
  assert.deepEqual((faqPage.mainEntity as { name: string; acceptedAnswer: { text: string } }[]).map((q) => [q.name, q.acceptedAnswer.text]), faq.map((f) => [f.question, f.answer]));
  assert.ok(!JSON.stringify([webPage, crumbs, faqPage]).includes('Review'), 'no Review / AggregateRating');
});
