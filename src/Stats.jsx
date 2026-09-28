import { useMemo, useState } from 'react';
import { defaultRematch, deriveSwissStandings, readAdminData } from './siteData.js';
import { getTeamRecord, officialTournamentBrackets } from './tournamentBrackets.js';
import { getMapScorelines, getOfficialOpponentRows, getOfficialTeamOutput, getPlayerMapRows, getPlayerSummaries } from './statsAnalytics.js';
import { OverwatchStats } from './OverwatchStatsPanel.jsx';
import { SiteHeader } from './SiteHeader.jsx';
import './stats.css';

const number = (value) => Number(value).toLocaleString();
const recordedMaps = ['Dust II', 'Inferno'];
const friendlyMaps = ['Train', 'Ancient'];
const metricOptions = {
  official: [['kills', 'Kills'], ['deaths', 'Deaths'], ['assists', 'Assists'], ['damage', 'Damage']],
  friendly: [['kills', 'Kills'], ['deaths', 'Deaths'], ['assists', 'Assists'], ['score', 'Score']],
};

function StatHeading({ eyebrow, title, note, id }) {
  return <div className="stats-heading"><div><span>{eyebrow}</span><h2 id={id}>{title}</h2></div>{note && <p>{note}</p>}</div>;
}

function ScopeSwitch({ scope, onChange }) {
  return <div className="stats-scope" role="group" aria-label="Select match scope">
    <button type="button" className={scope === 'official' ? 'is-active' : ''} aria-pressed={scope === 'official'} onClick={() => onChange('official')}>OFFICIAL MAPS <small>02</small></button>
    <button type="button" className={scope === 'friendly' ? 'is-active' : ''} aria-pressed={scope === 'friendly'} onClick={() => onChange('friendly')}>FRIENDLY REMATCH <small>02</small></button>
  </div>;
}

function PlayerMetricChart({ players, metric, scope }) {
  const max = Math.max(1, ...players.map((player) => player[metric]));
  const label = metricOptions[scope].find(([key]) => key === metric)?.[1] || metric;
  const rows = [...players].sort((a, b) => b[metric] - a[metric] || a.player.localeCompare(b.player));
  return <figure className="stats-panel stats-panel--wide">
    <figcaption><div><span>PLAYER COMPARISON // {scope.toUpperCase()}</span><h3>{label} by player</h3></div><small>TWO MAPS PER PLAYER · ZERO BASELINE</small></figcaption>
    <div className="stats-bar-chart" aria-label={`${label} by player, ${scope} maps`}>
      {rows.map((player) => <div className="stats-bar-row" key={player.player}>
        <span className="stats-bar-row__name">{player.player}</span>
        <div className="stats-bar-row__track"><i style={{ width: `${player[metric] / max * 100}%` }} /></div>
        <strong>{number(player[metric])}</strong>
      </div>)}
      <div className="stats-axis"><span>0</span><span>{number(Math.round(max / 2))}</span><span>{number(max)}</span></div>
    </div>
  </figure>;
}

function HeadshotChart({ rows, scope }) {
  const maps = scope === 'official' ? recordedMaps : friendlyMaps;
  const players = [...new Set(rows.map((row) => row.player))].sort((a, b) => a.localeCompare(b));
  return <figure className="stats-panel">
    <figcaption><div><span>ACCURACY // PER MAP</span><h3>Headshot rate</h3></div><small>NOT AN AGGREGATED RATE</small></figcaption>
    <div className="stats-legend"><span><i />{maps[0]}</span><span><i />{maps[1]}</span></div>
    <div className="stats-hs-chart">{players.map((player) => <div className="stats-hs-row" key={player}>
      <b>{player}</b>
      {maps.map((map, index) => {
        const item = rows.find((row) => row.player === player && row.map === map);
        return <div className="stats-hs-measure" key={map}><span>{map}</span><div><i className={index ? 'is-second' : ''} style={{ width: `${item?.hs ?? 0}%` }} /></div><strong>{item?.hs ?? '—'}%</strong></div>;
      })}
    </div>)}</div>
    <div className="stats-hs-axis"><span>0%</span><span>50%</span><span>100%</span></div>
    <p className="stats-panel__foot">Each percentage is the supplied in-game value for that map. Map percentages are not averaged.</p>
  </figure>;
}

