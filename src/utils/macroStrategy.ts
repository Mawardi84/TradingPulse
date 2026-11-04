import { EconomicEvent, Instrument } from '../types/market';

/**
 * Calculates macro surprise percentage or delta from consensus
 */
export function calculateMacroSurprise(event: EconomicEvent): number {
  if (!event.actual) return 0;
  
  const cleanActual = event.actual.replace(/[%kKmM$]/g, '').trim();
  const cleanForecast = event.forecast.replace(/[%kKmM$]/g, '').trim();

  const actual = parseFloat(cleanActual);
  const forecast = parseFloat(cleanForecast);
  
  if (isNaN(actual) || isNaN(forecast) || forecast === 0) return 0;
  
  // (Actual - Forecast) / Forecast * 100
  return ((actual - forecast) / Math.abs(forecast)) * 100;
}

export interface MacroTradeSignalResult {
  action: 'Buy' | 'Sell' | 'Neutral';
  confidence: number;
  bias: 'HAWKISH' | 'DOVISH' | 'RISK_ON' | 'RISK_OFF' | 'NEUTRAL';
  reasoning: string;
}

/**
 * Generates an institutional trading signal for a specific instrument
 * accounting for whether USD is base/quote currency, real yields, and asset class.
 */
export function generateMacroTradingSignal(
  event: EconomicEvent, 
  surpriseScore: number,
  instrument?: Instrument | { symbol: string; category?: string }
): 'Buy' | 'Sell' | 'Neutral' {
  if (Math.abs(surpriseScore) < 1.0) return 'Neutral';

  const symbol = (instrument?.symbol || 'EURUSD').toUpperCase();
  const isUSDQuote = ['EURUSD', 'GBPUSD', 'AUDUSD', 'NZDUSD'].some((p) => symbol.includes(p));
  const isUSDBase = ['USDJPY', 'USDCAD', 'USDCHF', 'USDIDR', 'DXY'].some((p) => symbol.includes(p));
  const isGoldOrMetal = symbol.includes('XAU') || symbol.includes('GOLD') || symbol.includes('XAG') || symbol.includes('SILVER');
  const isCrypto = symbol.includes('BTC') || symbol.includes('ETH') || symbol.includes('SOL');
  const isEquities = ['SPX', 'NAS', 'US30', 'NVDA', 'AAPL', 'MSFT', 'TSLA'].some((p) => symbol.includes(p));

  const isHawkishInflationOrRates = ['Inflation', 'Central Bank'].includes(event.category);
  const isGrowthOrEmployment = ['Employment', 'PMI & Manufacturing', 'GDP & Growth'].includes(event.category);

  if (isHawkishInflationOrRates) {
    const isHawkishSurprise = surpriseScore > 0; // High inflation / rate hike surprise

    if (isHawkishSurprise) {
      // USD strengthens, Real Yields rise -> Bearish for Gold, Crypto, Tech, and USD Quote pairs
      if (isUSDBase) return 'Buy';
      if (isUSDQuote || isGoldOrMetal || isCrypto || isEquities) return 'Sell';
      return 'Sell';
    } else {
      // Dovish surprise -> USD softens, Real Yields drop -> Bullish for Gold, Crypto, Tech, and USD Quote pairs
      if (isUSDBase) return 'Sell';
      if (isUSDQuote || isGoldOrMetal || isCrypto || isEquities) return 'Buy';
      return 'Buy';
    }
  }

  if (isGrowthOrEmployment) {
    const isStrongEconomy = surpriseScore > 0; // Solid NFP/GDP/PMI

    if (isStrongEconomy) {
      // Risk-On rally for Equities & Crypto, strong USD
      if (isEquities || isCrypto) return 'Buy';
      if (isUSDBase) return 'Buy';
      if (isUSDQuote) return 'Sell';
      // Gold can face headwind from strong yields unless driven by stagflation
      if (isGoldOrMetal) return 'Sell';
      return 'Buy';
    } else {
      // Weak economy / recession scare -> Safe-haven flight to Gold, rate cuts priced in
      if (isGoldOrMetal) return 'Buy';
      if (isEquities || isCrypto) return 'Sell';
      if (isUSDBase) return 'Sell';
      if (isUSDQuote) return 'Buy';
      return 'Sell';
    }
  }
  
  return 'Neutral';
}

export function executeMacroBotStrategy(
  event: EconomicEvent,
  instrument: Instrument
): string {
  const surprise = calculateMacroSurprise(event);
  const signal = generateMacroTradingSignal(event, surprise, instrument);
  
  return `MacroBot Quant: Rilis data '${event.event}' (Surprise: ${surprise > 0 ? '+' : ''}${surprise.toFixed(2)}%). Rekomendasi Algoritma: ${signal} ${instrument.symbol}.`;
}

