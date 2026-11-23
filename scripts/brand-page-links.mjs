/*
 * Links to the brand pages (components/brand-pages/) from the generated GoHighLevel pages, same tab, no copy changes:
 * /tempur-pedic (brand-page v2 brief, November 20, 2026 — item 6) and /beautyrest (Beautyrest brief, November 23,
 * 2026 — step 4). For every brand in BRANDS below:
 *  - /mattresses (English): the brand's two "<Brand>® Mattresses" heading links (desktop + mobile copies), which
 *    scripts/brand-links.mjs made new-tab links to the brand's own site, now go to the brand page in the same tab. The
 *    other brands' headings, and the Spanish /es/mattresses, keep their links.
 *  - / (English home): the brand's logo in the brand marquee (both marquees, both sets) links to its brand page.
 *    The link fills the logo's box, so the logo keeps its size; the duplicate set is aria-hidden, so its copy of the
 *    link has tabindex="-1" (no hidden focus stops).
 * In the static markup and the hydration payload. Idempotent; run after scripts/brand-links.mjs and
 * scripts/logo-marquee-patch.mjs.  node scripts/brand-page-links.mjs  [--check]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');
const BS = String.fromCharCode(92);
const escapeJsonForScript = (json) => json.split('<').join(BS + 'u003C').split(String.fromCharCode(0x2028)).join(BS + 'u2028').split(String.fromCharCode(0x2029)).join(BS + 'u2029');

/* page: the brand page; site: the brand's own site as the /mattresses heading links it; logo: the marquee logo's alt */
const BRANDS = [
  { name: 'Tempur-Pedic', page: '/tempur-pedic', site: 'https://www.tempurpedic.com/', logo: 'Tempur-Pedic logo' },
  { name: 'Beautyrest', page: '/beautyrest', site: 'https://www.beautyrest.com/', logo: 'Beautyrest logo' },
];
const literal = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, (c) => BS + c);

/* /mattresses: the heading link to the brand's site -> the brand page, same tab */
const headings = (b) => {
  const HEADING = new RegExp(`<a class="snz-brand-link" href="${literal(b.site)}" target="_blank" rel="noopener noreferrer">([^<]*)</a>`, 'g');
  return (html, n) => html.replace(HEADING, (m, text) => { n.count++; return `<a class="snz-brand-link" href="${b.page}">${text}</a>`; });
};

/* home: the marquee's brand logo -> wrapped in a link that fills the item box */
const LINK_STYLE = 'display:flex;align-items:center;justify-content:center;width:100%;height:100%';
const marquee = (b) => {
  const MARQUEE = new RegExp(`<div class="snz-logo-marquee__set"( aria-hidden="true")?>|<div class="snz-logo-marquee__item">(<img [^>]*alt="${literal(b.logo)}"[^>]*>)</div>`, 'g');
  return (html, n) => {
    let hidden = false;
    return html.replace(MARQUEE, (m, ariaHidden, img) => {
      if (img === undefined) { hidden = !!ariaHidden; return m; }
      n.count++;
      return `<div class="snz-logo-marquee__item"><a class="snz-logo-marquee__link" href="${b.page}"${hidden ? ' tabindex="-1"' : ''} draggable="false" style="${LINK_STYLE}">${img}</a></div>`;
    });
  };
};

const JOBS = BRANDS.flatMap((b) => [
  { file: 'app/(en)/mattresses/content.ts', fix: headings(b), what: `${b.name} heading links`, page: b.page },
  { file: 'app/(en)/content.ts', fix: marquee(b), what: `${b.name} marquee logos`, page: b.page },
]);

let changed = 0;
for (const { file: f, fix, what, page } of JOBS) {
  const file = path.join(ROOT, f); const s = fs.readFileSync(file, 'utf8');
  const bodyM = s.match(/export const BODY_HTML = ("[\s\S]*");\s*$/); if (!bodyM) { console.log(`${f}: no BODY_HTML`); continue; }
  const body = JSON.parse(bodyM[1]);
  const pm = body.match(/(<script[^>]*id="__NUXT_DATA__"[^>]*>)([\s\S]*?)(<\/script>)/);
  const markup = pm ? body.replace(pm[0], '\u0000PAYLOAD\u0000') : body;
  const inMarkup = { count: 0 }; const newMarkup = fix(markup, inMarkup);
  let payload = pm ? pm[0] : ''; const inPayload = { count: 0 };
  if (pm) {
    const nodes = JSON.parse(pm[2]); let touched = false;
    for (let i = 0; i < nodes.length; i++) if (typeof nodes[i] === 'string') { const v = fix(nodes[i], inPayload); if (v !== nodes[i]) { nodes[i] = v; touched = true; } }
    if (touched) payload = pm[1] + escapeJsonForScript(JSON.stringify(nodes)) + pm[3];
  }
  const next = pm ? newMarkup.replace('\u0000PAYLOAD\u0000', () => payload) : newMarkup;
  if (next !== body) { changed++; if (!CHECK) fs.writeFileSync(file, s.replace(bodyM[1], () => JSON.stringify(next))); }
  const already = (body.match(new RegExp(`href="${page}"`, 'g')) || []).length;
  console.log(`${f}: ${what}: ${inMarkup.count} in the markup, ${inPayload.count} in the payload${next !== body ? '' : ` (no change; ${already} already link ${page})`}`);
}
console.log(`${changed} ${CHECK ? 'jobs would change a file' : 'jobs changed a file'}`);
