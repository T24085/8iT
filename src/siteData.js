export const ADMIN_STORAGE_KEY = '8it-admin-data-v1';

export const defaultEvent = {
  name: 'EverLAN Colorado',
  series: 'LANFest Colorado // 20th Anniversary',
  dates: 'September 24–27, 2026',
  shortDates: '24—27 SEP 2026',
  startAt: '2026-09-24T18:00:00-06:00',
  venue: 'Douglas County Fairgrounds & Event Center',
  location: 'Castle Rock, Colorado',
  address: '500 Fairgrounds Rd, Castle Rock, CO 80104',
  officialUrl: 'https://lanfestcolorado.com/',
  ticketsUrl: 'https://www.tixr.com/groups/lanfest',
};

export const defaultRoster = [
  ['PandaMonium', 'IGL / Rifler', 'MAIN FEED', 'pandoracast'],
  ['BitchStewie', 'Rifler', 'LOCKED IN', null],
  ['ghettobird', 'Sniper', 'PLAYER POV', 'ghettobirdz'],
  ['ghosted', 'Entry Fragger', 'LOCKED IN', null],
  ['Hanosandy', 'AWPer', 'PLAYER POV', 'FragWatch'],
  ['hellaturlz', 'Support', 'LOCKED IN', null],
  ['Titan101', 'Rifler', 'PLAYER POV', 'titan101'],
];

export const defaultSchedule = [
  ['01', 'THU 24', 'LOAD IN', 'The room wakes up. Seats claim their names.'],
  ['02', 'FRI 25', 'GROUP PLAY', 'Every round starts the same: five alive, one call.'],
  ['03', 'SAT 26', 'BRACKET DAY', 'The margin disappears. The pressure does not.'],
  ['04', 'SUN 27', 'FINALS', 'No safe rounds. No quiet exits.'],
];

export const defaultBracket = [
  { title: 'OPENING ROUND', rows: [['8iT', '12', 'Masters', '09', 'FINAL'], ['Northstar', '08', 'Voltage', '13', 'FINAL'], ['Redline', '13', 'Ghost Protocol', '11', 'FINAL']] },
  { title: 'SEMIFINAL', rows: [['8iT', '—', 'Voltage', '—', 'UP NEXT'], ['TBD', '—', 'TBD', '—', 'LOCKED']] },
  { title: 'GRAND FINAL', rows: [['TBD', '—', 'TBD', '—', 'SUNDAY']] },
];

const swissTeamNames = [
  '8iT', 'Masters', 'Northstar', 'Voltage', 'Redline', 'Ghost Protocol', 'Apex', 'Rival',
  'Sentinels', 'Vanguard', 'Nightshift', 'Overtime', 'Sidearm', 'Full Buy', 'Eco Kings', 'Clutch Unit',
];

export const createSwissMatch = (roundNumber, matchNumber, teamAId = '', teamBId = '') => ({
  id: `r${roundNumber}-m${matchNumber}`,
  teamAId,
  teamBId,
  scoreA: '',
  scoreB: '',
  map: 'TBD',
  overtime: false,
  status: 'SCHEDULED',
  startTime: '',
  server: '',
  note: '',
});

const roundMatchCounts = [8, 8, 8, 6, 3];

export const defaultSwiss = {
  settings: {
    stageName: 'SWISS STAGE',
    ruleset: 'ESL CS2 // BO1 MR12',
    bestOf: 1,
    regulationRounds: 13,
    overtimeFormat: 'MR3',
    advanceWins: 3,
    eliminateLosses: 3,
    maxRounds: 5,
  },
  teams: swissTeamNames.map((name, index) => ({ id: `team-${index + 1}`, seed: index + 1, name })),
  rounds: roundMatchCounts.map((matchCount, roundIndex) => ({
    id: `round-${roundIndex + 1}`,
    name: `ROUND ${roundIndex + 1}`,
    status: roundIndex === 0 ? 'UPCOMING' : 'LOCKED',
    matches: Array.from({ length: matchCount }, (_, matchIndex) => {
      const teamAId = roundIndex === 0 ? `team-${matchIndex + 1}` : '';
      const teamBId = roundIndex === 0 ? `team-${16 - matchIndex}` : '';
      return createSwissMatch(roundIndex + 1, matchIndex + 1, teamAId, teamBId);
    }),
  })),
};

