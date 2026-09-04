import { useEffect, useMemo, useState } from 'react';
import './shop.css';

// Replace the art classes, copy, pricing, and availability here when the real merch is ready.
const merchDropAt = '2026-09-18T18:00:00-06:00';
const products = [
  { id: 'no-safe-tee', name: 'NO SAFE ROUNDS TEE', category: 'APPAREL', price: 32, badge: 'DROP 01', stock: '24 LEFT', detail: 'Heavyweight cotton // front hit // back callout', color: 'CRIMSON / BLACK', art: 'tee tee--crimson', sizes: ['S', 'M', 'L', 'XL', '2XL'] },
  { id: 'eight-bit-hoodie', name: '8iT SIGNAL HOODIE', category: 'APPAREL', price: 68, badge: 'CORE UNIFORM', stock: '12 LEFT', detail: 'Midweight fleece // oversized fit // embroidered mark', color: 'BLACK / RED', art: 'hoodie hoodie--black', sizes: ['S', 'M', 'L', 'XL', '2XL'] },
  { id: 'room-cap', name: 'THE ROOM CAP', category: 'HEADWEAR', price: 28, badge: 'LIMITED', stock: '08 LEFT', detail: 'Structured six-panel // flat 8iT embroidery', color: 'BLACK / CHROME', art: 'cap cap--chrome', sizes: ['OS'] },
  { id: 'lan-pass-lanyard', name: 'LAN PASS LANYARD', category: 'COLLECTIBLES', price: 14, badge: 'LANFEST 20', stock: '20 LEFT', detail: 'Event credential // 20th anniversary run', color: 'RED / BLACK', art: 'lanyard lanyard--red', sizes: ['OS'] },
  { id: 'desk-mat', name: 'NO SAFE DESK MAT', category: 'DESK LOADOUT', price: 36, badge: 'DESK LOADOUT', stock: '16 LEFT', detail: '900 × 400 mm // stitched edge // speed surface', color: 'BLACK / SIGNAL RED', art: 'mat mat--signal', sizes: ['OS'] },
  { id: 'squad-sticker-pack', name: 'SQUAD STICKER PACK', category: 'COLLECTIBLES', price: 9, badge: 'LOW STOCK', stock: '05 LEFT', detail: 'Eight vinyl marks // laptop armor // water resistant', color: 'MIXED SIGNALS', art: 'stickers stickers--mixed', sizes: ['OS'] },
];

const categories = ['ALL', 'APPAREL', 'HEADWEAR', 'DESK LOADOUT', 'COLLECTIBLES'];

function ArrowIcon({ direction = 'up-right' }) {
  return <i className={`fa-solid fa-arrow-${direction}`} aria-hidden="true" />;
}

function ShopMark() {
  return <a className="shop-mark" href="/" aria-label="Return to 8iT home">8iT<span>// SHOP</span></a>;
}

function DropCountdown() {
  const getRemaining = () => {
    const total = Math.max(0, new Date(merchDropAt).getTime() - Date.now());
    const seconds = Math.floor(total / 1000);
    return { days: Math.floor(seconds / 86400), hours: Math.floor((seconds % 86400) / 3600), minutes: Math.floor((seconds % 3600) / 60), seconds: seconds % 60 };
  };
  const [remaining, setRemaining] = useState(getRemaining);
  useEffect(() => { const timer = window.setInterval(() => setRemaining(getRemaining()), 1000); return () => window.clearInterval(timer); }, []);
  return <div className="shop-drop-countdown"><small>DROP 01 // TARGET WINDOW</small><strong>{String(remaining.days).padStart(2, '0')}<b>d</b> {String(remaining.hours).padStart(2, '0')}<b>h</b> {String(remaining.minutes).padStart(2, '0')}<b>m</b> {String(remaining.seconds).padStart(2, '0')}<b>s</b></strong></div>;
}

function ProductArt({ product }) {
  return (
    <div className={`shop-product-art ${product.art}`} aria-hidden="true">
      <span className="shop-product-art__ghost">8iT</span>
      <span className="shop-product-art__label">{product.category}</span>
      <span className="shop-product-art__mark">{product.art.startsWith('stickers') ? '✕ ✦ 8' : 'NO SAFE'}</span>
    </div>
  );
}

function ProductCard({ product, onQuickView, onAdd }) {
  return (
    <article className="shop-product-card" data-reveal>
      <button className="shop-product-card__visual" type="button" onClick={() => onQuickView(product)} aria-label={`Quick view ${product.name}`}>
        <ProductArt product={product} />
        <span className="shop-product-card__badge">{product.badge}</span><span className="shop-product-card__stock">{product.stock}</span>
        <span className="shop-product-card__quick">QUICK VIEW <ArrowIcon /></span>
      </button>
      <div className="shop-product-card__info">
        <div><p className="shop-product-card__category">{product.category}</p><h3>{product.name}</h3></div>
        <strong>${product.price}</strong>
      </div>
      <p className="shop-product-card__detail">{product.detail}</p>
      <button className="shop-add-button" type="button" onClick={() => onAdd(product, product.sizes[0])}>ADD TO LOADOUT <ArrowIcon /></button>
    </article>
  );
}

