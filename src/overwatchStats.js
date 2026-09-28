// Final Overwatch 2 scoreboards visible in the FragWatch LANFest recording.
// Scores are Control rounds on Ilios and Flashpoint points on Suravasa.
// Hanosandy's Suravasa deaths are hidden by the broadcast overlay.
export const overwatchMaps = [
  {
    map: 'Ilios',
    mode: 'Control',
    score: [2, 0],
    videoTime: '34:45',
    players: [
      { name: 'Hanosandy', eliminations: 10, assists: 7, deaths: 4, damage: 1581, healing: 2627, mitigation: 0 },
      { name: 'GeniusOfWar', eliminations: 22, assists: 0, deaths: 0, damage: 5640, healing: 0, mitigation: 0 },
      { name: 'Hellaturtlz', eliminations: 19, assists: 14, deaths: 0, damage: 2839, healing: 487, mitigation: 4830 },
      { name: 'Pandora', eliminations: 22, assists: 15, deaths: 0, damage: 5512, healing: 5141, mitigation: 0 },
      { name: 'SocietyFPS', eliminations: 19, assists: 1, deaths: 0, damage: 4602, healing: 0, mitigation: 0 },
    ],
  },
  {
    map: 'Suravasa',
    mode: 'Flashpoint',
    score: [3, 0],
    videoTime: '68:29',
    players: [
      { name: 'Hanosandy', eliminations: 9, assists: 13, deaths: null, damage: 3154, healing: 5601, mitigation: 170 },
      { name: 'GeniusOfWar', eliminations: 24, assists: 0, deaths: 3, damage: 4759, healing: 50, mitigation: 0 },
      { name: 'Hellaturtlz', eliminations: 18, assists: 5, deaths: 1, damage: 3703, healing: 427, mitigation: 5814 },
      { name: 'Pandora', eliminations: 27, assists: 16, deaths: 0, damage: 5792, healing: 5459, mitigation: 0 },
      { name: 'SocietyFPS', eliminations: 22, assists: 1, deaths: 2, damage: 9497, healing: 0, mitigation: 94 },
    ],
  },
];

// These identities are confirmed by the matching roster name or by the user.
const rosterAliases = {
  hanosandy: 'Hanosandy',
  hellaturtlz: 'Hellaturtlz',
  pandamonium: 'Pandora',
};

export function getOverwatchPlayerMaps(name) {
  const videoName = rosterAliases[String(name).toLowerCase()] || name;
  return overwatchMaps.map((map) => ({
    map: map.map,
    stats: map.players.find((player) => player.name.toLowerCase() === String(videoName).toLowerCase()),
  })).filter(({ stats }) => stats);
}

export function getOverwatchPlayerTotals(name) {
  const entries = getOverwatchPlayerMaps(name);
  if (!entries.length) return null;
  return entries.reduce((total, { stats }) => ({
    eliminations: total.eliminations + stats.eliminations,
    assists: total.assists + stats.assists,
    damage: total.damage + stats.damage,
    healing: total.healing + stats.healing,
    mitigation: total.mitigation + stats.mitigation,
  }), { eliminations: 0, assists: 0, damage: 0, healing: 0, mitigation: 0 });
}
