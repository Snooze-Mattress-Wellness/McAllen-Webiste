/* =====================================================================
   snooze-sales.js – the Sales page (/mattress-sales) for every Snooze location
   ---------------------------------------------------------------------
   Same feed as the brand pages (Offer Calendar -> promo-feed.gs). This file
   turns feed + location settings + today's date into:
     - buildSalesModel()  -> plain data (use it in JSX/React if you prefer)
     - renderSalesHTML()  -> the finished page body (server-rendered HTML)
     - salesSEO()         -> <title>, meta description, H1, OG, canonical
     - salesJsonLd()      -> WebPage + BreadcrumbList + FAQPage (+ ItemList of Offers)
   No dependencies. Works in Node (Next.js server components / route handlers)
   and in the browser.

   Nobody edits this page month to month: offers appear on their start date
   and drop off on their end date, in the store's own time zone.
   ===================================================================== */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.SnoozeSales = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var DAY = 86400000;
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var ENDING_SOON_DAYS = 7; // "Ending soon" window
  var FLASH_MAX_DAYS = 7;   // an offer that runs this many days or fewer is a Flash offer

  /* ---------------- dates (all YYYY-MM-DD strings, store time zone) ---------------- */
  function todayIn(tz, date) {
    var d = date || new Date();
    try {
      return new Intl.DateTimeFormat("en-CA", { timeZone: tz || "America/Chicago", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
    } catch (e) { return d.toISOString().slice(0, 10); }
  }
  function toUTC(ymd) { var p = ymd.split("-"); return Date.UTC(+p[0], +p[1] - 1, +p[2]); }
  function daysBetween(a, b) { return Math.round((toUTC(b) - toUTC(a)) / DAY); }
  function shortDate(ymd) { var p = ymd.split("-"); return MONTHS[+p[1] - 1] + " " + (+p[2]); }
  function longDate(ymd) { var p = ymd.split("-"); return MONTHS_LONG[+p[1] - 1] + " " + (+p[2]); }
  function endLabel(end, today) {
    var n = daysBetween(today, end);
    if (n <= 0) return "Ends today";
    if (n === 1) return "Ends tomorrow";
    var p = end.split("-");
    return "Ends " + DOW[new Date(toUTC(end)).getUTCDay()] + ", " + (+p[1]) + "/" + (+p[2]);
  }
  function isLive(row, today) { return !!row.start && !!row.end && row.start <= today && today <= row.end; }

  /* ---------------- text helpers ---------------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function list(arr) { return arr.length < 2 ? arr.join("") : arr.slice(0, -1).join(", ") + " and " + arr[arr.length - 1]; }
  function dollars(amount) { var m = /\$([\d,]+)/.exec(amount || ""); return m ? Number(m[1].replace(/,/g, "")) : 0; }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

  /** "Save up to $700 on Serta Perfect Sleeper" + "Up to $700" -> { big: "Up to $700", detail: "Serta Perfect Sleeper" } */
  function splitOfferText(text, amount) {
    text = String(text || "").trim();
    var big = String(amount || "").trim();
    var detail = text
      .replace(/^save\s+up\s+to\s+(\$[\d,]+|\d+%)\s+(off\s+)?(on\s+)?/i, "")
      .replace(/^save\s+(\$[\d,]+|\d+%)\s+(off\s+)?(on\s+)?/i, "")
      .replace(/^up\s+to\s+(\$[\d,]+|\d+%)\s+(off\s+)?(on\s+)?/i, "")
      .replace(/^(\$[\d,]+|\d+%)\s+off\s+(on\s+)?/i, "");
    if (!big) {
      var m = /^(save\s+)?(up\s+to\s+)?(\$[\d,]+|\d+%)(\s+off)?/i.exec(text);
      if (m) big = (m[2] ? "Up to " : "") + m[3] + (m[2] ? "" : " off");
    }
    if (/^free$/i.test(big)) detail = detail.replace(/^free\s+/i, "");
    if (detail === text && big && !/^free$/i.test(big)) detail = text; // couldn't split: show whole text under the amount
    return { big: big, detail: cap(detail) };
  }

  /* ---------------- selection ---------------- */
  function storeCarries(feed, storeId, block) {
    if (block.stores && block.stores.length) return block.stores.indexOf(storeId) !== -1;
    var store = feed.stores && feed.stores[storeId];
    if (!store || !store.brands) return false; // unknown store: show no vendor offers
    return store.brands.indexOf(block.vendor) !== -1;
  }

  /**
   * Every live offer at one store, one entry per offer (not per block).
   * Blocks with items -> one offer per live item. Headline-only blocks (Helix / Brooklyn
   * Bedding sprints) -> the headline is the offer.
   */
  function selectSalesOffers(feed, opts) {
    var today = opts.today;
    var out = [], order = 0;
    (feed.promotions || []).forEach(function (b) {
      if (!isLive(b, today) || !storeCarries(feed, opts.storeId, b)) return;
      var items = (b.items || []).filter(function (i) { return isLive(i, today); });
      var rows = items.length ? items : (b.headline ? [{ id: b.block, text: b.headline, amount: b.amount, fine_print: b.fine_print, start: b.start, end: b.end }] : []);
      rows.forEach(function (r) {
        var split = splitOfferText(r.text, r.amount);
        out.push({
          id: r.id || b.block, block: b.block, vendor: b.vendor, event: b.event,
          text: r.text, amount: split.big, detail: split.detail,
          fine_print: r.fine_print || b.fine_print || "",
          start: r.start || b.start, end: r.end || b.end,
          flash: daysBetween(r.start || b.start, r.end || b.end) + 1 <= FLASH_MAX_DAYS,
          order: order++
        });
      });
    });
    return out;
  }

  function brandInfo(feed, vendor) {
    var b = (feed.brands || []).filter(function (x) { return x.brand === vendor; })[0] || {};
    return {
      brand: vendor,
      name: b.display_name || vendor,
      logo: b.logo_file || "",
      color: b.brand_color || "#001489",
      url: b.brand_page_url || ""
    };
  }

  function groupByBrand(offers, feed) {
    var map = {};
    offers.forEach(function (o) { (map[o.vendor] = map[o.vendor] || []).push(o); });
    return Object.keys(map).map(function (v) {
      var info = brandInfo(feed, v);
      info.offers = map[v].sort(function (a, b) { return a.order - b.order; });
      return info;
    }).sort(function (a, b) { return b.offers.length - a.offers.length || a.name.localeCompare(b.name); });
  }

  function endingSoon(offers, today) {
    return offers
      .filter(function (o) { return daysBetween(today, o.end) < ENDING_SOON_DAYS; })
      .sort(function (a, b) { return a.end < b.end ? -1 : a.end > b.end ? 1 : dollars(b.amount) - dollars(a.amount); });
  }

  /** The Snooze sales event running today (the most recently started one when two overlap). */
  function currentEvent(feed, today) {
    return (feed.events || []).filter(function (e) { return isLive(e, today); })
      .sort(function (a, b) { return a.start < b.start ? 1 : -1; })[0] || null;
  }

  /* ---------------- model ---------------- */
  /**
   * loc: the site's location settings (city, state, site_url, timezone, local_intro, address…)
   * opts: { today?: "YYYY-MM-DD", clearance?: [ {id, brand, name, size, price, retail, savings_pct, qty, label, image, url} ] }
   */
  function buildSalesModel(feed, loc, opts) {
    opts = opts || {};
    var today = opts.today || todayIn(loc.timezone);
    var offers = selectSalesOffers(feed, { storeId: loc.store_id, today: today });
    var groups = groupByBrand(offers, feed);
    var ending = endingSoon(offers, today);
    var event = currentEvent(feed, today);
    var lastEnd = offers.reduce(function (m, o) { return o.end > m ? o.end : m; }, "");
    var top = offers.reduce(function (m, o) { return Math.max(m, dollars(o.amount)); }, 0);
    var alwaysOn = (feed.always_on || []).filter(function (o) { return !(o.stores && o.stores.length) || o.stores.indexOf(loc.store_id) !== -1; });
    var clearance = (opts.clearance || []).slice().sort(function (a, b) { return (b.savings_pct || 0) - (a.savings_pct || 0); }).slice(0, 4);
    return {
      today: today, loc: loc, event: event, offers: offers, groups: groups, ending: ending,
      glance: {
        brands: groups.length, offers: offers.length, top: top,
        endingWeek: ending.length, next: ending[0] || null
      },
      through: event ? event.end : lastEnd,
      alwaysOn: alwaysOn, clearance: clearance,
      updated: today
    };
  }

  /* ---------------- copy: SEO + summary ---------------- */
  function topBrandNames(m, n) { return m.groups.slice(0, n).map(function (g) { return g.name; }); }

  function summarySentence(m) {
    var c = m.loc.city;
    if (!m.offers.length) {
      return "Snooze Mattress in " + c + " offers free Dream Mapping, special financing and a 365-Night Sleep Guarantee every day. Ask about this month's in-store offers.";
    }
    var picks = m.offers.slice().sort(function (a, b) { return dollars(b.amount) - dollars(a.amount) || a.order - b.order; })
      .slice(0, 3).map(function (o) { return /^(Save|Free)\b/.test(o.text) ? o.text.charAt(0).toLowerCase() + o.text.slice(1) : o.text; });
    var s = "Through " + longDate(m.through) + ", Snooze Mattress in " + c + " has " + m.offers.length + " offer" + (m.offers.length === 1 ? "" : "s") +
      " from " + m.groups.length + " brand" + (m.groups.length === 1 ? "" : "s") + ", including " + list(picks) + ".";
    if (m.glance.endingWeek) s += " " + m.glance.endingWeek + " offer" + (m.glance.endingWeek === 1 ? " ends" : "s end") + " this week.";
    return s + " Dream Mapping is always free.";
  }

  /**
   * Head tags and H1. Title stays the same all year (best for ranking);
   * the H1 and description carry the live event.
   */
  function salesSEO(m) {
    var loc = m.loc, cs = loc.city + ", " + loc.state;
    var path = loc.sales_path || "/mattress-sales";
    var title = "Mattress Sales in " + cs + " | Snooze Mattress";
    if (title.length > 60) title = "Mattress Sales in " + cs;
    var h1 = m.event ? m.event.name + ": Mattress Deals in " + cs : "Mattress Sales in " + cs;
    var desc;
    if (m.offers.length) {
      var names = topBrandNames(m, 3);
      for (var n = names.length; n >= 0; n--) {
        var b = names.slice(0, n);
        desc = (m.event ? m.event.name + " in " : "Mattress sales in ") + cs + ": " + m.offers.length + " mattress deals" +
          (b.length ? " on " + b.join(", ") + (m.groups.length > b.length ? " and more" : "") : "") +
          ". Free Dream Mapping at every budget. Ends " + shortDate(m.through) + ".";
        if (desc.length <= 158) break;
      }
    } else {
      desc = "Mattress deals, special financing and free Dream Mapping at Snooze Mattress in " + cs + ". Find the right fit for your body at a price that fits your budget.";
    }
    return {
      title: title,
      description: desc,
      og_title: m.event ? m.event.name + " at Snooze Mattress in " + loc.city : title,
      og_description: desc,
      h1: h1,
      canonical: loc.site_url + path,
      robots: "index, follow, max-image-preview:large"
    };
  }

  function salesFAQ(m) {
    var c = m.loc.city, out = [];
    if (m.event) out.push({ q: "When does the " + m.event.name + " end at Snooze Mattress in " + c + "?", a: "The " + m.event.name + " runs through " + longDate(m.event.end) + ". Each brand's offer has its own end date, shown on this page." });
    out.push({ q: "Is Dream Mapping free during the sale?", a: "Yes. Dream Mapping is always free and no purchase is needed. Every guest gets the same fitting, whatever they plan to spend." });
    m.alwaysOn.filter(function (o) { return o.faq; }).forEach(function (o) {
      out.push({ q: o.faq.q.replace(/\{brand\}\s*/g, "sale "), a: o.faq.a.replace(/\{brand\}\s*/g, "") });
    });
    if (m.loc.address_line1) out.push({ q: "Where is Snooze Mattress in " + c + "?", a: "We're at " + m.loc.address_line1 + ", " + m.loc.address_line2 + (m.loc.hours_sentence ? ", open " + m.loc.hours_sentence : "") + "." });
    return out;
  }

  function salesJsonLd(m) {
    var seo = salesSEO(m), url = seo.canonical, loc = m.loc;
    var graph = [
      {
        "@type": "WebPage", "@id": url + "#webpage", url: url, name: seo.title, description: seo.description, inLanguage: "en-US",
        dateModified: m.updated, about: { "@id": loc.site_url + "/#store" }, publisher: { "@id": loc.site_url + "/#organization" },
        breadcrumb: { "@id": url + "#breadcrumb" }
      },
      {
        "@type": "BreadcrumbList", "@id": url + "#breadcrumb",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: loc.site_url + "/" },
          { "@type": "ListItem", position: 2, name: "Mattress Sales", item: url }
        ]
      },
      { "@type": "FAQPage", "@id": url + "#faq", mainEntity: salesFAQ(m).map(function (f) { return { "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } }; }) }
    ];
    if (m.offers.length) {
      graph.push({
        "@type": "ItemList", "@id": url + "#offers", name: "Mattress deals at Snooze Mattress in " + loc.city,
        itemListElement: m.offers.map(function (o, i) {
          return {
            "@type": "ListItem", position: i + 1,
            item: { "@type": "Offer", name: o.text, description: o.fine_print, validFrom: o.start, validThrough: o.end, seller: { "@id": loc.site_url + "/#store" }, itemOffered: { "@type": "Product", name: o.detail || o.text, brand: { "@type": "Brand", name: brandInfoName(o.vendor, m) } } }
          };
        })
      });
    }
    return { "@context": "https://schema.org", "@graph": graph };
  }
  function brandInfoName(vendor, m) { var g = m.groups.filter(function (x) { return x.brand === vendor; })[0]; return g ? g.name : vendor; }

  /* ---------------- HTML ---------------- */
  var CLOCK = '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F58433" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
  var ICONS = {
    "EVG-07": '<path d="M3 12h4l2-6 4 12 2-6h6"/>',
    "EVG-01": '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
    "CTD-06": '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18M7 15h4"/>',
    "EVG-05": '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>'
  };
  function icon(id) { return '<svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#001489" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[id] || '<circle cx="12" cy="12" r="8"/>') + "</svg>"; }

  function trackAttrs(o, slot) {
    return ' data-snz-promo-id="' + esc(o.id) + '" data-snz-promo-name="' + esc(o.text) + '" data-snz-slot="' + slot + '" data-snz-brand="' + esc(o.vendor) + '"';
  }
  function logoTag(g, extra, decorative) {
    return g.logo
      ? '<img class="snz-s-logo" src="' + esc(g.logo) + '" alt="' + (decorative ? "" : esc(g.name)) + '" loading="lazy" decoding="async"' + (extra || "") + ">"
      : '<span class="snz-s-logo-text">' + esc(g.name) + "</span>";
  }

  function renderHero(m, seo, opts) {
    var g = m.glance, loc = m.loc;
    var pre = m.event ? esc(m.event.name) + " · Through " + esc(longDate(m.event.end)) : "Mattress deals at Snooze Mattress";
    var h1 = esc(seo.h1).replace("Mattress Deals", '<span class="snz-s-hl">Mattress Deals</span>').replace("Mattress Sales", '<span class="snz-s-hl">Mattress Sales</span>');
    var sub = m.offers.length
      ? g.offers + " offer" + (g.offers === 1 ? "" : "s") + " from " + g.brands + " brand" + (g.brands === 1 ? "" : "s") + " at Snooze Mattress in " + esc(loc.city) + ". Get fitted free first, then save on the mattress that fits your body."
      : "Free Dream Mapping, special financing and a 365-Night Sleep Guarantee, every day at Snooze Mattress in " + esc(loc.city) + ".";
    var card = "";
    if (m.offers.length) {
      var stat = function (n, l, ic) { return '<div class="snz-s-stat"><div class="snz-s-stat-n">' + (ic || "") + n + '</div><div class="snz-s-stat-l">' + l + "</div></div>"; };
      card = '<aside class="snz-s-glance" aria-label="This month at a glance"><div class="snz-s-glance-bar"></div><div class="snz-s-glance-in">' +
        '<p class="snz-s-pre snz-s-glance-hd"><img src="' + esc(opts.assetBase) + 'logos/snooze-icon-orange.svg" alt="" width="26" height="26">This month at a glance</p>' +
        '<div class="snz-s-stats">' +
        stat(g.brands, "brand" + (g.brands === 1 ? "" : "s") + " on sale") +
        stat(g.offers, "offer" + (g.offers === 1 ? "" : "s") + " live today") +
        (g.top ? stat("$" + g.top.toLocaleString("en-US"), "top savings this month") : "") +
        (g.endingWeek ? stat(g.endingWeek, "ending this week", CLOCK.replace('width="16" height="16"', 'width="26" height="26"')) : stat(esc(shortDate(m.through)), "offers run through")) +
        "</div>" +
        (g.next ? '<div class="snz-s-next"><p class="snz-s-pre">Ending next</p><div class="snz-s-next-row"><div><p class="snz-s-next-t">' + esc(brandInfoName(g.next.vendor, m)) + " · " + esc(g.next.text) + '</p><p class="snz-s-next-d">' + esc(endLabel(g.next.end, m.today)) + "</p></div>" + (g.next.flash ? '<span class="snz-s-flash">Flash</span>' : "") + '</div><a class="snz-s-link" href="#ending-soon">See everything ending soon <span aria-hidden="true">→</span></a></div>' : "") +
        "</div></aside>";
    }
    return '<section class="snz-s-hero"><div class="snz-s-wrap snz-s-hero-in"><div class="snz-s-hero-copy">' +
      '<p class="snz-s-pre snz-s-pre--light">' + pre + "</p><div class=\"snz-s-rule\"></div>" +
      '<h1 class="snz-s-h1">' + h1 + "</h1>" +
      '<p class="snz-s-hero-sub">' + sub + "</p>" +
      '<div class="snz-s-btns"><a class="snz-s-btn" href="' + esc(loc.links.booking) + '" data-snz-cta="Book your Dream Mapping" data-snz-section="hero">Book your Dream Mapping</a>' +
      (m.offers.length ? '<a class="snz-s-btn snz-s-btn--ghost" href="#deals-by-brand" data-snz-cta="See all deals" data-snz-section="hero">See all deals</a>' : "") +
      "</div></div>" + card + "</div></section>";
  }

  function renderIntro(m) {
    var loc = m.loc;
    return '<section class="snz-s-intro"><div class="snz-s-wrap snz-s-intro-in">' +
      '<div class="snz-s-intro-copy"><h2 class="snz-s-pre snz-s-blue">Mattress sales at Snooze Mattress in ' + esc(loc.city) + ", " + esc(loc.state) + "</h2>" +
      "<p>" + esc(loc.local_intro || ("Snooze Mattress in " + loc.city + " helps " + loc.city + "-area shoppers find a mattress that fits their body, starting with free Dream Mapping.")) + "</p></div>" +
      '<div class="snz-s-summary"><p class="snz-s-pre snz-s-blue">Sale summary · updated ' + esc(longDate(m.updated)) + "</p><p>" + esc(summarySentence(m)) + "</p></div>" +
      "</div></section>";
  }

  function renderEnding(m) {
    if (!m.ending.length) return "";
    return '<section class="snz-s-ending" id="ending-soon"><div class="snz-s-wrap">' +
      '<p class="snz-s-pre snz-s-blue">Last chance</p><div class="snz-s-rule"></div><h2 class="snz-s-h2">Ending <strong>soon</strong></h2>' +
      '<div class="snz-s-rail" role="list">' + m.ending.map(function (o) {
        var g = m.groups.filter(function (x) { return x.brand === o.vendor; })[0];
        return '<article class="snz-s-end" role="listitem"' + trackAttrs(o, "ending_soon") + '><div class="snz-s-end-top">' + logoTag(g, ' height="22"') + (o.flash ? '<span class="snz-s-flash">Flash</span>' : "") + "</div>" +
          '<p class="snz-s-big">' + esc(o.amount) + '</p><p class="snz-s-det">' + esc(o.detail) + '</p><p class="snz-s-when">' + CLOCK + esc(endLabel(o.end, m.today)) + "</p></article>";
      }).join("") + "</div>" +
      '<p class="snz-s-note">Flash = an offer that runs 7 days or less.</p></div></section>';
  }

  function offerRow(o, m) {
    return '<li class="snz-s-row"' + trackAttrs(o, "brand_card") + '><span class="snz-s-row-big">' + esc(o.amount) + '</span><span class="snz-s-row-t"><span class="snz-s-row-d">' + esc(o.detail) + '</span><span class="snz-s-row-f">' + esc(endLabel(o.end, m.today)) + (o.flash ? " · Flash" : "") + "</span></span></li>";
  }

  function renderBrands(m) {
    if (!m.groups.length) return "";
    return '<section class="snz-s-brands" id="deals-by-brand"><div class="snz-s-wrap">' +
      '<p class="snz-s-pre snz-s-blue">This month\'s offers</p><div class="snz-s-rule"></div><h2 class="snz-s-h2">Mattress deals by <strong>brand</strong></h2>' +
      '<div class="snz-s-cards">' + m.groups.map(function (g) {
        var n = g.offers.length;
        var body;
        if (n === 1) {
          var o = g.offers[0];
          body = '<div class="snz-s-feature"' + trackAttrs(o, "brand_card") + '><p class="snz-s-big snz-s-big--xl">' + esc(o.amount) + '</p><p class="snz-s-det">' + esc(o.detail) + '</p><p class="snz-s-row-f">' + esc(endLabel(o.end, m.today)) + (o.flash ? " · Flash" : "") + "</p></div>";
        } else {
          body = '<ul class="snz-s-rows">' + g.offers.slice(0, 3).map(function (o) { return offerRow(o, m); }).join("") + "</ul>" +
            (n > 3 ? '<details class="snz-s-more" data-snz-brand="' + esc(g.brand) + '"><summary>+' + (n - 3) + " more</summary><ul class=\"snz-s-rows\">" + g.offers.slice(3).map(function (o) { return offerRow(o, m); }).join("") + "</ul></details>" : "");
        }
        var fine = uniq(g.offers.map(function (o) { return o.fine_print; })).join(" ");
        return '<article class="snz-s-card"><div class="snz-s-card-hd" style="background:' + esc(g.color) + '"><h3 class="snz-s-card-h3"><span class="snz-s-chip">' + logoTag(g, ' height="28"', true) + '</span><span class="snz-s-sr">' + esc(g.name) + ' deals</span></h3><span class="snz-s-count">' + n + " offer" + (n === 1 ? "" : "s") + "</span></div>" +
          '<div class="snz-s-card-body">' + body + "</div>" +
          '<div class="snz-s-card-ft">' + (g.url ? '<a class="snz-s-link" href="' + esc(g.url) + '">Explore ' + esc(g.name) + ' <span aria-hidden="true">→</span></a>' : '<a class="snz-s-link" href="' + esc(m.loc.links.booking) + '">Try ' + esc(g.name) + ' in store <span aria-hidden="true">→</span></a>') + "</div>" +
          (fine ? '<p class="snz-s-fine">' + esc(fine) + "</p>" : "") +
          "</article>";
      }).join("") + "</div></div></section>";
  }
  function uniq(a) { return a.filter(function (x, i) { return x && a.indexOf(x) === i; }); }

  function money(n) { return "$" + Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 }); }
  function renderClearance(m) {
    if (!m.clearance.length) return "";
    var loc = m.loc;
    return '<section class="snz-s-clear"><div class="snz-s-wrap">' +
      '<div class="snz-s-head-row"><div><p class="snz-s-pre snz-s-blue">Only at this store</p><div class="snz-s-rule"></div><h2 class="snz-s-h2">Floor model &amp; <strong>clearance</strong> deals in ' + esc(loc.city) + "</h2></div>" +
      '<a class="snz-s-link" href="' + esc(loc.links.clearance || "/clearance") + '">See all clearance in ' + esc(loc.city) + ' <span aria-hidden="true">→</span></a></div>' +
      '<div class="snz-s-clear-grid">' + m.clearance.map(function (c) {
        return '<article class="snz-s-citem" data-snz-item-id="' + esc(c.id) + '"><a href="' + esc(c.url || loc.links.clearance || "/clearance") + '">' +
          '<div class="snz-s-cimg">' + (c.image ? '<img src="' + esc(c.image) + '" alt="' + esc(c.brand + " " + c.name) + '" loading="lazy" width="400" height="260">' : "") +
          '<span class="snz-s-badges"><span class="snz-s-badge">' + esc(c.label || "Clearance") + "</span>" + (c.savings_pct ? '<span class="snz-s-badge snz-s-badge--o">Save ' + Math.round(c.savings_pct) + "%</span>" : "") + "</span></div>" +
          '<div class="snz-s-cbody"><p class="snz-s-cbrand">' + esc(c.brand) + (c.size ? " · " + esc(c.size) : "") + '</p><h3 class="snz-s-cname">' + esc(c.name) + "</h3>" +
          '<p class="snz-s-cprice"><span>' + money(c.price) + "</span>" + (c.retail ? "<s>" + money(c.retail) + "</s>" : "") + "</p>" +
          (c.qty ? '<p class="snz-s-cqty">Only ' + c.qty + " left at this store</p>" : "") + "</div></a></article>";
      }).join("") + "</div></div></section>";
  }

  function renderAlwaysOn(m, opts) {
    if (!m.alwaysOn.length) return "";
    return '<section class="snz-s-always"><div class="snz-s-wrap">' +
      '<p class="snz-s-pre snz-s-pre--light"><img src="' + esc(opts.assetBase) + 'logos/snooze-icon-orange.svg" alt="" width="30" height="30">Every day at Snooze Mattress</p><div class="snz-s-rule"></div>' +
      '<h2 class="snz-s-h2 snz-s-h2--light">Better Sleep. For Every Body. For Every <span class="snz-s-hl">Budget.</span></h2>' +
      '<p class="snz-s-always-sub">On top of this month\'s deals, every guest gets these, every day.</p>' +
      '<div class="snz-s-tiles">' + m.alwaysOn.map(function (o) {
        return '<div class="snz-s-tile"><span class="snz-s-tile-ic">' + icon(o.id) + '</span><h3 class="snz-s-tile-h3">' + esc(o.title) + "</h3><p>" + esc(o.body).replace(/\n/g, "<br>") + "</p>" + (o.fine_print ? '<p class="snz-s-fine snz-s-fine--light">' + esc(o.fine_print) + "</p>" : "") + "</div>";
      }).join("") + "</div></div></section>";
  }

  function renderDreamVisit(m, opts) {
    var loc = m.loc;
    var step = function (n, t) { return '<li><span class="snz-s-stepn">' + n + "</span>" + t + "</li>"; };
    return '<section class="snz-s-dv"><div class="snz-s-wrap snz-s-dv-in">' +
      '<div class="snz-s-dream">' + (opts.dreamImage ? '<img class="snz-s-dream-img" src="' + esc(opts.dreamImage.src) + '" alt="' + esc(opts.dreamImage.alt) + '" width="' + opts.dreamImage.w + '" height="' + opts.dreamImage.h + '" loading="lazy">' : "") +
      '<div class="snz-s-dream-copy"><p class="snz-s-pre snz-s-blue">Free Dream Mapping</p><div class="snz-s-rule"></div>' +
      '<h2 class="snz-s-h2 snz-s-h2--sm">Not Every Mattress Fits Every <span class="snz-s-ul">Body.</span></h2>' +
      "<p>Before you pick a deal, find out what your body needs. Dream Mapping, our pressure mapping technology, shows exactly where you need support, and a Sleep Coach matches you to the offer that fits.</p>" +
      '<ol class="snz-s-steps">' + step(1, "Dream Mapping") + step(2, "Sleep Score") + step(3, "Better Sleep") + "</ol>" +
      '<a class="snz-s-btn" href="' + esc(loc.links.booking) + '" data-snz-cta="Book your Dream Mapping" data-snz-section="dream_mapping">Book your Dream Mapping</a></div></div>' +
      '<div class="snz-s-visit" id="visit"><img class="snz-s-visit-logo" src="' + esc(opts.assetBase) + 'logos/snooze-horizontal-white.svg" alt="Snooze mattress + wellness" width="170" height="58">' +
      '<h2 class="snz-s-h2 snz-s-h2--light snz-s-h2--sm">Visit Snooze Mattress in <span class="snz-s-hl">' + esc(loc.city) + "</span></h2>" +
      '<ul class="snz-s-vlist">' +
      (loc.address_line1 ? "<li>" + esc(loc.address_line1) + ", " + esc(loc.address_line2) + "</li>" : "") +
      (loc.phone_display ? '<li><a href="tel:' + esc(loc.phone_e164) + '">' + esc(loc.phone_display) + "</a></li>" : "") +
      (loc.hours_lines ? "<li>" + loc.hours_lines.map(esc).join("<br>") + "</li>" : "") + "</ul>" +
      '<div class="snz-s-btns">' + (loc.maps_url ? '<a class="snz-s-btn" href="' + esc(loc.maps_url) + '" data-snz-cta="Get directions" data-snz-section="visit">Get directions</a>' : "") +
      (loc.phone_e164 ? '<a class="snz-s-btn snz-s-btn--ghost" href="tel:' + esc(loc.phone_e164) + '" data-snz-cta="Call the store" data-snz-section="visit">Call the store</a>' : "") + "</div></div>" +
      "</div></section>";
  }

  function renderFAQ(m) {
    return '<section class="snz-s-faq" id="faq"><div class="snz-s-wrap"><h2 class="snz-s-h2 snz-s-h2--sm">Mattress sale <strong>questions</strong></h2>' +
      salesFAQ(m).map(function (f, i) { return "<details" + (i === 0 ? " open" : "") + "><summary>" + esc(f.q) + "</summary><p>" + esc(f.a) + "</p></details>"; }).join("") +
      "</div></section>";
  }

  /**
   * Finished page body (goes between the site's own header and footer).
   * opts: { assetBase: "/brands/", dreamImage?: { src, alt, w, h } }
   */
  function renderSalesHTML(m, opts) {
    opts = opts || {};
    opts.assetBase = opts.assetBase || "/brands/";
    var seo = salesSEO(m);
    return '<div class="snz-sales" data-snz-page="sales" data-snz-store="' + esc(m.loc.store_id) + '">' +
      renderHero(m, seo, opts) + renderIntro(m) + renderEnding(m) + renderBrands(m) + renderClearance(m) +
      renderAlwaysOn(m, opts) + renderDreamVisit(m, opts) + renderFAQ(m) + "</div>";
  }

  return {
    todayIn: todayIn, endLabel: endLabel, splitOfferText: splitOfferText,
    selectSalesOffers: selectSalesOffers, groupByBrand: groupByBrand, endingSoon: endingSoon, currentEvent: currentEvent,
    buildSalesModel: buildSalesModel, summarySentence: summarySentence,
    salesSEO: salesSEO, salesFAQ: salesFAQ, salesJsonLd: salesJsonLd,
    renderSalesHTML: renderSalesHTML
  };
});
