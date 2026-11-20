// The brand page's offers from the promo feed (lib/brand-pages/promo.ts, feed.ts), with the two Offer Calendar
// fixtures only: today's real feed (nothing approved) and the same sheet with everything approved. `today` is
// overridden per case. The fixtures are test data: no app code imports or fetches them.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import type { BrandLocation, PromoFeed } from '../lib/brand-pages/types.ts';
import { BRANDS } from '../lib/brand-pages/registry.ts';
import { isLive, longDate, promoLabel, selectAlwaysOn, selectPromotions, storeMayShow, todayInStoreTime } from '../lib/brand-pages/promo.ts';
import { brandOffers, fetchFeed, resolveFeed, validateFeed } from '../lib/brand-pages/feed.ts';
import { pageFaq, plainText, answerSegments } from '../lib/brand-pages/faq.ts';
import { brandPageJsonLd } from '../lib/brand-pages/jsonld.ts';
import { BRAND_PAGE_LOCATION } from '../lib/location.ts';

const fixture = (name: 'current' | 'approved'): PromoFeed => JSON.parse(readFileSync(new URL(`./fixtures/promo-feed.sheet-${name}.fixture.json`, import.meta.url), 'utf8'));
const CURRENT = fixture('current');
const APPROVED = fixture('approved');
const TP = BRANDS['tempur-pedic'];
const SITE = BRAND_PAGE_LOCATION.site_url;
const LOC: BrandLocation = { ...BRAND_PAGE_LOCATION, schema_ids: { organization: `${SITE}/#organization`, website: `${SITE}/#website`, store: `${SITE}/#store` } };
const LOCAL_FAQ = BRAND_PAGE_LOCATION.brand_pages['tempur-pedic'].faq;

test('both fixtures are valid feeds (version, stores, promotions, always_on)', () => {
  assert.doesNotThrow(() => validateFeed(CURRENT));
  assert.doesNotThrow(() => validateFeed(APPROVED));
});

test('sheet-current (nothing approved): no promo, no offer tiles, no offer FAQs; the local FAQ stays', () => {
  for (const today of ['2026-11-20', '2026-12-20']) {
    const o = brandOffers(TP, 'mcallen', CURRENT, today);
    assert.equal(o.source, 'feed');
    assert.deepEqual(o.promos, [], today);
    assert.deepEqual(o.tiles, [], today);
    assert.deepEqual(pageFaq(LOCAL_FAQ, o.tiles).map((f) => f.question), LOCAL_FAQ.map((f) => f.question));
  }
  // the Why Buy heading, lead and buttons do not depend on the offers (components/brand-pages/local.tsx WhyBuy)
  assert.equal(TP.copy.why_heading(LOC), 'Why Buy Tempur-Pedic at Snooze Mattress in McAllen');
  assert.ok(TP.copy.why_lead.length > 0);
});

test('sheet-approved, McAllen, 2026-11-20: Black Friday, label, headline and the six bullets in sheet order', () => {
  const { promos } = brandOffers(TP, 'mcallen', APPROVED, '2026-11-20');
  assert.equal(promos.length, 1);
  const [bf] = promos;
  assert.equal(bf.block, 'BF26-TEMPUR');
  assert.equal(promoLabel(bf), 'Black Friday Sale · Through December 1');
  assert.equal(bf.headline, 'Save Up to $500 on Tempur-Pedic Smart Base Sets');
  assert.deepEqual(bf.items.map((i) => i.text), [
    '$300 off Tempur-LuxeAdapt, ProBreeze, LuxeBreeze and ActiveBreeze',
    '$600 off Tempur-LuxeBreeze Split Head King',
    '$200 off Tempur-Adapt and ProAdapt',
    '$25 off Tempur-Adapt and Breeze pillows',
    '$100 off TEMPUR-Ergo',
    '$200 off Tempur-Pedic smart bases (TEMPUR-Ergo Smart and ProSmart)',
  ]);
  assert.equal(bf.image, 'base');
  assert.equal(TP.images[bf.image!].file, 'base.webp');
});

