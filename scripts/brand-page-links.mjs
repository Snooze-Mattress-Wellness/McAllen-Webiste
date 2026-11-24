/*
 * Links to the brand pages (components/brand-pages/) from the generated GoHighLevel pages, same tab, no copy changes:
 * /tempur-pedic (brand-page v2 brief, November 20, 2026 — item 6), /beautyrest (Beautyrest brief, November 23, 2026 —
 * step 4), /serta (Serta brief, November 24, 2026 — step 3), /sealy and /stearns-foster (Stearns & Foster + Sealy
 * brief, November 24, 2026 — step 3), /copper-by-spring-air and /king-koil (Copper + King Koil brief, November 24,
 * 2026 — step 11), /snooze-o-pedic (Snooze-o-Pedic brief, November 25, 2026 — step 7). For every brand in BRANDS below:
 *  - /mattresses (English): every heading link to the brand's own site (desktop + mobile copies), which
 *    scripts/brand-links.mjs made new-tab links, now goes to the brand page in the same tab: "<Brand>® Mattresses";
 *    springair.com: "Copper Collection by Spring Air® Mattresses"; kingkoil.com: "SmartLife® by King Koil Mattresses"
 *    and "Snooze Handcrafted® by King Koil Mattresses". The other brands' headings, and the Spanish /es/mattresses,
 *    keep their links. (Serta has no heading on /mattresses.) A brand with no site of its own (Snooze-o-Pedic) has a
 *    plain heading there: its text ("Snooze-o-Pedic® Mattresses", heading below) is wrapped in the same link.
 *  - / (English home): the brand's logos in the brand marquee (both marquees, both sets) link to its brand page
 *    (King Koil: the FLOWT by King Koil and Snooze Handcrafted by King Koil logos).
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

/* page: the brand page; site: the brand's own site as the /mattresses headings link it (null: no such link there);
   heading: a plain (unlinked) /mattresses heading to link; logos: the marquee logos' alts */
const BRANDS = [
  { name: 'Tempur-Pedic', page: '/tempur-pedic', site: 'https://www.tempurpedic.com/', logos: ['Tempur-Pedic logo'] },
  { name: 'Beautyrest', page: '/beautyrest', site: 'https://www.beautyrest.com/', logos: ['Beautyrest logo'] },
  { name: 'Serta', page: '/serta', site: null, logos: ['Serta logo'] },
  { name: 'Sealy', page: '/sealy', site: 'https://www.sealy.com/', logos: ['Sealy logo'] },
  { name: 'Stearns & Foster', page: '/stearns-foster', site: 'https://www.stearnsandfoster.com/', logos: ['Stearns &amp; Foster logo'] },
  { name: 'Copper by Spring Air', page: '/copper-by-spring-air', site: 'https://www.springair.com/', logos: ['Copper by Spring Air logo'] },
  { name: 'King Koil', page: '/king-koil', site: 'https://www.kingkoil.com/', logos: ['FLOWT by King Koil logo', 'Snooze Handcrafted by King Koil logo'] },
  { name: 'Snooze-o-Pedic', page: '/snooze-o-pedic', site: null, heading: 'Snooze-o-Pedic® Mattresses', logos: ['Snooze-O-Pedic logo'] },
];
const literal = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, (c) => BS + c);

/* /mattresses: the heading link to the brand's site -> the brand page, same tab */
const headings = (b) => {
  const HEADING = new RegExp(`<a class="snz-brand-link" href="${literal(b.site)}" target="_blank" rel="noopener noreferrer">([^<]*)</a>`, 'g');
  return (html, n) => html.replace(HEADING, (m, text) => { n.count++; return `<a class="snz-brand-link" href="${b.page}">${text}</a>`; });
};

/* /mattresses: a plain heading (the brand has no site to link) -> its text wrapped in the brand-page link, like the
   other brands' headings; idempotent (a heading already holding a link does not match) */
const headingPlain = (b) => {
  const PLAIN = new RegExp(`(<h2 class="snz-h"><span[^>]*>)(${literal(b.heading)})(</span></h2>)`, 'g');
  return (html, n) => html.replace(PLAIN, (m, open, text, close) => { n.count++; return `${open}<a class="snz-brand-link" href="${b.page}">${text}</a>${close}`; });
};

/* home: the marquee's brand logo -> wrapped in a link that fills the item box */
const LINK_STYLE = 'display:flex;align-items:center;justify-content:center;width:100%;height:100%';
const marquee = (b, logo) => {
  const MARQUEE = new RegExp(`<div class="snz-logo-marquee__set"( aria-hidden="true")?>|<div class="snz-logo-marquee__item">(<img [^>]*alt="${literal(logo)}"[^>]*>)</div>`, 'g');
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
  ...(b.site ? [{ file: 'app/(en)/mattresses/content.ts', fix: headings(b), what: `${b.name} heading links`, page: b.page }] : []),
  ...(b.heading ? [{ file: 'app/(en)/mattresses/content.ts', fix: headingPlain(b), what: `${b.name} plain headings`, page: b.page }] : []),
  ...b.logos.map((logo) => ({ file: 'app/(en)/content.ts', fix: marquee(b, logo), what: `${b.name} marquee logos (${logo})`, page: b.page })),
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
