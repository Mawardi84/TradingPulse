import { Candle, IndicatorReading, OverallRating, PivotLevels, SignalAction, TechnicalSummary, SupplyDemandZone } from '../types/market';

export function calculateSMA(candles: Candle[], period: number): (number | null)[] {
  if (period <= 0) return candles.map(() => null);
  const result: (number | null)[] = [];
  let sum = 0;
  for (let i = 0; i < candles.length; i++) {
    sum += candles[i].close;
    if (i >= period) {
      sum -= candles[i - period].close;
    }
    if (i >= period - 1) {
      result.push(Number((sum / period).toFixed(6)));
    } else {
      result.push(null);
    }
  }
  return result;
}

export function calculateEMA(candles: Candle[], period: number): (number | null)[] {
  if (period <= 0 || candles.length === 0) return candles.map(() => null);
  const result: (number | null)[] = [];
  const k = 2 / (period + 1);
  let ema: number | null = null;
  let sum = 0;

  for (let i = 0; i < candles.length; i++) {
    const price = candles[i].close;
    if (i < period - 1) {
      sum += price;
      result.push(null);
    } else if (i === period - 1) {
      sum += price;
      ema = sum / period;
      result.push(Number(ema.toFixed(6)));
    } else {
      ema = price * k + (ema as number) * (1 - k);
      result.push(Number(ema.toFixed(6)));
    }
  }
  return result;
}

export interface BollingerPoint {
  upper: number | null;
  middle: number | null;
  lower: number | null;
}

export function calculateBollingerBands(
  candles: Candle[],
  period = 20,
  multiplier = 2
): BollingerPoint[] {
  const sma = calculateSMA(candles, period);
  return candles.map((_, idx) => {
    const mid = sma[idx];
    if (mid === null || idx < period - 1) {
      return { upper: null, middle: null, lower: null };
    }
    let varianceSum = 0;
    for (let j = idx - period + 1; j <= idx; j++) {
      const diff = candles[j].close - mid;
      varianceSum += diff * diff;
    }
    const stdDev = Math.sqrt(varianceSum / period);
    return {
      upper: Number((mid + multiplier * stdDev).toFixed(6)),
      middle: Number(mid.toFixed(6)),
      lower: Number((mid - multiplier * stdDev).toFixed(6)),
    };
  });
}

export function calculateRSI(candles: Candle[], period = 14): (number | null)[] {
  if (candles.length === 0 || period <= 0) return [];
  const result: (number | null)[] = [null];
  let avgGain = 0;
  let avgLoss = 0;

  for (let i = 1; i < candles.length; i++) {
    const change = candles[i].close - candles[i - 1].close;
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? -change : 0;

    if (i <= period) {
      avgGain += gain;
      avgLoss += loss;
      if (i === period) {
        avgGain /= period;
        avgLoss /= period;
        const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        const rsi = avgLoss === 0 ? 100 : 100 - 100 / (1 + rs);
        result.push(Number(rsi.toFixed(2)));
      } else {
        result.push(null);
      }
    } else {
      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      const rsi = avgLoss === 0 ? 100 : 100 - 100 / (1 + rs);
      result.push(Number(rsi.toFixed(2)));
    }
  }
  return result;
}

export interface MACDPoint {
  macd: number | null;
  signal: number | null;
  histogram: number | null;
}

