import React, { useState, useMemo } from 'react';
import { Instrument } from '../types/market';
import { formatInstrumentPrice } from '../utils/formatters';
import {
  TrendingUp,
  TrendingDown,
  BarChart2,
  ExternalLink,
  Layers,
  Filter,
  SlidersHorizontal,
  Flame,
  Info,
} from 'lucide-react';

interface MarketHeatmapProps {
  instruments: Instrument[];
  onJumpToChart: (symbol: string) => void;
  onJumpToFundamental: (symbol: string) => void;
}

export const MarketHeatmap: React.FC<MarketHeatmapProps> = ({
  instruments,
  onJumpToChart,
  onJumpToFundamental,
}) => {
  const [layoutMode, setLayoutMode] = useState<'grouped' | 'unified'>('grouped');
  const [sizeMetric, setSizeMetric] = useState<'volume' | 'equal'>('volume');
  const [hoveredSymbol, setHoveredSymbol] = useState<string | null>(null);

  // Group labels mapping
  const categoryNames: Record<string, string> = {
    commodities: 'Komoditi & Logam Mulia (Gold, Silver, Oil)',
    crypto: 'Aset Kripto (Layer 1, BTC, Altcoins)',
    forex: 'Valuta Asing (Forex Major, Minor & Exotic)',
    us_stocks: 'Ekuitas Global US (Mega-Cap Tech & S&P)',
    idx_stocks: 'Pasar Saham Domestik (IDX Bluechip)',
  };

  // Color generator based on institutional performance thresholds
  const getHeatmapColor = (changePercent: number) => {
    if (changePercent >= 3.0) {
      return {
        bg: 'bg-emerald-600',
        hoverBg: 'hover:bg-emerald-500',
        border: 'border-emerald-400',
        text: 'text-white',
        subText: 'text-emerald-100',
        tag: 'bg-emerald-800 text-emerald-100',
        intensity: 'Sangat Bullish',
      };
    }
    if (changePercent >= 1.5) {
      return {
        bg: 'bg-emerald-700',
        hoverBg: 'hover:bg-emerald-600',
        border: 'border-emerald-500',
        text: 'text-white',
        subText: 'text-emerald-200',
        tag: 'bg-emerald-900 text-emerald-200',
        intensity: 'Bullish Kuat',
      };
    }
    if (changePercent >= 0.2) {
      return {
        bg: 'bg-emerald-900/90',
        hoverBg: 'hover:bg-emerald-800',
        border: 'border-emerald-600',
        text: 'text-emerald-200',
        subText: 'text-emerald-300',
        tag: 'bg-emerald-950 text-emerald-300',
        intensity: 'Menguat Ringan',
      };
    }
    if (changePercent > -0.2) {
      return {
        bg: 'bg-zinc-900',
        hoverBg: 'hover:bg-zinc-800',
        border: 'border-zinc-700',
        text: 'text-zinc-200',
        subText: 'text-zinc-400',
        tag: 'bg-zinc-800 text-zinc-300',
        intensity: 'Netral / Flat',
      };
    }
    if (changePercent > -1.5) {
      return {
        bg: 'bg-rose-950',
        hoverBg: 'hover:bg-rose-900',
        border: 'border-rose-800',
        text: 'text-rose-200',
        subText: 'text-rose-300',
        tag: 'bg-rose-900/60 text-rose-300',
        intensity: 'Melemah Ringan',
      };
    }
    if (changePercent > -3.0) {
      return {
        bg: 'bg-rose-800',
        hoverBg: 'hover:bg-rose-700',
        border: 'border-rose-600',
        text: 'text-rose-100',
        subText: 'text-rose-200',
        tag: 'bg-rose-950 text-rose-200',
        intensity: 'Bearish Kuat',
      };
    }
    return {
      bg: 'bg-rose-600',
      hoverBg: 'hover:bg-rose-500',
      border: 'border-rose-400',
      text: 'text-white',
      subText: 'text-rose-100',
      tag: 'bg-rose-800 text-white',
      intensity: 'Sangat Bearish',
    };
  };

  // Format currency volumes cleanly for institutional desks
  const formatVolume = (vol: number, currency: string = 'USD') => {
    if (vol >= 1_000_000_000_000) {
      return `${(vol / 1_000_000_000_000).toFixed(2)}T`;
    }
    if (vol >= 1_000_000_000) {
      return `${(vol / 1_000_000_000).toFixed(2)}B`;
    }
    if (vol >= 1_000_000) {
      return `${(vol / 1_000_000).toFixed(2)}M`;
    }
    if (vol >= 1_000) {
      return `${(vol / 1_000).toFixed(1)}K`;
    }
    return vol.toString();
  };

  // Calculate volume sizing tiers
  const sortedByVolume = useMemo(() => {
    return [...instruments].sort((a, b) => b.volume24h - a.volume24h);
  }, [instruments]);

  const maxVolume = useMemo(() => {
    return Math.max(...instruments.map((i) => i.volume24h), 1);
  }, [instruments]);

  const getTileSpan = (inst: Instrument) => {
    if (sizeMetric === 'equal') {
      return 'col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3 min-h-[95px]';
    }

    // Top volume tier (e.g. BTC, XAUUSD, EURUSD)
    const ratio = inst.volume24h / maxVolume;
    if (ratio >= 0.45) {
      return 'col-span-12 sm:col-span-6 lg:col-span-4 min-h-[135px]';
    }
    if (ratio >= 0.15) {
      return 'col-span-12 sm:col-span-6 lg:col-span-3 min-h-[110px]';
    }
    return 'col-span-6 sm:col-span-4 lg:col-span-2 min-h-[90px]';
  };

  // Group instruments by category
  const groupedByCategory = useMemo(() => {
    const groups: Record<string, Instrument[]> = {};
    instruments.forEach((inst) => {
      const cat = inst.category || 'other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(inst);
    });

    // Sort instruments inside each category by volume descending
    Object.keys(groups).forEach((key) => {
      groups[key].sort((a, b) => b.volume24h - a.volume24h);
    });

    return groups;
  }, [instruments]);

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Control Bar & Heatmap Legend */}
      <div className="bg-black border border-white p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-yellow-400 text-black font-extrabold flex items-center justify-center text-[10px]">
            HM
          </div>
          <div>
            <span className="font-bold text-white uppercase tracking-wider text-[11px]">
              INSTITUTIONAL MARKET HEATMAP
            </span>
            <span className="text-zinc-400 text-[10px] block sm:inline sm:ml-2">
              Ukuran Tile = Volume Transaksi 24 Jam • Warna = Kinerja Harga Real-Time
            </span>
          </div>
        </div>

        {/* View Controls & Toggles */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Layout Mode Toggle */}
          <div className="flex items-center border border-white p-0 text-[10px]">
            <button
              type="button"
              onClick={() => setLayoutMode('grouped')}
              className={`px-2 py-1 font-bold uppercase transition-colors border-r border-white cursor-pointer ${
                layoutMode === 'grouped' ? 'bg-white text-black' : 'text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              Grup Sektor
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('unified')}
              className={`px-2 py-1 font-bold uppercase transition-colors cursor-pointer ${
                layoutMode === 'unified' ? 'bg-white text-black' : 'text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              Unified Treemap
            </button>
          </div>

          {/* Sizing Scale Toggle */}
          <div className="flex items-center border border-white p-0 text-[10px]">
            <button
              type="button"
              onClick={() => setSizeMetric('volume')}
              className={`px-2 py-1 font-bold uppercase transition-colors border-r border-white cursor-pointer ${
                sizeMetric === 'volume' ? 'bg-yellow-400 text-black font-extrabold' : 'text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              Volume Scaled
            </button>
            <button
              type="button"
              onClick={() => setSizeMetric('equal')}
              className={`px-2 py-1 font-bold uppercase transition-colors cursor-pointer ${
                sizeMetric === 'equal' ? 'bg-yellow-400 text-black font-extrabold' : 'text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              Grid Sama
            </button>
          </div>
        </div>
      </div>

      {/* Institutional Color Scale Legend */}
      <div className="bg-zinc-950 border border-zinc-800 p-2.5 flex flex-wrap items-center justify-between gap-2 text-[10px]">
        <div className="flex items-center gap-1.5 font-bold text-zinc-400">
          <Flame className="w-3.5 h-3.5 text-yellow-400" />
          <span className="uppercase">SKALA KINERJA:</span>
        </div>

        <div className="flex items-center gap-1 font-bold overflow-x-auto scrollbar-none">
          <span className="px-2 py-0.5 bg-rose-600 text-white">&le; -3%</span>
          <span className="px-2 py-0.5 bg-rose-800 text-rose-100">-2%</span>
          <span className="px-2 py-0.5 bg-rose-950 text-rose-300 border border-rose-900">-1%</span>
          <span className="px-2 py-0.5 bg-zinc-900 text-zinc-300 border border-zinc-700">0%</span>
          <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-900">+1%</span>
          <span className="px-2 py-0.5 bg-emerald-700 text-white">+2%</span>
          <span className="px-2 py-0.5 bg-emerald-600 text-white">&ge; +3%</span>
        </div>

        <span className="text-zinc-500 text-[9px] hidden sm:inline">
          Klik tile untuk navigasi ke Chart / Fundamental
        </span>
      </div>

      {/* Heatmap Rendering */}
      {layoutMode === 'grouped' ? (
        <div className="space-y-4">
          {Object.entries(groupedByCategory).map(([category, items]) => {
            if (items.length === 0) return null;

            const categoryTitle = categoryNames[category] || category.toUpperCase();
            const groupTotalVolume = items.reduce((sum, item) => sum + item.volume24h, 0);
            const avgChange =
              items.reduce((sum, item) => sum + item.changePercent24h, 0) / items.length;
            const isGroupUp = avgChange >= 0;

            return (
              <div key={category} className="border border-white bg-black shadow-xl">
                {/* Sector Header */}
                <div className="px-3 py-1.5 bg-zinc-950 border-b border-white flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-400" />
                    <span className="font-bold text-white uppercase tracking-wider">
                      {categoryTitle}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-normal">
                      ({items.length} Aset)
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[10px]">
                    <span className="text-zinc-400 hidden sm:inline">
                      Total Vol: <strong className="text-white">${formatVolume(groupTotalVolume)}</strong>
                    </span>
                    <span className={`font-bold ${isGroupUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                      Avg: {isGroupUp ? `+${avgChange.toFixed(2)}%` : `${avgChange.toFixed(2)}%`}
                    </span>
                  </div>
                </div>

                {/* Sector Tiles Grid */}
                <div className="grid grid-cols-12 gap-1 p-1 bg-black">
                  {items.map((inst) => {
                    const color = getHeatmapColor(inst.changePercent24h);
                    const isUp = inst.changePercent24h >= 0;
                    const tileSpan = getTileSpan(inst);

                    return (
                      <div
                        key={inst.symbol}
                        onClick={() => onJumpToChart(inst.symbol)}
                        onMouseEnter={() => setHoveredSymbol(inst.symbol)}
                        onMouseLeave={() => setHoveredSymbol(null)}
                        className={`group relative p-2.5 border ${color.border} ${color.bg} ${color.hoverBg} transition-all duration-150 cursor-pointer flex flex-col justify-between overflow-hidden shadow ${tileSpan}`}
                        title={`${inst.name} (${inst.displaySymbol})`}
                      >
                        {/* Top Row: Symbol & Category */}
                        <div className="flex items-start justify-between gap-1">
                          <div>
                            <div className={`font-mono font-bold text-xs sm:text-sm tracking-wide ${color.text}`}>
                              {inst.displaySymbol}
                            </div>
                            <div className={`text-[10px] truncate max-w-[120px] font-sans ${color.subText}`}>
                              {inst.name}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <span className={`text-[9px] font-bold px-1 py-0.2 uppercase ${color.tag}`}>
                              {inst.category.slice(0, 3)}
                            </span>
                          </div>
                        </div>

                        {/* Bottom Row: Price & 24h Change */}
                        <div className="mt-2 flex items-end justify-between gap-1 border-t border-black/30 pt-1.5">
                          <div>
                            <span className="text-[9px] uppercase opacity-75 block">HARGA SPOT</span>
                            <span className={`font-bold font-mono text-xs sm:text-sm ${color.text}`}>
                              {formatInstrumentPrice(inst.price, inst.currency, inst.decimals)}
                            </span>
                          </div>

                          <div className="text-right">
                            <div className={`flex items-center justify-end gap-0.5 font-bold font-mono text-xs sm:text-sm ${color.text}`}>
                              {isUp ? (
                                <TrendingUp className="w-3.5 h-3.5 stroke-[3]" />
                              ) : (
                                <TrendingDown className="w-3.5 h-3.5 stroke-[3]" />
                              )}
                              <span>
                                {isUp ? `+${inst.changePercent24h.toFixed(2)}%` : `${inst.changePercent24h.toFixed(2)}%`}
                              </span>
                            </div>
                            <span className={`text-[9px] block ${color.subText}`}>
                              Vol: ${formatVolume(inst.volume24h)}
                            </span>
                          </div>
                        </div>

                        {/* Quick Action Overlay on Hover */}
                        <div className="absolute inset-0 bg-black/85 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2 pointer-events-none group-hover:pointer-events-auto">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onJumpToChart(inst.symbol);
                            }}
                            className="px-2.5 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-[10px] uppercase border border-black flex items-center gap-1 cursor-pointer transition-colors shadow"
                            title="Buka Chart Interaktif"
                          >
                            <BarChart2 className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>CHART</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onJumpToFundamental(inst.symbol);
                            }}
                            className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-[10px] uppercase border border-white flex items-center gap-1 cursor-pointer transition-colors shadow"
                            title="Buka Analisis Fundamental"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>FUNDAMENTAL</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Unified Global Treemap Mode */
        <div className="border border-white bg-black shadow-xl">
          <div className="px-3 py-1.5 bg-zinc-950 border-b border-white flex items-center justify-between text-[11px]">
            <span className="font-bold text-white uppercase tracking-wider">
              SELURUH PASAR PERINGKAT VOLUME (TREEMAP)
            </span>
            <span className="text-zinc-400 text-[10px]">
              {sortedByVolume.length} Instrumen Diurutkan Berdasarkan Likuiditas
            </span>
          </div>

          <div className="grid grid-cols-12 gap-1 p-1 bg-black">
            {sortedByVolume.map((inst) => {
              const color = getHeatmapColor(inst.changePercent24h);
              const isUp = inst.changePercent24h >= 0;
              const tileSpan = getTileSpan(inst);

              return (
                <div
                  key={inst.symbol}
                  onClick={() => onJumpToChart(inst.symbol)}
                  className={`group relative p-2.5 border ${color.border} ${color.bg} ${color.hoverBg} transition-all duration-150 cursor-pointer flex flex-col justify-between overflow-hidden shadow ${tileSpan}`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <div>
                      <div className={`font-mono font-bold text-xs sm:text-sm tracking-wide ${color.text}`}>
                        {inst.displaySymbol}
                      </div>
                      <div className={`text-[10px] truncate max-w-[120px] font-sans ${color.subText}`}>
                        {inst.name}
                      </div>
                    </div>
                    <span className={`text-[9px] font-bold px-1 py-0.2 uppercase ${color.tag}`}>
                      {inst.category.slice(0, 3)}
                    </span>
                  </div>

                  <div className="mt-2 flex items-end justify-between gap-1 border-t border-black/30 pt-1.5">
                    <div>
                      <span className="text-[9px] uppercase opacity-75 block">HARGA SPOT</span>
                      <span className={`font-bold font-mono text-xs sm:text-sm ${color.text}`}>
                        {formatInstrumentPrice(inst.price, inst.currency, inst.decimals)}
                      </span>
                    </div>

                    <div className="text-right">
                      <div className={`flex items-center justify-end gap-0.5 font-bold font-mono text-xs sm:text-sm ${color.text}`}>
                        {isUp ? (
                          <TrendingUp className="w-3.5 h-3.5 stroke-[3]" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5 stroke-[3]" />
                        )}
                        <span>
                          {isUp ? `+${inst.changePercent24h.toFixed(2)}%` : `${inst.changePercent24h.toFixed(2)}%`}
                        </span>
                      </div>
                      <span className={`text-[9px] block ${color.subText}`}>
                        Vol: ${formatVolume(inst.volume24h)}
                      </span>
                    </div>
                  </div>

                  {/* Hover Quick Action Overlay */}
                  <div className="absolute inset-0 bg-black/85 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2 pointer-events-none group-hover:pointer-events-auto">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onJumpToChart(inst.symbol);
                      }}
                      className="px-2.5 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-[10px] uppercase border border-black flex items-center gap-1 cursor-pointer transition-colors shadow"
                    >
                      <BarChart2 className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>CHART</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onJumpToFundamental(inst.symbol);
                      }}
                      className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-[10px] uppercase border border-white flex items-center gap-1 cursor-pointer transition-colors shadow"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>FUNDAMENTAL</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