test('sheet-approved, McAllen: nothing between the sales, Holiday & Year-End from December 15, nothing after January 5', () => {
  assert.deepEqual(brandOffers(TP, 'mcallen', APPROVED, '2026-12-05').promos, []);
  const holiday = brandOffers(TP, 'mcallen', APPROVED, '2026-12-20').promos;
  assert.deepEqual(holiday.map((b) => b.block), ['NY26-TEMPUR']);
  assert.equal(holiday[0].event, 'Holiday & Year-End Sale');
  assert.equal(promoLabel(holiday[0]), 'Holiday & Year-End Sale · Through January 5');
  assert.deepEqual(holiday[0].items.map((i) => i.text), APPROVED.promotions[1].items.map((i) => i.text), 'the five bullets in feed order');
  assert.equal(holiday[0].items.length, 5);
  assert.deepEqual(brandOffers(TP, 'mcallen', APPROVED, '2027-01-06').promos, []);
  // the date edges are inclusive, in store time
  assert.equal(brandOffers(TP, 'mcallen', APPROVED, '2026-12-01').promos.length, 1);
  assert.equal(brandOffers(TP, 'mcallen', APPROVED, '2026-12-02').promos.length, 0);
  assert.equal(brandOffers(TP, 'mcallen', APPROVED, '2027-01-05').promos.length, 1);
});

test('sheet-approved: the four tiles in feed order (Special Financing keeps its line break), never re-sorted', () => {
  const { tiles } = brandOffers(TP, 'mcallen', APPROVED, '2026-11-20');
  assert.deepEqual(tiles.map((t) => t.title), ['Free Dream Mapping', '365-Night Sleep Guarantee', 'Special Financing', 'HSA/FSA Accepted']);
  assert.equal(tiles[2].body, '0% interest for up to 60 months, no down payment.\nNo credit check options available.');
  assert.deepEqual(tiles[2].body.split('\n'), ['0% interest for up to 60 months, no down payment.', 'No credit check options available.']);
  // a feed in another order renders in that order
  const reversed = { ...APPROVED, always_on: [...APPROVED.always_on].reverse() };
  assert.deepEqual(selectAlwaysOn(reversed, { storeId: 'mcallen' }).map((t) => t.title), ['HSA/FSA Accepted', 'Special Financing', '365-Night Sleep Guarantee', 'Free Dream Mapping']);
});

test('sheet-approved: offer FAQs follow the local FAQs; the visible FAQ and the FAQPage JSON-LD are identical', () => {
  const { tiles } = brandOffers(TP, 'mcallen', APPROVED, '2026-11-20');
  const faq = pageFaq(LOCAL_FAQ, tiles);
  assert.deepEqual(faq.map((f) => f.question), [...LOCAL_FAQ.map((f) => f.question), 'Do you offer financing on Tempur-Pedic mattresses?', 'Can I use my HSA or FSA?']);
  const visible = faq.map((f) => [f.question, plainText(answerSegments(f))]);
  const ld = brandPageJsonLd(TP, LOC, faq)[2].mainEntity as { name: string; acceptedAnswer: { text: string } }[];
  assert.deepEqual(ld.map((q) => [q.name, q.acceptedAnswer.text]), visible);
  assert.equal(visible.at(-1)![1], 'Snooze Mattress accepts HSA and FSA payments on eligible purchases. Eligibility depends on your plan.');
});

test('a store the feed does not list gets no promotion; a block naming stores goes only to them', () => {
  assert.deepEqual(brandOffers(TP, 'not-a-store', APPROVED, '2026-11-20').promos, []);
  assert.equal(storeMayShow({ stores: [] }, 'Tempur-Pedic', 'not-a-store', APPROVED), false);
  const only = { ...APPROVED, promotions: [{ ...APPROVED.promotions[0], stores: ['rockwall'] }] };
  assert.deepEqual(selectPromotions(only, { vendor: 'Tempur-Pedic', storeId: 'mcallen', today: '2026-11-20' }), []);
  assert.equal(selectPromotions(only, { vendor: 'Tempur-Pedic', storeId: 'rockwall', today: '2026-11-20' }).length, 1);
  // another vendor's block never shows on the Tempur-Pedic page
  const sealy = { ...APPROVED, promotions: [{ ...APPROVED.promotions[0], vendor: 'Sealy' }] };
  assert.deepEqual(selectPromotions(sealy, { vendor: 'Tempur-Pedic', storeId: 'mcallen', today: '2026-11-20' }), []);
});

