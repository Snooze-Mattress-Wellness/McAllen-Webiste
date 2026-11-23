// The Sales page's segment layout: only the site's tab icon. The page's own metadata (the package's generateMetadata,
// kept as delivered) sets none, and without one the browser asks for /favicon.ico, a 404. Renders the page unchanged.
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { BRAND_LOCATION } from '@/lib/brand-pages/site';

export const metadata: Metadata = { icons: { icon: BRAND_LOCATION.site_icon } };

export default function SalesLayout({ children }: { children: ReactNode }) {
  return children;
}
