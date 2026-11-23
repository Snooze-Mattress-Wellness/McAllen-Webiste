/* Serta brand page – hero video.
   The hero shows the poster frame (hero-poster.webp, or hero-poster-mobile.webp on phones). On desktop (and only when the visitor hasn't asked
   for reduced motion or data saving) it loads the Serta banner video and
   fades it in once it can play. If the video file is missing or fails, the
   picture simply stays. Phones never download the video. */
"use strict";
(function () {
  var v = document.querySelector(".serta-wrapper .se-hero__video");
  if (!v || !v.dataset.src) return;
  var conn = navigator.connection || {};
  if (!window.matchMedia("(min-width: 1024px)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (conn.saveData) return;
  v.addEventListener("playing", function () { v.classList.add("is-playing"); });
  v.addEventListener("error", function () { v.remove(); }, true);
  v.src = v.dataset.src;
  v.load();
  var p = v.play();
  if (p && p.catch) p.catch(function () { /* autoplay blocked: keep the picture */ });
})();