function DamageChart({ rows }) {
  const maps = recordedMaps;
  const players = [...new Set(rows.map((row) => row.player))].map((name) => ({
    name,
    values: maps.map((map) => rows.find((row) => row.player === name && row.map === map)?.damage || 0),
  })).sort((a, b) => b.values.reduce((sum, value) => sum + value, 0) - a.values.reduce((sum, value) => sum + value, 0));
  const max = Math.max(...players.map((player) => player.values[0] + player.values[1]));
  return <figure className="stats-panel">
    <figcaption><div><span>OFFICIAL FOOTAGE // PLAYER OUTPUT</span><h3>Total damage</h3></div><small>MAP SEGMENTS ADD TO TOTAL</small></figcaption>
    <div className="stats-legend"><span><i />Dust II</span><span><i />Inferno</span></div>
    <div className="stats-damage-chart">{players.map((player) => <div className="stats-damage-row" key={player.name}>
      <b>{player.name}</b><div className="stats-damage-row__track">{player.values.map((value, index) => <i key={maps[index]} className={index ? 'is-second' : ''} style={{ width: `${value / max * 100}%` }} title={`${maps[index]}: ${number(value)} damage`} />)}</div><strong>{number(player.values[0] + player.values[1])}</strong>
    </div>)}</div>
    <div className="stats-hs-axis"><span>0</span><span>{number(Math.round(max / 2))}</span><span>{number(max)}</span></div>
  </figure>;
}

function MapScorelines({ rematch }) {
  const official = getMapScorelines('official');
  const friendly = getMapScorelines('friendly', rematch);
  const max = Math.max(20, ...[...official, ...friendly].flatMap((row) => [row.us, row.them]));
  return <div className="stats-score-groups">
    {[['OFFICIAL // LOBBY LABELS', official], ['FRIENDLY // EXHIBITION', friendly]].map(([title, maps]) => <div className="stats-score-group" key={title}>
      <h3>{title}</h3>
      {maps.length ? maps.map((map) => <article className="stats-score-card" key={map.map}>
        <div className="stats-score-card__head"><div><span>CS2 // FINAL</span><h4>{map.map}</h4></div><strong className={map.us > map.them ? 'is-win' : 'is-loss'}>{map.us > map.them ? 'WIN' : 'LOSS'}</strong></div>
        <div className="stats-score-card__bars"><div><span>8iT</span><div><i style={{ width: `${map.us / max * 100}%` }} /></div><b>{map.us}</b></div><div><span>{map.opponent}</span><div><i style={{ width: `${map.them / max * 100}%` }} /></div><b>{map.them}</b></div></div>
        <small>IN-GAME ROUNDS // 0–{max} SCALE</small>
      </article>) : <p>No final scores entered for this scope.</p>}
    </div>)}
  </div>;
}

function PlayerTotalsTable({ players, scope }) {
  const sorted = [...players].sort((a, b) => b.kills - a.kills);
  return <><p className="stats-table-hint">SWIPE TABLE FOR MORE STATS →</p><div className="stats-table-wrap"><table><caption className="sr-only">Two-map {scope} player totals</caption><thead><tr><th scope="col">PLAYER</th><th scope="col">MAPS</th><th scope="col">K</th><th scope="col">D</th><th scope="col">A</th><th scope="col">K/D</th><th scope="col">+/−</th><th scope="col">{scope === 'official' ? 'DMG' : 'SCORE'}</th></tr></thead><tbody>{sorted.map((player) => <tr key={player.player}><th scope="row">{player.displayName}</th><td>{player.maps}</td><td>{player.kills}</td><td>{player.deaths}</td><td>{player.assists}</td><td>{player.kd?.toFixed(2) ?? '—'}</td><td>{player.differential > 0 ? '+' : ''}{player.differential}</td><td>{number(scope === 'official' ? player.damage : player.score)}</td></tr>)}</tbody></table></div></>;
}

