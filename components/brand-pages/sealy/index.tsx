/* Sealy's client-side pieces for components/brand-pages/BrandPage.tsx: the Inter font (the instance Beautyrest loads,
   not a second copy) and the vendor scripts as delivered, in brand.json order (the shared Swiper 8.4.5, js/scripts.js;
   not snooze-promo.js). */
import type { BrandParts } from '../types';
import BrandScripts from '../BrandScripts';
import { brandScripts } from '@/lib/brand-pages/page';
import { inter } from '../beautyrest/font';
import styles from './fonts.module.css';

export const SEALY_PARTS: BrandParts = {
  fontClass: `${inter.variable} ${styles.fonts}`,
  Scripts: ({ brand }) => <BrandScripts scripts={brandScripts(brand)} />,
};
