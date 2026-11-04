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
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
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

  const selectScript = (script: QuantScript) => {
    setSelectedScript(script);
    setEditName(script.name);
    setEditCode(script.code);
    setConsoleOutput(prev => [`[System] Loaded: ${script.name}`, ...prev.slice(0, 10)]);
  };

  const runSimulation = () => {
    setConsoleOutput(prev => [`[${new Date().toLocaleTimeString()}] Menjalankan eksekusi script...`, ...prev.slice(0, 10)]);
    
    if (!selectedScript) return;

    try {
      // Create a simplified console for the script
      const scriptConsole = {
        log: (...args: any[]) => {
          const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
          setConsoleOutput(prev => [`[Log] ${msg}`, ...prev.slice(0, 20)]);
        },
        error: (...args: any[]) => {
          const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
          setConsoleOutput(prev => [`[Error] ${msg}`, ...prev.slice(0, 20)]);
        }
      };

      // Prepare the execution environment
      const context = {
        currentInstrument: {
          symbol: currentInstrument.symbol,
          displaySymbol: currentInstrument.displaySymbol,
          price: currentInstrument.price,
          change24h: currentInstrument.changePercent24h,
          timestamp: Date.now()
        },
        console: scriptConsole,
        // Mock API for the script
        AstraAPI: {
          getMarketData: () => currentInstrument,
          alert: (msg: string) => scriptConsole.log(`[ALERT] ${msg}`),
        }
      };

      // Create the execution function
      // We wrap the user code in a function that takes the context as arguments
      const runFn = new Function('context', `
        const { currentInstrument, console, AstraAPI } = context;
        ${editCode}
      `);

      // Run it
      runFn(context);

      setConsoleOutput(prev => [`[System] Eksekusi selesai untuk ${currentInstrument.displaySymbol}.`, ...prev.slice(0, 20)]);
    } catch (err: any) {
      setConsoleOutput(prev => [`[Runtime Error] ${err.message}`, ...prev.slice(0, 20)]);
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
            <div className="p-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-950 shrink-0">
              <div className="flex items-center gap-4 flex-1">
                <input 
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="bg-transparent border-b border-transparent focus:border-yellow-500 outline-none text-white font-bold uppercase tracking-widest text-xs py-0.5 min-w-[200px]"
                />
                <span className="text-[10px] text-zinc-500 uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> JavaScript ES6+
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white rounded flex items-center gap-2 transition-colors cursor-pointer"
                >
                  {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5 text-blue-400" />}
                  <span>SIMPAN</span>
                </button>
                <button
                  onClick={runSimulation}
                  className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold rounded flex items-center gap-2 transition-colors cursor-pointer shadow-lg active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>RUN LOGIC</span>
                </button>
              </div>
            </div>

            {/* Code Textarea */}
            <div className="flex-1 flex overflow-hidden relative">
              {/* Line Numbers Mock */}
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
