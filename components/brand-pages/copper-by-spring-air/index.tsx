/* Copper by Spring Air's client-side pieces for components/brand-pages/BrandPage.tsx: the fonts only. brand.json lists
   one browser script, the shared snooze-promo.js; the offers are rendered on the server, so it is not loaded (the
   package has no js/ folder for this brand). */
import type { BrandParts } from '../types';
import { lora, mulish } from './font';
import styles from './fonts.module.css';

export const COPPER_PARTS: BrandParts = {
  fontClass: `${lora.variable} ${mulish.variable} ${styles.fonts}`,
};
