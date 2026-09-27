// Completed Battlefy match-series results, checked September 27, 2026.
// Scores are series/map wins (BO1 or BO3), not in-game CS2 rounds or BF4 tickets.
const createBracket = ({ id, name, shortName, bestOf, teamName, tournamentId, stageId, rounds }) => ({
  id,
  name,
  shortName,
  bestOf,
  teamName,
  tournamentId,
  stageId,
  sourceUrl: `https://battlefy.com/lanfest-colorado_/${{
    cs2: 'counter-strike-2-lanfest-co-2026',
    bf4: 'battlefield-4-lanfest-co-2026',
    ow2: 'overwatch-2-lanfest-2026',
  }[id]}/${tournamentId}/brackets`,
  rounds: rounds.map((matches, index) => ({
    number: index + 1,
    matches: matches.map(([number, teamA, scoreA, teamB, scoreB]) => ({ number, teamA, scoreA, teamB, scoreB, status: 'FINAL' })),
  })),
});

export const officialTournamentBrackets = [
  createBracket({
    id: 'cs2', name: 'COUNTER-STRIKE 2', shortName: 'CS2', bestOf: 1,
    teamName: '8iT - Eight Inches and Thick',
    tournamentId: '6a8cde95296df400264cad3f', stageId: '6ab86e69707fa6001aeb1b84',
    rounds: [
      [
        [1, 'Grumpy Old Buttz', 0, 'iBuyPowerBottoms', 1],
        [2, 'n00bs', 1, 'Team Sean Connery', 0],
        [3, '8iT - Eight Inches and Thick', 1, 'OHM Gaming', 0],
      ],
      [
        [4, '8iT - Eight Inches and Thick', 0, 'iBuyPowerBottoms', 1],
        [5, 'n00bs', 0, 'Grumpy Old Buttz', 1],
        [6, 'Team Sean Connery', 0, 'OHM Gaming', 1],
      ],
      [
        [7, 'Grumpy Old Buttz', 0, 'OHM Gaming', 1],
        [8, 'iBuyPowerBottoms', 1, 'Team Sean Connery', 0],
        [9, '8iT - Eight Inches and Thick', 1, 'n00bs', 0],
      ],
    ],
  }),
  createBracket({
    id: 'bf4', name: 'BATTLEFIELD 4', shortName: 'BF4', bestOf: 1,
    teamName: 'Eight Inches and Thick',
    tournamentId: '6ab01b89286da9001a4fb83c', stageId: '6ab73697707fa6001aeaf624',
    rounds: [
      [
        [1, 'Team Sean Connery', 0, 'OHM Gaming', 1],
        [2, 'Fragaholics', 0, 'Eight Inches and Thick', 1],
        [3, 'GrumpyOldButtz', 1, 'BFFs', 0],
      ],
      [
        [4, 'GrumpyOldButtz', 1, 'Fragaholics', 0],
        [5, 'OHM Gaming', 0, 'Eight Inches and Thick', 1],
        [6, 'Team Sean Connery', 0, 'BFFs', 1],
      ],
      [
        [7, 'GrumpyOldButtz', 1, 'Eight Inches and Thick', 0],
        [8, 'OHM Gaming', 1, 'BFFs', 0],
        [9, 'Team Sean Connery', 0, 'Fragaholics', 1],
      ],
    ],
  }),
  createBracket({
    id: 'ow2', name: 'OVERWATCH 2', shortName: 'OW2', bestOf: 3,
    teamName: 'Eight Inches and Thick',
    tournamentId: '6a8cdb951f2a2700195a7f51', stageId: '6ab811d1d77f490024d8beeb',
    rounds: [
      [
        [1, 'Team Sean Connery', 0, 'Teh Boyz', 2],
        [2, 'Filthycasuals', 0, 'Eight Inches and Thick', 2],
        [3, 'Fragaholics', 0, 'Grumpy Old Butz', 2],
        [4, 'PiggyRevenge|OHM|', 0, 'OHM Gaming', 2],
      ],
      [
        [5, 'Teh Boyz', 2, 'OHM Gaming', 0],
        [6, 'Grumpy Old Butz', 0, 'Eight Inches and Thick', 2],
        [7, 'PiggyRevenge|OHM|', 2, 'Fragaholics', 0],
        [8, 'Team Sean Connery', 2, 'Filthycasuals', 0],
      ],
      [
        [9, 'Grumpy Old Butz', 0, 'PiggyRevenge|OHM|', 2],
        [10, 'Team Sean Connery', 0, 'OHM Gaming', 2],
        [11, 'Filthycasuals', 0, 'Fragaholics', 2],
        [12, 'Teh Boyz', 2, 'Eight Inches and Thick', 0],
      ],
    ],
  }),
];

export const getTeamRecord = (bracket) => bracket.rounds.reduce((record, round) => {
  const match = round.matches.find((row) => row.teamA === bracket.teamName || row.teamB === bracket.teamName);
  if (!match) return record;
  const ourScore = match.teamA === bracket.teamName ? match.scoreA : match.scoreB;
  const theirScore = match.teamA === bracket.teamName ? match.scoreB : match.scoreA;
  if (ourScore > theirScore) record.wins += 1;
  else if (ourScore < theirScore) record.losses += 1;
  return record;
}, { wins: 0, losses: 0 });
