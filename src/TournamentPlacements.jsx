import './placements.css';

const placements = [
  { game: 'COUNTER-STRIKE 2', videoId: 'vblxVNYXKts', label: 'CS2 TOURNAMENT' },
  { game: 'BATTLEFIELD 4', videoId: '9Hi45_bZdv0', label: 'BATTLEFIELD 4 TOURNAMENT' },
  { game: 'OVERWATCH 2', videoId: 'TkT2AEMJTxY', label: 'OVERWATCH TOURNAMENT' },
];

export function TournamentPlacements() {
  return <section id="placements" className="section tournament-placements" aria-labelledby="placements-title">
    <div className="tournament-placements__intro" data-reveal>
      <p className="eyebrow eyebrow--light"><span className="slash" />LANFEST COLORADO // MULTI-GAME RESULTS</p>
      <h2 id="placements-title">THREE<br /><em>PODIUMS.</em></h2>
      <p>8iT finished second in Counter-Strike 2, Battlefield 4, and Overwatch 2. These podium finishes are team-reported; the Battlefy brackets show the recorded match results.</p>
    </div>
    <div className="tournament-placements__grid">
      {placements.map((placement, index) => <article className="tournament-placement" key={placement.game} data-reveal style={{ '--reveal-delay': `${index * 110}ms` }}>
        <div className="tournament-placement__top"><span>0{index + 1} // TOURNAMENT RESULT</span><span>TEAM REPORTED</span></div>
        <div className="tournament-placement__body"><strong aria-label="Second place">02<span>ND</span></strong><div><p>SECOND PLACE // LANFEST COLORADO</p><h3>{placement.game}</h3></div></div>
        <a href={`#clip-${placement.videoId}`} aria-label={`Watch HanoSandy's FragWatch ${placement.label} replay on this page`}>WATCH HANOSANDY'S FRAGWATCH REPLAY <i className="fa-solid fa-arrow-down" aria-hidden="true" /></a>
      </article>)}
    </div>
  </section>;
}
