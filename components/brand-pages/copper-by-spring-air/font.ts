/* Copper by Spring Air's fonts, as its brand.json font_url loads them, self-hosted with next/font like the site's
   Poppins: font-display swap, with size-matched local fallbacks so the swap does not move the text. Not preloaded: a
   font preload in <head> holds rendering on this site (the Lighthouse slow-mode stall). The local sections keep the
   site's Poppins.
   - Lora (headings, --cp-serif): 400/500/600, normal only, as font_url loads it (the hero tagline's italic is
     synthesised, as on the package page).
   - Mulish (body, --cp-sans): Serta's instance (components/brand-pages/serta/font.ts, 400/600/700, the weights
     font_url lists), so the site loads Mulish once for every brand that uses it. */
import { Lora } from 'next/font/google';

export { mulish } from '../serta/font';

/** headings (--cp-serif in copper.css) */
export const lora = Lora({ subsets: ['latin'], weight: ['400', '500', '600'], display: 'swap', preload: false, variable: '--font-cp-serif' });
