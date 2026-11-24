// The shared promo code's three rules for an offer block (lib/brand-pages/snooze-promo.js, Travis's fix of 2026-11-23,
// copied unchanged), through renderPromotionsHTML, the code path the brand pages use (lib/brand-pages/render.ts):
//   heading    = block.headline || block.event + ": " + block.vendor + " savings"
//   fine print = block.fine_print || the items' fine_print, deduplicated, joined with a space
//   image      = images[block.image] || images["default"]
// A block that has its own headline, fine print and image renders exactly as before the fix.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Promo } from '../lib/brand-pages/offers.ts';
import type { PromoImage, Promotion } from '../lib/brand-pages/types.ts';

const IMAGES: Record<string, PromoImage> = {
  base: { file: 'base.webp', w: 1592, h: 948, alt: 'Base' },
  default: { file: 'icomfort.webp', w: 493, h: 402, alt: 'Serta iComfort mattress' },
};
const OPTS = { imageBase: '/brands/x/img/', bookingUrl: '/booking', images: IMAGES };
const block = (over: Partial<Promotion>): Promotion => ({
  block: 'BF26-X', vendor: 'Serta', event: 'Black Friday Sale', start: '2026-11-03', end: '2026-12-01', headline: '',
  items: [{ text: 'Save up to $700 on Serta Perfect Sleeper', start: '2026-11-03', end: '2026-12-01' }],
  ...over,
});
const render = (b: Promotion, opts = OPTS) => Promo.renderPromotionsHTML([b], opts);

test('no headline: the heading is "<event>: <vendor> savings" (never an empty <h2>)', () => {
  const html = render(block({ headline: '' }));
  assert.ok(html.includes('<h2>Black Friday Sale: Serta savings</h2>'));
  assert.ok(!html.includes('<h2></h2>'));
  assert.ok(render(block({ headline: '', event: 'Holiday & Year-End Sale' })).includes('<h2>Holiday &amp; Year-End Sale: Serta savings</h2>'), 'escaped');
});

test('no block fine print: the items\' fine print, deduplicated, joined with a space', () => {
  const items = [
    { text: 'A', start: '2026-11-03', end: '2026-12-01', fine_print: 'Offer valid November 3 – December 1, 2026 on the models named.' },
    { text: 'B', start: '2026-11-03', end: '2026-12-01', fine_print: 'See store for details.' },
    { text: 'C', start: '2026-11-03', end: '2026-12-01', fine_print: 'Offer valid November 3 – December 1, 2026 on the models named.' },
    { text: 'D', start: '2026-11-03', end: '2026-12-01' },
  ];
  const html = render(block({ items }));
  assert.ok(html.includes('<p class="snz-fine">Offer valid November 3 – December 1, 2026 on the models named. See store for details.</p>'));
  assert.equal(html.match(/snz-fine/g)?.length, 1);
  // no fine print anywhere: no empty paragraph
  assert.ok(!render(block({ items: [{ text: 'A', start: '2026-11-03', end: '2026-12-01' }] })).includes('snz-fine'));
});

test('no image key: the brand\'s default promo image; no default either: no image', () => {
  assert.ok(render(block({ image: undefined })).includes('<img src="/brands/x/img/icomfort.webp" width="493" height="402" loading="lazy" alt="Serta iComfort mattress">'));
  assert.ok(render(block({ image: '' })).includes('icomfort.webp'));
  assert.ok(!render(block({ image: undefined }), { ...OPTS, images: { base: IMAGES.base } }).includes('<img'));
});

test('a block WITH its own headline, fine print and image: output unchanged (the block\'s own values win)', () => {
  const b = block({
    headline: 'Save Up to $500 on Tempur-Pedic Smart Base Sets',
    fine_print: 'Offers valid November 3 – December 1, 2026 on the models named. See store for details.',
    image: 'base',
    items: [{ text: '$300 off Tempur-LuxeAdapt', start: '2026-11-03', end: '2026-12-01', fine_print: 'Item note that must not show.' }],
  });
  assert.equal(render(b),
    '<section class="snz-local snz-promo" aria-label="Serta Black Friday Sale offers"><div class="snz-inner"><div>' +
    '<p class="snz-event">Black Friday Sale · Through December 1</p>' +
    '<h2>Save Up to $500 on Tempur-Pedic Smart Base Sets</h2>' +
    '<ul><li>$300 off Tempur-LuxeAdapt</li></ul>' +
    '<div class="snz-btns"><a class="snz-btn snz-btn--orange" href="/booking">Book Free Dream Mapping</a></div>' +
    '<p class="snz-fine">Offers valid November 3 – December 1, 2026 on the models named. See store for details.</p>' +
    '</div><img src="/brands/x/img/base.webp" width="1592" height="948" loading="lazy" alt="Base"></div></section>');
});