function CartDrawer({ cart, onClose, onRemove, onChangeQuantity }) {
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  return (
    <div className="shop-drawer-backdrop" role="presentation" onClick={onClose}>
      <aside className="shop-cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title" onClick={(event) => event.stopPropagation()}>
        <div className="shop-cart-drawer__head"><div><p className="shop-kicker">LOADOUT // READY</p><h2 id="cart-title">YOUR BAG</h2></div><button className="shop-icon-button" type="button" onClick={onClose} aria-label="Close cart"><i className="fa-solid fa-xmark" aria-hidden="true" /></button></div>
        {cart.length ? <div className="shop-cart-drawer__items">{cart.map((item) => <div className="shop-cart-item" key={`${item.product.id}-${item.size}`}><ProductArt product={item.product} /><div className="shop-cart-item__copy"><h3>{item.product.name}</h3><p>{item.size} // ${item.product.price}</p><div className="shop-cart-item__controls"><button type="button" onClick={() => onChangeQuantity(item, -1)} aria-label={`Remove one ${item.product.name}`}>−</button><span>{item.quantity}</span><button type="button" onClick={() => onChangeQuantity(item, 1)} aria-label={`Add one ${item.product.name}`}>+</button><button className="shop-cart-item__remove" type="button" onClick={() => onRemove(item)} aria-label={`Remove ${item.product.name}`}>REMOVE</button></div></div></div>)}</div> : <div className="shop-cart-empty"><span>∅</span><p>Your loadout is empty.<br />The drop is waiting.</p></div>}
        <div className="shop-cart-drawer__foot"><div><span>SUBTOTAL</span><strong>${subtotal}</strong></div><button className="shop-checkout-button" type="button" disabled>CHECKOUT // CONNECT STORE</button><p>Cart is ready for your Shopify, Stripe, or Tixr merch checkout.</p></div>
      </aside>
    </div>
  );
}

function QuickView({ product, onClose, onAdd }) {
  const [size, setSize] = useState(product.sizes[0]);
  return (
    <div className="shop-modal-backdrop" role="presentation" onClick={onClose}>
      <div className="shop-quick-view" role="dialog" aria-modal="true" aria-labelledby="quick-view-title" onClick={(event) => event.stopPropagation()}>
        <button className="shop-icon-button shop-quick-view__close" type="button" onClick={onClose} aria-label="Close product view"><i className="fa-solid fa-xmark" aria-hidden="true" /></button>
        <div className="shop-quick-view__art"><ProductArt product={product} /></div>
        <div className="shop-quick-view__copy"><p className="shop-kicker">{product.badge} // 8iT MERCH</p><h2 id="quick-view-title">{product.name}</h2><strong className="shop-quick-view__price">${product.price}</strong><p>{product.detail}. Built for the room, the road, and the next round.</p><p className="shop-size-label">SELECT LOADOUT SIZE</p><div className="shop-size-list">{product.sizes.map((option) => <button className={size === option ? 'is-selected' : ''} key={option} type="button" onClick={() => setSize(option)}>{option}</button>)}</div><button className="shop-quick-view__add" type="button" onClick={() => { onAdd(product, size); onClose(); }}>ADD TO LOADOUT <ArrowIcon /></button><p className="shop-quick-view__note">Placeholder product data — swap in real photos, inventory, and checkout when you are ready.</p></div>
      </div>
    </div>
  );
}

export function Shop() {
  const [category, setCategory] = useState('ALL');
  const [quickView, setQuickView] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  const visibleProducts = useMemo(() => category === 'ALL' ? products : products.filter((product) => product.category === category), [category]);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (product, size) => {
    setCart((current) => {
      const existing = current.find((item) => item.product.id === product.id && item.size === size);
      if (existing) return current.map((item) => item === existing ? { ...item, quantity: item.quantity + 1 } : item);
      return [...current, { product, size, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const removeFromCart = (itemToRemove) => setCart((current) => current.filter((item) => item !== itemToRemove));
  const changeQuantity = (itemToChange, amount) => setCart((current) => current.flatMap((item) => {
    if (item !== itemToChange) return [item];
    const quantity = item.quantity + amount;
    return quantity > 0 ? [{ ...item, quantity }] : [];
  }));

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll('[data-reveal]'));
    if (!nodes.length) return undefined;
    if (!('IntersectionObserver' in window)) { nodes.forEach((node) => node.classList.add('is-visible')); return undefined; }
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }), { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [category]);

  useEffect(() => {
    const onKeyDown = (event) => { if (event.key === 'Escape') { setQuickView(null); setCartOpen(false); } };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="shop-page">
      <header className="shop-header"><ShopMark /><nav aria-label="Shop navigation"><a href="/">HOME</a><a href="#drop">DROP 01</a><a href="#story">THE STORY</a></nav><button className="shop-cart-button" type="button" onClick={() => setCartOpen(true)}><i className="fa-solid fa-bag-shopping" aria-hidden="true" /> BAG <span>{String(cartCount).padStart(2, '0')}</span></button></header>

      <main>
        <section className="shop-hero" data-reveal="shop-hero"><div className="shop-hero__copy"><p className="shop-kicker">8iT // FIELD EQUIPMENT</p><h1>WEAR THE<br /><em>PRESSURE.</em></h1><p>Official 8iT gear for the room, the road, and the rounds nobody forgets. Drop 01 is built for EverLAN Colorado.</p><DropCountdown /><a className="shop-hero__cta" href="#drop">ENTER DROP 01 <ArrowIcon /></a></div><div className="shop-hero__art"><div className="shop-hero__stamp">NO<br />SAFE<br /><em>ROUNDS.</em></div><div className="shop-hero__product-card"><span>8iT / 001</span><strong>FIELD<br />UNIFORM</strong><small>COLORADO // 2026</small></div></div></section>

        <section className="shop-signal-strip" aria-label="Shop benefits"><span>LIMITED RUNS</span><span>BUILT FOR LAN</span><span>PACKED IN COLORADO</span><span>EVERY PURCHASE FUELS THE SQUAD</span></section>

        <section id="drop" className="shop-catalog"><div className="shop-catalog__head"><div><p className="shop-kicker">DROP 01 // FIELD EQUIPMENT</p><h2>THE LOADOUT<br /><em>STARTS HERE.</em></h2></div><p>These are starter placeholders so the shop has a shape. Replace the product data and artwork in <code>src/Shop.jsx</code> when the real merch is ready.</p></div><div className="shop-category-bar" aria-label="Product categories">{categories.map((item) => <button className={category === item ? 'is-active' : ''} type="button" key={item} onClick={() => setCategory(item)}>{item}</button>)}</div><div className="shop-product-grid">{visibleProducts.map((product, index) => <div key={product.id} style={{ '--reveal-delay': `${index * 70}ms` }}><ProductCard product={product} onQuickView={setQuickView} onAdd={addToCart} /></div>)}</div></section>

        <section id="story" className="shop-story" data-reveal><div className="shop-story__visual"><span>8iT</span><small>PLAY / IMPROVE / DOMINATE</small></div><div className="shop-story__copy"><p className="shop-kicker">THE UNIFORM IS A SIGNAL</p><h2>LOOK LIKE<br /><em>YOU MEAN IT.</em></h2><p>Start with the pieces that make the squad recognizable from across the room. Add the real photos, sizes, shipping rules, and launch date when your drop is locked.</p><div className="shop-trust-grid"><div><strong>01</strong><span>REAL PRODUCT<br />PHOTOS NEXT</span></div><div><strong>02</strong><span>SIZE GUIDE<br />READY TO ADD</span></div><div><strong>03</strong><span>CHECKOUT<br />READY TO CONNECT</span></div></div></div></section>

        <section className="shop-support"><div><p className="shop-kicker">BEFORE YOU DEPLOY THE DROP</p><h2>MAKE IT<br /><em>REAL.</em></h2></div><div className="shop-support__list"><article><i className="fa-solid fa-ruler-combined" aria-hidden="true" /><div><h3>SIZE IT ONCE</h3><p>Add measurements, fit notes, and a simple exchange policy before taking money.</p></div></article><article><i className="fa-solid fa-box" aria-hidden="true" /><div><h3>SHIP THE SIGNAL</h3><p>Choose the fulfillment path, shipping window, and whether LAN pickup is available.</p></div></article><article><i className="fa-solid fa-lock" aria-hidden="true" /><div><h3>CONNECT CHECKOUT</h3><p>Wire the cart to Shopify, Stripe, or the platform you choose when inventory is final.</p></div></article></div></section>
      </main>

      <footer className="shop-footer"><ShopMark /><p>8iT // EVERLAN COLORADO // FIELD EQUIPMENT</p><div><a href="/admin.html">CONTROL ROOM <ArrowIcon /></a><a href="/">BACK TO TEAM SITE <ArrowIcon /></a></div></footer>
      {quickView && <QuickView product={quickView} onClose={() => setQuickView(null)} onAdd={addToCart} />}
      {cartOpen && <CartDrawer cart={cart} onClose={() => setCartOpen(false)} onRemove={removeFromCart} onChangeQuantity={changeQuantity} />}
    </div>
  );
}
