/* Each brand's client-side pieces (font, ported browser scripts). A new brand adds its folder here. */
import type { BrandKey } from '@/lib/brand-pages/types';
import type { BrandParts } from './types';
import { TEMPUR_PEDIC_PARTS } from './tempur-pedic';
import { BEAUTYREST_PARTS } from './beautyrest';
import { SERTA_PARTS } from './serta';

export const BRAND_PARTS: Readonly<Record<BrandKey, BrandParts>> = {
  'tempur-pedic': TEMPUR_PEDIC_PARTS,
  beautyrest: BEAUTYREST_PARTS,
  serta: SERTA_PARTS,
};
