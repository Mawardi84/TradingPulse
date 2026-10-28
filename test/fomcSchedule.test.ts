import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FOMC_MEETINGS_2026,
  CME_FEDWATCH_PROBABILITIES,
  FOMC_ASSET_PLAYBOOK,
  CURRENT_FED_FUNDS_RATE,
} from '../src/data/fomcScheduleData.ts';
import { ECONOMIC_EVENTS } from '../src/data/marketData.ts';

test('FOMC schedule data contains all 8 annual meetings with valid structure', () => {
  assert.equal(FOMC_MEETINGS_2026.length, 8, 'There should be 8 scheduled meetings for the 2026 cycle');

  const nextMeetings = FOMC_MEETINGS_2026.filter((m) => m.status === 'next');
  assert.equal(nextMeetings.length, 1, 'There must be exactly one meeting flagged as next');
  assert.equal(nextMeetings[0].id, 'fomc-2026-11');
  assert.ok(nextMeetings[0].meetingDates.includes('November'));

  for (const m of FOMC_MEETINGS_2026) {
    assert.ok(m.decisionTimeWIB, 'Every meeting should have decisionTimeWIB');
    assert.ok(m.rateBefore, 'Every meeting should have rateBefore');
    assert.ok(m.rateAfterOrExpected, 'Every meeting should have rateAfterOrExpected');
    assert.ok(m.affectedAssets.length > 0, 'Every meeting should list affected assets');
  }
});

test('CME FedWatch probabilities sum to 100% and current rate is valid', () => {
  assert.equal(CURRENT_FED_FUNDS_RATE, '4.75% - 5.00%');
  const sum = CME_FEDWATCH_PROBABILITIES.reduce((acc, curr) => acc + curr.probability, 0);
  assert.equal(Math.round(sum), 100, 'CME probabilities should total 100%');

  const cut25Option = CME_FEDWATCH_PROBABILITIES.find((opt) => opt.changeBps === -25);
  assert.ok(cut25Option, '25 bps cut option should exist');
  assert.ok(cut25Option.probability > 90, 'Market should price high probability of 25 bps cut');
});

test('FOMC asset playbook provides actionable levels for key assets', () => {
  assert.ok(FOMC_ASSET_PLAYBOOK.length >= 4, 'Playbook should cover at least 4 major assets');
  const gold = FOMC_ASSET_PLAYBOOK.find((a) => a.symbol === 'XAUUSD');
  const btc = FOMC_ASSET_PLAYBOOK.find((a) => a.symbol === 'BTCUSDT');

  assert.ok(gold, 'Gold playbook entry must exist');
  assert.ok(gold.dovishReaction.includes('RALLY'));
  assert.ok(btc, 'BTC playbook entry must exist');
  assert.ok(btc.dovishReaction.includes('PUMP'));
});

test('ECONOMIC_EVENTS contains FOMC rate decision and press conference events', () => {
  const fomcEvents = ECONOMIC_EVENTS.filter((e) => e.id.includes('fomc') || e.event.includes('FOMC'));
  assert.ok(fomcEvents.length >= 2, 'At least 2 FOMC events should exist in the economic calendar');

  const rateDecision = fomcEvents.find((e) => e.id === 'ec-fomc-1');
  assert.ok(rateDecision, 'ec-fomc-1 must exist');
  assert.equal(rateDecision.category, 'Central Bank');
  assert.equal(rateDecision.impact, 'High');
});
