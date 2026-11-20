/* Tempur-Pedic: everything about the brand page that is the same at every store. The vendor's own sections (hero,
   sleep-problem slider, products, reviews, video, disclaimers) are JSX in components/brand-pages/tempur-pedic/; their
   images, scoped stylesheets and slider script are under public/brands/tempur-pedic/. Source: the Tempur-Pedic dealer
   brand-page kit as prepared for Snooze (package "snooze-tempur-pedic-brand-page" v2.1, received November 20, 2026). */
import type { BrandConfig } from '../types.ts';

export const TEMPUR_PEDIC: BrandConfig = {
  key: 'tempur-pedic',
  vendor: 'Tempur-Pedic',
  wrapper_class: 'tempur-wrapper',
  name: 'Tempur-Pedic',
  asset_base: '/brands/tempur-pedic/',
  // the package's order; swiper-bundle.min.css was prefixed with .tempur-wrapper for this site, the other two came scoped
  stylesheets: ['swiper-bundle.min.css', 'tempur-pedic.scoped.css', 'snooze-tempur-overrides.css'],
  preloads: [
    { file: 'bg_header.webp', media: '(min-width: 1024px)' },
    { file: 'bg_mobile_header.webp', media: '(max-width: 1023px)' },
  ],
  promo_slot: 'tempur_promo',
  tracking: {
    // the vendor buttons (.btn), the local and offer buttons (.snz-btn) and the links inside the FAQ answers
    cta_selector: 'a.btn, a.snz-btn, .snz-faq details a',
    cta_sections: [['hero', '.header'], ['visit', '.snz-visit'], ['promo', '.snz-promo'], ['product', '.product-container'], ['why', '.snz-why'], ['faq', '.snz-faq']],
  },
  // js/snooze-promo.js IMAGES, unchanged
  images: {
    base: { file: 'base.webp', w: 1592, h: 948, alt: 'TEMPUR-Ergo ProSmart adjustable base' },
    breeze: { file: 'breeze_stack.webp', w: 1328, h: 810, alt: 'Stack of TEMPUR-Breeze mattresses' },
    adapt: { file: 'adapt_stack.webp', w: 1002, h: 793, alt: 'Stack of TEMPUR-Adapt mattresses' },
    activebreeze: { file: 'mattress_stack_breeze.webp', w: 1328, h: 810, alt: 'TEMPUR-ActiveBreeze smart bed' },
    splitking: { file: 'split_king.webp', w: 1002, h: 793, alt: 'Tempur-Pedic Split Head King on an adjustable base' },
    pillows: { file: 'pillow-stack.webp', w: 547, h: 456, alt: 'Stack of Tempur-Pedic pillows' },
  },
  sections: ['hero', 'visit', 'promo', 'vendor', 'why-buy', 'faq', 'disclaimers'],
  seo: {
    title: (l) => `Tempur-Pedic Mattresses in ${l.city}, ${l.state} | Snooze Mattress`,
    description: (l) => `Try Tempur-Pedic Adapt, Breeze and smart adjustable bases at Snooze Mattress in ${l.city}. Get a free Dream Mapping fitting to find the right fit for your body.`,
    og_description: (l) => `Try Tempur-Pedic in ${l.city} and get a free Dream Mapping fitting to find the right fit for your body.`,
    og_image: { file: 'og-image.jpg', width: 1200, height: 630 },
  },
  copy: {
    h1: (l) => `Tempur-Pedic Mattresses in ${l.city}, ${l.state}`,
    visit_heading: (l) => `Try Tempur-Pedic in ${l.city}`,
    // client-supplied (November 20, 2026), with the store's own street and city; it never claims a dealer authorization
    plain_answer: (l) => `${l.business_name} at ${l.street_short} in ${l.city} carries Tempur-Pedic mattresses, adjustable bases and pillows.`,
    visit_paragraphs: (l) => [
      `Reading about TEMPUR-Material is one thing. Feeling how it supports your body is another. Visit Snooze Mattress in ${l.city} to lie down on Tempur-Pedic mattresses and adjustable bases, and start with a free Dream Mapping fitting.`,
      'Dream Mapping, our pressure mapping technology, shows where your body needs support. Your Sleep Coach then helps you find the Tempur-Pedic that fits how you sleep, whether that\'s the cooling Breeze collection or the pressure-relieving Adapt collection.',
    ],
    floor_note: 'Floor models vary. Call ahead to check which Tempur-Pedic models are on display.',
    why_heading: (l) => `Why Buy Tempur-Pedic at Snooze Mattress in ${l.city}`,
    why_lead: 'Tempur-Pedic makes great mattresses, but the right one still depends on your body. Skip the guesswork: get fitted first, then choose with confidence.',
    faq_heading: (l) => `Tempur-Pedic in ${l.city}: Common Questions`,
  },
  // the static fallback (only when the feed cannot be read and no copy is cached): the package's four always-on tiles
  // and their two FAQ answers, word for word (mcallen.html)
  fallback: {
    always_on: [
      { title: 'Free Dream Mapping', body: 'Always free, no purchase needed. See where your body needs support before you choose.', fine_print: '', faq: null },
      { title: '365-Night Sleep Guarantee', body: 'Sleep on it at home with our 365-Night Sleep Guarantee.', fine_print: 'See store for details.', faq: null },
      {
        title: 'Special Financing',
        body: '0% interest for up to 60 months, no down payment.\nNo credit check options available.',
        fine_print: '0% interest with approved credit. No credit check options are offered separately. See store for details.',
        faq: { q: 'Do you offer financing on Tempur-Pedic mattresses?', a: 'Yes. Special financing is available: 0% interest for up to 60 months with no down payment, with approved credit. No credit check options are also available. See store for details.' },
      },
      {
        title: 'HSA/FSA Accepted',
        body: 'Put your HSA or FSA dollars toward better sleep on eligible purchases.',
        fine_print: 'Eligibility depends on your plan.',
        faq: { q: 'Can I use my HSA or FSA?', a: 'Snooze Mattress accepts HSA and FSA payments on eligible purchases. Eligibility depends on your plan.' },
      },
    ],
  },
};
