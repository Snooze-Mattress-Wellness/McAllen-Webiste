import { Faq } from '@/components/blog/Faq';
import { Rich, plain } from '@/components/blog/Rich';
import { CheckItem, Icon, iconFor } from '@/components/icons';
import { PageSchema } from '@/components/PageSchema';
import { SizeTypeGrid } from '@/components/SizeTypeGrid';
import { LOCATION } from '@/lib/location';
import { pageNode, SITE_URL } from '@/lib/schema';
import { localizeHref, ui, type Locale } from '@/lib/i18n';
import type { ContentPage as ContentPageData, ListStyle, PageCopy } from '@/lib/pages/types';
import styles from './ContentPage.module.css';

/* Copy strings may carry inline [text](href) links (components/blog/Rich.tsx; SEO report, October 27, 2026 — internal
   links). The first "Dream Mapping" mention in the page body links to /dream-mapping (localized), unless the page is
   /dream-mapping itself or the mention already sits inside a link; everything else in the copy is rendered as written. */
function withDreamMappingLink(c: PageCopy, slug: string, locale: Locale): PageCopy {
  if (slug === '/dream-mapping') return c;
  return withFirstMentionLink(c, 'Dream Mapping', localizeHref('/dream-mapping', locale));
}

/* Brand pages (lib/brand-pages/, English only): on these English pages the first mention of each brand in the body copy
   links to its brand page, same tab, one link per brand per page (the intro and sections; not headings, not the FAQ).
   /memory-foam-mattresses names no Beautyrest, Serta, Sealy, Stearns & Foster, Copper or King Koil model (its one
   "Spring Air" is inside a card that already links /cooling-mattresses), /cooling-mattresses no Serta model. Copper's
   first mention is "Copper by Spring Air" on the city pages and "Copper Collection by Spring Air" on /cooling-mattresses;
   King Koil's is "King Koil" (on the city pages, inside "FLOWT by King Koil"). Snooze-o-Pedic is spelled
   "Snooze-O-Pedic" in this copy (the phrase as written; no copy change): its first mention is in the intro of
   /memory-foam-mattresses and in the brand list of the city pages; /cooling-mattresses never names it. */
const TEMPUR_PEDIC = { phrase: 'Tempur-Pedic', href: '/tempur-pedic' };
const BEAUTYREST = { phrase: 'Beautyrest', href: '/beautyrest' };
const SERTA = { phrase: 'Serta', href: '/serta' };
const SEALY = { phrase: 'Sealy', href: '/sealy' };
const STEARNS_FOSTER = { phrase: 'Stearns & Foster', href: '/stearns-foster' };
const COPPER = { phrase: 'Copper by Spring Air', href: '/copper-by-spring-air' };
const KING_KOIL = { phrase: 'King Koil', href: '/king-koil' };
const SNOOZE_O_PEDIC = { phrase: 'Snooze-O-Pedic', href: '/snooze-o-pedic' };
const BRAND_PAGE_MENTIONS: Record<string, readonly { phrase: string; href: string }[]> = {
  '/cooling-mattresses': [TEMPUR_PEDIC, BEAUTYREST, SEALY, STEARNS_FOSTER, { ...COPPER, phrase: 'Copper Collection by Spring Air' }, KING_KOIL],
  '/memory-foam-mattresses': [TEMPUR_PEDIC, SNOOZE_O_PEDIC],
  '/mattress-store-edinburg': [TEMPUR_PEDIC, BEAUTYREST, SERTA, SEALY, STEARNS_FOSTER, KING_KOIL, COPPER, SNOOZE_O_PEDIC],
  '/mattress-store-mission': [TEMPUR_PEDIC, BEAUTYREST, SERTA, SEALY, STEARNS_FOSTER, KING_KOIL, COPPER, SNOOZE_O_PEDIC],
  '/mattress-store-pharr': [TEMPUR_PEDIC, BEAUTYREST, SERTA, SEALY, STEARNS_FOSTER, KING_KOIL, COPPER, SNOOZE_O_PEDIC],
};
function withBrandPageLink(c: PageCopy, slug: string, locale: Locale): PageCopy {
  const mentions = locale === 'en' ? BRAND_PAGE_MENTIONS[slug] || [] : [];
  return mentions.reduce((copy, m) => withFirstMentionLink(copy, m.phrase, m.href), c);
}

