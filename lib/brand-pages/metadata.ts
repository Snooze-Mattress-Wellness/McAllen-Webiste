/* The brand page's head tags (the package's mcallen.html): title, description, self-referencing canonical, indexable
   robots, Open Graph with the 1200×630 image, Twitter card. Absolute URLs from the store's site_url, never the
   deployment URL. English only: no hreflang alternates. */
import type { Metadata } from 'next';
import type { BrandConfig, BrandLocation } from './types.ts';
import { brandPage } from './page.ts';

export function brandPageMetadata(brand: BrandConfig, loc: BrandLocation): Metadata {
  const { url, img } = brandPage(brand, loc);
  const title = brand.seo.title(loc);
  const og = brand.seo.og_image;
  return {
    title,
    description: brand.seo.description(loc),
    alternates: { canonical: url },
    robots: { index: true, follow: true, 'max-image-preview': 'large' },
    openGraph: {
      type: 'website',
      siteName: loc.site_name,
      title,
      description: brand.seo.og_description(loc),
      url,
      images: [{ url: `${loc.site_url}${img}${og.file}`, width: og.width, height: og.height }],
    },
    twitter: { card: 'summary_large_image' },
    ...(loc.site_icon ? { icons: { icon: loc.site_icon } } : {}),
  };
}
