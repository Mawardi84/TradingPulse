import React, { useState, useMemo } from 'react';
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
  Check,
  RefreshCw,
  X,
  Scale,
  Gauge
} from 'lucide-react';
import { evaluateTechnicalSummary, findSupplyDemandZones } from '../utils/indicators';

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
  const [isMinimized, setIsMinimized] = useState<boolean>(() => typeof window !== 'undefined' && window.innerWidth < 768);
  const [copied, setCopied] = useState<boolean>(false);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);
  const [showAiModal, setShowAiModal] = useState<boolean>(false);

  const isGold = instrument.symbol.toUpperCase().includes('XAU') || instrument.symbol.toUpperCase().includes('GOLD');
  const price = instrument.price;
  const dec = instrument.decimals;

  // Run Real Technical Analysis Engine
  const technicalSummary = useMemo(() => {
    return evaluateTechnicalSummary(candles, dec);
  }, [candles, dec]);

  // Run Smart Money Concepts (SMC) Supply & Demand Detection
  const zones = useMemo(() => {
    return findSupplyDemandZones(candles);
  }, [candles]);

  // Compute 14-period True Range / ATR Volatility
  const atr = useMemo(() => {
    if (candles.length < 2) return price * 0.005;
    const count = Math.min(14, candles.length - 1);
    let trSum = 0;
    for (let i = candles.length - count; i < candles.length; i++) {
      const hl = candles[i].high - candles[i].low;
      const hc = Math.abs(candles[i].high - candles[i - 1].close);
      const lc = Math.abs(candles[i].low - candles[i - 1].close);
      trSum += Math.max(hl, hc, lc);
    }
    const val = trSum / count;
    return val > 0 ? val : price * 0.005;
  }, [candles, price]);

  // Calculate M5 High/Low for Gold calculation
  const highestCandleHigh = candles.length > 0 ? Math.max(...candles.map((c) => c.high)) : price + 1.20;
  const lowestCandleLow = candles.length > 0 ? Math.min(...candles.map((c) => c.low)) : price - 1.20;

  // Directional Bias genuinely derived from technical indicators & SMC structure
  const signalCalculation = useMemo(() => {
    const pivotP = technicalSummary.pivots?.p || price;

    // S&D Zones closest to spot
    const activeDemandZones = zones.filter((z) => z.type === 'demand');
    const activeSupplyZones = zones.filter((z) => z.type === 'supply');

    const nearestDemand = activeDemandZones
      .filter((z) => z.top <= price)
      .sort((a, b) => b.top - a.top)[0];
    const nearestSupply = activeSupplyZones
      .filter((z) => z.bottom >= price)
      .sort((a, b) => a.bottom - b.bottom)[0];

    // Find specific indicator readings from evaluateTechnicalSummary
    const rsiReading = technicalSummary.readings.find((r) => r.name.toLowerCase().includes('relative strength'));
    const macdReading = technicalSummary.readings.find((r) => r.name.toLowerCase().includes('macd'));
    const stochReading = technicalSummary.readings.find((r) => r.name.toLowerCase().includes('stochastic'));

    // 6 Core Quantitative Factors
    let bullishVotes = 0;
    let bearishVotes = 0;

    // 1. RSI Indicator
    const rsiAction = rsiReading?.action || 'Neutral';
    if (rsiAction === 'Buy') bullishVotes++;
    else if (rsiAction === 'Sell') bearishVotes++;

    // 2. MACD Level & Histogram
    const macdAction = macdReading?.action || 'Neutral';
    if (macdAction === 'Buy') bullishVotes++;
    else if (macdAction === 'Sell') bearishVotes++;

    // 3. Stochastic Oscillator
    const stochAction = stochReading?.action || 'Neutral';
    if (stochAction === 'Buy') bullishVotes++;
    else if (stochAction === 'Sell') bearishVotes++;

    // 4. Moving Averages Consensus
    const maBullish = technicalSummary.maRating.toLowerCase().includes('buy');
    const maBearish = technicalSummary.maRating.toLowerCase().includes('sell');
    if (maBullish) bullishVotes++;
    else if (maBearish) bearishVotes++;

    // 5. Classic Pivot Point (Price above Pivot = Bullish, below = Bearish)
    const pivotBullish = price >= pivotP;
    if (pivotBullish) bullishVotes++;
    else bearishVotes++;

    // 6. Supply & Demand Structure Proximity
    const distToDemand = nearestDemand ? Math.abs(price - nearestDemand.top) : Infinity;
    const distToSupply = nearestSupply ? Math.abs(nearestSupply.bottom - price) : Infinity;
    if (distToDemand < distToSupply) bullishVotes++;
    else if (distToSupply < distToDemand) bearishVotes++;

    const totalFactors = 6;
    const signalType: 'BUY' | 'SELL' = bullishVotes >= bearishVotes ? 'BUY' : 'SELL';
    const factorsMet = signalType === 'BUY' ? bullishVotes : bearishVotes;
    const confluenceScore = Math.round((factorsMet / totalFactors) * 100);

    let entryPrice = price;
    let slPrice = price;
    let tpPrice1 = price;
    let tpPrice2 = price;
    let strategyLabel = 'QUANT SMC ALGO';

    if (isGold) {
      // Gold Specific Trading Formula strictly anchored to current live spot price
      const isTrendKuat = Math.abs(technicalSummary.score) >= 20; // Strictly derived from technical indicator score magnitude
      const goldOffset = 1.20; // 1.2 USD offset for Limit orders relative to current live spot price

      if (signalType === 'BUY') {
        entryPrice = Number((price - goldOffset).toFixed(2)); // Buy Limit slightly below current spot price
        slPrice = Number((entryPrice - 3.50).toFixed(2));
        tpPrice1 = Number((entryPrice + 5.00).toFixed(2));
        tpPrice2 = Number((entryPrice + 8.50).toFixed(2));
        strategyLabel = isTrendKuat
          ? 'GOLD AI TREND KUAT (Buy Limit Pullback)'
          : 'GOLD AI SCALP (Buy Limit Support)';
      } else {
        entryPrice = Number((price + goldOffset).toFixed(2)); // Sell Limit slightly above current spot price
        slPrice = Number((entryPrice + 3.50).toFixed(2));
        tpPrice1 = Number((entryPrice - 5.00).toFixed(2));
        tpPrice2 = Number((entryPrice - 8.50).toFixed(2));
        strategyLabel = isTrendKuat
          ? 'GOLD AI TREND KUAT (Sell Limit Resistance)'
          : 'GOLD AI SCALP (Sell Limit Rejection)';
      }
    } else {
      // Standard Multi-Asset Quantitative ATR & SMC Formula anchored to live spot price
      if (signalType === 'BUY') {
        entryPrice = nearestDemand && nearestDemand.top >= price * 0.98
          ? Number(nearestDemand.top.toFixed(dec))
          : Number((price - 0.25 * atr).toFixed(dec));
        slPrice = Number((entryPrice - 1.5 * atr).toFixed(dec));
        tpPrice1 = Number((entryPrice + 1.5 * atr).toFixed(dec));
        tpPrice2 = Number((entryPrice + 3.0 * atr).toFixed(dec));
        strategyLabel = nearestDemand ? 'SMC DEMAND PULLBACK' : 'QUANT ATR TREND REVERSAL';
      } else {
        entryPrice = nearestSupply && nearestSupply.bottom <= price * 1.02
          ? Number(nearestSupply.bottom.toFixed(dec))
          : Number((price + 0.25 * atr).toFixed(dec));
        slPrice = Number((entryPrice + 1.5 * atr).toFixed(dec));
        tpPrice1 = Number((entryPrice - 1.5 * atr).toFixed(dec));
        tpPrice2 = Number((entryPrice - 3.0 * atr).toFixed(dec));
        strategyLabel = nearestSupply ? 'SMC SUPPLY REJECTION' : 'QUANT ATR TREND BREAKDOWN';
      }
    }

    const risk = Math.abs(entryPrice - slPrice);
    const reward = Math.abs(tpPrice1 - entryPrice);
    const rrRatio = risk > 0 ? (reward / risk).toFixed(2) : '1.50';

    return {
      signalType,
      entryPrice,
      slPrice,
      tpPrice1,
      tpPrice2,
      strategyLabel,
      confluenceScore,
      rrRatio,
      factorsMet,
      totalFactors,
      nearestDemand,
      nearestSupply,
    };
  }, [candles, dec, highestCandleHigh, lowestCandleLow, instrument.changePercent24h, isGold, price, technicalSummary, zones, atr]);

  const {
    signalType,
    entryPrice,
    slPrice,
    tpPrice1,
    tpPrice2,
    strategyLabel,
    confluenceScore,
    rrRatio,
    factorsMet,
    totalFactors,
  } = signalCalculation;

  const handleCopy = () => {
    const text = `🤖 AI QUANTITATIVE TRADE SIGNAL (${instrument.displaySymbol})
Aksi: ${signalType} LIMIT @ $${entryPrice.toFixed(dec)}
SL: $${slPrice.toFixed(dec)} | TP1: $${tpPrice1.toFixed(dec)} | TP2: $${tpPrice2.toFixed(dec)}
Risk/Reward: 1:${rrRatio} | Konfluensi: ${confluenceScore}% (${factorsMet}/${totalFactors} Indikator Konfirmasi)
Model: ${strategyLabel} [Volatilitas ATR: $${atr.toFixed(dec)}]`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRequestGeminiAiAnalysis = async () => {
    setIsAiLoading(true);
    setShowAiModal(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Berikan sinyal entry presisi, struktur SMC/FVG, dan rasio R:R untuk aset ${instrument.displaySymbol} pada harga spot $${price} dengan analisa kuantitatif mendalam.`,
          currentInstrument: instrument,
          technicalSummary,
          demandZone: signalCalculation.nearestDemand,
          supplyZone: signalCalculation.nearestSupply,
        }),
      });
      const data = await res.json();
      if (data.reply) {
        setAiAnalysisResult(data.reply);
      } else {
        setAiAnalysisResult(
          `🤖 [ASTRA-QUANT REAL-TIME CALCULATION]\n\nAset: ${instrument.displaySymbol}\nLayanan Gemini API Server sedang offline/fallback. Menggunakan algoritma kuantitatif lokal:\n\n` +
          `• Sinyal Algoritma: ${signalType} LIMIT @ $${entryPrice.toFixed(dec)}\n` +
          `• Stop Loss: $${slPrice.toFixed(dec)}\n` +
          `• Take Profit 1: $${tpPrice1.toFixed(dec)}\n` +
          `• Take Profit 2: $${tpPrice2.toFixed(dec)}\n` +
          `• Risk/Reward: 1 : ${rrRatio}\n` +
          `• Model: ${strategyLabel}\n` +
          `• Skor Konfluensi: ${confluenceScore}% (${factorsMet}/${totalFactors} Faktor)\n` +
          `• ATR Volatility: $${atr.toFixed(dec)}`
        );
      }
    } catch {
      setAiAnalysisResult(
        `🤖 [ASTRA-QUANT FALLBACK REPORT]\n\nAset: ${instrument.displaySymbol}\n` +
        `Harga Spot Live: $${price}\n` +
        `• Sinyal Algoritma: ${signalType} LIMIT @ $${entryPrice.toFixed(dec)}\n` +
        `• Stop Loss: $${slPrice.toFixed(dec)}\n` +
        `• Take Profit: $${tpPrice1.toFixed(dec)}`
      );
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="bg-black border-y border-white font-mono text-xs">
      {/* Header bar of the overlay */}
      <div className="px-2.5 py-1.5 bg-zinc-950 flex flex-wrap items-center justify-between gap-1.5 border-b border-zinc-800">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
          <span className="text-yellow-400 font-bold uppercase tracking-wide text-[10px] sm:text-[11px]">
            AI Signal [{instrument.displaySymbol}]
          </span>
          <span
            className={`px-1.5 py-0.5 text-[9px] sm:text-[10px] font-extrabold uppercase border ${
              signalType === 'BUY'
                ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
                : 'bg-rose-950 text-rose-300 border-rose-500'
            }`}
          >
            {signalType} @ ${entryPrice.toFixed(dec)} ({confluenceScore}%)
          </span>
          <span className="px-1.5 py-0.5 bg-zinc-800 text-zinc-300 border border-zinc-700 rounded text-[9px] sm:text-[10px] hidden md:inline">
            {strategyLabel}
          </span>
          <span className="px-1.5 py-0.5 bg-zinc-900 text-yellow-300 border border-yellow-500/40 rounded text-[9px] sm:text-[10px] hidden sm:inline">
            R:R 1:{rrRatio}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-auto sm:ml-0">
          <button
            type="button"
            onClick={handleRequestGeminiAiAnalysis}
            className="px-2 py-0.5 bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-[9px] sm:text-[10px] uppercase border border-black flex items-center gap-1 cursor-pointer transition-colors"
            title="Analisa ulang dengan Google Gemini AI Server"
          >
            <Zap className="w-3 h-3 fill-black stroke-none" />
            <span>Gemini AI</span>
          </button>

          <span className="text-emerald-400 text-[10px] hidden sm:flex items-center gap-1 font-bold border-l border-zinc-800 pl-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ALGO AKTIF
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
        <div className="p-3 bg-black space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
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
                  <span className="text-[10px] px-1.5 py-0.5 bg-yellow-400 text-black font-extrabold">
                    {confluenceScore}% ({factorsMet}/{totalFactors} Indikator)
                  </span>
                </div>
                <div className="text-[11px] text-zinc-300 mt-0.5">
                  Harga Live Spot: <strong className="text-white">${price.toFixed(dec)}</strong>
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
                className="px-2.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-bold transition-colors border border-zinc-700 flex items-center gap-1 cursor-pointer"
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
                  className="p-2 bg-zinc-800 hover:bg-zinc-700 text-yellow-400 text-[10px] font-bold border border-zinc-700 flex items-center gap-1 cursor-pointer"
                  title="Buka Trading Bot Manager"
                >
                  <Bot className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Quantitative Fact Sheet Line */}
          <div className="flex flex-wrap items-center justify-between text-[10px] px-2 py-1 bg-zinc-950 border border-zinc-900 text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 uppercase">Faktor Konfluensi:</span>
              <span className="text-yellow-400 font-bold">{factorsMet}/{totalFactors} Indikator TA Cocok</span>
              <span className="text-zinc-700">|</span>
              <span>TA Rating: <strong className="text-white">{technicalSummary.overallRating}</strong></span>
              <span className="text-zinc-700">|</span>
              <span>ATR Volatilitas: <strong className="text-zinc-200">${atr.toFixed(dec)}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-zinc-500">
              <span>TP2 Runner: <strong className="text-emerald-400">${tpPrice2.toFixed(dec)}</strong></span>
              <span className="text-zinc-700">|</span>
              <span>Rasio R:R: <strong className="text-yellow-400">1:{rrRatio}</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* Gemini AI Detailed Analysis Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xs flex items-center justify-center p-4 font-mono text-xs">
          <div className="bg-black border border-yellow-400 max-w-xl w-full p-5 space-y-4 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-white pb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-wider">
                  GEMINI AI QUANTITATIVE ANALYSIS REPORT [{instrument.displaySymbol}]
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="p-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold border border-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-zinc-950 border border-zinc-800 space-y-2 text-[11px] max-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {isAiLoading ? (
                <div className="flex items-center justify-center py-8 gap-2 text-yellow-400 font-bold">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>MENGHUBUNGI GOOGLE GEMINI AI MODEL...</span>
                </div>
              ) : (
                aiAnalysisResult
              )}
            </div>

            <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1">
              <span>Model Engine: Google Gemini Flash 2.0 / Quant AI</span>
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="px-4 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold uppercase border border-black cursor-pointer"
              >
                Tutup Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
