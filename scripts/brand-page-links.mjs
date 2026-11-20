/*
 * Links to the Tempur-Pedic brand page (/tempur-pedic, components/brand-pages/) from the generated GoHighLevel pages
 * (brand-page v2 brief, November 20, 2026 — item 6; same tab, no copy changes):
 *  - /mattresses (English): the two "Tempur-Pedic® Mattresses" heading links (desktop + mobile copies), which
 *    scripts/brand-links.mjs made new-tab links to tempurpedic.com, now go to /tempur-pedic in the same tab. The other
 *    brands' headings, and the Spanish /es/mattresses, keep their links.
 *  - / (English home): the Tempur-Pedic logo of the brand marquee (both marquees, both sets) links to /tempur-pedic.
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
const PAGE = '/tempur-pedic';

/* /mattresses: the heading link to the brand's site -> the brand page, same tab */
const HEADING = /<a class="snz-brand-link" href="https:\/\/www\.tempurpedic\.com\/" target="_blank" rel="noopener noreferrer">([^<]*)<\/a>/g;
const headings = (html, n) => html.replace(HEADING, (m, text) => { n.count++; return `<a class="snz-brand-link" href="${PAGE}">${text}</a>`; });

/* home: the marquee's Tempur-Pedic logo -> wrapped in a link that fills the item box */
const LINK_STYLE = 'display:flex;align-items:center;justify-content:center;width:100%;height:100%';
const MARQUEE = /<div class="snz-logo-marquee__set"( aria-hidden="true")?>|<div class="snz-logo-marquee__item">(<img [^>]*alt="Tempur-Pedic logo"[^>]*>)<\/div>/g;
const marquee = (html, n) => {
  let hidden = false;
  return html.replace(MARQUEE, (m, ariaHidden, img) => {
    if (img === undefined) { hidden = !!ariaHidden; return m; }
    n.count++;
    return `<div class="snz-logo-marquee__item"><a class="snz-logo-marquee__link" href="${PAGE}"${hidden ? ' tabindex="-1"' : ''} draggable="false" style="${LINK_STYLE}">${img}</a></div>`;
  });
};

const JOBS = [
  { file: 'app/(en)/mattresses/content.ts', fix: headings, what: 'Tempur-Pedic heading links' },
  { file: 'app/(en)/content.ts', fix: marquee, what: 'Tempur-Pedic marquee logos' },
];

let changed = 0;
for (const { file: f, fix, what } of JOBS) {
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
  const already = (body.match(new RegExp(`href="${PAGE}"`, 'g')) || []).length;
  console.log(`${f}: ${what}: ${inMarkup.count} in the markup, ${inPayload.count} in the payload${next !== body ? '' : ` (no change; ${already} already link ${PAGE})`}`);
}
console.log(`${changed} files ${CHECK ? 'would change' : 'changed'}`);
