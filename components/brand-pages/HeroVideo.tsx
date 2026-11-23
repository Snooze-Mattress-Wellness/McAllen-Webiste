'use client';
/* A brand's hero video loader (Beautyrest, Serta: brand.json's js/scripts.js, unchanged, from public/brands/<slug>/js/)
   runs once per page view. A <script> element is added on every mount, so the script runs again on the new markup
   after a client-side navigation (next/script would load it only once per document). */
import { useEffect } from 'react';

export default function HeroVideo({ src }: { src: string }) {
  useEffect(() => {
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    document.body.appendChild(s);
    return () => s.remove();
  }, [src]);
  return null;
}
