// The brand-page module (lib/brand-pages/): the package's brand.json + template.html rendered with the shared partials,
// FAQ links, structured data and metadata, with McAllen's values, against the package's own McAllen previews (built by
// its tools/build-page.mjs from the example feed). Node's built-in test runner: `npm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import type { BrandLocation, PromoFeed } from '../lib/brand-pages/types.ts';
import { BRANDS, BRAND_KEYS } from '../lib/brand-pages/registry.ts';
import { answerSegments, brandFaq, listAnd, plainText } from '../lib/brand-pages/faq.ts';
import { brandPageJsonLd } from '../lib/brand-pages/jsonld.ts';
import { assetUrl, brandPage } from '../lib/brand-pages/page.ts';
import { brandText, renderBrandBody } from '../lib/brand-pages/render.ts';
import { PARTIALS } from '../lib/brand-pages/files.ts';
import { Promo, brandOffers } from '../lib/brand-pages/offers.ts';
import { brandPageMetadata } from '../lib/brand-pages/metadata.ts';
import { BRAND_PAGE_LOCATION, LOCATION, hoursSentence } from '../lib/location.ts';
import { BEAUTYREST_VIDEO } from '../components/brand-pages/beautyrest/video.ts';

const TP = BRANDS['tempur-pedic'];
const BR = BRANDS.beautyrest;
const SITE = 'https://mcallen.snoozemattresscompany.com';
const LOC: BrandLocation = { ...BRAND_PAGE_LOCATION, schema_ids: { organization: `${SITE}/#organization`, website: `${SITE}/#website`, store: `${SITE}/#store` } };
const fixture = (name: string) => readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8');
/** line endings as delivered (LF): a Windows checkout (core.autocrlf) gives the package copies and fixtures CRLF */
const lf = (s: string) => s.replace(/\r\n/g, '\n');
const feed = (name: string): PromoFeed => JSON.parse(fixture(`promo-feed.${name}.fixture.json`));

/** The brand body of a package preview page (page-shell.html puts it between the header and footer comments). */
const previewBody = (html: string) => {
  const start = '\t<!-- ===== Site header goes here (provided by the Snooze site layout) ===== -->\n\n';
  const end = '\n\n\t<!-- ===== Site footer goes here (provided by the Snooze site layout) ===== -->';
  const a = html.indexOf(start), b = html.indexOf(end);
  assert.ok(a > 0 && b > a, 'preview markers');
  return html.slice(a + start.length, b);
};
/** Our body for a brand on a date, the way the package previews are built (preview paths, example feed URL). */
const ourBody = (key: keyof typeof BRANDS, f: PromoFeed, today: string, l: BrandLocation = LOC) => {
  const b = BRANDS[key];
  const { promos, tiles } = brandOffers(b.json, l.store_id, f, today);
  return renderBrandBody({ brand: b.json, template: b.template, partials: PARTIALS, location: l, promos, tiles, faq: brandFaq(b.json, l, tiles), brandBase: `brands/${b.json.slug}/`, feedUrl: 'feed/promo-feed.example.json' });
};

test('registry: Tempur-Pedic from its brand.json, vendor spelled as in the feed, assets under /brands/tempur-pedic/', () => {
  assert.deepEqual(BRAND_KEYS, ['tempur-pedic', 'beautyrest']);
  assert.equal(TP.json.slug, 'tempur-pedic');
  assert.equal(TP.json.vendor, 'Tempur-Pedic');
  assert.equal(TP.json.page_path, '/tempur-pedic');
  assert.equal(TP.site.promo_slot, 'tempur_promo');
  assert.equal(TP.site.wrapper_class, 'tempur-wrapper');
  assert.ok(TP.template.includes('<div class="tempur-wrapper snz-brand snz-brand--tempur-pedic">'), 'the template carries the wrapper');
  assert.deepEqual(TP.json.promo_images, { base: { file: 'base.webp', w: 1592, h: 948, alt: 'TEMPUR-Ergo ProSmart adjustable base' } });
  const p = brandPage(TP, LOC);
  assert.equal(p.url, `${SITE}/tempur-pedic`);
  assert.equal(p.img, '/brands/tempur-pedic/img/');
});

