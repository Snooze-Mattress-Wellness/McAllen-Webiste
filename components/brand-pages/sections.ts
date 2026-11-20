/* Each brand's own sections (hero, vendor content, disclaimers, sliders, font). A new brand adds its folder here. */
import type { BrandKey } from '@/lib/brand-pages/types';
import type { BrandSections } from './types';
import { TEMPUR_PEDIC_SECTIONS } from './tempur-pedic';

export const BRAND_SECTIONS: Readonly<Record<BrandKey, BrandSections>> = {
  'tempur-pedic': TEMPUR_PEDIC_SECTIONS,
};
