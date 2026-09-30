import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { DISCORD_INVITE_URL, ADMIN_STORAGE_KEY, defaultEvent as event, defaultKillFeed as killFeed, defaultLiveMatch, defaultRoster as roster, defaultSchedule as schedule, defaultSwiss, readAdminData, swissToPublicBracket } from './siteData';
import { RematchBracket } from './RematchBracket';
import { RematchStats } from './RematchStatsPanel';
import { getRematchPlayer, getRematchTotals, rematchMaps } from './rematchStats';
import { RecordedMatchStats } from './RecordedMatchStatsPanel';
import { getRecordedPlayerStats, getRecordedPlayerTotals } from './recordedMatchStats';
import { OverwatchStats, overwatchLine } from './OverwatchStatsPanel';
import { getOverwatchPlayerMaps, getOverwatchPlayerTotals } from './overwatchStats';
import { TournamentPlacements } from './TournamentPlacements';
import { OfficialBracketPanel } from './OfficialBracketPanel';
import { SiteHeader } from './SiteHeader.jsx';
import { RosterPortrait } from './RosterPortrait.jsx';

const HeroLogo3D = lazy(() => import('./HeroLogo3D.jsx').then(({ HeroLogo3D }) => ({ default: HeroLogo3D })));

const channels = [
  { platform: 'Twitch', handle: 'pandoracast', type: 'twitch', role: 'PandaMonium // IGL', description: 'Team POV, match comms, and the Pandamonium broadcast desk.', url: 'https://www.twitch.tv/pandoracast', icon: 'fa-twitch', tone: 'red' },
  { platform: 'YouTube', handle: 'Pandoracasting', type: 'youtube', channelId: 'UCI36kIDATrRauLgtNa-Ht1w', role: 'Official event archive', description: 'Full match replays, event coverage, and the best moments from 8iT.', url: 'https://www.youtube.com/@Pandoracasting', icon: 'fa-youtube', tone: 'light' },
  { platform: 'YouTube', handle: 'FragWatch', type: 'youtube', channelId: 'UCN98QEdNwJr9KbcDMjkn4rA', role: 'Hanosandy // PLAYER POV', description: 'Hanosandy’s FragWatch channel for sharp angles, match coverage, and clutch replays.', url: 'https://www.youtube.com/@FragWatch', icon: 'fa-youtube', tone: 'light' },
  { platform: 'Twitch', handle: 'ghettobirdz', type: 'twitch', role: 'Player POV // Sniper', description: 'Follow the sniper lane live as every round starts to matter.', url: 'https://www.twitch.tv/ghettobirdz', icon: 'fa-twitch', tone: 'red' },
  { platform: 'Twitch', handle: 'titan101', type: 'twitch', role: 'Player POV // Rifler', description: 'A second angle on the action from the 8iT rifle line.', url: 'https://www.twitch.tv/titan101', icon: 'fa-twitch', tone: 'red' },
];

const clips = [
  { title: 'FINALS RECHALLENGE', detail: 'INTEL LANFEST // CS2 BO3', channel: 'FragWatch', videoId: 'ywbbg1le968', duration: '1:57:15' },
  { title: 'CS2 TOURNAMENT', detail: 'INTEL LANFEST // TOURNAMENT BROADCAST', channel: 'FragWatch', videoId: 'vblxVNYXKts', duration: '2:15:36' },
  { title: 'FALL GUYS TOURNAMENT', detail: 'INTEL LANFEST // TOURNAMENT BROADCAST', channel: 'FragWatch', videoId: 'GfexIMBER98', duration: '42:56' },
  { title: 'OVERWATCH TOURNAMENT', detail: 'INTEL LANFEST // TOURNAMENT BROADCAST', channel: 'FragWatch', videoId: 'TkT2AEMJTxY', duration: '1:56:10' },
  { title: 'LANFEST WARM UP', detail: 'INTEL LANFEST // EVENT STREAM', channel: 'FragWatch', videoId: 'eoy8r2qTxxY', duration: '1:15:07' },
  { title: 'BATTLEFIELD 4 TOURNAMENT', detail: 'INTEL LANFEST // TOURNAMENT BROADCAST', channel: 'FragWatch', videoId: '9Hi45_bZdv0', duration: '3:43:00' },
  { title: 'LANFEST WARM UP', detail: 'INTEL LANFEST // EVENT STREAM', channel: 'FragWatch', videoId: 'iG2AEHIWKcc', duration: '1:58:32' },
];

const communityPaths = [
  ['FIND YOUR SQUAD', 'PLAY', 'Meet the community and find people to queue with.', 'Discord', DISCORD_INVITE_URL, 'JOIN DISCORD'],
  ['FOLLOW THE FEED', 'WATCH', 'Catch player streams and match replays.', 'Broadcast', '#broadcast', 'WATCH THE FEED'],
  ['SEE THE RESULTS', 'RECAP', 'Explore the completed LANFest brackets and player stats.', 'LANFest 2026', './stats.html', 'EXPLORE STATS'],
  ['RELIVE THE LAN', 'PHOTOS', 'Browse the event and tournament photo archive.', 'Event archive', '#community', 'VIEW PHOTOS'],
];

