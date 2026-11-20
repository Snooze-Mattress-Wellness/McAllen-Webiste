/* The vendor sections are set in Montserrat ("montserrat", helvetica, arial in the vendor CSS). The site loads it nowhere
   else, so the brand page adds it the way the layouts add Poppins: next/font/google, self-hosted, font-display: swap.
   next/font names the face "Montserrat", which the vendor's lowercase "montserrat" matches (font-family names are
   case-insensitive). One variable file covers every weight the CSS uses (300–700). Not preloaded: a font preload in
   <head> holds rendering on this site (the Lighthouse slow-mode stall). */
import { Montserrat } from 'next/font/google';

export const montserrat = Montserrat({ subsets: ['latin'], display: 'swap', preload: false, variable: '--font-montserrat' });