export function calculateMACD(
  candles: Candle[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9
): MACDPoint[] {
  const fastEma = calculateEMA(candles, fastPeriod);
  const slowEma = calculateEMA(candles, slowPeriod);

  const macdLine: (number | null)[] = candles.map((_, i) => {
    if (fastEma[i] === null || slowEma[i] === null) return null;
    return Number(((fastEma[i] as number) - (slowEma[i] as number)).toFixed(6));
  });

  const k = 2 / (signalPeriod + 1);
  let signalEma: number | null = null;
  let validCount = 0;
  let validSum = 0;

  return macdLine.map((m) => {
    if (m === null) {
      return { macd: null, signal: null, histogram: null };
    }
    validCount++;
    if (validCount < signalPeriod) {
      validSum += m;
      return { macd: m, signal: null, histogram: null };
    } else if (validCount === signalPeriod) {
      validSum += m;
      signalEma = validSum / signalPeriod;
    } else {
      signalEma = m * k + (signalEma as number) * (1 - k);
    }
    const sig = Number((signalEma as number).toFixed(6));
    const hist = Number((m - sig).toFixed(6));
    return { macd: m, signal: sig, histogram: hist };
  });
}

export function calculatePivotPoints(candle: Candle, decimals = 2): PivotLevels {
  const p = (candle.high + candle.low + candle.close) / 3;
  const range = candle.high - candle.low;
  const r1 = 2 * p - candle.low;
  const s1 = 2 * p - candle.high;
  const r2 = p + range;
  const s2 = p - range;
  const r3 = candle.high + 2 * (p - candle.low);
  const s3 = candle.low - 2 * (candle.high - p);

  const round = (v: number) => Number(v.toFixed(decimals));
  return {
    p: round(p),
    r1: round(r1),
    r2: round(r2),
    r3: round(r3),
    s1: round(s1),
    s2: round(s2),
    s3: round(s3),
  };
}

function scoreToRating(score: number): OverallRating {
  if (score >= 45) return 'Strong Buy';
  if (score >= 15) return 'Buy';
  if (score <= -45) return 'Strong Sell';
  if (score <= -15) return 'Sell';
  return 'Neutral';
}

export function evaluateTechnicalSummary(candles: Candle[], decimals = 2): TechnicalSummary {
  if (candles.length === 0) {
    return {
      overallRating: 'Neutral',
      score: 0,
      buyCount: 0,
      neutralCount: 0,
      sellCount: 0,
      oscillatorsRating: 'Neutral',
      maRating: 'Neutral',
      readings: [],
      pivots: { p: 0, r1: 0, r2: 0, r3: 0, s1: 0, s2: 0, s3: 0 },
    };
  }

  const lastIdx = candles.length - 1;
  const lastCandle = candles[lastIdx];
  const close = lastCandle.close;

  const rsiArr = calculateRSI(candles, 14);
  const macdArr = calculateMACD(candles, 12, 26, 9);
  const bbArr = calculateBollingerBands(candles, 20, 2);
  const ema10 = calculateEMA(candles, 10)[lastIdx] ?? close;
  const sma20 = calculateSMA(candles, 20)[lastIdx] ?? close;
  const ema20 = calculateEMA(candles, 20)[lastIdx] ?? close;
  const sma50 = calculateSMA(candles, 50)[lastIdx] ?? close;
  const ema50 = calculateEMA(candles, 50)[lastIdx] ?? close;
  const sma100 = calculateSMA(candles, Math.min(100, candles.length))[lastIdx] ?? close;

  const rsiVal = rsiArr[lastIdx] ?? 50;
  const macdVal = macdArr[lastIdx] ?? { macd: 0, signal: 0, histogram: 0 };
  const bbVal = bbArr[lastIdx] ?? { upper: close * 1.02, middle: close, lower: close * 0.98 };

  const lookback14 = candles.slice(Math.max(0, candles.length - 14));
  const highest14 = Math.max(...lookback14.map((c) => c.high));
  const lowest14 = Math.min(...lookback14.map((c) => c.low));
  const stochK = highest14 === lowest14 ? 50 : ((close - lowest14) / (highest14 - lowest14)) * 100;

  const cci = ((close - (bbVal.middle ?? close)) / (Math.max(0.0001, (bbVal.upper ?? close) - (bbVal.middle ?? close)) * 0.5)) * 100;

  const momRef = candles[Math.max(0, lastIdx - 10)].close;
  const momentum = ((close - momRef) / momRef) * 100;

  const readings: IndicatorReading[] = [];

  const rsiAction: SignalAction = rsiVal < 35 ? 'Buy' : rsiVal > 68 ? 'Sell' : rsiVal > 52 ? 'Buy' : rsiVal < 48 ? 'Sell' : 'Neutral';
  readings.push({
    name: 'Relative Strength Index (14)',
    value: rsiVal,
    formattedValue: rsiVal.toFixed(2),
    action: rsiAction,
    category: 'oscillator',
  });

  const stochAction: SignalAction = stochK < 25 ? 'Buy' : stochK > 78 ? 'Sell' : stochK >= 50 ? 'Buy' : 'Neutral';
  readings.push({
    name: 'Stochastic %K (14, 3, 3)',
    value: stochK,
    formattedValue: stochK.toFixed(2),
    action: stochAction,
    category: 'oscillator',
  });

  const macdHist = macdVal.histogram ?? 0;
  const macdAction: SignalAction = macdHist > 0 ? 'Buy' : macdHist < 0 ? 'Sell' : 'Neutral';
  readings.push({
    name: 'MACD Level (12, 26)',
    value: macdVal.macd ?? 0,
    formattedValue: (macdVal.macd ?? 0).toFixed(decimals),
    action: macdAction,
    category: 'oscillator',
  });

  const cciAction: SignalAction = cci > 20 ? 'Buy' : cci < -20 ? 'Sell' : 'Neutral';
  readings.push({
    name: 'Commodity Channel Index (20)',
    value: cci,
    formattedValue: cci.toFixed(2),
    action: cciAction,
    category: 'oscillator',
  });

  const momAction: SignalAction = momentum > 0.15 ? 'Buy' : momentum < -0.15 ? 'Sell' : 'Neutral';
  readings.push({
    name: 'Momentum (10)',
    value: momentum,
    formattedValue: `${momentum >= 0 ? '+' : ''}${momentum.toFixed(2)}%`,
    action: momAction,
    category: 'oscillator',
  });

  const maConfigs: { name: string; val: number }[] = [
    { name: 'Exponential Moving Average (10)', val: ema10 },
    { name: 'Simple Moving Average (20)', val: sma20 },
    { name: 'Exponential Moving Average (20)', val: ema20 },
    { name: 'Simple Moving Average (50)', val: sma50 },
    { name: 'Exponential Moving Average (50)', val: ema50 },
    { name: 'Simple Moving Average (100)', val: sma100 },
  ];

  for (const ma of maConfigs) {
    const diffRatio = (close - ma.val) / Math.max(0.00001, ma.val);
    const action: SignalAction = diffRatio > 0.0005 ? 'Buy' : diffRatio < -0.0005 ? 'Sell' : 'Neutral';
    readings.push({
      name: ma.name,
      value: ma.val,
      formattedValue: ma.val.toFixed(decimals),
      action,
      category: 'moving_average',
    });
  }

  let buyCount = 0;
  let sellCount = 0;
  let neutralCount = 0;
  let oscScoreSum = 0;
  let oscTotal = 0;
  let maScoreSum = 0;
  let maTotal = 0;

  for (const r of readings) {
    const weight = r.action === 'Buy' ? 1 : r.action === 'Sell' ? -1 : 0;
    if (r.action === 'Buy') buyCount++;
    else if (r.action === 'Sell') sellCount++;
    else neutralCount++;

    if (r.category === 'oscillator') {
      oscScoreSum += weight;
      oscTotal++;
    } else {
      maScoreSum += weight;
      maTotal++;
    }
  }

  const totalCount = readings.length || 1;
  const overallScore = Math.round(((buyCount - sellCount) / totalCount) * 100);
  const oscScore = Math.round((oscScoreSum / Math.max(1, oscTotal)) * 100);
  const maScore = Math.round((maScoreSum / Math.max(1, maTotal)) * 100);

  return {
    overallRating: scoreToRating(overallScore),
    score: overallScore,
    buyCount,
    neutralCount,
    sellCount,
    oscillatorsRating: scoreToRating(oscScore),
    maRating: scoreToRating(maScore),
    readings,
    pivots: calculatePivotPoints(lastCandle, decimals),
  };
}

export interface DCFInput {
  fcfBaseBillions: number;
  growthRate5YPercent: number;
  terminalGrowthPercent: number;
  waccPercent: number;
  netDebtBillions: number;
  sharesOutstandingBillions: number;
  currentPrice: number;
}

export interface DCFOutput {
  projectedFcf: { year: number; fcf: number; discountedFcf: number }[];
  enterpriseValueBillions: number;
  equityValueBillions: number;
  intrinsicValuePerShare: number;
  upsidePercent: number;
  valuationStatus: 'Undervalued' | 'Fairly Valued' | 'Overvalued';
}

export function calculateDCFValuation(input: DCFInput): DCFOutput {
  const g = input.growthRate5YPercent / 100;
  const tg = Math.min(input.terminalGrowthPercent / 100, (input.waccPercent - 1.5) / 100);
  const r = Math.max(0.04, input.waccPercent / 100);

  const projectedFcf: { year: number; fcf: number; discountedFcf: number }[] = [];
  let currentFcf = input.fcfBaseBillions;
  let sumPvFcf = 0;

  for (let year = 1; year <= 5; year++) {
    currentFcf = currentFcf * (1 + g);
    const pv = currentFcf / Math.pow(1 + r, year);
    sumPvFcf += pv;
    projectedFcf.push({
      year,
      fcf: Number(currentFcf.toFixed(2)),
      discountedFcf: Number(pv.toFixed(2)),
    });
  }

  const terminalFcf = currentFcf * (1 + tg);
  const terminalValue = terminalFcf / Math.max(0.015, r - tg);
  const pvTerminalValue = terminalValue / Math.pow(1 + r, 5);

  const enterpriseValueBillions = Number((sumPvFcf + pvTerminalValue).toFixed(2));
  const equityValueBillions = Number(Math.max(0.1, enterpriseValueBillions - input.netDebtBillions).toFixed(2));
  const shares = Math.max(0.0001, input.sharesOutstandingBillions);
  const intrinsicValuePerShare = Number((equityValueBillions / shares).toFixed(2));

  const upsidePercent = Number(
    (((intrinsicValuePerShare - input.currentPrice) / Math.max(0.0001, input.currentPrice)) * 100).toFixed(2)
  );

  let valuationStatus: 'Undervalued' | 'Fairly Valued' | 'Overvalued' = 'Fairly Valued';
  if (upsidePercent >= 12) valuationStatus = 'Undervalued';
  else if (upsidePercent <= -12) valuationStatus = 'Overvalued';

  return {
    projectedFcf,
    enterpriseValueBillions,
    equityValueBillions,
    intrinsicValuePerShare,
    upsidePercent,
    valuationStatus,
  };
}

export function findSupplyDemandZones(candles: Candle[]): SupplyDemandZone[] {
  if (candles.length < 25) return [];

  const lastCandle = candles[candles.length - 1];
  const currentPrice = lastCandle.close;

  // 1. Calculate Average True Range (ATR-like) to detect genuine impulsive expansion
  let totalRange = 0;
  for (let i = 1; i < candles.length; i++) {
    const tr = Math.max(
      candles[i].high - candles[i].low,
      Math.abs(candles[i].high - candles[i - 1].close),
      Math.abs(candles[i].low - candles[i - 1].close)
    );
    totalRange += tr;
  }
  const avgRange = Math.max(0.0001, totalRange / (candles.length - 1));

  // 2. Identify significant Swing Highs and Swing Lows with multi-bar fractal radius
  const rawSupplyZones: SupplyDemandZone[] = [];
  const rawDemandZones: SupplyDemandZone[] = [];
  const pivotRadius = 4;

  for (let i = pivotRadius; i < candles.length - pivotRadius; i++) {
    const c = candles[i];
    let isSwingHigh = true;
    let isSwingLow = true;

    for (let offset = 1; offset <= pivotRadius; offset++) {
      if (candles[i - offset].high >= c.high || candles[i + offset].high > c.high) {
        isSwingHigh = false;
      }
      if (candles[i - offset].low <= c.low || candles[i + offset].low < c.low) {
        isSwingLow = false;
      }
    }

    // Displacement check: subsequent candles must show strong departure
    const subsequentMoveDown = c.high - Math.min(...candles.slice(i + 1, Math.min(candles.length, i + 6)).map((k) => k.low));
    const subsequentMoveUp = Math.max(...candles.slice(i + 1, Math.min(candles.length, i + 6)).map((k) => k.high)) - c.low;

    if (isSwingHigh && subsequentMoveDown >= avgRange * 1.0) {
      const bodyTop = Math.max(c.open, c.close);
      const zoneBottom = Math.max(c.low, Math.min(bodyTop, c.high - avgRange * 0.45));
      rawSupplyZones.push({
        id: `supply-${i}`,
        type: 'supply',
        top: c.high,
        bottom: zoneBottom,
        startIndex: i,
        endIndex: candles.length - 1,
        testCount: 0,
        strength: 'Fresh',
      });
    }

    if (isSwingLow && subsequentMoveUp >= avgRange * 1.0) {
      const bodyBottom = Math.min(c.open, c.close);
      const zoneTop = Math.min(c.high, Math.max(bodyBottom, c.low + avgRange * 0.45));
      rawDemandZones.push({
        id: `demand-${i}`,
        type: 'demand',
        top: zoneTop,
        bottom: c.low,
        startIndex: i,
        endIndex: candles.length - 1,
        testCount: 0,
        strength: 'Fresh',
      });
    }
  }

  // 3. Test & Mitigation Check: Filter out broken/absorbed zones
  const activeSupplyZones: SupplyDemandZone[] = [];
  for (const z of rawSupplyZones) {
    let broken = false;
    let touches = 0;
    for (let j = z.startIndex + pivotRadius + 1; j < candles.length; j++) {
      const c = candles[j];
      // Decisive breach above the supply zone invalidates it
      if (c.close > z.top) {
        broken = true;
        break;
      }
      // Wick penetration inside zone
      if (c.high >= z.bottom && c.high <= z.top) {
        touches++;
      }
    }

    if (!broken && touches <= 3 && z.top > currentPrice * 0.995) {
      z.testCount = touches;
      z.strength = touches === 0 ? 'Fresh' : 'Tested';
      activeSupplyZones.push(z);
    }
  }

  const activeDemandZones: SupplyDemandZone[] = [];
  for (const z of rawDemandZones) {
    let broken = false;
    let touches = 0;
    for (let j = z.startIndex + pivotRadius + 1; j < candles.length; j++) {
      const c = candles[j];
      // Decisive breach below the demand zone invalidates it
      if (c.close < z.bottom) {
        broken = true;
        break;
      }
      // Wick penetration inside zone
      if (c.low <= z.top && c.low >= z.bottom) {
        touches++;
      }
    }

    if (!broken && touches <= 3 && z.bottom < currentPrice * 1.005) {
      z.testCount = touches;
      z.strength = touches === 0 ? 'Fresh' : 'Tested';
      activeDemandZones.push(z);
    }
  }

  // 4. Overlap Consolidation: Merge overlapping zones into clean single institutional bands
  function mergeOverlappingZones(list: SupplyDemandZone[]): SupplyDemandZone[] {
    if (list.length === 0) return [];
    const sorted = [...list].sort((a, b) => a.bottom - b.bottom);
    const merged: SupplyDemandZone[] = [];

    for (const zone of sorted) {
      if (merged.length === 0) {
        merged.push({ ...zone });
        continue;
      }
      const prev = merged[merged.length - 1];
      const buffer = (prev.top - prev.bottom) * 0.4;
      const isOverlapping = zone.bottom <= prev.top + buffer;

      if (isOverlapping) {
        // Merge into single non-overlapping zone
        prev.top = Math.max(prev.top, zone.top);
        prev.bottom = Math.min(prev.bottom, zone.bottom);
        prev.startIndex = Math.min(prev.startIndex, zone.startIndex);
        prev.testCount = Math.max(prev.testCount || 0, zone.testCount || 0);
        prev.strength = prev.testCount === 0 ? 'Fresh' : 'Strong';
      } else {
        merged.push({ ...zone });
      }
    }
    return merged;
  }

  const mergedSupply = mergeOverlappingZones(activeSupplyZones);
  const mergedDemand = mergeOverlappingZones(activeDemandZones);

  // 5. Select only top 2 most immediate non-overlapping zones for each side
  const cleanSupply = mergedSupply
    .filter((z) => z.bottom >= currentPrice * 0.9995)
    .sort((a, b) => a.bottom - b.bottom)
    .slice(0, 2)
    .map((z, idx) => ({
      ...z,
      label: idx === 0 ? 'Supply Minor / Dekat' : 'Supply Institusional Utama',
    }));

  const cleanDemand = mergedDemand
    .filter((z) => z.top <= currentPrice * 1.0005)
    .sort((a, b) => b.top - a.top)
    .slice(0, 2)
    .map((z, idx) => ({
      ...z,
      label: idx === 0 ? 'Demand Minor / Dekat' : 'Demand Institusional Utama',
    }));

  return [...cleanSupply, ...cleanDemand];
}

