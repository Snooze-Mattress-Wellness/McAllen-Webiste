/** true once public/brands/beautyrest/video/beautyrest.mp4 is added (tests/brand-pages.test.ts keeps the two in step).
    Until then the hero shows hero.webp, the package's intended fallback, and the video loader is not loaded (it would
    request the missing file and log a 404). */
export const BEAUTYREST_VIDEO = false;