function ScoreboardTable({ rows, scope }) {
  const [selectedPlayer, setSelectedPlayer] = useState('all');
  const [sortKey, setSortKey] = useState('kills');
  const players = [...new Set(rows.map((row) => row.player))].sort();
  const sorted = rows.filter((row) => selectedPlayer === 'all' || row.player === selectedPlayer)
    .sort((a, b) => b[sortKey] - a[sortKey] || a.player.localeCompare(b.player) || a.map.localeCompare(b.map));
  return <section className="stats-section" id="scoreboards" aria-labelledby="scoreboards-title">
    <StatHeading eyebrow="04 // EVERY RECORDED LINE" title="The scoreboards." id="scoreboards-title" note="Filter by player or sort the supplied per-map figures. The table follows the selected official or friendly scope." />
    <div className="stats-table-tools"><label>PLAYER<select value={selectedPlayer} onChange={(event) => setSelectedPlayer(event.target.value)}><option value="all">ALL FIVE PLAYERS</option>{players.map((player) => <option value={player} key={player}>{player}</option>)}</select></label><label>SORT BY<select value={sortKey} onChange={(event) => setSortKey(event.target.value)}>{[['kills', 'KILLS'], ['deaths', 'DEATHS'], ['assists', 'ASSISTS'], ['hs', 'HEADSHOT %'], [scope === 'official' ? 'damage' : 'score', scope === 'official' ? 'DAMAGE' : 'SCORE']].map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><span>{sorted.length} MAP–PLAYER ROWS</span></div>
    <p className="stats-table-hint">SWIPE TABLE FOR MORE STATS →</p>
    <div className="stats-table-wrap stats-table-wrap--detail"><table><caption className="sr-only">{scope} player scoreboard by map</caption><thead><tr><th scope="col">MAP</th><th scope="col">PLAYER</th><th scope="col">K</th><th scope="col">D</th><th scope="col">A</th><th scope="col">K/D</th><th scope="col">HS%</th><th scope="col">{scope === 'official' ? 'DMG' : 'SCORE'}</th></tr></thead><tbody>{sorted.map((row) => <tr key={`${row.map}-${row.player}`}><td>{row.map}</td><th scope="row">{row.displayName}</th><td>{row.kills}</td><td>{row.deaths}</td><td>{row.assists}</td><td>{row.deaths ? (row.kills / row.deaths).toFixed(2) : '—'}</td><td>{row.hs}%</td><td>{number(scope === 'official' ? row.damage : row.score)}</td></tr>)}</tbody></table></div>
  </section>;
}

function OpponentScoreboards() {
  const rows = getOfficialOpponentRows();
  const output = getOfficialTeamOutput();
  const maxDamage = Math.max(...output.map((team) => team.damage));
  return <section className="stats-section stats-section--opponents" aria-labelledby="opponents-title">
    <StatHeading eyebrow="05 // THE OTHER SIDE" title="Know the opposition." id="opponents-title" note="The available official scoreboards also include both opposing five-player teams. These totals are for the recorded maps only; friendly opponent player stats were not provided." />
    <figure className="stats-panel stats-team-output"><figcaption><div><span>OFFICIAL FOOTAGE // BOTH TEAMS</span><h3>Team damage by map</h3></div><small>SUM OF FIVE PLAYER DAMAGE LINES · ZERO BASELINE</small></figcaption>
      {recordedMaps.map((map) => <div className="stats-team-output__map" key={map}><h4>{map}</h4>{output.filter((team) => team.map === map).map((team) => <div className="stats-team-output__row" key={team.team}><b>{team.team}</b><div><i className={team.isUs ? 'is-us' : ''} style={{ width: `${team.damage / maxDamage * 100}%` }} /></div><strong>{number(team.damage)}</strong></div>)}</div>)}
      <div className="stats-team-output__axis"><span>0</span><span>{number(Math.round(maxDamage / 2))}</span><span>{number(maxDamage)}</span></div>
    </figure>
    <div className="stats-subheading"><h3>Opponent player lines</h3><span>DUST II + INFERNO // OFFICIAL ONLY</span></div>
    <p className="stats-table-hint">SWIPE TABLE FOR MORE STATS →</p>
    <div className="stats-table-wrap"><table><caption className="sr-only">Recorded official opponent player scoreboards</caption><thead><tr><th scope="col">MAP</th><th scope="col">TEAM</th><th scope="col">PLAYER</th><th scope="col">K</th><th scope="col">D</th><th scope="col">A</th><th scope="col">HS%</th><th scope="col">DMG</th></tr></thead><tbody>{rows.map((row) => <tr key={`${row.map}-${row.name}`}><td>{row.map}</td><td>{row.team}</td><th scope="row">{row.name}</th><td>{row.kills}</td><td>{row.deaths}</td><td>{row.assists}</td><td>{row.hs}%</td><td>{number(row.damage)}</td></tr>)}</tbody></table></div>
  </section>;
}

function SwissRecord({ swiss }) {
  const team = deriveSwissStandings(swiss).find((row) => row.id === 'team-2');
  return <strong>{team ? `${team.wins}–${team.losses}` : '—'}</strong>;
}

export function Stats() {
  const [scope, setScope] = useState('official');
  const [metric, setMetric] = useState('kills');
  const [adminData] = useState(() => readAdminData());
  const rows = useMemo(() => getPlayerMapRows(scope), [scope]);
  const summaries = useMemo(() => getPlayerSummaries(scope), [scope]);
  const officialRows = useMemo(() => getPlayerMapRows('official'), []);
  const rematch = adminData.rematch || defaultRematch;
  const bracketRecords = officialTournamentBrackets.map((bracket) => ({ ...bracket, record: getTeamRecord(bracket) }));
  const setScopeAndMetric = (nextScope) => { setScope(nextScope); setMetric('kills'); };
  return <div className="stats-page">
    <SiteHeader page="stats" ticketsUrl={adminData.event?.ticketsUrl} />
    <main>
      <section className="stats-hero" id="overview" aria-labelledby="stats-title" style={{ backgroundImage: 'url("./assets/banners/precision-awp.png")' }}><div className="stats-hero__shade" /><div className="stats-hero__content"><span>8iT // LANFEST COLORADO 2026 // FIELD REPORT</span><h1 id="stats-title">THE<br /><em>NUMBERS.</em></h1><p>Browse the supplied Counter-Strike 2 and Overwatch 2 scoreboards. Each game has its own player stats and map results.</p><a href="#players">EXPLORE PLAYER STATS <span>↘</span></a></div><div className="stats-hero__index"><b>02</b><span>RECORDED OFFICIAL MAPS</span><i /> <b>02</b><span>FRIENDLY REMATCH MAPS</span></div></section>

      <nav className="stats-jump-nav" aria-label="On this stats page"><span>ON THIS PAGE</span><a href="#players">CS2 PLAYERS</a><a href="#maps">CS2 MAPS</a><a href="#scoreboards">CS2 SCOREBOARDS</a><a href="#overwatch-stats">OVERWATCH 2</a></nav>

      <section className="stats-topline" aria-label="Event result summary"><div><small>OFFICIAL CS2 SWISS</small><SwissRecord swiss={adminData.swiss} /><span>Battlefy match record</span></div><div><small>CS2 PODIUM</small><strong>02<span>ND</span></strong><span>Team-reported finish</span></div><div><small>RECORDED CS2 MAPS</small><strong>02</strong><span>Final player scoreboards</span></div><div><small>CS2 PLAYER COVERAGE</small><strong>05<span>/07</span></strong><span>Roster players in footage</span></div></section>

      <section className="stats-section stats-section--record" aria-labelledby="record-title"><StatHeading eyebrow="01 // TOURNAMENT RECORD" title="Three games. Three podiums." id="record-title" note="Second-place finishes are team-reported. The linked Battlefy brackets document match wins and losses. The game-specific scoreboards below come from separate video evidence." /><div className="stats-podium-grid">{bracketRecords.map((bracket) => <article className="stats-podium" key={bracket.id}><div><span>{bracket.shortName}</span><b>02<small>ND</small></b></div><h3>{bracket.name}</h3><p>{bracket.record.wins} W <i>/</i> {bracket.record.losses} L <span>BRACKET RECORD</span></p><a href={bracket.sourceUrl} target="_blank" rel="noreferrer">VIEW BATTLEFY BRACKET ↗</a></article>)}</div><p className="stats-caveat">Coverage note: the two recorded official CS2 maps below are a subset of the tournament. Their lobby opponent names have not been matched to specific Battlefy bracket rows. Friendly results do not change the Swiss record.</p></section>

      <section className="stats-section" id="players" aria-labelledby="players-title"><StatHeading eyebrow="02 // COUNTER-STRIKE 2 PLAYERS" title="Who did what." id="players-title" note="All player totals cover exactly two maps in the selected scope. K/D is kills divided by deaths; +/− is kills minus deaths. Missing player scoreboards are not treated as zero." /><ScopeSwitch scope={scope} onChange={setScopeAndMetric} /><div className="stats-metric-select" role="group" aria-label="Chart metric">{metricOptions[scope].map(([value, label]) => <button key={value} type="button" className={metric === value ? 'is-active' : ''} aria-pressed={metric === value} onClick={() => setMetric(value)}>{label}</button>)}</div><PlayerMetricChart players={summaries} metric={metric} scope={scope} /><div className="stats-subheading"><h3>Two-map CS2 player totals</h3><span>{scope === 'official' ? 'DUST II + INFERNO' : 'TRAIN + ANCIENT'} // 8iT ONLY</span></div><PlayerTotalsTable players={summaries} scope={scope} /></section>

      <section className="stats-section" id="maps" aria-labelledby="maps-title"><StatHeading eyebrow="03 // MAP-BY-MAP" title="The rounds on record." id="maps-title" note="These bars show in-game round scores. The friendly rematch is an exhibition after the bracket, not an additional official Swiss win." /><MapScorelines rematch={rematch} /><div className="stats-chart-grid"><HeadshotChart rows={rows} scope={scope} /><DamageChart rows={officialRows} /></div></section>

      <ScoreboardTable key={scope} rows={rows} scope={scope} />

      <OpponentScoreboards />

      <OverwatchStats onStatsPage />

      <section className="stats-source" aria-labelledby="sources-title"><span>07 // SOURCE & METHOD</span><h2 id="sources-title">READ THE DATA.<br /><em>KNOW THE LIMITS.</em></h2><div><p>Official Dust II and Inferno player figures were supplied as final in-game scoreboard transcriptions from LANFest recordings. Friendly Train and Ancient figures were supplied in post-map-card screenshots and have not been independently video-verified.</p><p>Headshot percentages are per-map CS2 figures only. Damage is available for the recorded official CS2 maps; score is available for the friendly rematch. No warm-up deathmatch is included.</p><p>Overwatch 2 Ilios and Suravasa final player lines and map results were read from the FragWatch LANFest recording. Hanosandy’s Suravasa deaths are covered by the broadcast overlay. Later Blizzard World gameplay has no visible final result in this recording.</p><a href="./#recorded-maps">FULL OFFICIAL MAP TABLES ↗</a><a href="./#rematch-stats">FRIENDLY REMATCH TABLES ↗</a><a href="#overwatch-stats">OVERWATCH 2 SCOREBOARDS ↗</a></div></section>
    </main>
    <footer className="stats-footer"><img src="./assets/players-hq/8it-logo.png" alt="8iT" /><span>PLAY / IMPROVE / DOMINATE</span><a href="./#team">BACK TO TEAM SITE ↗</a></footer>
  </div>;
}
