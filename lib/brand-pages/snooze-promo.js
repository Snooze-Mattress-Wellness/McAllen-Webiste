/* =====================================================================
   snooze-promo.js – shared offer logic for every Snooze Mattress brand page
   ---------------------------------------------------------------------
   One file, two uses:
   1. Server / build time (recommended, best for SEO): require/import it in
      Next.js, call selectPromotions() + renderPromotionsHTML() (or map the
      selected data into your own JSX) when the page is rendered/revalidated.
   2. Browser fallback: include it on the page. Any element with
      data-snz-feed-url is filled from the feed after load. If the feed
      can't be reached, whatever HTML is already in the element stays.

   The feed only carries offers. Local content (city, address, hours, FAQ,
   links) never comes from the feed.
   ===================================================================== */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.SnoozePromo = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var TZ = "America/Chicago";

  /** Today's date as YYYY-MM-DD in store time (America/Chicago). */
  function todayInStoreTime(date) {
    var d = date || new Date();
    try {
      return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
    } catch (e) {
      return d.toISOString().slice(0, 10);
    }
  }

  function isLive(row, today) {
    return !!row.start && !!row.end && row.start <= today && today <= row.end;
  }

  /** stores: [] = every store that carries the vendor; otherwise a list of store_ids. */
  function storeMayShow(row, vendor, storeId, feed) {
    if (row.stores && row.stores.length) return row.stores.indexOf(storeId) !== -1;
    if (!vendor) return true;
    var store = feed.stores && feed.stores[storeId];
    if (!store || !store.brands) return false; // unknown store: show no vendor offers
    return store.brands.indexOf(vendor) !== -1;
  }

  /**
   * Live promotion blocks for one vendor at one store.
   * opts: { vendor: "Tempur-Pedic", storeId: "mcallen", today?: "YYYY-MM-DD" }
   */
  function selectPromotions(feed, opts) {
    var today = opts.today || todayInStoreTime();
    return (feed.promotions || [])
      .filter(function (b) {
        return b.vendor === opts.vendor && isLive(b, today) && storeMayShow(b, opts.vendor, opts.storeId, feed);
      })
      .map(function (b) {
        var items = (b.items || []).filter(function (i) { return isLive(i, today); });
        return Object.assign({}, b, { items: items });
      })
      .sort(function (a, b) { return a.start < b.start ? 1 : -1; });
  }

  /** Always-on offers for one store (stores: [] = all stores). */
  function selectAlwaysOn(feed, opts) {
    return (feed.always_on || []).filter(function (o) {
      return !(o.stores && o.stores.length) || o.stores.indexOf(opts.storeId) !== -1;
    });
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function longDate(iso) {
    var p = iso.split("-");
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return months[+p[1] - 1] + " " + (+p[2]);
  }

  /* Promo pictures come from the brand's config (brand.json -> promo_images):
     { "base": { "file": "base.webp", "w": 1592, "h": 948, "alt": "..." }, ... }
     The sheet's web_image column holds the key ("base"), so the same key can
     point at each brand's own product photo. */

  /**
   * HTML for the promo slot. Returns "" when nothing is live, so the slot
   * collapses and the always-on section carries the offers.
   * opts: { imageBase: "img/", bookingUrl: "/booking", images: brand.promo_images }
   */
  function renderPromotionsHTML(blocks, opts) {
    opts = opts || {};
    var imgBase = opts.imageBase || "img/";
    var booking = opts.bookingUrl || "/booking";
    var images = opts.images || {};
    return blocks.map(function (b) {
      // A block with no image key uses the brand's "default" promo image, if it has one.
      var img = images[b.image] || images["default"];
      // Blocks with no headline row (e.g. Serta: item rows only) get a heading
      // from the event + brand, and show their items' fine print (deduplicated)
      // so the required disclosures are never dropped.
      var heading = b.headline || (b.event + ": " + b.vendor + " savings");
      var fine = b.fine_print || (b.items || []).map(function (i) { return i.fine_print || ""; })
        .filter(function (f, k, a) { return f && a.indexOf(f) === k; }).join(" ");
      return '<section class="snz-local snz-promo" aria-label="' + esc(b.vendor + " " + b.event + " offers") + '">' +
        '<div class="snz-inner"><div>' +
        '<p class="snz-event">' + esc(b.event) + " · Through " + esc(longDate(b.end)) + "</p>" +
        "<h2>" + esc(heading) + "</h2>" +
        (b.items.length ? "<ul>" + b.items.map(function (i) { return "<li>" + esc(i.text) + "</li>"; }).join("") + "</ul>" : "") +
        '<div class="snz-btns"><a class="snz-btn snz-btn--orange" href="' + esc(booking) + '">Book Free Dream Mapping</a></div>' +
        (fine ? '<p class="snz-fine">' + esc(fine) + "</p>" : "") +
        "</div>" +
        (img ? '<img src="' + esc(imgBase + img.file) + '" width="' + img.w + '" height="' + img.h + '" loading="lazy" alt="' + esc(img.alt) + '">' : "") +
        "</div></section>";
    }).join("");
  }

  /** HTML for the always-on tiles. */
  function renderAlwaysOnHTML(offers) {
    return offers.map(function (o) {
      return '<div class="snz-tile"><h3>' + esc(o.title) + "</h3>" +
        "<p>" + esc(o.body).replace(/\n/g, "<br>") + "</p>" +
        (o.fine_print ? '<p class="snz-fine">' + esc(o.fine_print) + "</p>" : "") +
        "</div>";
    }).join("");
  }

  /* ---------- Browser fallback: fill slots from the feed after load ---------- */
  function autoload() {
    if (typeof document === "undefined" || typeof fetch === "undefined") return;
    var slots = document.querySelectorAll("[data-snz-feed-url]");
    if (!slots.length) return;
    var cache = {};
    Array.prototype.forEach.call(slots, function (el) {
      var url = el.getAttribute("data-snz-feed-url");
      cache[url] = cache[url] || fetch(url, { cache: "no-store" }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
      cache[url].then(function (feed) {
        var storeId = el.getAttribute("data-snz-store");
        if (el.hasAttribute("data-snz-promo-slot")) {
          el.innerHTML = renderPromotionsHTML(
            selectPromotions(feed, { vendor: el.getAttribute("data-snz-vendor"), storeId: storeId }),
            {
              imageBase: el.getAttribute("data-snz-image-base") || "img/",
              bookingUrl: el.getAttribute("data-snz-booking") || "/booking",
              images: JSON.parse(el.getAttribute("data-snz-images") || "{}")
            }
          );
        } else if (el.hasAttribute("data-snz-always-on")) {
          var html = renderAlwaysOnHTML(selectAlwaysOn(feed, { storeId: storeId }));
          if (html) el.innerHTML = html;
        }
      }).catch(function () { /* keep the server-rendered / static content */ });
    });
  }
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", autoload);
    else autoload();
  }

  return {
    todayInStoreTime: todayInStoreTime,
    selectPromotions: selectPromotions,
    selectAlwaysOn: selectAlwaysOn,
    renderPromotionsHTML: renderPromotionsHTML,
    renderAlwaysOnHTML: renderAlwaysOnHTML
  };
});
