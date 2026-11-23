/* The brand page's head tags, as the package's page shell (shared/partials/page-shell.html) writes them: title,
   description, self-referencing canonical, indexable robots, Open Graph with the brand's 1200×630 og-image.jpg, Twitter
   card. Absolute URLs from the store's site_url, never the deployment URL. English only: no hreflang alternates. */
import type { Metadata } from 'next';
import type { BrandConfig, BrandLocation } from './types.ts';
import { brandPage } from './page.ts';
import { brandText } from './render.ts';

export function brandPageMetadata(brand: BrandConfig, loc: BrandLocation): Metadata {
  const { url, img } = brandPage(brand, loc);
  const title = brandText(brand.json.title, loc);
  return {
    title,
    description: brandText(brand.json.description, loc),
    alternates: { canonical: url },
    robots: { index: true, follow: true, 'max-image-preview': 'large' },
    openGraph: {
      type: 'website',
      siteName: loc.site_name,
      title,
      description: brandText(brand.json.og_description, loc),
      url,
      images: [{ url: `${loc.site_url}${img}og-image.jpg`, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image' },
    ...(loc.site_icon ? { icons: { icon: loc.site_icon } } : {}),
  };
}
