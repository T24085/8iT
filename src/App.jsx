import { useEffect, useRef, useState } from 'react';
import { ADMIN_STORAGE_KEY, defaultBracket as bracket, defaultEvent as event, defaultKillFeed as killFeed, defaultLiveMatch, defaultRoster as roster, defaultSchedule as schedule, readAdminData } from './siteData';

const navItems = [
  ['TEAM', '#team'],
  ['MATCHES', '#matches'],
  ['HYPE REEL', '#hype'],
  ['BROADCAST', '#broadcast'],
  ['INTEL', '#intel'],
  ['COMMUNITY', '#community'],
  ['TICKETS', '#tickets'],
  ['SHOP', './shop.html'],
];

const channels = [
  { platform: 'Twitch', handle: 'pandoracast', type: 'twitch', role: 'PandaMonium // IGL', description: 'Team POV, match comms, and the Pandamonium broadcast desk.', url: 'https://www.twitch.tv/pandoracast', icon: 'fa-twitch', tone: 'red' },
  { platform: 'YouTube', handle: 'Pandoracasting', type: 'youtube', channelId: 'UCI36kIDATrRauLgtNa-Ht1w', role: 'Official event archive', description: 'Full match replays, event coverage, and the best moments from 8iT.', url: 'https://www.youtube.com/@Pandoracasting', icon: 'fa-youtube', tone: 'light' },
  { platform: 'YouTube', handle: 'FragWatch', type: 'youtube', channelId: 'UCN98QEdNwJr9KbcDMjkn4rA', role: 'HanoSandy // Player POV', description: 'HanoSandy’s FragWatch channel for sharp angles, match coverage, and clutch replays.', url: 'https://www.youtube.com/@FragWatch', icon: 'fa-youtube', tone: 'light' },
  { platform: 'Twitch', handle: 'ghettobirdz', type: 'twitch', role: 'Player POV // Sniper', description: 'Follow the sniper lane live as every round starts to matter.', url: 'https://www.twitch.tv/ghettobirdz', icon: 'fa-twitch', tone: 'red' },
  { platform: 'Twitch', handle: 'titan101', type: 'twitch', role: 'Player POV // Rifler', description: 'A second angle on the action from the 8iT rifle line.', url: 'https://www.twitch.tv/titan101', icon: 'fa-twitch', tone: 'red' },
];

const clips = [
  { title: '12 INSANE CLUTCHES', detail: 'ESL PRO LEAGUE // THE ROUND IS NEVER OVER', channel: 'ESL Counter-Strike', videoId: '5gj1km4uZ2Y', duration: '12:18' },
  { title: 'BEST CLUTCHES', detail: 'BLAST PREMIER 2025 // ICE IN THE VEINS', channel: 'BLAST Premier', videoId: 'fhOvqTmJ5Bw', duration: '09:42' },
  { title: 'JT INSANE CLUTCH', detail: 'IEM COLOGNE // ONE PLAYER, NO EXIT', channel: 'ESL Counter-Strike Highlights', videoId: 'D-0YnpTVMsQ', duration: '02:14' },
  { title: 'OPEN LISBON MOMENTS', detail: 'BLAST PREMIER // PURE COUNTER-STRIKE', channel: 'BLAST Premier', videoId: 'Y4zuv0gf3M4', duration: '08:31' },
];

const ticketTiers = [
  ['GENERAL ADMISSION', '$60', 'BYOC access // the full four-day LAN', 'Most popular'],
  ['PREMIUM SEATING', '$140', 'Premium seat // more room to make noise', 'Best seat in the room'],
  ['BOARD GAMES ONLY', '$20', 'Bring the crew // keep it casual', 'Low pressure, high fun'],
  ['SPECTATOR', 'FREE', 'Come watch // all ages welcome', 'Bring a friend'],
];

