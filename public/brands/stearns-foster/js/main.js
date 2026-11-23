/* Stearns & Foster brand page – vendor script (assets/js/main.js), prepared for Snooze Mattress.
   Changes from the vendor original:
   - Scoped to the brand wrapper: the vendor ran `new Swiper('.swiper')` on every .swiper on
     the page and initialised AOS globally.
   - Adds .snz-aos-on to the wrapper right before AOS starts, so animated content is visible
     without JavaScript (see css/aos.scoped.css). Respects prefers-reduced-motion (vendor logic).
   - Removed the console.log on every resize.
   - Uses the shared Swiper 8.4.5 bundle (vendor shipped 8.0.7; the API used here is the same). */
(function () {
  "use strict";
  var root = document.querySelector(".snz-brand--stearns-foster");
  if (!root || typeof Swiper === "undefined") return;

  var resizeTimer;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function refreshAOS() {
    if (typeof AOS !== "undefined" && root.classList.contains("snz-aos-on")) AOS.refresh();
  }

  function initAOS() {
    if (typeof AOS === "undefined" || reduceMotion) return;
    root.classList.add("snz-aos-on");
    AOS.init({ duration: 800, once: true, offset: 100 });
  }

  function realSlideCount(instance) {
    return instance.el ? instance.el.querySelectorAll(".swiper-slide:not(.swiper-slide-duplicate)").length : 0;
  }

  function checkEdgeCases(instance) {
    if (!instance.el) return;
    var total = realSlideCount(instance);
    var paginationEl = instance.pagination && instance.pagination.el;
    if (total === 0) { instance.el.style.display = "none"; return; }
    instance.allowTouchMove = total > 1;
    if (paginationEl) paginationEl.style.visibility = total > 1 ? "visible" : "hidden";
    if (window.innerWidth >= 768 && total < 3) {
      instance.params.slidesPerView = total;
      instance.update();
    }
  }

  var featuresEl = root.querySelector(".features .swiper");
  if (featuresEl) {
    var swiper = new Swiper(featuresEl, {
      slidesPerView: 1,
      pagination: { el: root.querySelector(".features .swiper-pagination"), clickable: true },
      breakpoints: { 768: { slidesPerView: 3, spaceBetween: 32 } },
      on: {
        init: function (instance) { checkEdgeCases(instance); refreshAOS(); },
        resize: function (instance) {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(function () { instance.update(); checkEdgeCases(instance); refreshAOS(); }, 250);
        }
      }
    });
    swiper.on("slideChangeTransitionEnd", refreshAOS);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initAOS);
  else initAOS();
})();
