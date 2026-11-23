/* FAQ entries -> what the page renders. One list feeds both the visible accordion and the FAQPage JSON-LD, so the two
   cannot drift: the accordion renders answerSegments() (the links), the JSON-LD takes plainAnswer() (the same text). */
import type { AlwaysOnOffer, FaqEntry, Segment } from './types.ts';

/** "{brand}" in a feed FAQ (the Offer Calendar writes "Do you offer financing on {brand} mattresses?") → the brand name. */
export const fillBrand = (text: string, brandName: string) => text.split('{brand}').join(brandName);

/** The page's FAQ: the store's local questions, then the offers' own questions (always_on[].faq), in offer order, with
    "{brand}" replaced by the brand name. The visible accordion and the FAQPage JSON-LD both render this list. */
export function pageFaq(local: readonly FaqEntry[], offers: readonly AlwaysOnOffer[], brandName: string): FaqEntry[] {
  return [
    ...local,
    ...offers.flatMap((o) => (o.faq ? [{ question: fillBrand(o.faq.q, brandName), answer: fillBrand(o.faq.a, brandName) }] : [])),
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

/** "Edinburg, Mission and Pharr" */
export const listAnd = (items: readonly string[]) => (items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`);

/** The nearby towns as linked text: Edinburg, Mission and Pharr (the store card's "Serving" row). */
export function townSegments(nearby: readonly { name: string; path: string }[]): Segment[] {
  return nearby.flatMap((t, i) => [...(i === 0 ? [] : [i === nearby.length - 1 ? ' and ' : ', ']), { text: t.name, href: t.path }]);
}
