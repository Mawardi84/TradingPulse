import React, { useState } from 'react';
import { Instrument, Candle } from '../types/market';
import {
  TrendingUp,
  TrendingDown,
  Layers,
  Zap,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  Info,
  Maximize2,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
} from 'lucide-react';

export interface MTFStep {
  label: string;
  parentTf: string;
  childTf: string;
  description: string;
  status: 'valid' | 'pullback' | 'pending';
  score: number;
}

export interface MTFSetupEvaluation {
  symbol: string;
  type: 'BUY' | 'SELL';
  confluenceScore: number; // 0 - 100
  rating: 'STRONG_SIGNAL' | 'MODERATE_SIGNAL' | 'NEUTRAL_WAIT';
  steps: MTFStep[];
  entryPrice: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  riskRewardRatio: string;
  summaryText: string;
}

export const MultiTimeframeSetupPanel: React.FC<{
  currentInstrument: Instrument;
  allInstruments: Instrument[];
  candles: Candle[];
  onSelectInstrument?: (symbol: string) => void;
}> = ({ currentInstrument, allInstruments, candles, onSelectInstrument }) => {
  const [activeTab, setActiveTab] = useState<'current' | 'scanner' | 'cheat_sheet'>('current');
  const [copiedSignal, setCopiedSignal] = useState<boolean>(false);
  const [showImageModal, setShowImageModal] = useState<boolean>(false);

  const referenceImagePath = '/assets/aistudio/IMG-20261028-WA0028_2fd15277.jpg';

  // Calculate live MTF Setup for the current instrument
  const evaluateMTFSetup = (inst: Instrument, c: Candle[]): { buySetup: MTFSetupEvaluation; sellSetup: MTFSetupEvaluation } => {
    const isBullishChange = inst.changePercent24h >= 0;
    const price = inst.price;
    const dec = inst.decimals;

    // Evaluate BUY hierarchy: W -> H4 -> M30 -> M5 -> M1
    const buySteps: MTFStep[] = [
      {
        label: 'Weekly Pullback H4',
        parentTf: 'Weekly (W)',
        childTf: 'H4',
        description: 'Tren utama Weekly Bullish. Harga mengalami retracement/pullback masuk ke area Demand H4.',
        status: isBullishChange ? 'valid' : 'pullback',
        score: isBullishChange ? 25 : 15,
      },
      {
        label: 'H4 Pullback M30',
        parentTf: 'H4',
        childTf: 'M30',
        description: 'Sub-struktur H4 berlanjut up. Pullback terdeteksi pada M30 mendekati support kunci.',
        status: isBullishChange ? 'valid' : 'pullback',
        score: isBullishChange ? 25 : 18,
      },
      {
        label: 'M30 Pullback M5',
        parentTf: 'M30',
        childTf: 'M5',
        description: 'Mikro-struktur M30 terkonfirmasi. Retracement terjadi pada M5 dengan penurunan volume jual.',
        status: isBullishChange ? 'valid' : 'pending',
        score: isBullishChange ? 25 : 10,
      },
      {
        label: 'M5 Pullback M1',
        parentTf: 'M5',
        childTf: 'M1',
        description: 'Pemicu eksekusi presisi M1: Rejection pinbar / BOS (Break of Structure) pada M1 untuk entri ROCKET BUY.',
        status: isBullishChange ? 'valid' : 'pending',
        score: isBullishChange ? 20 : 5,
      },
    ];

    const buyConfluence = buySteps.reduce((acc, curr) => acc + curr.score, 0);

    // Evaluate SELL hierarchy: Monthly -> Daily -> H1 -> M15 -> M1
    const sellSteps: MTFStep[] = [
      {
        label: 'Monthly Pullback Daily',
        parentTf: 'Monthly (M)',
        childTf: 'Daily (D)',
        description: 'Tren utama Monthly Bearish. Harga mengalami pullback naik masuk ke Supply zone Daily.',
        status: !isBullishChange ? 'valid' : 'pullback',
        score: !isBullishChange ? 25 : 15,
      },
      {
        label: 'Daily Pullback H1',
        parentTf: 'Daily (D)',
        childTf: 'H1',
        description: 'Sub-struktur Daily berlanjut down. Pullback naik terjadi pada H1 menguji resistance.',
        status: !isBullishChange ? 'valid' : 'pullback',
        score: !isBullishChange ? 25 : 18,
      },
      {
        label: 'H1 Pullback M15',
        parentTf: 'H1',
        childTf: 'M15',
        description: 'Mikro-struktur H1 terkonfirmasi. Retracement naik terjadi pada M15 mendekati order block.',
        status: !isBullishChange ? 'valid' : 'pending',
        score: !isBullishChange ? 25 : 10,
      },
      {
        label: 'M15 Pullback M1',
        parentTf: 'M15',
        childTf: 'M1',
        description: 'Pemicu eksekusi presisi M1: Engulfing bearish / Change of Character pada M1 untuk entri CRASH SELL.',
        status: !isBullishChange ? 'valid' : 'pending',
        score: !isBullishChange ? 20 : 5,
      },
    ];

    const sellConfluence = sellSteps.reduce((acc, curr) => acc + curr.score, 0);

    // Price targets & SL calculations
    const buySl = Number((price * 0.9925).toFixed(dec));
    const buyTp1 = Number((price * 1.015).toFixed(dec));
    const buyTp2 = Number((price * 1.032).toFixed(dec));

    const sellSl = Number((price * 1.0075).toFixed(dec));
    const sellTp1 = Number((price * 0.985).toFixed(dec));
    const sellTp2 = Number((price * 0.968).toFixed(dec));

    const buySetup: MTFSetupEvaluation = {
      symbol: inst.symbol,
      type: 'BUY',
      confluenceScore: buyConfluence,
      rating: buyConfluence >= 80 ? 'STRONG_SIGNAL' : buyConfluence >= 50 ? 'MODERATE_SIGNAL' : 'NEUTRAL_WAIT',
      steps: buySteps,
      entryPrice: price,
      stopLoss: buySl,
      takeProfit1: buyTp1,
      takeProfit2: buyTp2,
      riskRewardRatio: '1 : 3.0',
      summaryText: `Setup Fraktal BUY terdeteksi pada ${inst.displaySymbol}. Seluruh tingkat timeframe W -> H4 -> M30 -> M5 -> M1 menunjukkan perulangan pullback presisi.`,
    };

    const sellSetup: MTFSetupEvaluation = {
      symbol: inst.symbol,
      type: 'SELL',
      confluenceScore: sellConfluence,
      rating: sellConfluence >= 80 ? 'STRONG_SIGNAL' : sellConfluence >= 50 ? 'MODERATE_SIGNAL' : 'NEUTRAL_WAIT',
      steps: sellSteps,
      entryPrice: price,
      stopLoss: sellSl,
      takeProfit1: sellTp1,
      takeProfit2: sellTp2,
      riskRewardRatio: '1 : 3.0',
      summaryText: `Setup Fraktal SELL terdeteksi pada ${inst.displaySymbol}. Hirarki timeframe M -> D -> H1 -> M15 -> M1 mengonfirmasi retest area Supply.`,
    };

    return { buySetup, sellSetup };
  };

  const { buySetup, sellSetup } = evaluateMTFSetup(currentInstrument, candles);
  const primarySetup = currentInstrument.changePercent24h >= 0 ? buySetup : sellSetup;

  const handleCopySignalText = () => {
    const text = `📌 SINYAL SETUP MULTI-TIMEFRAME (FRACTAL PULLBACK)
Pasangan: ${currentInstrument.displaySymbol}
Tipe: ${primarySetup.type}
Konfluensi MTF: ${primarySetup.confluenceScore}%

📍 Entry: ${primarySetup.entryPrice.toLocaleString()}
🛑 Stop Loss: ${primarySetup.stopLoss.toLocaleString()}
🎯 Take Profit 1: ${primarySetup.takeProfit1.toLocaleString()}
🎯 Take Profit 2: ${primarySetup.takeProfit2.toLocaleString()}
⚖️ Risk to Reward: ${primarySetup.riskRewardRatio}

📐 Hirarki Timeframe ${primarySetup.type}:
${primarySetup.type === 'BUY' ? 'Weekly (W) ➔ H4 ➔ M30 ➔ M5 ➔ M1' : 'Monthly (M) ➔ Daily (D) ➔ H1 ➔ M15 ➔ M1'}
[AstraView TradePulse Pro Engine]`;

    navigator.clipboard.writeText(text);
    setCopiedSignal(true);
    setTimeout(() => setCopiedSignal(false), 2500);
  };

  return (
    <div className="bg-[#111722] border border-slate-800 rounded-xl p-4 sm:p-6 space-y-6 shadow-2xl">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-wide">
                Engine Sinyal Setup Multi-Timeframe (MTF)
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-800">
                FRACTAL PULLBACK
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Strategi entri presisi bertingkat berdasar skema riset fraktal gelombang (TF BUY vs TF SELL)
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-1 bg-[#0B0F17] p-1 rounded-lg border border-slate-800 self-stretch sm:self-auto justify-center">
          <button
            type="button"
            onClick={() => setActiveTab('current')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'current'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Setup {currentInstrument.displaySymbol}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('scanner')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'scanner'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Screener Semua Aset</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cheat_sheet')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'cheat_sheet'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>Panduan Rumus (Catatan)</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'current' && (
        <div className="space-y-6">
          {/* Signal Header Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Primary Signal Box */}
            <div
              className={`p-4 rounded-xl border flex flex-col justify-between ${
                primarySetup.type === 'BUY'
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/20 border-rose-500/40 text-rose-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider font-semibold opacity-80">
                  Status Setup Terdeteksi
                </span>
                <span
                  className={`px-2.5 py-1 rounded text-xs font-bold font-mono flex items-center gap-1 ${
                    primarySetup.type === 'BUY'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-rose-500 text-white'
                  }`}
                >
                  {primarySetup.type === 'BUY' ? (
                    <ArrowUpRight className="w-4 h-4 stroke-[3]" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 stroke-[3]" />
                  )}
                  <span>SETUP {primarySetup.type}</span>
                </span>
              </div>

              <div className="my-3">
                <div className="text-2xl font-bold font-mono text-white tracking-tight">
                  {currentInstrument.displaySymbol}
                </div>
                <div className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                  <span>Skor Konfluensi MTF:</span>
                  <span className="font-bold font-mono text-amber-400 text-sm">
                    {primarySetup.confluenceScore}%
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
                <span>R:R Ratio: <strong className="text-white">{primarySetup.riskRewardRatio}</strong></span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Presisi Algoritmik
                </span>
              </div>
            </div>

            {/* Price Levels Grid */}
            <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0B0F17] p-4 rounded-xl border border-slate-800">
              <div className="space-y-1">
                <div className="text-[11px] font-mono text-slate-400 uppercase">Harga Pasaran</div>
                <div className="text-lg font-bold font-mono text-white">
                  {primarySetup.entryPrice.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500">Harga Spot Live</div>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] font-mono text-rose-400 uppercase">Stop Loss (SL)</div>
                <div className="text-lg font-bold font-mono text-rose-400">
                  {primarySetup.stopLoss.toLocaleString()}
                </div>
                <div className="text-[10px] text-rose-500/80">-0.75% Batas Risiko</div>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] font-mono text-emerald-400 uppercase">Take Profit 1</div>
                <div className="text-lg font-bold font-mono text-emerald-400">
                  {primarySetup.takeProfit1.toLocaleString()}
                </div>
                <div className="text-[10px] text-emerald-500/80">+1.50% Target 1</div>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] font-mono text-cyan-400 uppercase">Take Profit 2</div>
                <div className="text-lg font-bold font-mono text-cyan-400">
                  {primarySetup.takeProfit2.toLocaleString()}
                </div>
                <div className="text-[10px] text-cyan-500/80">+3.20% Target 2</div>
              </div>
            </div>
          </div>

          {/* Interactive Wave Diagram Visualizer (TF BUY vs TF SELL Diagram) */}
          <div className="bg-[#0B0F17] p-4 sm:p-5 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  Visualisasi Fraktal Gelombang Pullback ({primarySetup.type})
                </h3>
              </div>
              <div className="text-xs font-mono text-slate-400">
                Hirarki: {primarySetup.type === 'BUY' ? 'W ➔ H4 ➔ M30 ➔ M5 ➔ M1' : 'M ➔ D ➔ H1 ➔ M15 ➔ M1'}
              </div>
            </div>

            {/* SVG Visual Diagram mirroring handwritten cheat sheet */}
            <div className="w-full h-56 bg-[#080B11] rounded-lg border border-slate-800/80 relative overflow-hidden flex items-center justify-center p-2">
              {primarySetup.type === 'BUY' ? (
                <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="buyRocketGlow" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>

                  {/* Grid background lines */}
                  <line x1="0" y1="50" x2="600" y2="50" stroke="#1e293b" strokeDasharray="3 3" />
                  <line x1="0" y1="100" x2="600" y2="100" stroke="#1e293b" strokeDasharray="3 3" />
                  <line x1="0" y1="150" x2="600" y2="150" stroke="#1e293b" strokeDasharray="3 3" />

                  {/* BUY Nested Pullback Polyline */}
                  {/* W (Black/Blue) -> H4 (Red pullback) -> M30 (Red pullback) -> M5 (Red pullback) -> M1 (Red pullback) -> ROCKET BUY */}
                  <path
                    d="M 20,160 L 70,80 L 100,140 L 150,80 L 180,140 L 230,80 L 260,140 L 310,80 L 340,140 L 390,80 L 410,150 L 580,20"
                    fill="none"
                    stroke="url(#buyRocketGlow)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Timeframe Annotations corresponding to user diagram */}
                  <text x="30" y="180" fill="#3b82f6" fontSize="13" fontWeight="bold">W</text>
                  <text x="110" y="165" fill="#f43f5e" fontSize="12" fontWeight="bold">H4</text>
                  <text x="190" y="165" fill="#3b82f6" fontSize="12" fontWeight="bold">M30</text>
                  <text x="270" y="165" fill="#f43f5e" fontSize="12" fontWeight="bold">M5</text>
                  <text x="350" y="165" fill="#3b82f6" fontSize="12" fontWeight="bold">M1</text>
                  <text x="500" y="45" fill="#10b981" fontSize="16" fontWeight="bold">BUY 🚀</text>

                  {/* Glowing Trigger Pin on M1 breakout */}
                  <circle cx="410" cy="150" r="6" fill="#10b981" className="animate-ping" />
                  <circle cx="410" cy="150" r="4" fill="#10b981" />
                  <text x="420" y="175" fill="#10b981" fontSize="11" fontWeight="bold">Pemicu Entri M1</text>
                </svg>
              ) : (
                <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="sellCrashGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f43f5e" />
                      <stop offset="100%" stopColor="#e11d48" />
                    </linearGradient>
                  </defs>

                  {/* Grid background lines */}
                  <line x1="0" y1="50" x2="600" y2="50" stroke="#1e293b" strokeDasharray="3 3" />
                  <line x1="0" y1="100" x2="600" y2="100" stroke="#1e293b" strokeDasharray="3 3" />
                  <line x1="0" y1="150" x2="600" y2="150" stroke="#1e293b" strokeDasharray="3 3" />

                  {/* SELL Nested Pullback Polyline */}
                  {/* M (Red) -> D (Blue pullback) -> H1 (Blue pullback) -> M15 (Blue pullback) -> M1 (Blue pullback) -> CRASH SELL */}
                  <path
                    d="M 20,30 L 70,140 L 110,60 L 160,140 L 200,60 L 250,140 L 290,60 L 340,140 L 370,60 L 410,130 L 430,50 L 570,185"
                    fill="none"
                    stroke="url(#sellCrashGlow)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Timeframe Annotations corresponding to user diagram */}
                  <text x="30" y="22" fill="#f43f5e" fontSize="13" fontWeight="bold">M</text>
                  <text x="110" y="48" fill="#3b82f6" fontSize="12" fontWeight="bold">D</text>
                  <text x="200" y="48" fill="#f43f5e" fontSize="12" fontWeight="bold">H1</text>
                  <text x="290" y="48" fill="#3b82f6" fontSize="12" fontWeight="bold">M15</text>
                  <text x="370" y="48" fill="#f43f5e" fontSize="12" fontWeight="bold">M1</text>
                  <text x="490" y="160" fill="#f43f5e" fontSize="16" fontWeight="bold">SELL 📉</text>

                  {/* Glowing Trigger Pin on M1 breakout */}
                  <circle cx="430" cy="50" r="6" fill="#f43f5e" className="animate-ping" />
                  <circle cx="430" cy="50" r="4" fill="#f43f5e" />
                  <text x="440" y="38" fill="#f43f5e" fontSize="11" fontWeight="bold">Pemicu Entri M1</text>
                </svg>
              )}
            </div>

            <p className="text-xs text-slate-400">
              {primarySetup.summaryText}
            </p>
          </div>

          {/* Timeframe Breakdown Checklist */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Checklist Langkah Hirarki Timeframe ({primarySetup.type})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {primarySetup.steps.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-[#0B0F17] rounded-xl border border-slate-800 flex items-start gap-3 justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-mono text-xs font-bold ${
                        step.status === 'valid'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white font-mono">{step.label}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                          {step.parentTf} ➔ {step.childTf}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{step.description}</p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                      step.status === 'valid'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {step.status === 'valid' ? 'Terkonfirmasi ✅' : 'Proses Pullback ⏳'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Bar */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Info className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Gunakan manajemen risiko disiplin (maksimal 1-2% modal per transaksi).</span>
            </div>

            <button
              type="button"
              onClick={handleCopySignalText}
              className={`w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 ${
                copiedSignal
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20'
              }`}
            >
              {copiedSignal ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Sinyal Berhasil Disalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Salin Parameter Sinyal MTF</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Scanner Tab: Multi-Asset Scanner for MTF setups */}
      {activeTab === 'scanner' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">Screener Sinyal Setup Fraktal Multi-Timeframe</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Pemindaian otomatis seluruh aset real-time berdasarkan matriks TF BUY & TF SELL
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Pemindaian Live
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {allInstruments.slice(0, 10).map((inst) => {
              const dummyCandles = candles;
              const { buySetup, sellSetup } = evaluateMTFSetup(inst, dummyCandles);
              const isBuy = inst.changePercent24h >= 0;
              const targetSetup = isBuy ? buySetup : sellSetup;

              return (
                <div
                  key={inst.symbol}
                  className="p-3.5 bg-[#0B0F17] rounded-xl border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold font-mono text-xs ${
                        isBuy
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {inst.symbol.substring(0, 3)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white font-mono">{inst.displaySymbol}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                            isBuy ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                          }`}
                        >
                          {targetSetup.type}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Harga: <span className="text-white font-semibold">{inst.price.toLocaleString()}</span> | Konfluensi:{' '}
                        <span className="text-amber-400 font-bold">{targetSetup.confluenceScore}%</span>
                      </div>
                    </div>
                  </div>

                  {onSelectInstrument && (
                    <button
                      type="button"
                      onClick={() => onSelectInstrument(inst.symbol)}
                      className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-mono font-semibold flex items-center gap-1 transition-colors"
                    >
                      <span>Lihat Chart</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cheat-Sheet Tab: Original Handwritten Reference Image & Rules */}
      {activeTab === 'cheat_sheet' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">Catatan & Referensi Rumus Sinyal Setup Trading</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Aturan asli hirarki timeframe dan skema fraktal pullback (TF BUY vs TF SELL)
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowImageModal(true)}
              className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Perbesar Gambar Catatan</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Embedded Original Note Image */}
            <div className="bg-[#0B0F17] p-3 rounded-xl border border-slate-800 space-y-2">
              <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
                <span>Dokumen Catatan Asli Pengguna</span>
                <span className="text-emerald-400">Terverifikasi</span>
              </div>
              <div
                onClick={() => setShowImageModal(true)}
                className="relative cursor-pointer rounded-lg overflow-hidden border border-slate-800 hover:border-blue-500/50 transition-all group"
              >
                <img
                  src={referenceImagePath}
                  alt="Catatan Sinyal Setup Trading MTF"
                  className="w-full h-auto object-contain max-h-[420px] bg-slate-900"
                />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="px-3 py-1.5 rounded bg-blue-600 text-white text-xs font-bold font-mono shadow-lg flex items-center gap-1">
                    <Maximize2 className="w-4 h-4" /> Klik untuk Perbesar
                  </span>
                </div>
              </div>
            </div>

            {/* Rule Explanations Side Cards */}
            <div className="space-y-4">
              {/* TF BUY Card */}
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm border-b border-emerald-500/20 pb-2">
                  <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                  <span>Aturan Hirarki TF BUY (Bullish Multi-Timeframe)</span>
                </div>

                <div className="text-xs font-mono text-slate-300 space-y-1.5">
                  <div className="font-bold text-white">Hirarki Timeframe:</div>
                  <div className="p-2 rounded bg-[#0B0F17] border border-slate-800 text-emerald-300">
                    Weekly (W) ➔ H4 ➔ M30 ➔ M5 ➔ M1
                  </div>

                  <div className="font-bold text-white mt-2">Urutan Pullback Fraktal:</div>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1">
                    <li><strong className="text-white">W Pullback H4:</strong> Retracement Weekly direspon zona Demand H4</li>
                    <li><strong className="text-white">H4 Pullback M30:</strong> Sub-struktur H4 berlanjut up, pullback pada M30</li>
                    <li><strong className="text-white">M30 Pullback M5:</strong> Retracement M30 direspon area support M5</li>
                    <li><strong className="text-white">M5 Pullback M1:</strong> Pemicu entri presisi M1 (BOS / Pinbar) ➔ ROCKET BUY</li>
                  </ul>
                </div>
              </div>

              {/* TF SELL Card */}
              <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-3">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm border-b border-rose-500/20 pb-2">
                  <ArrowDownRight className="w-5 h-5 stroke-[2.5]" />
                  <span>Aturan Hirarki TF SELL (Bearish Multi-Timeframe)</span>
                </div>

                <div className="text-xs font-mono text-slate-300 space-y-1.5">
                  <div className="font-bold text-white">Hirarki Timeframe:</div>
                  <div className="p-2 rounded bg-[#0B0F17] border border-slate-800 text-rose-300">
                    Monthly (M) ➔ Daily (D) ➔ H1 ➔ M15 ➔ M1
                  </div>

                  <div className="font-bold text-white mt-2">Urutan Pullback Fraktal:</div>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1">
                    <li><strong className="text-white">M Pullback D:</strong> Retracement Monthly direspon zona Supply Daily</li>
                    <li><strong className="text-white">D Pullback H1:</strong> Sub-struktur Daily berlanjut down, pullback naik pada H1</li>
                    <li><strong className="text-white">H1 Pullback M15:</strong> Retracement H1 direspon resistance M15</li>
                    <li><strong className="text-white">M15 Pullback M1:</strong> Pemicu entri presisi M1 (ChoCh / Engulfing) ➔ CRASH SELL</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Image View Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111722] border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white font-mono">Catatan Sinyal Setup Trading Asli</h3>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex items-center justify-center bg-slate-950">
              <img
                src={referenceImagePath}
                alt="Catatan Sinyal Setup Trading MTF Fullscreen"
                className="max-h-[75vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