const playerProfiles = {
  PandaMonium: { tagline: 'THE CALLER', bio: 'The voice in the headset. Every round starts with a plan and ends with a decision.', stats: [['ROLE', 'IGL / RIFLER'], ['SIGNAL', 'MAIN FEED'], ['MODE', 'NO HESITATION']] },
  BitchStewie: { tagline: 'THE ANCHOR', bio: 'Quiet until the round gets loud. Holds the line and never gives a free inch.', stats: [['ROLE', 'RIFLER'], ['SIGNAL', 'LOCKED IN'], ['MODE', 'HOLD FAST']] },
  ghettobird: { tagline: 'THE HUNTER', bio: 'Long sightlines, short patience. The angle is already taken before you see it.', stats: [['ROLE', 'SNIPER'], ['SIGNAL', 'PLAYER POV'], ['MODE', 'PATIENCE']] },
  ghosted: { tagline: 'THE ENTRY', bio: 'First through the door, last to doubt the call. Pressure is the opening move.', stats: [['ROLE', 'ENTRY FRAGGER'], ['SIGNAL', 'LOCKED IN'], ['MODE', 'FIRST CONTACT']] },
  Hanosandy: { tagline: 'THE WATCHER', bio: 'Every pixel matters. Turns the smallest mistake into a round-ending decision.', stats: [['ROLE', 'AWPer'], ['SIGNAL', 'LOCKED IN'], ['MODE', 'READ THE ROOM']] },
  Hellaturtlz: { tagline: 'THE GLUE', bio: 'The piece that makes the whole machine run. Support is not a background role.', stats: [['ROLE', 'SUPPORT'], ['SIGNAL', 'LOCKED IN'], ['MODE', 'MAKE SPACE']] },
  Titan101: { tagline: 'THE RIFLE', bio: 'Clean crosshair. Heavy footsteps. When the site needs a closer, Titan answers.', stats: [['ROLE', 'RIFLER'], ['SIGNAL', 'PLAYER POV'], ['MODE', 'CLOSE IT OUT']] },
};

const playerMedia = {
  Titan101: { portrait: './assets/players-hq/titan101.png', banner: './assets/players-hq/titan101-wordmark.png' },
  Hellaturtlz: { portrait: './assets/players-hq/hello-turtlz.png', banner: './assets/players-hq/hello-turtlz-wordmark.png' },
  ghosted: { portrait: './assets/players-hq/ghosted.png', banner: './assets/players-hq/ghosted-wordmark.png' },
  ghettobird: { portrait: './assets/players-hq/ghettobird.png', banner: './assets/players-hq/ghettobird-wordmark.png' },
  BitchStewie: { portrait: './assets/players-hq/bitch-stewie.png', banner: './assets/players-hq/bitch-stewie-wordmark.png' },
  Hanosandy: { portrait: './assets/players-hq/hano-sandy.png', banner: './assets/players-hq/hano-sandy-wordmark.png' },
  PandaMonium: { portrait: './assets/players-hq/panda-monium.png', banner: './assets/players-hq/panda-monium-wordmark.png' },
};

const galleryItems = [
  { id: 'arrival', category: 'EVENT', title: 'THE SQUAD ARRIVES', meta: 'LANFEST COLORADO // DAY 01', caption: 'The room opens, the rigs wake up, and Colorado starts to fill the frame.', image: './assets/about-team-background.png', size: 'hero', position: 'center 48%' },
  { id: 'swiss-stage', category: 'TOURNAMENT', title: 'SWISS STAGE', meta: 'BO1 // OPENING ROUND', caption: 'Every match matters. Three wins advances; three losses ends the run.', image: './assets/matches-swiss-background.png', size: 'tall', position: 'center' },
  { id: 'a-site', category: 'TOURNAMENT', title: 'A SITE. FULL SEND.', meta: 'MATCH DAY // MAP CONTROL', caption: 'Opening contact from the first live round of the weekend.', image: './assets/banners/hero-a-site.png', position: 'center 46%' },
  { id: 'loadout', category: 'TEAM', title: 'ROUND READY', meta: '8iT LOADOUT // COLORADO', caption: 'The custom kit, the final check, and one more minute before server live.', image: './assets/banners/loadout-ak.png', position: 'center 46%' },
  { id: 'long-angle', category: 'TOURNAMENT', title: 'LONG ANGLE', meta: 'MATCH DAY // PLAYER POV', caption: 'The sightline holds while the rest of the room disappears.', image: './assets/banners/precision-awp.png', position: 'center 48%' },
  { id: 'utility', category: 'TOURNAMENT', title: 'UTILITY DOWN', meta: 'ROUND DETAIL // ENTRY', caption: 'Smoke blooms, the call lands, and the hit begins.', image: './assets/banners/utility-smoke.png', position: 'center 54%' },
  { id: 'close-quarters', category: 'EVENT', title: 'BETWEEN ROUNDS', meta: 'BACKSTAGE // FINAL SIGNAL', caption: 'The small moments around the match tell the rest of the story.', image: './assets/banners/close-quarters-knife.png', position: 'center 48%' },
  { id: 'pandamonium', category: 'TEAM', title: 'THE CALLER', meta: 'PANDAMONIUM // IGL', caption: 'One voice on the headset, one plan moving through the room.', image: './assets/players-hq/panda-monium.png', position: 'center' },
];

