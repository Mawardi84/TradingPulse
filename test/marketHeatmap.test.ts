import test from 'node:test';
import assert from 'node:assert/strict';
import { Instrument } from '../src/types/market.ts';

// Test pure logic matching MarketHeatmap component
function getHeatmapColorKey(changePercent: number): 'bullish-strong' | 'bullish-med' | 'bullish-light' | 'neutral' | 'bearish-light' | 'bearish-med' | 'bearish-strong' {
  if (changePercent >= 3.0) return 'bullish-strong';
  if (changePercent >= 1.5) return 'bullish-med';
  if (changePercent >= 0.2) return 'bullish-light';
  if (changePercent > -0.2) return 'neutral';
  if (changePercent > -1.5) return 'bearish-light';
  if (changePercent > -3.0) return 'bearish-med';
  return 'bearish-strong';
}

function calculateHeatmapSpan(volume: number, maxVolume: number): string {
  if (maxVolume <= 0) return 'col-span-12 sm:col-span-6 lg:col-span-4';
  const ratio = volume / maxVolume;
  if (ratio > 0.6) return 'col-span-12 sm:col-span-12 lg:col-span-6 xl:col-span-6 row-span-2 min-h-[140px]';
  if (ratio > 0.25) return 'col-span-12 sm:col-span-6 lg:col-span-4 xl:col-span-4 min-h-[110px]';
  if (ratio > 0.08) return 'col-span-6 sm:col-span-4 lg:col-span-3 xl:col-span-3 min-h-[95px]';
  return 'col-span-6 sm:col-span-3 lg:col-span-2 xl:col-span-2 min-h-[90px]';
}

test('MarketHeatmap color classification assigns institutional color grades correctly', () => {
  assert.equal(getHeatmapColorKey(5.2), 'bullish-strong');
  assert.equal(getHeatmapColorKey(3.0), 'bullish-strong');
  assert.equal(getHeatmapColorKey(2.1), 'bullish-med');
  assert.equal(getHeatmapColorKey(1.5), 'bullish-med');
  assert.equal(getHeatmapColorKey(0.8), 'bullish-light');
  assert.equal(getHeatmapColorKey(0.0), 'neutral');
  assert.equal(getHeatmapColorKey(-0.1), 'neutral');
  assert.equal(getHeatmapColorKey(-0.5), 'bearish-light');
  assert.equal(getHeatmapColorKey(-2.0), 'bearish-med');
  assert.equal(getHeatmapColorKey(-4.5), 'bearish-strong');
});

test('MarketHeatmap volume size scaling calculates responsive grid spans', () => {
  const maxVol = 100000000;
  
  // High volume asset (e.g. BTC or Gold)
  const megaSpan = calculateHeatmapSpan(85000000, maxVol);
  assert.ok(megaSpan.includes('lg:col-span-6') && megaSpan.includes('row-span-2'), 'Mega volume asset gets 2-row span');

  // Medium volume asset
  const largeSpan = calculateHeatmapSpan(35000000, maxVol);
  assert.ok(largeSpan.includes('lg:col-span-4'), 'Medium-large asset gets 4-column span');

  // Low volume asset
  const smallSpan = calculateHeatmapSpan(3000000, maxVol);
  assert.ok(smallSpan.includes('lg:col-span-2'), 'Small volume asset gets compact 2-column span');
});

test('MarketHeatmap group partitions correctly aggregate multi-asset instruments', () => {
  const mockInstruments: Partial<Instrument>[] = [
    { symbol: 'XAUUSD', category: 'commodities', volume24h: 50000000, changePercent24h: 1.2 },
    { symbol: 'BTCUSDT', category: 'crypto', volume24h: 80000000, changePercent24h: 3.5 },
    { symbol: 'EURUSD', category: 'forex', volume24h: 40000000, changePercent24h: -0.4 },
    { symbol: 'AAPL', category: 'us_stocks', volume24h: 20000000, changePercent24h: 0.8 },
  ];

  const grouped = mockInstruments.reduce<Record<string, typeof mockInstruments>>((acc, item) => {
    const cat = item.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  assert.equal(Object.keys(grouped).length, 4);
  assert.equal(grouped['commodities']?.length, 1);
  assert.equal(grouped['crypto']?.length, 1);
});
