import { useEffect, useRef, useState } from 'react';
import { readAdminData } from './siteData.js';

const navigation = [
  ['TEAM', 'team'],
  ['STATS', 'stats'],
  ['MATCHES', 'matches'],
  ['HYPE REEL', 'hype'],
  ['BROADCAST', 'broadcast'],
  ['INTEL', 'intel'],
  ['COMMUNITY', 'community'],
  ['TICKETS', 'tickets'],
  ['SHOP', 'shop'],
];

function linkFor(page, destination) {
  if (destination === 'stats') return page === 'stats' ? '#overview' : './stats.html';
  if (destination === 'shop') return page === 'shop' ? '#collection' : './shop.html';
  return `${page === 'home' ? '' : './'}#${destination}`;
}

export function SiteHeader({ page = 'home', ticketsUrl, soundEnabled, onToggleSound }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(page !== 'home');
  const menuButton = useRef(null);
  const resolvedTicketsUrl = ticketsUrl || readAdminData().event.ticketsUrl;

  useEffect(() => {
    const onScroll = () => setScrolled(page !== 'home' || window.scrollY > 32);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [page]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  useEffect(() => {
    if (!window.location.hash) return undefined;
    const jumpToSection = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      document.getElementById(id)?.scrollIntoView({ behavior: 'instant', block: 'start' });
    };
    const frame = window.requestAnimationFrame(jumpToSection);
    if (document.readyState !== 'complete') window.addEventListener('load', jumpToSection, { once: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('load', jumpToSection);
    };
  }, []);

  return <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
    <a className="brand-mark" href={page === 'home' ? '#home' : './'} aria-label="8iT home"><img src={`${import.meta.env.BASE_URL}assets/players-hq/8it-logo.png`} alt="8iT" /></a>
    <nav id="primary-navigation" className={`site-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Primary navigation">
      {navigation.map(([label, destination]) => <a key={destination} href={linkFor(page, destination)} aria-current={page === destination ? 'page' : undefined} onClick={() => setMenuOpen(false)}>{label}</a>)}
    </nav>
    <div className="header-actions">
      {onToggleSound && <button className={`sound-toggle ${soundEnabled ? 'is-on' : ''}`} type="button" onClick={onToggleSound} aria-pressed={soundEnabled} aria-label={soundEnabled ? 'Mute site sound' : 'Enable site sound'}><i className={`fa-solid ${soundEnabled ? 'fa-volume-high' : 'fa-volume-xmark'}`} aria-hidden="true" /><span>{soundEnabled ? 'SOUND ON' : 'SOUND OFF'}</span></button>}
      <a className="header-tickets" href={resolvedTicketsUrl} target="_blank" rel="noreferrer">GET TICKETS <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" /></a>
      <button ref={menuButton} className={`menu-toggle ${menuOpen ? 'is-open' : ''}`} type="button" aria-expanded={menuOpen} aria-controls="primary-navigation" aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen((open) => !open)}><span /><span /></button>
    </div>
    <div className="header-motto" aria-label="Play, improve, dominate">PLAY <span>/</span> IMPROVE <span>/</span> DOMINATE</div>
  </header>;
}
