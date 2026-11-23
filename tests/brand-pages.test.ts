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
import { assetUrl, brandPage, brandScripts } from '../lib/brand-pages/page.ts';
import { brandText, renderBrandBody } from '../lib/brand-pages/render.ts';
import { PARTIALS } from '../lib/brand-pages/files.ts';
import { Promo, brandOffers } from '../lib/brand-pages/offers.ts';
import { brandPageMetadata } from '../lib/brand-pages/metadata.ts';
import { BRAND_PAGE_LOCATION, LOCATION, hoursSentence } from '../lib/location.ts';
import { BEAUTYREST_VIDEO } from '../components/brand-pages/beautyrest/video.ts';
import { SERTA_VIDEO } from '../components/brand-pages/serta/video.ts';

const TP = BRANDS['tempur-pedic'];
const BR = BRANDS.beautyrest;
const SE = BRANDS.serta;
const SF = BRANDS['stearns-foster'];
const SY = BRANDS.sealy;
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
  assert.deepEqual(BRAND_KEYS, ['tempur-pedic', 'beautyrest', 'serta', 'sealy', 'stearns-foster']);
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

test('Serta body: byte for byte the package previews mcallen-serta.html (Nov 23) and -dec20.html (Dec 20)', () => {
  assert.equal(lf(ourBody('serta', feed('v2-example'), '2026-11-23')), previewBody(lf(fixture('serta.preview.fixture.html'))));
  assert.equal(lf(ourBody('serta', feed('v2-example'), '2026-12-20')), previewBody(lf(fixture('serta-dec20.preview.fixture.html'))));
});

test('Serta: brand.json as delivered, wrapper, assets in brand.json order, the hero poster preloaded per breakpoint', () => {
  assert.equal(SE.json.slug, 'serta');
  assert.equal(SE.json.vendor, 'Serta');
  assert.equal(SE.json.page_path, '/serta');
  assert.equal(SE.site.wrapper_class, 'serta-wrapper');
  assert.ok(SE.template.includes('<div class="serta-wrapper snz-brand snz-brand--serta">'));
  assert.deepEqual(SE.json.styles.map((x) => assetUrl(SE, x)), ['/brands/serta/css/serta.css', '/brands/shared/css/snooze-brand-local.css']);
  assert.deepEqual((SE.json.preload_images || []).map((p) => [assetUrl(SE, p.href), p.media]), [
    ['/brands/serta/img/hero-poster.webp', '(min-width: 768px)'],
    ['/brands/serta/img/hero-poster-mobile.webp', '(max-width: 767px)'],
  ]);
  assert.equal(brandPage(SE, LOC).url, `${SITE}/serta`);
  // the hero picture is one link to the store visit section
  assert.match(SE.template, /<a class="se-hero__media" href="#visit"/);
  const files = [...SE.template.matchAll(/\{\{brand_base\}\}img\/([\w.-]+)/g)].map((m) => m[1]).concat(Object.values(SE.json.promo_images || {}).map((i) => i.file), 'og-image.jpg');
  for (const f of files) assert.ok(existsSync(new URL(`../public/brands/serta/img/${f}`, import.meta.url)), f);
});

