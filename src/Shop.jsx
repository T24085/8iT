import { useState } from 'react';
import { SiteHeader } from './SiteHeader.jsx';
import './shop.css';
import './shop-collection.css';

const checkoutUrl = 'https://8it.printful.me/product/team-8it-logo-cap';
const assetRoot = `${import.meta.env.BASE_URL}assets/shop/`;
const logoUrl = `${import.meta.env.BASE_URL}assets/players-hq/8it-logo.png`;
const squadMerch = [
  { name: 'HellaTurtlz', image: 'hoodie-hellaturlz.png', backImage: 'hoodie-hellaturlz-back.png', url: 'https://8it.printful.me/product/8it-hellaturtlz-unisex-eco-raglan-hoodie' },
  { name: 'Ghosted', image: 'hoodie-ghosted.png', backImage: 'hoodie-ghosted-back.png', url: 'https://8it.printful.me/product/8it-ghosted-unisex-eco-raglan-hoodie' },
  { name: 'Zixxy', image: 'hoodie-zixxy.png', backImage: 'hoodie-zixxy-back.png', url: 'https://8it.printful.me/product/8it-zixxy-unisex-eco-raglan-hoodie' },
  { name: 'Titan101', image: 'hoodie-titan101.png', backImage: 'hoodie-titan101-back.png', url: 'https://8it.printful.me/product/8it-titan101-unisex-eco-raglan-hoodie' },
  { name: 'Ghettobird', image: 'hoodie-ghettobird.png', backImage: 'hoodie-ghettobird-back.png', url: 'https://8it.printful.me/product/8it-ghettobird-unisex-eco-raglan-hoodie' },
  { name: 'HanoSandy', image: 'hoodie-hanosandy.png', backImage: 'hoodie-hanosandy-back.png', url: 'https://8it.printful.me/product/unisex-eco-raglan-hoodie-6aba7af0199e7' },
  { name: 'PandaMonium', image: 'hoodie-pandamonium.png', backImage: 'hoodie-pandamonium-back.png', url: 'https://8it.printful.me/product/unisex-eco-raglan-hoodie' },
];
const views = [
  { label: 'Front', file: 'team-8it-logo-cap-front.jpg', alt: 'Front view of the black Team 8iT cap with a red embroidered logo' },
  { label: 'Angled', file: 'team-8it-logo-cap-back.jpg', alt: 'Angled view of the 8iT cap showing its embroidered logo and mesh side' },
  { label: 'Rear', file: 'team-8it-logo-cap-side.jpg', alt: 'Rear view of the 8iT cap showing its mesh back and adjustable closure' },
];

function Brand() {
  return <a className="store-brand" href="./" aria-label="8iT home"><img src={logoUrl} alt="" /><span>OFFICIAL SHOP</span></a>;
}

function BuyLink({ children, className = '' }) {
  return <a className={`store-button ${className}`} href={checkoutUrl} target="_blank" rel="noopener noreferrer">{children} <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" /></a>;
}