function PlayerSpotlight({ player, onClose }) {
  const profile = playerProfiles[player.name] || playerProfiles.PandaMonium;
  const media = playerMedia[player.name] || playerMedia.PandaMonium;
  const rematchStats = getRematchPlayer(player.name);
  const recordedStats = getRecordedPlayerStats(player.name);
  const overwatchStats = getOverwatchPlayerMaps(player.name);
  const stream = channels.find((channel) => channel.handle.toLowerCase() === player.channel?.toLowerCase());
  const streamUrl = stream?.type === 'twitch'
    ? `https://player.twitch.tv/?channel=${stream.handle}&parent=${window.location.hostname || 'localhost'}&autoplay=false`
    : stream ? `https://www.youtube-nocookie.com/embed/live_stream?channel=${stream.channelId}&rel=0` : null;
  return <div className="player-modal" role="presentation" onClick={onClose}><div className="player-modal__inner" role="dialog" aria-modal="true" aria-labelledby="player-modal-title" onClick={(event) => event.stopPropagation()}><button className="clip-modal__close" type="button" onClick={onClose} aria-label="Close player profile"><i className="fa-solid fa-xmark" aria-hidden="true" /></button><div className="player-modal__visual"><img src={media.portrait} alt={`${player.name} player portrait`} /><small>8iT // PLAYER FILE</small></div><div className="player-modal__copy">{media.banner && <div className="player-modal__banner" style={{ backgroundImage: `url("${media.banner}")` }} aria-hidden="true" />}<p className="eyebrow eyebrow--light"><span className="slash" />{profile.tagline}</p><h2 id="player-modal-title"><span className={player.name === 'Hanosandy' ? 'player-name' : undefined}>{player.name}</span></h2>{player.name === 'ghosted' && <span className="player-modal__alias">ALSO KNOWN AS ZIXXY</span>}<p>{profile.bio}</p><div className="player-modal__stats">{profile.stats.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>{recordedStats.length > 0 && <div className="player-modal__recorded"><span>OFFICIAL MATCH RECORDING // FINAL SCOREBOARDS</span>{recordedStats.map(({ map, stats }) => <div key={map}><b>{map}</b><small>{stats.kills} / {stats.deaths} / {stats.assists} K/D/A <span aria-hidden="true">//</span> {stats.hs}% HS <span aria-hidden="true">//</span> {stats.damage.toLocaleString()} DMG</small></div>)}<a href="#recorded-maps" onClick={onClose}>VIEW FULL SCOREBOARDS ↗</a></div>}{overwatchStats.length > 0 && <div className="player-modal__overwatch"><span>OVERWATCH 2 // {overwatchStats[0].stats.name === 'Hanosandy' ? <span className="player-name">Hanosandy</span> : overwatchStats[0].stats.name.toUpperCase()} IN-GAME</span>{overwatchStats.map(({ map, stats }) => <div key={map}><b>{map}</b><small>{overwatchLine(stats)} E/A/D <span aria-hidden="true">//</span> {stats.damage.toLocaleString()} DMG <span aria-hidden="true">//</span> {stats.healing.toLocaleString()} HEAL <span aria-hidden="true">//</span> {stats.mitigation.toLocaleString()} MIT</small></div>)}<a href="#overwatch-stats" onClick={onClose}>VIEW OVERWATCH TEAM STATS &rarr;</a></div>}{rematchStats && <div className="player-modal__rematch"><span>FRIENDLY REMATCH // POST-MAP CARD STATS</span>{rematchMaps.map((map) => { const stats = rematchStats.maps[map]; return <div key={map}><b>{map}</b><small>SCORE {stats.score} <span aria-hidden="true">//</span> {stats.kills} / {stats.deaths} / {stats.assists} K/D/A <span aria-hidden="true">//</span> {stats.hs}% HS</small></div>; })}<a href="#rematch-stats" onClick={onClose}>VIEW ALL REMATCH STATS ↗</a></div>}{streamUrl && <div className="player-modal__stream"><div><span><i /> PLAYER STREAM</span><small>{stream.platform} // {stream.handle}</small></div><iframe src={streamUrl} title={`${stream.handle} ${stream.platform} player stream`} allow="autoplay; fullscreen; encrypted-media" allowFullScreen /></div>}</div></div></div>;
}

