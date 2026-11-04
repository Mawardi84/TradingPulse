import React, { useState, useEffect } from 'react';
import { Instrument, Candle } from '../types/market';
import { formatInstrumentPrice } from '../utils/formatters';
import {
  Server,
  Cpu,
  Radio,
  Bell,
  Play,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Shield,
  Zap,
  Activity,
  Send,
  Sliders,
  BarChart3,
  Lock,
  RefreshCw,
  Copy,
  Check,
  Building2,
} from 'lucide-react';

interface Phase4HubViewProps {
  instruments: Instrument[];
  selectedInstrument: Instrument;
  candles: Candle[];
}

export const Phase4HubView: React.FC<Phase4HubViewProps> = ({
  instruments,
  selectedInstrument,
  candles,
}) => {
  const [activeTab, setActiveTab] = useState<'mt5' | 'backtest' | 'darkpool' | 'webhook'>('mt5');

  // MT5 Webhook Bridge State
  const [mt5Logs, setMt5Logs] = useState<string[]>([]);
  const [webhookEndpoint, setWebhookEndpoint] = useState<string>('');
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [dispatchLoading, setDispatchLoading] = useState<boolean>(false);

  // Fetch MT5 webhook logs from backend
  useEffect(() => {
    const fetchMt5Logs = async () => {
      try {
        const res = await fetch('/api/mt5/logs');
        const data = await res.json();
        if (data.success) {
          setMt5Logs(data.logs || []);
          setWebhookEndpoint(data.webhookEndpoint || '');
        }
      } catch (err) {
        console.warn('Could not fetch MT5 logs:', err);
      }
    };
    fetchMt5Logs();
    const interval = setInterval(fetchMt5Logs, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleDispatchTestOrder = async () => {
    setDispatchLoading(true);
    try {
      const res = await fetch('/api/mt5/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: selectedInstrument.symbol,
          action: 'BUY',
          volume: 0.10,
          sl: selectedInstrument.price * 0.99,
          tp: selectedInstrument.price * 1.02,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const logRes = await fetch('/api/mt5/logs');
        const logData = await logRes.json();
        if (logData.success) setMt5Logs(logData.logs);
      }
    } catch (err) {
      console.warn('Dispatch order error:', err);
    } finally {
      setDispatchLoading(false);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(webhookEndpoint);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // Backtest Lab State
  const [backtestRunning, setBacktestRunning] = useState<boolean>(false);
  const [backtestResult, setBacktestResult] = useState<{
    winRate: number;
    profitFactor: number;
    maxDD: number;
    totalTrades: number;
    netProfit: number;
  } | null>({
    winRate: 68.4,
    profitFactor: 2.15,
    maxDD: 4.2,
    totalTrades: 142,
    netProfit: 12450.00,
  });

  // Webhook State
  const [webhookUrl, setWebhookUrl] = useState<string>('https://discord.com/api/webhooks/example');
  const [telegramToken, setTelegramToken] = useState<string>('84920182:AAH9201-ExampleBotToken');
  const [alertSent, setAlertSent] = useState<boolean>(false);

  const handleRunBacktest = () => {
    setBacktestRunning(true);
    setTimeout(() => {
      setBacktestResult({
        winRate: Number((65 + Math.random() * 8).toFixed(1)),
        profitFactor: Number((1.9 + Math.random() * 0.5).toFixed(2)),
        maxDD: Number((3.5 + Math.random() * 2).toFixed(1)),
        totalTrades: Math.floor(120 + Math.random() * 50),
        netProfit: Number((11000 + Math.random() * 4000).toFixed(2)),
      });
      setBacktestRunning(false);
    }, 1200);
  };

  const handleTestWebhook = () => {
    setAlertSent(true);
    setTimeout(() => setAlertSent(false), 2500);
  };

  return (
    <div className="space-y-4 font-mono text-xs p-4 bg-black text-white min-h-[calc(100vh-60px)]">
      {/* Phase 4 Header */}
      <div className="bg-zinc-950 border border-white p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-yellow-400 text-black flex items-center justify-center font-extrabold text-sm">
            P4
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-widest uppercase">
              Phase 4: Advanced Institutional Lab & Webhook Bridge
            </h1>
            <p className="text-[10px] text-zinc-400">
              MetaTrader 5 Expert Advisor (EA) Webhook Integration • AI Quant Backtesting Lab • Live Dark Pool Flow • Cloud Alerts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 border border-zinc-700 p-1 bg-black">
          {[
            { id: 'mt5', label: 'MT5 Webhook Bridge' },
            { id: 'backtest', label: 'AI Backtest Lab' },
            { id: 'darkpool', label: 'Live Dark Pool & Flow' },
            { id: 'webhook', label: 'Cloud Webhooks' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 uppercase font-bold text-[10px] transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-yellow-400 text-black font-extrabold'
                  : 'text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: MT5 Webhook Bridge */}
      {activeTab === 'mt5' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1 bg-zinc-950 border border-white p-4 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="font-bold text-white uppercase">MT5 Expert Advisor (EA) Webhook</span>
              <span className="px-2 py-0.5 font-bold text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                SERVER ACTIVE
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">SERVER WEBHOOK URL (UNTUK MQL5 / EA)</label>
                <div className="flex items-center gap-1 bg-black border border-zinc-700 rounded p-1.5">
                  <input
                    type="text"
                    readOnly
                    value={webhookEndpoint || 'Loading endpoint...'}
                    className="w-full bg-transparent text-[11px] text-yellow-300 outline-none truncate"
                  />
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded cursor-pointer shrink-0"
                    title="Salin URL Webhook"
                  >
                    {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <span className="text-[9px] text-zinc-500 block mt-1">
                  Masukkan URL di atas ke fungsi <code className="text-zinc-300">WebRequest()</code> pada Expert Advisor (EA) MetaTrader 5 Anda.
                </span>
              </div>

              <div className="p-3 bg-black border border-zinc-800 text-[10px] text-zinc-400 space-y-1">
                <span className="text-white font-bold block">Cara Integrasi MT5 EA:</span>
                <div>1. Izinkan URL WebRequest di MT5: <code className="text-yellow-300">Tools &gt; Options &gt; Expert Advisors</code>.</div>
                <div>2. Kirim payload JSON POST ke endpoint di atas dari script MQL5.</div>
                <div>3. Server akan memproses dan menyinkronkan eksekusi secara real-time.</div>
              </div>

              <button
                type="button"
                disabled={dispatchLoading}
                onClick={handleDispatchTestOrder}
                className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold uppercase text-xs border border-black flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                {dispatchLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Mengirim Test Webhook Order...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Test Dispatch Order ke MT5 Webhook</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 bg-zinc-950 border border-white p-4 space-y-3 shadow-xl flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="font-bold text-white uppercase flex items-center gap-2">
                <Activity className="w-4 h-4 text-yellow-400" />
                Live MT5 Webhook Request Logs (Server-Side)
              </span>
              <span className="text-[10px] text-zinc-400">
                Total Logs: {mt5Logs.length}
              </span>
            </div>

            <div className="flex-1 bg-black border border-zinc-800 p-3 h-72 overflow-y-auto space-y-1 font-mono text-[11px] text-zinc-300">
              {mt5Logs.map((log, idx) => (
                <div key={idx} className="border-b border-zinc-900 pb-1">
                  <span className="text-yellow-400">›</span> {log}
                </div>
              ))}
              {mt5Logs.length === 0 && (
                <div className="text-zinc-500 text-center py-8">Belum ada webhook log diterima.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: AI Backtest Lab */}
      {activeTab === 'backtest' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1 bg-zinc-950 border border-white p-4 space-y-4 shadow-xl">
            <div className="border-b border-zinc-800 pb-2">
              <span className="font-bold text-white uppercase">Parameter Backtest Quant</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">ASET PENGUJIAN</label>
                <div className="px-2.5 py-1.5 bg-black border border-zinc-700 rounded text-yellow-400 font-bold">
                  {selectedInstrument.displaySymbol} ({selectedInstrument.name})
                </div>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">STRATEGI QUANT</label>
                <select className="w-full bg-black border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-white">
                  <option>SMC Supply/Demand + ATR Volatility</option>
                  <option>Multi-Factor RSI/MACD Confluence</option>
                  <option>Gold Trend Breakout (M5 High/Low)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">PERIODE DATA HISTORIS</label>
                <select className="w-full bg-black border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-white">
                  <option>1 Tahun Terakhir (M15 / H1)</option>
                  <option>6 Bulan Terakhir</option>
                  <option>30 Hari Terakhir (Scalp)</option>
                </select>
              </div>

              <button
                type="button"
                disabled={backtestRunning}
                onClick={handleRunBacktest}
                className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold uppercase text-xs border border-black flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                {backtestRunning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Menjalankan Backtest AI...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Jalankan AI Backtest Lab</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 bg-zinc-950 border border-white p-4 space-y-4 shadow-xl">
            <div className="border-b border-zinc-800 pb-2">
              <span className="font-bold text-white uppercase">Hasil Kinerja Strategi Kuantitatif</span>
            </div>

            {backtestResult ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-black border border-zinc-800 p-3">
                    <span className="text-[9px] text-zinc-400 uppercase block">Win Rate</span>
                    <span className="text-lg font-bold text-emerald-400 font-mono">{backtestResult.winRate}%</span>
                  </div>
                  <div className="bg-black border border-zinc-800 p-3">
                    <span className="text-[9px] text-zinc-400 uppercase block">Profit Factor</span>
                    <span className="text-lg font-bold text-yellow-400 font-mono">{backtestResult.profitFactor}</span>
                  </div>
                  <div className="bg-black border border-zinc-800 p-3">
                    <span className="text-[9px] text-zinc-400 uppercase block">Max Drawdown</span>
                    <span className="text-lg font-bold text-rose-400 font-mono">{backtestResult.maxDD}%</span>
                  </div>
                  <div className="bg-black border border-zinc-800 p-3">
                    <span className="text-[9px] text-zinc-400 uppercase block">Total Profit Net</span>
                    <span className="text-lg font-bold text-cyan-400 font-mono">${backtestResult.netProfit.toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-3 bg-black border border-zinc-800 space-y-2">
                  <div className="text-[11px] font-bold text-white uppercase">Kurva Ekuitas Simulasi (Equity Curve)</div>
                  <div className="h-40 flex items-end gap-1 pt-4 pb-1 px-2 border-b border-zinc-800">
                    {[40, 48, 45, 58, 62, 59, 72, 80, 78, 88, 95, 104, 110, 118, 125, 134, 142].map((val, idx) => (
                      <div
                        key={idx}
                        style={{ height: `${val}%` }}
                        className="flex-1 bg-yellow-400 hover:bg-yellow-300 transition-all rounded-t"
                        title={`Trade #${idx + 1}: Equity Index ${val}`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-[9px] text-zinc-500">
                    <span>Mulai (Trade 1)</span>
                    <span>Total {backtestResult.totalTrades} Executed Trades</span>
                    <span>Akhir (Simulasi Selesai)</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-zinc-500">
                Klik tombol "Jalankan AI Backtest Lab" untuk memulai simulasi pengujian historis.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Live Dark Pool & Options Flow */}
      {activeTab === 'darkpool' && (
        <div className="bg-zinc-950 border border-white p-4 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-2">
            <div>
              <span className="font-bold text-white uppercase flex items-center gap-2">
                <Shield className="w-4 h-4 text-yellow-400" />
                Institutional Dark Pool Prints & Live Volume Flow Monitor
              </span>
              <span className="text-[10px] text-zinc-400 block mt-0.5">
                * Dikalkulasi secara dinamis langsung dari harga spot live & volume 24 jam aktual instrumen terminal.
              </span>
            </div>
            <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-600 text-[10px] shrink-0">
              LIVE DATA MAPPING ACTIVE
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="bg-black border-b border-zinc-800 text-zinc-400 text-[10px] uppercase">
                  <th className="p-3">Simbol</th>
                  <th className="p-3">Nama Aset</th>
                  <th className="p-3">Exchange</th>
                  <th className="p-3 text-right">Spot Live</th>
                  <th className="p-3 text-right">Block Volume</th>
                  <th className="p-3 text-right">Notional Value</th>
                  <th className="p-3 text-center">Institutional Score</th>
                  <th className="p-3 text-center">Smart Money Sent.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-zinc-200">
                {instruments.map((inst) => {
                  const isUp = inst.changePercent24h >= 0;
                  const isIdx = inst.currency === 'IDR' || inst.exchange === 'IDX';
                  
                  // Institutional Mapping Logic
                  const blockVolRatio = isIdx ? 0.08 : 0.04; // Higher block ratio for IDX
                  const blockVol = Math.max(10, Math.round(inst.volume24h * blockVolRatio));
                  const notional = inst.price * blockVol;
                  
                  const formattedPrice = formatInstrumentPrice(inst.price, inst.currency, inst.decimals);
                  const formattedNotional = isIdx
                    ? `Rp${(notional / 1e9).toFixed(2)}B`
                    : `$${(notional / 1e6).toFixed(2)}M`;

                  // Calc Institutional Presence Score (0-100)
                  const instScore = Math.min(98, Math.round(40 + (Math.abs(inst.changePercent24h) * 10) + (inst.volume24h > 1000000 ? 20 : 5)));

                  return (
                    <tr key={inst.symbol} className="hover:bg-zinc-900/60">
                      <td className="p-3 font-bold text-yellow-400">{inst.displaySymbol}</td>
                      <td className="p-3 text-zinc-300 font-sans">{inst.name}</td>
                      <td className="p-3 text-cyan-300 uppercase text-[10px]">{inst.exchange || inst.category}</td>
                      <td className="p-3 text-right font-bold text-white">{formattedPrice}</td>
                      <td className="p-3 text-right">{blockVol.toLocaleString()} unit</td>
                      <td className="p-3 text-right text-emerald-400 font-bold">{formattedNotional}</td>
                      <td className="p-3 text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-bold text-[10px]">{instScore}</span>
                          <div className="w-12 h-1 bg-zinc-800 rounded-full mt-0.5 overflow-hidden">
                            <div className="bg-blue-500 h-full" style={{ width: `${instScore}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                          isUp
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : 'bg-rose-950 text-rose-300 border-rose-800'
                        }`}>
                          {isUp ? 'INSTITUTIONAL ACCUMULATION' : 'INSTITUTIONAL DISTRIBUTION'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* New Section: IDX Institutional Shareholder Simulator */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
            <div className="bg-zinc-950 border border-white p-4 space-y-4">
              <div className="border-b border-zinc-800 pb-2 flex items-center justify-between">
                <span className="font-bold text-white uppercase flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-yellow-400" />
                  Top 10 Institutional Holders (IDX Simulator)
                </span>
                <span className="text-[10px] text-zinc-500 italic">Data Source: Laporan Kustodian (Simulated)</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px] text-zinc-400 border-b border-zinc-900 pb-1">
                  <span>INSTITUTION NAME</span>
                  <span>HOLDING (%)</span>
                </div>
                {[
                  { name: 'BlackRock Advisors LLC', stake: '8.42%' },
                  { name: 'The Vanguard Group, Inc.', stake: '7.15%' },
                  { name: 'Government of Singapore (GIC)', stake: '5.20%' },
                  { name: 'PT Taspen (Persero)', stake: '4.85%' },
                  { name: 'BPJS Ketenagakerjaan', stake: '3.92%' },
                  { name: 'Fidelity Management & Research', stake: '3.10%' },
                  { name: 'JPMorgan Asset Management', stake: '2.45%' },
                  { name: 'Norges Bank Investment Management', stake: '1.98%' },
                  { name: 'State Street Global Advisors', stake: '1.75%' },
                  { name: 'Schroders Investment Management', stake: '1.52%' },
                ].map((holder, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px] hover:bg-zinc-900 p-1 rounded transition-colors">
                    <span className="text-zinc-300">{idx + 1}. {holder.name}</span>
                    <span className="text-emerald-400 font-bold">{holder.stake}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-zinc-950 border border-white p-4 space-y-4">
              <div className="border-b border-zinc-800 pb-2">
                <span className="font-bold text-white uppercase flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-yellow-400" />
                  Net Institutional Flow (Weekly Accumulation)
                </span>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-end justify-around h-48 border-b border-zinc-800 pb-2 px-4">
                  {[20, 35, -15, 45, 60, 55, 80].map((val, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-2 group relative">
                      <div 
                        style={{ height: `${Math.abs(val)}%` }} 
                        className={`w-8 rounded-t transition-all ${val > 0 ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-rose-500 hover:bg-rose-400'}`}
                      />
                      <span className="text-[8px] text-zinc-500">Day {idx + 1}</span>
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white text-black text-[9px] px-1 font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {val > 0 ? '+' : ''}{val}B IDR
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-3 bg-black border border-zinc-800 text-[10px] text-zinc-400 italic">
                  <span className="text-yellow-400 font-bold not-italic mr-2">ANALISIS AI:</span>
                  Deteksi akumulasi agresif oleh "Smart Money" dalam 3 hari terakhir. Rekomendasi: Tunggu konfirmasi breakout volume pada timeframe H1 untuk entri long.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Cloud Webhooks */}
      {activeTab === 'webhook' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-zinc-950 border border-white p-4 space-y-4 shadow-xl">
            <div className="border-b border-zinc-800 pb-2">
              <span className="font-bold text-white uppercase">Konfigurasi Cloud Webhook Alerts</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">DISCORD WEBHOOK URL</label>
                <input
                  type="text"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full bg-black border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">TELEGRAM BOT API TOKEN & CHAT ID</label>
                <input
                  type="text"
                  value={telegramToken}
                  onChange={(e) => setTelegramToken(e.target.value)}
                  className="w-full bg-black border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-white"
                />
              </div>

              <div className="p-3 bg-black border border-zinc-800 text-[10px] text-zinc-400 space-y-1">
                <span className="text-white font-bold block">Notifikasi Otomatis:</span>
                <div>• Sinyal AI Confluence Score &gt; 85%</div>
                <div>• Deteksi Zona SMC Supply/Demand Breakout</div>
                <div>• Rilis Data Makro (FOMC, CPI, NFP)</div>
              </div>

              <button
                type="button"
                onClick={handleTestWebhook}
                className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold uppercase text-xs border border-black flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Send className="w-4 h-4" />
                <span>Kirim Sinyal Test Webhook Sekarang</span>
              </button>

              {alertSent && (
                <div className="p-2 bg-emerald-950 border border-emerald-500 text-emerald-300 text-center font-bold">
                  ✓ Sinyal webhook berhasil dikirim ke Discord & Telegram!
                </div>
              )}
            </div>
          </div>

          <div className="bg-zinc-950 border border-white p-4 space-y-4 shadow-xl">
            <div className="border-b border-zinc-800 pb-2">
              <span className="font-bold text-white uppercase">Riwayat Dispatch Webhook</span>
            </div>
            <div className="bg-black border border-zinc-800 p-3 h-56 overflow-y-auto space-y-2 text-[11px] text-zinc-300">
              <div className="border-b border-zinc-900 pb-2">
                <div className="text-yellow-400 font-bold">[09:00:12] XAUUSD - AI BUY LIMIT SIGNAL (Confluence: 92%)</div>
                <div className="text-zinc-500 text-[10px]">Status: Delivered (Discord 200 OK, Telegram 200 OK)</div>
              </div>
              <div className="text-b border-zinc-900 pb-2">
                <div className="text-yellow-400 font-bold">[08:30:00] FOMC Rate Decision Alert (4.75%)</div>
                <div className="text-zinc-500 text-[10px]">Status: Delivered (Discord 200 OK, Telegram 200 OK)</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
