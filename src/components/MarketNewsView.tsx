import React, { useState } from 'react';
import { MarketNewsItem, Instrument, AssetCategory } from '../types/market';
import { Newspaper, RefreshCw, TrendingUp, TrendingDown, ExternalLink, Globe, Sparkles, BrainCircuit, Gauge, ChevronRight, AlertCircle } from 'lucide-react';

export const MarketNewsView: React.FC<{
    news: MarketNewsItem[];
    instruments: Instrument[];
    isRefreshing: boolean;
    onRefreshNews: () => void;
    onJumpToAsset: (symbol: string) => void;
}> = ({ news, isRefreshing, onRefreshNews, onJumpToAsset }) => {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedNews, setSelectedNews] = useState<MarketNewsItem | null>(news[0] || null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<{
        score: number;
        impact: 'High' | 'Medium' | 'Low';
        summary: string;
        sensitivity: { asset: string; effect: string }[];
    } | null>(null);

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

    const handleAiDeepDive = async (item: MarketNewsItem) => {
        setIsAnalyzing(true);
        setAiAnalysis(null);
        try {
            const prompt = `Analisis sentimen berita berikut untuk desk trading institusional:
Headline: ${item.title}
Ringkasan: ${item.summary}
Detail: ${item.fullAnalysis}

Berikan output dalam format JSON mentah (hanya JSON):
{
  "score": (angka -100 sampai 100),
  "impact": "High" | "Medium" | "Low",
  "summary": "Analisis strategis singkat (2 kalimat)",
  "sensitivity": [{"asset": "Simbol", "effect": "Bullish/Bearish/Neutral"}]
}`;

            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: prompt }),
            });
            const data = await res.json();
            
            if (data.reply) {
                // Improved robust JSON extraction from AI response
                let jsonStr = data.reply;
                
                // Remove markdown code blocks if present
                const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    jsonStr = jsonMatch[0];
                }
                
                try {
                    const parsed = JSON.parse(jsonStr);
                    // Basic validation of expected fields
                    if (typeof parsed.score === 'number' && parsed.impact && parsed.summary) {
                        setAiAnalysis(parsed);
                    } else {
                        throw new Error('Incomplete JSON response from AI');
                    }
                } catch (parseErr) {
                    console.error('Failed to parse AI JSON:', jsonStr);
                    // Fallback to a simple error state or retry
                }
            }

        } catch (err) {
            console.error('AI Analysis failed:', err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleNewsSelect = (item: MarketNewsItem) => {
        setSelectedNews(item);
        setAiAnalysis(null); // Clear previous analysis
    };

    return (
        <div className="space-y-6 font-mono">
            {/* Header */}
            <div className="bg-[#111722] p-6 border border-slate-800 rounded-lg shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-400">
                        <Newspaper className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white tracking-wide uppercase">Berita Pasar & Analisis Sentimen Live</h1>
                        <p className="text-[11px] text-slate-400 font-sans">
                            Berita ekonomi terkini, sentimen institusional, dan dampak langsung terhadap instrumen trading.
                        </p>
                    </div>
                </div>

                <button
                    onClick={onRefreshNews}
                    disabled={isRefreshing}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold uppercase rounded transition-colors shadow disabled:opacity-50 cursor-pointer"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span>{isRefreshing ? 'Memperbarui...' : 'Perbarui Berita Live'}</span>
                </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                            selectedCategory === cat.id
                                ? 'bg-white text-black shadow'
                                : 'bg-[#111722] border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* News Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Section: News List */}
                <div className="lg:col-span-7 space-y-3 max-h-[700px] overflow-y-auto pr-2 scrollbar-thin">
                    {filteredNews.map(item => {
                        const isBullish = item.sentiment === 'Bullish';
                        const isBearish = item.sentiment === 'Bearish';
                        const isSelected = selectedNews?.id === item.id;

                        return (
                            <div
                                key={item.id}
                                onClick={() => handleNewsSelect(item)}
                                className={`p-4 bg-[#111722] border transition-all cursor-pointer relative group ${
                                    isSelected
                                        ? 'border-yellow-500 bg-yellow-500/5 shadow-[0_0_15px_rgba(234,179,8,0.1)]'
                                        : 'border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                                }`}
                            >
                                <div className="flex items-center justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[9px] font-bold rounded uppercase">
                                            {item.category}
                                        </span>
                                        <span className="text-[10px] text-slate-500">{item.source} • {item.publishedAt}</span>
                                    </div>
                                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded border ${
                                        isBullish
                                            ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                                            : isBearish
                                            ? 'bg-rose-950 text-rose-400 border-rose-800'
                                            : 'bg-zinc-900 text-zinc-400 border-zinc-700'
                                    }`}>
                                        {item.sentiment.toUpperCase()}
                                    </span>
                                </div>

                                <h3 className="text-[13px] font-bold text-white mb-2 leading-tight group-hover:text-yellow-400 transition-colors">{item.title}</h3>
                                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed font-sans">{item.summary}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Right Section: Details & AI Analysis */}
                <div className="lg:col-span-5 space-y-4 h-fit sticky top-6">
                    {selectedNews ? (
                        <div className="bg-[#111722] border border-slate-800 shadow-2xl flex flex-col">
                            {/* Detailed Article Card */}
                            <div className="p-5 space-y-4 border-b border-slate-800/50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-6 bg-yellow-500" />
                                        <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest">Article Detail</span>
                                    </div>
                                    <button 
                                        onClick={() => handleAiDeepDive(selectedNews)}
                                        disabled={isAnalyzing}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold uppercase rounded shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                                    >
                                        {isAnalyzing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                                        <span>AI Sentiment Deep-Dive</span>
                                    </button>
                                </div>

                                <div>
                                    <h2 className="text-base font-bold text-white mb-2 leading-snug">{selectedNews.title}</h2>
                                    <div className="flex items-center gap-3 text-[10px] text-slate-500">
                                        <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {selectedNews.source}</span>
                                        <span>•</span>
                                        <span>{selectedNews.publishedAt}</span>
                                    </div>
                                </div>

                                <div className="p-4 bg-black border border-slate-800 text-[11px] text-slate-300 leading-relaxed font-sans italic border-l-4 border-l-blue-500">
                                    "{selectedNews.summary}"
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Desk Analysis:</h3>
                                    <p className="text-[11px] text-slate-200 leading-relaxed bg-black/40 p-4 border border-slate-800 rounded">
                                        {selectedNews.fullAnalysis}
                                    </p>
                                </div>
                            </div>

                            {/* AI Analysis Result Panel */}
                            <div className="bg-black p-5 relative overflow-hidden">
                                {!aiAnalysis && !isAnalyzing && (
                                    <div className="py-8 flex flex-col items-center justify-center text-center space-y-3 opacity-40">
                                        <BrainCircuit className="w-10 h-10 text-slate-700" />
                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest max-w-[200px]">Klik tombol di atas untuk menjalankan analisis AI Kuantitatif.</p>
                                    </div>
                                )}

                                {isAnalyzing && (
                                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                                        <div className="relative">
                                            <Sparkles className="w-8 h-8 text-yellow-500 animate-pulse" />
                                            <RefreshCw className="w-12 h-12 text-blue-500/20 animate-spin absolute -inset-2" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[11px] font-bold text-white uppercase animate-pulse">Gemini 1.5 Pro Processing...</p>
                                            <p className="text-[9px] text-zinc-500 uppercase tracking-widest">Membaca sentimen narasi Bloomberg & Reuters</p>
                                        </div>
                                    </div>
                                )}

                                {aiAnalysis && (
                                    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        {/* Sentiment Score & Impact */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-[#111722] border border-slate-800 p-3 flex flex-col items-center justify-center gap-1">
                                                <span className="text-[9px] text-slate-500 uppercase font-bold">Sentiment Score</span>
                                                <div className="flex items-center gap-2">
                                                    <Gauge className="w-4 h-4 text-yellow-500" />
                                                    <span className={`text-lg font-bold ${aiAnalysis.score > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                        {aiAnalysis.score > 0 ? '+' : ''}{aiAnalysis.score}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="bg-[#111722] border border-slate-800 p-3 flex flex-col items-center justify-center gap-1">
                                                <span className="text-[9px] text-slate-500 uppercase font-bold">Impact Rating</span>
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                                                    aiAnalysis.impact === 'High' ? 'bg-rose-950 text-rose-400 border-rose-800' :
                                                    aiAnalysis.impact === 'Medium' ? 'bg-amber-950 text-amber-400 border-amber-800' :
                                                    'bg-blue-950 text-blue-400 border-blue-800'
                                                }`}>
                                                    {aiAnalysis.impact.toUpperCase()}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Strategic Summary */}
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <AlertCircle className="w-3.5 h-3.5 text-blue-400" />
                                                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Institutional Narrative</span>
                                            </div>
                                            <p className="text-[11px] text-blue-100/80 leading-relaxed font-sans bg-blue-950/20 p-3 border border-blue-900/30 rounded">
                                                {aiAnalysis.summary}
                                            </p>
                                        </div>

                                        {/* Asset Sensitivity */}
                                        <div className="space-y-2">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Asset Sensitivity Map:</span>
                                            <div className="grid grid-cols-1 gap-1.5">
                                                {aiAnalysis.sensitivity.map((s, i) => (
                                                    <div key={i} className="flex items-center justify-between p-2 bg-black border border-zinc-900 rounded group hover:border-zinc-700 transition-colors">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-1 h-1 bg-yellow-500 rounded-full" />
                                                            <span className="font-bold text-white text-[10px]">{s.asset}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                                                s.effect === 'Bullish' ? 'text-emerald-400 bg-emerald-950/30' :
                                                                s.effect === 'Bearish' ? 'text-rose-400 bg-rose-950/30' :
                                                                'text-zinc-400 bg-zinc-900'
                                                            }`}>
                                                                {s.effect.toUpperCase()}
                                                            </span>
                                                            <ChevronRight className="w-3 h-3 text-zinc-800 group-hover:text-zinc-400 transition-colors" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer Symbol Actions */}
                            <div className="p-5 bg-[#0B0F17] border-t border-slate-800 flex flex-wrap gap-2">
                                {selectedNews.relatedSymbols.map(sym => (
                                    <button
                                        key={sym}
                                        onClick={() => onJumpToAsset(sym)}
                                        className="px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600 border border-blue-500/30 text-blue-400 hover:text-white text-[10px] font-bold rounded flex items-center gap-1.5 transition-all cursor-pointer"
                                    >
                                        <Globe className="w-3 h-3" />
                                        <span>{sym} Chart</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="h-[500px] bg-[#111722] border border-slate-800 rounded-lg flex items-center justify-center flex-col gap-4 text-slate-600">
                            <AlertCircle className="w-12 h-12 opacity-10" />
                            <p className="text-xs uppercase tracking-widest opacity-40">Pilih artikel untuk analisis.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
