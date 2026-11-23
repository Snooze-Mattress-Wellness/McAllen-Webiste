/* The package files the brand pages render from, read as delivered: brands/<slug>/brand.json + template.html and the
   shared partials (lib/brand-pages/partials/). Read from disk on the server (and by Node's test runner); next.config.ts
   outputFileTracingIncludes ships them with the page functions so an ISR regeneration on Vercel can read them too. */
import fs from 'node:fs';
import path from 'node:path';

const DIR = path.join(process.cwd(), 'lib', 'brand-pages');
const read = (...p: string[]) => fs.readFileSync(path.join(DIR, ...p), 'utf8');

export const brandJson = <T>(slug: string): T => JSON.parse(read('brands', slug, 'brand.json')) as T;
export const brandTemplate = (slug: string) => read('brands', slug, 'template.html');

/** The four shared partials the brand templates use ({{VISIT}}, {{PROMO}}, {{WHY}}, {{FAQ}}). */
export const PARTIALS = {
  visit: read('partials', 'visit.html'),
  promo: read('partials', 'promo.html'),
  why: read('partials', 'why.html'),
  faq: read('partials', 'faq.html'),
} as const;
export type Partials = typeof PARTIALS;
