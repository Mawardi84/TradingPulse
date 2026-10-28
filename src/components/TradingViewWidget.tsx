import React, { useMemo } from 'react';
import { Instrument, Timeframe } from '../types/market';

export interface TradingViewWidgetProps {
  instrument: Instrument;
  timeframe: Timeframe;
  height?: string | number;
}

export const getTradingViewSymbol = (symbol: string, category: string): string => {
  const symUpper = symbol.toUpperCase();

  if (category === 'crypto') {
    return `BINANCE:${symUpper}`;
  }

  if (symUpper === 'XAUUSD') {
    return 'OANDA:XAUUSD';
  }
  if (symUpper === 'XAGUSD') {
    return 'OANDA:XAGUSD';
  }
  if (symUpper === 'USOIL') {
    return 'TVC:USOIL';
  }

  if (category === 'forex') {
    if (symUpper === 'USDIDR') return 'FX_IDC:USDIDR';
    return `FX:${symUpper}`;
  }

  if (category === 'us_stocks') {
    return `NASDAQ:${symUpper}`;
  }

  if (category === 'idx_stocks') {
    return `IDX:${symUpper}`;
  }

  return `OANDA:${symUpper}`;
};

export const getTradingViewInterval = (tf: Timeframe): string => {
  switch (tf) {
    case '1m':
      return '1';
    case '5m':
      return '5';
    case '15m':
      return '15';
    case '1h':
      return '60';
    case '4h':
      return '240';
    case '1D':
      return 'D';
    default:
      return '15';
  }
};

export const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({
  instrument,
  timeframe,
  height = '620px',
}) => {
  const tvSymbol = useMemo(
    () => getTradingViewSymbol(instrument.symbol, instrument.category),
    [instrument.symbol, instrument.category]
  );

  const interval = useMemo(() => getTradingViewInterval(timeframe), [timeframe]);

  const widgetUrl = useMemo(() => {
    const params = new URLSearchParams({
      frameElementId: 'tradingview_advanced_chart',
      symbol: tvSymbol,
      interval: interval,
      symboledit: '1',
      saveimage: '1',
      toolbarbg: '111722',
      theme: 'dark',
      style: '1', // Candlestick
      timezone: 'Asia/Jakarta',
      locale: 'id',
      studies: JSON.stringify([
        'RSI@tv-basicstudies',
        'MASimple@tv-basicstudies',
        'MACD@tv-basicstudies',
      ]),
      utmsource: 'localhost',
      utm_medium: 'widget',
      utm_campaign: 'chart',
      utm_term: tvSymbol,
    });

    return `https://s.tradingview.com/widgetembed/?${params.toString()}`;
  }, [tvSymbol, interval]);

  return (
    <div className="w-full rounded-xl overflow-hidden border border-slate-800 bg-[#0B0F17] shadow-2xl relative flex flex-col">
      {/* TradingView Top Info Header */}
      <div className="px-4 py-2.5 bg-[#111722] border-b border-slate-800/80 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-bold">
            {tvSymbol}
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-slate-400 text-[11px]">
          <span>Timeframe: <strong className="text-white">{timeframe}</strong></span>
          <span>|</span>
          <span className="text-cyan-400 font-semibold">● Live Chart</span>
        </div>
      </div>

      {/* Embedded Official TradingView Interactive Advanced Chart Iframe */}
      <div style={{ height: typeof height === 'number' ? `${height}px` : height, width: '100%' }}>
        <iframe
          key={`${tvSymbol}-${interval}`}
          id="tradingview_advanced_chart"
          src={widgetUrl}
          title={`TradingView Chart - ${instrument.displaySymbol}`}
          style={{ width: '100%', height: '100%', border: 'none' }}
          allowFullScreen
        />
      </div>
    </div>
  );
};