function LiveMatchCenter({ bracketData, cs2Edited, cs2TeamName, killFeedData = killFeed, liveMatchData = defaultLiveMatch, onPulse }) {
  const [feedIndex, setFeedIndex] = useState(0);
  const [votes, setVotes] = useState({ PandaMonium: 52, ghettobirdz: 31, Titan101: 17 });
  const [voted, setVoted] = useState(false);
  const match = { ...defaultLiveMatch, ...liveMatchData };
  useEffect(() => { const timer = window.setInterval(() => setFeedIndex((index) => (index + 1) % Math.max(1, killFeedData.length)), 4300); return () => window.clearInterval(timer); }, [killFeedData.length]);
  const totalVotes = Object.values(votes).reduce((sum, value) => sum + value, 0);
  const vote = (player) => { if (voted) return; setVotes((current) => ({ ...current, [player]: current[player] + 1 })); setVoted(true); onPulse?.(); };
  const currentFeed = killFeedData[feedIndex] || killFeed[0];
  return <section id="intel" className="section section--intel" aria-labelledby="intel-title">
    <div className="intel-heading" data-reveal><p className="eyebrow"><span className="slash" />LANFEST // MATCH CENTER</p><h2 id="intel-title">THE ROUND<br /><em>NEVER SLEEPS.</em></h2><p>The live score and crowd poll are UI previews. The CS2 bracket starts with completed Battlefy results; Battlefield 4 and Overwatch 2 show their recorded matches.</p><span className="intel-heading__status"><i /> BATTLEFY BRACKETS // LIVE SCORE DEMO</span></div>
    <div className="intel-panel" data-reveal style={{ '--reveal-delay': '120ms' }}><div className="intel-panel__top"><span><i /> NOW PLAYING</span><strong>{currentFeed[0]} <em>{currentFeed[1]}</em></strong><small>{currentFeed[2]}</small></div><div className="score-card"><div><span>{match.teamA}</span><strong>{match.scoreA}</strong><small>ROUND WINNER</small></div><b>:</b><div><span>{match.teamB}</span><strong>{match.scoreB}</strong><small>{match.roundLabel}</small></div><div className="score-card__live"><i /> {match.status}</div></div><div className="round-meter"><span>ROUND PROGRESS</span><div><b style={{ width: `${match.progress}%` }} /></div><strong>{match.progress}%</strong></div><div className="kill-feed">{killFeedData.map(([actor, action, detail], index) => <div className={index === feedIndex ? 'is-current' : ''} key={`${actor}-${action}`}><span>{actor}</span><b>{action}</b><small>{detail}</small></div>)}</div></div>
    <OfficialBracketPanel cs2Rounds={bracketData} cs2Edited={cs2Edited} cs2TeamName={cs2TeamName} />
    <div className="poll-panel" data-reveal style={{ '--reveal-delay': '280ms' }}><div><p className="eyebrow"><span className="slash" />CROWD CONTROL</p><h3>WHO GETS THE<br /><em>FINAL ANGLE?</em></h3><p>Vote for the POV you want to see next. One vote per session.</p></div><div className="poll-options">{Object.entries(votes).map(([player, count]) => <button type="button" className={voted ? 'is-voted' : ''} key={player} onClick={() => vote(player)}><span><b>{player}</b><small>{Math.round((count / totalVotes) * 100)}%</small></span><i><em style={{ width: `${(count / totalVotes) * 100}%` }} /></i></button>)}</div>{voted && <span className="poll-confirmation">VOTE LOCKED // THE ROOM HEARD YOU</span>}</div>
  </section>;
}

function EventGallery() {
  const [filter, setFilter] = useState('ALL');
  const [activeItem, setActiveItem] = useState(null);
  const visibleItems = filter === 'ALL' ? galleryItems : galleryItems.filter((item) => item.category === filter);
  const move = (direction) => {
    const currentIndex = visibleItems.findIndex((item) => item.id === activeItem?.id);
    setActiveItem(visibleItems[(currentIndex + direction + visibleItems.length) % visibleItems.length]);
  };
  useEffect(() => {
    if (!activeItem) return undefined;
    const handleKey = (event) => {
      if (event.key === 'Escape') setActiveItem(null);
      if (event.key === 'ArrowRight') move(1);
      if (event.key === 'ArrowLeft') move(-1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeItem, filter]);
  return <><section id="community" className="section section--community" aria-labelledby="community-title"><div className="gallery-heading" data-reveal><p className="eyebrow eyebrow--light"><span className="slash" />EVENT ARCHIVE // 2026</p><h2 id="community-title">THE ROOM<br /><em>IN FRAME.</em></h2><p>Event photography, tournament moments, and the people behind every round—collected in one evolving archive.</p><span>LANFEST COLORADO // CASTLE ROCK</span></div><div className="gallery-body"><div className="gallery-filters" role="toolbar" aria-label="Filter event gallery">{['ALL', 'EVENT', 'TOURNAMENT', 'TEAM'].map((category) => <button className={filter === category ? 'is-active' : ''} type="button" key={category} onClick={() => setFilter(category)}>{category}</button>)}</div><div className="gallery-grid">{visibleItems.map((item) => <button type="button" className={`gallery-card gallery-card--${item.size || 'standard'}`} key={item.id} onClick={() => setActiveItem(item)} aria-label={`Open ${item.title} image`}><img src={item.image} alt="" style={{ objectPosition: item.position }} /><span>{item.category}</span><div><p>{item.meta}</p><h3>{item.title}</h3></div><i className="fa-solid fa-expand" aria-hidden="true" /></button>)}</div></div></section>{activeItem && <div className="gallery-lightbox" role="presentation" onClick={() => setActiveItem(null)}><div className="gallery-lightbox__inner" role="dialog" aria-modal="true" aria-labelledby="gallery-lightbox-title" onClick={(event) => event.stopPropagation()}><button className="gallery-lightbox__close" type="button" onClick={() => setActiveItem(null)} aria-label="Close image gallery"><i className="fa-solid fa-xmark" aria-hidden="true" /></button><figure><img src={activeItem.image} alt={activeItem.title} style={{ objectPosition: activeItem.position }} /></figure><aside><p>{activeItem.category} // IMAGE {String(visibleItems.findIndex((item) => item.id === activeItem.id) + 1).padStart(2, '0')}</p><h2 id="gallery-lightbox-title">{activeItem.title}</h2><span>{activeItem.meta}</span><p>{activeItem.caption}</p><div><button type="button" onClick={() => move(-1)} aria-label="Previous gallery image"><i className="fa-solid fa-arrow-left" aria-hidden="true" /> PREV</button><button type="button" onClick={() => move(1)} aria-label="Next gallery image">NEXT <i className="fa-solid fa-arrow-right" aria-hidden="true" /></button></div></aside></div></div>}</>;
}

function BrandMark() {
  return (
    <a className="brand-mark" href="#home" aria-label="8iT home">
      <img src="./assets/players-hq/8it-logo.png" alt="8iT" />
    </a>
  );
}
function ArrowIcon({ direction = 'up-right' }) { return <i className={`fa-solid fa-arrow-${direction}`} aria-hidden="true" />; }
function SectionLabel({ children, light = false }) { return <p className={`eyebrow ${light ? 'eyebrow--light' : ''}`}><span className="slash" />{children}</p>; }

function CampaignBanner({ image, label, title, caption, align = 'left', position = 'center' }) {
  return (
    <section className={`campaign-banner campaign-banner--${align}`} aria-label={`${label}: ${title}`}>
      <img className="campaign-banner__media" src={image} alt="" style={{ objectPosition: position }} />
      <span className="campaign-banner__shade" />
      <div className="campaign-banner__copy" data-reveal>
        <p>{label}</p>
        <h2>{title}</h2>
        <span>{caption}</span>
      </div>
      <div className="campaign-banner__index" aria-hidden="true">8iT // COLORADO</div>
    </section>
  );
}

function ChannelPlayer({ channel }) {
  const embedUrl = channel.type === 'twitch'
    ? `https://player.twitch.tv/?channel=${channel.handle}&parent=${window.location.hostname || 'localhost'}&autoplay=false`
    : `https://www.youtube-nocookie.com/embed/live_stream?channel=${channel.channelId}&rel=0`;

  return (
    <article className={`channel-card channel-card--${channel.tone}`}>
      <div className="channel-card__topline"><span className="channel-card__provider"><i className={`fa-brands ${channel.icon}`} aria-hidden="true" />{channel.platform}</span><span className="channel-card__signal"><span /> PLAYER</span></div>
      <div className="channel-card__embed"><iframe src={embedUrl} title={`${channel.handle} ${channel.platform} live player`} allow="autoplay; fullscreen; encrypted-media" allowFullScreen loading="lazy" /></div>
      <div className="channel-card__identity"><div className="channel-card__avatar" aria-hidden="true">{channel.handle.slice(0, 2).toUpperCase()}</div><div><p className="channel-card__label">LIVE PLAYER</p><h3>{channel.handle}</h3></div></div>
      <p className={`channel-card__role${channel.handle === 'FragWatch' ? ' player-name' : ''}`}>{channel.role}</p><p className="channel-card__description">{channel.description}</p>
      <a className="channel-card__cta" href={channel.url} target="_blank" rel="noreferrer">OPEN {channel.platform.toUpperCase()} <ArrowIcon /></a>
    </article>
  );
}

function ClipCard({ clip, onPlay }) {
  return (
    <article className="clip-card">
      <div className="clip-card__visual">
        <iframe src={`https://www.youtube-nocookie.com/embed/${clip.videoId}?autoplay=1&mute=1&loop=1&playlist=${clip.videoId}&controls=0&modestbranding=1&playsinline=1&rel=0`} title={`${clip.title} looping preview`} allow="autoplay; encrypted-media; picture-in-picture" loading="lazy" tabIndex="-1" />
        <span className="clip-card__shade" />
        <button className="clip-card__hitarea" type="button" onClick={() => onPlay(clip)} aria-label={`Open ${clip.title}`} />
        <span className="clip-card__duration">{clip.duration}</span>
      </div>
      <div className="clip-card__copy"><p className="clip-card__detail">{clip.detail}</p><h3>{clip.title}</h3><p className="clip-card__source">{clip.channel} <span>//</span> YOUTUBE</p></div>
    </article>
  );
}

export function App() {
  const [activeClip, setActiveClip] = useState(null);
  const [activePlayer, setActivePlayer] = useState(null);
  const [easterEgg, setEasterEgg] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [adminData, setAdminData] = useState(() => readAdminData());
  const audioContextRef = useRef(null);
  const currentEvent = { ...event, ...(adminData.event || {}) };
  const liveRoster = adminData.roster || roster;
  const liveSchedule = adminData.schedule || schedule;
  const liveBracket = swissToPublicBracket(adminData.swiss);
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
      <SiteHeader soundEnabled={soundEnabled} onToggleSound={toggleSound} />

      <main>
        <section id="home" className="hero" aria-labelledby="hero-title" style={{ backgroundImage: `url("${import.meta.env.BASE_URL}assets/banners/hero-a-site-clean.png")` }}><div className="hero__veil" /><Suspense fallback={<div className="hero__logo-3d" role="img" aria-label="8iT logo"><img className="hero__logo-fallback" src={`${import.meta.env.BASE_URL}assets/players-hq/8it-logo.png`} alt="" /></div>}><HeroLogo3D /></Suspense><div className="hero__scanline" /><div className="hero__content" data-reveal="hero-copy"><SectionLabel light>8iT // PLAY WITH US</SectionLabel><h1 id="hero-title">NO SAFE<br /><em>ROUNDS.</em></h1><p className="hero__copy">Looking for people to play with? Join 8iT on Discord, meet the squad, and get in the game.</p><div className="hero__actions"><a className="button button--primary" href={DISCORD_INVITE_URL} target="_blank" rel="noreferrer">PLAY WITH 8iT <ArrowIcon /></a><a className="button button--ghost" href="#broadcast">WATCH THE FEED <i className="fa-solid fa-play" aria-hidden="true" /></a></div></div><div className="hero__event-card" data-reveal="hero-card" style={{ '--reveal-delay': '180ms' }}><p className="hero__event-kicker">THE 8iT COMMUNITY</p><strong>YOUR NEXT SQUAD.</strong><span>PLAY / IMPROVE / DOMINATE</span><p className="hero__community-copy">Say hello on Discord. Find teammates. Keep the rounds going.</p><a href={DISCORD_INVITE_URL} target="_blank" rel="noreferrer">JOIN DISCORD <ArrowIcon /></a></div><div className="hero__side-note">01 <span /> 8iT / NEW DAWN</div></section>

        <section className="event-strip" aria-label="LANFest 2026 archive facts" data-reveal="strip"><div><span className="event-strip__number">04</span><span>FULL DAYS<br /><b>OF GAMING</b></span></div><div><span className="event-strip__number">330</span><span>SEATS<br /><b>IN THE ROOM</b></span></div><div><span className="event-strip__number">20</span><span>YEARS<br /><b>LANFEST COLORADO</b></span></div><div><span className="event-strip__number">∞</span><span>ROUNDS<br /><b>TO REMEMBER</b></span></div></section>

        <section id="team" className="section section--team" aria-labelledby="team-title"><div className="section-intro section-intro--team" data-reveal><SectionLabel>THE LINEUP</SectionLabel><h2 id="team-title">MEET THE<br /><em>SQUAD.</em></h2><p>Seven players. One roster. Built for Colorado.</p><div className="section-intro__links"><a className="text-link" href="./stats.html">EXPLORE ALL STATS <ArrowIcon /></a><a className="text-link" href="#recorded-maps">OFFICIAL MAP TABLES <ArrowIcon /></a><a className="text-link" href="#rematch-stats">FRIENDLY REMATCH TABLES <ArrowIcon /></a><a className="text-link" href="#overwatch-stats">OVERWATCH 2 STATS <ArrowIcon /></a></div></div><div className="roster-grid">{liveRoster.map(([name, role, status, channel], index) => {
          const recordedTotals = getRecordedPlayerTotals(name);
          const rematchTotals = getRematchTotals(getRematchPlayer(name));
          const overwatchTotals = getOverwatchPlayerTotals(name);
return <article className="roster-card roster-card--interactive" key={name} data-reveal style={{ '--reveal-delay': `${index * 70}ms` }} role="button" tabIndex="0" aria-label={`Open ${name} player profile${name === 'ghosted' ? ', also known as Zixxy' : ''}`} onClick={(clickEvent) => { if (!clickEvent.target.closest('a')) setActivePlayer({ name, role, channel }); }} onKeyDown={(keyEvent) => { if (keyEvent.key === 'Enter' || keyEvent.key === ' ') { keyEvent.preventDefault(); setActivePlayer({ name, role, channel }); } }}><RosterPortrait portrait={playerMedia[name]?.portrait} /><div className="roster-card__top"><span>{status}</span></div>{(recordedTotals || rematchTotals || overwatchTotals) && <div className="roster-card__stats">{(recordedTotals || rematchTotals) && <small>CS2 K / D / A · TWO MAPS EACH</small>}{recordedTotals && <div><span>OFFICIAL</span><strong>{recordedTotals.kills} / {recordedTotals.deaths} / {recordedTotals.assists}</strong></div>}{rematchTotals && <div><span>FRIENDLY</span><strong>{rematchTotals.kills} / {rematchTotals.deaths} / {rematchTotals.assists}</strong></div>}{overwatchTotals && <div className="roster-card__ow"><span>OVERWATCH 2</span><strong>{overwatchTotals.eliminations} E / {overwatchTotals.assists} A</strong></div>}</div>}{name === 'ghosted' && <span className="roster-card__alias">AKA ZIXXY</span>}<div className="roster-card__body"><h3>{name}</h3><p>{role}</p></div>{channel ? <a className="roster-card__link" href={`#broadcast-${channel}`} onClick={() => emitPulse(120)}>WATCH POV <ArrowIcon /></a> : <span className="roster-card__lock">CLICK FOR FILE</span>}</article>;
        })}</div></section>

        <CampaignBanner image="./assets/banners/loadout-ak.png" label="LOADOUT // ROUND READY" title="BUILT TO HOLD THE SITE." caption="8iT CUSTOM KIT // COLORADO DEPLOYMENT" align="right" position="center 46%" />

        <section id="matches" className="section section--schedule" aria-labelledby="schedule-title"><div className="schedule-heading" data-reveal><SectionLabel>LANFEST 2026 // EVENT ARCHIVE</SectionLabel><h2 id="schedule-title">FOUR DAYS.<br /><em>ONE STORY.</em></h2><p>September 24–27, 2026. A look back at the completed LANFest weekend.</p></div><div className="schedule-list">{liveSchedule.map(([number, day, title, copy], index) => <article className="schedule-row" key={number} data-reveal style={{ '--reveal-delay': `${index * 90}ms` }}><span className="schedule-row__number">{number}</span><span className="schedule-row__day">{day}</span><h3>{title}</h3><p>{copy}</p><span className="schedule-row__mark"><ArrowIcon direction="down" /></span></article>)}</div></section>

        <LiveMatchCenter bracketData={liveBracket} cs2Edited={JSON.stringify(adminData.swiss) !== JSON.stringify(defaultSwiss)} cs2TeamName={adminData.swiss.teams.find((team) => team.id === 'team-2')?.name || '8iT - Eight Inches and Thick'} killFeedData={liveKillFeed} liveMatchData={adminData.liveMatch} onPulse={() => emitPulse(92, 0.16)} />

        <RematchBracket rematch={adminData.rematch} />

        <RematchStats />

        <RecordedMatchStats />

        <OverwatchStats onOpenRosterPlayer={(rosterName) => { const row = liveRoster.find(([name]) => name === rosterName); if (row) setActivePlayer({ name: row[0], role: row[1], channel: row[3] }); }} />

        <TournamentPlacements />

        <CampaignBanner image="./assets/banners/precision-awp.png" label="PRECISION // LONG SIGHTLINE" title="EVERY ANGLE IS WATCHED." caption="ONE ROUND AT A TIME // LIVE FROM COLORADO" position="center 42%" />

        <section id="hype" className="section section--hype" aria-labelledby="hype-title"><div className="hype-heading" data-reveal><div><SectionLabel light><span className="player-name">Hanosandy</span> // FRAGWATCH REPLAYS</SectionLabel><h2 id="hype-title">WATCH THE<br /><em>ROOM ERUPT.</em></h2></div><p>Actual LANFest tournament streams from Hanosandy's FragWatch channel, including our CS2, Battlefield 4, and Overwatch runs.</p></div><div className="clip-grid">{clips.map((clip, index) => <div id={`clip-${clip.videoId}`} className="clip-reveal" key={clip.videoId} data-reveal style={{ '--reveal-delay': `${index * 90}ms`, scrollMarginTop: '90px' }}><ClipCard clip={clip} onPlay={setActiveClip} /></div>)}</div></section>

        <section id="broadcast" className="section section--broadcast" aria-labelledby="broadcast-title"><div className="broadcast-intro" data-reveal><SectionLabel>LIVE EVENT FEED</SectionLabel><h2 id="broadcast-title">WATCH 8iT<br /><em>LIVE.</em></h2><p>Choose your angle. Official coverage, player POVs, and the post-match story all live here.</p><div className="broadcast-intro__rule" /><p className="broadcast-intro__micro">STREAM LINKS // EVENT DAY NETWORK</p></div><div className="channel-grid">{channels.map((channel, index) => <div id={`broadcast-${channel.handle}`} key={channel.handle} data-reveal style={{ '--reveal-delay': `${index * 100}ms` }}><ChannelPlayer channel={channel} /></div>)}</div></section>

        <CampaignBanner image="./assets/banners/utility-smoke.png" label="UTILITY // MAP CONTROL" title="CONTROL THE CHOKE POINT." caption="SMOKE DOWN // ENTRY TEAM MOVING" position="center 54%" />

        <section id="tickets" className="section section--tickets" aria-labelledby="tickets-title"><div className="tickets-heading" data-reveal><SectionLabel>PLAY WITH 8iT</SectionLabel><h2 id="tickets-title">FIND YOUR<br /><em>NEXT SQUAD.</em></h2><p>The LAN weekend is in the archive. The community keeps playing. Join us on Discord to meet the squad and find people to play with.</p><a className="button button--primary" href={DISCORD_INVITE_URL} target="_blank" rel="noreferrer">JOIN DISCORD <ArrowIcon /></a></div><div className="ticket-grid">{communityPaths.map(([name, action, detail, tag, href, label], index) => <article className={`ticket-card ${index === 0 ? 'ticket-card--featured' : ''}`} key={name} data-reveal style={{ '--reveal-delay': `${index * 90}ms` }}><span className="ticket-card__tag">{tag}</span><p className="ticket-card__index">0{index + 1} // CONNECT</p><h3>{name}</h3><strong>{action}</strong><p>{detail}</p><a href={href} target={href === DISCORD_INVITE_URL ? '_blank' : undefined} rel={href === DISCORD_INVITE_URL ? 'noreferrer' : undefined}>{label} <ArrowIcon /></a></article>)}</div></section>

        <EventGallery />

        <CampaignBanner image="./assets/banners/close-quarters-knife.png" label="CLOSE QUARTERS // FINAL SIGNAL" title="THE ROUNDS KEEP GOING." caption="NO SAFE ROUNDS // 8iT" position="center 48%" />

        <section id="about" className="section section--about" aria-labelledby="about-title"><div className="about-statement" data-reveal><SectionLabel>THE BIGGER PICTURE</SectionLabel><h2 id="about-title">PLAY HARD.<br /><em>DO GOOD.</em></h2></div><div className="about-copy" data-reveal style={{ '--reveal-delay': '120ms' }}><p>LANFest Colorado has spent two decades building healthy communities through gaming. The 2026 anniversary event brought the Front Range together for four days of play, competition, and charity.</p><a className="text-link" href={currentEvent.officialUrl} target="_blank" rel="noreferrer">LEARN ABOUT LANFEST <ArrowIcon /></a></div><div className="venue-card" data-reveal style={{ '--reveal-delay': '220ms' }}><p className="eyebrow">THE VENUE</p><h3>{currentEvent.venue}</h3><p>{currentEvent.address}</p><a href="https://maps.google.com/?q=Douglas+County+Fairgrounds+and+Event+Center+Castle+Rock+CO" target="_blank" rel="noreferrer">OPEN MAPS <ArrowIcon /></a></div></section>
      </main>

      <footer className="site-footer"><BrandMark /><p><i className="fa-solid fa-person-rifle" aria-hidden="true" /> 8iT // EVERLAN COLORADO</p><div className="footer-links"><a href="./stats.html">TOURNAMENT STATS</a><a href="./shop.html">8iT SHOP</a><a href="./admin.html">CONTROL ROOM</a><a href={currentEvent.officialUrl} target="_blank" rel="noreferrer">LANFEST COLORADO</a><a href={DISCORD_INVITE_URL} target="_blank" rel="noreferrer">JOIN DISCORD</a><a href="#home">BACK TO TOP <ArrowIcon direction="up" /></a></div></footer>

      {activeClip && <div className="clip-modal" role="dialog" aria-modal="true" aria-label={`${activeClip.title} video`} onClick={() => setActiveClip(null)}><div className="clip-modal__inner" onClick={(eventClick) => eventClick.stopPropagation()}><button className="clip-modal__close" type="button" onClick={() => setActiveClip(null)} aria-label="Close video"><i className="fa-solid fa-xmark" aria-hidden="true" /></button><div className="clip-modal__player"><iframe src={`https://www.youtube-nocookie.com/embed/${activeClip.videoId}?autoplay=1&rel=0`} title={activeClip.title} allow="autoplay; fullscreen" allowFullScreen /></div><p>{activeClip.detail}</p><h2>{activeClip.title}</h2></div></div>}
      {activePlayer && <PlayerSpotlight player={activePlayer} onClose={() => setActivePlayer(null)} />}
      {easterEgg && <div className="easter-egg" role="dialog" aria-modal="true" aria-label="8iT secret unlocked" onClick={() => setEasterEgg(false)}><div className="easter-egg__inner" onClick={(eventClick) => eventClick.stopPropagation()}><button className="clip-modal__close" type="button" onClick={() => setEasterEgg(false)} aria-label="Close secret"><i className="fa-solid fa-xmark" aria-hidden="true" /></button><p className="eyebrow eyebrow--light"><span className="slash" />SECRET SIGNAL // 8iT</p><h2>YOU FOUND<br /><em>THE BACKDOOR.</em></h2><p>PLAY / IMPROVE / DOMINATE. The room remembers the ones who look closer.</p><span className="easter-egg__code">↑ ↑ ↓ ↓ ← → ← → B A</span></div></div>}
    </>
  );
}
