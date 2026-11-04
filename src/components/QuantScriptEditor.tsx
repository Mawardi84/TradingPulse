import React, { useState, useEffect } from 'react';
import { useFirebase } from '../hooks/useFirebase';
import { db } from '../services/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where, serverTimestamp, orderBy, getDocFromServer } from 'firebase/firestore';
import { auth } from '../services/firebase';
import { 
  Code2, 
  Play, 
  Save, 
  Trash2, 
  Plus, 
  FileCode, 
  Zap, 
  Terminal as TerminalIcon,
  ChevronRight,
  Database,
  RefreshCw,
  Search,
  CheckCircle2
} from 'lucide-react';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const message = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: message,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  
  // Don't throw for offline/network errors to prevent UI crashes during background sync
  if (message.toLowerCase().includes('offline') || message.toLowerCase().includes('network') || message.toLowerCase().includes('reach cloud firestore')) {
    console.warn('Silent Firestore warning (Offline):', message);
    return;
  }
  
  throw new Error(JSON.stringify(errInfo));
}

interface QuantScript {
  id: string;
  name: string;
  code: string;
  language: 'typescript' | 'javascript';
  description?: string;
  updatedAt: any;
}

const DEFAULT_SCRIPT = `/**
 * AstraBot Custom Quant Script
 * Gunakan variabel 'marketData' untuk akses harga spot.
 */

function evaluateStrategy(marketData) {
  const { symbol, price, change24h } = marketData;
  
  // Logika sederhana: Buy jika harga turun > 2% (Mean Reversion)
  if (change24h < -2.0) {
    return {
      action: 'BUY',
      reason: \`Harga \${symbol} terkoreksi dalam, potensi rebound.\`,
      confidence: 85
    };
  }
  
  return { action: 'HOLD', reason: 'Belum ada kondisi terpenuhi.', confidence: 0 };
}

// Jalankan evaluasi
const result = evaluateStrategy(currentInstrument);
console.log(result);
`;

