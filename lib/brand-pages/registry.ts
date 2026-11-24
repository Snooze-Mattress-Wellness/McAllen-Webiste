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
  beautyrest: {
    wrapper_class: 'beautyrest-wrapper',
    promo_slot: 'beautyrest_promo',
    tracking: {
      // the brand's buttons (.br-btn), the local and offer buttons (.snz-btn) and the links inside the FAQ answers
      cta_selector: 'a.br-btn, a.snz-btn, .snz-faq details a',
      cta_sections: [['hero', '.br-hero'], ['visit', '.snz-visit'], ['promo', '.snz-promo'], ['product', '.br-collections'], ['product', '.br-adjust'], ['why', '.snz-why'], ['faq', '.snz-faq']],
    },
  },
  sealy: {
    wrapper_class: 'sealy-wrapper',
    promo_slot: 'sealy_promo',
    // sealy.scoped.css hides every <br> on the page from 658px (one unscoped rule): undone outside the wrapper and in
    // the shared local sections
    site_styles: ['/brands/site/sealy-containment.css'],
    tracking: {
      // the vendor buttons (.btn), the local and offer buttons (.snz-btn) and the links inside the FAQ answers
      cta_selector: 'a.btn, a.snz-btn, .snz-faq details a',
      cta_sections: [['hero', '.header'], ['visit', '.snz-visit'], ['promo', '.snz-promo'], ['product', '.product-container'], ['product', '.accessories'], ['why', '.snz-why'], ['faq', '.snz-faq']],
    },
  },
  'stearns-foster': {
    // the template's wrapper has no vendor class of its own: all vendor CSS is scoped to .snz-brand--stearns-foster
    wrapper_class: 'snz-brand--stearns-foster',
    promo_slot: 'stearns_foster_promo',
    tracking: {
      // the vendor buttons (.as-b), the local and offer buttons (.snz-btn) and the links inside the FAQ answers
      cta_selector: 'a.as-b, a.snz-btn, .snz-faq details a',
      cta_sections: [['hero', '.hero'], ['visit', '.snz-visit'], ['promo', '.snz-promo'], ['product', '.list'], ['product', '.options'], ['why', '.snz-why'], ['faq', '.snz-faq']],
    },
  },
  serta: {
    wrapper_class: 'serta-wrapper',
    promo_slot: 'serta_promo',
    tracking: {
      // the brand's buttons (.br-btn), the hero picture (one link to #visit), the local and offer buttons (.snz-btn) and
      // the links inside the FAQ answers
      cta_selector: 'a.br-btn, a.se-hero__media, a.snz-btn, .snz-faq details a',
      cta_sections: [['hero', '.se-hero'], ['visit', '.snz-visit'], ['promo', '.snz-promo'], ['product', '.br-collections'], ['product', '.br-adjust'], ['why', '.snz-why'], ['faq', '.snz-faq']],
    },
  },
  'copper-by-spring-air': {
    wrapper_class: 'copper-wrapper',
    promo_slot: 'copper_promo',
    tracking: {
      // the brand's buttons (.cp-btn), the hero picture (one link to #visit), the local and offer buttons (.snz-btn) and
      // the links inside the FAQ answers
      cta_selector: 'a.cp-btn, a.cp-hero__media, a.snz-btn, .snz-faq details a',
      cta_sections: [['hero', '.cp-hero'], ['visit', '.snz-visit'], ['promo', '.snz-promo'], ['product', '.cp-collections'], ['product', '.cp-pillows'], ['why', '.snz-why'], ['faq', '.snz-faq']],
    },
  },
  'king-koil': {
    wrapper_class: 'kk-wrapper',
    promo_slot: 'king_koil_promo',
    tracking: {
      // the brand's buttons (.kk-btn), the hero picture (one link to #visit), the two collection cards (links to #flowt
      // and #handcrafted), the local and offer buttons (.snz-btn) and the links inside the FAQ answers
      cta_selector: 'a.kk-btn, a.kk-hero__media, a.kk-pick__card, a.snz-btn, .snz-faq details a',
      cta_sections: [['hero', '.kk-hero'], ['visit', '.snz-visit'], ['promo', '.snz-promo'], ['product', '.kk-pick'], ['product', '.kk-flowt'], ['product', '.kk-hc'], ['why', '.snz-why'], ['faq', '.snz-faq']],
    },
  },
};

const brand = (key: BrandKey): BrandConfig => ({ key, json: brandJson<BrandJson>(key), template: brandTemplate(key), site: SITE[key] });

export const BRANDS: Readonly<Record<BrandKey, BrandConfig>> = {
  'tempur-pedic': brand('tempur-pedic'),
  beautyrest: brand('beautyrest'),
  serta: brand('serta'),
  sealy: brand('sealy'),
  'stearns-foster': brand('stearns-foster'),
  'copper-by-spring-air': brand('copper-by-spring-air'),
  'king-koil': brand('king-koil'),
};

export { BRAND_KEYS, BRAND_PAGE_PATHS, LIVE_BRANDS } from './brand-list.ts';
