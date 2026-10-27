import React, { useState, useEffect } from 'react';
import { BotConfig, BotLog, StrategyType } from '../types/bot';
import { mockBotBridge } from '../services/mockBotBridge';
import { Play, Square, Plus, Terminal, Cpu, ShieldCheck, Activity, BarChart2, Settings2, Trash2 } from 'lucide-react';
import { INITIAL_INSTRUMENTS } from '../data/marketData';

export const TradingBotManager: React.FC = () => {
  const [bots, setBots] = useState<BotConfig[]>([
    {
      id: 'bot-1',
      name: 'Astra Alpha S&D Scalper',
      symbol: 'XAUUSD',
      strategy: 'supply_demand_breakout',
      params: { minZoneStrength: 3, riskRewardRatio: 2.5 },
      isActive: true,
      leverage: 20,
    },
    {
      id: 'bot-2',
      name: 'EUR/USD Macro Flow Straddle',
      symbol: 'EURUSD',
      strategy: 'macro_news_straddle',
      params: { deviationThreshold: 0.25, timeBufferSec: 15 },
      isActive: false,
      leverage: 30,
    },
    {
      id: 'bot-3',
      name: 'BTC Momentum Grid Pro',
      symbol: 'BTCUSDT',
      strategy: 'grid_trading',
      params: { gridCount: 12, upperPrice: 98000, lowerPrice: 90000 },
      isActive: true,
      leverage: 5,
    },
  ]);

  const [logs, setLogs] = useState<BotLog[]>([
    { id: 'l-1', botId: 'bot-1', timestamp: '21:30:15 WIB', message: 'MT5 Bridge terhubung ke server MetaQuotes-Demo (Ping: 12ms).', type: 'info' },
    { id: 'l-2', botId: 'bot-1', timestamp: '21:31:02 WIB', message: '[XAUUSD] S&D Zone H1 teridentifikasi: Demand @ 3995.00 - 4005.00.', type: 'signal' },
    { id: 'l-3', botId: 'bot-1', timestamp: '21:31:05 WIB', message: '[XAUUSD] ORDER BUY 0.20 lots @ 4008.50. SL 3985.00 TP 4065.00 terkirim.', type: 'trade' },
    { id: 'l-4', botId: 'bot-3', timestamp: '21:32:10 WIB', message: '[BTCUSDT] Grid limit order terisi @ 93,800. Profit floating +$145.00.', type: 'trade' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBotName, setNewBotName] = useState('');
  const [newBotSymbol, setNewBotSymbol] = useState('EURUSD');
  const [newBotStrategy, setNewBotStrategy] = useState<StrategyType>('supply_demand_breakout');
  const [newBotLeverage, setNewBotLeverage] = useState(10);

  const handleToggleBot = (id: string) => {
    setBots((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        const newStatus = !b.isActive;
        const logMsg: BotLog = {
          id: `log-${Date.now()}`,
          botId: id,
          timestamp: new Date().toLocaleTimeString(),
          message: `Bot [${b.name}] ${newStatus ? 'DIAKTIFKAN (Listening sinyal)' : 'DIHENTIKAN'}.`,
          type: newStatus ? 'info' : 'warning',
        };
        setLogs((l) => [logMsg, ...l]);
        return { ...b, isActive: newStatus };
      })
    );
  };

  const handleCreateBot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBotName.trim()) return;

    const createdBot: BotConfig = {
      id: `bot-${Date.now()}`,
      name: newBotName,
      symbol: newBotSymbol,
      strategy: newBotStrategy,
      params: { autoRiskPercent: 1.5 },
      isActive: true,
      leverage: newBotLeverage,
    };

    setBots((prev) => [...prev, createdBot]);
    setLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        botId: createdBot.id,
        timestamp: new Date().toLocaleTimeString(),
        message: `Strategi baru [${createdBot.name}] berhasil dipasang pada ${createdBot.symbol} (Leverage: ${createdBot.leverage}x).`,
        type: 'info',
      },
      ...prev,
    ]);
    setIsModalOpen(false);
    setNewBotName('');
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Top Header */}
      <div className="bg-[#111722] p-6 border border-slate-800 rounded-lg shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-400">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">Trading Bot Manager (MT5 Bridge & Algo Desk)</h1>
            <p className="text-sm text-slate-400 font-sans">
              Integrasi strategi kuantitatif otomatis, eksekusi order MT5 live simulation, dan manajemen risiko terpusat.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Strategi Bot Baru</span>
        </button>
      </div>

      {/* Bridge Status & Backtest Performance KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="bg-[#111722] p-4 border border-slate-800 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">MT5 Bridge Status:</span>
            <span className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold rounded text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> TERHUBUNG
            </span>
          </div>
          <div className="text-white font-bold text-sm">MetaQuotes Server (12ms)</div>
          <div className="text-slate-500 text-[10px] mt-1">Protokol: ZeroMQ / FIX REST</div>
        </div>

        <div className="bg-[#111722] p-4 border border-slate-800 rounded-lg">
          <div className="text-slate-400 mb-1">Win Rate Kumulatif:</div>
          <div className="text-emerald-400 font-bold text-xl">74.2%</div>
          <div className="text-slate-500 text-[10px] mt-1">Berdasarkan 320 eksekusi simulasi</div>
        </div>

        <div className="bg-[#111722] p-4 border border-slate-800 rounded-lg">
          <div className="text-slate-400 mb-1">Profit Factor:</div>
          <div className="text-blue-400 font-bold text-xl">2.18</div>
          <div className="text-slate-500 text-[10px] mt-1">Average Win / Loss: 2.34x</div>
        </div>

        <div className="bg-[#111722] p-4 border border-slate-800 rounded-lg">
          <div className="text-slate-400 mb-1">Max Drawdown:</div>
          <div className="text-amber-400 font-bold text-xl">4.2%</div>
          <div className="text-slate-500 text-[10px] mt-1">Margin Guard Limit: 10%</div>
        </div>
      </div>

      {/* Main Bot Strategy List & Live Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Bots Configured */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <span>Daftar Bot Algoritmik Aktif</span>
          </h2>

          <div className="space-y-3">
            {bots.map((bot) => (
              <div
                key={bot.id}
                className="p-4 bg-[#111722] border border-slate-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-slate-700"
              >
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-white text-sm">{bot.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        bot.isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {bot.isActive ? '● RUNNING' : '■ STOPPED'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-400">
                    <span>
                      Pasangan: <strong className="text-white">{bot.symbol}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Strategi: <strong className="text-blue-400">{bot.strategy.replace(/_/g, ' ')}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Leverage: <strong className="text-amber-400">{bot.leverage}x</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleBot(bot.id)}
                    className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 transition-colors ${
                      bot.isActive
                        ? 'bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30'
                        : 'bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30'
                    }`}
                  >
                    {bot.isActive ? (
                      <>
                        <Square className="w-3 h-3 fill-current" />
                        <span>Hentikan</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 fill-current" />
                        <span>Jalankan</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Real-time Terminal Log */}
        <div className="bg-[#111722] border border-slate-800 rounded-lg p-4 flex flex-col h-[460px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Konsol Log Eksekusi MT5</span>
            </h3>
            <span className="text-[10px] text-slate-500">Auto-scroll: ON</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 text-[11px] pr-1">
            {logs.map((log, i) => (
              <div
                key={log.id || i}
                className={`p-2 rounded border leading-relaxed ${
                  log.type === 'trade'
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                    : log.type === 'signal'
                    ? 'bg-blue-950/20 border-blue-500/30 text-blue-300'
                    : log.type === 'warning'
                    ? 'bg-amber-950/20 border-amber-500/30 text-amber-300'
                    : 'bg-[#0B0F17] border-slate-800 text-slate-300'
                }`}
              >
                <div className="text-[9px] text-slate-500 mb-0.5">[{log.timestamp}]</div>
                <div>{log.message}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* New Bot Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs font-mono">
          <form
            onSubmit={handleCreateBot}
            className="bg-[#111722] border border-slate-700 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm">Konfigurasi Bot Trading Baru</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Nama Strategi / Bot:</label>
              <input
                type="text"
                required
                value={newBotName}
                onChange={(e) => setNewBotName(e.target.value)}
                placeholder="e.g. Breakout Scalper EURUSD"
                className="w-full bg-[#0B0F17] border border-slate-800 rounded p-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Pilih Pasangan Aset:</label>
              <select
                value={newBotSymbol}
                onChange={(e) => setNewBotSymbol(e.target.value)}
                className="w-full bg-[#0B0F17] border border-slate-800 rounded p-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {INITIAL_INSTRUMENTS.map((inst) => (
                  <option key={inst.symbol} value={inst.symbol}>
                    {inst.displaySymbol} - {inst.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Model Algoritma:</label>
              <select
                value={newBotStrategy}
                onChange={(e) => setNewBotStrategy(e.target.value as StrategyType)}
                className="w-full bg-[#0B0F17] border border-slate-800 rounded p-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="supply_demand_breakout">Supply & Demand Zone Breakout</option>
                <option value="macro_news_straddle">Macro News Straddle (NFP / CPI)</option>
                <option value="rsi_crossover">RSI Dynamic Reversal & Momentum</option>
                <option value="grid_trading">Quantitative High-Frequency Grid</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Leverage Akun:</label>
              <select
                value={newBotLeverage}
                onChange={(e) => setNewBotLeverage(Number(e.target.value))}
                className="w-full bg-[#0B0F17] border border-slate-800 rounded p-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value={1}>1x (Tanpa Leverage / Spot)</option>
                <option value={5}>5x</option>
                <option value={10}>10x</option>
                <option value={20}>20x</option>
                <option value={50}>50x (Forex)</option>
              </select>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded hover:bg-slate-700"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700"
              >
                Simpan & Deploy Bot
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
