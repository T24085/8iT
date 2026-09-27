import assert from 'node:assert/strict';
import test from 'node:test';
import { defaultSwiss, deriveSwissStandings, hydrateSwiss, swissToPublicBracket } from '../src/siteData.js';
import { getTeamRecord, officialTournamentBrackets } from '../src/tournamentBrackets.js';

const clone = (value) => structuredClone(value);

test('the three public brackets contain the completed Battlefy rounds and team records', () => {
  assert.deepEqual(officialTournamentBrackets.map((bracket) => bracket.rounds.map((round) => round.matches.length)), [
    [3, 3, 3], [3, 3, 3], [4, 4, 4],
  ]);
  assert.deepEqual(officialTournamentBrackets.map((bracket) => bracket.bestOf), [1, 1, 3]);
  assert.deepEqual(officialTournamentBrackets.map(getTeamRecord), [
    { wins: 2, losses: 1 }, { wins: 2, losses: 1 }, { wins: 2, losses: 1 },
  ]);
  assert.ok(officialTournamentBrackets.every((bracket) => bracket.rounds.every((round) => round.matches.every((match) => match.status === 'FINAL'))));
});

test('CS2 editor starts with six real teams, three completed rounds, and no invented maps', () => {
  assert.equal(defaultSwiss.teams.length, 6);
  assert.equal(defaultSwiss.rounds.length, 3);
  assert.deepEqual(defaultSwiss.rounds.map((round) => round.matches.length), [3, 3, 3]);
  assert.ok(defaultSwiss.rounds.every((round) => round.status === 'COMPLETE' && round.matches.every((match) => match.status === 'FINAL' && match.map === '')));
  const standings = deriveSwissStandings(defaultSwiss);
  assert.deepEqual(standings.map(({ name, wins, losses }) => [name, wins, losses]), [
    ['iBuyPowerBottoms', 3, 0],
    ['8iT - Eight Inches and Thick', 2, 1],
    ['OHM Gaming', 2, 1],
    ['Grumpy Old Buttz', 1, 2],
    ['n00bs', 1, 2],
    ['Team Sean Connery', 0, 3],
  ]);
  assert.ok(standings.every((row) => row.state === 'FINAL'));
});

test('an older 16-team local demo bracket is replaced without changing the new source data', () => {
  const old = { teams: Array.from({ length: 16 }, (_, index) => ({ id: `team-${index + 1}`, name: `Demo ${index + 1}` })), rounds: Array.from({ length: 5 }, () => ({ matches: [] })) };
  const restored = hydrateSwiss(old);
  assert.equal(restored.teams.length, 6);
  assert.equal(restored.rounds.length, 3);
  assert.notEqual(restored.rounds, defaultSwiss.rounds);
});

test('same-browser CS2 edits remain visible in the public bracket', () => {
  const swiss = clone(defaultSwiss);
  swiss.teams[1].name = 'RENAMED 8iT';
  swiss.rounds[0].matches[2].scoreA = 0;
  swiss.rounds[0].matches[2].scoreB = 1;
  const publicBracket = swissToPublicBracket(swiss);
  assert.equal(publicBracket[0].rows[2][0], 'RENAMED 8iT');
  assert.equal(publicBracket[0].rows[2][1], '0');
  assert.equal(publicBracket[0].rows[2][5], 3);
});
