import { useState } from 'react';
import './shop.css';

const checkoutUrl = 'https://8it.printful.me/product/team-8it-logo-cap';
const assetRoot = `${import.meta.env.BASE_URL}assets/shop/`;
const views = [
  { label: 'Front', file: 'team-8it-logo-cap-front.jpg', alt: 'Front view of the black Team 8iT cap with a red embroidered logo' },
  { label: 'Angled', file: 'team-8it-logo-cap-back.jpg', alt: 'Angled view of the 8iT cap showing its embroidered logo and mesh side' },
  { label: 'Rear', file: 'team-8it-logo-cap-side.jpg', alt: 'Rear view of the 8iT cap showing its mesh back and adjustable closure' },
];

function Brand() {
  return <a className="store-brand" href="./" aria-label="8iT home">8iT<span>OFFICIAL SHOP</span></a>;
}

function BuyLink({ children, className = '' }) {
  return <a className={`store-button ${className}`} href={checkoutUrl} target="_blank" rel="noopener noreferrer">{children} <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" /></a>;
}

export function Shop() {
  const [viewIndex, setViewIndex] = useState(0);
  const active = views[viewIndex];
  return (
    <div className="store-page">
      <header className="store-header">
        <Brand />
        <nav aria-label="Shop navigation"><a href="./">TEAM SITE</a><a href="#product">THE CAP</a><a href="#details">DETAILS</a></nav>
        <a className="store-header__cta" href="#product">SHOP THE DROP <i className="fa-solid fa-arrow-down" aria-hidden="true" /></a>
      </header>
      <main>
        <section className="store-hero" aria-labelledby="store-hero-title">
          <div className="store-hero__copy"><p className="store-eyebrow">8iT FIELD EQUIPMENT / 001</p><h1 id="store-hero-title">REP THE<br /><em>TEAM.</em></h1><p className="store-hero__lead">The official 8iT logo cap. Built for the LAN floor, the road home, and every round in between.</p><a className="store-button" href="#product">EXPLORE THE CAP <i className="fa-solid fa-arrow-down" aria-hidden="true" /></a><p className="store-hero__index">01 / OFFICIAL MERCH DROP</p></div>
          <div className="store-hero__visual"><span className="store-hero__outline" aria-hidden="true">8iT</span><img src={`${assetRoot}${views[0].file}`} alt={views[0].alt} fetchPriority="high" /><span className="store-hero__tag">TEAM 8iT<br />LOGO CAP</span></div>
        </section>
        <div className="store-ticker" aria-label="Shop highlights"><span>OFFICIAL TEAM GEAR</span><span>EMBROIDERED 8iT MARK</span><span>ONE SIZE / ADJUSTABLE</span><span>BLACK + RED</span></div>
        <section className="store-product" id="product" aria-labelledby="store-product-title">
          <div className="store-section-heading"><div><p className="store-eyebrow">THE FIRST DROP</p><h2 id="store-product-title">TEAM 8iT<br /><em>LOGO CAP.</em></h2></div><p>One real product. No mock inventory or mystery merch. Take a closer look before you buy.</p></div>
          <div className="store-product__layout">
            <div className="store-gallery">
              <div className="store-gallery__stage"><img src={`${assetRoot}${active.file}`} alt={active.alt} /><span>{String(viewIndex + 1).padStart(2, '0')} / {String(views.length).padStart(2, '0')}</span></div>
              <div className="store-gallery__views" role="group" aria-label="Cap views">{views.map((view, index) => <button type="button" key={view.label} className={viewIndex === index ? 'is-active' : ''} onClick={() => setViewIndex(index)} aria-label={`Show ${view.label.toLowerCase()} view`} aria-pressed={viewIndex === index}><img src={`${assetRoot}${view.file}`} alt="" /><span>{view.label}</span></button>)}</div>
            </div>
            <div className="store-product__info">
              <p className="store-product__id">8iT / HEADWEAR / 001</p><h3>WEAR YOUR<br />COLORS.</h3>
              <p className="store-product__description">A black, structured trucker cap with the red 8iT mark embroidered across the front. Mesh back, curved visor, and an adjustable snap closure.</p>
              <div className="store-product__price"><strong>$18.00</strong><span>Listed product price. Shipping and any taxes are calculated at checkout.</span></div>
              <dl className="store-specs"><div><dt>COLOR</dt><dd>Black / red embroidery</dd></div><div><dt>SIZE</dt><dd>One size, adjustable</dd></div><div><dt>FIT</dt><dd>Head circumference 21⅝″–23⅝″ (54.9–60 cm)</dd></div></dl>
              <BuyLink className="store-button--buy">BUY CAP · CONTINUE TO PRINTFUL</BuyLink>
              <p className="store-product__checkout-note"><i className="fa-solid fa-lock" aria-hidden="true" /> Browse here on 8iT. Purchasing opens Printful’s secure product page in a new tab to select quantity and check out. Current Quick Store shipping is US-only.</p>
            </div>
          </div>
        </section>
        <section className="store-details" id="details" aria-labelledby="store-details-title">
          <div className="store-details__intro"><p className="store-eyebrow">THE DETAILS</p><h2 id="store-details-title">BUILT FOR<br /><em>THE ROOM.</em></h2><p>The official team cap makes the 8iT mark unmistakable. A practical fit for long tournament days and the days after.</p></div>
          <div className="store-details__grid"><article><span>01 / STRUCTURE</span><h3>SIX-PANEL FIT</h3><p>Structured, mid-profile six-panel construction with a 3.5″ crown.</p></article><article><span>02 / COMFORT</span><h3>MESH BACK</h3><p>26% cotton and 74% polyester construction with breathable mesh panels.</p></article><article><span>03 / FINISH</span><h3>ADJUSTABLE</h3><p>Permacurv visor and plastic adjustable closure for a personalized fit.</p></article></div>
        </section>
        <section className="store-lastcall" aria-label="Shop official 8iT cap"><p>READY TO REP THE SQUAD?</p><h2>PUT 8iT<br />ON THE MAP.</h2><BuyLink>GET THE OFFICIAL CAP</BuyLink><small>Checkout opens on Printful in a new tab.</small></section>
      </main>
      <footer className="store-footer"><Brand /><p>8iT / COLORADO / PLAY · IMPROVE · DOMINATE</p><div><a href="./">BACK TO TEAM SITE</a><a href={checkoutUrl} target="_blank" rel="noopener noreferrer">PRINTFUL PRODUCT <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" /></a></div></footer>
    </div>
  );
}
