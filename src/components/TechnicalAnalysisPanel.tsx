import React from 'react';
import { Instrument, Candle } from '../types/market';
import { evaluateTechnicalSummary } from '../utils/indicators';
import { Activity, CheckCircle2 } from 'lucide-react';

export const TechnicalAnalysisPanel: React.FC<{ instrument: Instrument; candles: Candle[] }> = ({ instrument, candles }) => {
    const summary = evaluateTechnicalSummary(candles, instrument.decimals);
    
    const isBullish = summary.overallRating.toLowerCase().includes('bullish') || summary.overallRating.toLowerCase().includes('strong buy') || summary.overallRating.toLowerCase().includes('buy');
    const isBearish = summary.overallRating.toLowerCase().includes('bearish') || summary.overallRating.toLowerCase().includes('strong sell') || summary.overallRating.toLowerCase().includes('sell');

    return (
        <div className="bg-[#111722] p-5 border border-slate-800 rounded-lg space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-400" />
                    <h3 className="text-sm font-bold text-white tracking-wide">Ringkasan Analisis Teknikal</h3>
                </div>
                <span className={`px-2.5 py-1 text-xs font-mono font-bold rounded ${
                    isBullish ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    isBearish ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                    'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                    {summary.overallRating}
                </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-[#0B0F17] p-3 rounded border border-slate-800">
                    <div className="text-[11px] font-mono text-slate-400 uppercase">Buy Signals</div>
                    <div className="text-lg font-bold font-mono text-emerald-400 mt-1">{summary.buyCount}</div>
                </div>
                <div className="bg-[#0B0F17] p-3 rounded border border-slate-800">
                    <div className="text-[11px] font-mono text-slate-400 uppercase">Neutral</div>
                    <div className="text-lg font-bold font-mono text-amber-400 mt-1">{summary.neutralCount}</div>
                </div>
                <div className="bg-[#0B0F17] p-3 rounded border border-slate-800">
                    <div className="text-[11px] font-mono text-slate-400 uppercase">Sell Signals</div>
                    <div className="text-lg font-bold font-mono text-rose-400 mt-1">{summary.sellCount}</div>
                </div>
            </div>

            <div>
                <h4 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-2.5">Detail Indikator Utama</h4>
                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                    {summary.readings.map((r, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 bg-[#0B0F17] rounded border border-slate-800/80 text-xs">
                            <div>
                                <span className="font-mono font-semibold text-slate-200">{r.name}</span>
                                <span className="text-slate-400 font-mono ml-2">({r.formattedValue})</span>
                            </div>
                            <span className={`px-2 py-0.5 font-mono text-[10px] font-bold rounded ${
                                r.action.toLowerCase().includes('buy') ? 'bg-emerald-500/20 text-emerald-300' :
                                r.action.toLowerCase().includes('sell') ? 'bg-rose-500/20 text-rose-300' :
                                'bg-slate-800 text-slate-300'
                            }`}>
                                {r.action}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded text-xs text-slate-300 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                    <span className="font-semibold text-white">Rekomendasi Algoritma: </span>
                    {isBullish ? 'Momentum tren naik mendominasi. Perhatikan area Support dan S&D Demand zone terdekat untuk entry buy.' :
                     isBearish ? 'Tekanan jual mendominasi. Waspadai breakdown support atau manfaatkan S&D Supply zone untuk entry sell.' :
                     'Pasar dalam fase konsolidasi/sideways. Tunggu breakout konfirmasi pada timeframe yang dipilih.'}
                </div>
            </div>

            <div className="p-2.5 rounded bg-[#0B0F17] border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                <span>Sumber Data: Formula Standar TA (Wilder's RSI, MACD 12/26, SMA/EMA)</span>
                <span className="text-emerald-400">● 100% Data Live</span>
            </div>
        </div>
    );
};