test('Serta SEO (SERTA.md step 6): title, H1 in the bar under the hero, description, canonical, OG image, H2s; one H1', () => {
  const m = brandPageMetadata(SE, LOC);
  assert.equal(m.title, 'Serta Mattresses in McAllen, TX | Snooze Mattress');
  assert.equal(m.description, 'Try Serta iComfort, iComfortPro, iSeries NXG and Perfect Sleeper mattresses at Snooze Mattress in McAllen. Get a free Dream Mapping fitting for your body.');
  assert.deepEqual(m.alternates, { canonical: `${SITE}/serta` });
  assert.deepEqual(m.openGraph?.images, [{ url: `${SITE}/brands/serta/img/og-image.jpg`, width: 1200, height: 630 }]);
  const { promos, tiles } = brandOffers(SE.json, 'mcallen', feed('v2-example'), '2026-11-23');
  const faq = brandFaq(SE.json, LOC, tiles);
  const html = renderBrandBody({ brand: SE.json, template: SE.template, partials: PARTIALS, location: LOC, promos, tiles, faq });
  assert.equal(html.match(/<h1\b/g)?.length, 1);
  const bar = html.slice(html.indexOf('<div class="se-hero__bar">'), html.indexOf('</section>'));
  assert.ok(bar.includes('<h1 class="snz-h1">Serta Mattresses in McAllen, TX</h1>'), 'the H1 is in the bar under the hero');
  assert.ok(!/\{\{|\{city\}|\{state\}|\{brand\}/.test(html));
  const h2s = [...html.matchAll(/<h2[^>]*>(.*?)<\/h2>/g)].map((x) => x[1].replace(/<[^>]+>/g, '').trim());
  // the offer block has no headline row: the shared markup writes an empty <h2> (reported)
  assert.deepEqual(h2s, ['Try Serta in McAllen', '', 'The Serta advantage', 'Serta mattress collections', 'Customize your comfort', 'Reassurance so you can rest easy', 'Why Buy Serta at Snooze Mattress in McAllen', 'Serta in McAllen: Common Questions']);
  const h3s = [...html.matchAll(/<h3[^>]*>(.*?)<\/h3>/g)].map((x) => x[1].replace(/<[^>]+>/g, '').replace(/&reg;|&trade;/g, '').replace(/\s+/g, ' ').trim());
  assert.deepEqual(h3s.slice(0, 8), ['Zoned comfort', 'Pressure relief', 'Cooling comfort', 'Serta iSeries NXG', 'Serta iComfort', 'Serta iComfortPro', 'Serta Perfect Sleeper', 'Serta Perfect Sleeper X']);
  const [webPage, , faqPage] = brandPageJsonLd(SE, LOC, faq);
  assert.deepEqual(webPage.about, [{ '@type': 'Brand', name: 'Serta' }, { '@id': `${SITE}/#store` }]);
  assert.equal((faqPage.mainEntity as unknown[]).length, (html.match(/<details/g) || []).length, 'FAQPage = the visible FAQ');
});

test('Serta offers: BF26-SERTA as an item list with no headline and no photo; NY26-SERTA from December 15; no {brand}', () => {
  const nov = brandOffers(SE.json, 'mcallen', feed('v2-example'), '2026-11-23').promos;
  assert.deepEqual(nov.map((b) => b.block), ['BF26-SERTA']);
  assert.equal(nov[0].headline, '');
  assert.deepEqual(nov[0].items.map((i) => i.text), ['Save up to $700 on Serta Perfect Sleeper', 'Save up to $900 on Serta iComfort', 'Save up to $700 on Serta iSeries NXG']);
  const html = Promo.renderPromotionsHTML(nov, { imageBase: '/brands/serta/img/', images: SE.json.promo_images });
  assert.ok(!html.includes('<img'), 'no web_image on the block: no photo');
  assert.ok(!html.includes('{brand}'));
  assert.deepEqual(brandOffers(SE.json, 'mcallen', feed('v2-example'), '2026-12-20').promos.map((b) => b.block), ['NY26-SERTA']);
});

test('Serta hero video: the loader is on exactly when the video file is in the repo', () => {
  assert.equal(existsSync(new URL('../public/brands/serta/video/serta-hero.mp4', import.meta.url)), SERTA_VIDEO);
});

test('Stearns & Foster body: byte for byte the package preview mcallen-stearns-foster.html (example feed, Nov 23)', () => {
  assert.equal(lf(ourBody('stearns-foster', feed('v2-example'), '2026-11-23')), previewBody(lf(fixture('stearns-foster.preview.fixture.html'))));
});

test('Stearns & Foster: brand.json as delivered, wrapper, styles and scripts in brand.json order', () => {
  assert.equal(SF.json.slug, 'stearns-foster');
  assert.equal(SF.json.vendor, 'Stearns & Foster');
  assert.equal(SF.json.page_path, '/stearns-foster');
  assert.equal(SF.site.wrapper_class, 'snz-brand--stearns-foster');
  assert.ok(SF.template.includes('<div class="snz-brand snz-brand--stearns-foster">'));
  assert.deepEqual(SF.json.styles.map((x) => assetUrl(SF, x)), [
    '/brands/stearns-foster/css/stearns-foster.scoped.css',
    '/brands/stearns-foster/css/aos.scoped.css',
    '/brands/stearns-foster/css/snooze-stearns-foster-overrides.css',
    '/brands/shared/css/snooze-brand-local.css',
  ]);
  // the vendor scripts as delivered, in order; the libraries load once per document, main.js on every mount;
  // snooze-promo.js is not loaded (offers are rendered on the server)
  assert.deepEqual(brandScripts(SF), [
    { src: '/brands/shared/js/swiper-bundle.min.js', once: true },
    { src: '/brands/stearns-foster/js/aos.min.js', once: true },
    { src: '/brands/stearns-foster/js/main.js', once: false },
  ]);
  assert.deepEqual(SF.json.preload_images, []);
  const files = [...SF.template.matchAll(/\{\{brand_base\}\}img\/([\w.-]+)/g)].map((m) => m[1]).concat(Object.values(SF.json.promo_images || {}).map((i) => i.file), 'og-image.jpg');
  for (const f of files) assert.ok(existsSync(new URL(`../public/brands/stearns-foster/img/${f}`, import.meta.url)), f);
  for (const s of brandScripts(SF)) assert.ok(existsSync(new URL(`../public${s.src}`, import.meta.url)), s.src);
});

test('Stearns & Foster SEO: title, H1 in the hero, description, canonical, OG image; one H1; no animation in the hero', () => {
  const m = brandPageMetadata(SF, LOC);
  assert.equal(m.title, 'Stearns & Foster Mattresses in McAllen, TX | Snooze Mattress');
  assert.equal(m.description, 'Try Stearns & Foster Estate, Lux Estate, Legacy and Reserve mattresses at Snooze Mattress in McAllen. Get a free Dream Mapping fitting to find your fit.');
  assert.deepEqual(m.alternates, { canonical: `${SITE}/stearns-foster` });
  assert.deepEqual(m.openGraph?.images, [{ url: `${SITE}/brands/stearns-foster/img/og-image.jpg`, width: 1200, height: 630 }]);
  const { promos, tiles } = brandOffers(SF.json, 'mcallen', feed('v2-example'), '2026-11-23');
  const faq = brandFaq(SF.json, LOC, tiles);
  const html = renderBrandBody({ brand: SF.json, template: SF.template, partials: PARTIALS, location: LOC, promos, tiles, faq });
  assert.equal(html.match(/<h1\b/g)?.length, 1);
  const hero = html.slice(html.indexOf('<section class="block-full block-full--with-bg hero'), html.indexOf('{{VISIT}}') > 0 ? undefined : html.indexOf('<section class="snz-local snz-visit"'));
  assert.ok(hero.includes('<h1 class="snz-h1">Stearns &amp; Foster Mattresses in McAllen, TX</h1>'));
  assert.ok(!hero.includes('data-aos'), 'the hero is not animated');
  assert.ok(!/\{\{|\{city\}|\{state\}|\{brand\}/.test(html));
  const [webPage, , faqPage] = brandPageJsonLd(SF, LOC, faq);
  assert.deepEqual(webPage.about, [{ '@type': 'Brand', name: 'Stearns & Foster' }, { '@id': `${SITE}/#store` }]);
  assert.equal((faqPage.mainEntity as unknown[]).length, (html.match(/<details/g) || []).length, 'FAQPage = the visible FAQ');
});

test('Stearns & Foster offers: BF26-STEARNS in November, NY26-STEARNS from December 15 (example feed)', () => {
  assert.deepEqual(brandOffers(SF.json, 'mcallen', feed('v2-example'), '2026-11-23').promos.map((b) => b.block), ['BF26-STEARNS']);
  assert.deepEqual(brandOffers(SF.json, 'mcallen', feed('v2-example'), '2026-12-20').promos.map((b) => b.block), ['NY26-STEARNS']);
});

test('Sealy body: byte for byte the package preview mcallen-sealy.html (example feed, Dec 20: Holiday offers)', () => {
  assert.equal(lf(ourBody('sealy', feed('v2-example'), '2026-12-20')), previewBody(lf(fixture('sealy.preview.fixture.html'))));
});

test('Sealy: brand.json as delivered, wrapper, styles and scripts in brand.json order, hero preloads', () => {
  assert.equal(SY.json.slug, 'sealy');
  assert.equal(SY.json.vendor, 'Sealy');
  assert.equal(SY.json.page_path, '/sealy');
  assert.equal(SY.site.wrapper_class, 'sealy-wrapper');
  assert.ok(SY.template.includes('<div class="sealy-wrapper snz-brand snz-brand--sealy">'));
  assert.deepEqual(SY.json.styles.map((x) => assetUrl(SY, x)), [
    '/brands/shared/css/swiper-bundle.min.css',
    '/brands/sealy/css/sealy.scoped.css',
    '/brands/sealy/css/snooze-sealy-overrides.css',
    '/brands/shared/css/snooze-brand-local.css',
  ]);
  // this site's containment for the one vendor rule that is not scoped (br { display: none } from 658px)
  assert.match(readFileSync(new URL('../public/brands/sealy/css/sealy.scoped.css', import.meta.url), 'utf8'), /\(min-width: 658px\)\s*\{\s*br\s*\{\s*display: none;/);
  assert.deepEqual(SY.site.site_styles, ['/brands/site/sealy-containment.css']);
  assert.ok(existsSync(new URL('../public/brands/site/sealy-containment.css', import.meta.url)));
  assert.deepEqual(brandScripts(SY), [
    { src: '/brands/shared/js/swiper-bundle.min.js', once: true },
    { src: '/brands/sealy/js/scripts.js', once: false },
  ]);
  assert.deepEqual((SY.json.preload_images || []).map((p) => [assetUrl(SY, p.href), p.media]), [
    ['/brands/sealy/img/bg_header.webp', '(min-width: 1024px)'],
    ['/brands/sealy/img/bg_mobile_header.webp', '(max-width: 1023px)'],
  ]);
  const files = [...SY.template.matchAll(/\{\{brand_base\}\}img\/([\w.-]+)/g)].map((m) => m[1]).concat(Object.values(SY.json.promo_images || {}).map((i) => i.file), 'og-image.jpg');
  for (const f of files) assert.ok(existsSync(new URL(`../public/brands/sealy/img/${f}`, import.meta.url)), f);
  for (const x of [...SY.json.styles.map((p) => assetUrl(SY, p)), ...brandScripts(SY).map((b) => b.src)]) assert.ok(existsSync(new URL(`../public${x}`, import.meta.url)), x);
});

test('Sealy SEO and markup: title, description, canonical, OG image; one real H1, the image headings are h2.snz-hd; Copyright 2026; the YouTube embed', () => {
  const m = brandPageMetadata(SY, LOC);
  assert.equal(m.title, 'Sealy Posturepedic Mattresses in McAllen, TX | Snooze Mattress');
  assert.equal(m.description, 'Try Sealy Posturepedic and Sealy Essentials mattresses at Snooze Mattress in McAllen. Get a free Dream Mapping fitting to find the right fit for your body.');
  assert.deepEqual(m.alternates, { canonical: `${SITE}/sealy` });
  assert.deepEqual(m.openGraph?.images, [{ url: `${SITE}/brands/sealy/img/og-image.jpg`, width: 1200, height: 630 }]);
  const { promos, tiles } = brandOffers(SY.json, 'mcallen', feed('v2-example'), '2026-11-23');
  const faq = brandFaq(SY.json, LOC, tiles);
  const html = renderBrandBody({ brand: SY.json, template: SY.template, partials: PARTIALS, location: LOC, promos, tiles, faq });
  assert.equal(html.match(/<h1\b/g)?.length, 1);
  assert.ok(html.includes('<h1 class="snz-h1">Sealy Mattresses in McAllen, TX</h1>'));
  // every heading that is a picture is an h2.snz-hd with alt text (no image H1s)
  for (const h of html.matchAll(/<(h\d)([^>]*)>\s*<img[^>]*alt="([^"]*)"/g)) { assert.equal(h[1], 'h2', h[0]); assert.match(h[2], /snz-hd/); }
  assert.equal((html.match(/<h2 class="snz-hd">/g) || []).length, 3);
  assert.ok(html.includes('Copyright 2026 Sealy, Inc.') && !html.includes('2027'));
  assert.match(html, /<iframe src="https:\/\/www\.youtube-nocookie\.com\/embed\/20Es3XawcoE\?controls=0&amp;rel=0" title="Sealy Posturepedic video"/);
  assert.ok(!/\{\{|\{city\}|\{state\}|\{brand\}/.test(html));
  const [webPage, , faqPage] = brandPageJsonLd(SY, LOC, faq);
  assert.deepEqual(webPage.about, [{ '@type': 'Brand', name: 'Sealy' }, { '@id': `${SITE}/#store` }]);
  assert.equal((faqPage.mainEntity as unknown[]).length, (html.match(/<details/g) || []).length, 'FAQPage = the visible FAQ');
});

test('Sealy offers: BF26-SEALY in November, NY26-SEALY from December 15 (example feed)', () => {
  assert.deepEqual(brandOffers(SY.json, 'mcallen', feed('v2-example'), '2026-11-23').promos.map((b) => b.block), ['BF26-SEALY']);
  assert.deepEqual(brandOffers(SY.json, 'mcallen', feed('v2-example'), '2026-12-20').promos.map((b) => b.block), ['NY26-SEALY']);
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
  assert.deepEqual(BRAND_PAGE_PATHS, ['/tempur-pedic', '/beautyrest', '/serta', '/sealy', '/stearns-foster']);
});

test('llms.txt: the hand-written guide plus a "Brand pages" section from the registry; nothing cut off', async () => {
  const { buildLlmsTxt, llmsBrandPagesSection } = await import('../lib/brand-pages/llms.ts');
  const base = readFileSync(new URL('../lib/llms.txt', import.meta.url), 'utf8');
  const out = buildLlmsTxt(base, LOC);
  const section = '## Brand pages\n- [Tempur-Pedic at Snooze Mattress + Wellness McAllen](https://mcallen.snoozemattresscompany.com/tempur-pedic)\n- [Beautyrest at Snooze Mattress + Wellness McAllen](https://mcallen.snoozemattresscompany.com/beautyrest)\n- [Serta at Snooze Mattress + Wellness McAllen](https://mcallen.snoozemattresscompany.com/serta)\n- [Sealy at Snooze Mattress + Wellness McAllen](https://mcallen.snoozemattresscompany.com/sealy)\n- [Stearns & Foster at Snooze Mattress + Wellness McAllen](https://mcallen.snoozemattresscompany.com/stearns-foster)';
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
  assert.deepEqual(BRAND_LIST.map((b) => [b.name, b.path, b.order, b.live]), [['Tempur-Pedic', '/tempur-pedic', 1, true], ['Beautyrest', '/beautyrest', 2, true], ['Serta', '/serta', 3, true], ['Sealy', '/sealy', 4, true], ['Stearns & Foster', '/stearns-foster', 5, true]]);
  assert.deepEqual(LIVE_BRANDS.map((b) => b.name), ['Tempur-Pedic', 'Beautyrest', 'Serta', 'Sealy', 'Stearns & Foster']);
  // every live brand is built: a brand.json with the same name and path, and a store entry at its path
  for (const b of LIVE_BRANDS) {
    assert.ok(BRANDS[b.key], b.key);
    assert.equal(BRANDS[b.key].json.name, b.name);
    assert.equal(BRANDS[b.key].json.page_path, b.path);
    assert.equal(BRAND_PAGE_LOCATION.brand_pages[b.key]?.page_path, b.path);
  }
  assert.deepEqual(new Set(BRAND_LIST.map((b) => b.order)).size, BRAND_LIST.length, 'orders are unique');
  assert.deepEqual(ALL_BRAND_PATHS, ['/tempur-pedic', '/beautyrest', '/serta', '/sealy', '/stearns-foster']);
});
