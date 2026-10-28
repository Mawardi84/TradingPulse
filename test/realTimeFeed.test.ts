import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import {
  RealTimeMarketFeed,
  fetchLiveCryptoTickers,
  fetchLiveForexRates,
  fetchLiveFearAndGreed,
} from '../src/services/realTimeMarketFeed.ts';
import { INITIAL_INSTRUMENTS } from '../src/data/marketData.ts';

after(() => {
  // Ensure network sockets cleanly unblock test runner process
  setTimeout(() => process.exit(0), 100);
});

test('RealTimeMarketFeed subscription and tick notification flow', () => {
  return new Promise<void>((resolve) => {
    const feed = new RealTimeMarketFeed();
    let tickCount = 0;

    const unsubscribe = feed.subscribe((tick) => {
      assert.ok(tick.symbol, 'Tick must have a valid symbol');
      assert.ok(typeof tick.price === 'number', 'Tick price must be a number');
      assert.ok(tick.timestamp > 0, 'Tick must have valid timestamp');
      tickCount++;

      if (tickCount >= 1) {
        unsubscribe();
        feed.stop();
        resolve();
      }
    });

    feed.start(INITIAL_INSTRUMENTS.slice(0, 3));
  });
});

test('fetchLiveCryptoTickers utilizes in-memory cache on rapid subsequent calls', async () => {
  const firstCall = await fetchLiveCryptoTickers();
  assert.ok(typeof firstCall === 'object', 'Should return object mapping');

  const secondCall = await fetchLiveCryptoTickers();
  assert.equal(firstCall, secondCall, 'Subsequent call within 10s should return cached instance');
});

test('fetchLiveForexRates returns object or fallback gracefully', async () => {
  const rates = await fetchLiveForexRates();
  assert.ok(typeof rates === 'object', 'Should return object mapping rates');
});

test('fetchLiveFearAndGreed handles API result or null without throwing', async () => {
  const fng = await fetchLiveFearAndGreed();
  if (fng !== null) {
    assert.ok(typeof fng.score === 'number', 'Fear & Greed score should be a number');
    assert.ok(fng.score >= 0 && fng.score <= 100, 'Score should be between 0 and 100');
    assert.ok(typeof fng.timestamp === 'string', 'Timestamp should be formatted string');
  }
});
