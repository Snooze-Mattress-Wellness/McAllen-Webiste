// The Sales page (/mattress-sales): the package renderer (lib/snooze/snooze-sales.js, unchanged) fed this site's
// location data, McAllen's clearance mapping and the live-brand-links rule (lib/snooze/sales-site.ts). Fixtures only
// (test data, never shipped): the package's v2 example feed and clearance example. The rendered page body must equal
// the package previews byte for byte, apart from the brand-card links of brand pages that aren't live here.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import Sales from '../lib/snooze/snooze-sales.js';
import { BRAND_PAGE_LOCATION as LOC } from '../lib/location.ts';
import { clearanceForSales, clearanceLabel, savingsPct, withLiveBrandLinks } from '../lib/snooze/sales-site.ts';
import type { Listing } from '../lib/clearance.ts';

const fixture = (name: string) => JSON.parse(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8'));
const FEED = fixture('promo-feed.v2-example.fixture.json');
const CLEARANCE_EXAMPLE = fixture('clearance.example.fixture.json').items;
// the package previews: tools/build-sales-page.mjs output (preview mode: relative asset paths), read from the package
// folder next to this repo; the comparison is skipped where the package isn't present
const PKG = 'D:/Snooze Site/Packages/snooze-local-pages-v4';
const preview = (file: string) => { try { return readFileSync(`${PKG}/${file}`, 'utf8'); } catch { return null; } };

/* ---------- clearance mapping (B4) ---------- */
const NOW = Date.parse('2026-11-23T12:00:00-06:00');
const listing = (over: Partial<Listing>): Listing => ({
  id: 'MCA-1', category: 'mattress', brand: 'Bed Tech', model: 'BT3000', size: 'Queen', condition: 'Floor model', newInBox: false,
  retail: 1599, sale: 999, qty: 1, listed: '2026-11-19', photos: ['https://lh3.googleusercontent.com/d/abc'], description: '', status: 'available', ...over,
});

test('clearance mapping: fields, savings %, label', () => {
  const [item] = clearanceForSales([listing({})], NOW);
  assert.deepEqual(item, { id: 'MCA-1', brand: 'Bed Tech', name: 'BT3000', size: 'Queen', price: 999, retail: 1599, savings_pct: 38, qty: 1, label: 'Floor model', image: 'https://lh3.googleusercontent.com/d/abc', url: '/clearance#MCA-1' });
  assert.equal(savingsPct(1499, 899), 40);
  assert.equal(savingsPct(2699, 1850), 31);
  assert.equal(savingsPct(0, 500), 0, 'no retail');
  assert.equal(savingsPct(400, 500), 0, 'retail below sale');
  assert.equal(savingsPct(500, 500), 0);
  assert.equal(clearanceLabel('Floor model'), 'Floor model');
  assert.equal(clearanceLabel('FLOOR sample'), 'Floor model');
  assert.equal(clearanceLabel('Clearance – new in box'), 'Clearance');
  assert.equal(clearanceLabel('Open box'), 'Clearance');
  assert.equal(clearanceForSales([listing({ model: '', category: 'base' })], NOW)[0].name, 'base', 'no model: the category');
  assert.equal(clearanceForSales([listing({ photos: [] })], NOW)[0].image, '');
});

test('clearance mapping: hidden, sold (even with the SOLD ribbon still showing), qty 0 and expired listings are left out', () => {
  const items = clearanceForSales([
    listing({ id: 'ok' }),
    listing({ id: 'hidden', status: 'hidden' }),
    listing({ id: 'sold-today', status: 'sold', soldDate: '2026-11-23' }),
    listing({ id: 'qty0', qty: 0 }),
    listing({ id: 'expired', listed: '2026-10-01' }),
    listing({ id: 'recent', listed: '2026-10-28' }),
  ], NOW);
  assert.deepEqual(items.map((i) => i.id), ['ok', 'recent']);
});

test('clearance: the page shows the top 4 by savings', () => {
  const items = clearanceForSales([
    listing({ id: 'a', retail: 1000, sale: 900 }), listing({ id: 'b', retail: 1000, sale: 500 }), listing({ id: 'c', retail: 1000, sale: 700 }),
    listing({ id: 'd', retail: 1000, sale: 600 }), listing({ id: 'e', retail: 1000, sale: 800 }), listing({ id: 'f', retail: 1000, sale: 400 }),
  ], NOW);
  const m = Sales.buildSalesModel(FEED, LOC, { today: '2026-11-21', clearance: items });
  assert.deepEqual(m.clearance.map((c: { id: string }) => c.id), ['f', 'b', 'd', 'c']);
});

/* ---------- brand card links (B5) ---------- */
test('brand cards link only brand pages live here; the others say "Try {Brand} in store" -> /booking', () => {
  // the example feed leaves Beautyrest's brand_page_url empty; the live Offer Calendar feed carries /beautyrest
  const feed = withLiveBrandLinks({ ...FEED, brands: FEED.brands.map((b: { brand: string }) => (b.brand === 'Beautyrest' ? { ...b, brand_page_url: '/beautyrest' } : b)) });
  const urls = Object.fromEntries(feed.brands.map((b: { brand: string; brand_page_url: string }) => [b.brand, b.brand_page_url]));
  assert.equal(urls['Tempur-Pedic'], '/tempur-pedic');
  assert.equal(urls['Beautyrest'], '/beautyrest');
  assert.equal(urls['Serta'], '');
  assert.equal(urls['Sealy'], '');
  assert.equal(urls['Stearns & Foster'], '');
  assert.equal(FEED.brands.find((b: { brand: string }) => b.brand === 'Sealy').brand_page_url, '/sealy', 'the original feed is not changed');
  const html = Sales.renderSalesHTML(Sales.buildSalesModel(feed, LOC, { today: '2026-11-21', clearance: [] }), { assetBase: '/brands/' });
  assert.ok(html.includes('href="/tempur-pedic">Explore Tempur-Pedic'));
  assert.ok(html.includes('href="/beautyrest">Explore Beautyrest'));
  assert.ok(html.includes('href="/booking">Try Sealy in store'));
  assert.ok(html.includes('href="/booking">Try Stearns &amp; Foster in store'));
  assert.ok(!html.includes('href="/sealy"') && !html.includes('href="/stearns-foster"'));
});

/* ---------- dates in store time ---------- */
test('dates: an offer that ended yesterday is gone, one starting tomorrow is not shown (America/Chicago)', () => {
  const blocks = (today: string) => [...new Set(Sales.selectSalesOffers(FEED, { storeId: 'mcallen', today }).map((o: { block: string }) => o.block))];
  assert.ok(blocks('2026-12-01').includes('BF26-TEMPUR'), 'last day');
  assert.ok(!blocks('2026-12-02').includes('BF26-TEMPUR'), 'ended yesterday');
  assert.ok(!blocks('2026-12-14').includes('NY26-TEMPUR'), 'starts tomorrow');
  assert.ok(blocks('2026-12-15').includes('NY26-TEMPUR'), 'first day');
  assert.equal(Sales.todayIn('America/Chicago', new Date('2026-12-02T05:59:00Z')), '2026-12-01');
  assert.equal(Sales.todayIn('America/Chicago', new Date('2026-12-02T06:00:00Z')), '2026-12-02');
});

/* ---------- the package previews, byte for byte ---------- */
// what tools/build-sales-page.mjs does in preview mode, with this site's location, McAllen's link rule and the given clearance
function previewBody(today: string, clearance: unknown[]) {
  const feedForPage = { ...FEED, brands: (FEED.brands || []).map((b: { logo_file: string }) => ({ ...b, logo_file: b.logo_file.replace(/^\/brands\//, 'brands/') })) };
  const m = Sales.buildSalesModel(withLiveBrandLinks(feedForPage), LOC, { today, clearance });
  return Sales.renderSalesHTML(m, { assetBase: 'brands/', dreamImage: { src: 'shared/img/dream-mapping.webp', alt: "A Sleep Coach in Snooze Blues reviews a guest's Dream Mapping results on screen", w: 1000, h: 666 } });
}
const bodyOf = (html: string) => {
  const a = '<!-- ===== Site header (provided by the Snooze site layout) ===== -->\n';
  const b = '\n\t<!-- ===== Site footer (provided by the Snooze site layout) ===== -->';
  return html.slice(html.indexOf(a) + a.length, html.indexOf(b));
};
// the only intended difference: Sealy and Stearns & Foster have no brand page on this site yet
const LINK_CHANGES: [string, string][] = [
  ['<a class="snz-s-link" href="/sealy">Explore Sealy <span aria-hidden="true">→</span></a>', '<a class="snz-s-link" href="/booking">Try Sealy in store <span aria-hidden="true">→</span></a>'],
  ['<a class="snz-s-link" href="/stearns-foster">Explore Stearns &amp; Foster <span aria-hidden="true">→</span></a>', '<a class="snz-s-link" href="/booking">Try Stearns &amp; Foster in store <span aria-hidden="true">→</span></a>'],
];
for (const [file, today, clearance, changes] of [
  ['mcallen-mattress-sales.html', '2026-11-21', CLEARANCE_EXAMPLE, 2],
  ['mcallen-mattress-sales-dec20.html', '2026-12-20', CLEARANCE_EXAMPLE, 2],
  ['mcallen-mattress-sales-no-event.html', '2027-02-01', [], 0],
] as const) {
  test(`page body = package preview ${file} (today ${today}), except the ${changes} brand links`, { skip: preview(file) === null && 'package not present' }, () => {
    let expected = bodyOf(preview(file)!);
    let made = 0;
    for (const [from, to] of LINK_CHANGES) if (expected.includes(from)) { expected = expected.split(from).join(to); made++; }
    assert.equal(made, changes);
    assert.equal(previewBody(today, clearance as unknown[]), expected);
  });
}
