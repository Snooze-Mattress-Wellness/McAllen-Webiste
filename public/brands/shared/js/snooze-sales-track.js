/* snooze-sales-track.js – GA4 events for the Sales page (pushes to window.dataLayer; GTM forwards to GA4).
   view_promotion (once per card in view), select_promotion, expand_brand_offers, cta_click, select_item. */
(function () {
  var root = document.querySelector('.snz-sales');
  if (!root) return;
  var dl = (window.dataLayer = window.dataLayer || []);
  var store = root.getAttribute('data-snz-store');
  function promo(el) {
    return { promotion_id: el.getAttribute('data-snz-promo-id'), promotion_name: el.getAttribute('data-snz-promo-name'), creative_slot: el.getAttribute('data-snz-slot'), item_brand: el.getAttribute('data-snz-brand') };
  }
  dl.push({ content_group: 'sales', store_id: store });
  var seen = {};
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var p = promo(e.target), k = p.creative_slot + p.promotion_id;
        if (seen[k]) return; seen[k] = 1; io.unobserve(e.target);
        dl.push({ event: 'view_promotion', ecommerce: { items: [p] }, store_id: store });
      });
    }, { threshold: 0.5 });
    root.querySelectorAll('[data-snz-promo-id]').forEach(function (el) { io.observe(el); });
  }
  root.addEventListener('click', function (ev) {
    var t = ev.target;
    var cta = t.closest('[data-snz-cta]');
    if (cta) dl.push({ event: 'cta_click', cta_text: cta.getAttribute('data-snz-cta'), cta_section: cta.getAttribute('data-snz-section'), page_type: 'sales', store_id: store });
    var card = t.closest('.snz-s-card');
    var link = t.closest('a');
    if (card && link) { var first = card.querySelector('[data-snz-promo-id]'); if (first) dl.push({ event: 'select_promotion', ecommerce: { items: [promo(first)] }, store_id: store }); }
    var more = t.closest('.snz-s-more summary');
    if (more) { var d = more.parentElement; if (!d.open) dl.push({ event: 'expand_brand_offers', item_brand: d.getAttribute('data-snz-brand'), store_id: store }); }
    var item = t.closest('[data-snz-item-id]');
    if (item) dl.push({ event: 'select_item', item_list_name: 'sales_clearance', items: [{ item_id: item.getAttribute('data-snz-item-id') }], store_id: store });
  });
})();
