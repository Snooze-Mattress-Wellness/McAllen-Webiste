/* Hidden CRM fields for the LeadConnector widgets (November 2026). CRM_PARAMS is inlined in <head> by both root layouts
   (and the converter's layout template) right after the offline shim, so it runs before any widget iframe is parsed.
     1. On every page load, a gclid in the URL is stored in a first-party cookie (snz_gclid, 90 days, path=/,
        SameSite=Lax, Secure on https), so it survives the navigation to the booking or contact page.
     2. Whenever one of the two widget iframes appears in the document — the Dream Mapping calendar
        (/widget/booking/lrAns7Z8j3vEJW3DC0Yr, components/BookingPage.tsx) or the contact / opt-in form
        (/widget/form/0BTnYKylVR6OcWJug3r8, in the generated pages' custom code, loading="lazy") — its src gets
        ?ga_client_id=<GA4 client id: the _ga cookie's value after its "GA1.1." prefix>&gclid=<the URL's, else the
        cookie's gclid>, each only when present, before the frame starts loading. Two mechanisms, one per kind of
        frame: the contact form comes with a src and loading="lazy", so a MutationObserver registered while <head>
        is parsed rewrites its src the moment the parser inserts it (a microtask: the lazy loader reads the src later,
        at its first intersection check, so the frame is requested once, with the parameters). The booking page's
        frame is our own markup, rendered without src (data-snz-src instead) and followed by an inline script that
        sets the src (crmFrameSrcScript) — the classic pattern, which every browser honours. The observer leaves
        src-less frames alone on purpose: Chrome drops a src set from the insertion microtask (the frame's initial
        about:blank navigation lands afterwards and wins, so the frame never loads), and a non-lazy frame that
        already has a src would be requested twice. form_embed.js reads the iframe's src query string and hands it to the widget
        together with the parent URL's parameters ("fetch-query-params"), so GHL hidden fields with the keys
        ga_client_id and gclid pick them up.
     3. window.snzCrm = { withParams, gclid, clientId } for the booking page's script (and the console).
   The _ga cookie is written by gtag.js once it has loaded, so on a visitor's very first page load the client id can be
   missing when the frame is parsed; on every later page it is there. The gclid also falls back to Google's own
   conversion-linker cookie (_gcl_aw = GCL.<time>.<gclid>) for visitors who landed before this script existed. */
export const BOOKING_CALENDAR_ID = 'lrAns7Z8j3vEJW3DC0Yr';
export const CONTACT_FORM_ID = '0BTnYKylVR6OcWJug3r8';
export const GCLID_COOKIE = 'snz_gclid';
export const GCLID_COOKIE_DAYS = 90;
/** The query parameters appended to the widget iframes (the hidden field keys to create in GHL). */
export const CRM_PARAM_NAMES = { clientId: 'ga_client_id', gclid: 'gclid' } as const;

export const CRM_PARAMS = `(function(){try{
var COOKIE='${GCLID_COOKIE}',DAYS=${GCLID_COOKIE_DAYS},RE=/^https:\\/\\/link\\.snoozesleep\\.com\\/widget\\/(booking\\/${BOOKING_CALENDAR_ID}|form\\/${CONTACT_FORM_ID})([\\/?#]|$)/;
function cookie(n){var m=document.cookie.match('(?:^|; )'+n+'=([^;]*)');return m?decodeURIComponent(m[1]):''}
var urlGclid='';try{urlGclid=new URLSearchParams(location.search).get('gclid')||''}catch(e){}
if(urlGclid)document.cookie=COOKIE+'='+encodeURIComponent(urlGclid)+'; max-age='+(DAYS*86400)+'; path=/; SameSite=Lax'+(location.protocol==='https:'?'; Secure':'');
function gclid(){var v=urlGclid||cookie(COOKIE);if(!v){var m=cookie('_gcl_aw').match(/^GCL\\.\\d+\\.(.+)$/);if(m)v=m[1]}return v}
function clientId(){var m=cookie('_ga').match(/^GA\\d+\\.\\d+\\.(.+)$/);return m?m[1]:''}
function withParams(src){var u=new URL(src,location.href),c=clientId(),g=gclid();if(c)u.searchParams.set('${CRM_PARAM_NAMES.clientId}',c);if(g)u.searchParams.set('${CRM_PARAM_NAMES.gclid}',g);return u.href}
function tag(f){if(f.hasAttribute('data-snz-crm'))return;var s=f.getAttribute('src')||'';if(!RE.test(s))return;f.setAttribute('data-snz-crm','1');var n=withParams(s);if(n!==s)f.setAttribute('src',n)}
function scan(root){if(!root||root.nodeType!==1)return;if(root.tagName==='IFRAME'){tag(root);return}var all=root.querySelectorAll('iframe');for(var i=0;i<all.length;i++)tag(all[i])}
new MutationObserver(function(ms){for(var i=0;i<ms.length;i++){var a=ms[i].addedNodes;for(var j=0;j<a.length;j++)scan(a[j])}}).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('DOMContentLoaded',function(){scan(document.documentElement)},{once:true});
window.snzCrm={withParams:withParams,gclid:gclid,clientId:clientId};
}catch(e){}})();`;

/** Inline script for a widget iframe rendered without src (data-snz-src instead), placed right after the frame: sets
    the src with the CRM parameters at parse time, so the frame loads exactly once, with them. Without the helper
    (script blocked, old browser) the frame still gets its plain src. */
export function crmFrameSrcScript(frameId: string): string {
  return `(function(){var f=document.getElementById(${JSON.stringify(frameId)});if(!f)return;var s=f.getAttribute('data-snz-src')||'';f.setAttribute('src',window.snzCrm?window.snzCrm.withParams(s):s)})();`;
}
