'use client';
/* The two sliders of the Tempur-Pedic brand page (app/(en)/tempur-pedic/page.tsx): "Solutions for Your Sleep Problems"
   and the reviews. The package's js/scripts.js, ported: same Swiper 8.4.5 build (the vendored
   public/brands/tempur-pedic/js/swiper-bundle.min.js; no npm dependency), same options, same resize update. Only the
   wiring differs: the bundle loads through next/script, whose onReady fires once it has loaded and again on every later
   mount, so the sliders are created on mount and destroyed on unmount. Leaving the page and coming back (client-side
   navigation, back/forward) builds them afresh on the new markup. The pagination and arrow elements are passed as
   elements, scoped to their own slider, instead of the vendor's page-wide selectors. */
import { useEffect, useState } from 'react';
import Script from 'next/script';

type SwiperInstance = { update: () => void; destroy: (deleteInstance?: boolean, cleanStyles?: boolean) => void };
type SwiperConstructor = new (el: Element, options: Record<string, unknown>) => SwiperInstance;
declare global {
  interface Window { Swiper?: SwiperConstructor }
}

export const SWIPER_SRC = '/brands/tempur-pedic/js/swiper-bundle.min.js';

export default function TempurCarousels() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const Swiper = window.Swiper;
    const root = document.querySelector('.tempur-wrapper');
    if (!ready || !Swiper || !root) return;
    const sliders: SwiperInstance[] = [];

    const rtbs = root.querySelector('.rtbs .swiper');
    if (rtbs) sliders.push(new Swiper(rtbs, {
      breakpoints: { 1024: { slidesPerView: 4 } },
      pagination: { el: rtbs.querySelector('.swiper-pagination') },
      slidesPerView: 1.05,
      spaceBetween: 20,
    }));

    const reviews = root.querySelector('.testimonials .swiper');
    const arrows = reviews?.closest('.testimonials__inner');
    if (reviews) sliders.push(new Swiper(reviews, {
      breakpoints: { 1024: { slidesPerView: 3 } },
      navigation: { nextEl: arrows?.querySelector('.swiper-button-next'), prevEl: arrows?.querySelector('.swiper-button-prev') },
      pagination: { el: reviews.querySelector('.swiper-pagination') },
      slidesPerView: 1.05,
      spaceBetween: 20,
      initialSlide: 1,
    }));

    const onResize = () => sliders.forEach((s) => s.update());
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      sliders.forEach((s) => s.destroy(true, true));
    };
  }, [ready]);

  return <Script src={SWIPER_SRC} strategy="afterInteractive" onReady={() => setReady(true)} />;
}
