export type StrategyType =
  | 'rsi_crossover'
  | 'sma_crossover'
  | 'supply_demand_breakout'
  | 'macro_news_straddle'
  | 'grid_trading';

export interface BotConfig {
  id: string;
  name: string;
  symbol: string;
  strategy: StrategyType;
  params: Record<string, number>;
  isActive: boolean;
  leverage: number;
}

export interface BotLog {
  id?: string;
  botId?: string;
  timestamp: string;
  message: string;
  type: 'info' | 'trade' | 'error' | 'signal' | 'warning';
}

export interface BotStatus {
  botId: string;
  isActive: boolean;
  lastTrade: string | null;
  totalPnL: number;
}
