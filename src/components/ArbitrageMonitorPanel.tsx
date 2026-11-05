import React, { useState, useEffect } from 'react';
import { Instrument } from '../types/market';
import { RefreshCw, Zap, TrendingUp, TrendingDown, ArrowRightLeft } from 'lucide-react';

interface ArbitrageData {
  prices: { exchange: string; price: number }[];
  arbitrageOpportunity: boolean;
  spread: string;
  bestExchange: string;
  worstExchange: string;
}

export const ArbitrageMonitorPanel: React.FC<{ instrument: Instrument }> = ({ instrument }) => {
  const [data, setData] = useState<ArbitrageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchArbitrage = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/arbitrage/${instrument.symbol}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error('Failed to fetch arbitrage data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArbitrage();
    const interval = setInterval(fetchArbitrage, 5000);
    return () => clearInterval(interval);
  }, [instrument.symbol]);

  return (
    <div className="bg-zinc-950 border border-white p-4 space-y-4 shadow-xl font-mono text-xs">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <span className="font-bold text-white uppercase flex items-center gap-2 text-xs">
          <ArrowRightLeft className="w-4 h-4 text-yellow-400" />
          Arbitrage Monitor: {instrument.displaySymbol}
        </span>
        <button onClick={fetchArbitrage} className="text-zinc-500 hover:text-white">
          <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {isLoading && !data ? (
        <div className="py-8 text-center text-zinc-600">Scanning Exchanges...</div>
      ) : data ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className={`p-3 border ${data.arbitrageOpportunity ? 'bg-emerald-950 border-emerald-600' : 'bg-zinc-900 border-zinc-700'}`}>
              <span className="text-[9px] text-zinc-400 uppercase block">Spread Terdeteksi</span>
              <span className="text-lg font-bold text-white">{data.spread}</span>
            </div>
            <div className="p-3 border border-zinc-700 bg-black">
              <span className="text-[9px] text-zinc-500 uppercase block">Best Entry</span>
              <span className="text-lg font-bold text-yellow-400">{data.worstExchange}</span>
            </div>
          </div>

          <div className="space-y-1">
            {data.prices.map((p) => (
              <div key={p.exchange} className="flex justify-between bg-black p-2 border border-zinc-800 text-[11px]">
                <span className="text-zinc-400 font-bold">{p.exchange}</span>
                <span className="text-white font-mono">${p.price.toFixed(2)}</span>
              </div>
            ))}
          </div>

          {data.arbitrageOpportunity && (
            <div className="p-3 bg-emerald-950/20 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>PELUANG ARBITRASE TERDETEKSI!</span>
            </div>
          )}
        </div>
      ) : (
        <div className="text-zinc-600 text-xs text-center py-4">Data tidak tersedia.</div>
      )}
    </div>
  );
};
