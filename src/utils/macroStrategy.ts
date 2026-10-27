import { EconomicEvent, Instrument } from '../types/market';

export function calculateMacroSurprise(event: EconomicEvent): number {
  if (!event.actual) return 0;
  
  const actual = parseFloat(event.actual.replace('%', ''));
  const forecast = parseFloat(event.forecast.replace('%', ''));
  
  if (isNaN(actual) || isNaN(forecast) || forecast === 0) return 0;
  
  // (Actual - Forecast) / Forecast * 100
  return ((actual - forecast) / Math.abs(forecast)) * 100;
}

export function generateMacroTradingSignal(
  event: EconomicEvent, 
  surpriseScore: number
): 'Buy' | 'Sell' | 'Neutral' {
  // Logika sederhana: 
  // Jika inflasi/suku bunga (Hawkish), Buy mata uang (surprise positif)
  // Jika ekonomi lemah (PMI/NFP), Sell mata uang (surprise negatif)
  
  if (Math.abs(surpriseScore) < 1.5) return 'Neutral';

  if (['Inflation', 'Central Bank'].includes(event.category)) {
    return surpriseScore > 0 ? 'Buy' : 'Sell';
  } else if (['Employment', 'PMI & Manufacturing', 'GDP & Growth'].includes(event.category)) {
    return surpriseScore > 0 ? 'Buy' : 'Sell';
  }
  
  return 'Neutral';
}

export function executeMacroBotStrategy(
  event: EconomicEvent,
  instrument: Instrument
): string {
  const surprise = calculateMacroSurprise(event);
  const signal = generateMacroTradingSignal(event, surprise);
  
  return `MacroBot: Event '${event.event}' released. Surprise: ${surprise.toFixed(2)}%. Signal: ${signal} ${instrument.symbol}.`;
}
