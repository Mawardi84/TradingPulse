import React from 'react';
import { Candle, Instrument, Timeframe } from '../types/market';
import { TradingViewWidget } from './TradingViewWidget';

interface TradingChartCanvasProps {
  instrument: Instrument;
  candles: Candle[];
  timeframe: Timeframe;
  onTimeframeChange: (tf: Timeframe) => void;
  liveSource: string;
}

export const TradingChartCanvas: React.FC<TradingChartCanvasProps> = ({
  instrument,
  timeframe,
  onTimeframeChange,
}) => {
  const timeframes: Timeframe[] = ['1m', '5m', '15m', '1h', '4h', '1D'];

  const exchangeLabel =
    instrument.category === 'forex' || instrument.category === 'commodities'
      ? 'Valetax MT5 / Spot'
      : instrument.exchange;

  return (
    <div className="flex flex-col bg-[#0B0F17] border border-slate-800 rounded-xl overflow-hidden shadow-2xl space-y-0">
      {/* Top Interactive Timeframe Bar & Broker Details Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[#111722] border-b border-slate-800">
        {/* Left: Timeframe Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400 font-semibold hidden sm:inline">Timeframe:</span>
          <div className="flex items-center bg-[#0B0F17] p-0.5 rounded border border-slate-800">
            {timeframes.map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => onTimeframeChange(tf)}
                className={`px-3 py-1 text-xs font-mono font-bold rounded transition-colors whitespace-nowrap ${
                  timeframe === tf
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Asset & Broker Info */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0B0F17] border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">Broker / Exchange:</span>
            <strong className="text-emerald-400 font-bold">{exchangeLabel}</strong>
          </div>

          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0B0F17] border border-slate-800 text-slate-300">
            <span>Harga Spot Live:</span>
            <strong className="text-white">${instrument.price.toLocaleString()}</strong>
          </div>
        </div>
      </div>

      {/* Official TradingView Interactive Advanced Chart Engine */}
      <TradingViewWidget instrument={instrument} timeframe={timeframe} height={640} />
    </div>
  );
};
