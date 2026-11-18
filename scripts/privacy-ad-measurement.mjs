/*
 * Privacy policy: the "Advertising measurement" paragraph (Google enhanced conversions; client brief, November 2026 —
 * the same wording as the Rockwall site, commit 38c4ed9 there). /privacy-policy-page and /es/privacy-policy-page carry
 * the policy as one rich-text element per section copy (a desktop and a phone copy). The paragraph goes at the end of
 * the data-sharing section ("6. Information Sharing" / "6. Compartir Información"), after "We may disclose information
 * if required by law or legal process." / "Podemos divulgar información si lo exige la ley o un proceso legal." and
 * before the empty spacer paragraph that precedes "7.", in the page's own paragraph markup
 * (<p class="snz-h" style="font-weight:400"><span style="color: rgb(0, 0, 0); font-family: Montserrat">…</span></p>).
 * Written to the static markup and to the hydration payload (the builder runtime re-renders from the payload; both
 * copies' HTML strings), and to the payload's plain-text mirror of the policy (the builder's CreativeWork record, English
 * in both language files). The page shows no "last updated" date. Idempotent.
 *   node scripts/privacy-ad-measurement.mjs   (npm run privacy:ads)   [--check]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');
const BS = String.fromCharCode(92);
const escapeJsonForScript = (json) => json.split('<').join(BS + 'u003C').split(String.fromCharCode(0x2028)).join(BS + 'u2028').split(String.fromCharCode(0x2029)).join(BS + 'u2029');
const escHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const TEXT = {
  en: 'Advertising measurement. When you submit a form or book an appointment on this site, we may share a hashed (encrypted, one-way) version of your email address and phone number with Google to measure the performance of our advertising. Google cannot read the original email address or phone number from the hashed value. You can opt out of this sharing at any time by contacting the store.',
  es: 'Medición publicitaria. Cuando envía un formulario o reserva una cita en este sitio, es posible que compartamos con Google una versión cifrada (hash unidireccional) de su dirección de correo electrónico y su número de teléfono para medir el rendimiento de nuestra publicidad. Google no puede leer el correo electrónico ni el número de teléfono originales a partir del valor cifrado. Puede optar por no participar en este intercambio en cualquier momento comunicándose con la tienda.',
};
/* the last sentence of the data-sharing section, as it stands in the markup and the payload HTML strings */
const AFTER = {
  en: 'We may disclose information if required by law or legal process.</span></p>',
  es: 'Podemos divulgar información si lo exige la ley o un proceso legal.</span></p>',
};
const PLAIN_AFTER = 'We may disclose information if required by law or legal process.'; // the plain-text mirror is English in both files
const para = (text) => `<p class="snz-h" style="font-weight:400"><span style="color: rgb(0, 0, 0); font-family: Montserrat">${escHtml(text)}</span></p>`;

let changed = 0, problems = 0;
for (const [locale, file] of [['en', 'app/(en)/privacy-policy-page/content.ts'], ['es', 'app/es/privacy-policy-page/content.ts']]) {
  const abs = path.join(ROOT, file);
  const src = fs.readFileSync(abs, 'utf8');
  const bodyM = src.match(/export const BODY_HTML = ("[\s\S]*?");\r?\n/);
  if (!bodyM) { console.error(`${file}: BODY_HTML not found`); problems++; continue; }
  const body = JSON.parse(bodyM[1]);
  const pm = body.match(/(<script[^>]*id="__NUXT_DATA__"[^>]*>)([\s\S]*?)(<\/script>)/);
  if (!pm) { console.error(`${file}: hydration payload not found`); problems++; continue; }
  const SLOT = '<!--snz-payload-slot-->';
  let markup = body.replace(pm[0], SLOT);
  const nodes = JSON.parse(pm[2]);
  const html = para(TEXT[locale]);
  const insert = (s) => s.split(AFTER[locale]).join(AFTER[locale] + html);
  const has = (s) => s.includes(html);
  let n = { markup: 0, payload: 0, plain: 0 };
  // markup: both section copies
  if (!has(markup)) {
    const count = markup.split(AFTER[locale]).length - 1;
    if (count !== 2) { console.error(`${file}: expected the anchor sentence twice in the markup (desktop + phone copy), found ${count}`); problems++; continue; }
    markup = insert(markup); n.markup = count;
  }
  // payload: the two copies' HTML strings, and the plain-text mirror
  for (let i = 0; i < nodes.length; i++) {
    const v = nodes[i]; if (typeof v !== 'string') continue;
    if (v.includes(AFTER[locale]) && !has(v)) { nodes[i] = insert(v); n.payload++; }
    else if (!v.includes('<') && v.includes(PLAIN_AFTER + ' ') && !v.includes(TEXT.en)) { nodes[i] = v.split(PLAIN_AFTER + ' ').join(PLAIN_AFTER + ' ' + TEXT.en + ' '); n.plain++; }
  }
  const next = src.replace(bodyM[1], () => JSON.stringify(markup.replace(SLOT, () => pm[1] + escapeJsonForScript(JSON.stringify(nodes)) + pm[3])));
  if (next !== src) {
    if (CHECK) { console.error(`${file}: the advertising-measurement paragraph is missing (markup ${n.markup}, payload ${n.payload}, plain text ${n.plain})`); problems++; continue; }
    fs.writeFileSync(abs, next); changed++;
    console.log(`${file}: paragraph added to ${n.markup} markup copies, ${n.payload} payload strings, ${n.plain} plain-text mirror`);
  } else console.log(`${file}: up to date`);
}
if (problems) process.exit(1);
console.log(changed ? `${changed} file(s) written` : 'up to date');