test('assets: brand.json styles in order (shared local CSS last), our scoped Swiper CSS in place of the global one', () => {
  assert.deepEqual(TP.json.styles.map((s) => assetUrl(TP, s)), [
    '/brands/tempur-pedic/css/swiper-bundle.min.css',
    '/brands/tempur-pedic/css/tempur-pedic.scoped.css',
    '/brands/tempur-pedic/css/snooze-tempur-overrides.css',
    '/brands/shared/css/snooze-brand-local.css',
  ]);
  assert.deepEqual((TP.json.preload_images || []).map((p) => [assetUrl(TP, p.href), p.media]), [
    ['/brands/tempur-pedic/img/bg_header.webp', '(min-width: 1024px)'],
    ['/brands/tempur-pedic/img/bg_mobile_header.webp', '(max-width: 1023px)'],
  ]);
});

test('body: byte for byte the package preview mcallen-tempur-pedic.html (example feed, November 23)', () => {
  assert.equal(lf(ourBody('tempur-pedic', feed('v2-example'), '2026-11-23')), previewBody(lf(fixture('tempur-pedic.preview.fixture.html'))));
});

test('Beautyrest body: byte for byte the package previews mcallen-beautyrest.html (Nov 23) and -dec20.html (Dec 20)', () => {
  assert.equal(lf(ourBody('beautyrest', feed('v2-example'), '2026-11-23')), previewBody(lf(fixture('beautyrest.preview.fixture.html'))));
  assert.equal(lf(ourBody('beautyrest', feed('v2-example'), '2026-12-20')), previewBody(lf(fixture('beautyrest-dec20.preview.fixture.html'))));
});

test('Beautyrest: brand.json as delivered, wrapper, assets in brand.json order, hero.webp preloaded', () => {
  assert.equal(BR.json.slug, 'beautyrest');
  assert.equal(BR.json.vendor, 'Beautyrest');
  assert.equal(BR.json.page_path, '/beautyrest');
  assert.equal(BR.site.wrapper_class, 'beautyrest-wrapper');
  assert.ok(BR.template.includes('<div class="beautyrest-wrapper snz-brand snz-brand--beautyrest">'));
  assert.deepEqual(BR.json.styles.map((x) => assetUrl(BR, x)), ['/brands/beautyrest/css/beautyrest.css', '/brands/shared/css/snooze-brand-local.css']);
  assert.deepEqual((BR.json.preload_images || []).map((p) => [assetUrl(BR, p.href), p.media]), [['/brands/beautyrest/img/hero.webp', 'all']]);
  assert.equal(brandPage(BR, LOC).url, `${SITE}/beautyrest`);
  // every image the template and the promo images name is in public/brands/beautyrest/img/
  const files = [...BR.template.matchAll(/\{\{brand_base\}\}img\/([\w.-]+)/g)].map((m) => m[1]).concat(Object.values(BR.json.promo_images || {}).map((i) => i.file), 'og-image.jpg');
  for (const f of files) assert.ok(existsSync(new URL(`../public/brands/beautyrest/img/${f}`, import.meta.url)), f);
});

