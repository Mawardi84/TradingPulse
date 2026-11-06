import { Candle, Timeframe } from '../types/market';

export const TIMEFRAME_SECONDS: Record<Timeframe, number> = {
  '1m': 60,
  '5m': 300,
  '15m': 900,
  '1h': 3600,
  '4h': 14400,
  '1D': 86400,
};

export const BINANCE_INTERVALS: Record<Timeframe, string> = {
  '1m': '1m',
  '5m': '5m',
  '15m': '15m',
  '1h': '1h',
  '4h': '4h',
  '1D': '1d',
};

export interface MarketTick {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  tickDirection: 'up' | 'down';
  timestamp: number;
  latencyMs?: number;
}

export type TickCallback = (tick: MarketTick) => void;

export interface LiveFearAndGreedData {
  score: number;
  label: string;
  previousClose: number;
  oneWeekAgo: number;
  oneMonthAgo: number;
  timestamp: string;
  source: string;
}

/**
 * Fetches real, live market Fear & Greed index from Alternative.me public API
 */
export async function fetchLiveFearAndGreed(): Promise<LiveFearAndGreedData | null> {
  try {
    const res = await fetch('https://api.alternative.me/fng/?limit=31');
    if (!res.ok) return null;
    const json = await res.json();
    if (!json || !json.data || json.data.length === 0) return null;

    const current = json.data[0];
    const prev = json.data[1] || current;
    const weekAgo = json.data[7] || json.data[json.data.length - 1];
    const monthAgo = json.data[30] || json.data[json.data.length - 1];

    return {
      score: parseInt(current.value, 10),
      label: current.value_classification,
      previousClose: parseInt(prev.value, 10),
      oneWeekAgo: parseInt(weekAgo.value, 10),
      oneMonthAgo: parseInt(monthAgo.value, 10),
      timestamp: new Date(parseInt(current.timestamp, 10) * 1000).toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short',
      }),
      source: 'Alternative.me Crypto Fear & Greed Index API v2 (Multi-Factor Real Sentiment)',
    };
  } catch (err) {
    console.warn('[MarketFeed] Alternative.me API fetch warning:', err);
    return null;
  }
}

/**
 * Single Data Source Real-Time Price Orchestrator:
 * - Exclusively utilizes TradingView Scraper (`fetchTradingViewQuote`) for all instrument price updates.
 * - Zero mock data, zero synthetic random-walk interbank ticks, zero alternate source drift.
 */
export class RealTimeMarketFeed {
  private subscribers: Set<TickCallback> = new Set();
  private isRunning = false;
  private priceCache: Map<string, number> = new Map();

  constructor() {}

  public subscribe(cb: TickCallback): () => void {
    this.subscribers.add(cb);
    return () => {
      this.subscribers.delete(cb);
    };
  }

  public updatePriceCache(symbol: string, newPrice: number) {
    if (!symbol || newPrice <= 0) return;
    this.priceCache.set(symbol, newPrice);
  }

  public notify(tick: MarketTick) {
    this.subscribers.forEach((cb) => {
      try {
        cb(tick);
      } catch (e) {
        console.error('[MarketFeed] Callback notification error:', e);
      }
    });
  }

  public async start(_instruments: any[]) {
    if (this.isRunning) return;
    this.isRunning = true;
    // 100% TradingView Single Source Policy: All price updates are driven externally by TradingView scraper quotes.
  }

  public stop() {
    this.isRunning = false;
    this.subscribers.clear();
  }
}

// Global Singleton Instance
export const marketFeedSingleton = new RealTimeMarketFeed();

if (typeof import.meta !== 'undefined' && import.meta.hot) {
  import.meta.hot.dispose(() => {
    marketFeedSingleton.stop();
  });
}
