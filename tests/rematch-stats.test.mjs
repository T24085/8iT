import assert from 'node:assert/strict';
import test from 'node:test';
import { getRematchPlayer, getRematchTotals, rematchMaps, rematchPlayerStats } from '../src/rematchStats.js';

test('the unofficial rematch keeps exactly five players and two maps', () => {
  assert.deepEqual(rematchMaps, ['Train', 'Ancient']);
  assert.equal(rematchPlayerStats.length, 5);
  for (const player of rematchPlayerStats) {
    assert.deepEqual(Object.keys(player.maps), rematchMaps);
    for (const map of rematchMaps) {
      const stats = player.maps[map];
      for (const key of ['score', 'kills', 'deaths', 'assists', 'hs']) assert.ok(Number.isInteger(stats[key]));
    }
  }
});

test('roster lookups are case-insensitive and two-map K/D/A totals do not combine HS percentages', () => {
  assert.deepEqual(getRematchTotals(getRematchPlayer('PandaMonium')), { kills: 31, deaths: 32, assists: 15 });
  assert.deepEqual(getRematchTotals(getRematchPlayer('ghettobird')), { kills: 55, deaths: 28, assists: 6 });
  assert.deepEqual(getRematchTotals(getRematchPlayer('TITAN101')), { kills: 41, deaths: 28, assists: 4 });
  assert.deepEqual(getRematchTotals(getRematchPlayer('Hanosandy')), { kills: 24, deaths: 34, assists: 13 });
  assert.deepEqual(getRematchTotals(getRematchPlayer('ghosted')), { kills: 30, deaths: 29, assists: 12 });
  assert.equal(getRematchPlayer('ghosted'), getRematchPlayer('Zixxy'));
  assert.equal(getRematchPlayer('Hanosandy').maps.Ancient.hs, 21);
  assert.equal(getRematchTotals(getRematchPlayer('BitchStewie')), null);
});
