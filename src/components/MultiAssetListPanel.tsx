import React, { useState } from 'react';
import { Instrument } from '../types/market';
import { RecentTickInfo } from '../hooks/useRealTimeMarket';
import {
  Search,
  TrendingUp,
  TrendingDown,
  Layers,
  ArrowRight,
  Filter,
  BarChart2,
  CheckCircle,
  ShieldCheck,
  Globe2,
} from 'lucide-react';

export const MultiAssetListPanel: React.FC<{
  instruments: Instrument[];
  selectedSymbol: string;
  onSelectSymbol: (symbol: string) => void;
  recentTicks?: Record<string, RecentTickInfo>;
}> = ({ instruments, selectedSymbol, onSelectSymbol, recentTicks = {} }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'all', label: 'Semua' },
    { id: 'crypto', label: 'Crypto' },
    { id: 'forex-major', label: 'FX Major' },
    { id: 'forex-minor', label: 'FX Minor' },
    { id: 'forex-exotic', label: 'FX Exotic' },
    { id: 'commodities', label: 'Komoditi' },
    { id: 'us_stocks', label: 'Saham US' },
    { id: 'idx_stocks', label: 'Saham IDX' },
  ];

  const getSourceLabel = (inst: Instrument) => {
    if (inst.binanceSymbol) return 'Binance Spot v3 (Live)';
    if (inst.category === 'forex') return 'OpenER API / ECB';
    if (inst.category === 'commodities') return 'COMEX / NYMEX Spot';
    if (inst.category === 'us_stocks') return 'NASDAQ / SEC 10-Q';
    if (inst.category === 'idx_stocks') return 'Bursa Efek Indonesia (IDX)';
    return 'Interbank Spot';
  };

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

  // Calculate Market Breadth Stats
  const bullishCount = instruments.filter((i) => i.changePercent24h >= 0).length;
  const bearishCount = instruments.length - bullishCount;
  const avgChange =
    instruments.reduce((acc, i) => acc + i.changePercent24h, 0) / (instruments.length || 1);

  return (
    <div className="bg-[#111722] p-5 border border-slate-800 rounded-lg space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-400" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide">Daftar Multi Aset Pasar</h3>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5" /> DATA NYATA
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Monitoring harga live, spread, dan performa 24 jam lintas kategori
            </p>
          </div>
        </div>

        {/* Market Breadth Pill Bar */}
        <div className="flex items-center gap-2 text-[11px] font-mono">
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            ▲ {bullishCount} Bullish
          </span>
          <span className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400">
            ▼ {bearishCount} Bearish
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hidden sm:inline-block">
            Avg: {avgChange >= 0 ? '+' : ''}
            {avgChange.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Provenance Barometer Banner */}
      <div className="p-2.5 rounded bg-[#0B0F17] border border-slate-800 text-[11px] font-mono text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-300 font-semibold">Sumber Resmi:</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-800/80 text-cyan-300">Binance Spot v3 (Crypto & Gold)</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-800/80 text-emerald-300">OpenER API (Forex Majors/Exotics)</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-800/80 text-amber-300">SEC EDGAR (US)</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-800/80 text-indigo-300">Bursa Efek Indonesia (IDX)</span>
        </div>
        <span className="text-emerald-400 text-[10px]">● Tanpa Data Mock</span>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-[#0B0F17] text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[180px]">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari aset atau simbol..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0B0F17] border border-slate-800 text-white placeholder-slate-500 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Instruments List / Table */}
      <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
        {filteredInstruments.map((inst) => {
          const isSelected = inst.symbol === selectedSymbol;
          const isUp = inst.changePercent24h >= 0;
          const recent = recentTicks[inst.symbol];
          const hasRecentTick = recent && Date.now() - recent.timestamp < 1500;
          const source = getSourceLabel(inst);

          // Format price display
          let formattedPrice = '';
          if (inst.currency === 'IDR') {
            formattedPrice = `Rp${inst.price.toLocaleString()}`;
          } else if (inst.currency === 'JPY') {
            formattedPrice = `¥${inst.price.toFixed(inst.decimals)}`;
          } else {
            formattedPrice = `$${inst.price.toLocaleString(undefined, {
              minimumFractionDigits: inst.decimals,
              maximumFractionDigits: inst.decimals,
            })}`;
          }

          // Format volume
          const formattedVol =
            inst.volume24h >= 1e9
              ? `${(inst.volume24h / 1e9).toFixed(1)}B`
              : inst.volume24h >= 1e6
              ? `${(inst.volume24h / 1e6).toFixed(1)}M`
              : inst.volume24h.toLocaleString();

          return (
            <div
              key={inst.symbol}
              onClick={() => onSelectSymbol(inst.symbol)}
              className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 text-xs ${
                isSelected
                  ? 'bg-blue-600/15 border-blue-500/60 shadow-md shadow-blue-500/10'
                  : 'bg-[#0B0F17] border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
              }`}
            >
              {/* Left Column: Symbol & Name */}
              <div className="flex items-center gap-2.5 min-w-[140px]">
                <div
                  className={`w-7 h-7 rounded flex items-center justify-center font-mono font-bold text-[10px] ${
                    isSelected
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {inst.displaySymbol.slice(0, 3)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-100">{inst.displaySymbol}</span>
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-800 text-slate-400 uppercase">
                      {inst.category === 'forex' ? 'FX' : inst.category.replace('_stocks', '')}
                    </span>
                    {isSelected && (
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        Aktif
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 truncate block max-w-[130px]">
                    {inst.name}
                  </span>
                  <span className="text-[9px] font-mono text-cyan-400/90 block">
                    {source}
                  </span>
                </div>
              </div>

              {/* Middle Column: 24h High/Low Range */}
              <div className="hidden md:flex flex-col min-w-[110px] text-[10px] font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>L: {inst.low24h}</span>
                  <span>H: {inst.high24h}</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                  <div
                    style={{
                      width: `${Math.max(
                        5,
                        Math.min(
                          95,
                          ((inst.price - inst.low24h) /
                            Math.max(0.0001, inst.high24h - inst.low24h)) *
                            100
                        )
                      )}%`,
                    }}
                    className={`h-full ${isUp ? 'bg-emerald-400' : 'bg-rose-400'}`}
                  />
                </div>
                <span className="text-slate-500 text-[9px] mt-0.5">Vol: {formattedVol}</span>
              </div>

              {/* Right Column: Price & 24h Change */}
              <div className="flex items-center gap-3">
                <div className="text-right font-mono">
                  <div
                    className={`font-bold transition-colors ${
                      hasRecentTick
                        ? recent.direction === 'up'
                          ? 'text-emerald-300'
                          : 'text-rose-300'
                        : 'text-white'
                    }`}
                  >
                    {formattedPrice}
                  </div>
                  <div
                    className={`text-[11px] font-semibold flex items-center justify-end gap-0.5 ${
                      isUp ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span>
                      {isUp ? '+' : ''}
                      {inst.changePercent24h.toFixed(2)}%
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  title="Pilih dan Tampilkan di Chart"
                  className={`p-1.5 rounded transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredInstruments.length === 0 && (
          <div className="text-center py-8 text-slate-400 text-xs font-mono">
            Tidak ada instrumen yang cocok dengan pencarian "{searchQuery}".
          </div>
        )}
      </div>
    </div>
  );
};
