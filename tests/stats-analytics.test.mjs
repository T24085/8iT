import assert from 'node:assert/strict';
import test from 'node:test';
import { defaultRematch } from '../src/siteData.js';
import { getMapScorelines, getOfficialOpponentRows, getOfficialTeamOutput, getPlayerMapRows, getPlayerSummaries } from '../src/statsAnalytics.js';

test('official scoreboards cover only two maps and five 8iT players', () => {
  const rows = getPlayerMapRows('official');
  assert.equal(rows.length, 10);
  assert.deepEqual([...new Set(rows.map(({ map }) => map))], ['Dust II', 'Inferno']);
  assert.equal(rows.find(({ map, player }) => map === 'Dust II' && player === 'BitchStewie').kills, 9);
  const summaries = getPlayerSummaries('official');
  assert.equal(summaries.length, 5);
  assert.deepEqual(summaries.find(({ player }) => player === 'PandaMonium'), {
    player: 'PandaMonium', displayName: 'PandaMonium', maps: 2,
    kills: 40, deaths: 36, assists: 15, damage: 4564, score: 0,
    kd: 40 / 36, differential: 4,
  });
  assert.equal(summaries.find(({ player }) => player === 'ghettobird').damage, 4639);
});

test('friendly stats and scores stay distinct from official games', () => {
  assert.equal(getPlayerMapRows('friendly').length, 10);
  const zixxy = getPlayerSummaries('friendly').find(({ player }) => player === 'BitchStewie');
  assert.equal(zixxy.score, 140);
  assert.deepEqual([zixxy.kills, zixxy.deaths, zixxy.assists], [30, 29, 12]);
  assert.deepEqual(getMapScorelines('official').map(({ map, us, them }) => [map, us, them]), [
    ['Dust II', 13, 0], ['Inferno', 16, 19],
  ]);
  assert.deepEqual(getMapScorelines('friendly', defaultRematch).map(({ map, us, them }) => [map, us, them]), [
    ['Train', 13, 11], ['Ancient', 13, 9],
  ]);
});

test('recorded opponent rows and team output come only from official scoreboards', () => {
  assert.equal(getOfficialOpponentRows().length, 10);
  assert.deepEqual(getOfficialTeamOutput().map(({ map, team, kills, damage }) => [map, team, kills, damage]), [
    ['Dust II', '8iT', 64, 6670],
    ['Dust II', 'DHM Gaming', 19, 2606],
    ['Inferno', '8iT', 119, 13222],
    ['Inferno', 'team_mub', 125, 13444],
  ]);
});
