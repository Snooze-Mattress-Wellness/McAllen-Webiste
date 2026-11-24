/* King Koil's fonts, as its brand.json font_url loads them, self-hosted with next/font like the site's Poppins:
   font-display swap, with size-matched local fallbacks so the swap does not move the text. Not preloaded: a font
   preload in <head> holds rendering on this site (the Lighthouse slow-mode stall). The local sections keep the site's
   Poppins.
   - Marcellus (headings, --kk-display): its one weight, 400.
   - Mulish (body, --kk-sans): Serta's instance (components/brand-pages/serta/font.ts, 400/600/700, the weights
     font_url lists), so the site loads Mulish once for every brand that uses it. */
import { Marcellus } from 'next/font/google';

export { mulish } from '../serta/font';

/** headings (--kk-display in king-koil.css) */
export const marcellus = Marcellus({ subsets: ['latin'], weight: '400', display: 'swap', preload: false, variable: '--font-kk-display' });
