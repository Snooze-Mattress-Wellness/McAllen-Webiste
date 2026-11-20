/* The brand page's structured data: WebPage, BreadcrumbList and FAQPage (the package's @graph). The page renders them
   in the site's one JSON-LD graph next to the site-wide nodes. The FAQPage is built from the same list as the visible
   accordion, so the two cannot drift. No Review / AggregateRating: the testimonials are the vendor's, not the store's. */
import type { BrandConfig, BrandLocation, FaqEntry } from './types.ts';
import { answerSegments, plainText } from './faq.ts';
import { brandPage } from './page.ts';

export type JsonLd = Record<string, unknown>;

export function brandPageJsonLd(brand: BrandConfig, loc: BrandLocation, faq: readonly FaqEntry[]): JsonLd[] {
  const { url } = brandPage(brand, loc);
  return [
    {
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: brand.seo.title(loc),
      description: brand.seo.description(loc),
      inLanguage: 'en-US',
      isPartOf: { '@id': loc.schema_ids.website },
      // the brand, and the store that carries it (the site's own LocalBusiness node, #store)
      about: [{ '@type': 'Brand', name: brand.name }, { '@id': loc.schema_ids.store }],
      publisher: { '@id': loc.schema_ids.organization },
      breadcrumb: { '@id': `${url}#breadcrumb` },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${loc.site_url}${loc.links.home}` },
        { '@type': 'ListItem', position: 2, name: 'Mattresses', item: `${loc.site_url}${loc.links.mattresses}` },
        { '@type': 'ListItem', position: 3, name: brand.name, item: url },
      ],
    },
    {
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: plainText(answerSegments(f)) } })),
    },
  ];
}
