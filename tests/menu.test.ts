// The Products menu's size/type groups (components/SiteHeader.tsx, lib/i18n.ts): "Mattress Info by Size" and
// "Mattress Info by Type" hold every size/type link exactly once, with the same text and URL as before the split, in
// both languages; the headings are the client's wording (November 24, 2026). Plus the desktop mega menu's config: the
// brand logos, the Products heading and labels, the card texts (mega-menu brief, November 24, 2026). `npm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { MENU_INFO_GROUPS, PRODUCT_KEYS, ui } from '../lib/i18n.ts';
import { BRAND_LIST, LIVE_BRANDS } from '../lib/brand-pages/brand-list.ts';

test('menu headings: Brands / Marcas, Mattress Info by Size / by Type (EN + ES)', () => {
  assert.equal(ui('en').menu.brands, 'Brands');
  assert.equal(ui('es').menu.brands, 'Marcas');
  assert.equal(ui('en').menu.infoBySize, 'Mattress Info by Size');
  assert.equal(ui('en').menu.infoByType, 'Mattress Info by Type');
  assert.equal(ui('es').menu.infoBySize, 'Información de colchones por tamaño');
  assert.equal(ui('es').menu.infoByType, 'Información de colchones por tipo');
  // the size/type pages keep their own heading (page content, components/SizeTypeGrid.tsx)
  assert.equal(ui('en').menu.sizes, 'Mattresses by size & type');
  assert.equal(ui('es').menu.sizes, 'Colchones por tamaño y tipo');
});

test('the split: every size/type link in exactly one group, nothing added or dropped, text and URLs unchanged', () => {
  const all = [...MENU_INFO_GROUPS.size, ...MENU_INFO_GROUPS.type];
  assert.equal(new Set(all).size, all.length, 'no link in both groups');
  for (const locale of ['en', 'es'] as const) {
    const links = ui(locale).menu.sizeLinks;
    assert.deepEqual([...all].sort(), links.map(([, href]) => href).sort(), locale);
  }
  assert.deepEqual(MENU_INFO_GROUPS.size, ['/queen-mattresses', '/king-mattresses', '/full-twin-mattresses']);
  assert.deepEqual(MENU_INFO_GROUPS.type, ['/memory-foam-mattresses', '/mattresses-for-back-pain', '/cooling-mattresses']);
  // the links as they were before the split (text and URL), in both languages
  assert.deepEqual(ui('en').menu.sizeLinks, [['Queen', '/queen-mattresses'], ['King', '/king-mattresses'], ['Full & Twin', '/full-twin-mattresses'], ['Memory Foam', '/memory-foam-mattresses'], ['Back Pain', '/mattresses-for-back-pain'], ['Cooling', '/cooling-mattresses']]);
  assert.deepEqual(ui('es').menu.sizeLinks, [['Queen', '/queen-mattresses'], ['King', '/king-mattresses'], ['Full y Twin', '/full-twin-mattresses'], ['Memory Foam', '/memory-foam-mattresses'], ['Dolor de espalda', '/mattresses-for-back-pain'], ['Frescos', '/cooling-mattresses']]);
});

/* ---- the desktop Products mega menu (column layout, mega-menu brief, November 24, 2026) ---- */

test('Brands column: every live brand has a logo file in public/brands/logos/, the file the Offer Calendar feed names for it', () => {
  const feed = JSON.parse(readFileSync(new URL('./fixtures/promo-feed.v2-example.fixture.json', import.meta.url), 'utf8'));
  const feedLogo = new Map<string, string>(feed.brands.map((b: { display_name: string; logo_file: string }) => [b.display_name, b.logo_file]));
  assert.ok(LIVE_BRANDS.length >= 8);
  for (const b of LIVE_BRANDS) {
    assert.ok(b.logo, `${b.key}: logo`);
    assert.ok(existsSync(new URL(`../public${b.logo}`, import.meta.url)), `${b.key}: ${b.logo} exists`);
    // the example feed predates Snooze-o-Pedic's Brands row (added to the Offer Calendar 2026-11-24: logo_file
    // /brands/logos/snooze-o-pedic.png, the file shipped in the package)
    if (feedLogo.has(b.name)) assert.equal(b.logo, feedLogo.get(b.name), `${b.key}: the feed's logo file`);
    else assert.equal(b.key, 'snooze-o-pedic');
  }
  // registry order = menu order
  assert.deepEqual(LIVE_BRANDS.map((b) => b.key), BRAND_LIST.filter((b) => b.live).sort((a, b) => a.order - b.order).map((b) => b.key));
});

test('Products column: heading "Products" / "Productos"; the eight products keep their labels, in order; the descriptions stay in the config (hidden)', () => {
  assert.equal(ui('en').menu.products, 'Products');
  assert.equal(ui('es').menu.products, 'Productos');
  assert.deepEqual([...PRODUCT_KEYS], ['mattresses', 'bases', 'chairs', 'pillows', 'protectors', 'sheets', 'recliner', 'kit']);
  assert.deepEqual(PRODUCT_KEYS.map((k) => ui('en').products[k].label), ['Mattresses', 'Adjustable Mattress Bases', 'Massage Chairs', 'Pillows', 'Mattress Protectors', 'Premium Sheets', 'Sleep Recliner', 'At-Home Sleep Test Kit']);
  assert.deepEqual(PRODUCT_KEYS.map((k) => ui('es').products[k].label), ['Colchones', 'Bases Ajustables', 'Sillas de Masaje', 'Almohadas', 'Protectores de Colchón', 'Sábanas Premium', 'Sillón Reclinable', 'Kit de Prueba de Sueño en Casa']);
  for (const locale of ['en', 'es'] as const) for (const k of PRODUCT_KEYS) assert.ok(ui(locale).products[k].desc, `${locale} ${k}: desc kept`);
  // the nav item (client request, November 25, 2026): "Products & Brands" / "Productos y marcas"; "About" / "Nosotros"
  assert.equal(ui('en').nav.products, 'Products & Brands');
  assert.equal(ui('es').nav.products, 'Productos y marcas');
  assert.equal(ui('en').nav.about, 'About');
  assert.equal(ui('es').nav.about, 'Nosotros');
  // the other nav labels and the footer's product heading are unchanged
  assert.deepEqual([ui('en').nav.home, ui('en').nav.financing, ui('en').nav.sales, ui('en').nav.clearance, ui('en').nav.blog, ui('en').nav.quiz], ['Home', 'Financing', 'Sales', 'Clearance', 'Blog', 'Sleep Quiz']);
  assert.equal(ui('en').footer.products, 'Our Products');
  assert.equal(ui('es').footer.products, 'Nuestros Productos');
});

test('Dream Mapping card and Sleep Fit Quiz card: the texts and links of the menu (unchanged)', () => {
  assert.deepEqual(ui('en').feature, { eyebrow: 'Dream Mapping', title: 'Find your perfect mattress in about 5 minutes', cta: 'Book a free fitting', imgAlt: 'Snooze Sleep Coaches fitting a customer on a mattress' });
  assert.equal(ui('en').quizCard.title, 'Sleep Fit Quiz');
  assert.equal(ui('en').quizCard.cta, 'Take the quiz');
  assert.equal(ui('es').quizCard.title, 'Sleep Fit Quiz');
  assert.equal(ui('es').quizCard.cta, 'Hacer el quiz');
});
