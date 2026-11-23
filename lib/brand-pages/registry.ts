/* The brand registry: every brand page the module renders. A brand = the package's brands/<slug>/brand.json and
   template.html (copied unchanged into lib/brand-pages/brands/<slug>/), its assets in public/brands/<slug>/, and this
   site's few settings below. Adding a brand = its folder + an entry here + live in brand-list.ts; no new logic. */
import type { BrandConfig, BrandJson, BrandKey, BrandSite } from './types.ts';
import { brandJson, brandTemplate } from './files.ts';

const SITE: Readonly<Record<BrandKey, BrandSite>> = {
  'tempur-pedic': {
    wrapper_class: 'tempur-wrapper',
    promo_slot: 'tempur_promo',
    tracking: {
      // the vendor buttons (.btn), the local and offer buttons (.snz-btn) and the links inside the FAQ answers
      cta_selector: 'a.btn, a.snz-btn, .snz-faq details a',
      cta_sections: [['hero', '.header'], ['visit', '.snz-visit'], ['promo', '.snz-promo'], ['product', '.product-container'], ['why', '.snz-why'], ['faq', '.snz-faq']],
    },
    // the package's shared Swiper CSS is global; this site serves the copy whose every selector is scoped to
    // .tempur-wrapper (it styles nothing outside the page)
    style_paths: { '{shared}css/swiper-bundle.min.css': '/brands/tempur-pedic/css/swiper-bundle.min.css' },
  },
};

const brand = (key: BrandKey): BrandConfig => ({ key, json: brandJson<BrandJson>(key), template: brandTemplate(key), site: SITE[key] });

export const BRANDS: Readonly<Record<BrandKey, BrandConfig>> = {
  'tempur-pedic': brand('tempur-pedic'),
};

export { BRAND_KEYS, BRAND_PAGE_PATHS, LIVE_BRANDS } from './brand-list.ts';
