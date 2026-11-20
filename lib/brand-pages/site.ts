/* The adapter: the ONE file of the brand-page module that reads this site's own data. It takes the store's brand-page
   values from the site's location data (lib/location.ts BRAND_PAGE_LOCATION, the dev handoff's section 4 fields) and
   adds the site's structured-data ids (lib/schema.ts). A store site that installs the module supplies its own version
   of this file; nothing else in lib/brand-pages/ or components/brand-pages/ imports site code. */
import { BRAND_PAGE_LOCATION } from '@/lib/location';
import { ORG_ID, SITE_URL, STORE_ID, WEBSITE_ID } from '@/lib/schema';
import type { BrandLocation } from './types';

if (BRAND_PAGE_LOCATION.site_url !== SITE_URL) throw new Error(`lib/location.ts BRAND_PAGE_LOCATION.site_url (${BRAND_PAGE_LOCATION.site_url}) is not lib/schema.ts SITE_URL (${SITE_URL})`);

export const BRAND_LOCATION: BrandLocation = {
  ...BRAND_PAGE_LOCATION,
  schema_ids: { organization: ORG_ID, website: WEBSITE_ID, store: STORE_ID },
  // the site's tab icon (the converted pages carry it in their head; without it the browser asks for /favicon.ico, a 404)
  site_icon: '/assets/filesafe/qR8peonBlnjGI3ZuLHQP/media/695b9e7d17768458ae206a19.png',
};
