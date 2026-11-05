import React from 'react';
import { Instrument } from '../types/market';
import { usePortfolio } from '../hooks/usePortfolio';
import { PropFirmDrawdownMonitor } from './PropFirmDrawdownMonitor';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  History, 
  Layers, 
  ArrowUpRight, 
  ArrowDownLeft,
  Clock,
  ExternalLink,
  RefreshCw,
  Wallet,
  Target,
  ShieldCheck
} from 'lucide-react';

export const CloudPortfolioView: React.FC<{ 
  allInstruments: Instrument[];
  onJumpToAsset?: (symbol: string) => void;
}> = ({ allInstruments, onJumpToAsset }) => {
  const { positions, history, stats, isLoading, closePosition } = usePortfolio(undefined, allInstruments);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-500 gap-4">
        <RefreshCw className="w-8 h-8 animate-spin text-yellow-500" />
        <span className="uppercase tracking-widest text-[10px]">Sinkronisasi Portofolio Cloud...</span>
      </div>
    );
  }

  const winRate = history.length > 0 
    ? (history.filter(t => t.pnl > 0).length / history.length * 100).toFixed(1) 
    : '0.0';
  
  const totalProfit = history.reduce((acc, t) => acc + t.pnl, 0);

  return (
    <div className="space-y-6 font-mono">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0B0F17] border border-zinc-800 p-4 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-5">
            <Wallet className="w-12 h-12" />
          </div>
          <h3 className="text-zinc-500 text-[10px] uppercase tracking-widest mb-1">Saldo Akun (Balance)</h3>
          <div className="text-2xl font-bold text-white">${stats.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          <div className="mt-2 text-[10px] text-zinc-400">Total modal yang tersedia di cloud.</div>
        </div>

        <div className="bg-[#0B0F17] border border-zinc-800 p-4 shadow-xl relative overflow-hidden">
          <h3 className="text-zinc-500 text-[10px] uppercase tracking-widest mb-1">Ekuitas Real-Time</h3>
          <div className="text-2xl font-bold text-yellow-400">${stats.equity.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          <div className="mt-2 flex items-center gap-1.5">
            <span className={`text-[10px] font-bold ${stats.floatingPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {stats.floatingPnL >= 0 ? '+' : ''}{stats.floatingPnL.toFixed(2)} USD Floating
            </span>
          </div>
        </div>

        <div className="bg-[#0B0F17] border border-zinc-800 p-4 shadow-xl relative overflow-hidden">
          <h3 className="text-zinc-500 text-[10px] uppercase tracking-widest mb-1">Win Rate (Histori)</h3>
          <div className="text-2xl font-bold text-white">{winRate}%</div>
          <div className="mt-2 text-[10px] text-zinc-400">
            {history.filter(t => t.pnl > 0).length} Menang / {history.length} Total Trade
          </div>
        </div>

        <div className="bg-[#0B0F17] border border-zinc-800 p-4 shadow-xl relative overflow-hidden">
          <h3 className="text-zinc-500 text-[10px] uppercase tracking-widest mb-1">Total Realized P/L</h3>
          <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totalProfit >= 0 ? '+' : ''}${totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-[10px] text-zinc-400">Akumulasi keuntungan dari riwayat.</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Positions Table */}
        <div className="lg:col-span-8 bg-[#0B0F17] border border-zinc-800 shadow-2xl flex flex-col">
          <div className="p-3 border-b border-zinc-800 bg-black flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <span className="font-bold text-white uppercase tracking-wider text-xs">Posisi Cloud Aktif</span>
            </div>
            <span className="px-2 py-0.5 bg-blue-900/30 text-blue-400 border border-blue-800 text-[10px] font-bold">
              {positions.length} OPEN
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 uppercase text-[9px]">
                  <th className="p-3">Instrumen</th>
                  <th className="p-3">Tipe</th>
                  <th className="p-3 text-right">Volume</th>
                  <th className="p-3 text-right">Entry</th>
                  <th className="p-3 text-right">Market</th>
                  <th className="p-3 text-right">Floating P/L</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {positions.map(pos => (
                  <tr key={pos.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="p-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-white">{pos.displaySymbol}</span>
                        <span className="text-[9px] text-zinc-600">{pos.symbol}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-[2px] font-bold ${pos.type === 'BUY' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'}`}>
                        {pos.type}
                      </span>
                    </td>
                    <td className="p-3 text-right font-bold text-zinc-300">{pos.lots}</td>
                    <td className="p-3 text-right text-zinc-500">${pos.openPrice.toLocaleString()}</td>
                    <td className="p-3 text-right text-white font-bold">${pos.currentPrice.toLocaleString()}</td>
                    <td className="p-3 text-right">
                      <div className={`font-bold ${pos.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {pos.pnl >= 0 ? '+' : ''}${pos.pnl.toFixed(2)}
                      </div>
                      <div className={`text-[9px] ${pos.pnlPercent >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {pos.pnlPercent >= 0 ? '+' : ''}{pos.pnlPercent.toFixed(2)}%
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {onJumpToAsset && (
                          <button 
                            onClick={() => onJumpToAsset(pos.symbol)}
                            className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                            title="Lihat Chart"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button 
                          onClick={() => closePosition(pos)}
                          className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-[9px] uppercase tracking-tighter"
                        >
                          Close
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {positions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-zinc-600 uppercase tracking-widest text-[10px]">
                      Tidak ada posisi terbuka.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Trade History Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <PropFirmDrawdownMonitor />
          
          <div className="bg-[#0B0F17] border border-zinc-800 shadow-2xl flex flex-col">
            <div className="p-3 border-b border-zinc-800 bg-black flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-yellow-400" />
                <span className="font-bold text-white uppercase tracking-wider text-xs">Riwayat Terakhir</span>
              </div>
            </div>
            
            <div className="p-2 space-y-2 max-h-[500px] overflow-y-auto">
              {history.map(t => (
                <div key={t.id} className="p-2.5 bg-black/40 border border-zinc-900 flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className={`w-1 h-8 ${t.pnl >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <div className="flex flex-col">
                      <span className="font-bold text-white text-[11px]">{t.displaySymbol}</span>
                      <span className="text-[9px] text-zinc-600 uppercase">{t.type} | {t.lots} Lots</span>
                    </div>
                  </div>
                  <div className="text-right flex flex-col">
                    <span className={`font-bold ${t.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {t.pnl >= 0 ? '+' : ''}${t.pnl.toFixed(2)}
                    </span>
                    <span className="text-[9px] text-zinc-700">Closed</span>
                  </div>
                </div>
              ))}
              {history.length === 0 && (
                <div className="p-8 text-center text-zinc-700 text-[10px] uppercase">
                  Belum ada riwayat.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
