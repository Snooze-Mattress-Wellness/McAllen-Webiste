// Hidden CRM fields for the LeadConnector widgets (lib/crm-params.ts): the inline script is run against a small fake
// document. Node's built-in test runner: `npm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BOOKING_CALENDAR_ID, CONTACT_FORM_ID, CRM_PARAMS, CRM_PARAM_NAMES, GCLID_COOKIE, GCLID_COOKIE_DAYS, crmFrameSrcScript } from '../lib/crm-params.ts';

const BOOKING_SRC = `https://link.snoozesleep.com/widget/booking/${BOOKING_CALENDAR_ID}`;
const CONTACT_SRC = `https://link.snoozesleep.com/widget/form/${CONTACT_FORM_ID}`;

class Frame {
  nodeType = 1; tagName = 'IFRAME'; attrs: Record<string, string>;
  constructor(attrs: Record<string, string>) { this.attrs = { ...attrs }; }
  getAttribute(n: string) { return n in this.attrs ? this.attrs[n] : null; }
  setAttribute(n: string, v: string) { this.attrs[n] = v; }
  hasAttribute(n: string) { return n in this.attrs; }
  querySelectorAll() { return []; }
}

type Observer = (records: { addedNodes: unknown[] }[]) => void;

/** Runs the inline script against a fake window/document/location; returns handles to poke it. */
function run({ search = '', cookies = '', protocol = 'https:' }: { search?: string; cookies?: string; protocol?: string } = {}) {
  const jar: string[] = []; const frames: Frame[] = []; let observer: Observer | null = null; let observed: unknown = null;
  const listeners: Record<string, (() => void)[]> = {};
  const document = {
    get cookie() { return [cookies, ...jar.map((c) => c.split(';')[0])].filter(Boolean).join('; '); },
    set cookie(v: string) { jar.push(v); },
    documentElement: { nodeType: 1, tagName: 'HTML', querySelectorAll: () => frames },
    addEventListener(n: string, fn: () => void) { (listeners[n] ||= []).push(fn); },
    getElementById(id: string) { return frames.find((f) => f.attrs.id === id) || null; },
  };
  const location = { search, protocol, hostname: 'mcallen.snoozemattresscompany.com', href: `${protocol}//mcallen.snoozemattresscompany.com/booking${search}` };
  class MutationObserver { constructor(cb: Observer) { observer = cb; } observe(target: unknown, opts: unknown) { observed = { target, opts }; } }
  const window: Record<string, unknown> = {};
  new Function('window', 'document', 'location', 'MutationObserver', 'URL', 'URLSearchParams', CRM_PARAMS)(window, document, location, MutationObserver, URL, URLSearchParams);
  const crm = window.snzCrm as { withParams: (s: string) => string; gclid: () => string; clientId: () => string };
  return { crm, document, jar, frames, listeners, observed: () => observed, observe: (nodes: unknown[]) => observer!([{ addedNodes: nodes }]) };
}

test('constants: the two widget ids, the cookie and the parameter names the GHL hidden fields must use', () => {
  assert.equal(BOOKING_CALENDAR_ID, 'lrAns7Z8j3vEJW3DC0Yr');
  assert.equal(CONTACT_FORM_ID, '0BTnYKylVR6OcWJug3r8');
  assert.deepEqual(CRM_PARAM_NAMES, { clientId: 'ga_client_id', gclid: 'gclid' });
  assert.equal(GCLID_COOKIE, 'snz_gclid'); assert.equal(GCLID_COOKIE_DAYS, 90);
  for (const s of [BOOKING_CALENDAR_ID, CONTACT_FORM_ID, GCLID_COOKIE, 'ga_client_id', 'gclid', 'MutationObserver']) assert.ok(CRM_PARAMS.includes(s), s);
});

test('landing with ?gclid=…: stored in the 90-day first-party cookie; read back from the URL, the cookie or _gcl_aw', () => {
  const a = run({ search: '?utm_source=google&gclid=TeSt_123-abc' });
  assert.equal(a.jar.length, 1);
  assert.equal(a.jar[0], `snz_gclid=TeSt_123-abc; max-age=${90 * 86400}; path=/; SameSite=Lax; Secure`);
  assert.equal(a.crm.gclid(), 'TeSt_123-abc');
  const http = run({ search: '?gclid=x', protocol: 'http:' });
  assert.equal(http.jar[0], `snz_gclid=x; max-age=${90 * 86400}; path=/; SameSite=Lax`, 'no Secure flag on http (localhost)');
  const b = run({ cookies: 'snz_gclid=fromcookie; _ga=GA1.1.1.2' });
  assert.equal(b.jar.length, 0, 'nothing written without a gclid in the URL'); assert.equal(b.crm.gclid(), 'fromcookie');
  const c = run({ cookies: '_gcl_aw=GCL.1794851592.EAIaIQob' });
  assert.equal(c.crm.gclid(), 'EAIaIQob', "Google's conversion-linker cookie as the fallback");
  assert.equal(run().crm.gclid(), '');
});

