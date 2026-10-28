import test from 'node:test';
import assert from 'node:assert/strict';
import { MACRO_FORMULAS } from '../src/utils/macroFormulas.ts';

test('MACRO_FORMULAS CPI calculation correctly evaluates surprise and score', () => {
  const cpiFormula = MACRO_FORMULAS.cpi;
  assert.ok(cpiFormula, 'CPI formula should exist');

  // Actual CPI higher than forecast (Inflation surprise)
  const hawkishResult = cpiFormula.calculate(3.4, 3.1, 3.2);
  assert.ok(hawkishResult.surprise > 0, 'Surprise should be positive for higher actual');
  assert.equal(hawkishResult.score, 1.5);
  assert.ok(hawkishResult.interpretation.includes('Hawkish'));

  // Actual CPI lower than forecast
  const dovishResult = cpiFormula.calculate(2.8, 3.1, 3.2);
  assert.ok(dovishResult.surprise < 0, 'Surprise should be negative for lower actual');
  assert.equal(dovishResult.score, -1.5);
  assert.ok(dovishResult.interpretation.includes('Dovish'));
});

test('MACRO_FORMULAS NFP calculation calculates net job surprise', () => {
  const nfpFormula = MACRO_FORMULAS.nfp;
  assert.ok(nfpFormula, 'NFP formula should exist');

  const result = nfpFormula.calculate(250, 180, 200);
  assert.equal(result.surprise, 70);
  assert.equal(result.score, 1.4);
  assert.ok(result.interpretation.includes('Ketat'));
});

test('MACRO_FORMULAS FOMC calculation accurately converts percentage delta to basis points', () => {
  const fomcFormula = MACRO_FORMULAS.fomc;
  assert.ok(fomcFormula, 'FOMC formula should exist');

  const result = fomcFormula.calculate(5.5, 5.25, 5.25);
  assert.equal(result.surprise, 25); // 25 bps surprise
  assert.equal(result.score, 2.0);
  assert.ok(result.interpretation.includes('Hawkish'));
});
