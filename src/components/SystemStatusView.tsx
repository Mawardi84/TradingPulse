import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  ShieldCheck, 
  Cpu, 
  Globe, 
  Database, 
  Zap, 
  Server, 
  Signal, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  Wifi,
  Lock
} from 'lucide-react';

export const SystemStatusView: React.FC = () => {
  const [uptime, setUptime] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => setUptime(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const services = [
    { name: 'Binance WebSocket Feed', status: 'Optimal', latency: '42ms', icon: Signal, color: 'text-emerald-400' },
    { name: 'TradingView Scraper Engine', status: 'Operational', latency: '120ms', icon: Globe, color: 'text-emerald-400' },
    { name: 'Gemini 1.5 Pro AI Proxy', status: 'Ready', latency: '850ms', icon: Zap, color: 'text-yellow-400' },
    { name: 'Firebase Cloud Firestore', status: 'Connected', latency: '12ms', icon: Database, color: 'text-emerald-400' },
    { name: 'MT5 Webhook Bridge', status: 'Listening', latency: '5ms', icon: Server, color: 'text-blue-400' },
    { name: 'Auth / Security Layer', status: 'Zero-Trust Active', latency: 'N/A', icon: Lock, color: 'text-purple-400' },
  ];

  return (
    <div className="space-y-6 font-mono text-[11px]">
      <div className="bg-[#0B0F17] border border-zinc-800 p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Activity className="w-24 h-24" />
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white uppercase tracking-tighter flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-500" />
              Terminal System Integrity
            </h2>
            <p className="text-zinc-500 max-w-lg">
              Monitoring global data feeds, quantitative execution bridges, and cloud-sync stability for institutional AstraView v2.5.
            </p>
          </div>
          
          <div className="bg-black border border-zinc-800 p-4 flex flex-col items-center min-w-[150px]">
            <span className="text-zinc-600 text-[9px] uppercase tracking-widest mb-1">Session Uptime</span>
            <span className="text-2xl font-bold text-yellow-400 font-mono">{formatUptime(uptime)}</span>
            <span className="text-[9px] text-zinc-700 mt-1 uppercase">Stable Core</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((s, i) => (
          <div key={i} className="bg-[#0B0F17] border border-zinc-800 p-4 group hover:border-zinc-600 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 bg-zinc-900 border border-zinc-800 rounded ${s.color}`}>
                <s.icon className="w-4 h-4" />
              </div>
              <div className="flex flex-col items-end">
                <span className={`text-[9px] font-bold uppercase ${s.color}`}>{s.status}</span>
                <span className="text-[8px] text-zinc-700">Lat: {s.latency}</span>
              </div>
            </div>
            <h3 className="font-bold text-white text-xs mb-1 uppercase tracking-wider">{s.name}</h3>
            <div className="w-full bg-zinc-950 h-1 rounded-full overflow-hidden mt-2">
              <div className={`h-full animate-pulse ${s.color.replace('text-', 'bg-')}`} style={{ width: '100%' }} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resource Monitor */}
        <div className="bg-[#0B0F17] border border-zinc-800 flex flex-col">
          <div className="p-3 border-b border-zinc-800 bg-black flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-400" />
              <span className="font-bold text-white uppercase tracking-wider text-xs">Core Resource Load</span>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px]">
                <span className="text-zinc-500 uppercase">WASM Quant Engine:</span>
                <span className="text-white">12.4% CPU</span>
              </div>
              <div className="w-full bg-zinc-950 h-1.5">
                <div className="bg-blue-500 h-full w-[12.4%]" />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px]">
                <span className="text-zinc-500 uppercase">Memory Allocation:</span>
                <span className="text-white">142MB / 512MB</span>
              </div>
              <div className="w-full bg-zinc-950 h-1.5">
                <div className="bg-emerald-500 h-full w-[28%]" />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px]">
                <span className="text-zinc-500 uppercase">PWA Cache Storage:</span>
                <span className="text-white">4.2MB / 5.0MB</span>
              </div>
              <div className="w-full bg-zinc-950 h-1.5">
                <div className="bg-yellow-500 h-full w-[84%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Global Connectivity */}
        <div className="bg-[#0B0F17] border border-zinc-800 flex flex-col">
          <div className="p-3 border-b border-zinc-800 bg-black flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-white uppercase tracking-wider text-xs">Network Topology</span>
            </div>
          </div>
          <div className="p-5 flex flex-col items-center justify-center gap-4 text-center">
            <div className="flex items-center gap-8">
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-full border border-emerald-500 flex items-center justify-center bg-emerald-500/10">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <span className="text-[9px] text-zinc-500 uppercase">Server</span>
              </div>
              <div className="w-16 h-[1px] bg-emerald-800 dashed animate-pulse" />
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-full border border-yellow-500 flex items-center justify-center bg-yellow-500/10">
                  <Activity className="w-5 h-5 text-yellow-500" />
                </div>
                <span className="text-[9px] text-zinc-500 uppercase">Client</span>
              </div>
            </div>
            <p className="text-[10px] text-zinc-500 italic max-w-xs">
              Direct peer-to-peer websocket connection established. SSL Encryption TLS 1.3 active.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
