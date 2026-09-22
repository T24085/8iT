import { useMemo, useRef, useState } from 'react';
import { clearAdminData, createSwissMatch, deriveSwissStandings, emptyAdminData, readAdminData, saveAdminData } from './siteData';
import './admin.css';

const clone = (value) => JSON.parse(JSON.stringify(value));

function ArrowIcon({ direction = 'up-right' }) { return <i className={`fa-solid fa-arrow-${direction}`} aria-hidden="true" />; }
function AdminMark() { return <a className="admin-mark" href="./"><img src="/assets/players-hq/8it-logo.png" alt="8iT" /><span>// CONTROL ROOM</span></a>; }

function Field({ label, value, onChange, type = 'text', placeholder = '' }) {
  return <label className="admin-field"><span>{label}</span><input type={type} value={value ?? ''} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} /></label>;
}

function SelectField({ label, value, onChange, options }) {
  return <label className="admin-field"><span>{label}</span><select value={value ?? ''} onChange={(event) => onChange(event.target.value)}>{options.map((option) => { const item = typeof option === 'string' ? { value: option, label: option } : option; return <option value={item.value} key={item.value}>{item.label}</option>; })}</select></label>;
}

function Panel({ number, title, copy, children }) {
  return <section className="admin-panel"><div className="admin-panel__head"><span>{number}</span><div><p className="admin-kicker">CONTROL // {number}</p><h2>{title}</h2><p>{copy}</p></div></div>{children}</section>;
}

