/* Tempur-Pedic's client-side pieces for components/brand-pages/BrandPage.tsx. brand.json lists the package's browser
   scripts (Swiper, js/scripts.js, snooze-promo.js); this site loads none of them: the two sliders are js/scripts.js
   ported (Carousels, with the vendored Swiper bundle) and the offers are rendered on the server. */
import type { BrandParts } from '../types';
import Carousels from './Carousels';
import { montserrat } from './font';

export const TEMPUR_PEDIC_PARTS: BrandParts = {
  fontClass: montserrat.variable,
  Scripts: ({ brand, js }) => <Carousels src={`${js}swiper-bundle.min.js`} wrapperClass={brand.site.wrapper_class} />,
};
