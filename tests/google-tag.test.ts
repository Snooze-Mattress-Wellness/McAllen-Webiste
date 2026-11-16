// Google tag helpers (lib/google-tag.ts). Node's built-in test runner: `npm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ADS_ID, BOOKING_CONVERSION, GA4_PRIMARY_ID, GA4_SECONDARY_ID, isBookingConfirmation } from '../lib/google-tag.ts';

test('ids: the two GA4 properties and the Google Ads account', () => {
  assert.equal(GA4_PRIMARY_ID, 'G-9R1JGVBRBR');
  assert.equal(GA4_SECONDARY_ID, 'G-TS1RXQVPYT');
  assert.equal(ADS_ID, 'AW-17532275127');
});

test('BOOKING_CONVERSION: the exact send_to, value and currency of the Dream Mapping booking conversion', () => {
  assert.deepEqual(BOOKING_CONVERSION, { send_to: 'AW-17532275127/LVkqCI324J8cELeThahB', value: 100.0, currency: 'USD' });
});

test('isBookingConfirmation: the booking confirmation page in both languages, with or without a trailing slash', () => {
  for (const p of ['/dream/map/thank/you', '/dream/map/thank/you/', '/es/dream/map/thank/you', '/es/dream/map/thank/you/']) assert.equal(isBookingConfirmation(p), true, p);
  for (const p of ['/', '/booking', '/es/booking', '/thank/you', '/es/thank/you', '/dream/map', '/dream/map/thank/you/x', '/clearance']) assert.equal(isBookingConfirmation(p), false, p);
});
