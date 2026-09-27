import { rosterPlayerName } from './playerIdentity.js';

// Player numbers supplied in a screenshot of a prior post-map-card transcription
// for the unofficial Train / Ancient rematch. Not independently verified.
export const rematchPlayerStats = [
  { name: 'Hanosandy', maps: { Train: { score: 56, kills: 10, deaths: 18, assists: 7, hs: 60 }, Ancient: { score: 70, kills: 14, deaths: 16, assists: 6, hs: 21 } } },
  { name: 'ghettobird', maps: { Train: { score: 134, kills: 34, deaths: 16, assists: 3, hs: 73 }, Ancient: { score: 97, kills: 21, deaths: 12, assists: 3, hs: 66 } } },
  { name: 'Titan101', maps: { Train: { score: 74, kills: 18, deaths: 16, assists: 2, hs: 61 }, Ancient: { score: 96, kills: 23, deaths: 12, assists: 2, hs: 69 } } },
  { name: 'Zixxy', maps: { Train: { score: 68, kills: 16, deaths: 16, assists: 3, hs: 56 }, Ancient: { score: 72, kills: 14, deaths: 13, assists: 9, hs: 28 } } },
  { name: 'PandaMonium', maps: { Train: { score: 76, kills: 14, deaths: 17, assists: 7, hs: 28 }, Ancient: { score: 99, kills: 17, deaths: 15, assists: 8, hs: 29 } } },
];

export const rematchMaps = ['Train', 'Ancient'];

export function getRematchPlayer(name) {
  return rematchPlayerStats.find((player) => rosterPlayerName(player.name).toLowerCase() === rosterPlayerName(name).toLowerCase());
}

export function getRematchTotals(player) {
  if (!player) return null;
  return rematchMaps.reduce((total, map) => ({
    kills: total.kills + player.maps[map].kills,
    deaths: total.deaths + player.maps[map].deaths,
    assists: total.assists + player.maps[map].assists,
  }), { kills: 0, deaths: 0, assists: 0 });
}