/** The first mention of `phrase` in the body copy (intro, then each section's paragraphs, bullets and subsections, in
    page order) becomes [phrase](href), unless it already sits inside a link (then the next mention is taken). */
function withFirstMentionLink(c: PageCopy, phrase: string, href: string): PageCopy {
  let done = false;
  const link = (t: string) => {
    if (done || !t.includes(phrase)) return t;
    return t.split(/(\[[^\]]+\]\([^)]+\))/).map((seg) => {
      if (done || /^\[[^\]]+\]\([^)]+\)$/.test(seg) || !seg.includes(phrase)) return seg;
      done = true;
      return seg.replace(phrase, `[${phrase}](${href})`);
    }).join('');
  };
  const intro = c.intro.map(link);
  const sections = c.sections.map((s) => ({
    ...s,
    paragraphs: s.paragraphs?.map(link),
    bullets: s.bullets?.map(link),
    h3s: s.h3s?.map((h) => ({ ...h, paragraphs: h.paragraphs?.map(link), bullets: h.bullets?.map(link) })),
  }));
  return { ...c, intro, sections };
}

/* Renders a hand-written content page (lib/pages/*) in one locale: breadcrumb, H1, copy, optional table, FAQ
   accordion (the blog's), CTA to /booking, plus FAQPage + BreadcrumbList JSON-LD, the page's own CollectionPage /
   WebPage node when its data sets one (schemaPage) and any extra schema the page defines, in the page's one graph
   (components/PageSchema.tsx). Server-rendered; the FAQ accordion is the same client component the blog uses. */

/* A bullet list in the style its data asks for (lib/pages/types.ts listStyle; October 27, 2026): icon cards for
   benefits and features (an item written "Label: text" gets the label as its title), a numbered timeline for steps,
   the check list in a navy card for key facts; otherwise the plain check list. The copy is the list's own. */
function ListBlock({ items, style }: { items: string[]; style?: ListStyle }) {
  if (style === 'facts') {
    return (
      <div className="snz-facts">
        <ul className={`${styles.list} snz-check-list`}>{items.map((b, j) => <CheckItem key={j}><Rich text={b} /></CheckItem>)}</ul>
      </div>
    );
  }
  if (style === 'steps') {
    return (
      <ol className="snz-steps">
        {items.map((b, j) => (
          <li key={j}>
            <span className="snz-badge snz-badge--num" aria-hidden="true">{String(j + 1).padStart(2, '0')}</span>
            <p className="snz-steps__text"><Rich text={b} /></p>
          </li>
        ))}
      </ol>
    );
  }
  if (style === 'cards') {
    const parts = items.map((b) => b.match(/^([^:]{2,40}):\s+(.+)$/));
    const titled = parts.every(Boolean);
    const twoUp = items.length % 3 !== 0 && items.length % 2 === 0;
    return (
      <ul className={`snz-cards${twoUp ? ' snz-cards--2' : ''}`}>
        {items.map((b, j) => (
          <li key={j}>
            <div className="snz-card">
              <span className="snz-badge snz-badge--soft"><Icon name={iconFor(b)} /></span>
              {titled ? (
                <>
                  <span className="snz-card__title"><Rich text={parts[j]![1]} /></span>
                  <span className="snz-card__text"><Rich text={parts[j]![2]} /></span>
                </>
              ) : (
                <span className="snz-card__text"><Rich text={b} /></span>
              )}
            </div>
          </li>
        ))}
      </ul>
    );
  }
  return <ul className={`${styles.list} snz-check-list`}>{items.map((b, j) => <CheckItem key={j}><Rich text={b} /></CheckItem>)}</ul>;
}

