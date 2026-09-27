import { rosterPlayerName } from './playerIdentity.js';

// Team-supplied final-scoreboard transcription attributed to official tournament footage.
// These lobby labels have not yet been matched to a specific Battlefy bracket row.
export const recordedCompetitiveMaps = [
  {
    map: 'Dust II',
    sides: [{ label: '8iT', score: 13 }, { label: 'DHM Gaming', score: 0 }],
    winner: '8iT',
    teams: [
      { label: '8iT', players: [
        { name: 'Hanosandy', kills: 19, deaths: 2, assists: 2, hs: 31, damage: 1635 },
        { name: 'PandaMonium', kills: 13, deaths: 6, assists: 7, hs: 30, damage: 1507 },
        { name: 'ghettobird', kills: 16, deaths: 3, assists: 2, hs: 31, damage: 1375 },
        { name: 'Zixxy', kills: 9, deaths: 6, assists: 6, hs: 33, damage: 1264 },
        { name: 'titan101', kills: 7, deaths: 3, assists: 3, hs: 28, damage: 889 },
      ] },
      { label: 'DHM Gaming', players: [
        { name: 'Ivarin', kills: 7, deaths: 13, assists: 0, hs: 28, damage: 785 },
        { name: 'Lego Qui-Gon', kills: 4, deaths: 13, assists: 2, hs: 50, damage: 561 },
        { name: 'J0hns0n', kills: 3, deaths: 13, assists: 0, hs: 66, damage: 547 },
        { name: 'gingerbreadkilla', kills: 3, deaths: 13, assists: 0, hs: 33, damage: 434 },
        { name: 'Bark. Woof even…', kills: 2, deaths: 12, assists: 1, hs: 50, damage: 279 },
      ] },
    ],
  },
  {
    map: 'Inferno',
    sides: [{ label: 'team_mub', score: 19 }, { label: 'team_ghettobird (8iT)', score: 16 }],
    winner: 'team_mub',
    teams: [
      { label: 'team_ghettobird (8iT)', players: [
        { name: 'ghettobird', kills: 32, deaths: 26, assists: 3, hs: 56, damage: 3264 },
        { name: 'PandaMonium', kills: 27, deaths: 30, assists: 8, hs: 37, damage: 3057 },
        { name: 'titan101', kills: 22, deaths: 27, assists: 7, hs: 54, damage: 2362 },
        { name: 'Hanosandy', kills: 18, deaths: 23, assists: 12, hs: 44, damage: 2350 },
        { name: 'Zixxy', kills: 20, deaths: 23, assists: 3, hs: 15, damage: 2189 },
      ] },
      { label: 'team_mub', players: [
        { name: 'vess', kills: 28, deaths: 23, assists: 10, hs: 50, damage: 2920 },
        { name: 'her', kills: 26, deaths: 24, assists: 5, hs: 46, damage: 2797 },
        { name: 'demostars', kills: 20, deaths: 27, assists: 11, hs: 45, damage: 2789 },
        { name: 'rats', kills: 28, deaths: 25, assists: 9, hs: 25, damage: 2649 },
        { name: 'mub', kills: 23, deaths: 21, assists: 5, hs: 43, damage: 2289 },
      ] },
    ],
  },
];

export const vertigoDeathmatch = {
  map: 'Vertigo',
  players: [
    { name: 'PandaMonium', points: 285, kills: 27, deaths: 12, assists: 3 },
    { name: 'Hanosandy', points: 281, kills: 28, deaths: 16, assists: 0 },
    { name: 'ghettobird', points: 260, kills: 20, deaths: 16, assists: 0 },
    { name: 'titan101', points: 224, kills: 15, deaths: 14, assists: 1 },
    { name: 'Zixxy', points: 140, kills: 14, deaths: 21, assists: 0 },
  ],
};

export function getRecordedPlayerStats(name) {
  const rosterName = rosterPlayerName(name).toLowerCase();
  return {
    maps: recordedCompetitiveMaps.map((map) => ({
      map: map.map,
      stats: map.teams.flatMap((team) => team.label.includes('8iT') ? team.players : [])
        .find((player) => rosterPlayerName(player.name).toLowerCase() === rosterName),
    })).filter((entry) => entry.stats),
    deathmatch: vertigoDeathmatch.players.find((player) => rosterPlayerName(player.name).toLowerCase() === rosterName),
  };
}
