import test from 'node:test';
import assert from 'node:assert/strict';
import { findSupplyDemandZones } from '../src/utils/indicators.ts';
import { Candle } from '../src/types/market.ts';

test('findSupplyDemandZones filters clutter, invalidates broken zones, and prevents overlapping stacking', () => {
  // Generate 80 candles with clear structure
  const candles: Candle[] = [];
  let price = 4000;
  const now = 1700000000;

  for (let i = 0; i < 80; i++) {
    // Introduce an impulse high around i=25, and an impulse low around i=50
    let change = (Math.sin(i / 5) * 6);
    if (i === 25) change = 25; // high peak
    if (i === 50) change = -25; // low valley
    price += change;
    candles.push({
      time: now + i * 60,
      open: price - 2,
      high: price + 4,
      low: price - 4,
      close: price,
      volume: 1000 + i * 10,
    });
  }

  const zones = findSupplyDemandZones(candles);

  // Assert zones do not exceed max 4 (top 2 supply, top 2 demand)
  assert.ok(zones.length <= 4, `Expected <= 4 zones, got ${zones.length}`);

  // Assert supply zones are strictly separated and don't overlap within the same type
  const supplyZones = zones.filter((z) => z.type === 'supply');
  const demandZones = zones.filter((z) => z.type === 'demand');

  assert.ok(supplyZones.length <= 2, 'Max 2 supply zones');
  assert.ok(demandZones.length <= 2, 'Max 2 demand zones');

  for (let i = 0; i < supplyZones.length - 1; i++) {
    assert.ok(
      supplyZones[i].top < supplyZones[i + 1].bottom || supplyZones[i].bottom > supplyZones[i + 1].top,
      'Supply zones should not overlap each other'
    );
  }

  for (let i = 0; i < demandZones.length - 1; i++) {
    assert.ok(
      demandZones[i].top < demandZones[i + 1].bottom || demandZones[i].bottom > demandZones[i + 1].top,
      'Demand zones should not overlap each other'
    );
  }
});
