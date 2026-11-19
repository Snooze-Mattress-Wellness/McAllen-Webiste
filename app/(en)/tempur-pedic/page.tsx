// Tempur-Pedic brand page (/tempur-pedic): the Tempur-Pedic dealer brand-page kit as prepared for Snooze (package
// "snooze-tempur-pedic-brand-page" v2.1, mcallen.html, received November 20, 2026). Hand-written page in the (en)
// route group, so it renders inside the English header, ticker and footer. The markup is the package's
// <div class="tempur-wrapper"> ported to JSX, text verbatim; the images, stylesheets and slider script live in
// public/brands/tempur-pedic/. English only.
// Store facts (address, hours, phone, the tel: and Google Maps links, the nearby towns) and the FAQ come from the site's
// location data (lib/location.ts via lib/tempur-pedic.ts), not from the package's copy of them.
import { Fragment } from 'react';
import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import { LOCATION } from '@/lib/location';
import { DREAM_MAPPING_PATH, addressLines, faqItems, isPromoLive, nearbyTowns, townSegments, type Segment } from '@/lib/tempur-pedic';
import TempurCarousels from '@/components/tempur-pedic/TempurCarousels';

/* The page is static, regenerated at most hourly (ISR), so the dated promotion block drops off on its own within about an
   hour of its end (lib/tempur-pedic.ts PROMO_END) without a redeploy. */
export const revalidate = 3600;

/* The vendor sections are set in Montserrat ("montserrat", helvetica, arial in the vendor CSS). The site loads it nowhere
   else, so it is added here the way the layouts add Poppins: next/font/google, self-hosted, font-display: swap. next/font
   names the face "Montserrat", which the vendor's lowercase "montserrat" matches (font-family names are case-insensitive).
   One variable file covers every weight the CSS uses (300–700). Not preloaded: a font preload in <head> holds rendering
   on this site (the Lighthouse slow-mode stall). */
const montserrat = Montserrat({ subsets: ['latin'], display: 'swap', preload: false, variable: '--font-montserrat' });

/* The page's stylesheets, in the package's order, on this route only (React puts them in <head>). Every selector in them
   is scoped to .tempur-wrapper: swiper-bundle.min.css was prefixed for this site, the other two came scoped. */
const CSS = '/brands/tempur-pedic/css';
const STYLESHEETS = [`${CSS}/swiper-bundle.min.css`, `${CSS}/tempur-pedic.scoped.css`, `${CSS}/snooze-tempur-overrides.css`];

/** Text with links in it (lib/tempur-pedic.ts Segment[]). */
function Segments({ items }: { items: Segment[] }) {
  return <>{items.map((x, i) => (typeof x === 'string' ? <Fragment key={i}>{x}</Fragment> : <a key={i} href={x.href}>{x.text}</a>))}</>;
}

export const metadata: Metadata = {
  title: 'Tempur-Pedic Mattresses in McAllen, TX | Snooze Mattress',
  description: 'Try Tempur-Pedic Adapt, Breeze and smart adjustable bases at Snooze Mattress in McAllen. Get a free Dream Mapping fitting to find the right fit for your body.',
  // the site's tab icon (the converted pages carry it in their head; without it the browser asks for /favicon.ico, a 404)
  icons: { icon: '/assets/filesafe/qR8peonBlnjGI3ZuLHQP/media/695b9e7d17768458ae206a19.png' },
};