const playerProfiles = {
  PandaMonium: { tagline: 'THE CALLER', bio: 'The voice in the headset. Every round starts with a plan and ends with a decision.', stats: [['ROLE', 'IGL / RIFLER'], ['SIGNAL', 'MAIN FEED'], ['MODE', 'NO HESITATION']] },
  BitchStewie: { tagline: 'THE ANCHOR', bio: 'Quiet until the round gets loud. Holds the line and never gives a free inch.', stats: [['ROLE', 'RIFLER'], ['SIGNAL', 'LOCKED IN'], ['MODE', 'HOLD FAST']] },
  ghettobird: { tagline: 'THE HUNTER', bio: 'Long sightlines, short patience. The angle is already taken before you see it.', stats: [['ROLE', 'SNIPER'], ['SIGNAL', 'PLAYER POV'], ['MODE', 'PATIENCE']] },
  ghosted: { tagline: 'THE ENTRY', bio: 'First through the door, last to doubt the call. Pressure is the opening move.', stats: [['ROLE', 'ENTRY FRAGGER'], ['SIGNAL', 'LOCKED IN'], ['MODE', 'FIRST CONTACT']] },
  Hanosandy: { tagline: 'THE WATCHER', bio: 'Every pixel matters. Turns the smallest mistake into a round-ending decision.', stats: [['ROLE', 'AWPer'], ['SIGNAL', 'LOCKED IN'], ['MODE', 'READ THE ROOM']] },
  hellaturlz: { tagline: 'THE GLUE', bio: 'The piece that makes the whole machine run. Support is not a background role.', stats: [['ROLE', 'SUPPORT'], ['SIGNAL', 'LOCKED IN'], ['MODE', 'MAKE SPACE']] },
  Titan101: { tagline: 'THE RIFLE', bio: 'Clean crosshair. Heavy footsteps. When the site needs a closer, Titan answers.', stats: [['ROLE', 'RIFLER'], ['SIGNAL', 'PLAYER POV'], ['MODE', 'CLOSE IT OUT']] },
};

const playerMedia = {
  Titan101: { portrait: '/assets/players/titan101.jpg', banner: '/assets/players/titan101-banner.jpg' },
  hellaturlz: { portrait: '/assets/players/hellaturlz.jpg', banner: '/assets/players/hellaturlz-banner.jpg' },
  ghosted: { portrait: '/assets/players/ghosted.jpg', banner: '/assets/players/ghosted-banner.jpg' },
  ghettobird: { portrait: '/assets/players/ghettobird.jpg', banner: '/assets/players/ghettobird-banner.jpg' },
  BitchStewie: { portrait: '/assets/players/bitchstewie.jpg', banner: '/assets/players/bitchstewie-banner.jpg' },
  Hanosandy: { portrait: '/assets/players/hanosandy.jpg', banner: '/assets/players/hanosandy-banner.jpg' },
  PandaMonium: { portrait: '/assets/players/pandamonium.jpg', banner: '/assets/players/pandamonium-banner.jpg' },
};

const wallPosts = [
  { handle: '@lanfestcolorado', copy: 'THE ROOM IS LOADING.', art: 'wall-post--red', type: 'PHOTO', image: '/assets/players/pandamonium.jpg' },
  { handle: '@8it.squad', copy: 'NO SAFE ROUNDS.', art: 'wall-post--hero', type: 'SQUAD', image: '/assets/players/8it-frame.jpg' },
  { handle: '@ghettobirdz', copy: 'WHO OWNS THE ANGLE?', art: 'wall-post--dark', type: 'CLIP', image: '/assets/players/ghettobird-banner.jpg' },
];

function getTimeRemaining(target) {
  const total = Math.max(0, new Date(target).getTime() - Date.now());
  const seconds = Math.floor(total / 1000);
  return { days: Math.floor(seconds / 86400), hours: Math.floor((seconds % 86400) / 3600), minutes: Math.floor((seconds % 3600) / 60), seconds: seconds % 60 };
}

function Countdown({ target, compact = false }) {
  const [remaining, setRemaining] = useState(() => getTimeRemaining(target));
  useEffect(() => { const timer = window.setInterval(() => setRemaining(getTimeRemaining(target)), 1000); return () => window.clearInterval(timer); }, [target]);
  return <div className={`countdown ${compact ? 'countdown--compact' : ''}`} aria-label={`${remaining.days} days, ${remaining.hours} hours, ${remaining.minutes} minutes, ${remaining.seconds} seconds remaining`}><span><strong>{String(remaining.days).padStart(2, '0')}</strong><small>DAYS</small></span><b>:</b><span><strong>{String(remaining.hours).padStart(2, '0')}</strong><small>HRS</small></span><b>:</b><span><strong>{String(remaining.minutes).padStart(2, '0')}</strong><small>MIN</small></span><b>:</b><span><strong>{String(remaining.seconds).padStart(2, '0')}</strong><small>SEC</small></span></div>;
}

