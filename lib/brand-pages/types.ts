/* Brand pages (/tempur-pedic now; Sealy and Stearns & Foster to follow): the types every part of the module shares.
   The module is self-contained: lib/brand-pages/ (data, logic) and components/brand-pages/ (rendering) import nothing
   from the rest of the site except through lib/brand-pages/site.ts, the one adapter that reads this site's location
   data. Written so the two folders could later move into a package that every store site installs. */

/** A live brand page's key: its folder name (lib/brand-pages/brand-list.ts). */
import type { BrandKey } from './brand-list.ts';
export type { BrandKey };

/** Text with links in it: the visible FAQ renders the links, the FAQPage JSON-LD takes the plain text. */
export type Segment = string | { text: string; href: string };

/** One FAQ entry as the location config writes it: the answer is plain text; each link names a piece of that text
    (its first occurrence after the previous link) and where it points. */
export type FaqLink = { text: string; href: string };
export type FaqEntry = { question: string; answer: string; links?: readonly FaqLink[] };

/** The store-specific values a brand page needs (the dev handoff, section 4), in the handoff's field names. */
export type BrandLocation = {
  /** must equal the store's id in the promo feed (the Offer Calendar's Stores tab) */
  store_id: string;
  /** the business name the copy uses ("Snooze Mattress + Wellness") */
  business_name: string;
  city: string;
  state: string;
  site_url: string;
  /** Open Graph site name */
  site_name: string;
  /** the street address without the suite ("7913 N 10th St"), for the plain-answer sentence */
  street_short: string;
  address_line1: string;
  address_line2: string;
  hours_lines: readonly string[];
  hours_sentence: string;
  phone_display: string;
  phone_e164: string;
  maps_url: string;
  /** neighbouring towns with their service-area pages; empty hides the "Serving" row and its FAQ */
  nearby: readonly { name: string; path: string }[];
  links: {
    home: string;
    mattresses: string;
    booking: string;
    dream_mapping: string;
    memory_foam: string;
    cooling: string;
    bases: string;
    pillows: string;
    contact: string;
    financing: string;
  };
  /** per brand page: its path, its asset folder and the store's local FAQ for it */
  brand_pages: Partial<Record<BrandKey, { page_path: string; asset_base: string; faq: readonly FaqEntry[] }>>;
  /** the site's structured-data node ids (publisher, website, the store's LocalBusiness) */
  schema_ids: { organization: string; website: string; store: string };
  /** the site's tab icon (metadata icons) */
  site_icon?: string;
};

/* ---------- the promo feed (the JSON the Offer Calendar's Apps Script publishes; dev handoff, section 5) ---------- */
export type FeedStore = { city: string; brands: string[] };
export type PromotionItem = { id?: string; text: string; start: string; end: string };
export type Promotion = {
  block: string;
  vendor: string;
  event: string;
  start: string;
  end: string;
  headline: string;
  fine_print?: string;
  image?: string;
  /** empty = every store that carries the vendor */
  stores?: string[];
  items: PromotionItem[];
};
export type AlwaysOnOffer = {
  id?: string;
  title: string;
  body: string;
  fine_print?: string;
  /** empty = every store */
  stores?: string[];
  faq?: { q: string; a: string } | null;
};
export type PromoFeed = {
  version: number;
  generated_at?: string;
  source?: string;
  stores: Record<string, FeedStore>;
  promotions: Promotion[];
  always_on: AlwaysOnOffer[];
};

/* ---------- per-brand configuration ---------- */
export type PromoImage = { file: string; w: number; h: number; alt: string };

/** The page's sections in order. The brand supplies 'hero', 'vendor' and 'disclaimers' (components/brand-pages/<brand>/);
    'visit', 'promo', 'why-buy' and 'faq' are the shared local and offer sections. */
export type SectionKey = 'hero' | 'visit' | 'promo' | 'vendor' | 'why-buy' | 'faq' | 'disclaimers';

export type BrandConfig = {
  key: BrandKey;
  /** the brand name exactly as the feed writes it (promotions[].vendor, stores[].brands) */
  vendor: string;
  /** the class every selector of the brand's stylesheets is scoped to */
  wrapper_class: string;
  /** breadcrumb and Brand node name */
  name: string;
  /** images, CSS and JS under /public (the path ends with a slash) */
  asset_base: string;
  /** stylesheets under <asset_base>css/, in load order; every selector in them is scoped to the page wrapper */
  stylesheets: readonly string[];
  /** hero backgrounds fetched early, per layout */
  preloads: readonly { file: string; media: string }[];
  /** GA4 creative_slot of the promo block */
  promo_slot: string;
  /** dataLayer events (components/brand-pages/BrandTracking.tsx): what counts as a CTA, and the section each CTA
      reports (the first entry whose selector contains the CTA wins) */
  tracking: { cta_selector: string; cta_sections: readonly (readonly [section: string, selector: string])[] };
  /** promotions[].image key -> file under <asset_base>img/ */
  images: Readonly<Record<string, PromoImage>>;
  sections: readonly SectionKey[];
  seo: {
    title: (loc: BrandLocation) => string;
    description: (loc: BrandLocation) => string;
    og_description: (loc: BrandLocation) => string;
    /** under <asset_base>img/ */
    og_image: { file: string; width: number; height: number };
  };
  copy: {
    h1: (loc: BrandLocation) => string;
    visit_heading: (loc: BrandLocation) => string;
    /** the one-sentence plain answer that opens the visit section (who carries what, where) */
    plain_answer: (loc: BrandLocation) => string;
    visit_paragraphs: (loc: BrandLocation) => string[];
    floor_note: string;
    why_heading: (loc: BrandLocation) => string;
    why_lead: string;
    faq_heading: (loc: BrandLocation) => string;
  };
};
