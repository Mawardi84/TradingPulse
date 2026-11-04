import { Candle, Timeframe } from '../types/market';

export interface TradingViewQuote {
  symbol: string;
  rawSymbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  bid: number;
  ask: number;
  open: number;
  prevClose: number;
  provider: string;
  currency: string;
  updatedAt: number;
}

export interface TradingViewSearchResult {
  id: string;
  exchange: string;
  fullExchange?: string;
  symbol: string;
  description: string;
  type: string;
  currency?: string;
}

/**
 * Fetches real OHLCV historical candles scraped directly from TradingView backend
 */
export async function fetchTradingViewCandles(
  symbol: string,
  timeframe: Timeframe,
  count: number = 100
): Promise<{ candles: Candle[]; source: string } | null> {
  try {
    const res = await fetch(
      `/api/tv/candles?symbol=${encodeURIComponent(symbol)}&timeframe=${encodeURIComponent(
        timeframe
      )}&count=${count}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.success && Array.isArray(data.candles) && data.candles.length > 0) {
      return {
        candles: data.candles,
        source: data.source || 'TradingView Free Scraper',
      };
    }
    return null;
  } catch (err) {
    console.warn(`[TV Scraper Service] Could not fetch candles for ${symbol}:`, err);
    return null;
  }
}

/**
 * Fetches real-time price & ticker quote scraped directly from TradingView
 */
export async function fetchTradingViewQuote(symbol: string): Promise<TradingViewQuote | null> {
  try {
    const res = await fetch(`/api/tv/quote?symbol=${encodeURIComponent(symbol)}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.success && data.quote) {
      return data.quote;
    }
    return null;
  } catch (err) {
    console.warn(`[TV Scraper Service] Could not fetch quote for ${symbol}:`, err);
    return null;
  }
}

/**
 * Searches global markets across TradingView catalog
 */
export async function searchTradingViewMarkets(query: string): Promise<TradingViewSearchResult[]> {
  try {
    const res = await fetch(`/api/tv/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    const data = await res.json();
    if (data.success && Array.isArray(data.results)) {
      return data.results;
    }
    return [];
  } catch (err) {
    console.warn(`[TV Scraper Service] Search failed for ${query}:`, err);
    return [];
  }
}

/**
 * Fetches Technical Analysis rating summary from TradingView
 */
export async function fetchTradingViewTA(symbol: string): Promise<any | null> {
  try {
    const res = await fetch(`/api/tv/ta?symbol=${encodeURIComponent(symbol)}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.success && data.ta) {
      return data.ta;
    }
    return null;
  } catch (err) {
    console.warn(`[TV Scraper Service] TA fetch failed for ${symbol}:`, err);
    return null;
  }
}
