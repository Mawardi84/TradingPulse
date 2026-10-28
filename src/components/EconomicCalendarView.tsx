import React, { useState } from 'react';
import { EconomicEvent } from '../types/market';
import {
  Calendar,
  Filter,
  Clock,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Activity,
  Zap,
  Play,
  Flame,
  Landmark,
} from 'lucide-react';
import { FomcSchedulePanel } from './FomcSchedulePanel';

export const EconomicCalendarView: React.FC<{
  events: EconomicEvent[];
  onSimulateRelease: (eventId: string) => void;
  onJumpToAsset: (symbol: string) => void;
  onJumpToMacroFormula?: () => void;
  initialTab?: 'calendar' | 'fomc';
}> = ({ events, onJumpToAsset, onJumpToMacroFormula, initialTab = 'calendar' }) => {
  const [activeTab, setActiveTab] = useState<'calendar' | 'fomc'>(initialTab);
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedImpact, setSelectedImpact] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [simulatedEvent, setSimulatedEvent] = useState<EconomicEvent | null>(null);
  const [simulatedActual, setSimulatedActual] = useState<string>('');
  const [simulationResult, setSimulationResult] = useState<{
    surprise: number;
    sentiment: 'Hawkish / Bullish' | 'Dovish / Bearish' | 'Netral';
    recommendation: string;
  } | null>(null);

  const countryFlags: Record<string, string> = {
    US: '🇺🇸',
    EU: '🇪🇺',
    ID: '🇮🇩',
    JP: '🇯🇵',
    UK: '🇬🇧',
    CN: '🇨🇳',
  };

  const filteredEvents = events.filter((ev) => {
    const matchCountry = selectedCountry === 'all' || ev.countryCode === selectedCountry;
    const matchImpact = selectedImpact === 'all' || ev.impact === selectedImpact;
    const matchCategory = selectedCategory === 'all' || ev.category === selectedCategory;
    return matchCountry && matchImpact && matchCategory;
  });

  const handleOpenSimulate = (ev: EconomicEvent) => {
    setSimulatedEvent(ev);
    setSimulatedActual(ev.actual || ev.forecast.replace('%', ''));
    setSimulationResult(null);
  };

  const handleRunSimulation = () => {
    if (!simulatedEvent) return;
    const actualNum = parseFloat(simulatedActual) || 0;
    const forecastNum = parseFloat(simulatedEvent.forecast) || 0;
    const diff = actualNum - forecastNum;

    let sentiment: 'Hawkish / Bullish' | 'Dovish / Bearish' | 'Netral' = 'Netral';
    let recommendation = '';

    if (simulatedEvent.category === 'Inflation' || simulatedEvent.category === 'Employment') {
      if (diff > 0.1) {
        sentiment = 'Hawkish / Bullish';
        recommendation = `Aktual lebih tinggi (+${diff.toFixed(2)}) dari konsensus. Mengindikasikan tekanan hawkish bagi bank sentral, mendukung penguatan Dolar (${simulatedEvent.currency}) dan menekan aset risiko & emas.`;
      } else if (diff < -0.1) {
        sentiment = 'Dovish / Bearish';
        recommendation = `Aktual lebih rendah (${diff.toFixed(2)}) dari konsensus. Memberi ruang pelonggaran moneter / rate cut, mendukung penguatan emas dan reli indeks saham.`;
      } else {
        recommendation = `Hasil sejalan dengan konsensus pasar (${simulatedEvent.forecast}). Volatilitas pasar diperkirakan terbatas.`;
      }
    } else {
      if (diff > 0.1) {
        sentiment = 'Hawkish / Bullish';
        recommendation = `Indikator melampaui estimasi pasar. Mengindikasikan dorongan penguatan suku bunga bagi ${simulatedEvent.currency}.`;
      } else if (diff < -0.1) {
        sentiment = 'Dovish / Bearish';
        recommendation = `Indikator di bawah ekspektasi pasar. Risiko perlambatan meningkat.`;
      } else {
        recommendation = `Data netral sesuai perkiraan analis konsensus.`;
      }
    }

    setSimulationResult({
      surprise: diff,
      sentiment,
      recommendation,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Navigation & Quick FOMC Countdown Pill */}
      <div className="bg-[#111722] p-5 sm:p-6 border border-slate-800 rounded-2xl shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-400">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-wide">
                Kalender Ekonomi Makro & Jadwal Rapat FOMC
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-800">
                PRO-FEED
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Jadwal rilis resmi indikator ekonomi berdampak tinggi (PCE, CPI, NFP, GDP, Keputusan Suku Bunga) beserta jadwal lengkap rapat Federal Reserve (FOMC).
            </p>
          </div>
        </div>

        {/* Quick Shortcut Buttons & Indicators */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab('fomc')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border transition-all text-xs font-mono ${
              activeTab === 'fomc'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-lg shadow-amber-500/10 font-bold'
                : 'bg-[#0B0F17] hover:bg-slate-800/80 text-slate-300 border-amber-500/30 hover:border-amber-500/60'
            }`}
            title="Klik untuk melihat Jadwal Lengkap Rapat FOMC"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="text-slate-400">Rapat FOMC Terdekat:</span>
            <span className="text-amber-300 font-bold">4-5 Nov 2026</span>
            <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.2 rounded font-sans font-bold">
              Cut 25 bps (94.8%)
            </span>
          </button>

          <div className="hidden sm:flex items-center gap-1.5 bg-[#0B0F17] px-3 py-2 rounded-xl border border-slate-800 font-mono text-xs text-slate-400">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Zona: <strong className="text-white">WIB (UTC+7)</strong></span>
          </div>
        </div>
      </div>

      {/* Primary Tab Switcher */}
      <div className="flex items-center gap-2 p-1.5 bg-[#111722] border border-slate-800 rounded-xl max-w-fit font-mono text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('calendar')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
            activeTab === 'calendar'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Kalender Rilis Indikator Ekonomi ({events.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('fomc')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
            activeTab === 'fomc'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Flame className="w-4 h-4 text-amber-400" />
          <span>Jadwal Rapat FOMC & FedWatch</span>
          <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[10px] hidden sm:inline">
            Rapat 4-5 Nov 2026
          </span>
        </button>
      </div>

      {/* Tab 2: Dedicated FOMC Schedule Panel */}
      {activeTab === 'fomc' && (
        <FomcSchedulePanel
          onJumpToAsset={onJumpToAsset}
          onJumpToMacroFormula={onJumpToMacroFormula}
        />
      )}

      {/* Tab 1: Standard Macro Economic Calendar Table & Filters */}
      {activeTab === 'calendar' && (
        <div className="space-y-6">
          {/* Official Data Source Provenance Banner */}
          <div className="p-3 bg-[#0B0F17] border border-slate-800 rounded-xl text-xs font-mono text-slate-300 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-white">Sumber Rilis Makro Terverifikasi:</span>
              <span className="text-slate-400">
                Federal Reserve Board (FOMC) • U.S. Bureau of Labor Statistics (BLS) • Badan Pusat Statistik (BPS) RI • Bank Indonesia • Eurostat • Bank of Japan
              </span>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold">● Data Pemerintah & Bank Sentral Resmi</span>
          </div>

          {/* Filters Bar */}
          <div className="bg-[#111722] p-4 border border-slate-800 rounded-xl space-y-3">
            {/* Filter Negara */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-400 mr-2 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Negara:
              </span>
              {[
                { id: 'all', label: 'Semua Negara' },
                { id: 'US', label: '🇺🇸 US' },
                { id: 'EU', label: '🇪🇺 Eurozone' },
                { id: 'ID', label: '🇮🇩 Indonesia' },
                { id: 'JP', label: '🇯🇵 Jepang' },
                { id: 'UK', label: '🇬🇧 UK' },
                { id: 'CN', label: '🇨🇳 China' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCountry(c.id)}
                  className={`px-3 py-1 rounded text-xs font-medium font-mono transition-colors ${
                    selectedCountry === c.id
                      ? 'bg-blue-600 text-white shadow'
                      : 'bg-[#0B0F17] border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Filter Kategori */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
              <span className="text-xs font-mono font-bold text-slate-400 mr-2">Kategori:</span>
              {[
                { id: 'all', label: 'Semua Kategori' },
                { id: 'Central Bank', label: '🏛️ Central Bank & FOMC' },
                { id: 'Inflation', label: '📈 Inflasi (CPI/PCE)' },
                { id: 'Employment', label: '👥 Ketenagakerjaan (NFP)' },
                { id: 'GDP & Growth', label: '📊 GDP & Pertumbuhan' },
                { id: 'PMI & Manufacturing', label: '🏭 PMI Manufaktur' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1 rounded text-xs font-medium font-mono transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-blue-600 text-white shadow'
                      : 'bg-[#0B0F17] border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Filter Dampak */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
              <span className="text-xs font-mono font-bold text-slate-400 mr-2">Dampak:</span>
              {[
                { id: 'all', label: 'Semua Dampak' },
                { id: 'High', label: '🔴 High Impact' },
                { id: 'Medium', label: '🟠 Medium' },
                { id: 'Low', label: '🟡 Low' },
              ].map((imp) => (
                <button
                  key={imp.id}
                  type="button"
                  onClick={() => setSelectedImpact(imp.id)}
                  className={`px-3 py-1 rounded text-xs font-medium font-mono transition-colors ${
                    selectedImpact === imp.id
                      ? 'bg-blue-600 text-white shadow'
                      : 'bg-[#0B0F17] border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {imp.label}
                </button>
              ))}
            </div>
          </div>

          {/* Events Table */}
          <div className="bg-[#111722] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="bg-[#0B0F17] border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                    <th className="p-3.5">Waktu (WIB)</th>
                    <th className="p-3.5">Negara</th>
                    <th className="p-3.5">Dampak</th>
                    <th className="p-3.5">Indikator Ekonomi</th>
                    <th className="p-3.5 text-right">Aktual</th>
                    <th className="p-3.5 text-right">Forecast</th>
                    <th className="p-3.5 text-right">Sebelumnya</th>
                    <th className="p-3.5">Aset Terpengaruh</th>
                    <th className="p-3.5 text-center">Simulasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-200">
                  {filteredEvents.map((ev) => {
                    const isHigh = ev.impact === 'High';
                    const hasActual = ev.actual !== null;
                    const isFomc = ev.id.includes('fomc') || ev.event.includes('FOMC');

                    return (
                      <tr
                        key={ev.id}
                        className={`transition-colors ${
                          isFomc
                            ? 'bg-amber-500/5 hover:bg-amber-500/10 border-l-2 border-l-amber-500'
                            : 'hover:bg-slate-800/40'
                        }`}
                      >
                        <td className="p-3.5 whitespace-nowrap text-slate-300 font-bold">
                          {ev.timeWIB}
                          <div className="text-[10px] text-slate-500 font-normal">{ev.dateLabel}</div>
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-bold">
                            <span>{countryFlags[ev.countryCode] || '🌐'}</span>
                            <span>{ev.currency}</span>
                          </div>
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isHigh
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : ev.impact === 'Medium'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {ev.impact}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{ev.event}</span>
                            {isFomc && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                FOMC
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-cyan-400 font-mono">
                            Sumber: {ev.countryCode === 'US' ? (ev.category === 'Employment' ? 'U.S. Bureau of Labor Statistics (BLS)' : ev.category === 'Central Bank' ? 'Federal Reserve / FOMC' : 'U.S. Bureau of Economic Analysis (BEA)') : ev.countryCode === 'ID' ? (ev.category === 'Central Bank' ? 'Bank Indonesia (RDG BI)' : 'Badan Pusat Statistik (BPS) RI') : ev.countryCode === 'EU' ? 'Eurostat / ECB' : ev.countryCode === 'JP' ? 'Bank of Japan / MoF' : 'Office for National Statistics (ONS)'}
                          </div>
                          <div className="text-slate-400 text-[11px] font-sans line-clamp-1">{ev.analysisSummary}</div>
                        </td>
                        <td className="p-3.5 text-right font-bold">
                          {hasActual ? (
                            <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                              {ev.actual}
                            </span>
                          ) : (
                            <span className="text-slate-500">Menunggu</span>
                          )}
                        </td>
                        <td className="p-3.5 text-right text-slate-300">{ev.forecast}</td>
                        <td className="p-3.5 text-right text-slate-400">{ev.previous}</td>
                        <td className="p-3.5">
                          <div className="flex flex-wrap gap-1">
                            {ev.affectedAssets.map((sym) => (
                              <button
                                key={sym}
                                type="button"
                                onClick={() => onJumpToAsset(sym)}
                                className="px-1.5 py-0.5 bg-blue-600/20 hover:bg-blue-600 hover:text-white text-blue-400 text-[10px] rounded transition-colors"
                              >
                                {sym}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleOpenSimulate(ev)}
                            className="px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/40 rounded transition-colors text-[11px] font-bold flex items-center gap-1 mx-auto"
                          >
                            <Zap className="w-3 h-3" />
                            <span>Simulasi</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Simulation Modal */}
      {simulatedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#111722] border border-slate-700 rounded-xl p-6 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">Simulator Rilis Makro Kuantitatif</h3>
              </div>
              <button
                type="button"
                onClick={() => setSimulatedEvent(null)}
                className="text-slate-400 hover:text-white font-mono text-sm"
              >
                ✕ Tutup
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-[#0B0F17] rounded border border-slate-800">
                <div className="text-slate-400">Indikator:</div>
                <div className="text-white font-bold text-sm mt-0.5">{simulatedEvent.event} ({simulatedEvent.currency})</div>
                <div className="flex justify-between mt-2 pt-2 border-t border-slate-800/80 text-[11px]">
                  <span>Konsensus Forecast: <strong className="text-blue-400">{simulatedEvent.forecast}</strong></span>
                  <span>Sebelumnya: <strong className="text-slate-400">{simulatedEvent.previous}</strong></span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Input Nilai Aktual Simulasi ({simulatedEvent.unit}):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={simulatedActual}
                    onChange={(e) => setSimulatedActual(e.target.value)}
                    placeholder="e.g. 2.9"
                    className="flex-1 bg-[#0B0F17] border border-slate-700 rounded p-2 text-white font-mono text-sm focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleRunSimulation}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Hitung Dampak</span>
                  </button>
                </div>
              </div>

              {simulationResult && (
                <div className="p-4 bg-[#0B0F17] border border-blue-500/30 rounded-lg space-y-2 mt-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Deviasi Surprise:</span>
                    <span className={`font-bold ${simulationResult.surprise >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {simulationResult.surprise >= 0 ? `+${simulationResult.surprise.toFixed(2)}` : simulationResult.surprise.toFixed(2)} {simulatedEvent.unit}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Sentimen Pasar:</span>
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded font-bold">
                      {simulationResult.sentiment}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-300 leading-relaxed font-sans">
                    {simulationResult.recommendation}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
