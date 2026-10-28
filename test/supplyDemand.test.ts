import test from 'node:test';
import assert from 'node:assert/strict';
import {
  findSupplyDemandZones,
  calculateRSI,
  calculateEMA,
  calculateSMA,
  calculateBollingerBands,
  evaluateTechnicalSummary,
} from '../src/utils/indicators.ts';
import { Candle } from '../src/types/market.ts';

function createMockCandles(count = 60, basePrice = 4000): Candle[] {
  const candles: Candle[] = [];
  let price = basePrice;
  const now = 1700000000;

  for (let i = 0; i < count; i++) {
    const wave = Math.sin(i / 4) * 15;
    price += wave;
    candles.push({
      time: now + i * 900,
      open: price - 3,
      high: price + 6,
      low: price - 6,
      close: price,
      volume: 5000 + i * 50,
    });
  }
  return candles;
}

test('calculateSMA and calculateEMA output expected length and valid numbers', () => {
  const candles = createMockCandles(30, 100);
  const sma20 = calculateSMA(candles, 20);
  const ema20 = calculateEMA(candles, 20);

  assert.equal(sma20.length, 30);
  assert.equal(ema20.length, 30);

  // Before period 20, values should be null
  assert.equal(sma20[0], null);
  assert.equal(ema20[0], null);

  // At index 19 (20th element), value should be a number
  assert.ok(typeof sma20[19] === 'number');
  assert.ok(typeof ema20[19] === 'number');
});

test('calculateRSI returns values within 0 and 100 range', () => {
  const candles = createMockCandles(40, 2000);
  const rsi = calculateRSI(candles, 14);

  assert.equal(rsi.length, 40);
  rsi.forEach((val) => {
    if (val !== null) {
      assert.ok(val >= 0 && val <= 100, `RSI value ${val} must be between 0 and 100`);
    }
  });
});

test('calculateBollingerBands generates upper, middle, lower bands correctly', () => {
  const candles = createMockCandles(30, 1000);
  const bb = calculateBollingerBands(candles, 20, 2);

  const lastBB = bb[bb.length - 1];
  assert.ok(lastBB.upper !== null && lastBB.middle !== null && lastBB.lower !== null);
  assert.ok(lastBB.upper >= lastBB.middle, 'Upper band must be above middle band');
  assert.ok(lastBB.middle >= lastBB.lower, 'Middle band must be above lower band');
});

test('findSupplyDemandZones validates price boundaries, labels, and strengths', () => {
  const candles = createMockCandles(100, 1.1000);
  const zones = findSupplyDemandZones(candles);

  zones.forEach((z) => {
    assert.ok(z.top > z.bottom, 'Zone top must be strictly greater than bottom');
    assert.ok(
      z.strength === 'Fresh' || z.strength === 'Tested' || z.strength === 'Strong',
      'Zone strength must be Fresh, Tested, or Strong'
    );
    assert.ok(typeof z.label === 'string', 'Zone must have a descriptive label');
  });
});

test('evaluateTechnicalSummary provides full technical rating, buy/sell counts and pivots', () => {
  const candles = createMockCandles(50, 80000);
  const summary = evaluateTechnicalSummary(candles, 2);

  assert.ok(typeof summary.score === 'number');
  assert.ok(typeof summary.buyCount === 'number');
  assert.ok(typeof summary.sellCount === 'number');
  assert.ok(summary.readings.length > 0);
  assert.ok(summary.pivots.p > 0);
});
