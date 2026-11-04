import React, { useState } from 'react';
import { EconomicEvent } from '../types/market';
import {
  Calendar,
  Flame,
  Clock,
} from 'lucide-react';
import { FomcSchedulePanel } from './FomcSchedulePanel';
import { TradingViewCalendarWidget } from './TradingViewCalendarWidget';

export const EconomicCalendarView: React.FC<{
  events: EconomicEvent[];
  onSimulateRelease?: (eventId: string) => void;
  onJumpToAsset: (symbol: string) => void;
  onJumpToMacroFormula?: () => void;
  initialTab?: 'calendar' | 'fomc';
}> = ({ events, onJumpToAsset, onJumpToMacroFormula, initialTab = 'calendar' }) => {
  const [activeTab, setActiveTab] = useState<'calendar' | 'fomc'>(initialTab);
  const [impactFilter, setImpactFilter] = useState<string>('-1,0,1');

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
            <span className="text-amber-300 font-bold">27-28 Okt 2026</span>
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
          <span>Kalender Ekonomi (TradingView)</span>
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
        </button>
      </div>

      {/* Tab 2: Dedicated FOMC Schedule Panel */}
      {activeTab === 'fomc' && (
        <FomcSchedulePanel
          onJumpToAsset={onJumpToAsset}
          onJumpToMacroFormula={onJumpToMacroFormula}
        />
      )}

      {/* Tab 1: TradingView Economic Calendar Widget */}
      {activeTab === 'calendar' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-1 bg-[#111722] border border-slate-800 rounded-lg max-w-fit font-mono text-[10px]">
            <span className="text-slate-400 px-2">Filter Dampak:</span>
            {[
              { label: 'Semua', val: '-1,0,1' },
              { label: 'High/Med', val: '0,1' },
              { label: 'High Only', val: '1' },
            ].map((f) => (
              <button
                key={f.label}
                onClick={() => setImpactFilter(f.val)}
                className={`px-3 py-1 rounded transition-colors ${impactFilter === f.val ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="bg-[#111722] p-5 rounded-xl border border-slate-800 shadow-xl">
            <TradingViewCalendarWidget importanceFilter={impactFilter} />
          </div>
        </div>
      )}
    </div>
  );
};
