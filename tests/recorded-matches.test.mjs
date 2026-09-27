import assert from 'node:assert/strict';
import test from 'node:test';
import { displayPlayerName, rosterPlayerName } from '../src/playerIdentity.js';
import { getRecordedPlayerStats, getRecordedPlayerTotals, recordedCompetitiveMaps } from '../src/recordedMatchStats.js';

test('BitchStewie and Zixxy resolve to one roster identity', () => {
  assert.equal(rosterPlayerName('Zixxy'), 'BitchStewie');
  assert.equal(displayPlayerName('Zixxy'), 'BitchStewie (Zixxy)');
  assert.deepEqual(getRecordedPlayerStats('BitchStewie'), getRecordedPlayerStats('Zixxy'));
});

test('the supplied competitive scoreboards remain distinct from the friendly rematch', () => {
  assert.deepEqual(recordedCompetitiveMaps.map(({ map, sides }) => [map, ...sides.map(({ score }) => score)]), [
    ['Dust II', 13, 0], ['Inferno', 19, 16],
  ]);
  assert.equal(recordedCompetitiveMaps[0].sides[1].label, 'DHM Gaming');
  assert.equal(recordedCompetitiveMaps[1].sides[0].label, 'team_mub');
  assert.equal(recordedCompetitiveMaps[1].sides[1].label, 'team_ghettobird (8iT)');
  assert.equal(recordedCompetitiveMaps[0].teams.flatMap(({ players }) => players).length, 10);
  assert.equal(recordedCompetitiveMaps[1].teams.flatMap(({ players }) => players).length, 10);
  assert.deepEqual(getRecordedPlayerStats('BitchStewie').map(({ map, stats }) => [map, stats.kills, stats.damage]), [
    ['Dust II', 9, 1264], ['Inferno', 20, 2189],
  ]);
});

test('only the two completed competitive maps appear in recorded player stats', () => {
  assert.equal(recordedCompetitiveMaps.length, 2);
  assert.deepEqual(getRecordedPlayerStats('BitchStewie').map(({ map }) => map), ['Dust II', 'Inferno']);
});

test('roster official totals sum only the supplied competitive maps', () => {
  assert.deepEqual(getRecordedPlayerTotals('PandaMonium'), { kills: 40, deaths: 36, assists: 15 });
  assert.deepEqual(getRecordedPlayerTotals('BitchStewie'), { kills: 29, deaths: 29, assists: 9 });
  assert.deepEqual(getRecordedPlayerTotals('Zixxy'), getRecordedPlayerTotals('BitchStewie'));
  assert.deepEqual(getRecordedPlayerTotals('ghettobird'), { kills: 48, deaths: 29, assists: 5 });
  assert.deepEqual(getRecordedPlayerTotals('Hanosandy'), { kills: 37, deaths: 25, assists: 14 });
  assert.deepEqual(getRecordedPlayerTotals('Titan101'), { kills: 29, deaths: 30, assists: 10 });
  assert.equal(getRecordedPlayerTotals('ghosted'), null);
});
