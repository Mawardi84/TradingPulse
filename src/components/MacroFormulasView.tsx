import React, { useState } from 'react';
import { MACRO_FORMULAS, MacroFormulaItem } from '../utils/macroFormulas';
import { Calculator, BookOpen, ArrowRight, Activity, Cpu } from 'lucide-react';

export const MacroFormulasView: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState<string>('cpi');
  const [actualInput, setActualInput] = useState<string>('3.2');
  const [forecastInput, setForecastInput] = useState<string>('2.9');
  const [previousInput, setPreviousInput] = useState<string>('3.0');

  const item: MacroFormulaItem = MACRO_FORMULAS[selectedKey];
  const actNum = parseFloat(actualInput) || 0;
  const fcastNum = parseFloat(forecastInput) || 0;
  const prevNum = parseFloat(previousInput) || 0;

  const result = item.calculate(actNum, fcastNum, prevNum);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#111722] p-6 border border-slate-800 rounded-lg shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-400">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">Kalkulator & Rumus Kuantitatif Makroekonomi</h1>
            <p className="text-sm text-slate-400">
              Model kuantitatif matematis dan simulasi dampak pasar untuk PPI, CPI, NFP, FOMC, dan Yield Curve.
            </p>
          </div>
        </div>

        {/* Indicator Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-6">
          {Object.values(MACRO_FORMULAS).map((f) => (
            <button
              key={f.key}
              onClick={() => {
                setSelectedKey(f.key);
                // default sample inputs
                if (f.key === 'cpi') { setActualInput('3.2'); setForecastInput('2.9'); setPreviousInput('3.0'); }
                else if (f.key === 'ppi') { setActualInput('2.8'); setForecastInput('2.4'); setPreviousInput('2.2'); }
                else if (f.key === 'nfp') { setActualInput('275'); setForecastInput('190'); setPreviousInput('220'); }
                else if (f.key === 'fomc') { setActualInput('5.50'); setForecastInput('5.25'); setPreviousInput('5.25'); }
                else if (f.key === 'yield') { setActualInput('4.35'); setForecastInput('4.20'); setPreviousInput('4.15'); }
              }}
              className={`p-3 rounded-lg border text-left transition-all ${
                selectedKey === f.key
                  ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg'
                  : 'bg-[#0B0F17] border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="text-xs font-mono font-bold text-blue-400">{f.name}</div>
              <div className="text-xs text-slate-300 truncate mt-0.5">{f.name === 'Yield' ? 'US Treasury' : f.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Details & Interactive Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Formula Definition & Variables */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#111722] p-6 border border-slate-800 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-400" />
                {item.title}
              </h2>
              <span className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono rounded">
                Model: {item.name}
              </span>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              {item.description}
            </p>

            {/* Formula Box */}
            <div className="bg-[#0B0F17] p-4 rounded border border-slate-800 mb-6">
              <div className="text-xs text-slate-400 uppercase tracking-wider mb-1 font-mono">Rumus Matematis Kuantitatif:</div>
              <div className="text-lg font-mono font-bold text-amber-400 tracking-wide overflow-x-auto py-1">
                {item.formula}
              </div>
            </div>

            {/* Variables breakdown */}
            <h3 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-3">Definisi Variabel & Parameter</h3>
            <div className="space-y-2 mb-6">
              {item.variables.map((v, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 bg-[#0B0F17] rounded border border-slate-800/80 text-xs font-mono">
                  <span className="text-blue-300 font-bold">{v.symbol}</span>
                  <span className="text-slate-300 text-right">{v.meaning}</span>
                </div>
              ))}
            </div>

            {/* Market Impact */}
            <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
              <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1">Implikasi & Dampak Perdagangan (Market Impact):</div>
              <p className="text-sm text-slate-200 leading-relaxed">{item.marketImpact}</p>
            </div>
          </div>
        </div>

        {/* Right Col: Interactive Calculator & Live Simulation */}
        <div className="bg-[#111722] p-6 border border-slate-800 rounded-lg flex flex-col justify-between">
          <div>
            <h3 className="text-md font-bold text-white mb-4 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              Simulasi Data Kuantitatif
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Nilai Aktual (Actual)</label>
                <input
                  type="number"
                  step="0.01"
                  value={actualInput}
                  onChange={(e) => setActualInput(e.target.value)}
                  className="w-full bg-[#0B0F17] border border-slate-800 rounded p-2 text-white font-mono text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Konsensus / Forecast</label>
                <input
                  type="number"
                  step="0.01"
                  value={forecastInput}
                  onChange={(e) => setForecastInput(e.target.value)}
                  className="w-full bg-[#0B0F17] border border-slate-800 rounded p-2 text-white font-mono text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Periode Sebelumnya (Previous)</label>
                <input
                  type="number"
                  step="0.01"
                  value={previousInput}
                  onChange={(e) => setPreviousInput(e.target.value)}
                  className="w-full bg-[#0B0F17] border border-slate-800 rounded p-2 text-white font-mono text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Calculation Output Box */}
          <div className="mt-6 pt-4 border-t border-slate-800 space-y-3">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Deviasi Surprise:</span>
              <span className={`font-bold ${result.surprise >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {result.surprise > 0 ? `+${result.surprise.toFixed(2)}%` : `${result.surprise.toFixed(2)}%`}
              </span>
            </div>

            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Skor Sentimen:</span>
              <span className="text-amber-400 font-bold">{result.score.toFixed(1)}</span>
            </div>

            <div className="p-3 bg-[#0B0F17] rounded border border-slate-800 text-xs font-mono text-slate-300">
              <div className="text-slate-500 uppercase text-[10px] mb-1">Hasil Analisis Model:</div>
              <div className="font-semibold text-blue-300">{result.interpretation}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
