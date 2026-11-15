/* Meta Pixel — dataset "Snooze RGV – North McAllen Website", id 1451635126439330 (November 16, 2026): the id, the base
   code and the small event helper used by
   components/MetaPixel.tsx (every page, both root layouts), the clearance forms and public/sleep-fit-quiz.js.
   The id is public (it is in every page's HTML), so it lives here in code.

   This must be the site's ONLY pixel. The GTM container (GTM-TVPN94M, components/Tracking.tsx) has been seen to load a
   pixel of its own; that cannot be removed from this repo and is handled in GTM. While any other pixel shares the one
   window.fbq, fbq('track', …) broadcasts to EVERY initialised pixel, so everything here uses
   fbq('trackSingle', META_PIXEL_ID, …): our PageView and events reach only this pixel. (The reverse is not in our
   hands: broadcast fbq('track', …) calls made by GTM tags after this pixel has initialised reach it too, which
   double-counts PageView until GTM is cleaned up.) */
export const META_PIXEL_ID = '1451635126439330';

export type MetaEvent = 'PageView' | 'Contact' | 'FindLocation' | 'Lead' | 'Schedule';

/* The client's base code, character for character, except that its PageView is scoped to this pixel (see above). */
export const META_PIXEL_SNIPPET = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${META_PIXEL_ID}');
fbq('trackSingle','${META_PIXEL_ID}','PageView');`;

export const META_PIXEL_NOSCRIPT = `<img height="1" width="1" style="display:none" alt="" src="https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1"/>`;

type Fbq = (...args: unknown[]) => void;

/** Sends a standard event to this pixel only. Safe to call anywhere: it does nothing on the server or before the base
    code has created window.fbq, and says whether the event was handed to fbq. */
export function track(name: MetaEvent, params?: Record<string, unknown>): boolean {
  if (typeof window === 'undefined') return false;
  const fbq = (window as unknown as { fbq?: Fbq }).fbq;
  if (typeof fbq !== 'function') return false;
  if (params) fbq('trackSingle', META_PIXEL_ID, name, params);
  else fbq('trackSingle', META_PIXEL_ID, name);
  return true;
}

/** tel: links anywhere (header, top bar, footer, CTAs, the generated pages). */
export const isTelHref = (href: string | null | undefined): boolean => /^tel:/i.test((href || '').trim());

/* Directions / map links: Google Maps (any country domain and its short links), Apple Maps, Waze, geo: URIs. The same
   family as the directions_click rule in public/snz-events.js. */
const MAPS = /^(?:geo:|(?:https?:)?\/\/(?:www\.)?(?:google\.[a-z.]+\/maps|maps\.google\.|maps\.app\.goo\.gl|goo\.gl\/maps|g\.page\/|maps\.apple\.com|waze\.com))/i;
export const isDirectionsHref = (href: string | null | undefined): boolean => MAPS.test((href || '').trim());

/* Conversions that can only be reached by completing a form that lives in a LeadConnector iframe, whose submit we
   cannot see: the iframe redirects the top window to a site page once the form has gone through.
     /thank/you (and /es/…) — the contact opt-in form's confirmation page → Lead
   The booking widget's confirmation page (/dream/map/thank/you) is deliberately NOT mapped: Schedule is reserved for a
   submit message from the booking iframe, and the widget sends none (components/MetaPixel.tsx). */
export function conversionForPath(pathname: string): MetaEvent | null {
  const p = pathname.replace(/\/+$/, '') || '/';
  if (/^(\/es)?\/thank\/you$/.test(p)) return 'Lead';
  return null;
}
