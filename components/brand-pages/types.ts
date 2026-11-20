import type { ComponentType } from 'react';
import type { BrandConfig, BrandLocation } from '@/lib/brand-pages/types';

/** What every section component gets: the brand, the store, and the brand's image folder (with the trailing slash). */
export type SectionProps = { brand: BrandConfig; location: BrandLocation; img: string };

/** A brand's own pieces: its vendor sections, its client scripts (sliders), and its font's class (sets the CSS variable). */
export type BrandSections = {
  Hero: ComponentType<SectionProps>;
  Vendor: ComponentType<SectionProps>;
  Disclaimers: ComponentType<SectionProps>;
  Scripts: ComponentType<SectionProps & { js: string }>;
  fontClass: string;
};
