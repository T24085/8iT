import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultRematch, hydrateRematch, official8itResults } from '../src/siteData.js';

test('official LANFest record is distinct from the friendly rematch', () => {
  assert.deepEqual(official8itResults.map(({ opponent, result }) => [opponent, result]), [
    ['OHM Gaming', 'WIN'],
    ['iBuyPowerBottoms', 'LOSS'],
    ['n00bs', 'WIN'],
  ]);
  assert.equal(defaultRematch.opponent, 'iBuyPowerBottoms');
  assert.equal(defaultRematch.maps[0].name, 'Train');
  assert.equal(defaultRematch.maps[1].name, 'Ancient');
  assert.ok(defaultRematch.maps.every((map) => map.ourScore === '' && map.opponentScore === ''));
});

test('older saved admin data gains two editable rematch maps without fabricated scores', () => {
  const restored = hydrateRematch({ opponent: 'iBuyPowerBottoms', maps: [{ name: 'Train', ourScore: '13' }] });
  assert.equal(restored.maps[0].ourScore, '13');
  assert.equal(restored.maps[0].opponentScore, '');
  assert.equal(restored.maps[1].name, 'Ancient');
  assert.notEqual(restored.maps, defaultRematch.maps);
});

test('saved placeholder map names migrate to Ancient without changing scores or custom map edits', () => {
  const migrated = hydrateRematch({ maps: [
    { name: 'Train', ourScore: '' },
    { name: 'Map 02 — unconfirmed', ourScore: '13', opponentScore: '9' },
  ] });
  assert.equal(migrated.maps[1].name, 'Ancient');
  assert.deepEqual([migrated.maps[1].ourScore, migrated.maps[1].opponentScore], ['13', '9']);
  assert.equal(hydrateRematch({ maps: [{ name: 'Train' }, { name: 'Mirage' }] }).maps[1].name, 'Mirage');
});