function PlayerSpotlight({ player, onClose }) {
  const profile = playerProfiles[player.name] || playerProfiles.PandaMonium;
  const media = playerMedia[player.name] || playerMedia.PandaMonium;
  return <div className="player-modal" role="presentation" onClick={onClose}><div className="player-modal__inner" role="dialog" aria-modal="true" aria-labelledby="player-modal-title" onClick={(event) => event.stopPropagation()}><button className="clip-modal__close" type="button" onClick={onClose} aria-label="Close player profile"><i className="fa-solid fa-xmark" aria-hidden="true" /></button><div className="player-modal__visual" style={{ backgroundImage: `linear-gradient(145deg, rgba(239, 11, 40, 0.72), rgba(8, 9, 11, 0.2)), url("${media.portrait}")` }}><span>{player.name.slice(0, 2).toUpperCase()}</span><small>8iT // PLAYER FILE</small></div><div className="player-modal__copy">{media.banner && <div className="player-modal__banner" style={{ backgroundImage: `url("${media.banner}")` }} aria-hidden="true" />}<p className="eyebrow eyebrow--light"><span className="slash" />{profile.tagline}</p><h2 id="player-modal-title">{player.name}</h2><p>{profile.bio}</p><div className="player-modal__stats">{profile.stats.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>{player.channel && <a className="button button--primary" href={`#broadcast-${player.channel}`} onClick={onClose}>WATCH PLAYER POV <ArrowIcon /></a>}</div></div></div>;
}

function LiveMatchCenter({ bracketData = bracket, killFeedData = killFeed, liveMatchData = defaultLiveMatch, onPulse }) {
  const [feedIndex, setFeedIndex] = useState(0);
  const [votes, setVotes] = useState({ PandaMonium: 52, ghettobirdz: 31, Titan101: 17 });
  const [voted, setVoted] = useState(false);
  const match = { ...defaultLiveMatch, ...liveMatchData };
  useEffect(() => { const timer = window.setInterval(() => setFeedIndex((index) => (index + 1) % Math.max(1, killFeedData.length)), 4300); return () => window.clearInterval(timer); }, [killFeedData.length]);
  const totalVotes = Object.values(votes).reduce((sum, value) => sum + value, 0);
  const vote = (player) => { if (voted) return; setVotes((current) => ({ ...current, [player]: current[player] + 1 })); setVoted(true); onPulse?.(); };
  const currentFeed = killFeedData[feedIndex] || killFeed[0];
  return <section id="intel" className="section section--intel" aria-labelledby="intel-title"><div className="intel-heading" data-reveal><p className="eyebrow"><span className="slash" />LIVE SYSTEM // EVENT-DAY UI</p><h2 id="intel-title">THE ROUND<br /><em>NEVER SLEEPS.</em></h2><p>Scoreline, bracket, broadcast signal, and crowd control in one room. This is the live layer to connect to your match feed later.</p><span className="intel-heading__status"><i /> DEMO SIGNAL // READY TO CONNECT</span></div><div className="intel-panel" data-reveal style={{ '--reveal-delay': '120ms' }}><div className="intel-panel__top"><span><i /> NOW PLAYING</span><strong>{currentFeed[0]} <em>{currentFeed[1]}</em></strong><small>{currentFeed[2]}</small></div><div className="score-card"><div><span>{match.teamA}</span><strong>{match.scoreA}</strong><small>ROUND WINNER</small></div><b>:</b><div><span>{match.teamB}</span><strong>{match.scoreB}</strong><small>{match.roundLabel}</small></div><div className="score-card__live"><i /> {match.status}</div></div><div className="round-meter"><span>ROUND PROGRESS</span><div><b style={{ width: `${match.progress}%` }} /></div><strong>{match.progress}%</strong></div><div className="kill-feed">{killFeedData.map(([actor, action, detail], index) => <div className={index === feedIndex ? 'is-current' : ''} key={`${actor}-${action}`}><span>{actor}</span><b>{action}</b><small>{detail}</small></div>)}</div></div><div className="bracket-panel" data-reveal style={{ '--reveal-delay': '200ms' }}><div className="bracket-panel__head"><p className="eyebrow"><span className="slash" />TOURNAMENT PATH</p><span>BO3 // COLORADO</span></div><div className="bracket-grid">{bracketData.map((round) => <div key={round.title}><h3>{round.title}</h3>{round.rows.map(([left, leftScore, right, rightScore, status]) => <div className="bracket-match" key={`${left}-${right}`}><span>{left} <b>{leftScore}</b></span><span>{right} <b>{rightScore}</b></span><small>{status}</small></div>)}</div>)}</div></div><div className="poll-panel" data-reveal style={{ '--reveal-delay': '280ms' }}><div><p className="eyebrow"><span className="slash" />CROWD CONTROL</p><h3>WHO GETS THE<br /><em>FINAL ANGLE?</em></h3><p>Vote for the POV you want to see next. One vote per session.</p></div><div className="poll-options">{Object.entries(votes).map(([player, count]) => <button type="button" className={voted ? 'is-voted' : ''} key={player} onClick={() => vote(player)}><span><b>{player}</b><small>{Math.round((count / totalVotes) * 100)}%</small></span><i><em style={{ width: `${(count / totalVotes) * 100}%` }} /></i></button>)}</div>{voted && <span className="poll-confirmation">VOTE LOCKED // THE ROOM HEARD YOU</span>}</div></section>;
}

