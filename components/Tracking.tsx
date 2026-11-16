'use client';
/* Tracking tags for every page, rendered once by both root layouts (and by the converter's layout template):
   the client's snippets VERBATIM and IN THE CLIENT'S ORDER, high in <head>, all loading at parse time —
     1. Google tag (gtag.js) G-9R1JGVBRBR + its config
     2. Google Tag Manager GTM-TVPN94M (the standard inline loader; it injects an async gtm.js)
     3. Simpli.fi (async)
     4. Google tag (gtag.js) G-TS1RXQVPYT + its config
   plus the GTM noscript iframe as the first element we render in <body> (Next.js itself emits an empty
   <div hidden> before it) and, next to it, the Google Ads booking conversion (BookingConversion below). The first
   gtag block also configures the Google Ads account (AW-17532275127, lib/google-tag.ts), so the Google tag carries
   the three ids, and then website call tracking (gtag config with phone_conversion_number: Google swaps the visible
   store number for a forwarding number for visitors from ads). Both GA4 properties are intentional: never merge or dedupe them. Nothing waits for an
   interaction, the load event or consent (a previous performance pass deferred the tags until the first
   interaction and GA4 stopped recording visitors who bounced). Site events (phone_click, directions_click,
   booking_confirmation, optin_submit, quiz events) go to the same dataLayer from public/snz-events.js.

   Why this is a client component: React 19 treats every `<script async src>` as a hoistable resource and moves it
   ahead of the rest of <head>, which put the two gtag.js loaders and Simpli.fi before the inline config / GTM
   snippets. A script that has an onLoad handler is rendered in place instead, so each async loader carries a no-op
   onLoad (it adds nothing to the HTML) and the order in view-source is exactly the client's.

   Hydration safety: tags fired by the GTM container (CallRail number swapping and others) insert elements into
   <body> while a long page is still streaming. components/GhlPage.tsx keeps the server-rendered page markup and puts
   it back if React ever has to re-render the tree after such an insertion, so the page never comes back blank. */
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ADS_ID, BOOKING_CONVERSION, CALL_CONVERSION, isBookingConfirmation } from '@/lib/google-tag';

const keep = () => {};

/* The client's snippets, character for character. */
const GTAG_PRIMARY_CONFIG = `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-9R1JGVBRBR');
  gtag('config', '${ADS_ID}');
  gtag('config', '${CALL_CONVERSION.send_to}', ${JSON.stringify({ phone_conversion_number: CALL_CONVERSION.phone_conversion_number })});
`;
const GTM_SNIPPET = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-TVPN94M');`;
const GTAG_SECONDARY_CONFIG = `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-TS1RXQVPYT');
`;
const GTM_NOSCRIPT = `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TVPN94M"
height="0" width="0" style="display:none;visibility:hidden"></iframe>`;

/** <head> tags, in the client's order. */
export function TrackingHead() {
  return (
    <>
      {/* Google tag (gtag.js) */}
      <script async src="https://www.googletagmanager.com/gtag/js?id=G-9R1JGVBRBR" onLoad={keep} />
      <script dangerouslySetInnerHTML={{ __html: GTAG_PRIMARY_CONFIG }} />
      {/* Google Tag Manager */}
      <script dangerouslySetInnerHTML={{ __html: GTM_SNIPPET }} />
      {/* End Google Tag Manager */}
      <script async src="https://tag.simpli.fi/sifitag/b781856a-502d-46d8-a1da-c8e46665edab" onLoad={keep} />
      {/* Google tag (gtag.js) */}
      <script async src="https://www.googletagmanager.com/gtag/js?id=G-TS1RXQVPYT" onLoad={keep} />
      <script dangerouslySetInnerHTML={{ __html: GTAG_SECONDARY_CONFIG }} />
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
    (/dream/map/thank/you, /es/…), queued after the Google tag's config calls (gtag() is defined inline in <head> at
    parse time, so the event always lands in the dataLayer behind the configs). */
function BookingConversion() {
  const pathname = usePathname() || '/';
  useEffect(() => {
    if (!isBookingConfirmation(pathname)) return;
    const key = `${BOOKING_CONVERSION.send_to}:${pathname}`;
    if (fired.has(key)) return;
    fired.add(key);
    const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
    if (gtag) gtag('event', 'conversion', BOOKING_CONVERSION);
  }, [pathname]);
  return null;
}