test('Beautyrest SEO (BEAUTYREST.md step 6): title, H1 in the hero, description, canonical, OG image, H2s; one H1', () => {
  const m = brandPageMetadata(BR, LOC);
  assert.equal(m.title, 'Beautyrest Mattresses in McAllen, TX | Snooze Mattress');
  assert.equal(m.description, 'Try Beautyrest Black, Beautyrest World Class, Beautyrest and Beauty Sleep mattresses at Snooze Mattress in McAllen. Get a free Dream Mapping fitting for your body.');
  assert.deepEqual(m.alternates, { canonical: `${SITE}/beautyrest` });
  assert.equal(m.openGraph?.description, 'Try Beautyrest in McAllen and get a free Dream Mapping fitting to find the right fit for your body.');
  assert.deepEqual(m.openGraph?.images, [{ url: `${SITE}/brands/beautyrest/img/og-image.jpg`, width: 1200, height: 630 }]);
  const { promos, tiles } = brandOffers(BR.json, 'mcallen', feed('v2-example'), '2026-11-23');
  const faq = brandFaq(BR.json, LOC, tiles);
  const html = renderBrandBody({ brand: BR.json, template: BR.template, partials: PARTIALS, location: LOC, promos, tiles, faq });
  assert.equal(html.match(/<h1\b/g)?.length, 1);
  const hero = html.slice(html.indexOf('<section class="br-hero">'), html.indexOf('</section>'));
  assert.ok(hero.includes('<h1 class="snz-h1">Beautyrest Mattresses in McAllen, TX</h1>'), 'the H1 is in the hero, under the logo');
  assert.ok(!/\{\{|\{city\}|\{state\}|\{brand\}/.test(html));
  const h2s = [...html.matchAll(/<h2[^>]*>(.*?)<\/h2>/g)].map((x) => x[1].replace(/<[^>]+>/g, '').replace(/&reg;/g, '®')).filter((t) => t);
  assert.deepEqual(h2s, ['Try Beautyrest in McAllen', ...promos.map((b) => b.headline), 'Beautyrest® at a glance', 'Discover your best with Beautyrest', 'Customize your comfort', 'The Beautyrest difference', 'Why Buy Beautyrest at Snooze Mattress in McAllen', 'Beautyrest in McAllen: Common Questions']);
  const [, , faqPage] = brandPageJsonLd(BR, LOC, faq);
  assert.equal((faqPage.mainEntity as unknown[]).length, (html.match(/<details/g) || []).length, 'FAQPage = the visible FAQ');
});

test('Beautyrest offers: both Black Friday blocks with their photos (in the shared logic\x27s order, as on the package preview), the Holiday ones from December 15, no {brand}', () => {
  const nov = brandOffers(BR.json, 'mcallen', feed('v2-example'), '2026-11-23').promos;
  assert.deepEqual(nov.map((b) => [b.block, BR.json.promo_images![b.image!].file]), [['BF26-BEAUTYREST-WC', 'world-class.webp'], ['BF26-BEAUTYREST-BLACK', 'black.webp']]);
  const dec = brandOffers(BR.json, 'mcallen', feed('v2-example'), '2026-12-20').promos;
  assert.deepEqual(new Set(dec.map((b) => b.block)), new Set(['NY26-BEAUTYREST-BLACK', 'NY26-BEAUTYREST-WC']));
  const html = Promo.renderPromotionsHTML(nov, { imageBase: '/brands/beautyrest/img/', images: BR.json.promo_images });
  assert.ok(html.includes('src="/brands/beautyrest/img/black.webp" width="900" height="900"'));
  assert.ok(html.includes('src="/brands/beautyrest/img/world-class.webp" width="900" height="900"'));
  assert.ok(!html.includes('{brand}'));
});

test('Beautyrest hero video: the loader is on exactly when the video file is in the repo', () => {
  assert.equal(existsSync(new URL('../public/brands/beautyrest/video/beautyrest.mp4', import.meta.url)), BEAUTYREST_VIDEO);
});

test('body: one H1, every token filled, production paths, the promo slot empty when nothing is live', () => {
  const { promos, tiles } = brandOffers(TP.json, 'mcallen', feed('sheet-current'), '2026-11-23');
  const html = renderBrandBody({ brand: TP.json, template: TP.template, partials: PARTIALS, location: LOC, promos, tiles, faq: brandFaq(TP.json, LOC, tiles) });
  assert.equal(html.match(/<h1\b/g)?.length, 1);
  assert.ok(html.includes('<h1 class="snz-h1">Tempur-Pedic Mattresses in McAllen, TX</h1>'));
  assert.ok(!/\{\{|\{city\}|\{state\}|\{brand\}/.test(html));
  assert.ok(html.includes('src="/brands/tempur-pedic/img/logo.svg"'));
  assert.ok(html.includes('<p class="snz-answer">Snooze Mattress + Wellness at 7913 N 10th St in McAllen carries Tempur-Pedic mattresses, adjustable bases and pillows.</p>'));
  assert.ok(html.includes('data-snz-feed-url=""'), 'nothing fetches the feed in the browser');
  assert.match(html, /data-snz-promo-slot [^>]*><\/div>/, 'empty slot');
  assert.ok(!html.includes('class="snz-tile"'));
  assert.throws(() => renderBrandBody({ brand: TP.json, template: '{{nope}}', partials: PARTIALS, location: LOC, promos, tiles, faq: [] }), /No value for \{\{nope\}\}/);
});

test('copy and metadata: brand.json patterns with the city and state filled in, OG image og-image.jpg 1200×630', () => {
  assert.equal(brandText(TP.json.title, LOC), 'Tempur-Pedic Mattresses in McAllen, TX | Snooze Mattress');
  const m = brandPageMetadata(TP, LOC);
  assert.equal(m.title, 'Tempur-Pedic Mattresses in McAllen, TX | Snooze Mattress');
  assert.equal(m.description, 'Try Tempur-Pedic Adapt, Breeze and smart adjustable bases at Snooze Mattress in McAllen. Get a free Dream Mapping fitting to find the right fit for your body.');
  assert.deepEqual(m.alternates, { canonical: `${SITE}/tempur-pedic` });
  assert.deepEqual(m.openGraph?.images, [{ url: `${SITE}/brands/tempur-pedic/img/og-image.jpg`, width: 1200, height: 630 }]);
});

test('answerSegments: each link takes the first occurrence of its text after the previous link', () => {
  const towns = brandFaq(TP.json, LOC, []).at(-1)!;
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
});

test('structured data: WebPage, BreadcrumbList and FAQPage; the FAQPage text is the visible answer text', () => {
  const faq = brandFaq(TP.json, LOC, []);
  const [webPage, crumbs, faqPage] = brandPageJsonLd(TP, LOC, faq);
  assert.equal(webPage['@id'], `${SITE}/tempur-pedic#webpage`);
  assert.equal(webPage.name, 'Tempur-Pedic Mattresses in McAllen, TX | Snooze Mattress');
  assert.deepEqual(webPage.isPartOf, { '@id': `${SITE}/#website` });
  assert.deepEqual(webPage.publisher, { '@id': `${SITE}/#organization` });
  assert.deepEqual(webPage.about, [{ '@type': 'Brand', name: 'Tempur-Pedic' }, { '@id': `${SITE}/#store` }]);
  assert.deepEqual((crumbs.itemListElement as { item: string }[]).map((c) => c.item), [`${SITE}/`, `${SITE}/mattresses`, `${SITE}/tempur-pedic`]);
  assert.deepEqual((faqPage.mainEntity as { name: string; acceptedAnswer: { text: string } }[]).map((q) => [q.name, q.acceptedAnswer.text]), faq.map((f) => [f.question, f.answer]));
  assert.ok(!JSON.stringify([webPage, crumbs, faqPage]).includes('Review'), 'no Review / AggregateRating');
});

test('location config (lib/location.ts BRAND_PAGE_LOCATION): the handoff fields, equal to the package v4 mcallen.json', () => {
  // config/locations/mcallen.json of the package (v4), field for field; the repo values are derived from LOCATION
  const pkg = {
    store_id: 'mcallen', city: 'McAllen', state: 'TX', site_url: 'https://mcallen.snoozemattresscompany.com', site_name: 'Snooze Mattress + Wellness McAllen',
    address_line1: '7913 N 10th St, Suite 130', address_line2: 'McAllen, TX 78504', hours_lines: ['Mon–Sat 10 AM–7 PM', 'Sun 12–6 PM'],
    hours_sentence: 'Monday to Saturday 10 AM to 7 PM and Sunday 12 to 6 PM', phone_display: '(956) 586-5646', phone_e164: '+19565865646',
    maps_url: 'https://www.google.com/maps/place/?q=place_id:ChIJBYBxOXChZYYR48f71GAS7YY',
    nearby: [{ name: 'Edinburg', path: '/mattress-store-edinburg' }, { name: 'Mission', path: '/mattress-store-mission' }, { name: 'Pharr', path: '/mattress-store-pharr' }],
    links: { home: '/', mattresses: '/mattresses', booking: '/booking', dream_mapping: '/dream-mapping', memory_foam: '/memory-foam-mattresses', cooling: '/cooling-mattresses', bases: '/adjustable-mattress-bases', pillows: '/pillows', contact: '/contact-us', financing: '/mattress-financing', clearance: '/clearance' },
    address_short: '7913 N 10th St', timezone: 'America/Chicago', sales_path: '/mattress-sales',
    local_intro: "Snooze Mattress on North 10th Street serves the Rio Grande Valley, including Edinburg, Mission, Pharr and Weslaco. Hot Valley nights make the right fit and cooling matter, so start with free Dream Mapping and let a Sleep Coach match you to this month's best deal.",
  };
  for (const [k, v] of Object.entries(pkg)) assert.deepEqual((BRAND_PAGE_LOCATION as Record<string, unknown>)[k], v, k);
  const tp = BRAND_PAGE_LOCATION.brand_pages['tempur-pedic'];
  assert.equal(tp.page_path, '/tempur-pedic'); assert.equal(tp.asset_base, '/brands/tempur-pedic/');
  assert.equal(BRAND_PAGE_LOCATION.business_name, 'Snooze Mattress + Wellness');
  // derived from the site's own data, so the page cannot disagree with the header, footer and structured data
  assert.equal(BRAND_PAGE_LOCATION.phone_display, LOCATION.phone);
  assert.equal(`tel:${BRAND_PAGE_LOCATION.phone_e164}`, LOCATION.phoneHref);
  assert.equal(BRAND_PAGE_LOCATION.maps_url, LOCATION.mapLink);
});

test('store_id is in the feed: the Offer Calendar Stores list (fixtures) has "mcallen" carrying Tempur-Pedic', () => {
  for (const name of ['sheet-current', 'sheet-approved']) {
    const f = feed(name);
    assert.ok(f.stores[BRAND_PAGE_LOCATION.store_id], name);
    assert.ok(f.stores[BRAND_PAGE_LOCATION.store_id].brands.includes(TP.json.vendor), name);
    assert.equal(f.stores[BRAND_PAGE_LOCATION.store_id].city, BRAND_PAGE_LOCATION.city, name);
  }
});

test('hoursSentence: AM/PM once when both times share it, minutes only when not :00', () => {
  assert.equal(hoursSentence(LOCATION.openingHours), 'Monday to Saturday 10 AM to 7 PM and Sunday 12 to 6 PM');
  assert.equal(hoursSentence([{ days: ['Monday'], opens: '09:30', closes: '11:00' }, { days: ['Friday', 'Saturday'], opens: '12:00', closes: '00:00' }]), 'Monday 9:30 to 11 AM and Friday to Saturday 12 PM to 12 AM');
});

test('local FAQ: the package questions and answers word for word, with their links; store questions (extra_faq) last', () => {
  const faq = brandFaq(TP.json, LOC, []);
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
  const extra = { question: 'Q?', answer: 'A.' };
  const withExtra = brandFaq(TP.json, { ...LOC, brand_pages: { 'tempur-pedic': { page_path: '/tempur-pedic', asset_base: '/brands/tempur-pedic/', extra_faq: [extra] } } }, []);
  assert.deepEqual(withExtra.at(-1), extra);
});

test('every brand key has a page at /<key> in the location config (the language switch and GA4 rely on it)', async () => {
  const { BRAND_PAGE_PATHS, LIVE_BRANDS } = await import('../lib/brand-pages/brand-list.ts');
  for (const b of LIVE_BRANDS) assert.equal(BRAND_PAGE_LOCATION.brand_pages[b.key]?.page_path, b.path, b.key);
  assert.deepEqual(BRAND_PAGE_PATHS, ['/tempur-pedic', '/beautyrest']);
});

test('llms.txt: the hand-written guide plus a "Brand pages" section from the registry; nothing cut off', async () => {
  const { buildLlmsTxt, llmsBrandPagesSection } = await import('../lib/brand-pages/llms.ts');
  const base = readFileSync(new URL('../lib/llms.txt', import.meta.url), 'utf8');
  const out = buildLlmsTxt(base, LOC);
  const section = '## Brand pages\n- [Tempur-Pedic at Snooze Mattress + Wellness McAllen](https://mcallen.snoozemattresscompany.com/tempur-pedic)\n- [Beautyrest at Snooze Mattress + Wellness McAllen](https://mcallen.snoozemattresscompany.com/beautyrest)';
  assert.equal(llmsBrandPagesSection(LOC), section);
  assert.ok(out.includes(`\n\n${section}\n\n## Financing and offers\n`));
  assert.ok(!out.includes('{{'));
  // every line of the hand-written file is still there, in order, and the file ends with its last section intact
  const kept = base.replace(/\r\n/g, '\n').split('\n').filter((l) => l !== '{{BRAND_PAGES}}');
  const lines = out.split('\n'); let i = 0; for (const l of lines) if (i < kept.length && l === kept[i]) i++;
  assert.equal(i, kept.length);
  assert.ok(out.endsWith('- [Terms and conditions](https://mcallen.snoozemattresscompany.com/terms-conditions-page)\n'));
  // a store with no brand page: no section, no stray blank lines
  const none = buildLlmsTxt(base, { ...LOC, brand_pages: {} });
  assert.ok(!none.includes('Brand pages') && !none.includes('\n\n\n'));
});

test('brand list (lib/brand-pages/brand-list.ts): name, path, order, live; only live brands are linked, in order', async () => {
  const { BRAND_LIST, LIVE_BRANDS, ALL_BRAND_PATHS } = await import('../lib/brand-pages/brand-list.ts');
  assert.deepEqual(BRAND_LIST.map((b) => [b.name, b.path, b.order, b.live]), [['Tempur-Pedic', '/tempur-pedic', 1, true], ['Beautyrest', '/beautyrest', 2, true], ['Sealy', '/sealy', 3, false], ['Stearns & Foster', '/stearns-foster', 4, false]]);
  assert.deepEqual(LIVE_BRANDS.map((b) => b.name), ['Tempur-Pedic', 'Beautyrest']);
  // every live brand is built: a brand.json with the same name and path, and a store entry at its path
  for (const b of LIVE_BRANDS) {
    assert.ok(BRANDS[b.key], b.key);
    assert.equal(BRANDS[b.key].json.name, b.name);
    assert.equal(BRANDS[b.key].json.page_path, b.path);
    assert.equal(BRAND_PAGE_LOCATION.brand_pages[b.key]?.page_path, b.path);
  }
  assert.deepEqual(new Set(BRAND_LIST.map((b) => b.order)).size, BRAND_LIST.length, 'orders are unique');
  assert.deepEqual(ALL_BRAND_PATHS, ['/tempur-pedic', '/beautyrest', '/sealy', '/stearns-foster']);
});
