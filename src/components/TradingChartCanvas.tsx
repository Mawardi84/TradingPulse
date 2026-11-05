import React from 'react';
import { Candle, Instrument, Timeframe } from '../types/market';
import { TradingViewWidget } from './TradingViewWidget';
import { SupplyDemandOverlayPanel } from './SupplyDemandOverlayPanel';
import { TradeSignalOverlay } from './TradeSignalOverlay';

interface TradingChartCanvasProps {
  instrument: Instrument;
  candles: Candle[];
  timeframe: Timeframe;
  onTimeframeChange: (tf: Timeframe) => void;
  liveSource: string;
  onExecuteTrade?: (order: { type: 'BUY' | 'SELL'; price: number; sl: number; tp: number }) => void;
  onOpenBotManager?: () => void;
  activeIndicators: string[];
}

export const TradingChartCanvas: React.FC<TradingChartCanvasProps> = ({
  instrument,
  candles,
  timeframe,
  onTimeframeChange,
  onExecuteTrade,
  onOpenBotManager,
  activeIndicators,
}) => {
  const timeframes: Timeframe[] = ['1m', '5m', '15m', '1h', '4h', '1D'];

  return (
    <div className="flex flex-col space-y-0">
      <div className="flex flex-col bg-black border border-white space-y-0">
        {/* Top Interactive Timeframe Bar */}
        <div className="flex items-center justify-between gap-3 px-2 py-1 bg-black border-b border-white">
          {/* Left: Timeframe Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-white font-bold hidden sm:inline">TF:</span>
            <div className="flex items-center bg-black p-0 border border-white overflow-x-auto scrollbar-none">
              {timeframes.map((tf) => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => onTimeframeChange(tf)}
                  className={`px-2 py-0.5 text-[10px] font-mono font-bold transition-colors whitespace-nowrap cursor-pointer ${
                    timeframe === tf
                      ? 'bg-white text-black'
                      : 'text-white hover:bg-zinc-800'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-mono shrink-0">
            <span className="w-2 h-2 bg-yellow-400 animate-pulse rounded-full" />
            <span className="text-yellow-400 font-bold">{instrument.displaySymbol}</span>
          </div>
        </div>

        {/* AI Trade Signal Overlay Panel */}
        <TradeSignalOverlay
          instrument={instrument}
          candles={candles}
          onExecuteTrade={onExecuteTrade}
          onOpenBotManager={onOpenBotManager}
        />

        {/* Official TradingView Interactive Advanced Chart Engine */}
        <TradingViewWidget 
          instrument={instrument} 
          timeframe={timeframe} 
          height={typeof window !== 'undefined' && window.innerWidth < 768 ? 440 : 580} 
          indicators={activeIndicators}
        />
      </div>

      {/* Automatic Live Supply & Demand Indicator Panel */}
      <SupplyDemandOverlayPanel instrument={instrument} candles={candles} />
    </div>
  );
};
