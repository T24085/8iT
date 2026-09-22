import assert from 'node:assert/strict';
import test from 'node:test';
import { defaultSwiss, deriveSwissStandings, swissToPublicBracket } from '../src/siteData.js';

const clone = (value) => structuredClone(value);

test('final Swiss results update records, rounds, and Buchholz', () => {
  const swiss = clone(defaultSwiss);
  const [first, second] = swiss.rounds[0].matches;
  Object.assign(first, { scoreA: 13, scoreB: 9, status: 'FINAL' });
  Object.assign(second, { scoreA: 10, scoreB: 13, status: 'FINAL' });

  const standings = deriveSwissStandings(swiss);
  const teamOne = standings.find((team) => team.id === first.teamAId);
  const teamSixteen = standings.find((team) => team.id === first.teamBId);

  assert.equal(teamOne.wins, 1);
  assert.equal(teamOne.roundDiff, 4);
  assert.equal(teamSixteen.losses, 1);
  assert.equal(teamSixteen.roundDiff, -4);
  assert.equal(teamOne.buchholz, teamSixteen.wins);
});

test('three wins advances and three losses eliminates', () => {
  const swiss = clone(defaultSwiss);
  for (let roundIndex = 0; roundIndex < 3; roundIndex += 1) {
    Object.assign(swiss.rounds[roundIndex].matches[0], {
      teamAId: 'team-1',
      teamBId: `team-${16 - roundIndex}`,
      scoreA: 13,
      scoreB: 7,
      status: 'FINAL',
    });
  }

  const standings = deriveSwissStandings(swiss);
  assert.equal(standings.find((team) => team.id === 'team-1').state, 'ADVANCED');

  for (let roundIndex = 0; roundIndex < 3; roundIndex += 1) {
    swiss.rounds[roundIndex].matches[1] = {
      ...swiss.rounds[roundIndex].matches[1],
      teamAId: 'team-2',
      teamBId: `team-${12 - roundIndex}`,
      scoreA: 5,
      scoreB: 13,
      status: 'FINAL',
    };
  }

  assert.equal(deriveSwissStandings(swiss).find((team) => team.id === 'team-2').state, 'ELIMINATED');
});

test('public bracket resolves stable team ids to current team names', () => {
  const swiss = clone(defaultSwiss);
  swiss.teams[0].name = 'RENAMED 8iT';
  const publicBracket = swissToPublicBracket(swiss);
  assert.equal(publicBracket[0].rows[0][0], 'RENAMED 8iT');
  assert.match(publicBracket[0].title, /ROUND 1/);
});