function CommunityWall({ onPulse }) {
  const [posts, setPosts] = useState(wallPosts);
  const [form, setForm] = useState({ handle: '', url: '', copy: '' });
  const submit = (event) => { event.preventDefault(); if (!form.handle.trim() || !form.url.trim()) return; setPosts((current) => [{ handle: form.handle.startsWith('@') ? form.handle : `@${form.handle}`, url: form.url, copy: form.copy || 'THE ROOM IS WATCHING.', art: 'wall-post--submitted', type: 'SUBMITTED' }, ...current]); setForm({ handle: '', url: '', copy: '' }); onPulse?.(); };
  return <section id="community" className="section section--community" aria-labelledby="community-title"><div className="community-heading" data-reveal><p className="eyebrow eyebrow--light"><span className="slash" />THE WALL // SEND SIGNAL</p><h2 id="community-title">SHOW THE<br /><em>ROOM.</em></h2><p>Drop your LAN photo, clutch clip, or squad ritual. This starter wall is ready for real submissions when you connect storage or moderation.</p></div><div className="community-wall">{posts.map((post, index) => <article className={`wall-post ${post.art}`} data-reveal style={{ '--reveal-delay': `${index * 80}ms` }} key={`${post.handle}-${index}`}><div className="wall-post__texture" style={post.image ? { backgroundImage: `linear-gradient(135deg, rgba(239, 11, 40, 0.64), rgba(8, 9, 11, 0.78)), url("${post.image}")` } : undefined} /><span>{post.type}</span><strong>{post.copy}</strong><small>{post.handle}</small>{post.url && <a className="wall-post__link" href={post.url} target="_blank" rel="noreferrer">OPEN SUBMISSION <ArrowIcon /></a>}</article>)}<form className="wall-submit" onSubmit={submit} data-reveal><p className="eyebrow"><span className="slash" />SUBMIT A CLIP</p><input aria-label="Your handle" placeholder="YOUR HANDLE" value={form.handle} onChange={(event) => setForm({ ...form, handle: event.target.value })} required /><input aria-label="Clip or photo URL" type="url" placeholder="CLIP / PHOTO URL" value={form.url} onChange={(event) => setForm({ ...form, url: event.target.value })} required /><input aria-label="Caption" placeholder="CAPTION // OPTIONAL" value={form.copy} onChange={(event) => setForm({ ...form, copy: event.target.value })} /><button type="submit">SEND TO THE WALL <ArrowIcon /></button><small>LOCAL DEMO // CONNECT MODERATION + STORAGE LATER</small></form></div></section>;
}

function BrandMark() { return <a className="brand-mark" href="#home" aria-label="8iT home">8iT</a>; }
function ArrowIcon({ direction = 'up-right' }) { return <i className={`fa-solid fa-arrow-${direction}`} aria-hidden="true" />; }
function SectionLabel({ children, light = false }) { return <p className={`eyebrow ${light ? 'eyebrow--light' : ''}`}><span className="slash" />{children}</p>; }

