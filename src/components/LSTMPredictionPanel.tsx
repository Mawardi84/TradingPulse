import React, { useState, useEffect } from 'react';
import { Instrument, Candle } from '../types/market';
import { 
  BrainCircuit, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  RefreshCw, 
  Target, 
  ShieldAlert, 
  Layers,
  Sparkles,
  Activity
} from 'lucide-react';

interface PredictionData {
  direction: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  confidenceScore: number;
  targetPrice: number;
  stopInvalidation: number;
  expectedHorizon: string;
  patternsDetected: string[];
  modelAnalysis: string;
}

interface LSTMPredictionPanelProps {
  instrument: Instrument;
  candles: Candle[];
}

export const LSTMPredictionPanel: React.FC<LSTMPredictionPanelProps> = ({ instrument, candles }) => {
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [source, setSource] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const runPrediction = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: instrument.symbol,
          currentPrice: instrument.price,
          candles,
          timeframe: '15m'
        })
      });
      const data = await res.json();
      if (data.success && data.prediction) {
        setPrediction(data.prediction);
        setSource(data.source || 'GEMINI_LSTM_ENGINE');
      }
    } catch (err) {
      console.error('Failed to run LSTM inference:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runPrediction();
  }, [instrument.symbol]);

  return (
    <div className="bg-zinc-950 border border-white p-4 space-y-4 shadow-2xl font-mono text-xs text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-yellow-400 text-black flex items-center justify-center font-extrabold rounded-xs">
            <BrainCircuit className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-white uppercase tracking-wider text-xs">
                Deep Learning Price Prediction (LSTM / Transformer)
              </h2>
              <span className="px-1.5 py-0.5 bg-yellow-400/10 text-yellow-400 border border-yellow-400/40 text-[9px] font-bold">
                MODEL V3.2
              </span>
            </div>
            <p className="text-[10px] text-zinc-400">
              Deret Waktu OHLCV Sequential Inference Engine &bull; {instrument.displaySymbol}
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={runPrediction}
          className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-[10px] uppercase border border-black flex items-center gap-1.5 cursor-pointer transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Analyzing...' : 'Run Neural Inference'}</span>
        </button>
      </div>

      {loading ? (
        <div className="h-44 flex flex-col items-center justify-center text-zinc-500 space-y-3">
          <Activity className="w-8 h-8 animate-pulse text-yellow-400" />
          <span className="text-[10px] uppercase tracking-widest animate-pulse">
            Mengolah Sequence Vector 20 Candle Terakhir...
          </span>
        </div>
      ) : prediction ? (
        <div className="space-y-4">
          {/* Main Prediction Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Direction */}
            <div className="bg-black border border-zinc-800 p-3 flex flex-col justify-between">
              <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">
                Arah Proyeksi (Direction)
              </span>
              <div className="flex items-center gap-2 my-1">
                {prediction.direction === 'BULLISH' ? (
                  <TrendingUp className="w-5 h-5 text-emerald-400 stroke-[2.5]" />
                ) : prediction.direction === 'BEARISH' ? (
                  <TrendingDown className="w-5 h-5 text-rose-400 stroke-[2.5]" />
                ) : (
                  <Activity className="w-5 h-5 text-yellow-400 stroke-[2.5]" />
                )}
                <span className={`text-base font-extrabold tracking-wider ${
                  prediction.direction === 'BULLISH' ? 'text-emerald-400' :
                  prediction.direction === 'BEARISH' ? 'text-rose-400' : 'text-yellow-400'
                }`}>
                  {prediction.direction}
                </span>
              </div>
              <span className="text-[9px] text-zinc-500">Estimasi Horizon: {prediction.expectedHorizon}</span>
            </div>

            {/* Target & Invalidation */}
            <div className="bg-black border border-zinc-800 p-3 flex flex-col justify-between">
              <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">
                Target Proyeksi & Invalidation
              </span>
              <div className="space-y-1 my-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <Target className="w-3 h-3" /> Target Price:
                  </span>
                  <span className="text-sm font-extrabold text-white font-mono">
                    ${prediction.targetPrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-rose-400 font-bold flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" /> Invalidation:
                  </span>
                  <span className="text-xs font-mono text-zinc-400">
                    ${prediction.stopInvalidation.toLocaleString()}
                  </span>
                </div>
              </div>
              <span className="text-[9px] text-zinc-500">Berdasarkan Vektor Volatilitas</span>
            </div>

            {/* Confidence Meter */}
            <div className="bg-black border border-zinc-800 p-3 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">
                  Model Confidence
                </span>
                <span className="text-xs font-extrabold text-yellow-400">{prediction.confidenceScore}%</span>
              </div>
              <div className="my-2 space-y-1">
                <div className="w-full h-2.5 bg-zinc-900 border border-zinc-800 rounded-xs overflow-hidden">
                  <div
                    style={{ width: `${prediction.confidenceScore}%` }}
                    className={`h-full transition-all duration-700 ${
                      prediction.confidenceScore >= 75 ? 'bg-emerald-400' : 'bg-yellow-400'
                    }`}
                  />
                </div>
              </div>
              <span className="text-[9px] text-zinc-500 truncate">Source: {source}</span>
            </div>
          </div>

          {/* Model Narrative Analysis */}
          <div className="p-3 bg-black border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-1.5">
              <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Analisis Vektor Time-Series
              </span>
              <div className="flex gap-1.5">
                {(prediction.patternsDetected || []).map((pat, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-zinc-900 border border-zinc-700 text-zinc-300 text-[9px] font-bold">
                    {pat}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
              {prediction.modelAnalysis}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 text-zinc-500">
          Klik "Run Neural Inference" untuk memulai prediksi deret waktu.
        </div>
      )}
    </div>
  );
};
