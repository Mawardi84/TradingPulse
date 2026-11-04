import React, { useState } from 'react';
import { EconomicEvent } from '../types/market';
import {
  Calendar,
  Flame,
  Clock,
} from 'lucide-react';
import { FomcSchedulePanel } from './FomcSchedulePanel';
import { TradingViewCalendarWidget } from './TradingViewCalendarWidget';
import { getNextUpcomingFomcMeeting } from '../data/fomcScheduleData';

export const EconomicCalendarView: React.FC<{
  events: EconomicEvent[];
  onSimulateRelease?: (eventId: string) => void;
  onJumpToAsset: (symbol: string) => void;
  onJumpToMacroFormula?: () => void;
  initialTab?: 'calendar' | 'fomc';
}> = ({ onJumpToAsset, onJumpToMacroFormula, initialTab = 'calendar' }) => {
  const [activeTab, setActiveTab] = useState<'calendar' | 'fomc'>(initialTab);
  const [impactFilter, setImpactFilter] = useState<string>('-1,0,1');

  // Dynamic next upcoming meeting based on real-time clock
  const nextMeeting = getNextUpcomingFomcMeeting();

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Top Banner with Navigation & Quick FOMC Countdown Pill */}
      <div className="bg-black p-4 border border-white flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-400 text-black font-bold">
            <Calendar className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                Kalender Ekonomi Makro & Jadwal Rapat FOMC
              </h1>
              <span className="px-1.5 py-0.2 text-[9px] font-bold bg-yellow-400 text-black">
                LIVE PRO-FEED
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Jadwal rilis resmi indikator ekonomi berdampak tinggi (PCE, CPI, NFP, GDP, Keputusan Suku Bunga) beserta jadwal lengkap rapat Federal Reserve (FOMC).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab('fomc')}
            className={`flex items-center gap-2 px-3 py-1.5 border transition-all text-xs font-bold uppercase cursor-pointer ${
              activeTab === 'fomc'
                ? 'bg-yellow-400 text-black border-black font-extrabold shadow-lg'
                : 'bg-zinc-950 hover:bg-zinc-900 text-yellow-400 border-yellow-400'
            }`}
            title="Klik untuk melihat Jadwal Lengkap Rapat FOMC"
          >
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
            <span className="text-zinc-300">Rapat FOMC Terdekat:</span>
            <span className="underline font-extrabold">{nextMeeting.meetingDates}</span>
          </button>

          <div className="hidden sm:flex items-center gap-1.5 bg-zinc-950 px-2.5 py-1.5 border border-zinc-800 text-[11px] text-zinc-400">
            <Clock className="w-3.5 h-3.5 text-yellow-400" />
            <span>Zona: <strong className="text-white">WIB (UTC+7)</strong></span>
          </div>
        </div>
      </div>

      {/* Primary Tab Switcher */}
      <div className="flex items-center gap-0 border border-white bg-black max-w-fit text-[11px]">
        <button
          type="button"
          onClick={() => setActiveTab('calendar')}
          className={`flex items-center gap-1.5 px-3 py-1.5 font-bold uppercase transition-all border-r border-white cursor-pointer ${
            activeTab === 'calendar'
              ? 'bg-white text-black'
              : 'text-zinc-300 hover:bg-zinc-800'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Kalender Ekonomi (TradingView)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('fomc')}
          className={`flex items-center gap-1.5 px-3 py-1.5 font-bold uppercase transition-all cursor-pointer ${
            activeTab === 'fomc'
              ? 'bg-yellow-400 text-black font-extrabold'
              : 'text-zinc-300 hover:bg-zinc-800'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-yellow-400" />
          <span>Jadwal Rapat FOMC & CME FedWatch</span>
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
        <div className="space-y-3">
          <div className="flex items-center border border-white p-0 bg-black max-w-fit text-[10px]">
            <span className="text-yellow-400 px-2 font-bold uppercase">Filter Dampak:</span>
            {[
              { label: 'Semua', val: '-1,0,1' },
              { label: 'High/Med', val: '0,1' },
              { label: 'High Only', val: '1' },
            ].map((f) => (
              <button
                key={f.label}
                onClick={() => setImpactFilter(f.val)}
                className={`px-2.5 py-1 font-bold border-l border-white uppercase transition-colors cursor-pointer ${
                  impactFilter === f.val ? 'bg-white text-black' : 'text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="bg-black p-3 border border-white shadow-xl">
            <TradingViewCalendarWidget importanceFilter={impactFilter} />
          </div>
        </div>
      )}
    </div>
  );
};
