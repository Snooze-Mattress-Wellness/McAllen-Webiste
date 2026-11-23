'use client';
/* A brand's vendor scripts as delivered (brand.json "scripts", unchanged files; lib/brand-pages/page.ts brandScripts),
   loaded in order after the page is interactive, each one after the previous one has run:
   - libraries (the shared Swiper bundle, AOS) once per document: a later mount (client-side navigation back to the
     page) reuses them;
   - the brand's page script (main.js, scripts.js) on every mount, so its sliders and animations start on the markup
     of that mount. It runs as a module script with a per-mount query: a module has its own scope, so a vendor file
     that declares top-level consts (Sealy's scripts.js) can run again in the same document without a redeclaration
     error, and the new URL makes the browser run it again (from its cache). The files use no module-only syntax and
     read the libraries from window, as classic scripts do. */
import { useEffect } from 'react';
import type { BrandScript } from '@/lib/brand-pages/page';

const libraries = new Map<string, Promise<void>>();
let runs = 0;

function inject(src: string, module: boolean): Promise<void> {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    if (module) s.type = 'module';
    else s.async = false;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`could not load ${src}`));
    document.body.appendChild(s);
  });
}

export default function BrandScripts({ scripts }: { scripts: BrandScript[] }) {
  const key = scripts.map((s) => s.src).join(' ');
  useEffect(() => {
    let cancelled = false;
    const run = ++runs;
    (async () => {
      for (const { src, once } of scripts) {
        if (cancelled) return;
        if (once) {
          if (!libraries.has(src)) libraries.set(src, inject(src, false));
          await libraries.get(src);
        } else {
          await inject(`${src}?run=${run}`, true);
        }
      }
    })().catch(() => { /* a script that fails to load leaves the static content as it is */ });
    return () => { cancelled = true; };
    // the list comes from brand.json and does not change during a mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return null;
}