function ChannelPlayer({ channel }) {
  const embedUrl = channel.type === 'twitch'
    ? `https://player.twitch.tv/?channel=${channel.handle}&parent=${window.location.hostname || 'localhost'}&autoplay=false`
    : `https://www.youtube-nocookie.com/embed/live_stream?channel=${channel.channelId}&rel=0`;

  return (
    <article className={`channel-card channel-card--${channel.tone}`}>
      <div className="channel-card__topline"><span className="channel-card__provider"><i className={`fa-brands ${channel.icon}`} aria-hidden="true" />{channel.platform}</span><span className="channel-card__signal"><span /> PLAYER</span></div>
      <div className="channel-card__embed"><iframe src={embedUrl} title={`${channel.handle} ${channel.platform} live player`} allow="autoplay; fullscreen; encrypted-media" allowFullScreen loading="lazy" /></div>
      <div className="channel-card__identity"><div className="channel-card__avatar" aria-hidden="true">{channel.handle.slice(0, 2).toUpperCase()}</div><div><p className="channel-card__label">LIVE PLAYER</p><h3>{channel.handle}</h3></div></div>
      <p className="channel-card__role">{channel.role}</p><p className="channel-card__description">{channel.description}</p>
      <a className="channel-card__cta" href={channel.url} target="_blank" rel="noreferrer">OPEN {channel.platform.toUpperCase()} <ArrowIcon /></a>
    </article>
  );
}

function ClipCard({ clip, featured = false, onPlay }) {
  return (
    <article className={`clip-card ${featured ? 'clip-card--featured' : ''}`}>
      <button className="clip-card__visual" type="button" onClick={() => onPlay(clip)} aria-label={`Play ${clip.title}`}>
        <img src={`https://i.ytimg.com/vi/${clip.videoId}/maxresdefault.jpg`} alt="" loading="lazy" /><span className="clip-card__shade" /><span className="clip-card__play"><i className="fa-solid fa-play" aria-hidden="true" /></span><span className="clip-card__duration">{clip.duration}</span>
      </button>
      <div className="clip-card__copy"><p className="clip-card__detail">{clip.detail}</p><h3>{clip.title}</h3><p className="clip-card__source">{clip.channel} <span>//</span> YOUTUBE</p></div>
    </article>
  );
}

