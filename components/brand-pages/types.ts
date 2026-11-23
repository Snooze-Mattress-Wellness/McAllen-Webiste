import type { ComponentType } from 'react';
import type { BrandConfig } from '@/lib/brand-pages/types';

/** A brand's client-side pieces: its font's class (sets the CSS variable its vendor CSS uses) and, when the brand has
    browser scripts (sliders, video), their port as a client component. */
export type BrandParts = {
  fontClass: string;
  Scripts?: ComponentType<{ brand: BrandConfig; js: string }>;
};
