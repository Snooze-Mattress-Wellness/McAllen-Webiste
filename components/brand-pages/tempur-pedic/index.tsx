/* Tempur-Pedic's pieces for components/brand-pages/BrandPage.tsx. */
import type { BrandSections } from '../types';
import { Disclaimers, Hero, Vendor } from './sections';
import Carousels from './Carousels';
import { montserrat } from './font';

export const TEMPUR_PEDIC_SECTIONS: BrandSections = {
  Hero,
  Vendor,
  Disclaimers,
  // the two sliders (the package's js/scripts.js, ported)
  Scripts: ({ brand, js }) => <Carousels src={`${js}swiper-bundle.min.js`} wrapperClass={brand.wrapper_class} />,
  fontClass: montserrat.variable,
};
