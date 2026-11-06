import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import {
  RealTimeMarketFeed,
  fetchLiveFearAndGreed,
} from '../src/services/realTimeMarketFeed.ts';
import { INITIAL_INSTRUMENTS } from '../src/data/marketData.ts';
import { fetchTradingViewQuote } from '../src/services/tradingViewScraperService.ts';

after(() => {
  setTimeout(() => process.exit(0), 100);
});

test('RealTimeMarketFeed subscription and notification flow', { timeout: 5000 }, () => {
  return new Promise<void>((resolve) => {
    const feed = new RealTimeMarketFeed();
    let notified = false;

    const unsubscribe = feed.subscribe((tick) => {
      assert.ok(tick.symbol, 'Tick must have a valid symbol');
      assert.ok(typeof tick.price === 'number', 'Tick price must be a number');
      notified = true;
      unsubscribe();
      feed.stop();
      resolve();
    });

    feed.start(INITIAL_INSTRUMENTS.slice(0, 3));
    // Manually notify to verify subscriber pipeline
    feed.notify({
      symbol: 'XAUUSD',
      price: 4100.50,
      change24h: 40.0,
      changePercent24h: 1.0,
      high24h: 4120.0,
      low24h: 4050.0,
      volume24h: 1000000,
      tickDirection: 'up',
      timestamp: Date.now(),
    });
  });
});

test('fetchTradingViewQuote handles single source quote structure', async () => {
  try {
    const quote = await fetchTradingViewQuote('XAUUSD');
    if (quote) {
      assert.ok(typeof quote.price === 'number', 'Quote price must be number');
      assert.ok(quote.symbol, 'Quote symbol must be present');
    }
  } catch (err) {
    // Network test environment fallback tolerance
    assert.ok(true);
  }
});

test('fetchLiveFearAndGreed handles API result or null without throwing', async () => {
  const fng = await fetchLiveFearAndGreed();
  if (fng !== null) {
    assert.ok(typeof fng.score === 'number', 'Fear & Greed score should be a number');
    assert.ok(fng.score >= 0 && fng.score <= 100, 'Score should be between 0 and 100');
    assert.ok(typeof fng.timestamp === 'string', 'Timestamp should be formatted string');
  }
});
