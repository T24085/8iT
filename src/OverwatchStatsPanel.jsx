import { getOverwatchPlayerMaps, getOverwatchPlayerTotals, overwatchMaps } from './overwatchStats.js';
import './overwatch-stats.css';

const rosterNames = {
  Hanosandy: 'Hanosandy',
  Hellaturtlz: 'Hellaturtlz',
  Pandora: 'PandaMonium',
};

const number = (value) => value.toLocaleString();
export const overwatchLine = ({ eliminations, assists, deaths }) =>
  `${eliminations} / ${assists} / ${deaths ?? '—'}`;

export function OverwatchStats({ onOpenRosterPlayer, onStatsPage = false }) {
  const players = overwatchMaps[0].players.map(({ name }) => ({
    name,
    rosterName: rosterNames[name],
    maps: getOverwatchPlayerMaps(name),
    totals: getOverwatchPlayerTotals(name),
  }));

  return <section id="overwatch-stats" className={`${onStatsPage ? 'stats-section' : 'section'} overwatch-stats`} aria-labelledby="overwatch-stats-title">
    <div className="overwatch-stats__intro">
      <div><p className="eyebrow eyebrow--light"><span className="slash" />OVERWATCH 2 // VIDEO SCOREBOARDS</p><h2 id="overwatch-stats-title">TWO MAPS.<br /><em>FIVE PLAYERS.</em></h2></div>
      <p>The completed Ilios and Suravasa scoreboards from the LANFest recording. Overwatch eliminations, assists, deaths, damage, healing, and mitigation stay in their own game section.</p>
    </div>

    <div className="overwatch-stats__scores" aria-label="Overwatch map results">
      {overwatchMaps.map(({ map, mode, score, videoTime }) => <article className="overwatch-stats__score" key={map}>
        <div><span>{mode.toUpperCase()} // FINAL</span><h3>{map}</h3><small>STREAM {videoTime}</small></div>
        <div className="overwatch-stats__scoreline" aria-label={`8iT ${score[0]}, opponent ${score[1]}`}><span>8iT</span><strong>{score[0]} <i>:</i> {score[1]}</strong><span>OPPONENT</span></div>
      </article>)}
    </div>

    <div className="overwatch-stats__subhead"><h3>Overwatch player files</h3><span>E / A / D = ELIMINATIONS / ASSISTS / DEATHS</span></div>
    <div className="overwatch-stats__players">
      {players.map(({ name, rosterName, maps, totals }) => <article className="overwatch-stats__player" key={name} id={`ow-player-${name.toLowerCase()}`}>
        <div className="overwatch-stats__player-head"><div><span>OVERWATCH 2 // 2 FINAL MAPS</span><h4>{name}</h4>{rosterName && rosterName.toLowerCase() !== name.toLowerCase() && <small>SITE ROSTER: {rosterName}</small>}</div><div><strong>{totals.eliminations}</strong><span>ELIMINATIONS</span></div></div>
        <div className="overwatch-stats__table-wrap"><table>
          <caption className="sr-only">{name} final Overwatch statistics by map</caption>
          <thead><tr><th scope="col">MAP</th><th scope="col">E / A / D</th><th scope="col">DMG</th><th scope="col">HEAL</th><th scope="col">MIT</th></tr></thead>
          <tbody>{maps.map(({ map, stats }) => <tr key={map}><th scope="row">{map}</th><td>{overwatchLine(stats)}</td><td>{number(stats.damage)}</td><td>{number(stats.healing)}</td><td>{number(stats.mitigation)}</td></tr>)}</tbody>
        </table></div>
        {rosterName && onOpenRosterPlayer && <button className="overwatch-stats__profile-link" type="button" onClick={() => onOpenRosterPlayer(rosterName)}>OPEN {rosterName.toUpperCase()} PROFILE ↗</button>}
      </article>)}
    </div>
    <p className="overwatch-stats__note">Hanosandy’s Suravasa death count is hidden by the stream overlay. The later Blizzard World gameplay cuts off before a final scoreboard. These map scores are in-game rounds or points, separate from Battlefy match-series results. <a href={onStatsPage ? 'https://www.youtube.com/watch?v=TkT2AEMJTxY' : '#clip-TkT2AEMJTxY'} target={onStatsPage ? '_blank' : undefined} rel={onStatsPage ? 'noreferrer' : undefined}>WATCH THE REPLAY ↗</a></p>
  </section>;
}
