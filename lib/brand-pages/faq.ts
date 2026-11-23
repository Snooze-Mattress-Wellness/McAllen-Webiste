/* A brand page's FAQ. One list feeds both the visible accordion (the shared partial faq.html, {{FAQ_HTML}}) and the
   FAQPage JSON-LD, so the two cannot drift: the accordion renders the answers with their links, the JSON-LD takes the
   same text without the links.
   The questions and their order are the package's (tools/build-page.mjs): where to try the brand (the store's address,
   hours and phone), which model is right (brand.json faq_right_for_me), whether Dream Mapping is free, the offers' own
   questions (always_on[].faq, "{brand}" replaced by the brand name, in feed order), and which nearby towns the store
   serves; then any questions the store adds (location config brand_pages.<key>.extra_faq). */
import type { AlwaysOnOffer, BrandJson, BrandLocation, FaqEntry, Segment } from './types.ts';

/** "{brand}" in a feed FAQ (the Offer Calendar writes "Do you offer financing on {brand} mattresses?") → the brand name. */
export const fillBrand = (text: string, brandName: string) => text.split('{brand}').join(brandName);

/** "Edinburg, Mission and Pharr" */
export const listAnd = (items: readonly string[]) => (items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`);

/** The page's FAQ for a brand at this store, given the store's always-on offers (Promo.selectAlwaysOn). */
export function brandFaq(brand: BrandJson, l: BrandLocation, offers: readonly AlwaysOnOffer[]): FaqEntry[] {
  const towns = l.nearby.map((n) => n.name);
  const extra = l.brand_pages[brand.slug as keyof BrandLocation['brand_pages']]?.extra_faq || [];
  return [
    {
      question: `Where can I try a ${brand.name} mattress in ${l.city}?`,
      answer: `At Snooze Mattress, ${l.address_line1}, ${l.address_line2}. We're open ${l.hours_sentence}. Floor models vary, so call ${l.phone_display} to check which ${brand.name} models are on display.`,
      links: [{ text: l.phone_display, href: `tel:${l.phone_e164}` }],
    },
    {
      question: `Which ${brand.name} mattress is right for me?`,
      answer: brand.faq_right_for_me,
      ...(brand.faq_right_for_me.includes('Dream Mapping,') ? { links: [{ text: 'Dream Mapping', href: l.links.dream_mapping }] } : {}),
    },
    { question: 'Is Dream Mapping free?', answer: 'Yes. Dream Mapping is always free and no purchase is needed. Every guest gets the same fitting, whatever they plan to spend.' },
    ...offers.flatMap((o) => (o.faq ? [{ question: fillBrand(o.faq.q, brand.name), answer: fillBrand(o.faq.a, brand.name) }] : [])),
    ...(towns.length
      ? [{ question: `Do you serve ${listAnd(towns)}?`, answer: `Yes. Our ${l.city} store also serves shoppers from ${listAnd(towns)}.`, links: l.nearby.map((n) => ({ text: n.name, href: n.path })) }]
      : []),
    ...extra,
  ];
}

/** The answer split into text and links. Each link takes the first occurrence of its text after the previous link;
    a link whose text is not in the answer is an error in the config (thrown, so the build fails instead of dropping it). */
export function answerSegments(entry: FaqEntry): Segment[] {
  const out: Segment[] = [];
  let rest = entry.answer;
  for (const link of entry.links || []) {
    const at = rest.indexOf(link.text);
    if (at === -1) throw new Error(`FAQ "${entry.question}": link text "${link.text}" is not in the answer`);
    if (at > 0) out.push(rest.slice(0, at));
    out.push({ text: link.text, href: link.href });
    rest = rest.slice(at + link.text.length);
  }
  if (rest) out.push(rest);
  return out;
}

/** Segments as plain text. */
export const plainText = (segments: readonly Segment[]) => segments.map((x) => (typeof x === 'string' ? x : x.text)).join('');

/** The package's HTML escape (tools/build-page.mjs esc). */
export const esc = (s: unknown) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** The accordion, in the package's markup ({{FAQ_HTML}}): the first answer starts open. */
export function faqHtml(faq: readonly FaqEntry[]): string {
  return faq.map((f, i) => {
    const answer = answerSegments(f).map((x) => (typeof x === 'string' ? esc(x) : `<a href="${esc(x.href)}">${esc(x.text)}</a>`)).join('');
    return `\t\t\t\t<details${i === 0 ? ' open' : ''}>\n\t\t\t\t\t<summary>${esc(f.question)}</summary>\n\t\t\t\t\t<p>${answer}</p>\n\t\t\t\t</details>`;
  }).join('\n');
}