export function ContentPage({ page, locale }: { page: ContentPageData; locale: Locale }) {
  const c = withBrandPageLink(withDreamMappingLink(page.copy[locale] || page.copy.en, page.slug, locale), page.slug, locale);
  const t = ui(locale);
  const home = locale === 'es' ? `${SITE_URL}/es` : SITE_URL;
  const url = `${SITE_URL}${localizeHref(page.slug, locale)}`;
  const schema: Record<string, unknown>[] = [
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: t.blog.home, item: home },
      { '@type': 'ListItem', position: 2, name: c.crumb, item: url },
    ] },
    ...(c.faqs.length ? [{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: c.faqs.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: plain(f.answer) } })) }] : []),
    ...(page.extraSchema ? page.extraSchema(locale) : []),
    ...(page.schemaPage ? [pageNode(page.schemaPage.type, url, c.title.replace(/\s*\|\s*Snooze Mattress\s*$/, ''), locale, {
      description: c.description,
      ...(page.schemaPage.type === 'WebPage' ? { spatialCoverage: { '@type': 'City', name: page.schemaPage.city, containedInPlace: { '@type': 'State', name: 'Texas' } } } : {}),
    })] : []),
  ];
  const L = LOCATION;
  /* the size/type cards on the size/type pages and the buying guide, without the page's own card */
  const sizeGrid = page.kind === 'product' || page.slug === '/how-to-choose-a-mattress';
  return (
    <main className={styles.page} data-content-page={page.slug}>
      <PageSchema items={schema} locale={locale} />
      <div className={styles.container}>
        <nav className={styles.crumbs} aria-label={locale === 'es' ? 'Ruta de navegación' : 'Breadcrumb'}>
          <a href={localizeHref('/', locale)}>{t.blog.home}</a>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{c.crumb}</span>
        </nav>
        <header className={styles.hero}>
          {c.eyebrow ? <p className={styles.eyebrow}>{c.eyebrow}</p> : null}
          <h1 className={styles.title}>{c.h1}</h1>
          {c.intro.map((p, i) => <p key={i} className={styles.lede}><Rich text={p} /></p>)}
        </header>
        <article className={styles.article}>
          {c.sections.map((s, i) => (
            <section key={i} className={styles.section}>
              <h2 className={styles.h2}>{s.h2}</h2>
              {(s.paragraphs || []).map((p, j) => <p key={j} className={styles.p}><Rich text={p} /></p>)}
              {s.bullets ? <ListBlock items={s.bullets} style={s.listStyle} /> : null}
              {(s.h3s || []).map((sub, j) => (
                <div key={j} className={styles.sub}>
                  <h3 className={styles.h3}>{sub.h3}</h3>
                  {(sub.paragraphs || []).map((p, k) => <p key={k} className={styles.p}><Rich text={p} /></p>)}
                  {sub.bullets ? <ListBlock items={sub.bullets} style={sub.listStyle} /> : null}
                </div>
              ))}
            </section>
          ))}
          {c.table ? (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <caption className={styles.caption}>{c.table.caption}</caption>
                <thead><tr>{c.table.head.map((h, i) => <th key={i} scope="col">{h}</th>)}</tr></thead>
                <tbody>{c.table.rows.map((r, i) => <tr key={i}>{r.map((cell, j) => (j === 0 ? <th key={j} scope="row">{cell}</th> : <td key={j}>{cell}</td>))}</tr>)}</tbody>
              </table>
            </div>
          ) : null}
          {c.faqGroups ? c.faqGroups.map((g, i) => (
            <section key={i} className={styles.faq} aria-labelledby={`content-faq-${i}`}>
              <h2 id={`content-faq-${i}`} className={styles.h2}>{g.h2}</h2>
              <Faq items={g.faqs} />
            </section>
          )) : c.faqs.length ? (
            <section className={styles.faq} aria-labelledby="content-faq-title">
              <h2 id="content-faq-title" className={styles.h2}>{c.faqTitle}</h2>
              <Faq items={c.faqs} />
            </section>
          ) : null}
          {sizeGrid ? <SizeTypeGrid locale={locale} current={page.slug} inline /> : null}
        </article>
        <section className={styles.cta} aria-labelledby="content-cta-title">
          <h2 id="content-cta-title" className={styles.ctaTitle}>{c.cta.title}</h2>
          <p className={styles.ctaText}>{c.cta.text}</p>
          <div className={styles.ctaBtns}>
            <a className={styles.btn} href={localizeHref('/booking', locale)}>{c.cta.button}</a>
            <a className={`${styles.btn} ${styles.btnGhost}`} href={L.phoneHref}>{t.menu.call(L.phone)}</a>
          </div>
          <p className={styles.ctaAddr}>{L.street}, {L.city}, {L.region} {L.postalCode} · {(L.hours[locale] || L.hours.en).join(', ')}</p>
        </section>
      </div>
    </main>
  );
}
