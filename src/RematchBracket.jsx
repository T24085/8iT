import { defaultRematch, official8itResults } from './siteData';
import './rematch.css';

const bracketUrl = 'https://battlefy.com/lanfest-colorado_/counter-strike-2-lanfest-co-2026/6a8cde95296df400264cad3f/brackets';

export function RematchBracket({ rematch = defaultRematch }) {
  const opponent = rematch?.opponent?.trim() || 'Opponent to confirm';
  const maps = Array.isArray(rematch?.maps) ? rematch.maps.slice(0, 2) : defaultRematch.maps;

  return <section id="rematch" className="section rematch-story" aria-labelledby="rematch-title">
    <div className="rematch-story__official" data-reveal>
      <div className="rematch-story__official-head"><div><p className="eyebrow"><span className="slash" />OFFICIAL LANFEST // SWISS STAGE</p><h2>THE RECORD: <em>2–1.</em></h2></div><a href={bracketUrl} target="_blank" rel="noreferrer">VERIFY ON BATTLEFY <i className="fa-solid fa-arrow-up-right" aria-hidden="true" /></a></div>
      <div className="rematch-story__official-grid">{official8itResults.map((match) => <article className="rematch-story__official-match" key={match.round}><span>ROUND {String(match.round).padStart(2, '0')} <b className={match.result === 'WIN' ? 'is-win' : 'is-loss'}>{match.result}</b></span><strong>8iT <i>vs</i> {match.opponent}</strong><small>{match.seriesScore} BEST-OF-ONE MATCH // NOT CS ROUNDS</small></article>)}</div>
    </div>

    <div className="rematch-story__heading" data-reveal>
      <p className="eyebrow eyebrow--light"><span className="slash" />EXHIBITION // AFTER THE BRACKET</p>
      <h2 id="rematch-title">THE <em>RUNBACK.</em></h2>
      <p>After the official loss, 8iT faced {opponent} again in a friendly rematch. The team-reported outcome stands on its own; it does not change the tournament record.</p>
      <span className="rematch-story__stamp">FRIENDLY ONLY <i /> NOT IN OFFICIAL STANDINGS</span>
    </div>

    <div className="rematch-path" aria-label={`Friendly rematch against ${opponent}`} data-reveal style={{ '--reveal-delay': '120ms' }}>
      <div className="rematch-path__rounds">{maps.map((map, index) => {
        const hasScore = String(map?.ourScore ?? '').trim() !== '' && String(map?.opponentScore ?? '').trim() !== '';
        return <article className="rematch-map" key={index}>
          <div className="rematch-map__top"><span>MAP {String(index + 1).padStart(2, '0')}</span><small>FRIENDLY REMATCH</small></div>
          <h3>{map?.name || `Map ${index + 1} — unconfirmed`}</h3>
          <div className="rematch-map__teams"><span>8iT <b>{hasScore ? map.ourScore : '—'}</b></span><span>{opponent} <b>{hasScore ? map.opponentScore : '—'}</b></span></div>
          <p>{hasScore ? 'MAP SCORE // TEAM REPORTED' : 'ROUND SCORE // NOT REPORTED'}</p>
        </article>;
      })}</div>
      <div className="rematch-path__connector" aria-hidden="true"><span /><i /></div>
      <div className="rematch-result"><span>FRIENDLY OUTCOME // TEAM REPORTED</span><strong>{rematch?.outcome || 'RESULT TO CONFIRM'}</strong><small>Separate from the official LANFest Swiss bracket.</small></div>
    </div>
  </section>;
}
