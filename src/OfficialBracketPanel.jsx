import { useState } from 'react';
import { getTeamRecord, officialTournamentBrackets } from './tournamentBrackets.js';
import './official-brackets.css';

export function OfficialBracketPanel({ cs2Rounds, cs2Edited, cs2TeamName }) {
  const [activeId, setActiveId] = useState('cs2');
  const bracket = officialTournamentBrackets.find((item) => item.id === activeId) || officialTournamentBrackets[0];
  const rounds = bracket.id === 'cs2'
    ? cs2Rounds.map((round, index) => ({
      number: index + 1,
      matches: round.rows.map(([teamA, scoreA, teamB, scoreB, status, number]) => ({ number, teamA, scoreA, teamB, scoreB, status })),
    }))
    : bracket.rounds;
  const teamName = bracket.id === 'cs2' ? cs2TeamName : bracket.teamName;
  const record = getTeamRecord({ ...bracket, teamName, rounds });
  const localCs2 = bracket.id === 'cs2' && cs2Edited;

  return <div className="bracket-panel official-brackets" data-reveal style={{ '--reveal-delay': '200ms' }}>
    <div className="bracket-panel__head"><p className="eyebrow"><span className="slash" />{localCs2 ? 'CS2 LOCAL EDITS // BATTLEFY BASELINE' : 'OFFICIAL BATTLEFY // COMPLETED MATCHES'}</p><span>{localCs2 ? 'SAME-BROWSER OVERRIDE' : '27 SEP 2026 SNAPSHOT'}</span></div>
    <div className="official-brackets__tabs" role="group" aria-label="Choose tournament bracket">
      {officialTournamentBrackets.map((item) => <button type="button" key={item.id} className={item.id === activeId ? 'is-active' : ''} aria-pressed={item.id === activeId} onClick={() => setActiveId(item.id)}>{item.shortName}<span>{item.rounds.reduce((count, round) => count + round.matches.length, 0)} MATCHES</span></button>)}
    </div>
    <div className="official-brackets__summary"><div><h3>{bracket.name}</h3><p>{bracket.rounds.length} ROUNDS <span>//</span> {bracket.id === 'ow2' ? '8' : '6'} TEAMS <span>//</span> BO{bracket.bestOf} SWISS</p></div><strong>8iT <em>{record.wins}–{record.losses}</em></strong></div>
    <div className="bracket-grid official-brackets__rounds">
      {rounds.map((round) => <div key={`${bracket.id}-${round.number}`}><h3>ROUND {String(round.number).padStart(2, '0')}</h3>{round.matches.map((match) => {
        const aWins = Number(match.scoreA) > Number(match.scoreB);
        const bWins = Number(match.scoreB) > Number(match.scoreA);
        const isTeamMatch = match.teamA === teamName || match.teamB === teamName;
        return <article className={`bracket-match ${isTeamMatch ? 'bracket-match--8it' : ''}`} key={`${bracket.id}-${match.number}`}>
          <small>MATCH {String(match.number).padStart(2, '0')} // {match.status.includes('FINAL') ? 'FINAL' : match.status}</small>
          <span className={aWins ? 'is-winner' : ''}>{match.teamA}<b>{match.scoreA}</b></span>
          <span className={bWins ? 'is-winner' : ''}>{match.teamB}<b>{match.scoreB}</b></span>
        </article>;
      })}</div>)}
    </div>
    <div className="official-brackets__footer"><p>Scores show best-of-one or best-of-three match wins, not in-game rounds. {localCs2 ? 'Local CS2 edits may differ from Battlefy.' : 'Battlefield 4 and Overwatch second-place finishes are team-reported.'}</p><a href={bracket.sourceUrl} target="_blank" rel="noreferrer">VIEW {bracket.shortName} ON BATTLEFY <i className="fa-solid fa-arrow-up-right" aria-hidden="true" /></a></div>
  </div>;
}
