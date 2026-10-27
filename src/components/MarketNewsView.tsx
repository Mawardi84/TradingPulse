import React, { useState } from 'react';
import { MarketNewsItem, Instrument, AssetCategory } from '../types/market';
import { Newspaper, RefreshCw, TrendingUp, TrendingDown, ExternalLink, Globe } from 'lucide-react';

export const MarketNewsView: React.FC<{
    news: MarketNewsItem[];
    instruments: Instrument[];
    isRefreshing: boolean;
    onRefreshNews: () => void;
    onJumpToAsset: (symbol: string) => void;
}> = ({ news, isRefreshing, onRefreshNews, onJumpToAsset }) => {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedNews, setSelectedNews] = useState<MarketNewsItem | null>(news[0] || null);

    const categories = [
        { id: 'all', label: 'Semua Berita' },
        { id: 'macro', label: 'Makroekonomi & Sentimen' },
        { id: 'crypto', label: 'Crypto' },
        { id: 'forex', label: 'Forex' },
        { id: 'us_stocks', label: 'Saham US' },
        { id: 'idx_stocks', label: 'Saham IDX' },
        { id: 'commodities', label: 'Komoditi' },
    ];

    const filteredNews = news.filter(n => selectedCategory === 'all' || n.category === selectedCategory);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-[#111722] p-6 border border-slate-800 rounded-lg shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-400">
                        <Newspaper className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white tracking-wide">Berita Pasar & Analisis Sentimen Live</h1>
                        <p className="text-sm text-slate-400">
                            Berita ekonomi terkini, sentimen institusional, dan dampak langsung terhadap instrumen trading.
                        </p>
                    </div>
                </div>

                <button
                    onClick={onRefreshNews}
                    disabled={isRefreshing}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors shadow disabled:opacity-50"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span>{isRefreshing ? 'Memperbarui...' : 'Perbarui Berita Live'}</span>
                </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                            selectedCategory === cat.id
                                ? 'bg-blue-600 text-white shadow'
                                : 'bg-[#111722] border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* News Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: News List */}
                <div className="lg:col-span-2 space-y-3">
                    {filteredNews.map(item => {
                        const isBullish = item.sentiment === 'Bullish';
                        const isBearish = item.sentiment === 'Bearish';
                        const isSelected = selectedNews?.id === item.id;

                        return (
                            <div
                                key={item.id}
                                onClick={() => setSelectedNews(item)}
                                className={`p-4 bg-[#111722] border rounded-lg cursor-pointer transition-all ${
                                    isSelected
                                        ? 'border-blue-500 bg-blue-600/5 shadow-lg'
                                        : 'border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                                }`}
                            >
                                <div className="flex items-center justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-mono rounded uppercase">
                                            {item.category}
                                        </span>
                                        <span className="text-xs text-slate-400 font-mono">{item.source} • {item.publishedAt}</span>
                                    </div>
                                    <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${
                                        isBullish
                                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                            : isBearish
                                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                                    }`}>
                                        {item.sentiment}
                                    </span>
                                </div>

                                <h3 className="text-sm font-bold text-white mb-2 leading-snug">{item.title}</h3>
                                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-3">{item.summary}</p>

                                <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-slate-800/80">
                                    <div className="flex items-center gap-1.5 text-slate-400">
                                        <span>Simbol Terkait:</span>
                                        {item.relatedSymbols.map(sym => (
                                            <button
                                                key={sym}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onJumpToAsset(sym);
                                                }}
                                                className="px-1.5 py-0.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white rounded text-[10px] transition-colors"
                                            >
                                                {sym}
                                            </button>
                                        ))}
                                    </div>
                                    <span className="text-blue-400 text-[11px] flex items-center gap-1">
                                        Baca Analisis <ExternalLink className="w-3 h-3" />
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Right Col: Selected News Detail & Full Analysis */}
                <div className="bg-[#111722] p-6 border border-slate-800 rounded-lg space-y-6 h-fit sticky top-6">
                    {selectedNews ? (
                        <>
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono rounded uppercase">
                                        {selectedNews.category}
                                    </span>
                                    <span className="text-xs font-mono text-slate-400">{selectedNews.publishedAt}</span>
                                </div>
                                <h2 className="text-base font-bold text-white mb-3 leading-snug">{selectedNews.title}</h2>
                                <p className="text-xs font-mono text-slate-400">Sumber: <span className="text-white font-bold">{selectedNews.source}</span></p>
                            </div>

                            <div className="p-4 bg-[#0B0F17] border border-slate-800 rounded-lg space-y-2">
                                <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Ringkasan Eksekutif:</div>
                                <p className="text-xs text-slate-300 leading-relaxed">{selectedNews.summary}</p>
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">Analisis Kuantitatif Mendalam:</h3>
                                <p className="text-xs text-slate-200 leading-relaxed bg-[#0B0F17] p-4 border border-slate-800 rounded-lg">
                                    {selectedNews.fullAnalysis}
                                </p>
                            </div>

                            <div className="pt-4 border-t border-slate-800 space-y-3">
                                <div className="text-xs font-mono text-slate-400 mb-2">Aksi Cepat pada Simbol:</div>
                                <div className="flex flex-wrap gap-2">
                                    {selectedNews.relatedSymbols.map(sym => (
                                        <button
                                            key={sym}
                                            onClick={() => onJumpToAsset(sym)}
                                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-mono font-bold rounded flex items-center gap-1.5 transition-colors shadow"
                                        >
                                            <Globe className="w-3.5 h-3.5" />
                                            <span>Chart {sym}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12 text-slate-500 text-xs font-mono">
                            Pilih artikel berita di sebelah kiri untuk melihat analisis mendalam.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
