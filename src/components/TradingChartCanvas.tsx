import React from 'react';
import { Candle, Instrument, Timeframe } from '../types/market';
import { TradingViewWidget } from './TradingViewWidget';
import { SupplyDemandOverlayPanel } from './SupplyDemandOverlayPanel';

interface TradingChartCanvasProps {
  instrument: Instrument;
  candles: Candle[];
  timeframe: Timeframe;
  onTimeframeChange: (tf: Timeframe) => void;
  liveSource: string;
}

export const TradingChartCanvas: React.FC<TradingChartCanvasProps> = ({
  instrument,
  candles,
  timeframe,
  onTimeframeChange,
}) => {
  const timeframes: Timeframe[] = ['1m', '5m', '15m', '1h', '4h', '1D'];

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col bg-[#0B0F17] border border-slate-800 rounded-xl overflow-hidden shadow-2xl space-y-0">
        {/* Top Interactive Timeframe Bar */}
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-[#111722] border-b border-slate-800">
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

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 font-bold">{instrument.displaySymbol}</span>
          </div>
        </div>

        {/* Official TradingView Interactive Advanced Chart Engine */}
        <TradingViewWidget instrument={instrument} timeframe={timeframe} height={580} />
      </div>

      {/* Automatic Live Supply & Demand Indicator Panel */}
      <SupplyDemandOverlayPanel instrument={instrument} candles={candles} />
    </div>
  );
};
