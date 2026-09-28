import { displayPlayerName, rosterPlayerName } from './playerIdentity.js';
import { recordedCompetitiveMaps } from './recordedMatchStats.js';
import { rematchMaps, rematchPlayerStats } from './rematchStats.js';

export function getPlayerMapRows(scope) {
  if (scope === 'friendly') {
    return rematchMaps.flatMap((map) => rematchPlayerStats.map((player) => ({
      scope,
      map,
      player: rosterPlayerName(player.name),
      displayName: displayPlayerName(player.name),
      ...player.maps[map],
    })));
  }
  return recordedCompetitiveMaps.flatMap((map) => map.teams
    .filter((team) => team.label.includes('8iT'))
    .flatMap((team) => team.players.map((player) => ({
      scope: 'official',
      map: map.map,
      player: rosterPlayerName(player.name),
      displayName: displayPlayerName(player.name),
      ...player,
    }))));
}

export function getPlayerSummaries(scope) {
  const players = new Map();
  for (const row of getPlayerMapRows(scope)) {
    const current = players.get(row.player) || {
      player: row.player, displayName: row.displayName, maps: 0,
      kills: 0, deaths: 0, assists: 0, damage: 0, score: 0,
    };
    current.maps += 1;
    current.kills += row.kills;
    current.deaths += row.deaths;
    current.assists += row.assists;
    if (scope === 'official') current.damage += row.damage;
    else current.score += row.score;
    players.set(row.player, current);
  }
  return [...players.values()].map((player) => ({
    ...player,
    kd: player.deaths > 0 ? player.kills / player.deaths : null,
    differential: player.kills - player.deaths,
  }));
}

export function getOfficialOpponentRows() {
  return recordedCompetitiveMaps.flatMap((map) => map.teams
    .filter((team) => !team.label.includes('8iT'))
    .flatMap((team) => team.players.map((player) => ({
      map: map.map,
      team: team.label,
      ...player,
    }))));
}

export function getOfficialTeamOutput() {
  return recordedCompetitiveMaps.flatMap((map) => map.teams.map((team) => ({
    map: map.map,
    team: team.label.includes('8iT') ? '8iT' : team.label,
    isUs: team.label.includes('8iT'),
    kills: team.players.reduce((total, player) => total + player.kills, 0),
    damage: team.players.reduce((total, player) => total + player.damage, 0),
  })));
}

export function getMapScorelines(scope, rematch) {
  if (scope === 'friendly') {
    return (rematch?.maps || []).filter((map) =>
      Number.isFinite(Number(map.ourScore)) && Number.isFinite(Number(map.opponentScore))
      && String(map.ourScore).trim() !== '' && String(map.opponentScore).trim() !== '')
      .map((map) => ({
        map: map.name,
        us: Number(map.ourScore),
        them: Number(map.opponentScore),
        opponent: rematch.opponent,
      }));
  }
  return recordedCompetitiveMaps.map((map) => {
    const us = map.sides.find((side) => side.label.includes('8iT'));
    const them = map.sides.find((side) => !side.label.includes('8iT'));
    return { map: map.map, us: us.score, them: them.score, opponent: them.label };
  });
}
