/* Beautyrest's client-side pieces for components/brand-pages/BrandPage.tsx. brand.json lists two browser scripts:
   js/scripts.js (the hero video loader) and the shared snooze-promo.js. The offers are rendered on the server, so
   snooze-promo.js is not loaded. The video loader is loaded only once the video file is in the repo: until then the
   hero shows hero.webp (the package's intended fallback), and a loader pointing at a missing file would log a 404. */
import type { BrandParts } from '../types';
import HeroVideo from '../HeroVideo';
import { inter, sourceSerif } from './font';
import styles from './fonts.module.css';
import { BEAUTYREST_VIDEO } from './video';

export const BEAUTYREST_PARTS: BrandParts = {
  fontClass: `${sourceSerif.variable} ${inter.variable} ${styles.fonts}`,
  ...(BEAUTYREST_VIDEO ? { Scripts: ({ js }) => <HeroVideo src={`${js}scripts.js`} /> } : {}),
};
