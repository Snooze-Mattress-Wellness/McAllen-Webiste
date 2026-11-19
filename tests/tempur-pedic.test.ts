// The Tempur-Pedic brand page's store facts and FAQ (lib/tempur-pedic.ts), built from lib/location.ts, against the exact
// strings of the package's mcallen.html. Node's built-in test runner: `npm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LOCATION } from '../lib/location.ts';
import { addressLines, addressOneLine, faqItems, hoursSentence, listAnd, nearbyTowns, plainText } from '../lib/tempur-pedic.ts';

test('store facts from lib/location.ts are the values the package HTML was written with', () => {
  assert.deepEqual(addressLines(LOCATION), ['7913 N 10th St, Suite 130', 'McAllen, TX 78504']);
  assert.equal(addressOneLine(LOCATION), '7913 N 10th St, Suite 130, McAllen, TX 78504');
  assert.deepEqual([...LOCATION.hours.en], ['Mon–Sat 10 AM–7 PM', 'Sun 12–6 PM']);
  assert.equal(hoursSentence(LOCATION), 'Monday to Saturday 10 AM to 7 PM and Sunday 12 to 6 PM');
  assert.equal(LOCATION.phone, '(956) 586-5646');
  assert.equal(LOCATION.phoneHref, 'tel:+19565865646');
  assert.equal(LOCATION.mapLink, 'https://www.google.com/maps/place/?q=place_id:ChIJBYBxOXChZYYR48f71GAS7YY');
  assert.deepEqual(nearbyTowns(LOCATION), [
    { name: 'Edinburg', href: '/mattress-store-edinburg' },
    { name: 'Mission', href: '/mattress-store-mission' },
    { name: 'Pharr', href: '/mattress-store-pharr' },
  ]);
});

test('hoursSentence: AM/PM once when both times share it, minutes only when not :00', () => {
  const base = { ...LOCATION, openingHours: [{ days: ['Monday'], opens: '09:30', closes: '11:00' }, { days: ['Friday', 'Saturday'], opens: '12:00', closes: '00:00' }] };
  assert.equal(hoursSentence(base), 'Monday 9:30 to 11 AM and Friday to Saturday 12 PM to 12 AM');
  assert.equal(listAnd(['A']), 'A'); assert.equal(listAnd(['A', 'B']), 'A and B'); assert.equal(listAnd(['A', 'B', 'C']), 'A, B and C');
});

test('faqItems: questions and plain-text answers are the package FAQ (and its FAQPage JSON-LD) word for word', () => {
  const faq = faqItems(LOCATION);
  assert.deepEqual(faq.map((f) => [f.q, plainText(f.a)]), [
    ['Where can I try a Tempur-Pedic mattress in McAllen?', "At Snooze Mattress, 7913 N 10th St, Suite 130, McAllen, TX 78504. We're open Monday to Saturday 10 AM to 7 PM and Sunday 12 to 6 PM. Floor models vary, so call (956) 586-5646 to check which Tempur-Pedic models are on display."],
    ['Which Tempur-Pedic mattress is right for me?', "It depends on your body and how you sleep. Dream Mapping, our pressure mapping technology, shows where your body needs support. Then your Sleep Coach helps you compare models, like the Breeze collection if you sleep hot or the Adapt collection for pressure relief."],
    ['Is Dream Mapping free?', 'Yes. Dream Mapping is always free and no purchase is needed. Every guest gets the same fitting, whatever they plan to spend.'],
    ['Do you offer financing on Tempur-Pedic mattresses?', 'Yes. Special financing is available: 0% interest for up to 60 months with no down payment, with approved credit. No credit check options are also available. See store for details.'],
    ['Can I use my HSA or FSA?', 'Snooze Mattress accepts HSA and FSA payments on eligible purchases. Eligibility depends on your plan.'],
    ['Do you serve Edinburg, Mission and Pharr?', 'Yes. Our McAllen store also serves shoppers from Edinburg, Mission and Pharr.'],
  ]);
  // the links inside the answers: the phone, the Dream Mapping page, the three service-area pages
  const links = faq.flatMap((f) => f.a.filter((x) => typeof x !== 'string'));
  assert.deepEqual(links, [
    { text: '(956) 586-5646', href: 'tel:+19565865646' },
    { text: 'Dream Mapping', href: '/dream-mapping' },
    { text: 'Edinburg', href: '/mattress-store-edinburg' },
    { text: 'Mission', href: '/mattress-store-mission' },
    { text: 'Pharr', href: '/mattress-store-pharr' },
  ]);
  assert.equal(faqItems({ ...LOCATION, areaServed: ['McAllen'] }).length, 5, 'no nearby towns: the service-area question goes');
});