test('clientId: the _ga cookie without its GA1.1. prefix (any GA<n>.<n>. prefix)', () => {
  assert.equal(run({ cookies: '_gcl_au=1.1.5; _ga=GA1.1.774197126.1794851580; _ga_9R1JGVBRBR=GS2.1.s1' }).crm.clientId(), '774197126.1794851580');
  assert.equal(run({ cookies: '_ga=GA1.2.12345.67890' }).crm.clientId(), '12345.67890');
  assert.equal(run({ cookies: '_ga_9R1JGVBRBR=GS2.1.s1' }).crm.clientId(), '');
});

test('withParams: appends ga_client_id and gclid only when present, keeping existing query strings', () => {
  const both = run({ search: '?gclid=G1', cookies: '_ga=GA1.1.111.222' }).crm;
  assert.equal(both.withParams(BOOKING_SRC), `${BOOKING_SRC}?ga_client_id=111.222&gclid=G1`);
  assert.equal(both.withParams(`${CONTACT_SRC}?x=1`), `${CONTACT_SRC}?x=1&ga_client_id=111.222&gclid=G1`);
  assert.equal(run({ cookies: '_ga=GA1.1.111.222' }).crm.withParams(BOOKING_SRC), `${BOOKING_SRC}?ga_client_id=111.222`);
  assert.equal(run({ search: '?gclid=G1' }).crm.withParams(BOOKING_SRC), `${BOOKING_SRC}?gclid=G1`);
  assert.equal(run().crm.withParams(BOOKING_SRC), BOOKING_SRC, 'untouched when neither is present');
});

test('the observer rewrites only the two widget frames (with a src), once; src-less data-snz-src frames are left to the inline script', () => {
  const r = run({ search: '?gclid=G1', cookies: '_ga=GA1.1.111.222' });
  const o = r.observed() as { target: unknown; opts: { childList: boolean; subtree: boolean } };
  assert.equal(o.target, r.document.documentElement); assert.deepEqual(o.opts, { childList: true, subtree: true });
  const contact = new Frame({ loading: 'lazy', src: CONTACT_SRC, id: `inline-${CONTACT_FORM_ID}` });
  const booking = new Frame({ 'data-snz-src': BOOKING_SRC, id: `${BOOKING_CALENDAR_ID}_1788459899479` });
  const reviews = new Frame({ src: 'https://reputationhub.site/reputation/widgets/review_widget/x', class: 'lc_reviews_widget' });
  const chat = new Frame({ src: 'https://link.snoozesleep.com/widget/booking/otherCalendar' });
  const wrapper = { nodeType: 1, tagName: 'DIV', querySelectorAll: () => [contact, reviews] };
  r.observe([wrapper, booking, chat, { nodeType: 3 }]);
  assert.equal(contact.attrs.src, `${CONTACT_SRC}?ga_client_id=111.222&gclid=G1`); assert.equal(contact.attrs['data-snz-crm'], '1');
  assert.equal('src' in booking.attrs, false, 'Chrome drops a src set from the insertion microtask: the inline script after the frame sets it');
  assert.equal('data-snz-crm' in booking.attrs, false);
  assert.equal(reviews.attrs.src, 'https://reputationhub.site/reputation/widgets/review_widget/x'); assert.equal('data-snz-crm' in reviews.attrs, false);
  assert.equal(chat.attrs.src, 'https://link.snoozesleep.com/widget/booking/otherCalendar', 'other calendars are not touched');
  r.observe([wrapper, booking]);
  assert.equal(contact.attrs.src, `${CONTACT_SRC}?ga_client_id=111.222&gclid=G1`, 'a second sighting changes nothing');
  r.frames.push(contact); r.listeners.DOMContentLoaded[0]();
  assert.equal(contact.attrs.src, `${CONTACT_SRC}?ga_client_id=111.222&gclid=G1`, 'the DOMContentLoaded sweep is idempotent');
});

test('crmFrameSrcScript: sets the frame src from data-snz-src with the parameters (plain when the helper is missing)', () => {
  const r = run({ search: '?gclid=G1', cookies: '_ga=GA1.1.111.222' });
  const frame = new Frame({ 'data-snz-src': BOOKING_SRC, id: 'cal_1' });
  r.frames.push(frame);
  const script = crmFrameSrcScript('cal_1');
  assert.ok(script.includes('"cal_1"'));
  new Function('window', 'document', script)({ snzCrm: r.crm }, r.document);
  assert.equal(frame.attrs.src, `${BOOKING_SRC}?ga_client_id=111.222&gclid=G1`);
  r.observe([frame]);
  assert.equal(frame.attrs.src, `${BOOKING_SRC}?ga_client_id=111.222&gclid=G1`, 'the observer then sees a src that already carries the parameters and changes nothing');
  assert.equal(frame.attrs['data-snz-crm'], '1');
  const bare = new Frame({ 'data-snz-src': BOOKING_SRC, id: 'cal_2' }); r.frames.push(bare);
  new Function('window', 'document', crmFrameSrcScript('cal_2'))({}, r.document);
  assert.equal(bare.attrs.src, BOOKING_SRC, 'without window.snzCrm the frame still loads');
});
