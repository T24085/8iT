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
  ['Hanosandy', 'AWPer', 'LOCKED IN', null],
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
  roundLabel: 'ROUND 21 // BO3',
  status: 'LIVE UI PREVIEW',
  progress: 71,
};

export const emptyAdminData = {
  event: { ...defaultEvent },
  roster: defaultRoster.map((player) => [...player]),
  schedule: defaultSchedule.map((row) => [...row]),
  bracket: structuredClone(defaultBracket),
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
