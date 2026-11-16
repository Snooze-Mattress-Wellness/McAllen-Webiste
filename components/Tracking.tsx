'use client';
/* Tracking tags for every page, rendered once by both root layouts (and by the converter's layout template), high in
   <head>, in the client's order, all starting at parse time —
     1. the Google tag (gtag.js) for G-9R1JGVBRBR + its config, then the Google Ads config (AW-17532275127) and the
        website call-tracking config (lib/google-tag.ts: Google swaps the visible store number for a forwarding
        number for visitors who came from an ad)
     2. Google Tag Manager GTM-TVPN94M (the standard inline loader; it injects an async gtm.js). The container is
        managed in Tag Manager and never changed here; it depends on the dataLayer events of public/snz-events.js
        (phone_click, directions_click, booking_confirmation, optin_submit) and the quiz events, whose names stay
     3. Simpli.fi (async)
     4. the Google tag (gtag.js) for G-TS1RXQVPYT + its config
   plus the GTM noscript iframe as the first element we render in <body> (Next.js itself emits an empty <div hidden>
   before it) and, next to it, the Google Ads booking conversion (BookingConversion below). Both GA4 properties are
   intentional: never merge or dedupe them. Nothing waits for an interaction, the load event or consent (a previous
   performance pass deferred the tags until the first interaction and GA4 stopped recording visitors who bounced).

   Production only: each gtag block defines dataLayer and gtag() for everyone, then checks location.hostname and only
   on the production host (lib/google-tag.ts PRODUCTION_HOST) injects its gtag.js loader and runs its config calls.
   On Vercel previews and localhost the site's own Google tag therefore sends nothing (no GA4 hit, no Ads hit, no call
   tracking, no booking conversion); GTM and Simpli.fi are unchanged there. The loaders used to be static
   <script async src> elements; injecting them from the inline check costs nothing measurable (the block is the first
   thing in <head> after the body guard) and keeps the view-source order the client's.

   Per page: both GA4 configs carry content_group (home, product, booking, …) and page_language (en | es), derived
   from the pathname by lib/google-tag.ts (usePathname: the layouts render this component for every route, server
   side, so the values are in the HTML).

   Why this is a client component: React 19 treats every `<script async src>` as a hoistable resource and moves it
   ahead of the rest of <head>; a script with an onLoad handler is rendered in place instead, so the Simpli.fi loader
   carries a no-op onLoad (it adds nothing to the HTML) and the order in view-source is exactly the client's. The
   booking conversion needs the pathname and an effect, too.

   Hydration safety: tags fired by the GTM container insert elements into <body> while a long page is still
   streaming. components/GhlPage.tsx keeps the server-rendered page markup and puts it back if React ever has to
   re-render the tree after such an insertion, so the page never comes back blank. */
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ADS_ID, BOOKING_CONVERSION, CALL_CONVERSION, GA4_PRIMARY_ID, GA4_SECONDARY_ID, ga4PageParams, googleTagBlock, isBookingConfirmation, isProductionHost } from '@/lib/google-tag';

const keep = () => {};

/* The two gtag blocks (lib/google-tag.ts googleTagBlock: dataLayer + gtag() for everyone, then, on the production
   host only, the gtag.js loader and these config calls in this order). `params` is the page's
   {content_group, page_language} as a JSON object literal. */
const GTAG_PRIMARY_CONFIG = (params: string) => googleTagBlock(GA4_PRIMARY_ID, [
  `gtag('config', '${GA4_PRIMARY_ID}', ${params});`,
  `gtag('config', '${ADS_ID}');`,
  `gtag('config', '${CALL_CONVERSION.send_to}', ${JSON.stringify({ phone_conversion_number: CALL_CONVERSION.phone_conversion_number })});`,
]);
const GTAG_SECONDARY_CONFIG = (params: string) => googleTagBlock(GA4_SECONDARY_ID, [`gtag('config', '${GA4_SECONDARY_ID}', ${params});`]);
/* The client's Tag Manager snippets, character for character. */
const GTM_SNIPPET = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-TVPN94M');`;
const GTM_NOSCRIPT = `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TVPN94M"
height="0" width="0" style="display:none;visibility:hidden"></iframe>`;

/** <head> tags, in the client's order. */
export function TrackingHead() {
  /* content_group + page_language for this page, as a JSON object literal inside both config calls */
  const params = JSON.stringify(ga4PageParams(usePathname() || '/'));
  return (
    <>
      {/* Google tag (gtag.js): loader + config, production host only */}
      <script dangerouslySetInnerHTML={{ __html: GTAG_PRIMARY_CONFIG(params) }} />
      {/* Google Tag Manager */}
      <script dangerouslySetInnerHTML={{ __html: GTM_SNIPPET }} />
      {/* End Google Tag Manager */}
      <script async src="https://tag.simpli.fi/sifitag/b781856a-502d-46d8-a1da-c8e46665edab" onLoad={keep} />
      {/* Google tag (gtag.js): loader + config, production host only */}
      <script dangerouslySetInnerHTML={{ __html: GTAG_SECONDARY_CONFIG(params) }} />
    </>
  );
}

/** Google Tag Manager (noscript), immediately after <body>, and the Google Ads booking conversion. */
export function TrackingBody() {
  return (
    <>
      <noscript dangerouslySetInnerHTML={{ __html: GTM_NOSCRIPT }} />
      <BookingConversion />
    </>
  );
}

/* Conversions already sent during this page's lifetime (send_to:path). Module-level, the same guard as the Meta
   Schedule event (components/MetaPixel.tsx): survives re-renders, Strict Mode's double effect and client-side
   navigation back to the page; a full reload starts fresh. */
const fired = new Set<string>();

/** Google Ads conversion for a booked Dream Mapping appointment: once per load of the booking confirmation page
    (/dream/map/thank/you, /es/…), on the production host only (where the Google tag loads), queued after the Google
    tag's config calls (gtag() is defined inline in <head> at parse time, so the event always lands in the dataLayer
    behind the configs). */
function BookingConversion() {
  const pathname = usePathname() || '/';
  useEffect(() => {
    if (!isBookingConfirmation(pathname)) return;
    const key = `${BOOKING_CONVERSION.send_to}:${pathname}`;
    if (fired.has(key)) return;
    fired.add(key);
    if (!isProductionHost(location.hostname)) return;
    const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
    if (gtag) gtag('event', 'conversion', BOOKING_CONVERSION);
  }, [pathname]);
  return null;
}