test('promo helpers: store time is America/Chicago; long dates', () => {
  assert.equal(todayInStoreTime(new Date('2026-12-02T05:59:00Z')), '2026-12-01', '11:59 PM in Chicago');
  assert.equal(todayInStoreTime(new Date('2026-12-02T06:00:00Z')), '2026-12-02');
  assert.equal(isLive({ start: '2026-11-03', end: '2026-12-01' }, '2026-11-03'), true);
  assert.equal(isLive({ start: '2026-11-03' }, '2026-11-04'), false);
  assert.equal(longDate('2027-01-05'), 'January 5');
});

test('invalid or unreachable feed with no cached copy: static fallback (the four tiles and their FAQs, no promo), never an error', async () => {
  const warnings: string[] = [];
  const warn = (m: string) => warnings.push(m);
  const none = { get: () => null, set: () => {} };
  // unreachable
  assert.equal(await resolveFeed('https://script.google.com/macros/s/x/exec', () => Promise.reject(new Error('fetch failed')), none, warn), null);
  // reachable but not a feed (an HTML error page), through the real fetchFeed
  const html = (async () => new Response('<html>error</html>', { status: 200, headers: { 'content-type': 'text/html' } })) as unknown as typeof fetch;
  await assert.rejects(fetchFeed('https://example.test/feed', html));
  assert.equal(await resolveFeed('https://example.test/feed', (u) => fetchFeed(u, html), none, warn), null);
  // a 500
  const err500 = (async () => new Response('{}', { status: 500 })) as unknown as typeof fetch;
  await assert.rejects(fetchFeed('https://example.test/feed', err500), /HTTP 500/);
  // valid JSON, wrong shape
  assert.throws(() => validateFeed({ version: 1, stores: {}, promotions: [] }), /always_on/);
  // no URL
  assert.equal(await resolveFeed(undefined, () => Promise.resolve(APPROVED), none, warn), null);
  assert.equal(warnings.length, 3);
  assert.ok(warnings.every((w) => !w.includes('/macros/') && !w.includes('/feed')), 'the warning names the host only');
  const fb = brandOffers(TP, 'mcallen', null, '2026-11-20');
  assert.equal(fb.source, 'fallback');
  assert.deepEqual(fb.promos, []);
  assert.deepEqual(fb.tiles.map((t) => t.title), ['Free Dream Mapping', '365-Night Sleep Guarantee', 'Special Financing', 'HSA/FSA Accepted']);
  assert.deepEqual(pageFaq(LOCAL_FAQ, fb.tiles).slice(-2).map((f) => f.question), ['Do you offer financing on Tempur-Pedic mattresses?', 'Can I use my HSA or FSA?']);
  // the fallback tiles are the approved sheet's always-on offers word for word
  assert.deepEqual(fb.tiles.map((t) => [t.title, t.body, t.fine_print || '', t.faq || null]), APPROVED.always_on.map((t) => [t.title, t.body, t.fine_print || '', t.faq || null]));
});

test('a failed read with a cached copy keeps the cached copy (not the fallback)', async () => {
  let last: PromoFeed | null = null;
  const store = { get: () => last, set: (f: PromoFeed) => { last = f; } };
  const quiet = () => {};
  assert.equal(await resolveFeed('https://x.test/f', () => Promise.resolve(CURRENT), store, quiet), CURRENT);
  assert.equal(await resolveFeed('https://x.test/f', () => Promise.reject(new Error('timeout')), store, quiet), CURRENT);
});
