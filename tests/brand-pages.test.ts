// The brand-page module (lib/brand-pages/): FAQ links, structured data and metadata, with McAllen's values, against the
// exact strings of the package's mcallen.html. Node's built-in test runner: `npm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { BrandLocation } from '../lib/brand-pages/types.ts';
import { BRANDS, BRAND_KEYS } from '../lib/brand-pages/registry.ts';
import { answerSegments, listAnd, plainText, townSegments } from '../lib/brand-pages/faq.ts';
import { brandPageJsonLd } from '../lib/brand-pages/jsonld.ts';
import { brandPage } from '../lib/brand-pages/page.ts';
import { BRAND_PAGE_LOCATION, LOCATION, hoursSentence } from '../lib/location.ts';
import { readFileSync } from 'node:fs';

const TP = BRANDS['tempur-pedic'];
const SITE = 'https://mcallen.snoozemattresscompany.com';
const LOC: BrandLocation = { ...BRAND_PAGE_LOCATION, schema_ids: { organization: `${SITE}/#organization`, website: `${SITE}/#website`, store: `${SITE}/#store` } };
const NEARBY = LOC.nearby;

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
  const towns = LOC.brand_pages['tempur-pedic']!.faq.at(-1)!;
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

test('location config (lib/location.ts BRAND_PAGE_LOCATION): the handoff fields, equal to the package mcallen.json', () => {
  // config/locations/mcallen.json of the package (v2.1), field for field; the repo values are derived from LOCATION
  const pkg = {
    store_id: 'mcallen', city: 'McAllen', state: 'TX', site_url: 'https://mcallen.snoozemattresscompany.com', site_name: 'Snooze Mattress + Wellness McAllen',
    address_line1: '7913 N 10th St, Suite 130', address_line2: 'McAllen, TX 78504', hours_lines: ['Mon–Sat 10 AM–7 PM', 'Sun 12–6 PM'],
    hours_sentence: 'Monday to Saturday 10 AM to 7 PM and Sunday 12 to 6 PM', phone_display: '(956) 586-5646', phone_e164: '+19565865646',
    maps_url: 'https://www.google.com/maps/place/?q=place_id:ChIJBYBxOXChZYYR48f71GAS7YY',
    nearby: [{ name: 'Edinburg', path: '/mattress-store-edinburg' }, { name: 'Mission', path: '/mattress-store-mission' }, { name: 'Pharr', path: '/mattress-store-pharr' }],
    links: { home: '/', mattresses: '/mattresses', booking: '/booking', dream_mapping: '/dream-mapping', memory_foam: '/memory-foam-mattresses', cooling: '/cooling-mattresses', bases: '/adjustable-mattress-bases', pillows: '/pillows', contact: '/contact-us', financing: '/mattress-financing' },
  };
  for (const [k, v] of Object.entries(pkg)) assert.deepEqual((BRAND_PAGE_LOCATION as Record<string, unknown>)[k], v, k);
  const tp = BRAND_PAGE_LOCATION.brand_pages['tempur-pedic'];
  assert.equal(tp.page_path, '/tempur-pedic'); assert.equal(tp.asset_base, '/brands/tempur-pedic/'); assert.equal(tp.asset_base, TP.asset_base);
  assert.equal(BRAND_PAGE_LOCATION.business_name, 'Snooze Mattress + Wellness');
  assert.equal(BRAND_PAGE_LOCATION.street_short, '7913 N 10th St');
  // derived from the site's own data, so the page cannot disagree with the header, footer and structured data
  assert.equal(BRAND_PAGE_LOCATION.phone_display, LOCATION.phone);
  assert.equal(`tel:${BRAND_PAGE_LOCATION.phone_e164}`, LOCATION.phoneHref);
  assert.equal(BRAND_PAGE_LOCATION.maps_url, LOCATION.mapLink);
});

test('store_id is in the feed: the Offer Calendar Stores list (fixtures) has "mcallen" carrying Tempur-Pedic', () => {
  for (const name of ['current', 'approved']) {
    const feed = JSON.parse(readFileSync(new URL(`./fixtures/promo-feed.sheet-${name}.fixture.json`, import.meta.url), 'utf8'));
    assert.ok(feed.stores[BRAND_PAGE_LOCATION.store_id], name);
    assert.ok(feed.stores[BRAND_PAGE_LOCATION.store_id].brands.includes(TP.vendor), name);
    assert.equal(feed.stores[BRAND_PAGE_LOCATION.store_id].city, BRAND_PAGE_LOCATION.city, name);
  }
});

test('hoursSentence: AM/PM once when both times share it, minutes only when not :00', () => {
  assert.equal(hoursSentence(LOCATION.openingHours), 'Monday to Saturday 10 AM to 7 PM and Sunday 12 to 6 PM');
  assert.equal(hoursSentence([{ days: ['Monday'], opens: '09:30', closes: '11:00' }, { days: ['Friday', 'Saturday'], opens: '12:00', closes: '00:00' }]), 'Monday 9:30 to 11 AM and Friday to Saturday 12 PM to 12 AM');
});

test('local FAQ (one array in the location config): the package questions and answers word for word, with their links', () => {
  const faq = BRAND_PAGE_LOCATION.brand_pages['tempur-pedic'].faq;
  assert.deepEqual(faq.map((f) => [f.question, plainText(answerSegments(f))]), [
    ['Where can I try a Tempur-Pedic mattress in McAllen?', "At Snooze Mattress, 7913 N 10th St, Suite 130, McAllen, TX 78504. We're open Monday to Saturday 10 AM to 7 PM and Sunday 12 to 6 PM. Floor models vary, so call (956) 586-5646 to check which Tempur-Pedic models are on display."],
    ['Which Tempur-Pedic mattress is right for me?', 'It depends on your body and how you sleep. Dream Mapping, our pressure mapping technology, shows where your body needs support. Then your Sleep Coach helps you compare models, like the Breeze collection if you sleep hot or the Adapt collection for pressure relief.'],
    ['Is Dream Mapping free?', 'Yes. Dream Mapping is always free and no purchase is needed. Every guest gets the same fitting, whatever they plan to spend.'],
    ['Do you serve Edinburg, Mission and Pharr?', 'Yes. Our McAllen store also serves shoppers from Edinburg, Mission and Pharr.'],
  ]);
  assert.deepEqual(faq.flatMap((f) => answerSegments(f).filter((x) => typeof x !== 'string')), [
    { text: '(956) 586-5646', href: 'tel:+19565865646' },
    { text: 'Dream Mapping', href: '/dream-mapping' },
    { text: 'Edinburg', href: '/mattress-store-edinburg' },
    { text: 'Mission', href: '/mattress-store-mission' },
    { text: 'Pharr', href: '/mattress-store-pharr' },
  ]);
});
