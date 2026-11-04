import React, { useState } from 'react';
import { Instrument, Candle } from '../types/market';
import {
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Play,
  Zap,
  ChevronDown,
  ChevronUp,
  Shield,
  Target,
  Bot,
  Copy,
  Check
} from 'lucide-react';

interface TradeSignalOverlayProps {
  instrument: Instrument;
  candles: Candle[];
  onExecuteTrade?: (order: { type: 'BUY' | 'SELL'; price: number; sl: number; tp: number }) => void;
  onOpenBotManager?: () => void;
}

export const TradeSignalOverlay: React.FC<TradeSignalOverlayProps> = ({
  instrument,
  candles,
  onExecuteTrade,
  onOpenBotManager,
}) => {
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const isGold = instrument.symbol.toUpperCase().includes('XAU') || instrument.symbol.toUpperCase().includes('GOLD');

  // Compute live AI Signal & Entry Targets
  const isBullish = instrument.changePercent24h >= 0;
  const price = instrument.price;
  const dec = instrument.decimals;

  // Calculate M5 High/Low for Gold calculation
  const highestCandleHigh = candles.length > 0 ? Math.max(...candles.map((c) => c.high)) : price + 1.20;
  const lowestCandleLow = candles.length > 0 ? Math.min(...candles.map((c) => c.low)) : price - 1.20;

  // Standard or Gold Specific Formula
  let signalType: 'BUY' | 'SELL' = isBullish ? 'BUY' : 'SELL';
  let entryPrice = price;
  let slPrice = Number((isBullish ? price * 0.9925 : price * 1.0075).toFixed(dec));
  let tpPrice1 = Number((isBullish ? price * 1.015 : price * 0.985).toFixed(dec));
  let tpPrice2 = Number((isBullish ? price * 1.032 : price * 0.968).toFixed(dec));
  let confluenceScore = Math.min(96, Math.max(72, Math.round(75 + Math.abs(instrument.changePercent24h) * 5)));
  let strategyLabel = isGold ? 'KALKULATOR GOLD M5 AI' : 'MTF FRACTAL PULLBACK';

  if (isGold) {
    if (isBullish) {
      // Buy Limit: Resisten M5 - 0.15
      signalType = 'BUY';
      const resistenM5 = Number(highestCandleHigh.toFixed(2));
      entryPrice = Number((resistenM5 - 0.15).toFixed(2));
      slPrice = Number((entryPrice - 3.0).toFixed(2));
      tpPrice1 = Number((entryPrice + 5.0).toFixed(2));
      tpPrice2 = Number((entryPrice + 7.0).toFixed(2));
    } else {
      // Sell Limit: Support M5 + 0.15
      signalType = 'SELL';
      const supportM5 = Number(lowestCandleLow.toFixed(2));
      entryPrice = Number((supportM5 + 0.15).toFixed(2));
      slPrice = Number((entryPrice + 3.0).toFixed(2));
      tpPrice1 = Number((entryPrice - 4.0).toFixed(2));
      tpPrice2 = Number((entryPrice - 7.0).toFixed(2));
    }
  }

  const handleCopy = () => {
    const text = `🤖 AI TRADE SIGNAL (${instrument.displaySymbol})
Aksi: ${signalType} LIMIT @ $${entryPrice.toFixed(dec)}
SL: $${slPrice.toFixed(dec)} | TP1: $${tpPrice1.toFixed(dec)} | TP2: $${tpPrice2.toFixed(dec)}
Konfluensi: ${confluenceScore}% [${strategyLabel}]`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-black border-y border-white font-mono text-xs">
      {/* Header bar of the overlay */}
      <div className="px-3 py-1.5 bg-zinc-950 flex items-center justify-between border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span className="text-yellow-400 font-bold uppercase tracking-wide text-[11px]">
            AI Trade Signal Overlay [{instrument.displaySymbol}]
          </span>
          <span className="px-1.5 py-0.2 bg-zinc-800 text-zinc-300 border border-zinc-700 rounded text-[10px]">
            {strategyLabel}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-emerald-400 text-[10px] flex items-center gap-1 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE SIGNAL
          </span>
          <button
            type="button"
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            title={isMinimized ? 'Perbesar Overlay Sinyal' : 'Kecilkan Overlay Sinyal'}
          >
            {isMinimized ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Signal Display Body */}
      {!isMinimized && (
        <div className="p-3 bg-black grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Left Signal Badge (Span 4) */}
          <div className="md:col-span-4 flex items-center gap-3 bg-zinc-900/90 p-2.5 border border-zinc-700">
            <div
              className={`w-10 h-10 rounded flex items-center justify-center shrink-0 font-black text-sm ${
                signalType === 'BUY'
                  ? 'bg-emerald-500 text-black border border-emerald-400'
                  : 'bg-rose-600 text-white border border-rose-500'
              }`}
            >
              {signalType === 'BUY' ? <ArrowUpRight className="w-6 h-6 stroke-[3]" /> : <ArrowDownRight className="w-6 h-6 stroke-[3]" />}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`font-bold uppercase tracking-wide text-xs ${
                    signalType === 'BUY' ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  REKOMENDASI {signalType} LIMIT
                </span>
                <span className="text-[10px] px-1 py-0.2 bg-yellow-400 text-black font-bold">
                  {confluenceScore}% OK
                </span>
              </div>
              <div className="text-[11px] text-zinc-300 mt-0.5">
                Harga Pasaran: <strong className="text-white">${price.toFixed(dec)}</strong>
              </div>
            </div>
          </div>

          {/* Middle Parameter Grid (Span 5) */}
          <div className="md:col-span-5 grid grid-cols-3 gap-2 bg-zinc-950 p-2 border border-zinc-800 text-[10px]">
            <div>
              <span className="text-zinc-500 block uppercase">Harga Entri AI</span>
              <span className="text-yellow-400 font-bold text-xs">${entryPrice.toFixed(dec)}</span>
            </div>
            <div>
              <span className="text-rose-400 block uppercase">Stop Loss (SL)</span>
              <span className="text-rose-400 font-bold text-xs">${slPrice.toFixed(dec)}</span>
            </div>
            <div>
              <span className="text-emerald-400 block uppercase">Take Profit (TP1)</span>
              <span className="text-emerald-400 font-bold text-xs">${tpPrice1.toFixed(dec)}</span>
            </div>
          </div>

          {/* Right Action Buttons (Span 3) */}
          <div className="md:col-span-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-2.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-bold transition-colors border border-zinc-700 flex items-center gap-1"
              title="Salin parameter sinyal"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Tersalin' : 'Salin'}</span>
            </button>

            {onExecuteTrade && (
              <button
                type="button"
                onClick={() =>
                  onExecuteTrade({
                    type: signalType,
                    price: entryPrice,
                    sl: slPrice,
                    tp: tpPrice1,
                  })
                }
                className="flex-1 py-2 px-3 bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-xs tracking-wider uppercase transition-all shadow-lg flex items-center justify-center gap-1.5 border border-black cursor-pointer active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-black stroke-none" />
                <span>Eksekusi Trade</span>
              </button>
            )}

            {onOpenBotManager && (
              <button
                type="button"
                onClick={onOpenBotManager}
                className="p-2 bg-zinc-800 hover:bg-zinc-700 text-yellow-400 text-[10px] font-bold border border-zinc-700 flex items-center gap-1"
                title="Buka Trading Bot Manager"
              >
                <Bot className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
