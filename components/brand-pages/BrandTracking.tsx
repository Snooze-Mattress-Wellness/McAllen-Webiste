'use client';
/* dataLayer events of a brand page (GA4 tags are built in GTM; nothing here loads a tag):
     view_promotion    once per page view per promo block, when at least half of it is on screen
                       { ecommerce: null } then { event, store_id, ecommerce: { promotion_id, promotion_name,
                       creative_name, creative_slot, items: [] } }
     select_promotion  a click on a link or button inside a promo block: the same, plus link_url
     cta_click         a click on any CTA of the page { event, store_id, brand, cta_text, cta_url, cta_section,
                       page_type: "brand" } (cta_section: hero, visit, promo, product, why, faq)
   The promo blocks are the package's markup (snooze-promo.js renderPromotionsHTML), which carries no block id: the
   blocks inside the promo slot are the selected promotions in the same order, so the n-th block is promos[n].
   store_id and brand come from the store's and the brand's config. The site's own phone_click and directions_click
   (public/snz-events.js) add store_id on this page from the wrapper's data-snz-store-id. */
import { useEffect } from 'react';

export type TrackedPromo = { block: string; headline: string; event: string };
type Props = {
  storeId: string;
  brand: string;
  wrapperClass: string;
  promoSlot: string;
  promos: TrackedPromo[];
  ctaSelector: string;
  ctaSections: readonly (readonly [string, string])[];
};

type DataLayerWindow = Window & { dataLayer?: Record<string, unknown>[] };

export default function BrandTracking({ storeId, brand, wrapperClass, promoSlot, promos, ctaSelector, ctaSections }: Props) {
  useEffect(() => {
    const root = document.querySelector(`.${wrapperClass}`);
    if (!root) return;
    const w = window as DataLayerWindow;
    const dl = (w.dataLayer = w.dataLayer || []);
    const blocks = Array.from(root.querySelectorAll('[data-snz-promo-slot] > .snz-promo'));
    const byEl = new Map<Element, TrackedPromo>();
    blocks.forEach((el, i) => { if (promos[i]) byEl.set(el, promos[i]); });
    const promotion = (el: Element) => {
      const p = byEl.get(el);
      return p ? { promotion_id: p.block, promotion_name: p.headline, creative_name: p.event, creative_slot: promoSlot, items: [] } : null;
    };

    /* view_promotion: at least half of the block visible (or, for a block taller than twice the screen, half the
       screen filled by it); once per block per page view */
    const seen = new Set<Element>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting || seen.has(e.target)) continue;
        if (e.intersectionRatio < 0.5 && e.intersectionRect.height < window.innerHeight / 2) continue;
        const ecommerce = promotion(e.target);
        if (!ecommerce) continue;
        seen.add(e.target);
        io.unobserve(e.target);
        dl.push({ ecommerce: null });
        dl.push({ event: 'view_promotion', store_id: storeId, ecommerce });
      }
    }, { threshold: [0, 0.25, 0.5, 0.75, 1] });
    byEl.forEach((_, el) => io.observe(el));

    /* clicks: select_promotion inside a promo block, cta_click on every CTA */
    const onClick = (ev: Event) => {
      const t = ev.target as Element | null;
      const a = t && t.closest ? t.closest('a, button') : null;
      if (!a || !root.contains(a)) return;
      const url = a instanceof HTMLAnchorElement ? a.href : '';
      const block = a.closest('[data-snz-promo-slot] > .snz-promo');
      const ecommerce = block && promotion(block);
      if (ecommerce) {
        dl.push({ ecommerce: null });
        dl.push({ event: 'select_promotion', store_id: storeId, link_url: url, ecommerce });
      }
      if (a.matches(ctaSelector)) {
        const section = ctaSections.find(([, sel]) => a.closest(sel))?.[0] || 'other';
        // a link with no text of its own (the Serta hero picture) reports its aria-label
        const text = (a.textContent || '').replace(/\s+/g, ' ').trim() || a.getAttribute('aria-label') || '';
        dl.push({ event: 'cta_click', store_id: storeId, brand, cta_text: text.slice(0, 100), cta_url: url, cta_section: section, page_type: 'brand' });
      }
    };
    root.addEventListener('click', onClick, true);
    return () => { io.disconnect(); root.removeEventListener('click', onClick, true); };
  }, [storeId, brand, wrapperClass, promoSlot, promos, ctaSelector, ctaSections]);
  return null;
}
