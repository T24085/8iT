import { displayPlayerName } from './playerIdentity';
import { recordedCompetitiveMaps, vertigoDeathmatch } from './recordedMatchStats';
import './recorded-matches.css';

function CompetitiveLineup({ map, team }) {
  return <div className="recorded-maps__lineup">
    <h4>{team.label}</h4>
    <div className="recorded-maps__table-wrap"><table>
      <caption className="sr-only">{team.label} final player stats on {map}</caption>
      <thead><tr><th scope="col">PLAYER</th><th scope="col">K / D / A</th><th scope="col">HS%</th><th scope="col">DMG</th></tr></thead>
      <tbody>{team.players.map((player) => <tr key={player.name}><th scope="row">{displayPlayerName(player.name)}</th><td>{player.kills} / {player.deaths} / {player.assists}</td><td>{player.hs}%</td><td>{player.damage.toLocaleString()}</td></tr>)}</tbody>
    </table></div>
  </div>;
}

export function RecordedMatchStats() {
  return <section id="recorded-maps" className="section recorded-maps" aria-labelledby="recorded-maps-title">
    <div className="recorded-maps__intro" data-reveal>
      <div><p className="eyebrow eyebrow--light"><span className="slash" />OFFICIAL TOURNAMENT FOOTAGE // SCOREBOARDS</p><h2 id="recorded-maps-title">TWO MAPS.<br /><em>EVERY LINE.</em></h2></div>
      <p>Final in-game scoreboard figures supplied by the team. The lobby team names below are shown as transcribed; their exact Battlefy bracket-row names have not yet been confirmed. These official-match stats are separate from the later friendly rematch.</p>
    </div>
    <div className="recorded-maps__list">{recordedCompetitiveMaps.map((map, index) => <article className="recorded-maps__card" key={map.map} data-reveal>
      <div className="recorded-maps__card-head"><div><span>COMPETITIVE MAP 0{index + 1} // FINAL</span><h3>{map.map}</h3></div><div className="recorded-maps__score" aria-label={`${map.sides[0].label} ${map.sides[0].score}, ${map.sides[1].label} ${map.sides[1].score}`}><span>{map.sides[0].label} <b>{map.sides[0].score}</b></span><i>—</i><span>{map.sides[1].label} <b>{map.sides[1].score}</b></span></div></div>
      <div className="recorded-maps__lineups">{map.teams.map((team) => <CompetitiveLineup key={team.label} map={map.map} team={team} />)}</div>
      <p className="recorded-maps__card-note">WINNER // {map.winner} <span>·</span> K/D/A = KILLS / DEATHS / ASSISTS <span>·</span> DMG = TOTAL DAMAGE</p>
    </article>)}</div>
    <article className="recorded-maps__deathmatch" data-reveal>
      <div><span>BETWEEN COMPETITIVE MAPS // DEATHMATCH</span><h3>{vertigoDeathmatch.map}</h3><p>Individual points only—no team map score. This does not count as a competitive match result.</p></div>
      <div className="recorded-maps__table-wrap"><table><caption className="sr-only">8iT player points on the Vertigo deathmatch</caption><thead><tr><th scope="col">PLAYER</th><th scope="col">POINTS</th><th scope="col">K / D / A</th></tr></thead><tbody>{vertigoDeathmatch.players.map((player) => <tr key={player.name}><th scope="row">{displayPlayerName(player.name)}</th><td>{player.points}</td><td>{player.kills} / {player.deaths} / {player.assists}</td></tr>)}</tbody></table></div>
    </article>
    <p className="recorded-maps__end-note">A later map begins in the recording, but the capture cuts away before a final result. No outcome is listed for it.</p>
  </section>;
}
