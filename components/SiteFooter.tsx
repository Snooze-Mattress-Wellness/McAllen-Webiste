import Image from 'next/image';
import { SITE } from './site-config';
import { LOCATION } from '@/lib/location';
import { localizeHref, ui, PRODUCT_KEYS, type Locale } from '@/lib/i18n';
import { LIVE_BRANDS } from '@/lib/brand-pages/brand-list';
import styles from './SiteFooter.module.css';

/* The one site footer, rendered by the root layout of each locale on every route (the GoHighLevel footer
   sections are removed by the converter). Content is the site's own: links, phone, address, hours, map. */

const PRODUCT_HREFS: Record<(typeof PRODUCT_KEYS)[number], string> = {
  mattresses: '/mattresses',
  bases: '/adjustable-mattress-bases',
  chairs: '/massage-chairs',
  pillows: '/pillows',
  protectors: '/mattress-protectors',
  sheets: '/premium-sheets',
  recliner: '/sleep-recliner',
  kit: '/at-home-sleep-test-kit-by-sleepcorner',
};
const MAP_EMBED = LOCATION.mapEmbed;
const MAP_LINK = LOCATION.mapLink;

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
  </svg>
);
const PinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10Z" />
    <circle cx="12" cy="11" r="2.3" />
  </svg>
);
const NavIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M21 3 3 10.5l8.5 2 2 8.5L21 3Z" />
  </svg>
);
const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 21s-7.5-4.6-9.5-9.2C1.2 8.6 3.3 5 6.8 5c1.9 0 3.5 1 4.4 2.4l.8 1.2.8-1.2C13.7 6 15.3 5 17.2 5c3.5 0 5.6 3.6 4.3 6.8C19.5 16.4 12 21 12 21Z" />
  </svg>
);
const ExtIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7 17 17 7M9 7h8v8" />
  </svg>
);

export function SiteFooter({ locale = 'en' }: { locale?: Locale }) {
  const t = ui(locale);
  const f = t.footer;
  const L = (href: string) => localizeHref(href, locale);
  return (
    <footer className={styles.footer} data-site-footer="">
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.brand} data-animate="fade-up">
            <a href={L('/')} className={styles.logo} aria-label={t.menu.homeAria}>
              <Image src={SITE.logo} alt={SITE.logoAlt} width={190} height={53} />
            </a>
            <p className={styles.about}>{f.about}</p>
            <div className={styles.social}>
              <a href={LOCATION.social.facebook} target="_blank" rel="noopener noreferrer" aria-label={f.facebook}>
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.8c0-.9.3-1.6 1.6-1.6h1.7V4.4c-.3 0-1.3-.1-2.5-.1-2.5 0-4.1 1.5-4.1 4.2v2.3H7.4V14h2.8v8h3.3z" /></svg>
              </a>
              <a href={LOCATION.social.instagram} target="_blank" rel="noopener noreferrer" aria-label={f.instagram}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" /></svg>
              </a>
              <a href={LOCATION.social.youtube} target="_blank" rel="noopener noreferrer" aria-label={f.youtube}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" aria-hidden="true"><path d="M21.6 7.2a2.4 2.4 0 0 0-1.7-1.7C18.4 5 12 5 12 5s-6.4 0-7.9.5A2.4 2.4 0 0 0 2.4 7.2C2 8.7 2 12 2 12s0 3.3.4 4.8a2.4 2.4 0 0 0 1.7 1.7c1.5.5 7.9.5 7.9.5s6.4 0 7.9-.5a2.4 2.4 0 0 0 1.7-1.7c.4-1.5.4-4.8.4-4.8s0-3.3-.4-4.8Z" /><path d="m10 9.2 4.8 2.8-4.8 2.8V9.2Z" fill="currentColor" stroke="none" /></svg>
              </a>
              <a href={LOCATION.social.linkedin} target="_blank" rel="noopener noreferrer" aria-label={f.linkedin}>
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45Z" /></svg>
              </a>
              {/* TikTok (client request, November 27, 2026): the TikTok mark (Simple Icons, CC0); the 30-unit viewBox
                  insets the full-height glyph to the other icons' visual size */}
              <a href={LOCATION.social.tiktok} target="_blank" rel="noopener" aria-label={f.tiktok}>
                <svg viewBox="-3 -3 30 30" fill="currentColor" aria-hidden="true"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg>
              </a>
            </div>
            <div className={styles.ctas}>
              <a href={L('/booking')} className={styles.btn}>{f.book}</a>
              <a href={L('/contact-us')} className={`${styles.btn} ${styles.btnOutline}`}>{f.contact}</a>
            </div>
          </div>

          <div data-animate="fade-up" data-delay="100">
            <h2 className={styles.heading}>{f.products}</h2>
            <ul className={styles.list}>
              {PRODUCT_KEYS.map((key) => (
                <li key={key}><a href={L(PRODUCT_HREFS[key])}>{t.products[key].label}</a></li>
              ))}
              {/* the live brand pages (lib/brand-pages/brand-list.ts), in order: English only, so both languages link the same
                  URL (as the header's "Our Brands" group) */}
              {LIVE_BRANDS.map((b) => <li key={b.key}><a href={b.path}>{b.name}</a></li>)}
            </ul>
          </div>

          <div data-animate="fade-up" data-delay="200">
            <h2 className={styles.heading}>{f.company}</h2>
            <ul className={styles.list}>
              {f.companyLinks.map(([label, href]) => (
                <li key={href}><a href={L(href)}>{label}</a></li>
              ))}
            </ul>
          </div>

          <div className={styles.visit} data-animate="fade-up" data-delay="300">
            <h2 className={styles.heading}>{f.visit}</h2>
            <a href={SITE.phoneHref} className={styles.phone}>
              <span className={styles.phoneIcon}><PhoneIcon /></span>
              {SITE.phone}
            </a>
            <p className={styles.hours}>
              <span>{f.hours1}</span>
              <span>{f.hours2}</span>
            </p>
            <p className={styles.serving}>
              <span>{f.serving}</span>
              {f.areas.map(([label, href], i) => (
                <span key={href}>{i > 0 && <span aria-hidden="true"> · </span>}<a href={L(href)}>{label}</a></span>
              ))}
            </p>
            <div className={styles.mapCard}>
              <iframe className={styles.map} src={locale === 'es' ? `${MAP_EMBED}&hl=es` : MAP_EMBED} title={f.mapTitle} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
              <div className={styles.locCard}>
                <span className={styles.pin}><PinIcon /></span>
                <div className={styles.locText}>
                  <span className={styles.locEyebrow}>{f.location}</span>
                  <span className={styles.locAddr}>{LOCATION.street}<br />{LOCATION.city}, {LOCATION.region} {LOCATION.postalCode}</span>
                  <a href={MAP_LINK} target="_blank" rel="noopener noreferrer" className={styles.locDir}>{f.directions} <ExtIcon /></a>
                </div>
                <a href={MAP_LINK} target="_blank" rel="noopener noreferrer" className={styles.openMaps}><NavIcon /> {f.openMaps}</a>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.bottom} data-animate="fade" data-delay="200">
          <span className={styles.copy}>
            <span>© {new Date().getFullYear()} {f.rights}</span>
            <span className={styles.madeWith}>{f.madeWith} <HeartIcon /> {locale === 'es' ? 'amor' : 'love'}</span>
          </span>
          <span className={styles.legal}>
            <a href={L('/terms-conditions-page')}>{f.terms}</a>
            <a href={L('/privacy-policy-page')}>{f.privacy}</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
