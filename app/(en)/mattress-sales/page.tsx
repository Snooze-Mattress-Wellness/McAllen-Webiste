// app/(en)/mattress-sales/page.tsx – Sales page for one location site (Next.js App Router).
// The package's nextjs/app/mattress-sales/page.tsx (snooze-local-pages v4), adapted for this site only where its
// CLAUDE.md says to: `location` is this site's location data through the brand-pages adapter (lib/brand-pages/site.ts;
// lib/location.ts BRAND_PAGE_LOCATION), getClearanceItems() reads the same source as /clearance (lib/snooze/sales-site.ts),
// brand cards link only brand pages that are live here (withLiveBrandLinks), and the fonts are the site's own next/font
// Poppins (layouts) and Montserrat (the brand pages) instead of new instances. The page is English only: /es/mattress-sales
// 308s here (next.config.ts) and its language switch goes to /es.
// Everything comes from: the site's location settings + the shared promo feed + this store's clearance items.
// Nobody edits this page month to month.
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Script from "next/script";
import Sales from "@/lib/snooze/snooze-sales";           // copy of shared/js/snooze-sales.js (UMD, works with require/import)
import { getPromoFeed } from "@/lib/snooze/feed";
import { BRAND_LOCATION as location } from "@/lib/brand-pages/site"; // this site's store settings (timezone, local_intro, sales_path, links.clearance)
import { getClearanceItems, withLiveBrandLinks, withoutBareProducts } from "@/lib/snooze/sales-site"; // the source the /clearance page uses; the JSON-LD clean-up
import { montserrat } from "@/components/brand-pages/tempur-pedic/font"; // the site's next/font Montserrat (--font-montserrat)
import "@/styles/snooze-sales.css";                      // copy of shared/css/snooze-sales.css

/* snooze-sales.css reads --snz-head-font / --snz-body-font: point them at the site's next/font families (Poppins is set
   on <html> by the layout as --font-poppins; Montserrat's class below sets --font-montserrat). */
const fonts = { "--snz-head-font": "var(--font-poppins)", "--snz-body-font": "var(--font-montserrat)" } as CSSProperties;

export const revalidate = 3600; // same as the brand pages: hourly

async function getModel() {
  const [feed, clearanceRaw] = await Promise.all([getPromoFeed(), getClearanceItems().catch(() => [])]);
  // Map your clearance records to: { id, brand, name, size, price, retail, savings_pct, qty, label: "Floor model" | "Clearance", image, url }
  const clearance = (clearanceRaw as any[]).map((c) => c);
  return Sales.buildSalesModel(withLiveBrandLinks(feed), location, { clearance });
}

export async function generateMetadata(): Promise<Metadata> {
  const seo = Sales.salesSEO(await getModel());
  return {
    title: { absolute: seo.title },                       // stays the same all year: "Mattress Sales in McAllen, TX | Snooze Mattress"
    description: seo.description,                         // changes with the live event, <= 158 characters
    alternates: { canonical: seo.canonical },             // self-canonical on every site
    robots: { index: true, follow: true, "max-image-preview": "large" },
    openGraph: { type: "website", title: seo.og_title, description: seo.og_description, url: seo.canonical, siteName: location.site_name,
      images: [{ url: "/brands/shared/img/sales-og.jpg", width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image" },
  };
}

export default async function MattressSalesPage() {
  const m = await getModel();
  const html = Sales.renderSalesHTML(m, {
    assetBase: "/brands/",
    dreamImage: { src: "/brands/shared/img/dream-mapping.webp", alt: "A Sleep Coach in Snooze Blues reviews a guest's Dream Mapping results on screen", w: 1000, h: 666 },
  });
  // the shared JSON-LD without the bare Product nodes Google flags (Search Console "Product snippets": an Offer's
  // itemOffered Product with no offers, review or aggregateRating); a no-op when there are none
  const jsonld = JSON.stringify(withoutBareProducts(Sales.salesJsonLd(m))).replace(/</g, "\\u003c");
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonld }} />
      {/* the site's next/font families via --snz-head-font / --snz-body-font; snooze-sales.css picks them up */}
      <div className={montserrat.variable} style={fonts} dangerouslySetInnerHTML={{ __html: html }} />
      <Script src="/brands/shared/js/snooze-sales-track.js" strategy="afterInteractive" />
    </>
  );
}
