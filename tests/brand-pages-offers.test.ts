// The brand page's offers from the promo feed (lib/brand-pages/promo.ts, offers.ts, faq.ts) and the feed read itself
// (lib/snooze/feed.ts, the package file, unchanged). Fixtures only: the real Offer Calendar exports (nothing approved /
// everything approved, feed v1 shape) and the package's v2 example feed. `today` is overridden per case. The fixtures
// are test data: no app code imports or fetches them.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import type { BrandLocation, PromoFeed } from '../lib/brand-pages/types.ts';
import { BRANDS } from '../lib/brand-pages/registry.ts';
import { isLive, longDate, promoLabel, selectAlwaysOn, selectPromotions, storeMayShow, todayInStoreTime } from '../lib/brand-pages/promo.ts';
import { brandOffers } from '../lib/brand-pages/offers.ts';
import { answerSegments, fillBrand, pageFaq, plainText } from '../lib/brand-pages/faq.ts';
import { brandPageJsonLd } from '../lib/brand-pages/jsonld.ts';
import { getPromoFeed } from '../lib/snooze/feed.ts';
import { BRAND_PAGE_LOCATION } from '../lib/location.ts';

const fixture = (name: string): PromoFeed => JSON.parse(readFileSync(new URL(`./fixtures/promo-feed.${name}.fixture.json`, import.meta.url), 'utf8'));
const CURRENT = fixture('sheet-current');
const APPROVED = fixture('sheet-approved');
const V2 = fixture('v2-example');
const TP = BRANDS['tempur-pedic'];
const SITE = BRAND_PAGE_LOCATION.site_url;
const LOC: BrandLocation = { ...BRAND_PAGE_LOCATION, schema_ids: { organization: `${SITE}/#organization`, website: `${SITE}/#website`, store: `${SITE}/#store` } };
const LOCAL_FAQ = BRAND_PAGE_LOCATION.brand_pages['tempur-pedic'].faq;
const BF_BULLETS = [
  '$300 off Tempur-LuxeAdapt, ProBreeze, LuxeBreeze and ActiveBreeze',
  '$600 off Tempur-LuxeBreeze Split Head King',
  '$200 off Tempur-Adapt and ProAdapt',
  '$25 off Tempur-Adapt and Breeze pillows',
  '$100 off TEMPUR-Ergo',
  '$200 off Tempur-Pedic smart bases (TEMPUR-Ergo Smart and ProSmart)',
];

test('the brand config has no static fallback offers', () => {
  assert.ok(!('fallback' in TP));
});

test('sheet-current (nothing approved): no promo, no offer tiles, no offer FAQs; the local FAQ stays', () => {
  for (const today of ['2026-11-20', '2026-12-20']) {
    const o = brandOffers(TP, 'mcallen', CURRENT, today);
    assert.deepEqual(o.promos, [], today);
    assert.deepEqual(o.tiles, [], today);
    assert.deepEqual(pageFaq(LOCAL_FAQ, o.tiles, TP.name).map((f) => f.question), LOCAL_FAQ.map((f) => f.question));
  }
});

test('sheet-approved and v2 example, McAllen, Black Friday: BF26-TEMPUR, label, headline, six bullets in sheet order', () => {
  for (const [name, feed, today] of [['sheet-approved', APPROVED, '2026-11-20'], ['v2-example', V2, '2026-11-21']] as const) {
    const { promos } = brandOffers(TP, 'mcallen', feed, today);
    assert.deepEqual(promos.map((b) => b.block), ['BF26-TEMPUR'], name);
    assert.equal(promoLabel(promos[0]), 'Black Friday Sale · Through December 1', name);
    assert.equal(promos[0].headline, 'Save Up to $500 on Tempur-Pedic Smart Base Sets', name);
    assert.deepEqual(promos[0].items.map((i) => i.text), BF_BULLETS, name);
    assert.equal(TP.images[promos[0].image!].file, 'base.webp', name);
  }
});

test('McAllen: nothing between the sales, Holiday & Year-End from December 15, nothing after January 5 (store time)', () => {
  for (const feed of [APPROVED, V2]) {
    assert.deepEqual(brandOffers(TP, 'mcallen', feed, '2026-12-05').promos, []);
    const holiday = brandOffers(TP, 'mcallen', feed, '2026-12-20').promos;
    assert.deepEqual(holiday.map((b) => b.block), ['NY26-TEMPUR']);
    assert.equal(promoLabel(holiday[0]), 'Holiday & Year-End Sale · Through January 5');
    assert.equal(holiday[0].items.length, 5);
    assert.deepEqual(brandOffers(TP, 'mcallen', feed, '2027-01-06').promos, []);
    // an offer that ended yesterday is gone; one starting tomorrow is not shown yet
    assert.equal(brandOffers(TP, 'mcallen', feed, '2026-12-02').promos.length, 0, 'BF ended Dec 1');
    assert.equal(brandOffers(TP, 'mcallen', feed, '2026-12-14').promos.length, 0, 'Holiday starts Dec 15');
    assert.equal(brandOffers(TP, 'mcallen', feed, '2026-12-01').promos.length, 1, 'last day');
    assert.equal(brandOffers(TP, 'mcallen', feed, '2026-12-15').promos.length, 1, 'first day');
  }
});