export function Shop() {
  const [viewIndex, setViewIndex] = useState(0);
  const [merchViews, setMerchViews] = useState({});
  const active = views[viewIndex];

  return (
    <div className="store-page">
      <SiteHeader page="shop" />
      <main>
        <section className="store-hero" aria-labelledby="store-hero-title">
          <div className="store-hero__copy"><p className="store-eyebrow">8iT FIELD EQUIPMENT / OFFICIAL</p><h1 id="store-hero-title">REP THE<br /><em>TEAM.</em></h1><p className="store-hero__lead">Official 8iT gear for the LAN floor, the road home, and every round in between.</p><a className="store-button" href="#collection">SHOP THE SQUAD DROP <i className="fa-solid fa-arrow-down" aria-hidden="true" /></a><p className="store-hero__index">CAPS + SQUAD HOODIES / OFFICIAL MERCH</p></div>
          <div className="store-hero__visual"><span className="store-hero__outline" aria-hidden="true">8iT</span><img src={`${assetRoot}${views[0].file}`} alt={views[0].alt} fetchPriority="high" /><span className="store-hero__tag">TEAM 8iT<br />LOGO CAP</span></div>
        </section>
        <div className="store-ticker" aria-label="Shop highlights"><span>OFFICIAL TEAM GEAR</span><span>EMBROIDERED 8iT MARK</span><span>ONE SIZE / ADJUSTABLE</span><span>BLACK + RED</span></div>
        <section className="store-collection" id="collection" aria-labelledby="store-collection-title">
          <div className="store-section-heading"><div><p className="store-eyebrow">THE SQUAD DROP / 007</p><h2 id="store-collection-title">GEAR UP.<br /><em>REP 8iT.</em></h2></div><p>Shop the official roster hoodies and team cap. Pick your size and complete checkout securely through the 8iT Printful store.</p></div>
          <div className="store-collection__grid">
            {squadMerch.map((item, index) => (
              <article className="store-merch-card" key={item.name}>
                <div className={`store-merch-card__image${item.name === 'PandaMonium' && merchViews[item.name] === 'back' ? ' store-merch-card__image--white-mockup' : ''}`}>
                  <img className={item.name === 'PandaMonium' && merchViews[item.name] === 'back' ? 'is-white-mockup' : ''} src={`${assetRoot}catalog/${merchViews[item.name] === 'back' ? item.backImage : item.image}`} alt={`${merchViews[item.name] === 'back' ? 'Back' : 'Front'} of the black ${item.name} 8iT eco raglan hoodie`} loading="lazy" />
                  <span>0{index + 1} / SQUAD</span>
                  <div className="store-merch-card__view-toggle" role="group" aria-label={`${item.name} hoodie preview`}>
                    <button type="button" aria-pressed={merchViews[item.name] !== 'back'} onClick={() => setMerchViews((current) => ({ ...current, [item.name]: 'front' }))}>FRONT</button>
                    <button type="button" aria-pressed={merchViews[item.name] === 'back'} onClick={() => setMerchViews((current) => ({ ...current, [item.name]: 'back' }))}>BACK</button>
                  </div>
                </div>
                <div className="store-merch-card__details"><div><p>8iT / SQUAD HOODIE</p><h3>{item.name}</h3></div><strong>FROM $55.50</strong></div>
                <a className="store-merch-card__link" href={item.url} target="_blank" rel="noopener noreferrer">CHOOSE SIZE + SHOP <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" /></a>
              </article>
            ))}
          </div>
          <p className="store-collection__note">Hoodie prices start at $55.50; final price may vary by size. Printful handles size selection, shipping, taxes, and payment at checkout.</p>
        </section>
        <section className="store-product" id="product" aria-labelledby="store-product-title">
          <div className="store-section-heading"><div><p className="store-eyebrow">THE TEAM CAP / 001</p><h2 id="store-product-title">TEAM 8iT<br /><em>LOGO CAP.</em></h2></div><p>The official embroidered 8iT cap. See all three product views, then choose quantity and check out through our Printful store.</p></div>
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
        <section className="store-lastcall" aria-label="Shop official 8iT cap"><img className="store-lastcall__logo" src={logoUrl} alt="" loading="lazy" /><p>READY TO REP THE SQUAD?</p><h2>PUT 8iT<br />ON THE MAP.</h2><BuyLink>GET THE OFFICIAL CAP</BuyLink><small>Checkout opens on Printful in a new tab.</small></section>
      </main>
      <footer className="store-footer"><Brand /><p>8iT / COLORADO / PLAY · IMPROVE · DOMINATE</p><div><a href="./">BACK TO TEAM SITE</a><a href={checkoutUrl} target="_blank" rel="noopener noreferrer">PRINTFUL PRODUCT <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" /></a></div></footer>
    </div>
  );
}
