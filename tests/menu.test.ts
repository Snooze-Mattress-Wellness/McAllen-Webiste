// The Products menu's size/type groups (components/SiteHeader.tsx, lib/i18n.ts): "Mattress Info by Size" and
// "Mattress Info by Type" hold every size/type link exactly once, with the same text and URL as before the split, in
// both languages; the headings are the client's wording (November 24, 2026). Node's built-in test runner: `npm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MENU_INFO_GROUPS, ui } from '../lib/i18n.ts';

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
