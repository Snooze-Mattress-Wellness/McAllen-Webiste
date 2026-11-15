// Meta Pixel helpers (lib/meta-pixel.ts). Node's built-in test runner: `npm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { META_PIXEL_ID, META_PIXEL_NOSCRIPT, META_PIXEL_SNIPPET, conversionForPath, isDirectionsHref, isTelHref, track } from '../lib/meta-pixel.ts';

test('base code: loads fbevents.js, inits the pixel and scopes its PageView to it; the noscript image carries the id', () => {
  assert.equal(META_PIXEL_ID, '1451635126439330');
  assert.ok(META_PIXEL_SNIPPET.includes("'https://connect.facebook.net/en_US/fbevents.js'"));
  assert.ok(META_PIXEL_SNIPPET.includes(`fbq('init','${META_PIXEL_ID}')`));
  assert.ok(META_PIXEL_SNIPPET.includes(`fbq('trackSingle','${META_PIXEL_ID}','PageView')`), 'PageView must not broadcast to the GTM pixel');
  assert.ok(!/fbq\('track',/.test(META_PIXEL_SNIPPET));
  assert.equal(META_PIXEL_NOSCRIPT, `<img height="1" width="1" style="display:none" alt="" src="https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1"/>`);
});

test('isTelHref: tel: links only', () => {
  assert.equal(isTelHref('tel:+19565865646'), true);
  assert.equal(isTelHref(' TEL:9565865646'), true);
  assert.equal(isTelHref('mailto:hi@example.com'), false);
  assert.equal(isTelHref('/contact-us'), false);
  assert.equal(isTelHref(null), false);
});

test('isDirectionsHref: Google Maps (place links, query links, short links), Apple Maps, Waze, geo:; nothing else', () => {
  for (const ok of [
    'https://www.google.com/maps/place/?q=place_id:ChIJBYBxOXChZYYR48f71GAS7YY',
    'https://www.google.com/maps?q=Snooze+Mattress',
    'https://google.com/maps/dir/?api=1&destination=1,2',
    'https://maps.google.com/?q=x',
    'https://maps.app.goo.gl/AbC123',
    'https://goo.gl/maps/AbC123',
    'https://g.page/snooze-mcallen',
    'https://maps.apple.com/?q=Snooze',
    'https://www.waze.com/ul?ll=26.27,-98.21',
    'geo:26.2746879,-98.2189774',
  ]) assert.equal(isDirectionsHref(ok), true, ok);
  for (const no of ['https://www.google.com/search?q=maps', 'https://www.facebook.com/p/x', '/mattress-store-edinburg', 'tel:9565865646', '', undefined]) assert.equal(isDirectionsHref(no), false, String(no));
});

test('conversionForPath: the contact opt-in confirmation page is a Lead; the booking confirmation page is not mapped', () => {
  assert.equal(conversionForPath('/thank/you'), 'Lead');
  assert.equal(conversionForPath('/es/thank/you/'), 'Lead');
  assert.equal(conversionForPath('/dream/map/thank/you'), null, 'Schedule is reserved for a booking-iframe submit message');
  assert.equal(conversionForPath('/'), null);
  assert.equal(conversionForPath('/clearance'), null);
});

test('track(): no-op without window.fbq; otherwise trackSingle with this pixel id', () => {
  const g = globalThis as unknown as { window?: unknown };
  assert.equal(track('Contact'), false, 'no window in Node');
  const calls: unknown[][] = [];
  g.window = { fbq: (...args: unknown[]) => { calls.push(args); } };
  try {
    assert.equal(track('Lead'), true);
    assert.equal(track('FindLocation', { source: 'footer' }), true);
    assert.deepEqual(calls, [['trackSingle', META_PIXEL_ID, 'Lead'], ['trackSingle', META_PIXEL_ID, 'FindLocation', { source: 'footer' }]]);
    g.window = {};
    assert.equal(track('Contact'), false, 'window without fbq');
  } finally { delete g.window; }
});
