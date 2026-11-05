import React, { useState, useMemo, useEffect } from 'react';
import { usePortfolio } from '../hooks/usePortfolio';
import { Shield, AlertTriangle, Zap, Percent } from 'lucide-react';

export const PropFirmDrawdownMonitor: React.FC = () => {
  const { stats, closeAllPositions } = usePortfolio();
  const [maxDrawdownLimit, setMaxDrawdownLimit] = useState<number>(10); // 10% limit
  const [autoKillEnabled, setAutoKillEnabled] = useState<boolean>(false);
  const [killTriggered, setKillTriggered] = useState<boolean>(false);
  const startBalance = 50000.0; // Based on usePortfolio initial balance

  const currentEquity = stats.equity;
  const currentDrawdown = useMemo(() => {
    return ((startBalance - currentEquity) / startBalance) * 100;
  }, [currentEquity]);

  const limitReached = currentDrawdown >= maxDrawdownLimit;

  useEffect(() => {
    if (autoKillEnabled && limitReached && !killTriggered) {
      closeAllPositions();
      setKillTriggered(true);
      console.warn('PropFirm Sniper: Auto-Kill Triggered due to drawdown limit!');
    } else if (!limitReached) {
      setKillTriggered(false);
    }
  }, [autoKillEnabled, limitReached, killTriggered, closeAllPositions]);

  return (
    <div className="bg-zinc-950 border border-white p-4 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <span className="font-bold text-white uppercase flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          Prop Firm Sniper: Drawdown Monitor
        </span>
        <span className={`px-2 py-0.5 font-bold text-[10px] border flex items-center gap-1 ${limitReached ? 'bg-rose-950 text-rose-400 border-rose-600' : 'bg-emerald-950 text-emerald-400 border-emerald-600'}`}>
          <span className={`w-2 h-2 rounded-full ${limitReached ? 'bg-rose-400' : 'bg-emerald-400'} animate-pulse`} />
          {limitReached ? 'CRITICAL RISK' : 'MONITORING'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-black p-3 border border-zinc-800">
          <span className="text-[9px] text-zinc-500 uppercase block">Current Drawdown</span>
          <span className={`text-lg font-bold ${currentDrawdown > maxDrawdownLimit * 0.8 ? 'text-rose-400' : 'text-white'}`}>
            {currentDrawdown.toFixed(2)}%
          </span>
        </div>
        <div className="bg-black p-3 border border-zinc-800">
          <span className="text-[9px] text-zinc-500 uppercase block">Max Drawdown Limit</span>
          <span className="text-lg font-bold text-yellow-400">{maxDrawdownLimit}%</span>
        </div>
      </div>

      <div className="flex items-center justify-between bg-black p-3 border border-zinc-800 rounded">
        <span className="text-xs font-bold text-zinc-300">Auto-Kill Positions</span>
        <button 
          onClick={() => setAutoKillEnabled(!autoKillEnabled)}
          className={`w-10 h-5 rounded-full transition-colors relative ${autoKillEnabled ? 'bg-rose-600' : 'bg-zinc-700'}`}
        >
          <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${autoKillEnabled ? 'left-5.5' : 'left-0.5'}`} />
        </button>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-zinc-400">
          <span>0%</span>
          <span>Risk Level ({currentDrawdown.toFixed(1)}%)</span>
          <span>{maxDrawdownLimit}% Limit</span>
        </div>
        <div className="w-full h-3 bg-zinc-900 border border-zinc-700 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${currentDrawdown > maxDrawdownLimit * 0.8 ? 'bg-rose-500' : 'bg-emerald-500'}`}
            style={{ width: `${Math.min(100, (currentDrawdown / maxDrawdownLimit) * 100)}%` }}
          />
        </div>
      </div>

      {limitReached && (
        <div className="p-3 bg-rose-950/20 border border-rose-500/50 text-rose-300 text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>PERINGATAN: Limit Drawdown Prop Firm Tercapai! {autoKillEnabled ? 'Auto-Kill Dijalankan.' : 'Posisi berisiko terkena Busted.'}</span>
        </div>
      )}
    </div>
  );
};
