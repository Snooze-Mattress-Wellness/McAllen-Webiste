/* Snooze-o-Pedic's client-side pieces for components/brand-pages/BrandPage.tsx: the font variable only (the site's
   Poppins). brand.json lists one browser script, the shared snooze-promo.js; the offers are rendered on the server, so
   it is not loaded (the package has no js/ folder for this brand). */
import type { BrandParts } from '../types';
import styles from './fonts.module.css';

export const SNOOZE_O_PEDIC_PARTS: BrandParts = {
  fontClass: styles.fonts,
};
