import React, { useState, useMemo } from 'react';
import { Instrument, Candle, AssetCategory } from '../types/market';
import { Search, ExternalLink, TrendingUp, TrendingDown, BarChart2, LayoutGrid, Table, Activity } from 'lucide-react';
import { MarketHeatmap } from './MarketHeatmap';

export const ScreenerView: React.FC<{
  instruments: Instrument[];
  candlesBySymbol: Record<string, Candle[]>;
  onJumpToChart: (symbol: string) => void;
  onJumpToFundamental: (symbol: string) => void;
}> = ({ instruments, onJumpToChart, onJumpToFundamental }) => {
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'heatmap' | 'table'>('heatmap');

  const categories: { id: AssetCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'Semua Aset' },
    { id: 'commodities', label: 'Komoditi & Emas' },
    { id: 'crypto', label: 'Crypto' },
    { id: 'forex', label: 'Forex' },
    { id: 'us_stocks', label: 'Saham US' },
    { id: 'idx_stocks', label: 'Saham IDX' },
  ];

  const filteredInstruments = useMemo(() => {
    return instruments.filter((inst) => {
      const matchesCategory = selectedCategory === 'all' || inst.category === selectedCategory;
      const matchesSearch =
        inst.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inst.displaySymbol.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [instruments, selectedCategory, searchQuery]);

  // Market Breadth Stats
  const stats = useMemo(() => {
    let advancers = 0;
    let decliners = 0;
    let unchanged = 0;
    filteredInstruments.forEach((i) => {
      if (i.changePercent24h > 0.05) advancers++;
      else if (i.changePercent24h < -0.05) decliners++;
      else unchanged++;
    });
    return { advancers, decliners, unchanged, total: filteredInstruments.length };
  }, [filteredInstruments]);

  return (
    <div className="space-y-6">
      {/* Header, Controls & Mode Toggle */}
      <div className="bg-[#111722] p-5 border border-slate-800 rounded-lg shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <h1 className="text-xl font-bold text-white tracking-wide font-mono uppercase">
                Screener & Visualizer Pasar
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Terminal pemindai multi-aset institusional: Market Heatmap interaktif dan Tabel Real-time.
            </p>
          </div>

          {/* View Mode Switcher + Search */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Heatmap / Table Toggle */}
            <div className="flex items-center bg-[#0B0F17] p-1 border border-slate-800 rounded-lg">
              <button
                onClick={() => setViewMode('heatmap')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-bold transition-all ${
                  viewMode === 'heatmap'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Market Heatmap</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-bold transition-all ${
                  viewMode === 'table'
                    ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span>Tabel Screener</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Cari simbol / nama aset..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0B0F17] border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Market Breadth & Category Filter */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded text-xs font-mono transition-all whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-slate-700 text-white font-bold border border-slate-600 shadow'
                    : 'bg-[#0B0F17] border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Quick Breadth Snapshot */}
          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <TrendingUp className="w-3.5 h-3.5" /> {stats.advancers} Naik
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1 text-rose-400 font-bold">
              <TrendingDown className="w-3.5 h-3.5" /> {stats.decliners} Turun
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">
              {stats.unchanged} Flat ({stats.total} Total)
            </span>
          </div>
        </div>
      </div>

      {/* Main View Area: Market Heatmap or Table */}
      {viewMode === 'heatmap' ? (
        <MarketHeatmap
          instruments={filteredInstruments}
          onJumpToChart={onJumpToChart}
          onJumpToFundamental={onJumpToFundamental}
        />
      ) : (
      <div className="bg-[#111722] border border-slate-800 rounded-lg overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-[#0B0F17] border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                <th className="p-3.5">Simbol</th>
                <th className="p-3.5">Nama Aset</th>
                <th className="p-3.5">Kategori</th>
                <th className="p-3.5 text-right">Harga Terakhir</th>
                <th className="p-3.5 text-right">Perubahan 24h</th>
                <th className="p-3.5 text-right">Volume 24h</th>
                <th className="p-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {filteredInstruments.map((inst) => {
                const isUp = inst.changePercent24h >= 0;
                return (
                  <tr key={inst.symbol} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-bold text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 text-[10px]">
                        {inst.displaySymbol.slice(0, 3)}
                      </div>
                      <span>{inst.displaySymbol}</span>
                    </td>
                    <td className="p-3.5 font-sans text-slate-300">{inst.name}</td>
                    <td className="p-3.5 uppercase tracking-wider text-[10px] text-slate-400 font-bold">
                      {inst.category.replace('_', ' ')}
                    </td>
                    <td className="p-3.5 text-right font-bold text-white">
                      {inst.price.toLocaleString(undefined, { minimumFractionDigits: inst.decimals })}
                    </td>
                    <td className={`p-3.5 text-right font-bold flex items-center justify-end gap-1 ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      <span>{isUp ? `+${inst.changePercent24h.toFixed(2)}%` : `${inst.changePercent24h.toFixed(2)}%`}</span>
                    </td>
                    <td className="p-3.5 text-right text-slate-300">
                      {(inst.volume24h / 1000000).toFixed(2)}M
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onJumpToChart(inst.symbol)}
                          title="Buka di Chart"
                          className="p-1.5 rounded bg-blue-600/20 border border-blue-500/40 text-blue-400 hover:bg-blue-600 hover:text-white transition-colors"
                        >
                          <BarChart2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onJumpToFundamental(inst.symbol)}
                          title="Analisis Fundamental"
                          className="p-1.5 rounded bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredInstruments.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Tidak ada instrumen yang cocok dengan pencarian Anda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}
    </div>
  );
};
