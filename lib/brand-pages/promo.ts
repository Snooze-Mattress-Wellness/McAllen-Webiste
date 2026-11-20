/* The shared offer logic of the package (js/snooze-promo.js), ported to TypeScript with the same rules: which vendor
   promotions are live for a store on a date (store time, America/Chicago) and which always-on offers a store shows.
   Rendering is JSX (components/brand-pages/local.tsx), on the server only; nothing of this runs in the browser. */
import type { AlwaysOnOffer, PromoFeed, Promotion } from './types.ts';

const TZ = 'America/Chicago';

/** Today's date as YYYY-MM-DD in store time (America/Chicago). */
export function todayInStoreTime(date?: Date): string {
  const d = date || new Date();
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

/** A row with start and end dates (YYYY-MM-DD, both inclusive) is live on `today`. */
export function isLive(row: { start?: string; end?: string }, today: string): boolean {
  return !!row.start && !!row.end && row.start <= today && today <= row.end;
}

/** stores: [] = every store that carries the vendor; otherwise a list of store_ids. A store missing from the feed's
    stores list gets no vendor offers (the safety default: no offers for a brand a store does not carry). */
export function storeMayShow(row: { stores?: string[] }, vendor: string | undefined, storeId: string, feed: PromoFeed): boolean {
  if (row.stores && row.stores.length) return row.stores.indexOf(storeId) !== -1;
  if (!vendor) return true;
  const store = feed.stores && feed.stores[storeId];
  if (!store || !store.brands) return false;
  return store.brands.indexOf(vendor) !== -1;
}

/** Live promotion blocks for one vendor at one store, each with only its live items (feed order); the newest block
    (latest start) first. opts.today overrides the date (YYYY-MM-DD). */
export function selectPromotions(feed: PromoFeed, opts: { vendor: string; storeId: string; today?: string }): Promotion[] {
  const today = opts.today || todayInStoreTime();
  return (feed.promotions || [])
    .filter((b) => b.vendor === opts.vendor && isLive(b, today) && storeMayShow(b, opts.vendor, opts.storeId, feed))
    .map((b) => ({ ...b, items: (b.items || []).filter((i) => isLive(i, today)) }))
    .sort((a, b) => (a.start < b.start ? 1 : -1));
}

/** Always-on offers for one store (stores: [] = all stores), in feed order. */
export function selectAlwaysOn(feed: PromoFeed, opts: { storeId: string }): AlwaysOnOffer[] {
  return (feed.always_on || []).filter((o) => !(o.stores && o.stores.length) || o.stores.indexOf(opts.storeId) !== -1);
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
/** "2026-12-01" -> "December 1" */
export function longDate(iso: string): string {
  const p = iso.split('-');
  return `${MONTHS[+p[1] - 1]} ${+p[2]}`;
}

/** The promo block's label: "Black Friday Sale · Through December 1" */
export const promoLabel = (b: Promotion) => `${b.event} · Through ${longDate(b.end)}`;
