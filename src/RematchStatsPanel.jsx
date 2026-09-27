import { rematchMaps, rematchPlayerStats } from './rematchStats';
import { displayPlayerName } from './playerIdentity';
import './rematch-stats.css';

export function RematchStats() {
  return <section id="rematch-stats" className="section rematch-stats" aria-labelledby="rematch-stats-title">
    <div className="rematch-stats__intro" data-reveal>
      <div><p className="eyebrow eyebrow--light"><span className="slash" />UNOFFICIAL RUNBACK // PLAYER STATS</p><h2 id="rematch-stats-title">THE <em>NUMBERS.</em></h2></div>
      <p>Five 8iT players from the Train and Ancient friendly rematch. Score, K/D/A, and HS% come from the supplied post-map-card transcription and have not been independently video-verified. Opponent player stats were not provided.</p>
    </div>
    <div className="rematch-stats__maps">{rematchMaps.map((map, index) => <div className="rematch-stats__map" key={map} data-reveal style={{ '--reveal-delay': `${index * 90}ms` }}>
      <div className="rematch-stats__map-head"><span>MAP 0{index + 1} // FRIENDLY</span><h3>{map}</h3><small>8iT PLAYERS ONLY</small></div>
      <div className="rematch-stats__table-wrap"><table><caption className="sr-only">8iT player stats on {map} in the unofficial rematch</caption><thead><tr><th scope="col">PLAYER</th><th scope="col">SCORE</th><th scope="col">K / D / A</th><th scope="col">HS%</th></tr></thead><tbody>{rematchPlayerStats.map((player) => {
        const stats = player.maps[map];
        return <tr key={player.name}><th scope="row">{displayPlayerName(player.name)}</th><td>{stats.score}</td><td>{stats.kills} / {stats.deaths} / {stats.assists}</td><td>{stats.hs}%</td></tr>;
      })}</tbody></table></div>
    </div>)}</div>
    <p className="rematch-stats__note">K / D / A = kills / deaths / assists. These two maps are an exhibition only and do not change 8iT's 2–1 official CS2 record.</p>
  </section>;
}
