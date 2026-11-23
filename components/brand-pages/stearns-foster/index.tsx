/* Stearns & Foster's client-side pieces for components/brand-pages/BrandPage.tsx: the Public Sans font and the vendor
   scripts as delivered, in brand.json order (the shared Swiper 8.4.5, aos.min.js, main.js; not snooze-promo.js). */
import type { BrandParts } from '../types';
import BrandScripts from '../BrandScripts';
import { brandScripts } from '@/lib/brand-pages/page';
import { publicSans } from './font';
import styles from './fonts.module.css';

export const STEARNS_FOSTER_PARTS: BrandParts = {
  fontClass: `${publicSans.variable} ${styles.fonts}`,
  Scripts: ({ brand }) => <BrandScripts scripts={brandScripts(brand)} />,
};