export function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeClip, setActiveClip] = useState(null);
  const [activePlayer, setActivePlayer] = useState(null);
  const [easterEgg, setEasterEgg] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [adminData, setAdminData] = useState(() => readAdminData());
  const audioContextRef = useRef(null);
  const currentEvent = { ...event, ...(adminData.event || {}) };
  const liveRoster = adminData.roster || roster;
  const liveSchedule = adminData.schedule || schedule;
  const liveBracket = adminData.bracket || bracket;
  const liveKillFeed = adminData.killFeed || killFeed;

  const emitPulse = (frequency = 110, duration = 0.14, force = false) => {
    if (!soundEnabled && !force) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const context = audioContextRef.current || new AudioContext();
    audioContextRef.current = context;
    if (context.state === 'suspended') context.resume();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(frequency, context.currentTime); oscillator.frequency.exponentialRampToValueAtTime(Math.max(40, frequency * 0.52), context.currentTime + duration);
    gain.gain.setValueAtTime(0.0001, context.currentTime); gain.gain.exponentialRampToValueAtTime(0.09, context.currentTime + 0.012); gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
    oscillator.connect(gain); gain.connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime + duration + 0.02);
  };

  const toggleSound = () => { const next = !soundEnabled; setSoundEnabled(next); if (next) emitPulse(78, 0.24, true); };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKeyDown = (eventKey) => { if (eventKey.key === 'Escape') { setActiveClip(null); setActivePlayer(null); setEasterEgg(false); } };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => { document.body.classList.toggle('modal-open', Boolean(activeClip || activePlayer)); return () => document.body.classList.remove('modal-open'); }, [activeClip, activePlayer]);

  useEffect(() => {
    const sequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let progress = 0;
    const onKeyDown = (eventKey) => {
      if (eventKey.key === sequence[progress]) { progress += 1; if (progress === sequence.length) { setEasterEgg(true); emitPulse(54, 0.5, true); progress = 0; } } else progress = eventKey.key === sequence[0] ? 1 : 0;
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const onStorage = (storageEvent) => { if (storageEvent.key === ADMIN_STORAGE_KEY) setAdminData(readAdminData()); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    const revealNodes = Array.from(document.querySelectorAll('[data-reveal]'));
    if (!revealNodes.length) return undefined;

    const show = (node) => node.classList.add('is-visible');
    if (!('IntersectionObserver' in window)) {
      revealNodes.forEach(show);
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          show(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

    revealNodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let frame = 0;
    const updateParallax = () => {
      frame = 0;
      const shift = Math.min(window.scrollY * 0.11, 72);
      document.documentElement.style.setProperty('--hero-parallax', `${shift}px`);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateParallax);
    };
    updateParallax();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <>
      <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
        <BrandMark />
        <nav id="primary-navigation" className={`site-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Primary navigation">{navItems.map(([label, href]) => <a href={href} key={href} onClick={() => setMenuOpen(false)}>{label}</a>)}</nav>
        <div className="header-actions"><button className={`sound-toggle ${soundEnabled ? 'is-on' : ''}`} type="button" onClick={toggleSound} aria-pressed={soundEnabled} aria-label={soundEnabled ? 'Mute site sound' : 'Enable site sound'}><i className={`fa-solid ${soundEnabled ? 'fa-volume-high' : 'fa-volume-xmark'}`} aria-hidden="true" /><span>{soundEnabled ? 'SOUND ON' : 'SOUND OFF'}</span></button><a className="header-tickets" href={currentEvent.ticketsUrl} target="_blank" rel="noreferrer">GET TICKETS <ArrowIcon /></a><button className={`menu-toggle ${menuOpen ? 'is-open' : ''}`} type="button" aria-expanded={menuOpen} aria-controls="primary-navigation" aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen((open) => !open)}><span /><span /></button></div>
        <div className="header-motto" aria-label="Play, improve, dominate">PLAY <span>/</span> IMPROVE <span>/</span> DOMINATE</div>
      </header>

      <main>
        <section id="home" className="hero" aria-labelledby="hero-title"><div className="hero__veil" /><div className="hero__scanline" /><div className="hero__content" data-reveal="hero-copy"><SectionLabel light>EVERLAN // COLORADO</SectionLabel><h1 id="hero-title">NO SAFE<br /><em>ROUNDS.</em></h1><p className="hero__copy">8iT is taking the room at LANFest Colorado. Four days. One squad. Every angle live.</p><div className="hero__actions"><a className="button button--primary" href={currentEvent.ticketsUrl} target="_blank" rel="noreferrer">GET EVENT PASSES <ArrowIcon /></a><a className="button button--ghost" href="#broadcast">WATCH THE FEED <i className="fa-solid fa-play" aria-hidden="true" /></a></div></div><div className="hero__event-card" data-reveal="hero-card" style={{ '--reveal-delay': '180ms' }}><p className="hero__event-kicker">{currentEvent.series}</p><strong>{currentEvent.shortDates}</strong><span>{currentEvent.location}</span><div className="hero__countdown"><small>EVENT T-MINUS</small><Countdown target={currentEvent.startAt} compact /></div><a href="#tickets">ENTER THE ROOM <ArrowIcon /></a></div><div className="hero__side-note">01 <span /> 8iT / NEW DAWN</div></section>

        <section className="event-strip" aria-label="Event facts" data-reveal="strip"><div><span className="event-strip__number">04</span><span>FULL DAYS<br /><b>OF GAMING</b></span></div><div><span className="event-strip__number">330</span><span>SEATS<br /><b>IN THE ROOM</b></span></div><div><span className="event-strip__number">20</span><span>YEARS<br /><b>LANFEST COLORADO</b></span></div><div><span className="event-strip__number">∞</span><span>ROUNDS<br /><b>TO REMEMBER</b></span></div></section>

        <section id="team" className="section section--team" aria-labelledby="team-title"><div className="section-intro section-intro--team" data-reveal><SectionLabel>THE LINEUP</SectionLabel><h2 id="team-title">THE ROOM<br /><em>IS THE WEAPON.</em></h2><p>Seven players. One call. No one gets to hide when the lights go on.</p><a className="text-link" href="#broadcast">FIND YOUR ANGLE <ArrowIcon /></a></div><div className="roster-grid">{liveRoster.map(([name, role, status, channel], index) => <article className="roster-card roster-card--interactive" key={name} data-reveal style={{ '--reveal-delay': `${index * 70}ms`, '--player-bg': playerMedia[name]?.portrait ? `url("${playerMedia[name].portrait}")` : 'none' }} role="button" tabIndex="0" aria-label={`Open ${name} player profile`} onClick={(clickEvent) => { if (!clickEvent.target.closest('a')) setActivePlayer({ name, role, channel }); }} onKeyDown={(keyEvent) => { if (keyEvent.key === 'Enter' || keyEvent.key === ' ') { keyEvent.preventDefault(); setActivePlayer({ name, role, channel }); } }}><div className="roster-card__top"><span>{status}</span><b style={playerMedia[name]?.portrait ? { backgroundImage: `url("${playerMedia[name].portrait}")` } : undefined}>{name.slice(0, 2).toUpperCase()}</b></div><div className="roster-card__body"><h3>{name}</h3><p>{role}</p></div>{channel ? <a className="roster-card__link" href={`#broadcast-${channel}`} onClick={() => emitPulse(120)}>WATCH POV <ArrowIcon /></a> : <span className="roster-card__lock">CLICK FOR FILE</span>}</article>)}</div></section>

        <section id="matches" className="section section--schedule" aria-labelledby="schedule-title"><div className="schedule-heading" data-reveal><SectionLabel>EVENT RHYTHM</SectionLabel><h2 id="schedule-title">FOUR DAYS.<br /><em>ONE STORY.</em></h2><p>Times are coming. The pressure is already here.</p></div><div className="schedule-list">{liveSchedule.map(([number, day, title, copy], index) => <article className="schedule-row" key={number} data-reveal style={{ '--reveal-delay': `${index * 90}ms` }}><span className="schedule-row__number">{number}</span><span className="schedule-row__day">{day}</span><h3>{title}</h3><p>{copy}</p><span className="schedule-row__mark"><ArrowIcon direction="down" /></span></article>)}</div></section>

        <LiveMatchCenter bracketData={liveBracket} killFeedData={liveKillFeed} liveMatchData={adminData.liveMatch} onPulse={() => emitPulse(92, 0.16)} />

        <section id="hype" className="section section--hype" aria-labelledby="hype-title"><div className="hype-heading" data-reveal><div><SectionLabel light>WARMUP // NO BRAKES</SectionLabel><h2 id="hype-title">WATCH THE<br /><em>ROOM ERUPT.</em></h2></div><p>Borrow the nerve. Bring your own.</p></div><div className="clip-grid">{clips.map((clip, index) => <div className={`clip-reveal ${index === 0 ? 'clip-reveal--featured' : ''}`} key={clip.videoId} data-reveal style={{ '--reveal-delay': `${index * 90}ms` }}><ClipCard clip={clip} featured={index === 0} onPlay={setActiveClip} /></div>)}</div></section>

        <section id="broadcast" className="section section--broadcast" aria-labelledby="broadcast-title"><div className="broadcast-intro" data-reveal><SectionLabel>LIVE EVENT FEED</SectionLabel><h2 id="broadcast-title">WATCH 8iT<br /><em>LIVE.</em></h2><p>Choose your angle. Official coverage, player POVs, and the post-match story all live here.</p><div className="broadcast-intro__rule" /><p className="broadcast-intro__micro">STREAM LINKS // EVENT DAY NETWORK</p></div><div className="channel-grid">{channels.map((channel, index) => <div id={`broadcast-${channel.handle}`} key={channel.handle} data-reveal style={{ '--reveal-delay': `${index * 100}ms` }}><ChannelPlayer channel={channel} /></div>)}</div></section>

        <section id="tickets" className="section section--tickets" aria-labelledby="tickets-title"><div className="tickets-heading" data-reveal><SectionLabel>GET IN THE ROOM</SectionLabel><h2 id="tickets-title">CHOOSE<br /><em>YOUR LOADOUT.</em></h2><p>LANFest Colorado is all ages, volunteer-powered, and built for the whole crew. Pick your way in, then bring the energy.</p><a className="button button--primary" href={currentEvent.ticketsUrl} target="_blank" rel="noreferrer">OPEN TIXR <ArrowIcon /></a></div><div className="ticket-grid">{ticketTiers.map(([name, price, detail, tag], index) => <article className={`ticket-card ${index === 0 ? 'ticket-card--featured' : ''}`} key={name} data-reveal style={{ '--reveal-delay': `${index * 90}ms` }}><span className="ticket-card__tag">{tag}</span><p className="ticket-card__index">0{index + 1} // PASS TYPE</p><h3>{name}</h3><strong>{price}</strong><p>{detail}</p><a href={currentEvent.ticketsUrl} target="_blank" rel="noreferrer">SELECT PASS <ArrowIcon /></a></article>)}</div></section>

        <CommunityWall onPulse={() => emitPulse(100, 0.15)} />

        <section id="about" className="section section--about" aria-labelledby="about-title"><div className="about-statement" data-reveal><SectionLabel>THE BIGGER PICTURE</SectionLabel><h2 id="about-title">PLAY HARD.<br /><em>DO GOOD.</em></h2></div><div className="about-copy" data-reveal style={{ '--reveal-delay': '120ms' }}><p>LANFest Colorado has spent two decades building healthy communities through gaming. This 20th anniversary event brings the Front Range together for four days of play, competition, and charity.</p><a className="text-link" href={currentEvent.officialUrl} target="_blank" rel="noreferrer">LEARN ABOUT LANFEST <ArrowIcon /></a></div><div className="venue-card" data-reveal style={{ '--reveal-delay': '220ms' }}><p className="eyebrow">THE VENUE</p><h3>{currentEvent.venue}</h3><p>{currentEvent.address}</p><a href="https://maps.google.com/?q=Douglas+County+Fairgrounds+and+Event+Center+Castle+Rock+CO" target="_blank" rel="noreferrer">OPEN MAPS <ArrowIcon /></a></div></section>
      </main>

      <footer className="site-footer"><BrandMark /><p><i className="fa-solid fa-person-rifle" aria-hidden="true" /> 8iT // EVERLAN COLORADO</p><div className="footer-links"><a href="./shop.html">8iT SHOP</a><a href="./admin.html">CONTROL ROOM</a><a href={currentEvent.officialUrl} target="_blank" rel="noreferrer">LANFEST COLORADO</a><a href={currentEvent.ticketsUrl} target="_blank" rel="noreferrer">TIXR PASSES</a><a href="#home">BACK TO TOP <ArrowIcon direction="up" /></a></div></footer>

      {activeClip && <div className="clip-modal" role="dialog" aria-modal="true" aria-label={`${activeClip.title} video`} onClick={() => setActiveClip(null)}><div className="clip-modal__inner" onClick={(eventClick) => eventClick.stopPropagation()}><button className="clip-modal__close" type="button" onClick={() => setActiveClip(null)} aria-label="Close video"><i className="fa-solid fa-xmark" aria-hidden="true" /></button><div className="clip-modal__player"><iframe src={`https://www.youtube-nocookie.com/embed/${activeClip.videoId}?autoplay=1&rel=0`} title={activeClip.title} allow="autoplay; fullscreen" allowFullScreen /></div><p>{activeClip.detail}</p><h2>{activeClip.title}</h2></div></div>}
      {activePlayer && <PlayerSpotlight player={activePlayer} onClose={() => setActivePlayer(null)} />}
      {easterEgg && <div className="easter-egg" role="dialog" aria-modal="true" aria-label="8iT secret unlocked" onClick={() => setEasterEgg(false)}><div className="easter-egg__inner" onClick={(eventClick) => eventClick.stopPropagation()}><button className="clip-modal__close" type="button" onClick={() => setEasterEgg(false)} aria-label="Close secret"><i className="fa-solid fa-xmark" aria-hidden="true" /></button><p className="eyebrow eyebrow--light"><span className="slash" />SECRET SIGNAL // 8iT</p><h2>YOU FOUND<br /><em>THE BACKDOOR.</em></h2><p>PLAY / IMPROVE / DOMINATE. The room remembers the ones who look closer.</p><span className="easter-egg__code">↑ ↑ ↓ ↓ ← → ← → B A</span></div></div>}
    </>
  );
}