test('always-on tiles in feed order (Special Financing keeps its line break), never re-sorted', () => {
  for (const feed of [APPROVED, V2]) {
    const { tiles } = brandOffers(TP, 'mcallen', feed, '2026-11-21');
    assert.deepEqual(tiles.map((t) => t.title), ['Free Dream Mapping', '365-Night Sleep Guarantee', 'Special Financing', 'HSA/FSA Accepted']);
    assert.ok(tiles[2].body.includes('\n'));
  }
  const reversed = { ...V2, always_on: [...V2.always_on].reverse() };
  assert.deepEqual(selectAlwaysOn(reversed, { storeId: 'mcallen' }).map((t) => t.title), ['HSA/FSA Accepted', 'Special Financing', '365-Night Sleep Guarantee', 'Free Dream Mapping']);
});

test('{brand} in a feed FAQ becomes the brand name, in the visible FAQ and the JSON-LD', () => {
  assert.equal(fillBrand('Do you offer financing on {brand} mattresses?', 'Tempur-Pedic'), 'Do you offer financing on Tempur-Pedic mattresses?');
  assert.equal(fillBrand('{brand} and {brand}', 'Sealy'), 'Sealy and Sealy');
  const { tiles } = brandOffers(TP, 'mcallen', V2, '2026-11-21');
  assert.equal(V2.always_on.find((o) => o.faq)!.faq!.q, 'Do you offer financing on {brand} mattresses?', 'the v2 feed carries the token');
  const faq = pageFaq(LOCAL_FAQ, tiles, TP.name);
  assert.deepEqual(faq.slice(-2).map((f) => f.question), ['Do you offer financing on Tempur-Pedic mattresses?', 'Can I use my HSA or FSA?']);
  const visible = faq.map((f) => [f.question, plainText(answerSegments(f))]);
  const ld = brandPageJsonLd(TP, LOC, faq)[2].mainEntity as { name: string; acceptedAnswer: { text: string } }[];
  assert.deepEqual(ld.map((q) => [q.name, q.acceptedAnswer.text]), visible);
  assert.ok(!JSON.stringify([visible, ld]).includes('{brand}'));
});

test('a store the feed does not list gets no promotion; a block naming stores goes only to them; other vendors never show', () => {
  assert.deepEqual(brandOffers(TP, 'not-a-store', V2, '2026-11-21').promos, []);
  assert.equal(storeMayShow({ stores: [] }, 'Tempur-Pedic', 'not-a-store', V2), false);
  const only = { ...V2, promotions: [{ ...V2.promotions[0], vendor: 'Tempur-Pedic', stores: ['rockwall'] }] };
  assert.deepEqual(selectPromotions(only, { vendor: 'Tempur-Pedic', storeId: 'mcallen', today: '2026-11-21' }), []);
  assert.ok(brandOffers(TP, 'mcallen', V2, '2026-11-21').promos.every((b) => b.vendor === 'Tempur-Pedic'));
});

test('store time is America/Chicago; long dates', () => {
  assert.equal(todayInStoreTime(new Date('2026-12-02T05:59:00Z')), '2026-12-01', '11:59 PM in Chicago');
  assert.equal(todayInStoreTime(new Date('2026-12-02T06:00:00Z')), '2026-12-02');
  assert.equal(isLive({ start: '2026-11-03', end: '2026-12-01' }, '2026-11-03'), true);
  assert.equal(longDate('2027-01-05'), 'January 5');
});

/* lib/snooze/feed.ts getPromoFeed: throws on every failure (no URL, HTTP error, network error, not a feed), so a page is
   never built or regenerated with no offers; reads SNOOZE_PROMO_FEED_URL with an hourly, tagged cache. */
test('getPromoFeed: throws when the feed cannot be read; returns it when it can', async (t) => {
  const realFetch = globalThis.fetch; const realUrl = process.env.SNOOZE_PROMO_FEED_URL;
  t.after(() => { globalThis.fetch = realFetch; if (realUrl === undefined) delete process.env.SNOOZE_PROMO_FEED_URL; else process.env.SNOOZE_PROMO_FEED_URL = realUrl; });
  const calls: { url: string; init: unknown }[] = [];
  const respond = (r: () => Promise<Response>) => { globalThis.fetch = (async (url: string, init: unknown) => { calls.push({ url, init }); return r(); }) as unknown as typeof fetch; };

  delete process.env.SNOOZE_PROMO_FEED_URL;
  await assert.rejects(getPromoFeed(), /SNOOZE_PROMO_FEED_URL is not set/);

  process.env.SNOOZE_PROMO_FEED_URL = 'https://script.google.com/macros/s/TEST/exec';
  respond(async () => new Response('{}', { status: 500 }));
  await assert.rejects(getPromoFeed(), /HTTP 500/);
  respond(async () => { throw new TypeError('fetch failed'); });
  await assert.rejects(getPromoFeed(), /fetch failed/);
  respond(async () => new Response('<html>sign in</html>', { status: 200, headers: { 'content-type': 'text/html' } }));
  await assert.rejects(getPromoFeed());
  respond(async () => new Response(JSON.stringify({ version: 2, stores: {} }), { status: 200 }));
  await assert.rejects(getPromoFeed(), /bad shape/);

  respond(async () => new Response(JSON.stringify(V2), { status: 200 }));
  const feed = await getPromoFeed();
  assert.equal(feed.version, 2);
  assert.equal(calls.at(-1)!.url, 'https://script.google.com/macros/s/TEST/exec');
  assert.deepEqual(calls.at(-1)!.init, { next: { revalidate: 3600, tags: ['promo-feed'] } });
});
