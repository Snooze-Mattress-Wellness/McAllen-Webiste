/* Sealy brand page – vendor script (js/scripts.js). Only change: selectors scoped to .sealy-wrapper. */
"use strict";

const features = new Swiper( '.sealy-wrapper .features .swiper', {
	breakpoints: {
		1024: {
			slidesPerView: 3
		}
	},
	pagination: {
		el: '.swiper-pagination'
	},
	slidesPerView: 1,
	spaceBetween: 20
} );

const testimonials = new Swiper( '.sealy-wrapper .testimonials .swiper', {
	breakpoints: {
		1024: {
			slidesPerView: 2
		},
		1440: {
			slidesPerView: 3
		}
	},
	navigation: {
		nextEl: '.sealy-wrapper .testimonials__inner .swiper-button-next',
		prevEl: '.sealy-wrapper .testimonials__inner .swiper-button-prev',
	},
	pagination: {
		el: '.swiper-pagination'
	},
	slidesPerView: 1,
	spaceBetween: 20,
  	initialSlide: 1
} );

addEventListener( "resize", ( event ) => {
	features.update();
	testimonials.update();
} );



