/* Serta's font, Mulish, as its brand.json font_url loads it (400/600/700), self-hosted with next/font like the site's
   Poppins: font-display swap, with a size-matched local fallback so the swap does not move the text. Not preloaded: a
   font preload in <head> holds rendering on this site (the Lighthouse slow-mode stall). The local sections keep the
   site's Poppins. */
import { Mulish } from 'next/font/google';

/** headings and body (--br-serif and --br-sans in serta.css); a weight the CSS asks for but font_url does not load
    (300, 500) renders at 400, as on the package page */
export const mulish = Mulish({ subsets: ['latin'], weight: ['400', '600', '700'], display: 'swap', preload: false, variable: '--font-serta' });
