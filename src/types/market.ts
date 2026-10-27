export type AssetCategory = 'crypto' | 'us_stocks' | 'idx_stocks' | 'forex' | 'commodities';
export type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1D';

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface QuarterlyFinancial {
  period: string;
  revenue: number;
  grossProfit: number;
  operatingIncome: number;
  netIncome: number;
  eps: number;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  cashAndEquivalents: number;
  totalDebt: number;
  operatingCashFlow: number;
  capitalExpenditure: number;
  freeCashFlow: number;
}

export interface FundamentalData {
  marketCap: string;
  enterpriseValue: string;
  peRatio: number;
  forwardPe: number;
  pbRatio: number;
  psRatio: number;
  evToEbitda: number;
  pegRatio: number;
  roe: number;
  roa: number;
  grossMargin: number;
  operatingMargin: number;
  netMargin: number;
  debtToEquity: number;
  currentRatio: number;
  dividendYield: number;
  revenueGrowthYoY: number;
  epsGrowthYoY: number;
  freeCashFlowBase: number;
  netDebtBillions: number;
  sharesOutstandingBillions: number;
  analystTargetPrice: number;
  analystConsensus: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell';
  analystBreakdown: {
    strongBuy: number;
    buy: number;
    hold: number;
    sell: number;
  };
  sector: string;
  industry: string;
  headquarters: string;
  description: string;
  keyCatalysts: string[];
  keyRisks: string[];
  quarterlyFinancials: QuarterlyFinancial[];
}

export interface Instrument {
  symbol: string;
  displaySymbol: string;
  name: string;
  category: AssetCategory;
  exchange: string;
  currency: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  decimals: number;
  binanceSymbol?: string;
  forexPair?: { base: string; quote: string };
  fundamentals: FundamentalData;
}

export type SignalAction = 'Buy' | 'Sell' | 'Neutral';
export type OverallRating = 'Strong Buy' | 'Buy' | 'Neutral' | 'Sell' | 'Strong Sell';

export interface IndicatorReading {
  name: string;
  value: number;
  formattedValue: string;
  action: SignalAction;
  category: 'oscillator' | 'moving_average';
}

export interface PivotLevels {
  p: number;
  r1: number;
  r2: number;
  r3: number;
  s1: number;
  s2: number;
  s3: number;
}

export interface TechnicalSummary {
  overallRating: OverallRating;
  score: number;
  buyCount: number;
  neutralCount: number;
  sellCount: number;
  oscillatorsRating: OverallRating;
  maRating: OverallRating;
  readings: IndicatorReading[];
  pivots: PivotLevels;
}

export interface EconomicEvent {
  id: string;
  timestamp: string;
  dateLabel: string;
  timeWIB: string;
  countryCode: 'US' | 'EU' | 'ID' | 'JP' | 'UK' | 'CN';
  countryName: string;
  currency: string;
  event: string;
  category: 'Inflation' | 'Central Bank' | 'Employment' | 'GDP & Growth' | 'PMI & Manufacturing';
  impact: 'High' | 'Medium' | 'Low';
  actual: string | null;
  forecast: string;
  previous: string;
  unit: string;
  surpriseDirection?: 'positive' | 'negative' | 'inline' | 'upcoming';
  surpriseScore?: number;
  analysisSummary: string;
  affectedAssets: string[];
}

export interface MarketNewsItem {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  category: AssetCategory | 'macro';
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  summary: string;
  fullAnalysis: string;
  relatedSymbols: string[];
  url?: string;
  isLiveApi?: boolean;
}

export interface SupplyDemandZone {
  id: string;
  type: 'supply' | 'demand';
  top: number;
  bottom: number;
  startIndex: number;
  endIndex: number;
}

export type DrawingTool = 'crosshair' | 'trendline' | 'horizontal' | 'fib' | 'cursor';

export interface ChartDrawing {
  id: string;
  type: 'trendline' | 'horizontal' | 'fib';
  p1: { index: number; price: number };
  p2: { index: number; price: number };
  color: string;
}
