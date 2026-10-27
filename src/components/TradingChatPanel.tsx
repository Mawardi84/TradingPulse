import React, { useState, useEffect, useRef } from 'react';
import { Instrument } from '../types/market';
import { MessageSquare, Send, TrendingUp, TrendingDown, Bot, Shield, Zap, Sparkles } from 'lucide-react';

export interface ChatMessage {
  id: string;
  sender: string;
  role: 'analyst' | 'bot' | 'trader' | 'system';
  avatar: string;
  timestamp: string;
  text: string;
  badge?: string;
  signal?: {
    symbol: string;
    action: 'BUY' | 'SELL';
    entry: number;
    sl: number;
    tp: number;
  };
}

export const TradingChatPanel: React.FC<{
  currentInstrument: Instrument;
  onJumpToAsset?: (symbol: string) => void;
}> = ({ currentInstrument, onJumpToAsset }) => {
  const [activeChannel, setActiveChannel] = useState<'#all-desk' | '#signals' | '#macro-flow'>('#all-desk');
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'AstraBot Quant',
      role: 'bot',
      avatar: '🤖',
      timestamp: 'Baru saja',
      text: `Sinyal kuantitatif terdeteksi pada ${currentInstrument.displaySymbol}: RSI & EMA menunjukkan momentum kelanjutan tren dengan rasio Risk/Reward 1:2.4.`,
      badge: 'ALGO SIGNAL',
      signal: {
        symbol: currentInstrument.symbol,
        action: currentInstrument.changePercent24h >= 0 ? 'BUY' : 'SELL',
        entry: currentInstrument.price,
        sl: Number((currentInstrument.price * (currentInstrument.changePercent24h >= 0 ? 0.992 : 1.008)).toFixed(currentInstrument.decimals)),
        tp: Number((currentInstrument.price * (currentInstrument.changePercent24h >= 0 ? 1.018 : 0.982)).toFixed(currentInstrument.decimals)),
      },
    },
    {
      id: 'm-2',
      sender: 'Macro Desk FX',
      role: 'analyst',
      avatar: '🏛️',
      timestamp: '5 mnt lalu',
      text: 'Yield US 10-Year mengalami konsolidasi di 4.24%. Waspadai rilis data ketenagakerjaan dan NFP akhir pekan ini terhadap volatilitas Dolar dan XAU/USD.',
      badge: 'MACRO',
    },
    {
      id: 'm-3',
      sender: 'Senior Trader Alex',
      role: 'trader',
      avatar: '👨‍💼',
      timestamp: '12 mnt lalu',
      text: 'Support kuat terbentuk pada area demand H4. Likuiditas buy-side di atas resistance siap diserap jika breakout terkonfirmasi volume.',
      badge: 'PRO TRADER',
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'Anda (Trader)',
      role: 'trader',
      avatar: '👤',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: inputText,
    };

    setMessages((prev) => [...prev, userMsg]);
    const query = inputText.toLowerCase();
    setInputText('');

    // Automated smart quantitative response
    setTimeout(() => {
      let botReply = '';
      if (query.includes('buy') || query.includes('beli') || query.includes('long')) {
        botReply = `Analisis Order Buy ${currentInstrument.displaySymbol}: Rekomendasi entri bertahap di ${currentInstrument.price.toLocaleString()}, pasang Stop Loss di ${ (currentInstrument.price * 0.993).toFixed(currentInstrument.decimals) } untuk menjaga risiko akun < 1.5%.`;
      } else if (query.includes('sell') || query.includes('jual') || query.includes('short')) {
        botReply = `Analisis Order Sell ${currentInstrument.displaySymbol}: Konfirmasi retest area supply di ${currentInstrument.high24h.toLocaleString()}, target take profit terdekat di ${ (currentInstrument.price * 0.985).toFixed(currentInstrument.decimals) }.`;
      } else if (query.includes('support') || query.includes('resist') || query.includes('level')) {
        botReply = `Level Kunci ${currentInstrument.displaySymbol}: Support terdekat di ${currentInstrument.low24h.toLocaleString()}, Resistensi terdekat di ${currentInstrument.high24h.toLocaleString()}.`;
      } else {
        botReply = `Desk Trading: Terima kasih atas pandangannya. Volatilitas 24h untuk ${currentInstrument.displaySymbol} saat ini adalah ${currentInstrument.changePercent24h.toFixed(2)}% dengan volume $${(currentInstrument.volume24h / 1000000).toFixed(1)}M.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'AstraBot Quant',
          role: 'bot',
          avatar: '🤖',
          timestamp: 'Baru saja',
          text: botReply,
          badge: 'DESK COPILOT',
        },
      ]);
    }, 750);
  };

  const handleQuickSignal = (action: 'BUY' | 'SELL') => {
    const sl = Number((currentInstrument.price * (action === 'BUY' ? 0.993 : 1.007)).toFixed(currentInstrument.decimals));
    const tp = Number((currentInstrument.price * (action === 'BUY' ? 1.018 : 0.982)).toFixed(currentInstrument.decimals));
    const signalMsg: ChatMessage = {
      id: `sig-${Date.now()}`,
      sender: 'AstraBot Quant',
      role: 'bot',
      avatar: '⚡',
      timestamp: 'Baru saja',
      text: `Sinyal Eksekusi Cepat: ${action} ${currentInstrument.displaySymbol} @ ${currentInstrument.price.toLocaleString()}`,
      badge: 'LIVE SIGNAL',
      signal: {
        symbol: currentInstrument.symbol,
        action,
        entry: currentInstrument.price,
        sl,
        tp,
      },
    };
    setMessages((prev) => [...prev, signalMsg]);
  };

  return (
    <div className="flex flex-col h-[520px] bg-[#111722] border border-slate-800 rounded-lg shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-3.5 bg-[#0B0F17] border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
              <span>Chat Trading & Desk Sinyal</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">Room Analisis Institusional & Komunitas Live</p>
          </div>
        </div>

        {/* Channel Selector */}
        <div className="flex items-center gap-1 bg-[#111722] p-0.5 rounded border border-slate-800 text-[10px] font-mono">
          {(['#all-desk', '#signals', '#macro-flow'] as const).map((ch) => (
            <button
              key={ch}
              onClick={() => setActiveChannel(ch)}
              className={`px-2 py-0.5 rounded transition-colors ${
                activeChannel === ch ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {ch}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className="px-3 py-2 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
        <span className="text-slate-400 truncate">
          Fokus: <strong className="text-white">{currentInstrument.displaySymbol}</strong> (${currentInstrument.price.toLocaleString()})
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => handleQuickSignal('BUY')}
            className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded flex items-center gap-1 transition-colors text-[10px]"
          >
            <TrendingUp className="w-3 h-3" />
            <span>Kirim Sinyal Buy</span>
          </button>
          <button
            onClick={() => handleQuickSignal('SELL')}
            className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded flex items-center gap-1 transition-colors text-[10px]"
          >
            <TrendingDown className="w-3 h-3" />
            <span>Kirim Sinyal Sell</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3 font-mono text-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`p-3 rounded-lg border transition-all ${
              m.role === 'bot'
                ? 'bg-blue-950/20 border-blue-500/30'
                : m.sender.includes('Anda')
                ? 'bg-slate-800/60 border-slate-700 ml-4'
                : 'bg-[#0B0F17] border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{m.avatar}</span>
                <span className="font-bold text-white text-xs">{m.sender}</span>
                {m.badge && (
                  <span className="px-1.5 py-0.2 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded text-[9px] font-bold">
                    {m.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-500">{m.timestamp}</span>
            </div>

            <p className="text-slate-300 font-sans text-xs leading-relaxed">{m.text}</p>

            {/* Attached Signal Box */}
            {m.signal && (
              <div className="mt-2.5 p-2 bg-[#080C13] border border-blue-500/40 rounded flex items-center justify-between text-[11px] font-mono">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                      m.signal.action === 'BUY' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                    }`}
                  >
                    {m.signal.action} {m.signal.symbol}
                  </span>
                  <span className="text-slate-300">Entry: ${m.signal.entry.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-rose-400">SL: ${m.signal.sl.toLocaleString()}</span>
                  <span className="text-emerald-400">TP: ${m.signal.tp.toLocaleString()}</span>
                  {onJumpToAsset && (
                    <button
                      onClick={() => onJumpToAsset(m.signal!.symbol)}
                      className="px-2 py-0.5 bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white rounded text-[10px] transition-colors"
                    >
                      Buka Chart
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="p-2.5 bg-[#0B0F17] border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Diskusikan strategi / tanya analisis untuk ${currentInstrument.displaySymbol}...`}
          className="flex-1 bg-[#111722] border border-slate-800 rounded px-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded text-xs font-bold flex items-center gap-1 transition-colors shadow"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Kirim</span>
        </button>
      </form>
    </div>
  );
};