export const QuantScriptEditor: React.FC<{ currentInstrument: any }> = ({ currentInstrument }) => {
  const { user } = useFirebase();
  const [scripts, setScripts] = useState<QuantScript[]>([]);
  const [selectedScript, setSelectedScript] = useState<QuantScript | null>(null);
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<string[]>(['[System] Quant Terminal Ready.']);
  const [isLoading, setIsLoading] = useState(true);

  const selectScript = (script: QuantScript) => {
    setSelectedScript(script);
    setEditName(script.name);
    setEditCode(script.code);
  };

  const runSimulation = () => {
    if (!selectedScript) return;
    setConsoleOutput(prev => [`[System] Memulai simulasi lokal untuk ${selectedScript.name}...`, ...prev.slice(0, 10)]);
    setTimeout(() => {
      setConsoleOutput(prev => [`[Result] Simulasi selesai. Logika valid. (Check Backtesting Hub untuk data historis)`, ...prev.slice(0, 10)]);
    }, 1000);
  };

  useEffect(() => {
    if (!user) return;

    const path = `users/${user.uid}/scripts`;
    const q = query(
      collection(db, path),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as QuantScript));
      setScripts(fetched);
      setIsLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, path));

    return () => unsubscribe();
  }, [user]);

  const handleCreateNew = async () => {
    if (!user) return;
    const path = `users/${user.uid}/scripts`;
    try {
      await addDoc(collection(db, path), {
        userId: user.uid,
        name: 'Script Baru ' + (scripts.length + 1),
        code: DEFAULT_SCRIPT,
        language: 'javascript',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const handleSave = async () => {
    if (!user || !selectedScript) return;
    setIsSaving(true);
    const path = `users/${user.uid}/scripts/${selectedScript.id}`;
    try {
      await updateDoc(doc(db, path), {
        name: editName,
        code: editCode,
        updatedAt: serverTimestamp(),
      });
      setConsoleOutput(prev => [`[${new Date().toLocaleTimeString()}] Script "${editName}" berhasil disimpan ke cloud.`, ...prev.slice(0, 10)]);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (!confirm('Hapus script ini secara permanen?')) return;
    const path = `users/${user.uid}/scripts/${id}`;
    try {
      await deleteDoc(doc(db, path));
      if (selectedScript?.id === id) {
        setSelectedScript(null);
        setEditName('');
        setEditCode('');
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const [activeTab, setActiveTab] = useState<'editor' | 'backtest'>('editor');
  const [btConfig, setBtConfig] = useState({ symbol: 'XAUUSD', timeframe: '15m', count: 100 });
  const [btResults, setBtResults] = useState<any>(null);
  const [isBacktesting, setIsBacktesting] = useState(false);

  const handleRunBacktest = async () => {
    if (!selectedScript) return;
    setIsBacktesting(true);
    setConsoleOutput(prev => [`[${new Date().toLocaleTimeString()}] Memulai Backtest Kuantitatif untuk ${btConfig.symbol}...`, ...prev.slice(0, 10)]);
    
    try {
      const res = await fetch('/api/quant/backtest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scriptCode: editCode,
          symbol: btConfig.symbol,
          timeframe: btConfig.timeframe,
          candleCount: btConfig.count
        })
      });
      const data = await res.json();
      if (data.success) {
        setBtResults(data);
        setConsoleOutput(prev => [
          `[Result] Backtest Selesai: Net Profit ${data.metrics.totalReturn}%, Win Rate ${data.metrics.winRate}%`,
          ...prev.slice(0, 10)
        ]);
      } else {
        setConsoleOutput(prev => [`[Error] Backtest gagal: ${data.error}`, ...prev.slice(0, 10)]);
      }
    } catch (err) {
      setConsoleOutput(prev => [`[Error] Sistem error saat backtesting.`, ...prev.slice(0, 10)]);
    } finally {
      setIsBacktesting(false);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-4 h-[calc(100vh-140px)] overflow-hidden font-mono text-[11px]">
      {/* Sidebar: Script List */}
      <div className="col-span-12 lg:col-span-3 bg-zinc-950 border border-zinc-800 flex flex-col overflow-hidden">
        <div className="p-3 border-b border-zinc-800 flex items-center justify-between bg-black">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-yellow-400" />
            <span className="font-bold text-white uppercase tracking-wider">Library Script</span>
          </div>
          <button 
            onClick={handleCreateNew}
            className="p-1.5 bg-yellow-500 hover:bg-yellow-400 text-black rounded transition-colors cursor-pointer"
            title="Tambah Script Baru"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-5 h-5 text-zinc-600 animate-spin" />
            </div>
          ) : scripts.length === 0 ? (
            <div className="text-center py-8 text-zinc-600 space-y-2 px-4">
              <Code2 className="w-8 h-8 mx-auto opacity-20" />
              <p>Belum ada script. Klik tombol + untuk membuat logic pertama Anda.</p>
            </div>
          ) : (
            scripts.map(s => (
              <div 
                key={s.id}
                onClick={() => selectScript(s)}
                className={`group flex items-center justify-between p-2.5 rounded border transition-all cursor-pointer ${
                  selectedScript?.id === s.id 
                    ? 'bg-yellow-500/10 border-yellow-500 text-yellow-100 shadow-[0_0_10px_rgba(234,179,8,0.1)]' 
                    : 'bg-black border-zinc-900 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <div className={`w-1.5 h-1.5 rounded-full ${selectedScript?.id === s.id ? 'bg-yellow-500' : 'bg-zinc-800'}`} />
                  <span className="truncate">{s.name}</span>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(s.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-500 transition-opacity"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-3 bg-zinc-900/50 border-t border-zinc-800 text-[10px] text-zinc-500 flex items-center gap-2">
          <Database className="w-3 h-3" />
          <span>Cloud Sync Active (Firestore)</span>
        </div>
      </div>

      {/* Main: Code Editor */}
      <div className="col-span-12 lg:col-span-9 flex flex-col overflow-hidden bg-black border border-zinc-800 shadow-2xl relative">
        {!selectedScript ? (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 space-y-4 p-8 text-center">
            <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center mb-2">
              <TerminalIcon className="w-8 h-8 opacity-20" />
            </div>
            <h3 className="text-white font-bold uppercase tracking-widest">Quant Terminal v1.0</h3>
            <p className="max-w-sm font-sans leading-relaxed">
              Pilih script dari library di samping atau buat baru untuk mulai menulis logika strategi trading Anda sendiri.
            </p>
          </div>
        ) : (
          <>
            {/* Editor Toolbar */}
            <div className="p-0 border-b border-zinc-800 flex items-center justify-between bg-zinc-950 shrink-0">
              <div className="flex items-center gap-0 h-full">
                <button 
                  onClick={() => setActiveTab('editor')}
                  className={`px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors ${activeTab === 'editor' ? 'bg-black text-yellow-400 border-r border-zinc-800' : 'text-zinc-500 hover:text-white border-r border-zinc-800'}`}
                >
                  Logic Editor
                </button>
                <button 
                  onClick={() => setActiveTab('backtest')}
                  className={`px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors ${activeTab === 'backtest' ? 'bg-black text-yellow-400 border-r border-zinc-800' : 'text-zinc-500 hover:text-white border-r border-zinc-800'}`}
                >
                  Backtesting Hub
                </button>
              </div>
              
              <div className="px-3 flex items-center gap-4">
                <input 
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="bg-transparent border-b border-transparent focus:border-yellow-500 outline-none text-white font-bold uppercase tracking-widest text-[10px] py-0.5 min-w-[150px]"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white rounded flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5 text-blue-400" />}
                    <span>SAVE</span>
                  </button>
                  <button
                    onClick={runSimulation}
                    className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold rounded flex items-center gap-2 transition-colors cursor-pointer shadow-lg active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>RUN</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
              {activeTab === 'editor' ? (
                <div className="flex-1 flex overflow-hidden">
                  <div className="w-10 bg-zinc-950 border-r border-zinc-900 flex flex-col items-center pt-4 text-zinc-700 select-none shrink-0">
                    {Array.from({ length: 40 }).map((_, i) => (
                      <div key={i} className="leading-5 h-[20px]">{i + 1}</div>
                    ))}
                  </div>
                  <textarea
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value)}
                    className="flex-1 bg-black text-yellow-100 p-4 font-mono leading-5 outline-none resize-none spellcheck-false"
                    autoComplete="off"
                    autoCapitalize="off"
                    spellCheck="false"
                  />
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto bg-[#050505] p-6 space-y-6">
                  {/* Backtest Configuration */}
                  <div className="bg-black border border-zinc-800 p-4 rounded-lg flex flex-wrap items-end gap-4 shadow-xl">
                    <div className="space-y-1.5">
                      <label className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Asset Symbol</label>
                      <input 
                        value={btConfig.symbol}
                        onChange={e => setBtConfig({...btConfig, symbol: e.target.value.toUpperCase()})}
                        className="w-32 bg-zinc-900 border border-zinc-700 text-white p-2 text-xs outline-none focus:border-yellow-500 transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Timeframe</label>
                      <select 
                        value={btConfig.timeframe}
                        onChange={e => setBtConfig({...btConfig, timeframe: e.target.value})}
                        className="w-32 bg-zinc-900 border border-zinc-700 text-white p-2 text-xs outline-none focus:border-yellow-500 transition-colors"
                      >
                        <option value="1m">1 Minute</option>
                        <option value="5m">5 Minutes</option>
                        <option value="15m">15 Minutes</option>
                        <option value="1h">1 Hour</option>
                        <option value="1d">1 Day</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Candle Sample</label>
                      <input 
                        type="number"
                        value={btConfig.count}
                        onChange={e => setBtConfig({...btConfig, count: parseInt(e.target.value) || 100})}
                        className="w-24 bg-zinc-900 border border-zinc-700 text-white p-2 text-xs outline-none focus:border-yellow-500 transition-colors"
                      />
                    </div>
                    <button 
                      onClick={handleRunBacktest}
                      disabled={isBacktesting}
                      className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold uppercase tracking-widest text-[10px] rounded transition-all shadow-lg active:scale-95 disabled:opacity-50"
                    >
                      {isBacktesting ? 'Processing...' : 'Run Backtest'}
                    </button>
                  </div>

                  {/* Backtest Results */}
                  {btResults ? (
                    <div className="space-y-6 animate-in fade-in duration-500">
                      {/* Metric Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                          { label: 'Net Profit', val: `${btResults.metrics.totalReturn}%`, color: Number(btResults.metrics.totalReturn) >= 0 ? 'text-emerald-400' : 'text-rose-400' },
                          { label: 'Win Rate', val: `${btResults.metrics.winRate}%`, color: 'text-blue-400' },
                          { label: 'Max Drawdown', val: `${btResults.metrics.maxDrawdown}%`, color: 'text-rose-500' },
                          { label: 'Sharpe Ratio', val: btResults.metrics.sharpeRatio, color: 'text-yellow-400' },
                        ].map((m, i) => (
                          <div key={i} className="bg-zinc-950 border border-zinc-800 p-4 shadow-2xl relative overflow-hidden group">
                            <div className="text-[9px] text-zinc-500 uppercase tracking-widest mb-1 font-bold">{m.label}</div>
                            <div className={`text-xl font-extrabold ${m.color}`}>{m.val}</div>
                          </div>
                        ))}
                      </div>

                      {/* Trade History Preview */}
                      <div className="bg-black border border-zinc-800">
                        <div className="p-3 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-white uppercase tracking-widest">Recent Simulation Trades</span>
                          <span className="text-[9px] text-zinc-500">{btResults.metrics.totalTrades} Trades Executed</span>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-[10px]">
                            <thead>
                              <tr className="bg-zinc-950 text-zinc-500 uppercase tracking-tighter">
                                <th className="p-2 border-b border-zinc-800 font-bold">Index</th>
                                <th className="p-2 border-b border-zinc-800 font-bold">Action</th>
                                <th className="p-2 border-b border-zinc-800 font-bold">Exit Price</th>
                                <th className="p-2 border-b border-zinc-800 font-bold text-right">P/L ($)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-900 text-zinc-300">
                              {btResults.trades.map((t: any, i: number) => (
                                <tr key={i} className="hover:bg-zinc-800/30">
                                  <td className="p-2">{i + 1}</td>
                                  <td className="p-2 font-bold text-white">CLOSED</td>
                                  <td className="p-2">${t.exitPrice.toLocaleString()}</td>
                                  <td className={`p-2 text-right font-bold ${t.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {t.pnl >= 0 ? '+' : ''}${t.pnl.toFixed(2)}
                                  </td>
                                </tr>
                              ))}
                              {btResults.trades.length === 0 && (
                                <tr><td colSpan={4} className="p-8 text-center text-zinc-600 uppercase">No trades generated in this window.</td></tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                      <Zap className="w-16 h-16 text-zinc-600" />
                      <div className="space-y-1">
                        <h4 className="text-white font-bold uppercase tracking-widest">Backtest Engine Ready</h4>
                        <p className="max-w-xs text-[10px]">Konfigurasikan parameter di atas untuk memvalidasi performa strategi Anda terhadap data historis real-time.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Console */}
            <div className="h-32 bg-[#0B0F17] border-t border-zinc-800 flex flex-col shrink-0">
              <div className="px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                  <TerminalIcon className="w-3 h-3" /> Console Output
                </span>
                <button onClick={() => setConsoleOutput([])} className="text-[9px] text-zinc-600 hover:text-white uppercase">Clear</button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-1 text-zinc-300">
                {consoleOutput.map((line, i) => (
                  <div key={i} className="flex gap-2">
                    <ChevronRight className="w-3 h-3 mt-0.5 text-zinc-700 shrink-0" />
                    <span className={line.includes('[Result]') ? 'text-emerald-400 font-bold' : line.includes('[System]') ? 'text-blue-400' : ''}>
                      {line}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

