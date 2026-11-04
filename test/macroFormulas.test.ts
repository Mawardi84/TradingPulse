import test from 'node:test';
import assert from 'node:assert/strict';
import { MACRO_FORMULAS } from '../src/utils/macroFormulas.ts';
import { generateMacroTradingSignal, calculateMacroSurprise } from '../src/utils/macroStrategy.ts';
import { EconomicEvent } from '../src/types/market.ts';

test('MACRO_FORMULAS CPI calculation correctly evaluates surprise and score', () => {
  const cpiFormula = MACRO_FORMULAS.cpi;
  assert.ok(cpiFormula, 'CPI formula should exist');

  // Actual CPI higher than forecast (Inflation surprise)
  const hawkishResult = cpiFormula.calculate(3.4, 3.1, 3.2);
  assert.ok(hawkishResult.surprise > 0, 'Surprise should be positive for higher actual');
  assert.equal(hawkishResult.score, 1.5);
  assert.ok(hawkishResult.interpretation.includes('Hawkish'));
  assert.ok(hawkishResult.assetImpacts.length >= 3, 'Should provide multi-asset impacts');
  
  // Gold should be bearish on hot CPI (rising real yields)
  const goldImpact = hawkishResult.assetImpacts.find((a) => a.symbol === 'XAUUSD');
  assert.ok(goldImpact, 'Gold impact must be computed');
  assert.equal(goldImpact.direction, 'BEARISH');

  // Actual CPI lower than forecast
  const dovishResult = cpiFormula.calculate(2.8, 3.1, 3.2);
  assert.ok(dovishResult.surprise < 0, 'Surprise should be negative for lower actual');
  assert.equal(dovishResult.score, -1.5);
  assert.ok(dovishResult.interpretation.includes('Dovish'));
  const dovishGold = dovishResult.assetImpacts.find((a) => a.symbol === 'XAUUSD');
  assert.equal(dovishGold?.direction, 'BULLISH');
});

test('MACRO_FORMULAS NFP calculation calculates net job surprise', () => {
  const nfpFormula = MACRO_FORMULAS.nfp;
  assert.ok(nfpFormula, 'NFP formula should exist');

  const result = nfpFormula.calculate(250, 180, 200);
  assert.equal(result.surprise, 70);
  assert.equal(result.score, 1.4);
  assert.ok(result.interpretation.includes('Ketat'));
  assert.ok(result.assetImpacts.length > 0);
});

test('MACRO_FORMULAS FOMC calculation accurately converts percentage delta to basis points', () => {
  const fomcFormula = MACRO_FORMULAS.fomc;
  assert.ok(fomcFormula, 'FOMC formula should exist');

  const result = fomcFormula.calculate(5.5, 5.25, 5.25);
  assert.equal(result.surprise, 25); // 25 bps surprise
  assert.equal(result.score, 2.0);
  assert.ok(result.interpretation.includes('Hawkish'));
});

test('MacroStrategy directional engine respects asset quote/base currencies and safe havens', () => {
  const hawkishEvent: EconomicEvent = {
    id: 'cpi-us',
    timestamp: '2026-11-04 20:30:00',
    dateLabel: 'Hari Ini',
    timeWIB: '20:30 WIB',
    countryCode: 'US',
    countryName: 'United States',
    currency: 'USD',
    event: 'US Core CPI YoY',
    impact: 'High',
    forecast: '3.0%',
    actual: '3.5%',
    previous: '3.1%',
    unit: '%',
    category: 'Inflation',
    analysisSummary: 'Inflasi inti tahunan AS',
    affectedAssets: ['XAUUSD', 'EURUSD', 'USDJPY', 'SPX500', 'BTCUSDT']
  };

  const surprise = calculateMacroSurprise(hawkishEvent);
  assert.ok(surprise > 0, 'Surprise should be positive for high CPI');

  // On hot US CPI, USD strengthens:
  // EURUSD (Quote USD) -> SELL
  const eurUsdSignal = generateMacroTradingSignal(hawkishEvent, surprise, { symbol: 'EURUSD' });
  assert.equal(eurUsdSignal, 'Sell', 'EURUSD should be Sell when USD strengthens');

  // USDJPY (Base USD) -> BUY
  const usdJpySignal = generateMacroTradingSignal(hawkishEvent, surprise, { symbol: 'USDJPY' });
  assert.equal(usdJpySignal, 'Buy', 'USDJPY should be Buy when USD strengthens');

  // XAUUSD (Gold) -> SELL due to real yield pressure
  const goldSignal = generateMacroTradingSignal(hawkishEvent, surprise, { symbol: 'XAUUSD' });
  assert.equal(goldSignal, 'Sell', 'Gold should be Sell on hot inflation / rate hike surprise');

  // BTCUSDT -> SELL due to risk-off liquidity drainage
  const btcSignal = generateMacroTradingSignal(hawkishEvent, surprise, { symbol: 'BTCUSDT' });
  assert.equal(btcSignal, 'Sell', 'Crypto should be Sell on hawkish Fed surprise');
});
