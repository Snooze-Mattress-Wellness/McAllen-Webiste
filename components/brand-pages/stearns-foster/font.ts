/* Stearns & Foster's font, Public Sans (brand.json font_url: the variable font, 100–900), self-hosted with next/font
   like the site's Poppins: font-display swap, with a size-matched local fallback ("Public Sans Fallback"). Normal style
   only: nothing on the page is set in italics. Not preloaded: a font preload in <head> holds rendering on this site
   (the Lighthouse slow-mode stall). The local sections keep the site's Poppins. */
import { Public_Sans } from 'next/font/google';

export const publicSans = Public_Sans({ subsets: ['latin'], display: 'swap', preload: false, variable: '--font-sf' });
