/** true once public/brands/serta/video/serta-hero.mp4 is added (tests/brand-pages.test.ts keeps the two in step).
    Until then the hero shows the poster frame (hero-poster.webp, hero-poster-mobile.webp on phones), the package's
    intended fallback, and the video loader is not loaded (it would request the missing file and log a 404). */
export const SERTA_VIDEO = false;