export function Admin() {
  const [data, setData] = useState(() => clone(readAdminData()));
  const [message, setMessage] = useState('LOCAL OVERRIDES // NOT SAVED');
  const [activeSwissRound, setActiveSwissRound] = useState(0);
  const importRef = useRef(null);
  const swissStandings = useMemo(() => deriveSwissStandings(data.swiss), [data.swiss]);

  const updateEvent = (key, value) => setData((current) => ({ ...current, event: { ...current.event, [key]: value } }));
  const updateArrayCell = (section, rowIndex, cellIndex, value) => setData((current) => ({ ...current, [section]: current[section].map((row, index) => index === rowIndex ? row.map((cell, cellIndexToUpdate) => cellIndexToUpdate === cellIndex ? value : cell) : row) }));
  const updateLiveMatch = (key, value) => setData((current) => ({ ...current, liveMatch: { ...current.liveMatch, [key]: value } }));
  const updateSwissSettings = (key, value) => setData((current) => ({ ...current, swiss: { ...current.swiss, settings: { ...current.swiss.settings, [key]: value } } }));
  const updateSwissTeam = (teamIndex, key, value) => setData((current) => ({ ...current, swiss: { ...current.swiss, teams: current.swiss.teams.map((team, index) => index === teamIndex ? { ...team, [key]: value } : team) } }));
  const updateSwissRound = (roundIndex, key, value) => setData((current) => ({ ...current, swiss: { ...current.swiss, rounds: current.swiss.rounds.map((round, index) => index === roundIndex ? { ...round, [key]: value } : round) } }));
  const updateSwissMatch = (roundIndex, matchIndex, key, value) => setData((current) => ({ ...current, swiss: { ...current.swiss, rounds: current.swiss.rounds.map((round, index) => index === roundIndex ? { ...round, matches: round.matches.map((match, indexToUpdate) => indexToUpdate === matchIndex ? { ...match, [key]: value } : match) } : round) } }));
  const addSwissMatch = (roundIndex) => setData((current) => ({ ...current, swiss: { ...current.swiss, rounds: current.swiss.rounds.map((round, index) => index === roundIndex ? { ...round, matches: [...round.matches, createSwissMatch(roundIndex + 1, round.matches.length + 1)] } : round) } }));
  const removeSwissMatch = (roundIndex, matchIndex) => setData((current) => ({ ...current, swiss: { ...current.swiss, rounds: current.swiss.rounds.map((round, index) => index === roundIndex ? { ...round, matches: round.matches.filter((_, indexToRemove) => indexToRemove !== matchIndex) } : round) } }));

  const save = () => { saveAdminData(data); setMessage(`SAVED // ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`); };
  const reset = () => { if (!window.confirm('Reset all local event overrides to the starter data?')) return; clearAdminData(); setData(clone(emptyAdminData)); setMessage('RESET // STARTER DATA RESTORED'); };
  const exportData = () => { const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = '8it-event-data.json'; link.click(); URL.revokeObjectURL(url); setMessage('EXPORTED // 8it-event-data.json'); };
  const importData = (event) => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { try { const parsed = JSON.parse(reader.result); setData({ ...clone(emptyAdminData), ...parsed, event: { ...clone(emptyAdminData.event), ...(parsed.event || {}) }, liveMatch: { ...clone(emptyAdminData.liveMatch), ...(parsed.liveMatch || {}) }, swiss: { ...clone(emptyAdminData.swiss), ...(parsed.swiss || {}), settings: { ...clone(emptyAdminData.swiss.settings), ...(parsed.swiss?.settings || {}) } } }); setActiveSwissRound(0); setMessage('IMPORTED // REVIEW THEN SAVE'); } catch { setMessage('IMPORT FAILED // INVALID JSON'); } }; reader.readAsText(file); event.target.value = ''; };

  const currentSwissRound = data.swiss.rounds[activeSwissRound] || data.swiss.rounds[0];
  const teamOptions = [{ value: '', label: 'TBD' }, ...data.swiss.teams.map((team) => ({ value: team.id, label: `${String(team.seed).padStart(2, '0')} // ${team.name || 'UNNAMED TEAM'}` }))];
  const advancedTeams = swissStandings.filter((team) => team.state === 'ADVANCED').length;
  const eliminatedTeams = swissStandings.filter((team) => team.state === 'ELIMINATED').length;

  return <div className="admin-page"><header className="admin-header"><AdminMark /><div className="admin-header__meta"><span><i /> EVENT-DAY CONTROL ROOM</span><small>EDIT FAST // SAVE ONCE // RUN THE ROOM</small></div><div className="admin-header__actions"><a href="./" target="_blank" rel="noreferrer">OPEN PUBLIC SITE <ArrowIcon /></a><a href="./shop.html" target="_blank" rel="noreferrer">OPEN SHOP <ArrowIcon /></a></div></header>
    <main className="admin-main"><section className="admin-hero"><div><p className="admin-kicker">8iT // ADMIN CONSOLE</p><h1>RUN THE<br /><em>ROOM.</em></h1><p>Change the unknowns when the tournament tells you what they are. Save locally, open the public site in another tab, and refresh only when you need a hard reset.</p></div><div className="admin-hero__status"><span>LIVE DATA SOURCE</span><strong>LOCAL OVERRIDES</strong><small>Public page reads the saved data from this browser.</small><div className="admin-actions"><button className="admin-button admin-button--primary" type="button" onClick={save}>SAVE ALL CHANGES <ArrowIcon /></button><button className="admin-button" type="button" onClick={reset}>RESET STARTER DATA</button></div><span className="admin-save-status">{message}</span></div></section>

      <div className="admin-toolbar"><span><i /> {data.event.name || '8iT EVENT'} // DATA EDITOR</span><div><button type="button" onClick={exportData}>EXPORT JSON</button><button type="button" onClick={() => importRef.current?.click()}>IMPORT JSON</button><input ref={importRef} type="file" accept="application/json" onChange={importData} hidden /></div></div>

      <Panel number="01" title="EVENT SIGNAL" copy="Dates, room details, and the countdown target shown on the public site."><div className="admin-fields admin-fields--three"><Field label="CAMPAIGN NAME" value={data.event.name} onChange={(value) => updateEvent('name', value)} /><Field label="SERIES LINE" value={data.event.series} onChange={(value) => updateEvent('series', value)} /><Field label="SHORT DATE LINE" value={data.event.shortDates} onChange={(value) => updateEvent('shortDates', value)} /><Field label="EVENT START (ISO)" value={data.event.startAt} onChange={(value) => updateEvent('startAt', value)} placeholder="2026-09-24T18:00:00-06:00" /><Field label="LOCATION" value={data.event.location} onChange={(value) => updateEvent('location', value)} /><Field label="VENUE" value={data.event.venue} onChange={(value) => updateEvent('venue', value)} /><Field label="ADDRESS" value={data.event.address} onChange={(value) => updateEvent('address', value)} /><Field label="OFFICIAL URL" value={data.event.officialUrl} onChange={(value) => updateEvent('officialUrl', value)} /><Field label="TICKET URL" value={data.event.ticketsUrl} onChange={(value) => updateEvent('ticketsUrl', value)} /></div></Panel>

      <Panel number="02" title="LIVE SCORE" copy="The score card, round progress, and now-playing state. Use any labels the desk needs on tournament day."><div className="admin-fields admin-fields--three"><Field label="TEAM A" value={data.liveMatch.teamA} onChange={(value) => updateLiveMatch('teamA', value)} /><Field label="TEAM B" value={data.liveMatch.teamB} onChange={(value) => updateLiveMatch('teamB', value)} /><Field label="ROUND LABEL" value={data.liveMatch.roundLabel} onChange={(value) => updateLiveMatch('roundLabel', value)} /><Field label="TEAM A SCORE" value={data.liveMatch.scoreA} onChange={(value) => updateLiveMatch('scoreA', value)} /><Field label="TEAM B SCORE" value={data.liveMatch.scoreB} onChange={(value) => updateLiveMatch('scoreB', value)} /><Field label="STATUS LINE" value={data.liveMatch.status} onChange={(value) => updateLiveMatch('status', value)} /><Field label="ROUND PROGRESS %" type="number" value={data.liveMatch.progress} onChange={(value) => updateLiveMatch('progress', Math.min(100, Math.max(0, Number(value) || 0)))} /></div></Panel>

      <Panel number="03" title="SCHEDULE" copy="Edit the four-day rhythm without touching the page code."><div className="admin-table admin-table--schedule"><div className="admin-table__labels"><span>DAY</span><span>DATE</span><span>MOMENT</span><span>PUBLIC COPY</span></div>{data.schedule.map((row, rowIndex) => <div className="admin-table__row" key={row[0]}><Field label={`DAY ${rowIndex + 1}`} value={row[0]} onChange={(value) => updateArrayCell('schedule', rowIndex, 0, value)} /><Field label="DATE" value={row[1]} onChange={(value) => updateArrayCell('schedule', rowIndex, 1, value)} /><Field label="MOMENT" value={row[2]} onChange={(value) => updateArrayCell('schedule', rowIndex, 2, value)} /><Field label="PUBLIC COPY" value={row[3]} onChange={(value) => updateArrayCell('schedule', rowIndex, 3, value)} /></div>)}</div></Panel>

      <Panel number="04" title="SWISS CONTROL" copy="Run a 16-team, five-round Swiss stage. Three wins advances; three losses eliminates. Every saved match publishes to the public bracket.">
        <div className="swiss-summary">
          <div><span>FORMAT</span><strong>BO{data.swiss.settings.bestOf}</strong><small>MR{data.swiss.settings.regulationRounds - 1} // OT {data.swiss.settings.overtimeFormat}</small></div>
          <div><span>FIELD</span><strong>{data.swiss.teams.length}</strong><small>TEAMS REGISTERED</small></div>
          <div><span>ADVANCED</span><strong>{advancedTeams}</strong><small>{data.swiss.settings.advanceWins} WINS TO QUALIFY</small></div>
          <div><span>ELIMINATED</span><strong>{eliminatedTeams}</strong><small>{data.swiss.settings.eliminateLosses} LOSSES TO EXIT</small></div>
        </div>

        <div className="swiss-rules">
          <div className="swiss-rules__copy"><p className="admin-kicker">FORMAT SETTINGS</p><h3>ESL-STYLE BO1 SWISS</h3><p>Regulation is first to {data.swiss.settings.regulationRounds}. A 12–12 tie moves to {data.swiss.settings.overtimeFormat} overtime until a winner is produced. Standings sort by record, Buchholz, round difference, then seed.</p></div>
          <div className="admin-fields admin-fields--three">
            <Field label="STAGE NAME" value={data.swiss.settings.stageName} onChange={(value) => updateSwissSettings('stageName', value)} />
            <Field label="RULESET LABEL" value={data.swiss.settings.ruleset} onChange={(value) => updateSwissSettings('ruleset', value)} />
            <Field label="REGULATION WIN SCORE" type="number" value={data.swiss.settings.regulationRounds} onChange={(value) => updateSwissSettings('regulationRounds', Math.max(1, Number(value) || 13))} />
            <Field label="ADVANCE AT WINS" type="number" value={data.swiss.settings.advanceWins} onChange={(value) => updateSwissSettings('advanceWins', Math.max(1, Number(value) || 3))} />
            <Field label="ELIMINATE AT LOSSES" type="number" value={data.swiss.settings.eliminateLosses} onChange={(value) => updateSwissSettings('eliminateLosses', Math.max(1, Number(value) || 3))} />
            <Field label="OVERTIME FORMAT" value={data.swiss.settings.overtimeFormat} onChange={(value) => updateSwissSettings('overtimeFormat', value)} />
          </div>
        </div>

        <div className="swiss-block">
          <div className="swiss-block__head"><div><p className="admin-kicker">TEAM DIRECTORY</p><h3>SEEDS + TEAM NAMES</h3></div><span>Names update across every round automatically.</span></div>
          <div className="swiss-team-grid">{data.swiss.teams.map((team, teamIndex) => <div className="swiss-team" key={team.id}><Field label="SEED" type="number" value={team.seed} onChange={(value) => updateSwissTeam(teamIndex, 'seed', Math.max(1, Number(value) || 1))} /><Field label={`TEAM ${teamIndex + 1}`} value={team.name} onChange={(value) => updateSwissTeam(teamIndex, 'name', value)} /></div>)}</div>
        </div>

        <div className="swiss-block">
          <div className="swiss-block__head"><div><p className="admin-kicker">LIVE TABLE</p><h3>SWISS STANDINGS</h3></div><span>FINAL and FORFEIT results count toward the table.</span></div>
          <div className="swiss-standings" role="table" aria-label="Swiss standings">
            <div className="swiss-standings__row swiss-standings__row--head" role="row"><span>#</span><span>TEAM</span><span>RECORD</span><span>RW–RL</span><span>DIFF</span><span>BUCH</span><span>STATE</span></div>
            {swissStandings.map((team, index) => <div className={`swiss-standings__row swiss-standings__row--${team.state.toLowerCase()}`} role="row" key={team.id}><span>{String(index + 1).padStart(2, '0')}</span><strong>{team.name}</strong><span>{team.wins}–{team.losses}</span><span>{team.roundsFor}–{team.roundsAgainst}</span><span>{team.roundDiff > 0 ? '+' : ''}{team.roundDiff}</span><span>{team.buchholz}</span><em>{team.state}</em></div>)}
          </div>
        </div>

        <div className="swiss-block">
          <div className="swiss-block__head"><div><p className="admin-kicker">ROUND DESK</p><h3>PAIRINGS + RESULTS</h3></div><span>Edit match data, then mark it FINAL to update standings.</span></div>
          <div className="swiss-round-tabs" role="tablist" aria-label="Swiss rounds">{data.swiss.rounds.map((round, roundIndex) => <button className={activeSwissRound === roundIndex ? 'is-active' : ''} type="button" role="tab" aria-selected={activeSwissRound === roundIndex} onClick={() => setActiveSwissRound(roundIndex)} key={round.id}><span>0{roundIndex + 1}</span>{round.name}<small>{round.status}</small></button>)}</div>
          {currentSwissRound && <div className="swiss-round-editor">
            <div className="swiss-round-editor__meta"><Field label="ROUND NAME" value={currentSwissRound.name} onChange={(value) => updateSwissRound(activeSwissRound, 'name', value)} /><SelectField label="ROUND STATUS" value={currentSwissRound.status} onChange={(value) => updateSwissRound(activeSwissRound, 'status', value)} options={['LOCKED', 'UPCOMING', 'LIVE', 'COMPLETE']} /><button className="admin-button" type="button" onClick={() => addSwissMatch(activeSwissRound)}>ADD MATCH</button></div>
            <div className="swiss-match-list">{currentSwissRound.matches.map((match, matchIndex) => <article className={`swiss-match swiss-match--${match.status.toLowerCase()}`} key={match.id}>
              <div className="swiss-match__head"><span>MATCH {String(matchIndex + 1).padStart(2, '0')}</span><strong>{match.status}</strong><button type="button" onClick={() => removeSwissMatch(activeSwissRound, matchIndex)} aria-label={`Remove match ${matchIndex + 1}`}><i className="fa-solid fa-trash" aria-hidden="true" /></button></div>
              <div className="swiss-match__teams"><SelectField label="TEAM A" value={match.teamAId} onChange={(value) => updateSwissMatch(activeSwissRound, matchIndex, 'teamAId', value)} options={teamOptions} /><Field label="SCORE A" type="number" value={match.scoreA} onChange={(value) => updateSwissMatch(activeSwissRound, matchIndex, 'scoreA', value === '' ? '' : Math.max(0, Number(value) || 0))} /><SelectField label="TEAM B" value={match.teamBId} onChange={(value) => updateSwissMatch(activeSwissRound, matchIndex, 'teamBId', value)} options={teamOptions} /><Field label="SCORE B" type="number" value={match.scoreB} onChange={(value) => updateSwissMatch(activeSwissRound, matchIndex, 'scoreB', value === '' ? '' : Math.max(0, Number(value) || 0))} /></div>
              <div className="swiss-match__details"><Field label="MAP" value={match.map} onChange={(value) => updateSwissMatch(activeSwissRound, matchIndex, 'map', value)} /><Field label="START / DESK TIME" value={match.startTime} placeholder="14:30" onChange={(value) => updateSwissMatch(activeSwissRound, matchIndex, 'startTime', value)} /><Field label="SERVER" value={match.server} placeholder="SERVER 01" onChange={(value) => updateSwissMatch(activeSwissRound, matchIndex, 'server', value)} /><SelectField label="MATCH STATUS" value={match.status} onChange={(value) => updateSwissMatch(activeSwissRound, matchIndex, 'status', value)} options={['SCHEDULED', 'LIVE', 'FINAL', 'FORFEIT']} /><SelectField label="OVERTIME" value={match.overtime ? 'YES' : 'NO'} onChange={(value) => updateSwissMatch(activeSwissRound, matchIndex, 'overtime', value === 'YES')} options={['NO', 'YES']} /><Field label="NOTE" value={match.note} placeholder="VETO / ADMIN NOTE" onChange={(value) => updateSwissMatch(activeSwissRound, matchIndex, 'note', value)} /></div>
            </article>)}</div>
          </div>}
        </div>
      </Panel>

      <Panel number="05" title="KILL FEED" copy="Short, sharp desk lines that rotate through the public now-playing panel."><div className="admin-table"><div className="admin-table__labels"><span>ACTOR</span><span>ACTION</span><span>DETAIL</span></div>{data.killFeed.map((row, rowIndex) => <div className="admin-table__row admin-table__row--three" key={`${row[0]}-${rowIndex}`}><Field label="ACTOR" value={row[0]} onChange={(value) => updateArrayCell('killFeed', rowIndex, 0, value)} /><Field label="ACTION" value={row[1]} onChange={(value) => updateArrayCell('killFeed', rowIndex, 1, value)} /><Field label="DETAIL" value={row[2]} onChange={(value) => updateArrayCell('killFeed', rowIndex, 2, value)} /></div>)}</div></Panel>

      <Panel number="06" title="ROSTER" copy="Update the squad names, roles, player status, and POV channel slugs in seconds."><div className="admin-table"><div className="admin-table__labels"><span>PLAYER</span><span>ROLE</span><span>STATUS</span><span>POV CHANNEL</span></div>{data.roster.map((row, rowIndex) => <div className="admin-table__row" key={`${row[0]}-${rowIndex}`}><Field label={`PLAYER ${rowIndex + 1}`} value={row[0]} onChange={(value) => updateArrayCell('roster', rowIndex, 0, value)} /><Field label="ROLE" value={row[1]} onChange={(value) => updateArrayCell('roster', rowIndex, 1, value)} /><Field label="STATUS" value={row[2]} onChange={(value) => updateArrayCell('roster', rowIndex, 2, value)} /><Field label="TWITCH SLUG (OPTIONAL)" value={row[3] || ''} placeholder="leave blank if none" onChange={(value) => updateArrayCell('roster', rowIndex, 3, value || null)} /></div>)}</div></Panel>

      <section className="admin-footer-card"><div><p className="admin-kicker">THE FAST PATH</p><h2>EDIT.<br /><em>SAVE.</em><br />GO LIVE.</h2></div><div><p>These controls are intentionally local-first for tournament day. For a true multi-device operator dashboard, connect the same data shape to a small backend later. Until then, this gets the desk moving in seconds.</p><button className="admin-button admin-button--primary" type="button" onClick={save}>SAVE + PUSH TO PUBLIC TAB <ArrowIcon /></button></div></section>
    </main>
  </div>;
}