export default function TempurPedicPage() {
  const L = LOCATION;
  const promoLive = isPromoLive(Date.now());
  const [street, cityLine] = addressLines(L);
  const faq = faqItems(L);
  return (
    <>
    {STYLESHEETS.map((href) => <link key={href} rel="stylesheet" href={href} precedence="tempur-pedic" />)}
    {/* the hero background (CSS) for each layout, fetched early as in the package's <head> */}
    <link rel="preload" as="image" href="/brands/tempur-pedic/img/bg_header.webp" media="(min-width: 1024px)" />
    <link rel="preload" as="image" href="/brands/tempur-pedic/img/bg_mobile_header.webp" media="(max-width: 1023px)" />
    <div className={`tempur-wrapper ${montserrat.variable}`}>
      <section className="header">
        <div className="header__inner">
          <div className="header__content-container">
            <img src="/brands/tempur-pedic/img/logo.svg" width="150" alt="Tempur-Pedic" />
            <h1 className="snz-h1">Tempur-Pedic Mattresses in McAllen, TX</h1>
            <h2 className="header__headline">Searching for better sleep?</h2>
            <p>Tempur-Pedic<sup>®</sup> earns its unmatched reputation and accolades with a single goal in mind—create a sleep experience like no other. If something keeps you from enjoying your best sleep, Tempur-Pedic<sup>®</sup> has a solution.</p>
            {/* the package's hero button, and the site's Dream Mapping page beside it (same vendor button style) */}
            <div className="snz-hero-btns">
              <a href="#visit" className="btn btn--gray">Try Tempur-Pedic<sup>®</sup> in McAllen</a>
              <a href={DREAM_MAPPING_PATH} className="btn btn--gray">Learn About Dream Mapping</a>
            </div>
          </div>
        </div>
      </section>
      {/* ===== Local: Try it in McAllen ===== */}
      <section className="snz-local snz-visit" id="visit">
        <div className="snz-inner">
          <div>
            <h2>Try Tempur-Pedic in McAllen</h2>
            <p>Reading about TEMPUR-Material is one thing. Feeling how it supports your body is another. Visit Snooze Mattress in McAllen to lie down on Tempur-Pedic mattresses and adjustable bases, and start with a free Dream Mapping fitting.</p>
            <p>Dream Mapping, our pressure mapping technology, shows where your body needs support. Your Sleep Coach then helps you find the Tempur-Pedic that fits how you sleep, whether that's the cooling Breeze collection or the pressure-relieving Adapt collection.</p>
            <div className="snz-btns">
              <a className="snz-btn snz-btn--orange" href="/booking">Book Free Dream Mapping</a>
              <a className="snz-btn snz-btn--line" href={DREAM_MAPPING_PATH}>Learn About Dream Mapping</a>
              <a className="snz-btn snz-btn--line" href={L.mapLink} rel="noopener">Get Directions</a>
            </div>
          </div>
          <div className="snz-store">
            <dl>
              <dt>Visit</dt>
              <dd>{street}<br />{cityLine}</dd>
              <dt>Hours</dt>
              <dd>{L.hours.en.map((line, i) => <Fragment key={line}>{i > 0 && <br />}{line}</Fragment>)}</dd>
              <dt>Call</dt>
              <dd>
                <a className="tel" href={L.phoneHref}>{L.phone}</a>
              </dd>
              {nearbyTowns(L).length > 0 && (
                <>
                  <dt>Serving</dt>
                  <dd><Segments items={townSegments(L)} /></dd>
                </>
              )}
            </dl>
            <p className="snz-fine">Floor models vary. Call ahead to check which Tempur-Pedic models are on display.</p>
          </div>
        </div>
      </section>
      {/* ===== PROMO SLOT: the dated vendor promotion (offers only), verbatim from the package, shown through December 1,
          2026 23:59 America/Chicago (checked on the server); after that the slot renders nothing ===== */}
      {promoLive && (
        <div className="snz-promo-slot">
          <section className="snz-local snz-promo" aria-label="Tempur-Pedic Black Friday Sale offers">
            <div className="snz-inner">
              <div>
                <p className="snz-event">Black Friday Sale · Through December 1</p>
                <h2>Save Up to $500 on Tempur-Pedic Smart Base Sets</h2>
                <ul>
                  <li>$300 off Tempur-LuxeAdapt, ProBreeze, LuxeBreeze and ActiveBreeze</li>
                  <li>$600 off Tempur-LuxeBreeze Split Head King</li>
                  <li>$200 off Tempur-Adapt and ProAdapt</li>
                  <li>$200 off Tempur-Pedic smart bases (TEMPUR-Ergo Smart and ProSmart)</li>
                  <li>$100 off TEMPUR-Ergo</li>
                  <li>$25 off Tempur-Adapt and Breeze pillows</li>
                </ul>
                <div className="snz-btns">
                  <a className="snz-btn snz-btn--orange" href="/booking">Book Free Dream Mapping</a>
                </div>
                <p className="snz-fine">Offers valid November 3 – December 1, 2026 on the models named. See store for details.</p>
              </div>
              <img src="/brands/tempur-pedic/img/base.webp" width="1592" height="948" loading="lazy" alt="TEMPUR-Ergo ProSmart adjustable base" />
            </div>
          </section>
        </div>
      )}
      <div className="gradient-container">
        <section className="rtbs">
          <div className="rtbs__inner">
            <h2>Solutions for Your Sleep Problems</h2>
            <div className="swiper">
              <div className="swiper-wrapper">
                <div className="swiper-slide aches">
                  <div className="image">
                    <img src="/brands/tempur-pedic/img/aches_image.webp" width="888" height="658" loading="lazy" alt="Couple sleeping comfortably on a Tempur-Pedic mattress" />
                  </div>
                  <div className="content-container">
                    <h3>Aches &amp; Pains</h3>
                    <p>Tempur-Pedic<sup>®</sup> mattresses are made with one-of-a-kind, infinitely adaptable TEMPUR-Material<sup>®</sup> that provides exceptional support and pressure relief to help reduce aches and pains.</p>
                  </div>
                </div>
                <div className="swiper-slide hot">
                  <div className="image">
                    <img src="/brands/tempur-pedic/img/hot_image.webp" width="658" height="654" loading="lazy" alt="TEMPUR-Breeze cooling mattress that feels up to 10 degrees cooler" />
                  </div>
                  <div className="content-container">
                    <h3>Hot Sleep</h3>
                    <p>TEMPUR-Breeze<sup>®</sup> mattresses with all-night cooling technology are designed to give you a cool and comfortable sleep experience every single&nbsp;night.</p>
                  </div>
                </div>
                <div className="swiper-slide snore">
                  <div className="image">
                    <img src="/brands/tempur-pedic/img/snore_image.webp" width="888" height="658" loading="lazy" alt="Couple sleeping on a TEMPUR-Ergo Smart adjustable base with Snore Response" />
                  </div>
                  <div className="content-container">
                    <h3>Snoring</h3>
                    <p>Innovative Snore Response™ technology in TEMPUR-Ergo<sup>®</sup> Smart adjustable bases senses snoring and gently raises your head to a position that may reduce it** to support more restful, uninterrupted sleep. TEMPUR-Ergo<sup>®</sup> Smart Base powered by Sleeptracker-AI<sup>®</sup>.</p>
                  </div>
                </div>
                <div className="swiper-slide restlessness">
                  <div className="image">
                    <img src="/brands/tempur-pedic/img/restlessness_image.webp" width="888" height="658" loading="lazy" alt="Woman resting on a TEMPUR-Ergo ProSmart adjustable base" />
                  </div>
                  <div className="content-container">
                    <h3>Restlessness</h3>
                    <p>The TEMPUR-Ergo<sup>®</sup> ProSmart<sup>®</sup> adjustable base helps calm your mind and body with soothing meditations from the exclusive SoundScape<sup>®</sup> Mode so you can drift off to sleep instead of lying anxiously awake. TEMPUR-Ergo<sup>®</sup> ProSmart<sup>®</sup> Base powered by Sleeptracker-AI<sup>®</sup>.</p>
                  </div>
                </div>
              </div>
              <div className="swiper-pagination"></div>
            </div>
          </div>
        </section>
        <section className="adapt product-container">
          <div className="product-container__inner product-container__inner--alt">
            <div className="adapt__image">
              <img src="/brands/tempur-pedic/img/adapt_stack.webp" width="1002" height="793" loading="lazy" alt="Stack of three TEMPUR-Adapt Collection mattresses" />
            </div>
            <div className="product-container__content-container">
              <h2>Adapt<sup>®</sup> Collection</h2>
              <h3>Designed for aches and pains relief.</h3>
              <p>The TEMPUR-Adapt<sup>®</sup> collection features the latest advancements in the one-of-a-kind, infinitely adaptable, and body-conforming TEMPUR-Material<sup>®</sup>—for exceptional pressure relief to reduce aches and pains and get your best night’s sleep.</p>
              <ul>
                <li>Made with TEMPUR-Material<sup>®</sup></li>
                <li>Pressure Relief</li>
                <li>Motion Cancellation</li>
              </ul>
              <div className="product-container__btn-container">
                <a href="/memory-foam-mattresses" className="btn btn--blue">Shop Memory Foam Mattresses</a>
              </div>
            </div>
          </div>
        </section>
        <section className="breeze product-container">
          <div className="product-container__inner">
            <div className="breeze__image">
              <img src="/brands/tempur-pedic/img/breeze_stack.webp" width="1328" height="810" loading="lazy" alt="Stack of three TEMPUR-Breeze Collection mattresses" />
            </div>
            <div className="product-container__content-container">
              <h2>Breeze<sup>®</sup> Collection</h2>
              <h3>Feels up to 10 degrees cooler.*</h3>
              <p>Featuring the latest in cooling technologies, the TEMPUR-Breeze<sup>®</sup> collection delivers truly cooler sleep with our exclusive Pure Cool<sup>®</sup> material that can help pull heat away from your body so you sleep cool all night long.</p>
              <ul>
                <li>All-Night Cooling Technology</li>
                <li>Made with TEMPUR-Material<sup>®</sup></li>
                <li>Pressure Relief</li>
                <li>Motion Cancellation</li>
              </ul>
              <div className="product-container__btn-container">
                <a href="/cooling-mattresses" className="btn btn--blue">Shop Cooling Mattresses</a>
              </div>
            </div>
          </div>
        </section>
        <section className="split-king product-container">
          <div className="product-container__inner product-container__inner--alt">
            <div className="split-king__image">
              <img src="/brands/tempur-pedic/img/split_king.webp" width="1002" height="793" loading="lazy" alt="Tempur-Pedic Split Head King mattress on an adjustable base" />
            </div>
            <div className="product-container__content-container">
              <h2 className="split">Split Head King Sleep System</h2>
              <h3>The perfect mattress for partners.</h3>
              <p>Featuring the latest cooling technology, the Tempur-Pedic<sup>®</sup> Split Head King provides separate features at the top of the bed, including lumbar support, head positioning, and Snore Response™,** while maintaining a seamless sleep surface at the bottom.</p>
              <ul>
                <li>Automatic Snore Response™**</li>
                <li>Sleep Coaching Powered by Sleeptracker-AI<sup>®</sup></li>
                <li>Massage Features</li>
                <li>Ergonomic Support</li>
              </ul>
              <div className="product-container__btn-container">
                <a href="/adjustable-mattress-bases" className="btn btn--blue">Shop Adjustable Bases</a>
              </div>
            </div>
          </div>
        </section>
        <section className="active-breeze product-container">
          <div className="product-container__inner">
            <div className="breeze__image">
              <img src="/brands/tempur-pedic/img/mattress_stack_breeze.webp" width="1328" height="810" loading="lazy" alt="TEMPUR-ActiveBreeze smart bed mattresses" />
            </div>
            <div className="product-container__content-container">
              <h2>TEMPUR-ActiveBreeze<sup>®</sup></h2>
              <h3>Personalized climate control.</h3>
              <p>The TEMPUR-ActiveBreeze<sup>®</sup> adjustable smart bed features dual-zone climate control that delivers cooling or cozy comfort on each side of the bed. This mattress is designed for couples with different sleep climate needs and features the same legendary pressure-relieving support needed for all-night comfort.</p>
              <div className="product-container__btn-container">
                <a href="/booking" className="btn btn--blue">Try ActiveBreeze<sup>®</sup> in Store</a>
              </div>
            </div>
          </div>
        </section>
        <section className="bases product-container">
          <div className="product-container__inner">
            <div className="bases__image">
              <img src="/brands/tempur-pedic/img/base.webp" width="1592" height="948" loading="lazy" alt="TEMPUR-Ergo ProSmart adjustable base with Snore Response, Wave Form Massage and SoundScape Mode" />
            </div>
            <div className="product-container__content-container">
              <h2>Tempur-Pedic<sup>®</sup> Power&nbsp;Bases</h2>
              <h3>A personalized sleep experience.</h3>
              <p>Tempur-Pedic<sup>®</sup> power bases offer customizable sleep positions with head and foot elevation. Adjust your bed with ease for ultimate comfort.</p>
              <div className="product-container__btn-container">
                <a href="/adjustable-mattress-bases" className="btn btn--blue">Shop Adjustable Bases</a>
              </div>
            </div>
          </div>
        </section>
        <section className="flat-foundations product-container">
          <div className="product-container__inner product-container__inner--alt">
            <div className="flat-foundations__image">
              <img src="/brands/tempur-pedic/img/flat-foundations.webp" width="1495" height="890" loading="lazy" alt="TEMPUR-Flat Foundations in 2, 5 and 9 inch heights" />
            </div>
            <div className="product-container__content-container">
              <h2>TEMPUR-Flat<sup>®</sup> Foundations</h2>
              <h3>Strong and durable platforms.</h3>
              <p>Engineered to support any Tempur-Pedic<sup>®</sup> mattress with a perfectly flat and solid surface.</p>
              <div className="product-container__btn-container">
                <a href="/contact-us" className="btn btn--blue">Ask a Sleep Coach</a>
              </div>
            </div>
          </div>
        </section>
        <section className="pillows product-container">
          <div className="product-container__inner">
            <div className="pillows__image">
              <img src="/brands/tempur-pedic/img/pillow-stack.webp" width="547" height="456" loading="lazy" alt="Stack of Tempur-Pedic pillows" />
            </div>
            <div className="product-container__content-container">
              <h2>Tempur-Pedic<sup>®</sup> Pillows</h2>
              <h3>Complete your premium sleep system with new pillows.</h3>
              <p>Premium Tempur-Pedic<sup>®</sup> pillows are made with the same pressure-relieving and cooling materials featured in Tempur-Pedic<sup>®</sup> mattresses. They are designed to reduce aches and pains and keep you cool for your best night’s sleep night after night.</p>
              <div className="product-container__btn-container">
                <a href="/pillows" className="btn btn--blue">Shop Pillows</a>
              </div>
            </div>
          </div>
        </section>
      </div>
      <div className="gradient-container gradient-container--alt">
        {/* Vendor-supplied Tempur-Pedic reviews. Do NOT add Review/AggregateRating schema: these are not Snooze Mattress customer reviews. */}
        <section className="testimonials">
          <div className="testimonials__inner">
            <div className="swiper">
              <div className="swiper-wrapper">
                <div className="swiper-slide">
                  <div className="inner">
                    <div className="stars">5 stars</div>
                    <h3>Amazing</h3>
                    <p>Our new Temperpedic Breeze is hands down, the best mattress I have ever slept in. I have insomnia but have slept every night since the bed arrived!!!</p>
                    <div className="customer">– Insomnia girl</div>
                  </div>
                </div>
                <div className="swiper-slide">
                  <div className="inner">
                    <div className="stars">5 stars</div>
                    <h3>Best mattress we have ever owned!!</h3>
                    <p>We are so incredibly happy with our purchase! I no longer wake up with neck or back pain anymore. I absolutely love how cool the mattress is too since I am a hot sleeper.</p>
                    <div className="customer">– Janeen</div>
                  </div>
                </div>
                <div className="swiper-slide">
                  <div className="inner">
                    <div className="stars">5 stars</div>
                    <h3>Why did I wait so long?</h3>
                    <p>BEST mattress I ever bought! Sleep better than I have in years! Add this with the power base's massage feature and I sleep so sound it's AMAZING! If it holds up as well as they say it does, this is probably the LAST mattress I will ever buy! THANKS GUYS</p>
                    <div className="customer">– Finally Happy</div>
                  </div>
                </div>
                <div className="swiper-slide">
                  <div className="inner">
                    <div className="stars">5 stars</div>
                    <h3>Best mattress ever</h3>
                    <p>The mattress changed my life! I'm so thankful! No more back pain or waking up in the middle of the night. Would recommend to everyone!</p>
                    <div className="customer">– Happy Customer</div>
                  </div>
                </div>
                <div className="swiper-slide">
                  <div className="inner">
                    <div className="stars">5 stars</div>
                    <h3>Amazing mattress!</h3>
                    <p>I just wish we would have bought it sooner. We are finally sleeping thought the night, no aches and pains in the morning. The most comfortable mattress I have ever used.</p>
                    <div className="customer">– Sapphireknitter</div>
                  </div>
                </div>
              </div>
              <div className="swiper-pagination"></div>
            </div>
            <div className="swiper-button-prev"></div>
            <div className="swiper-button-next"></div>
          </div>
        </section>
        <section className="why">
          <div className="why__inner">
            <div className="why__content-container">
              <div className="why__content-container-inner">
                <h2>Why <span style={{ whiteSpace: "nowrap" }}>Tempur-Pedic<sup>®</sup>?</span></h2>
                <p>Crafted to help you achieve the deeply comfortable, customizable rest you deserve, Tempur-Pedic<sup>®</sup> is sleep, perfected.</p>
              </div>
            </div>
          </div>
        </section>
        <section className="video">
          <div className="video__inner">
            <div className="video__container">
              <div className="embed-container">
                <div style={{ padding: "56.25% 0 0 0", position: "relative" }}>
                  <iframe src="https://player.vimeo.com/video/1221513005?h=1a1bbd899d&badge=0&autopause=0&player_id=0&app_id=58479" loading="lazy" frameBorder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share" referrerPolicy="strict-origin-when-cross-origin" style={{ position: "absolute", top: "0", left: "0", width: "100%", height: "100%" }} title="Why Tempur-Pedic video"></iframe>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      {/* ===== Why buy here: local heading and the always-on offer tiles, static ===== */}
      <section className="snz-local snz-why">
        <div className="snz-inner">
          <h2>Why Buy Tempur-Pedic at Snooze Mattress in McAllen</h2>
          <p className="lead">Tempur-Pedic makes great mattresses, but the right one still depends on your body. Skip the guesswork: get fitted first, then choose with confidence.</p>
          <div className="snz-tiles">
            <div className="snz-tile">
              <h3>Free Dream Mapping</h3>
              <p>Always free, no purchase needed. See where your body needs support before you choose.</p>
            </div>
            <div className="snz-tile">
              <h3>365-Night Sleep Guarantee</h3>
              <p>Sleep on it at home with our 365-Night Sleep Guarantee.</p>
              <p className="snz-fine">See store for details.</p>
            </div>
            <div className="snz-tile">
              <h3>Special Financing</h3>
              <p>0% interest for up to 60 months, no down payment.<br />No credit check options available.</p>
              <p className="snz-fine">0% interest with approved credit. No credit check options are offered separately. See store for details.</p>
            </div>
            <div className="snz-tile">
              <h3>HSA/FSA Accepted</h3>
              <p>Put your HSA or FSA dollars toward better sleep on eligible purchases.</p>
              <p className="snz-fine">Eligibility depends on your plan.</p>
            </div>
          </div>
          <div className="snz-btns">
            <a className="snz-btn snz-btn--orange" href="/booking">Book Free Dream Mapping</a>
            <a className="snz-btn snz-btn--line" href="/mattress-financing">Learn About Financing</a>
          </div>
        </div>
      </section>
      {/* ===== Local FAQ ===== */}
      <section className="snz-local snz-faq">
        <div className="snz-inner">
          <h2>Tempur-Pedic in McAllen: Common Questions</h2>
          {/* lib/tempur-pedic.ts faqItems: the same list the FAQPage JSON-LD is built from; the first answer starts open */}
          {faq.map((f, i) => (
            <details key={f.q} open={i === 0}>
              <summary>{f.q}</summary>
              <p><Segments items={f.a} /></p>
            </details>
          ))}
        </div>
      </section>
      <section className="disclaimers">
        <div className="disclaimers__inner">
          <p>*Based on average heat index increase of TEMPUR-LuxeBreeze<sup>®</sup> compared to TEMPUR-ProAdapt<sup>®</sup> models measured over an 8-hour period.</p>
          <p>**Bed raises once approximately 12 degrees in response to snoring. This may reduce snoring in otherwise healthy individuals who snore due to body positioning.</p>
          <p>Copyright 2026 Tempur-Pedic North America, LLC. All rights reserved.</p>
        </div>
      </section>
    </div>
    {/* the two sliders (the package's js/scripts.js, ported) */}
    <TempurCarousels />
    </>
  );
}
