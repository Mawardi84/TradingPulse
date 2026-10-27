import React, { useState } from 'react';
import { Instrument } from '../types/market';
import { Search, TrendingUp, TrendingDown, Radio, Activity } from 'lucide-react';
import { RecentTickInfo, ConnectionStatus } from '../hooks/useRealTimeMarket';

export const WatchlistTickerBar: React.FC<{
  instruments: Instrument[];
  selectedSymbol: string;
  onSelectSymbol: (symbol: string) => void;
  recentTicks?: Record<string, RecentTickInfo>;
  connectionStatus?: ConnectionStatus;
}> = ({
  instruments,
  selectedSymbol,
  onSelectSymbol,
  recentTicks = {},
  connectionStatus,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', label: 'Semua' },
    { id: 'forex-major', label: 'FX Major' },
    { id: 'forex-minor', label: 'FX Minor' },
    { id: 'forex-exotic', label: 'FX Exotic' },
    { id: 'commodities', label: 'Komoditi' },
    { id: 'crypto', label: 'Crypto' },
    { id: 'us_stocks', label: 'Saham US' },
    { id: 'idx_stocks', label: 'Saham IDX' },
  ];

  const filteredInstruments = instruments.filter((inst) => {
    let matchesCategory = false;
    if (selectedCategory === 'all') {
      matchesCategory = true;
    } else if (selectedCategory === 'commodities' && inst.category === 'commodities') {
      matchesCategory = true;
    } else if (selectedCategory === 'crypto' && inst.category === 'crypto') {
      matchesCategory = true;
    } else if (selectedCategory === 'us_stocks' && inst.category === 'us_stocks') {
      matchesCategory = true;
    } else if (selectedCategory === 'idx_stocks' && inst.category === 'idx_stocks') {
      matchesCategory = true;
    } else if (selectedCategory === 'forex-major') {
      matchesCategory =
        inst.category === 'forex' &&
        inst.fundamentals.industry.toLowerCase().includes('major');
    } else if (selectedCategory === 'forex-minor') {
      matchesCategory =
        inst.category === 'forex' &&
        inst.fundamentals.industry.toLowerCase().includes('minor');
    } else if (selectedCategory === 'forex-exotic') {
      matchesCategory =
        inst.category === 'forex' &&
        inst.fundamentals.industry.toLowerCase().includes('exotic');
    }

    const matchesSearch =
      inst.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.displaySymbol.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const now = Date.now();

  return (
    <div className="bg-[#111722] border border-slate-800 rounded-lg p-3 space-y-2.5 font-mono">
      {/* Category Pills, Live Stream Status & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-[#0B0F17] text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Live Stream Pulse Badge */}
          {connectionStatus && (
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded bg-[#0B0F17] border border-slate-800 text-[10px] text-slate-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-semibold text-emerald-400">REAL LIVE FEED</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400">{connectionStatus.tickCount.toLocaleString()} ticks</span>
              <span className="text-slate-500">|</span>
              <span className="text-cyan-400">{connectionStatus.ping}ms</span>
            </div>
          )}

          <div className="relative w-full sm:w-48 shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Cari aset..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0B0F17] border border-slate-800 rounded pl-7 pr-2.5 py-1 text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Horizontal Scrolling Watchlist Cards */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {filteredInstruments.map((inst) => {
          const isSelected = inst.symbol === selectedSymbol;
          const isUp = inst.changePercent24h >= 0;

          // Check if instrument received a live tick recently (< 700ms)
          const tick = recentTicks[inst.symbol];
          const isRecentlyTicked = tick && now - tick.timestamp < 700;
          const tickDir = tick?.direction;

          let cardStyle =
            'bg-[#0B0F17] border-slate-800/90 hover:border-slate-700 hover:bg-slate-800/40 text-white';

          if (isRecentlyTicked) {
            if (tickDir === 'up') {
              cardStyle =
                'bg-emerald-950/40 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.25)]';
            } else {
              cardStyle =
                'bg-rose-950/40 border-rose-500 text-rose-200 ring-1 ring-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.25)]';
            }
          } else if (isSelected) {
            cardStyle = 'bg-blue-600/20 border-blue-500 shadow-md ring-1 ring-blue-500/30 text-white';
          }

          // Calculate authentic spread for display
          const spreadPips =
            inst.category === 'crypto'
              ? inst.price * 0.0001
              : inst.category === 'forex'
              ? (inst.symbol.includes('JPY') ? 0.015 : inst.symbol.includes('IDR') ? 5 : 0.00012)
              : inst.price * 0.0002;

          return (
            <button
              key={inst.symbol}
              onClick={() => onSelectSymbol(inst.symbol)}
              className={`px-3 py-2 rounded border text-left flex items-center gap-3 shrink-0 transition-all duration-200 ${cardStyle}`}
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold">{inst.displaySymbol}</span>
                  <span className="text-[9px] uppercase px-1 py-0.2 bg-slate-800/80 text-slate-400 rounded">
                    {inst.category === 'forex'
                      ? inst.fundamentals.industry.includes('Major')
                        ? 'MAJ'
                        : inst.fundamentals.industry.includes('Minor')
                        ? 'MIN'
                        : 'EXO'
                      : inst.category.slice(0, 3)}
                  </span>
                  {isRecentlyTicked && (
                    <span
                      className={`inline-block w-1.5 h-1.5 rounded-full ${
                        tickDir === 'up' ? 'bg-emerald-400 animate-ping' : 'bg-rose-400 animate-ping'
                      }`}
                    />
                  )}
                </div>
                <div className="text-[10px] text-slate-400 font-sans truncate max-w-[100px]">
                  {inst.name}
                </div>
              </div>

              <div className="text-right">
                <div
                  className={`text-xs font-bold transition-colors ${
                    isRecentlyTicked
                      ? tickDir === 'up'
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                      : 'text-white'
                  }`}
                >
                  ${inst.price.toLocaleString(undefined, { minimumFractionDigits: inst.decimals, maximumFractionDigits: inst.decimals })}
                </div>
                <div
                  className={`text-[10px] font-bold flex items-center justify-end gap-0.5 ${
                    isUp ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isUp ? (
                    <TrendingUp className="w-2.5 h-2.5" />
                  ) : (
                    <TrendingDown className="w-2.5 h-2.5" />
                  )}
                  <span>
                    {isUp
                      ? `+${inst.changePercent24h.toFixed(2)}%`
                      : `${inst.changePercent24h.toFixed(2)}%`}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
