import React, { useState } from 'react';
import { EconomicEvent } from '../types/market';
import { Calendar, Filter, Clock, TrendingUp, TrendingDown, ArrowRight, Activity, Zap, Play } from 'lucide-react';

export const EconomicCalendarView: React.FC<{
  events: EconomicEvent[];
  onSimulateRelease: (eventId: string) => void;
  onJumpToAsset: (symbol: string) => void;
}> = ({ events, onJumpToAsset }) => {
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
        recommendation = `Indikator pertumbuhan melampaui estimasi pasar. Sentimen risk-on meningkat bagi mata uang domestik.`;
      } else if (diff < -0.1) {
        sentiment = 'Dovish / Bearish';
        recommendation = `Pertumbuhan di bawah perkiraan. Risiko kontraksi ekonomi meningkat.`;
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
      {/* Header Banner */}
      <div className="bg-[#111722] p-6 border border-slate-800 rounded-lg shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-400">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">Kalender Ekonomi Makro Global</h1>
            <p className="text-sm text-slate-400">
              Jadwal rilis indikator ekonomi berdampak tinggi (PCE, CPI, NFP, GDP, Keputusan Suku Bunga) beserta simulasi deviasi pasar.
            </p>
          </div>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-3 bg-[#0B0F17] px-4 py-2 rounded-lg border border-slate-800 font-mono text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Zona Waktu:</span>
            <span className="text-white font-bold">WIB (UTC+7)</span>
          </div>
          <div className="h-3 w-[1px] bg-slate-800" />
          <div className="text-slate-400">
            Total Agenda: <span className="text-blue-400 font-bold">{events.length}</span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-[#111722] p-4 border border-slate-800 rounded-lg space-y-3">
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
      <div className="bg-[#111722] border border-slate-800 rounded-lg overflow-hidden shadow-xl">
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

                return (
                  <tr key={ev.id} className="hover:bg-slate-800/40 transition-colors">
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
                      <div className="font-bold text-white">{ev.event}</div>
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
