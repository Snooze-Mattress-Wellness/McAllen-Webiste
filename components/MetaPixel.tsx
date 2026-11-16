'use client';
/* Meta Pixel ("Snooze RGV – North McAllen Website", the id in lib/meta-pixel.ts) on every page. Both root layouts (and the converter's layout template) render
   it right after <TrackingBody />, before the #snz-app wrapper:
     - the base code through next/script with strategy="afterInteractive" (Next injects it once the page is
       interactive, so it never lands in <body> while a long page is still streaming — the hydration hazard the layouts
       document), and the <noscript> pixel image right after it;
     - PageView on client-side route changes (usePathname; the first render is covered by the base code's own
       PageView). The site navigates with plain <a href> links today, so this only matters once something uses
       next/link;
     - the events, all scoped to this pixel with trackSingle (lib/meta-pixel.ts):
         Contact       any a[href^="tel:"] click — one delegated capture-phase listener, so the header, top bar,
                       footer, CTAs and the generated pages are covered, English and Spanish;
         FindLocation  any directions / Google Maps link click (address links, Get Directions, Open in Maps);
         Lead          the contact opt-in form's confirmation page (/thank/you, /es/thank/you: the form is a
                       LeadConnector iframe, its redirect is the hook; once per page load). The clearance forms and
                       the Sleep Fit Quiz call track('Lead') themselves after a successful submit;
         Schedule      the Dream Mapping calendar's confirmation page (/dream/map/thank/you, /es/…), with
                       content_name "Dream Mapping McAllen", once per page load. The booking widget itself sends no
                       postMessage on submit (only iframe-resizer heights, "highlevel.setHeight" and
                       "set-sticky-contacts" cookie syncs), so its post-booking redirect to that page is the hook;
     - window.snzMeta.track for the plain scripts in /public (the Sleep Fit Quiz). */
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { META_PIXEL_NOSCRIPT, META_PIXEL_SNIPPET, conversionForPath, conversionParams, isDirectionsHref, isTelHref, track } from '@/lib/meta-pixel';

declare global {
  interface Window { snzMeta?: { track: typeof track } }
}

/* Confirmation-page conversions already sent during this page's lifetime (event:path). Module-level, like PageView's
   guard: survives re-renders, Strict Mode's double effect and client-side navigation; a full reload starts fresh. */
const fired = new Set<string>();

export default function MetaPixel() {
  const pathname = usePathname() || '/';
  const lastPath = useRef<string | null>(null);

  /* PageView on client-side navigation only: the initial load is the base code's PageView. */
  useEffect(() => {
    if (lastPath.current === null) { lastPath.current = pathname; return; }
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    track('PageView');
  }, [pathname]);

  /* Confirmation pages reached by a LeadConnector form's redirect: Schedule on the booking confirmation page, Lead on
     the opt-in one (lib/meta-pixel.ts). Exactly once per page load, guarded like PageView (the `fired` record above).
     The base code may not have run yet when this effect does, so retry briefly until window.fbq exists. */
  useEffect(() => {
    const ev = conversionForPath(pathname);
    if (!ev) return;
    const key = `${ev}:${pathname}`;
    if (fired.has(key)) return;
    let tries = 0; let timer: ReturnType<typeof setTimeout> | undefined;
    const fire = () => {
      if (fired.has(key)) return;
      if (track(ev, conversionParams(ev))) { fired.add(key); return; }
      if (++tries < 100) timer = setTimeout(fire, 100);
    };
    fire();
    return () => { if (timer) clearTimeout(timer); };
  }, [pathname]);

  /* Delegated clicks (capture phase: runs even when a link's own handler stops propagation) and the global helper. */
  useEffect(() => {
    window.snzMeta = { track };
    const onClick = (e: MouseEvent) => {
      const t = e.target as Element | null;
      const a = t && typeof t.closest === 'function' ? t.closest('a[href]') : null;
      if (!a) return;
      const href = a.getAttribute('href');
      if (isTelHref(href)) track('Contact');
      else if (isDirectionsHref(href)) track('FindLocation');
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">{META_PIXEL_SNIPPET}</Script>
      <noscript dangerouslySetInnerHTML={{ __html: META_PIXEL_NOSCRIPT }} />
    </>
  );
}
