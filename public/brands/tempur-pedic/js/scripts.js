"use strict";

const rtbs = new Swiper( '.rtbs .swiper', {
	breakpoints: {
		1024: {
			slidesPerView: 4
		}
	},
	pagination: {
		el: '.swiper-pagination'
	},
	slidesPerView: 1.05,
	spaceBetween: 20
} );

const testimonials = new Swiper( '.testimonials .swiper', {
	breakpoints: {
		1024: {
			slidesPerView: 3
		}
	},
	navigation: {
		nextEl: '.testimonials__inner .swiper-button-next',
		prevEl: '.testimonials__inner .swiper-button-prev',
	},
	pagination: {
		el: '.swiper-pagination'
	},
	slidesPerView: 1.05,
	spaceBetween: 20,
  initialSlide: 1
} );

addEventListener( "resize", ( event ) => {
	rtbs.update();
	testimonials.update();
} );



