import React from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Zap, 
  Target, 
  Layers, 
  Cpu, 
  Shield, 
  Smartphone, 
  BarChart3 
} from 'lucide-react';

export const RoadmapView: React.FC = () => {
  const roadmapItems = [
    {
      phase: 'Phase 1-3: Core Foundation',
      status: 'COMPLETED',
      items: [
        'Real-time Market Data Feeds (Binance, Interbank)',
        'Macro Quantitative Formula Engine (CPI, NFP, PPI)',
        'SMC Supply/Demand Charting Engine',
        'Economic Calendar with Live Sync',
      ]
    },
    {
      phase: 'Phase 4-5: Institutional & Lab',
      status: 'COMPLETED',
      items: [
        'MT5 Expert Advisor Webhook Bridge',
        'AI Quant Backtest Lab (MQL5 Simulator)',
        'Dark Pool Print Mapping (IDX & Global)',
        'Cloud Portfolio Sync with Firebase',
      ]
    },
    {
      phase: 'Phase 6: Professional Upgrade (Current)',
      status: 'IN_PROGRESS',
      items: [
        'Narrative Synthesis AI v2.5 (Multi-news analysis)',
        'Voice Command Terminal Control (Natural Language)',
        'Advanced IDX Institutional Analytics (Shareholders)',
        'PWA Trusted Web Activity (TWA) Optimization',
      ]
    },
    {
      phase: 'Phase 7: Elite Expansion (Upcoming)',
      status: 'PLANNED',
      items: [
        'Prop Firm Sniper Module (Drawdown Protection)',
        'Social Trading Sentiment Stream (Twitter/X)',
        'Deep Learning Price Prediction (LSTM Models)',
        'Cross-Exchange Arbitrage Monitor',
      ]
    }
  ];

  return (
    <div className="space-y-6 font-mono p-4 bg-black text-white">
      <div className="bg-zinc-950 border border-white p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2 opacity-10">
          <Target className="w-32 h-32 text-yellow-400" />
        </div>
        
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-400 text-black flex items-center justify-center font-extrabold text-lg">
              RD
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-[0.2em] uppercase">AstraView Terminal Roadmap</h1>
              <p className="text-xs text-zinc-400">Institutional Upgrade Path & Feature Deployment Schedule</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roadmapItems.map((phase, idx) => (
          <div key={idx} className="bg-zinc-950 border border-white p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="font-bold text-sm text-yellow-400">{phase.phase}</span>
              <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded border ${
                phase.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-400 border-emerald-600' :
                phase.status === 'IN_PROGRESS' ? 'bg-blue-950 text-blue-400 border-blue-600 animate-pulse' :
                'bg-zinc-900 text-zinc-500 border-zinc-700'
              }`}>
                {phase.status}
              </span>
            </div>
            <ul className="space-y-3">
              {phase.items.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-[11px]">
                  {phase.status === 'COMPLETED' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  ) : phase.status === 'IN_PROGRESS' ? (
                    <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-zinc-700 shrink-0 mt-0.5" />
                  )}
                  <span className={phase.status === 'PLANNED' ? 'text-zinc-500' : 'text-zinc-300'}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="bg-yellow-400/5 border border-yellow-400/30 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-yellow-400" />
          <span className="text-[10px] text-zinc-300">
            AstraView Terminal is built for institutional-grade reliability and low-latency execution. 
            V2.5/V3.0 Focus: <strong className="text-white">AI-Narrative & Voice Precision.</strong>
          </span>
        </div>
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="px-4 py-2 bg-yellow-400 text-black font-extrabold text-[10px] uppercase border border-black hover:bg-yellow-300 transition-colors cursor-pointer"
        >
          Check System Updates
        </button>
      </div>
    </div>
  );
};
