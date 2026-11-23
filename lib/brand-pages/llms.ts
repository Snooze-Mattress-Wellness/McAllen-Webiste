/* /llms.txt: the site's hand-written guide for AI assistants (lib/llms.txt) with a "Brand pages" section generated from
   the brand registry, so a new brand page appears there on its own. The section goes where lib/llms.txt has the
   {{BRAND_PAGES}} line; there is no length cap. */
import type { BrandLocation } from './types.ts';
import { BRANDS, BRAND_KEYS } from './registry.ts';

export const LLMS_PLACEHOLDER = '{{BRAND_PAGES}}';

/** "## Brand pages" + one line per brand page of this store, in the file's link style; '' when the store has none. */
export function llmsBrandPagesSection(loc: BrandLocation): string {
  const lines = BRAND_KEYS.flatMap((key) => {
    const page = loc.brand_pages[key];
    return page ? [`- [${BRANDS[key].json.name} at ${loc.site_name}](${loc.site_url}${page.page_path})`] : [];
  });
  return lines.length ? ['## Brand pages', ...lines].join('\n') : '';
}

/** The finished file: line endings normalised to \n, the placeholder line replaced (or removed with its blank line). */
export function buildLlmsTxt(base: string, loc: BrandLocation): string {
  const text = base.replace(/\r\n/g, '\n');
  const at = text.split(LLMS_PLACEHOLDER).length - 1;
  if (at !== 1) throw new Error(`lib/llms.txt must contain ${LLMS_PLACEHOLDER} exactly once (found ${at})`);
  const section = llmsBrandPagesSection(loc);
  return section ? text.replace(LLMS_PLACEHOLDER, section) : text.replace(`${LLMS_PLACEHOLDER}\n\n`, '').replace(LLMS_PLACEHOLDER, '');
}
