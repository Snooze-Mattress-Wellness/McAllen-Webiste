'use client';
/* Meta Pixel "Snooze RGV North McAllen" on every page. Both root layouts (and the converter's layout template) render
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
                       LeadConnector iframe, its redirect is the hook; once per session). The clearance forms and the
                       Sleep Fit Quiz call track('Lead') themselves after a successful submit;
         Schedule      NOT fired. The booking widget (link.snoozesleep.com iframe) sends no postMessage on submit —
                       only iframe-resizer height messages, "highlevel.setHeight" and "set-sticky-contacts" cookie
                       syncs, which also fire at load for returning visitors — so there is nothing honest to key off;
     - window.snzMeta.track for the plain scripts in /public (the Sleep Fit Quiz). */
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { META_PIXEL_NOSCRIPT, META_PIXEL_SNIPPET, conversionForPath, isDirectionsHref, isTelHref, track } from '@/lib/meta-pixel';

declare global {
  interface Window { snzMeta?: { track: typeof track } }
}

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

  /* Confirmation pages reached by a LeadConnector form's redirect. The base code may not have run yet when this
     effect does, so retry briefly until window.fbq exists; once per session so a reload does not count twice. */
  useEffect(() => {
    const ev = conversionForPath(pathname);
    if (!ev) return;
    const key = `snzMeta:${ev}:${pathname}`;
    try { if (sessionStorage.getItem(key)) return; } catch { /* storage unavailable: fire anyway */ }
    let tries = 0; let timer: ReturnType<typeof setTimeout> | undefined;
    const fire = () => {
      if (track(ev)) { try { sessionStorage.setItem(key, '1'); } catch { /* ignore */ } return; }
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
