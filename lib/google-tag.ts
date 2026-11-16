/* The Google tag (gtag.js) the site configures itself — components/Tracking.tsx renders it in <head> on every page —
   and the helpers that feed it. The GTM container (GTM-TVPN94M) is a separate thing managed in Tag Manager: nothing
   here changes it, and the dataLayer events in public/snz-events.js that it depends on keep their names.
     GA4_PRIMARY_ID / GA4_SECONDARY_ID   the two GA4 properties, both intentional (never merge or dedupe them)
     ADS_ID                              the Google Ads account, configured right after the first GA4 config
     BOOKING_CONVERSION                  "Dream Mapping booked": sent once per load of the booking confirmation page
                                         (/dream/map/thank/you, /es/…), after the configs (components/Tracking.tsx) */
export const GA4_PRIMARY_ID = 'G-9R1JGVBRBR';
export const GA4_SECONDARY_ID = 'G-TS1RXQVPYT';
export const ADS_ID = 'AW-17532275127';

/** gtag('event', 'conversion', BOOKING_CONVERSION): the Google Ads conversion for a booked Dream Mapping appointment. */
export const BOOKING_CONVERSION = { send_to: `${ADS_ID}/LVkqCI324J8cELeThahB`, value: 100.0, currency: 'USD' } as const;

/** The booking confirmation pages: the Dream Mapping calendar's post-booking redirect lands on the English one. */
export function isBookingConfirmation(pathname: string): boolean {
  const path = pathname.replace(/\/+$/, '') || '/';
  return /^(\/es)?\/dream\/map\/thank\/you$/.test(path);
}