const numericScore = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export function deriveSwissStandings(swiss = defaultSwiss) {
  const teams = Array.isArray(swiss.teams) ? swiss.teams : [];
  const settings = { ...defaultSwiss.settings, ...(swiss.settings || {}) };
  const table = new Map(teams.map((team) => [team.id, {
    id: team.id,
    seed: Number(team.seed) || 0,
    name: team.name || 'TBD',
    played: 0,
    wins: 0,
    losses: 0,
    roundsFor: 0,
    roundsAgainst: 0,
    opponents: [],
  }]));

  (swiss.rounds || []).forEach((round) => {
    (round.matches || []).forEach((match) => {
      if (match.status !== 'FINAL' && match.status !== 'FORFEIT') return;
      const teamA = table.get(match.teamAId);
      const teamB = table.get(match.teamBId);
      const scoreA = numericScore(match.scoreA);
      const scoreB = numericScore(match.scoreB);
      if (!teamA || !teamB || scoreA === null || scoreB === null || scoreA === scoreB) return;
      teamA.played += 1; teamB.played += 1;
      teamA.roundsFor += scoreA; teamA.roundsAgainst += scoreB;
      teamB.roundsFor += scoreB; teamB.roundsAgainst += scoreA;
      teamA.opponents.push(teamB.id); teamB.opponents.push(teamA.id);
      if (scoreA > scoreB) { teamA.wins += 1; teamB.losses += 1; }
      else { teamB.wins += 1; teamA.losses += 1; }
    });
  });

  const rows = Array.from(table.values()).map((row) => ({
    ...row,
    roundDiff: row.roundsFor - row.roundsAgainst,
    buchholz: row.opponents.reduce((total, opponentId) => total + (table.get(opponentId)?.wins || 0), 0),
    state: row.wins >= settings.advanceWins ? 'ADVANCED' : row.losses >= settings.eliminateLosses ? 'ELIMINATED' : 'ACTIVE',
  }));

  return rows.sort((a, b) => b.wins - a.wins || a.losses - b.losses || b.buchholz - a.buchholz || b.roundDiff - a.roundDiff || a.seed - b.seed);
}

export function swissToPublicBracket(swiss = defaultSwiss) {
  const teamNames = new Map((swiss.teams || []).map((team) => [team.id, team.name || 'TBD']));
  return (swiss.rounds || []).map((round) => ({
    title: `${round.name} // ${round.status}`,
    rows: (round.matches || []).map((match) => [
      teamNames.get(match.teamAId) || 'TBD',
      match.scoreA === '' ? '—' : String(match.scoreA),
      teamNames.get(match.teamBId) || 'TBD',
      match.scoreB === '' ? '—' : String(match.scoreB),
      `${match.map || 'TBD'} // ${match.status}${match.overtime ? ' // OT' : ''}`,
    ]),
  }));
}

export const defaultKillFeed = [
  ['PandaMonium', 'calls the hit', 'A site // round 12'],
  ['ghettobirdz', 'holds the angle', 'Long // 2 down'],
  ['Titan101', 'locks the trade', 'Mid // clean-up'],
  ['8iT', 'wins the round', 'Scoreline // 12—09'],
];

export const defaultLiveMatch = {
  teamA: '8iT',
  teamB: 'MASTERS',
  scoreA: '12',
  scoreB: '09',
  roundLabel: 'ROUND 21 // BO1',
  status: 'LIVE UI PREVIEW',
  progress: 71,
};

export const emptyAdminData = {
  event: { ...defaultEvent },
  roster: defaultRoster.map((player) => [...player]),
  schedule: defaultSchedule.map((row) => [...row]),
  bracket: structuredClone(defaultBracket),
  swiss: structuredClone(defaultSwiss),
  killFeed: defaultKillFeed.map((row) => [...row]),
  liveMatch: { ...defaultLiveMatch },
};

export function readAdminData() {
  if (typeof window === 'undefined') return emptyAdminData;
  try {
    const saved = JSON.parse(window.localStorage.getItem(ADMIN_STORAGE_KEY) || 'null');
    if (!saved) return emptyAdminData;
    return {
      ...emptyAdminData,
      ...saved,
      event: { ...emptyAdminData.event, ...(saved.event || {}) },
      liveMatch: { ...emptyAdminData.liveMatch, ...(saved.liveMatch || {}) },
      roster: Array.isArray(saved.roster) ? saved.roster : emptyAdminData.roster,
      schedule: Array.isArray(saved.schedule) ? saved.schedule : emptyAdminData.schedule,
      bracket: Array.isArray(saved.bracket) ? saved.bracket : emptyAdminData.bracket,
      swiss: saved.swiss && Array.isArray(saved.swiss.teams) && Array.isArray(saved.swiss.rounds) ? {
        ...structuredClone(defaultSwiss),
        ...saved.swiss,
        settings: { ...defaultSwiss.settings, ...(saved.swiss.settings || {}) },
        teams: saved.swiss.teams,
        rounds: saved.swiss.rounds,
      } : structuredClone(defaultSwiss),
      killFeed: Array.isArray(saved.killFeed) ? saved.killFeed : emptyAdminData.killFeed,
    };
  } catch {
    return emptyAdminData;
  }
}

export function saveAdminData(data) {
  if (typeof window !== 'undefined') window.localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(data));
}

export function clearAdminData() {
  if (typeof window !== 'undefined') window.localStorage.removeItem(ADMIN_STORAGE_KEY);
}
