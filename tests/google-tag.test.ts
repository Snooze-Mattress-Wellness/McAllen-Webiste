// Google tag helpers (lib/google-tag.ts). Node's built-in test runner: `npm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ADS_ID, BOOKING_CONVERSION, CALL_CONVERSION, GA4_PRIMARY_ID, GA4_SECONDARY_ID, PRODUCTION_HOST, contentGroup, ga4PageParams, googleTagBlock, isBookingConfirmation, isProductionHost, pageLanguage } from '../lib/google-tag.ts';
import { LOCATION } from '../lib/location.ts';

test('ids: the two GA4 properties and the Google Ads account', () => {
  assert.equal(GA4_PRIMARY_ID, 'G-9R1JGVBRBR');
  assert.equal(GA4_SECONDARY_ID, 'G-TS1RXQVPYT');
  assert.equal(ADS_ID, 'AW-17532275127');
});

test('BOOKING_CONVERSION: the exact send_to, value and currency of the Dream Mapping booking conversion', () => {
  assert.deepEqual(BOOKING_CONVERSION, { send_to: 'AW-17532275127/LVkqCI324J8cELeThahB', value: 100.0, currency: 'USD' });
});

test('CALL_CONVERSION: the call-tracking config with the exact visible store number', () => {
  assert.deepEqual(CALL_CONVERSION, { send_to: 'AW-17532275127/pDDQCNjqipgbELeThahB', phone_conversion_number: '(956) 586-5646' });
  assert.equal(CALL_CONVERSION.phone_conversion_number, LOCATION.phone, 'must match the number the header, footer and pages show');
});

test('contentGroup: every route of the site maps to one of the eleven groups, Spanish copies the same as English', () => {
  const cases: Record<string, string[]> = {
    home: ['/', '/es', '/es/'],
    product: ['/mattresses', '/es/mattresses', '/queen-mattresses', '/king-mattresses', '/full-twin-mattresses', '/cooling-mattresses', '/memory-foam-mattresses', '/mattresses-for-back-pain', '/adjustable-mattress-bases', '/massage-chairs', '/sleep-recliner', '/pillows', '/premium-sheets', '/mattress-protectors', '/at-home-sleep-test-kit-by-sleepcorner', '/mattress-sales', '/es/mattress-sales/'],
    brand: ['/tempur-pedic', '/tempur-pedic/', '/es/tempur-pedic'],
    booking: ['/booking', '/es/booking', '/dream-mapping', '/es/dream-mapping', '/dream/map/thank/you', '/es/dream/map/thank/you/'],
    quiz: ['/sleep-quiz', '/es/sleep-quiz'],
    clearance: ['/clearance'],
    location: ['/mattress-store-edinburg', '/mattress-store-mission', '/es/mattress-store-pharr'],
    blog: ['/blog', '/blog/pressure-mapping-for-sleep', '/es/blog', '/es/blog/custom-mattresses-improving-health/'],
    financing: ['/mattress-financing', '/es/mattress-financing'],
    contact: ['/contact-us', '/es/contact-us', '/thank/you', '/es/thank/you'],
    other: ['/about-us', '/faq', '/how-to-choose-a-mattress', '/privacy-policy-page', '/es/terms-conditions-page', '/something-new', '/es/something-new'],
  };
  for (const [group, paths] of Object.entries(cases)) for (const p of paths) assert.equal(contentGroup(p), group, p);
});

test('pageLanguage + ga4PageParams: /es and everything under it is es, the rest en', () => {
  for (const p of ['/es', '/es/', '/es/booking', '/es/blog/x']) assert.equal(pageLanguage(p), 'es', p);
  for (const p of ['/', '/booking', '/espanol', '/blog/es']) assert.equal(pageLanguage(p), 'en', p);
  assert.deepEqual(ga4PageParams('/'), { content_group: 'home', page_language: 'en' });
  assert.deepEqual(ga4PageParams('/es/booking'), { content_group: 'booking', page_language: 'es' });
  assert.equal(JSON.stringify(ga4PageParams('/es/clearance')), '{"content_group":"clearance","page_language":"es"}');
});

test('isProductionHost: the production custom domain only; previews, per-deployment URLs and localhost are not', () => {
  assert.equal(PRODUCTION_HOST, 'mcallen.snoozemattresscompany.com');
  assert.equal(isProductionHost('mcallen.snoozemattresscompany.com'), true);
  assert.equal(isProductionHost('MCALLEN.snoozemattresscompany.com'), true);
  for (const h of ['mc-allen-webiste-e1s1h7j3d-snooze-mattress.vercel.app', 'mc-allen-webiste.vercel.app', 'localhost', '127.0.0.1', 'snoozemattresscompany.com', 'www.mcallen.snoozemattresscompany.com', '', null, undefined]) assert.equal(isProductionHost(h), false, String(h));
});

test('googleTagBlock: dataLayer and gtag() for everyone, then the loader and the config calls inside the production-host check', () => {
  const block = googleTagBlock('G-TEST', ["gtag('config', 'G-TEST', {\"content_group\":\"home\"});", "gtag('config', 'AW-1');"]);
  const order = ['window.dataLayer = window.dataLayer || [];', 'function gtag(){dataLayer.push(arguments);}', "if (location.hostname === 'mcallen.snoozemattresscompany.com') {", "src: 'https://www.googletagmanager.com/gtag/js?id=G-TEST'", "gtag('js', new Date());", "gtag('config', 'G-TEST', {\"content_group\":\"home\"});", "gtag('config', 'AW-1');", '}'];
  let at = -1;
  for (const part of order) { const i = block.indexOf(part, at + 1); assert.ok(i > at, `expected in order: ${part}`); at = i; }
  assert.equal(block.split('if (location.hostname').length - 1, 1, 'one gate');
  assert.ok(block.includes('async: true'), 'the loader is async');
});

test('isBookingConfirmation: the booking confirmation page in both languages, with or without a trailing slash', () => {
  for (const p of ['/dream/map/thank/you', '/dream/map/thank/you/', '/es/dream/map/thank/you', '/es/dream/map/thank/you/']) assert.equal(isBookingConfirmation(p), true, p);
  for (const p of ['/', '/booking', '/es/booking', '/thank/you', '/es/thank/you', '/dream/map', '/dream/map/thank/you/x', '/clearance']) assert.equal(isBookingConfirmation(p), false, p);
});
