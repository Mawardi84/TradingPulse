import React, { useState, useEffect } from 'react';
import { Instrument, Candle } from '../types/market';
import {
  Calculator,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Copy,
  Check,
  Maximize2,
  TrendingUp,
  TrendingDown,
  Info,
  Layers,
  Zap,
  Target,
  Shield,
  Send,
  RotateCcw
} from 'lucide-react';

interface GoldEntryCalculatorPanelProps {
  currentInstrument: Instrument;
  candles: Candle[];
  onSelectInstrument?: (symbol: string) => void;
  onSendOrderTicket?: (order: { type: 'BUY_LIMIT' | 'SELL_LIMIT'; price: number; sl: number; tp: number; symbol: string }) => void;
}

export interface EntryCalculationResult {
  label: string;
  regime: 'SIDEWAY' | 'TREND_KUAT';
  offset: number;
  formulaStr: string;
  calculatedPrice: number;
  tpPipsMin: number;
  tpPipsMax: number;
  tpPriceMin: number;
  tpPriceMax: number;
  slPrice: number;
  recommendation: 'HIGH_CONFLUENCE' | 'MODERATE' | 'SPECULATIVE';
}

export const GoldEntryCalculatorPanel: React.FC<GoldEntryCalculatorPanelProps> = ({
  currentInstrument,
  candles,
  onSendOrderTicket,
}) => {
  const isGold = currentInstrument.symbol.toUpperCase().includes('XAU') || currentInstrument.symbol.toUpperCase().includes('GOLD');

  // Auto-detect M5 Resistance (High) & Support (Low) from candles or default to live price
  const highestCandleHigh = candles.length > 0 ? Math.max(...candles.map((c) => c.high)) : currentInstrument.price + 1.25;
  const lowestCandleLow = candles.length > 0 ? Math.min(...candles.map((c) => c.low)) : currentInstrument.price - 1.25;

  const [resistenM5, setResistenM5] = useState<number>(Number(highestCandleHigh.toFixed(2)));
  const [supportM5, setSupportM5] = useState<number>(Number(lowestCandleLow.toFixed(2)));
  const [entryType, setEntryType] = useState<'BUY_LIMIT' | 'SELL_LIMIT'>('BUY_LIMIT');
  const [activeRegime, setActiveRegime] = useState<'ALL' | 'SIDEWAY' | 'TREND_KUAT'>('ALL');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showImageModal, setShowImageModal] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<EntryCalculationResult | null>(null);
  const [isScalpMode, setIsScalpMode] = useState<boolean>(false);
  const [volMultiplier, setVolMultiplier] = useState<number>(1.0);

  // Sync state if current price shifts dramatically
  useEffect(() => {
    if (candles.length > 0) {
      const h = Math.max(...candles.map((c) => c.high));
      const l = Math.min(...candles.map((c) => c.low));
      setResistenM5(Number(h.toFixed(2)));
      setSupportM5(Number(l.toFixed(2)));
    } else {
      setResistenM5(Number((currentInstrument.price + 0.85).toFixed(2)));
      setSupportM5(Number((currentInstrument.price - 0.85).toFixed(2)));
    }
  }, [currentInstrument.symbol, candles]);

  // Formulas from user uploaded cheat sheet images:
  // BUY LIMIT:
  // Sideway (Scalping TP 50-70 Pips): Harga Resisten M5 - [0.10, 0.13, 0.15, 0.17]
  // Trend Kuat (dikurangi 0.17 s/d 0.31): Harga Resisten M5 - [0.17, 0.18, 0.20, 0.29, 0.30, 0.31]
  //
  // SELL LIMIT:
  // Sideway (Scalping TP 40-70 Pips): Harga Support M5 + [0.10, 0.13, 0.15, 0.17]
  // Trend Kuat (ditambah 0.17 s/d 0.31): Harga Support M5 + [0.17, 0.18, 0.20, 0.29, 0.30, 0.31]

  const buySidewayOffsets = [0.10, 0.13, 0.15, 0.17];
  const buyTrendKuatOffsets = [0.17, 0.18, 0.20, 0.29, 0.30, 0.31];
  const scalpOffsets = [0.05, 0.07, 0.08];

  const sellSidewayOffsets = [0.10, 0.13, 0.15, 0.17];
  const sellTrendKuatOffsets = [0.17, 0.18, 0.20, 0.29, 0.30, 0.31];

  const calculateEntries = (): EntryCalculationResult[] => {
    const results: EntryCalculationResult[] = [];

    if (isScalpMode) {
      // Specialized Scalp Logic (M1/M5 Sniper)
      const basePrice = entryType === 'BUY_LIMIT' ? resistenM5 : supportM5;
      scalpOffsets.map(o => o * volMultiplier).forEach(offset => {
        const entryPrice = entryType === 'BUY_LIMIT' ? basePrice - offset : basePrice + offset;
        results.push({
          label: `Scalp Sniper (Offset ${offset.toFixed(2)})`,
          regime: 'SIDEWAY',
          offset,
          formulaStr: `${basePrice.toFixed(2)} ${entryType === 'BUY_LIMIT' ? '-' : '+'} ${offset.toFixed(2)}`,
          calculatedPrice: Number(entryPrice.toFixed(2)),
          tpPipsMin: 20,
          tpPipsMax: 40,
          tpPriceMin: entryType === 'BUY_LIMIT' ? Number((entryPrice + 2).toFixed(2)) : Number((entryPrice - 2).toFixed(2)),
          tpPriceMax: entryType === 'BUY_LIMIT' ? Number((entryPrice + 4).toFixed(2)) : Number((entryPrice - 4).toFixed(2)),
          slPrice: entryType === 'BUY_LIMIT' ? Number((entryPrice - 1.5).toFixed(2)) : Number((entryPrice + 1.5).toFixed(2)),
          recommendation: 'HIGH_CONFLUENCE'
        });
      });
      return results;
    }

    if (entryType === 'BUY_LIMIT') {
      const basePrice = resistenM5;
      // Sideway
      if (activeRegime === 'ALL' || activeRegime === 'SIDEWAY') {
        buySidewayOffsets.forEach((offset) => {
          const entryPrice = Number((basePrice - offset).toFixed(2));
          const tpPipsMin = 50;
          const tpPipsMax = 70;
          const tpPriceMin = Number((entryPrice + tpPipsMin * 0.1).toFixed(2));
          const tpPriceMax = Number((entryPrice + tpPipsMax * 0.1).toFixed(2));
          const slPrice = Number((entryPrice - 30 * 0.1).toFixed(2));

          results.push({
            label: `Buy Limit (Offset -${offset.toFixed(2)})`,
            regime: 'SIDEWAY',
            offset,
            formulaStr: `${basePrice.toFixed(2)} - ${offset.toFixed(2)}`,
            calculatedPrice: entryPrice,
            tpPipsMin,
            tpPipsMax,
            tpPriceMin,
            tpPriceMax,
            slPrice,
            recommendation: offset === 0.15 ? 'HIGH_CONFLUENCE' : 'MODERATE',
          });
        });
      }

      // Trend Kuat
      if (activeRegime === 'ALL' || activeRegime === 'TREND_KUAT') {
        buyTrendKuatOffsets.forEach((offset) => {
          const entryPrice = Number((basePrice - offset).toFixed(2));
          const tpPipsMin = 70;
          const tpPipsMax = 120;
          const tpPriceMin = Number((entryPrice + tpPipsMin * 0.1).toFixed(2));
          const tpPriceMax = Number((entryPrice + tpPipsMax * 0.1).toFixed(2));
          const slPrice = Number((entryPrice - 40 * 0.1).toFixed(2));

          results.push({
            label: `Buy Limit (Offset -${offset.toFixed(2)})`,
            regime: 'TREND_KUAT',
            offset,
            formulaStr: `${basePrice.toFixed(2)} - ${offset.toFixed(2)}`,
            calculatedPrice: entryPrice,
            tpPipsMin,
            tpPipsMax,
            tpPriceMin,
            tpPriceMax,
            slPrice,
            recommendation: offset === 0.20 || offset === 0.30 ? 'HIGH_CONFLUENCE' : 'MODERATE',
          });
        });
      }
    } else {
      // SELL LIMIT
      const basePrice = supportM5;
      // Sideway
      if (activeRegime === 'ALL' || activeRegime === 'SIDEWAY') {
        sellSidewayOffsets.forEach((offset) => {
          const entryPrice = Number((basePrice + offset).toFixed(2));
          const tpPipsMin = 40;
          const tpPipsMax = 70;
          const tpPriceMin = Number((entryPrice - tpPipsMin * 0.1).toFixed(2));
          const tpPriceMax = Number((entryPrice - tpPipsMax * 0.1).toFixed(2));
          const slPrice = Number((entryPrice + 30 * 0.1).toFixed(2));

          results.push({
            label: `Sell Limit (Offset +${offset.toFixed(2)})`,
            regime: 'SIDEWAY',
            offset,
            formulaStr: `${basePrice.toFixed(2)} + ${offset.toFixed(2)}`,
            calculatedPrice: entryPrice,
            tpPipsMin,
            tpPipsMax,
            tpPriceMin,
            tpPriceMax,
            slPrice,
            recommendation: offset === 0.15 ? 'HIGH_CONFLUENCE' : 'MODERATE',
          });
        });
      }

      // Trend Kuat
      if (activeRegime === 'ALL' || activeRegime === 'TREND_KUAT') {
        sellTrendKuatOffsets.forEach((offset) => {
          const entryPrice = Number((basePrice + offset).toFixed(2));
          const tpPipsMin = 70;
          const tpPipsMax = 120;
          const tpPriceMin = Number((entryPrice - tpPipsMin * 0.1).toFixed(2));
          const tpPriceMax = Number((entryPrice - tpPipsMax * 0.1).toFixed(2));
          const slPrice = Number((entryPrice + 40 * 0.1).toFixed(2));

          results.push({
            label: `Sell Limit (Offset +${offset.toFixed(2)})`,
            regime: 'TREND_KUAT',
            offset,
            formulaStr: `${basePrice.toFixed(2)} + ${offset.toFixed(2)}`,
            calculatedPrice: entryPrice,
            tpPipsMin,
            tpPipsMax,
            tpPriceMin,
            tpPriceMax,
            slPrice,
            recommendation: offset === 0.20 || offset === 0.30 ? 'HIGH_CONFLUENCE' : 'MODERATE',
          });
        });
      }
    }

    return results;
  };

  const results = calculateEntries();

  const handleCopySingle = (res: EntryCalculationResult, index: number) => {
    const text = `📌 KALKULATOR GOLD M5 SETUP [${isScalpMode ? 'SCALP SNIPER' : 'NORMAL'}]
Aset: ${currentInstrument.displaySymbol} (${entryType})
Rezim: ${res.regime}
Harga Acuan M5: $${entryType === 'BUY_LIMIT' ? resistenM5.toFixed(2) : supportM5.toFixed(2)}
Formula: ${res.formulaStr}
📍 Entri ${entryType}: $${res.calculatedPrice.toFixed(2)}
🛑 Stop Loss: $${res.slPrice.toFixed(2)}
🎯 Take Profit (${res.tpPipsMin}-${res.tpPipsMax} pips): $${Math.min(res.tpPriceMin, res.tpPriceMax).toFixed(2)} - $${Math.max(res.tpPriceMin, res.tpPriceMax).toFixed(2)}
[AstraView AI Setup Engine]`;

    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleResetToLive = () => {
    if (candles.length > 0) {
      const h = Math.max(...candles.map((c) => c.high));
      const l = Math.min(...candles.map((c) => c.low));
      setResistenM5(Number(h.toFixed(2)));
      setSupportM5(Number(l.toFixed(2)));
    } else {
      setResistenM5(Number((currentInstrument.price + 0.85).toFixed(2)));
      setSupportM5(Number((currentInstrument.price - 0.85).toFixed(2)));
    }
  };

  return (
    <div className="bg-[#0D1117] border border-amber-500/30 rounded-xl p-4 sm:p-6 space-y-6 shadow-2xl relative overflow-hidden">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-black font-black shadow-lg shadow-amber-500/20 shrink-0">
            <Calculator className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-wide">
                Engine AI Setup Entri - Kalkulator Gold M5
              </h2>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono border font-bold ${isScalpMode ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-amber-950 text-amber-400 border-amber-800'}`}>
                {isScalpMode ? 'SCALP SNIPER M1/M5' : 'XAUUSD FORMULA'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Hitung zona entri presisi Buy Limit (Resisten M5 - Offset) & Sell Limit (Support M5 + Offset)
            </p>
          </div>
        </div>

        {/* Action Toggle Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {isScalpMode && (
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg">
              <span className="text-[10px] text-zinc-400 uppercase font-bold">Vol. Multiplier:</span>
              <input 
                type="number"
                step="0.1"
                defaultValue="1.0"
                className="w-16 bg-black border border-zinc-700 text-yellow-400 text-xs font-bold text-center rounded p-1"
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setVolMultiplier(isNaN(val) ? 1.0 : val);
                }}
              />
            </div>
          )}
          <button 
            onClick={() => setIsScalpMode(!isScalpMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${isScalpMode ? 'bg-emerald-600 text-white border-emerald-400 shadow-emerald-500/20 shadow-lg' : 'bg-zinc-900 text-zinc-400 border-zinc-800'}`}
          >
            <Zap className={`w-3.5 h-3.5 inline mr-1 ${isScalpMode ? 'fill-current' : ''}`} />
            {isScalpMode ? 'Scalp Active' : 'Enable Scalp Mode'}
          </button>
          <button
            type="button"
            onClick={handleResetToLive}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Reset ke High/Low Live</span>
          </button>
        </div>
      </div>

      {/* Non-Gold warning notice */}
      {!isGold && (
        <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-lg flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              Catatan: Kalkulator ini dioptimalkan khusus untuk <strong>XAUUSD / Gold</strong>. Saat ini Anda melihat pasangan <strong>{currentInstrument.displaySymbol}</strong>.
            </span>
          </div>
        </div>
      )}

      {/* Control Inputs Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#111722] p-4 rounded-xl border border-slate-800">
        {/* Entry Direction Selector */}
        <div className="space-y-2">
          <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block font-semibold">
            1. Jenis Setup Entri
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setEntryType('BUY_LIMIT')}
              className={`py-2.5 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all border ${
                entryType === 'BUY_LIMIT'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20'
                  : 'bg-[#0B0F17] text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-4 h-4 stroke-[3]" />
              <span>BUY LIMIT</span>
            </button>
            <button
              type="button"
              onClick={() => setEntryType('SELL_LIMIT')}
              className={`py-2.5 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all border ${
                entryType === 'SELL_LIMIT'
                  ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-600/20'
                  : 'bg-[#0B0F17] text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <ArrowDownRight className="w-4 h-4 stroke-[3]" />
              <span>SELL LIMIT</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            {entryType === 'BUY_LIMIT'
              ? 'Rumus: Harga Resisten M5 - Offset'
              : 'Rumus: Harga Support M5 + Offset'}
          </p>
        </div>

        {/* Live M5 Price Inputs */}
        <div className="space-y-2">
          <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block font-semibold">
            2. Harga Acuan M5 (Spot: ${currentInstrument.price.toFixed(2)})
          </label>
          {entryType === 'BUY_LIMIT' ? (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-emerald-400 font-bold w-24">Resisten M5:</span>
                <input
                  type="number"
                  step="0.01"
                  value={resistenM5}
                  onChange={(e) => setResistenM5(Number(e.target.value))}
                  className="w-full bg-[#0B0F17] border border-emerald-500/50 rounded-lg px-3 py-1.5 text-sm font-mono text-white font-bold focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>
              <span className="text-[10px] text-slate-500 block">
                Nilai tertinggi candle M5 (Auto-detected)
              </span>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-rose-400 font-bold w-24">Support M5:</span>
                <input
                  type="number"
                  step="0.01"
                  value={supportM5}
                  onChange={(e) => setSupportM5(Number(e.target.value))}
                  className="w-full bg-[#0B0F17] border border-rose-500/50 rounded-lg px-3 py-1.5 text-sm font-mono text-white font-bold focus:outline-none focus:ring-1 focus:ring-rose-400"
                />
              </div>
              <span className="text-[10px] text-slate-500 block">
                Nilai terendah candle M5 (Auto-detected)
              </span>
            </div>
          )}
        </div>

        {/* Market Regime Filter */}
        <div className="space-y-2">
          <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block font-semibold">
            3. Kondisi Pasaran (Rezim)
          </label>
          <div className="flex items-center gap-1 bg-[#0B0F17] p-1 rounded-lg border border-slate-800">
            <button
              type="button"
              disabled={isScalpMode}
              onClick={() => setActiveRegime('ALL')}
              className={`flex-1 py-1.5 rounded text-xs font-mono font-semibold transition-colors disabled:opacity-20 ${
                activeRegime === 'ALL' ? 'bg-amber-500 text-black font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              disabled={isScalpMode}
              onClick={() => setActiveRegime('SIDEWAY')}
              className={`flex-1 py-1.5 rounded text-xs font-mono font-semibold transition-colors disabled:opacity-20 ${
                activeRegime === 'SIDEWAY' ? 'bg-amber-500 text-black font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sideway
            </button>
            <button
              type="button"
              disabled={isScalpMode}
              onClick={() => setActiveRegime('TREND_KUAT')}
              className={`flex-1 py-1.5 rounded text-xs font-mono font-semibold transition-colors disabled:opacity-20 ${
                activeRegime === 'TREND_KUAT' ? 'bg-amber-500 text-black font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Trend Kuat
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            {isScalpMode 
              ? 'Mode Scalp M1 Aktif - Rezim dikunci ke Volatility Sniper.'
              : activeRegime === 'SIDEWAY'
              ? entryType === 'BUY_LIMIT'
                ? 'Scalping TP 50 s/d 70 Pips (Offset 0.10 - 0.17)'
                : 'Scalping TP 40 s/d 70 Pips (Offset 0.10 - 0.17)'
              : activeRegime === 'TREND_KUAT'
              ? 'Trend Kuat (Offset 0.17 s/d 0.31)'
              : 'Menampilkan seluruh skenario entri'}
          </p>
        </div>
      </div>

      {/* Results Table & Recommendation Box */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Hasil Kalkulasi Zona Entri Presisi ({results.length} Zona Skenario)
            </h3>
          </div>
          <div className="text-xs font-mono text-slate-400">
            Acuan: <strong className="text-white">{entryType === 'BUY_LIMIT' ? `Resisten M5 $${resistenM5.toFixed(2)}` : `Support M5 $${supportM5.toFixed(2)}`}</strong>
          </div>
        </div>

        {/* Results Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#0B0F17]">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="bg-[#111722] text-slate-400 border-b border-slate-800">
                <th className="py-3 px-3">No</th>
                <th className="py-3 px-3">Kondisi Rezim</th>
                <th className="py-3 px-3">Formula Offset</th>
                <th className="py-3 px-[#10b981]">Harga Entri Presisi</th>
                <th className="py-3 px-3 text-rose-400">Stop Loss (SL)</th>
                <th className="py-3 px-3 text-emerald-400">Target TP (Pips)</th>
                <th className="py-3 px-3 text-center">Aksi / Eksekusi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {results.map((res, index) => (
                <tr
                  key={index}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    res.recommendation === 'HIGH_CONFLUENCE' ? 'bg-amber-950/10' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 font-bold text-slate-400">{index + 1}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        res.regime === 'SIDEWAY'
                          ? 'bg-blue-950 text-blue-300 border border-blue-800/60'
                          : 'bg-purple-950 text-purple-300 border border-purple-800/60'
                      }`}
                    >
                      {res.regime === 'SIDEWAY' ? 'SIDEWAY (SCALPING)' : 'TREND KUAT'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 font-mono">
                    {res.formulaStr}
                  </td>
                  <td className="py-2.5 px-3 text-sm font-bold text-white font-mono bg-slate-900/40">
                    <span
                      className={`px-2 py-1 rounded border font-mono ${
                        entryType === 'BUY_LIMIT'
                          ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                          : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                      }`}
                    >
                      ${res.calculatedPrice.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-rose-400 font-mono font-semibold">
                    ${res.slPrice.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-emerald-400 font-mono font-semibold">
                    ${Math.min(res.tpPriceMin, res.tpPriceMax).toFixed(2)} - ${Math.max(res.tpPriceMin, res.tpPriceMax).toFixed(2)}
                    <span className="text-[10px] text-slate-400 block font-normal">
                      ({res.tpPipsMin} - {res.tpPipsMax} Pips)
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleCopySingle(res, index)}
                        className={`p-1.5 rounded transition-colors ${
                          copiedIndex === index
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                        title="Salin rincian sinyal"
                      >
                        {copiedIndex === index ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>

                      {onSendOrderTicket && (
                        <button
                          type="button"
                          onClick={() => {
                            onSendOrderTicket({
                              type: entryType,
                              price: res.calculatedPrice,
                              sl: res.slPrice,
                              tp: res.tpPriceMin,
                              symbol: currentInstrument.symbol,
                            });
                          }}
                          className="px-2 py-1 rounded bg-amber-500 hover:bg-amber-400 text-black text-[11px] font-bold font-mono flex items-center gap-1 transition-colors"
                        >
                          <Send className="w-3 h-3" />
                          <span>Order Ticket</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reference Image Cheat Sheets Provided by User */}
      <div className="space-y-4 border-t border-slate-800 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white font-mono">
              Dokumen Referensi Rumus Asli (Catatan Pengguna)
            </h3>
          </div>
          <span className="text-xs text-slate-400">Klik gambar untuk memperbesar</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: BUY LIMIT Image */}
          <div className="bg-[#111722] p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <ArrowUpRight className="w-4 h-4" /> ENTRI BUY LIMIT
              </span>
              <span className="text-slate-400 text-[10px]">Resisten M5 - Offset</span>
            </div>
            <div
              onClick={() => setShowImageModal('/assets/aistudio/0ac0ab62abd13d11f5a910bb0b1b0165_6644590b.webp')}
              className="relative cursor-pointer rounded-lg overflow-hidden border border-slate-800 hover:border-emerald-500/50 transition-all group bg-slate-950 h-52 flex items-center justify-center"
            >
              <img
                src="/assets/aistudio/0ac0ab62abd13d11f5a910bb0b1b0165_6644590b.webp"
                alt="Formula Buy Limit Gold M5"
                className="max-h-full max-w-full object-contain"
              />
              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="px-3 py-1.5 rounded bg-emerald-600 text-white text-xs font-bold font-mono shadow-lg flex items-center gap-1">
                  <Maximize2 className="w-3.5 h-3.5" /> Perbesar Buy Limit
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: SELL LIMIT Image */}
          <div className="bg-[#111722] p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-rose-400 font-bold flex items-center gap-1">
                <ArrowDownRight className="w-4 h-4" /> ENTRI SELL LIMIT
              </span>
              <span className="text-slate-400 text-[10px]">Support M5 + Offset</span>
            </div>
            <div
              onClick={() => setShowImageModal('/assets/aistudio/c52745e3b23454aa1aea809fe85faa65_6dde734c.webp')}
              className="relative cursor-pointer rounded-lg overflow-hidden border border-slate-800 hover:border-rose-500/50 transition-all group bg-slate-950 h-52 flex items-center justify-center"
            >
              <img
                src="/assets/aistudio/c52745e3b23454aa1aea809fe85faa65_6dde734c.webp"
                alt="Formula Sell Limit Gold M5"
                className="max-h-full max-w-full object-contain"
              />
              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="px-3 py-1.5 rounded bg-rose-600 text-white text-xs font-bold font-mono shadow-lg flex items-center gap-1">
                  <Maximize2 className="w-3.5 h-3.5" /> Perbesar Sell Limit
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for full screen view of reference images */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111722] border border-slate-800 rounded-2xl max-w-2xl w-full flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white font-mono">Dokumen Referensi Asli Kalkulator Gold</h3>
              <button
                type="button"
                onClick={() => setShowImageModal(null)}
                className="p-1.5 rounded bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex items-center justify-center bg-slate-950">
              <img
                src={showImageModal}
                alt="Formula Fullscreen"
                className="max-h-[75vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
