/* The brand page body: the brand's template.html with its five tokens ({{H1}}, {{VISIT}}, {{PROMO}}, {{WHY}}, {{FAQ}})
   and the shared partials filled exactly as the package's tools/build-page.mjs fills them (production paths). Only the
   offers markup (snooze-promo.js) and the FAQ (faq.ts) come from elsewhere. A token without a value throws, so the
   build fails instead of shipping "{{…}}". The browser never runs snooze-promo.js on this site, so the partials'
   data-snz-feed-url is left empty (nothing fetches it). */
import Promo from './snooze-promo.js';
import type { AlwaysOnOffer, BrandJson, BrandLocation, FaqEntry, Promotion } from './types.ts';
import type { Partials } from './files.ts';
import { esc, faqHtml, listAnd } from './faq.ts';

export type RenderInput = {
  brand: BrandJson;
  template: string;
  partials: Partials;
  location: BrandLocation;
  promos: readonly Promotion[];
  tiles: readonly AlwaysOnOffer[];
  faq: readonly FaqEntry[];
  /** where the brand's assets are served (default /brands/<slug>/; the package previews use brands/<slug>/) */
  brandBase?: string;
  /** the partials' data-snz-feed-url (default empty: nothing on this site fetches the feed in the browser) */
  feedUrl?: string;
};

const fill = (s: string, l: BrandLocation) => String(s).replace(/\{city\}/g, l.city).replace(/\{state\}/g, l.state);

export function renderBrandBody(x: RenderInput): string {
  const { brand, location: l } = x;
  const brandBase = x.brandBase ?? `/brands/${brand.slug}/`;
  const tokens: Record<string, string> = {
    ...Object.fromEntries(Object.entries(l).filter(([, v]) => typeof v === 'string').map(([k, v]) => [k, esc(v)])),
    ...Object.fromEntries(Object.entries(l.links).map(([k, v]) => [`links.${k}`, esc(v)])),
    page_url: esc(l.site_url + brand.page_path),
    brand_base: brandBase,
    brand_asset_base: `/brands/${brand.slug}/`,
    feed_url: esc(x.feedUrl ?? ''),
    vendor: esc(brand.vendor),
    brand_name: esc(brand.name),
    brand_carries: esc(brand.carries),
    brand_visit_intro: esc(brand.visit_intro),
    brand_try_items: esc(brand.try_items),
    brand_fit_tail: esc(brand.fit_tail),
    H1: `<h1 class="snz-h1">${esc(fill(brand.h1, l))}</h1>`,
    HOURS_HTML: l.hours_lines.map(esc).join('<br>'),
    SERVING_ROW: l.nearby.length ? `\t\t\t\t\t\t<dt>Serving</dt><dd>${listAnd(l.nearby.map((n) => `<a href="${esc(n.path)}">${esc(n.name)}</a>`))}</dd>` : '',
    IMAGES_JSON: esc(JSON.stringify(brand.promo_images || {})),
    PROMO_HTML: Promo.renderPromotionsHTML(x.promos, { imageBase: brandBase + 'img/', bookingUrl: l.links.booking, images: brand.promo_images }),
    ALWAYS_ON_HTML: Promo.renderAlwaysOnHTML(x.tiles),
    FAQ_HTML: faqHtml(x.faq),
  };
  const render = (tpl: string) => tpl.replace(/\{\{([\w.]+)\}\}/g, (m, key: string) => {
    if (!(key in tokens)) throw new Error(`No value for {{${key}}} (brand ${brand.slug}, location ${l.store_id})`);
    return tokens[key];
  });
  // partials first (they contain tokens too), then the brand body
  Object.assign(tokens, { VISIT: render(x.partials.visit), PROMO: render(x.partials.promo), WHY: render(x.partials.why), FAQ: render(x.partials.faq) });
  return render(x.template);
}

/** brand.json title / description / og_description / h1 with {city} and {state} filled */
export const brandText = (s: string, l: BrandLocation) => fill(s, l);
