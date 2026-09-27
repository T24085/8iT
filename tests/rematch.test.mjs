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
  assert.match(defaultRematch.maps[1].name, /unconfirmed/i);
  assert.ok(defaultRematch.maps.every((map) => map.ourScore === '' && map.opponentScore === ''));
});

test('older saved admin data gains two editable rematch maps without fabricated scores', () => {
  const restored = hydrateRematch({ opponent: 'iBuyPowerBottoms', maps: [{ name: 'Train', ourScore: '13' }] });
  assert.equal(restored.maps[0].ourScore, '13');
  assert.equal(restored.maps[0].opponentScore, '');
  assert.match(restored.maps[1].name, /unconfirmed/i);
  assert.notEqual(restored.maps, defaultRematch.maps);
});
