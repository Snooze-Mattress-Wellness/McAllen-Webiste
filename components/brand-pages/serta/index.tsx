/* Serta's client-side pieces for components/brand-pages/BrandPage.tsx. brand.json lists two browser scripts:
   js/scripts.js (the hero video loader) and the shared snooze-promo.js. The offers are rendered on the server, so
   snooze-promo.js is not loaded. The video loader is loaded only once the video file is in the repo (video.ts). */
import type { BrandParts } from '../types';
import HeroVideo from '../HeroVideo';
import { mulish } from './font';
import styles from './fonts.module.css';
import { SERTA_VIDEO } from './video';

export const SERTA_PARTS: BrandParts = {
  fontClass: `${mulish.variable} ${styles.fonts}`,
  ...(SERTA_VIDEO ? { Scripts: ({ js }) => <HeroVideo src={`${js}scripts.js`} /> } : {}),
};
