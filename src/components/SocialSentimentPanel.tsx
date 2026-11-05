import React, { useState, useEffect } from 'react';
import { Instrument } from '../types/market';
import { MessageSquare, RefreshCw, BarChart3, TrendingUp, TrendingDown, Info } from 'lucide-react';

interface SentimentData {
  score: number;
  bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  volume: number;
  topMentions: string[];
  summary: string;
}

export const SocialSentimentPanel: React.FC<{ instrument: Instrument }> = ({ instrument }) => {
  const [data, setData] = useState<SentimentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSentiment = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/sentiment/${instrument.symbol}`, { method: 'GET' });
      const json = await res.json();
      if (json.success) {
        setData(json.sentiment);
      }
    } catch (err) {
      console.error('Failed to fetch sentiment:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSentiment();
  }, [instrument.symbol]);

  return (
    <div className="bg-black border border-zinc-800 p-4 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <span className="font-bold text-white uppercase flex items-center gap-2 text-xs">
          <MessageSquare className="w-4 h-4 text-yellow-400" />
          Social Sentiment: {instrument.displaySymbol}
        </span>
        <button onClick={fetchSentiment} className="text-zinc-500 hover:text-white">
          <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-zinc-600 text-xs">Analisis sentimen berlangsung...</div>
      ) : data ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-center">
              <span className="text-[10px] text-zinc-500 uppercase block">Sentimen Score</span>
              <span className={`text-xl font-bold ${data.score > 60 ? 'text-emerald-400' : data.score < 40 ? 'text-rose-400' : 'text-zinc-300'}`}>
                {data.score}/100
              </span>
            </div>
            <div className="text-center">
              <span className="text-[10px] text-zinc-500 uppercase block">Market Bias</span>
              <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                data.bias === 'BULLISH' ? 'bg-emerald-950 text-emerald-400' : 
                data.bias === 'BEARISH' ? 'bg-rose-950 text-rose-400' : 'bg-zinc-800 text-zinc-300'
              }`}>
                {data.bias}
              </span>
            </div>
          </div>

          <div className="bg-zinc-900 p-3 text-[11px] text-zinc-300 italic border-l-2 border-yellow-500">
            {data.summary}
          </div>

          <div className="flex flex-wrap gap-2">
            {data.topMentions.map(m => (
              <span key={m} className="px-2 py-0.5 bg-zinc-800 text-zinc-400 text-[9px] font-mono">
                {m}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-zinc-600 text-xs text-center py-4">Data tidak tersedia.</div>
      )}
    </div>
  );
};
