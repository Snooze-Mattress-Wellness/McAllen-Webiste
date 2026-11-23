/* Beautyrest's two fonts, as its brand.json font_url loads them (Inter 400/500/600/700; Source Serif 4 400/600 with
   the optical-size axis), self-hosted with next/font like the site's Poppins: font-display swap, each with a
   size-matched local fallback so the swap does not move the text. Not preloaded: a font preload in <head> holds
   rendering on this site (the Lighthouse slow-mode stall). The local sections keep the site's Poppins. */
import { Inter, Source_Serif_4 } from 'next/font/google';

/** headings (--br-serif in beautyrest.css): one variable file; the CSS uses 400 and 600 */
export const sourceSerif = Source_Serif_4({ subsets: ['latin'], axes: ['opsz'], display: 'swap', preload: false, variable: '--font-br-serif' });
/** body (--br-sans): the weights font_url lists; a lighter weight in the CSS (300) renders at 400, as on the package page */
export const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], display: 'swap', preload: false, variable: '--font-br-sans' });
