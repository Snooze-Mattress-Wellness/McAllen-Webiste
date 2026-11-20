/* The shared local and offer sections of a brand page (the package's "snz-local" markup, styled by the brand's
   snooze-*-overrides.css): Try it in {City}, the promo slot, Why Buy at Snooze, and the local FAQ. Their words come
   from the brand config (copy), the store's location config (facts, links, FAQ) and the offers. */
import { Fragment } from 'react';
import type { AlwaysOnOffer, BrandConfig, BrandLocation, FaqEntry, Promotion, Segment } from '@/lib/brand-pages/types';
import { answerSegments, townSegments } from '@/lib/brand-pages/faq';
import { promoLabel } from '@/lib/brand-pages/promo';

/** Text with links in it. */
export function Segments({ items }: { items: Segment[] }) {
  return <>{items.map((x, i) => (typeof x === 'string' ? <Fragment key={i}>{x}</Fragment> : <a key={i} href={x.href}>{x.text}</a>))}</>;
}

type LocalProps = { brand: BrandConfig; location: BrandLocation };

/** Try {Brand} in {City}: the visit buttons and the store card. */
export function Visit({ brand, location: l }: LocalProps) {
  return (
    <section className="snz-local snz-visit" id="visit">
      <div className="snz-inner">
        <div>
          <h2>{brand.copy.visit_heading(l)}</h2>
          <p>{brand.copy.plain_answer(l)}</p>
          {brand.copy.visit_paragraphs(l).map((p) => <p key={p}>{p}</p>)}
          <div className="snz-btns">
            <a className="snz-btn snz-btn--orange" href={l.links.booking}>Book Free Dream Mapping</a>
            <a className="snz-btn snz-btn--line" href={l.links.dream_mapping}>Learn About Dream Mapping</a>
            <a className="snz-btn snz-btn--line" href={l.maps_url} rel="noopener">Get Directions</a>
          </div>
        </div>
        <div className="snz-store">
          <dl>
            <dt>Visit</dt>
            <dd>{l.address_line1}<br />{l.address_line2}</dd>
            <dt>Hours</dt>
            <dd>{l.hours_lines.map((line, i) => <Fragment key={line}>{i > 0 && <br />}{line}</Fragment>)}</dd>
            <dt>Call</dt>
            <dd>
              <a className="tel" href={`tel:${l.phone_e164}`}>{l.phone_display}</a>
            </dd>
            {l.nearby.length > 0 && (
              <>
                <dt>Serving</dt>
                <dd><Segments items={townSegments(l.nearby)} /></dd>
              </>
            )}
          </dl>
          <p className="snz-fine">{brand.copy.floor_note}</p>
        </div>
      </div>
    </section>
  );
}

/** The promo slot: one block per live promotion (the image from the block's image key); nothing at all (no box, no
    spacing) when none is live. */
export function Promo({ brand, location: l, promos, img }: LocalProps & { promos: readonly Promotion[]; img: string }) {
  if (!promos.length) return null;
  return (
    <div className="snz-promo-slot">
      {promos.map((b) => {
        const pic = b.image ? brand.images[b.image] : undefined;
        return (
          <section key={b.block} className="snz-local snz-promo" aria-label={`${b.vendor} ${b.event} offers`} data-promo-id={b.block}>
            <div className="snz-inner">
              <div>
                <p className="snz-event">{promoLabel(b)}</p>
                <h2>{b.headline}</h2>
                {b.items.length > 0 && <ul>{b.items.map((i, k) => <li key={k}>{i.text}</li>)}</ul>}
                <div className="snz-btns">
                  <a className="snz-btn snz-btn--orange" href={l.links.booking}>Book Free Dream Mapping</a>
                </div>
                {b.fine_print ? <p className="snz-fine">{b.fine_print}</p> : null}
              </div>
              {pic && <img src={`${img}${pic.file}`} width={pic.w} height={pic.h} loading="lazy" alt={pic.alt} />}
            </div>
          </section>
        );
      })}
    </div>
  );
}

/** Why Buy {Brand} at Snooze: the heading, lead and buttons always; the offer tiles when there are offers. */
export function WhyBuy({ brand, location: l, tiles }: LocalProps & { tiles: readonly AlwaysOnOffer[] }) {
  return (
    <section className="snz-local snz-why">
      <div className="snz-inner">
        <h2>{brand.copy.why_heading(l)}</h2>
        <p className="lead">{brand.copy.why_lead}</p>
        {tiles.length > 0 && (
          <div className="snz-tiles">
            {tiles.map((o) => (
              <div key={o.id || o.title} className="snz-tile">
                <h3>{o.title}</h3>
                {/* a line break in the offer text is a line break on the page */}
                <p>{o.body.split('\n').map((line, i) => <Fragment key={i}>{i > 0 && <br />}{line}</Fragment>)}</p>
                {o.fine_print ? <p className="snz-fine">{o.fine_print}</p> : null}
              </div>
            ))}
          </div>
        )}
        <div className="snz-btns">
          <a className="snz-btn snz-btn--orange" href={l.links.booking}>Book Free Dream Mapping</a>
          <a className="snz-btn snz-btn--line" href={l.links.financing}>Learn About Financing</a>
        </div>
      </div>
    </section>
  );
}

/** The FAQ accordion (the first answer starts open). The FAQPage JSON-LD is built from the same list. */
export function Faq({ brand, location: l, faq }: LocalProps & { faq: readonly FaqEntry[] }) {
  return (
    <section className="snz-local snz-faq">
      <div className="snz-inner">
        <h2>{brand.copy.faq_heading(l)}</h2>
        {faq.map((f, i) => (
          <details key={f.question} open={i === 0}>
            <summary>{f.question}</summary>
            <p><Segments items={answerSegments(f)} /></p>
          </details>
        ))}
      </div>
    </section>
  );
}
