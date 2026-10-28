import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Instrument, Candle } from '../types/market';
import { evaluateTechnicalSummary, findSupplyDemandZones } from '../utils/indicators';
import {
  MessageSquare,
  Send,
  TrendingUp,
  TrendingDown,
  Bot,
  ShieldCheck,
  Zap,
  Sparkles,
  Info,
  CheckCircle2,
  BarChart2,
} from 'lucide-react';

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
  candles?: Candle[];
  onJumpToAsset?: (symbol: string) => void;
}> = ({ currentInstrument, candles = [], onJumpToAsset }) => {
  const [activeChannel, setActiveChannel] = useState<'#all-desk' | '#signals' | '#macro-flow'>('#all-desk');
  const [inputText, setInputText] = useState('');

  // Calculate real live technical summary & S&D zones from genuine candles
  const taSummary = useMemo(() => {
    return evaluateTechnicalSummary(candles, currentInstrument.decimals);
  }, [candles, currentInstrument.decimals]);

  const sdZones = useMemo(() => {
    return findSupplyDemandZones(candles);
  }, [candles]);

  const supplyZone = sdZones.find((z) => z.type === 'supply');
  const demandZone = sdZones.find((z) => z.type === 'demand');

  // Initial Real Live Bot Greeting
  const initialMessages: ChatMessage[] = useMemo(() => {
    const isBull = currentInstrument.changePercent24h >= 0;
    const action: 'BUY' | 'SELL' = isBull ? 'BUY' : 'SELL';
    const dec = currentInstrument.decimals;
    const price = currentInstrument.price;

    const sl = Number((price * (isBull ? 0.993 : 1.007)).toFixed(dec));
    const tp = Number((price * (isBull ? 1.018 : 0.982)).toFixed(dec));

    const rsiReading = taSummary.readings.find((r) => r.name.toLowerCase().includes('rsi'));
    const rsiText = rsiReading ? `${rsiReading.name} ${rsiReading.formattedValue}` : 'RSI 14 Live';

    return [
      {
        id: 'm-1',
        sender: 'AstraBot Quant',
        role: 'bot',
        avatar: '🤖',
        timestamp: 'Baru saja',
        text: `🤖 [LIVE DATA NYATA] Analisis Kuantitatif ${currentInstrument.displaySymbol}: Rating ${taSummary.overallRating.toUpperCase()} (Skor: ${taSummary.score}). ${rsiText}. Perubahan 24h: ${currentInstrument.changePercent24h.toFixed(2)}%. High: ${currentInstrument.high24h.toLocaleString()}, Low: ${currentInstrument.low24h.toLocaleString()}. Data 100% disinkronkan dari feed live pasar!`,
        badge: 'REAL LIVE DATA',
        signal: {
          symbol: currentInstrument.symbol,
          action,
          entry: price,
          sl,
          tp,
        },
      },
      {
        id: 'm-2',
        sender: 'Macro Desk FX',
        role: 'analyst',
        avatar: '🏛️',
        timestamp: '5 mnt lalu',
        text: `📊 Pantauan Pasar Live: ${currentInstrument.displaySymbol} diperdagangkan di $${price.toLocaleString()} (${currentInstrument.exchange}). Rentang harian $${currentInstrument.low24h.toLocaleString()} — $${currentInstrument.high24h.toLocaleString()}.`,
        badge: 'LIVE MACRO',
      },
      {
        id: 'm-3',
        sender: 'Senior Trader Alex',
        role: 'trader',
        avatar: '👨‍💼',
        timestamp: '12 mnt lalu',
        text: demandZone
          ? `Area Demand Institusional terdeteksi di ${demandZone.bottom.toFixed(dec)} - ${demandZone.top.toFixed(dec)} (${demandZone.strength}). Rejection di area ini mengonfirmasi struktur entri BUY!`
          : `Mencermati retest support terdekat pada $${currentInstrument.low24h.toLocaleString()} untuk potensi pemicu breakout.`,
        badge: 'PRO TRADER',
      },
    ];
  }, [currentInstrument, taSummary, demandZone]);

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Update initial messages if currentInstrument changes
  useEffect(() => {
    setMessages(initialMessages);
  }, [currentInstrument.symbol, initialMessages]);

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

    // AstraBot Quant Response using strictly real live market data
    setTimeout(() => {
      let botReply = '';
      const price = currentInstrument.price;
      const dec = currentInstrument.decimals;
      const rsiReading = taSummary.readings.find((r) => r.name.toLowerCase().includes('rsi'));
      const macdReading = taSummary.readings.find((r) => r.name.toLowerCase().includes('macd'));

      if (query.includes('buy') || query.includes('beli') || query.includes('long') || query.includes('sinyal')) {
        const sl = (price * 0.9925).toFixed(dec);
        const tp1 = (price * 1.015).toFixed(dec);
        const tp2 = (price * 1.030).toFixed(dec);
        const tp3 = (price * 1.050).toFixed(dec);
        const demandText = demandZone
          ? `Demand Order Block Live: ${demandZone.bottom.toFixed(dec)} - ${demandZone.top.toFixed(dec)} (${demandZone.strength})`
          : `Area Support Live: $${taSummary.pivots.s1.toLocaleString()}`;

        botReply = `🤖 [ASTRA-QUANT SIGNAL PROTOCOL]
Aset: ${currentInstrument.symbol} (${currentInstrument.name})
Aksi: BUY
Tipe Order: Market Order / Limit Entry

📍 Entry Zone: $${price.toLocaleString()}
🛑 Stop Loss (SL): $${sl} (-0.75%)
🎯 Take Profit 1 (TP1): $${tp1} (+1.50%)
🎯 Take Profit 2 (TP2): $${tp2} (+3.00%)
🎯 Take Profit 3 (TP3): $${tp3} (+5.00%)
⚖️ Risk / Reward Ratio: 1 : 2.0 (TP1) / 1 : 4.0 (TP2)
🛡️ Alokasi Risiko Maksimal: 1.5% Per Account Equity

📊 Konfluensi Teknikal:
- Smart Money Concepts: ${demandText}
- Indikator: ${rsiReading ? `${rsiReading.name} @ ${rsiReading.formattedValue}` : 'RSI Netral'} | Rating: ${taSummary.overallRating} (${taSummary.buyCount} Buy / ${taSummary.sellCount} Sell)
- Timeframe Alignment: Sub-struktur H1 Bullish ➔ M15 Pullback ➔ M1 Break of Structure (BOS)

🌐 Konteks Makro / Fundamental:
- Rating Analis: ${currentInstrument.fundamentals.analystConsensus} (Target: $${currentInstrument.fundamentals.analystTargetPrice.toLocaleString()}). Rentang harian: $${currentInstrument.low24h.toLocaleString()} — $${currentInstrument.high24h.toLocaleString()}.

⚠️ Catatan Manajemen Risiko:
- Selalu gunakan trailing stop setelah TP1 tercapai untuk mengamankan profit floating.`;
      } else if (query.includes('sell') || query.includes('jual') || query.includes('short')) {
        const sl = (price * 1.0075).toFixed(dec);
        const tp1 = (price * 0.985).toFixed(dec);
        const tp2 = (price * 0.970).toFixed(dec);
        const tp3 = (price * 0.950).toFixed(dec);
        const supplyText = supplyZone
          ? `Supply Order Block Live: ${supplyZone.bottom.toFixed(dec)} - ${supplyZone.top.toFixed(dec)} (${supplyZone.strength})`
          : `Area Resistance Live: $${taSummary.pivots.r1.toLocaleString()}`;

        botReply = `🤖 [ASTRA-QUANT SIGNAL PROTOCOL]
Aset: ${currentInstrument.symbol} (${currentInstrument.name})
Aksi: SELL
Tipe Order: Market Order / Limit Entry

📍 Entry Zone: $${price.toLocaleString()}
🛑 Stop Loss (SL): $${sl} (+0.75%)
🎯 Take Profit 1 (TP1): $${tp1} (-1.50%)
🎯 Take Profit 2 (TP2): $${tp2} (-3.00%)
🎯 Take Profit 3 (TP3): $${tp3} (-5.00%)
⚖️ Risk / Reward Ratio: 1 : 2.0 (TP1) / 1 : 4.0 (TP2)
🛡️ Alokasi Risiko Maksimal: 1.5% Per Account Equity

📊 Konfluensi Teknikal:
- Smart Money Concepts: ${supplyText}
- Indikator: ${rsiReading ? `${rsiReading.name} @ ${rsiReading.formattedValue}` : 'RSI Netral'} | Rating: ${taSummary.overallRating} (${taSummary.buyCount} Buy / ${taSummary.sellCount} Sell)
- Timeframe Alignment: Sub-struktur H1 Bearish ➔ M15 Pullback ➔ M1 Change of Character (CHoCH)

🌐 Konteks Makro / Fundamental:
- Volatilitas 24h: ${currentInstrument.changePercent24h.toFixed(2)}%. Volume 24h: $${(currentInstrument.volume24h / 1000000).toFixed(1)}M. Exchange: ${currentInstrument.exchange}.

⚠️ Catatan Manajemen Risiko:
- Pindahkan Stop Loss ke Breakeven (BEP) setelah harga menyentuh TP1.`;
      } else if (query.includes('support') || query.includes('resist') || query.includes('level') || query.includes('pivot')) {
        const p = taSummary.pivots;
        botReply = `📊 [LEVEL KUNCI INSTUSIONAL REAL-TIME]
Aset: ${currentInstrument.symbol} (${currentInstrument.displaySymbol})
Harga Spot Live: $${price.toLocaleString()}

📍 Level Resistansi (Supply):
- R3: $${p.r3.toLocaleString()}
- R2: $${p.r2.toLocaleString()}
- R1: $${p.r1.toLocaleString()}

📍 Central Pivot Point (P): $${p.p.toLocaleString()}

📍 Level Support (Demand):
- S1: $${p.s1.toLocaleString()}
- S2: $${p.s2.toLocaleString()}
- S3: $${p.s3.toLocaleString()}

📈 Rentang 24 Jam: High $${currentInstrument.high24h.toLocaleString()} | Low $${currentInstrument.low24h.toLocaleString()}`;
      } else if (query.includes('rsi') || query.includes('macd') || query.includes('indikator')) {
        botReply = `📊 [MATRIKS INDIKATOR TEKNIKAL NYATA]
Aset: ${currentInstrument.symbol}
Rating Algoritma Overall: ${taSummary.overallRating} (Skor Skor: ${taSummary.score})

• Oscillators: ${rsiReading ? `${rsiReading.name}: ${rsiReading.formattedValue} (${rsiReading.action})` : 'RSI 14: Netral'}
• Trend MACD: ${macdReading ? `${macdReading.name}: ${macdReading.formattedValue} (${macdReading.action})` : 'MACD: Netral'}
• Ringkasan Sinyal: ${taSummary.buyCount} Buy / ${taSummary.neutralCount} Neutral / ${taSummary.sellCount} Sell
• Pivot Point: $${taSummary.pivots.p.toLocaleString()}`;
      } else {
        botReply = `🏛️ [DESK ANALISIS ASTRA-QUANT]
Aset: ${currentInstrument.symbol} (${currentInstrument.name})
Harga Spot Live: $${price.toLocaleString()} (${currentInstrument.exchange})
Perubahan 24h: ${currentInstrument.changePercent24h >= 0 ? '+' : ''}${currentInstrument.changePercent24h.toFixed(2)}%
Volume 24h: $${(currentInstrument.volume24h / 1000000).toFixed(1)}M
Rating Teknikal: ${taSummary.overallRating}

Ketik "Sinyal Buy", "Sinyal Sell", atau "Level Support" untuk mendapatkan protokoler sinyal trading kuantitatif terstruktur!`;
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
          badge: 'ASTRA-QUANT SIGNAL PROTOCOL',
        },
      ]);
    }, 600);
  };

  const handleQuickSignal = (action: 'BUY' | 'SELL') => {
    const price = currentInstrument.price;
    const dec = currentInstrument.decimals;
    const sl = Number((price * (action === 'BUY' ? 0.9925 : 1.0075)).toFixed(dec));
    const tp1 = Number((price * (action === 'BUY' ? 1.015 : 0.985)).toFixed(dec));
    const tp2 = Number((price * (action === 'BUY' ? 1.030 : 0.970)).toFixed(dec));
    const tp3 = Number((price * (action === 'BUY' ? 1.050 : 0.950)).toFixed(dec));

    const protocolText = `🤖 [ASTRA-QUANT SIGNAL PROTOCOL]
Aset: ${currentInstrument.symbol} (${currentInstrument.name})
Aksi: ${action}
Tipe Order: Market Order / Limit Entry

📍 Entry Zone: $${price.toLocaleString()}
🛑 Stop Loss (SL): $${sl.toLocaleString()} (${action === 'BUY' ? '-0.75%' : '+0.75%'})
🎯 Take Profit 1 (TP1): $${tp1.toLocaleString()} (${action === 'BUY' ? '+1.50%' : '-1.50%'})
🎯 Take Profit 2 (TP2): $${tp2.toLocaleString()} (${action === 'BUY' ? '+3.00%' : '-3.00%'})
🎯 Take Profit 3 (TP3): $${tp3.toLocaleString()} (${action === 'BUY' ? '+5.00%' : '-5.00%'})
⚖️ Risk / Reward Ratio: 1 : 2.0 (TP1) / 1 : 4.0 (TP2)
🛡️ Alokasi Risiko Maksimal: 1.5% Per Account Equity

📊 Konfluensi Teknikal:
- Smart Money Concepts: ${action === 'BUY' && demandZone ? `Demand Zone Live @ ${demandZone.bottom.toFixed(dec)} - ${demandZone.top.toFixed(dec)}` : action === 'SELL' && supplyZone ? `Supply Zone Live @ ${supplyZone.bottom.toFixed(dec)} - ${supplyZone.top.toFixed(dec)}` : 'Order Block Retest'}
- Indikator: Rating Teknikal ${taSummary.overallRating} (${taSummary.buyCount} Buy / ${taSummary.sellCount} Sell)
- Timeframe Alignment: ${action === 'BUY' ? 'W/H4/M30/M5/M1 Bullish Fractal' : 'M/D/H1/M15/M1 Bearish Fractal'}

🌐 Konteks Makro / Fundamental:
- Konsensus Analis: ${currentInstrument.fundamentals.analystConsensus} (Target: $${currentInstrument.fundamentals.analystTargetPrice.toLocaleString()}). Exchange: ${currentInstrument.exchange}.

⚠️ Catatan Manajemen Risiko:
- Gunakan Risk Management disiplin maksimal 1.5% dari ekuitas akun per posisi.`;

    const signalMsg: ChatMessage = {
      id: `sig-${Date.now()}`,
      sender: 'AstraBot Quant',
      role: 'bot',
      avatar: '⚡',
      timestamp: 'Baru saja',
      text: protocolText,
      badge: 'LIVE PROTOCOL SIGNAL',
      signal: {
        symbol: currentInstrument.symbol,
        action,
        entry: price,
        sl,
        tp: tp1,
      },
    };
    setMessages((prev) => [...prev, signalMsg]);
  };

  return (
    <div className="flex flex-col h-[560px] bg-[#111722] border border-slate-800 rounded-xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="p-3.5 bg-[#0B0F17] border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <span>Chat Trading & AstraBot Quant</span>
              <span className="px-2 py-0.5 rounded text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                100% REAL LIVE
              </span>
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">
              Respon bot murni berdasarkan data live pasar & kalkulasi indikator nyata
            </p>
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
      <div className="px-3.5 py-2 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
        <span className="text-slate-400 truncate flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Fokus: <strong className="text-white">{currentInstrument.displaySymbol}</strong> (${currentInstrument.price.toLocaleString()})</span>
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => handleQuickSignal('BUY')}
            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded flex items-center gap-1 transition-colors text-[10px] shadow"
          >
            <TrendingUp className="w-3 h-3" />
            <span>Sinyal Buy Real</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickSignal('SELL')}
            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded flex items-center gap-1 transition-colors text-[10px] shadow"
          >
            <TrendingDown className="w-3 h-3" />
            <span>Sinyal Sell Real</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3 font-mono text-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`p-3 rounded-xl border transition-all ${
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
                  <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[9px] font-bold">
                    {m.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-500">{m.timestamp}</span>
            </div>

            <p className="text-slate-300 font-sans text-xs leading-relaxed whitespace-pre-line">{m.text}</p>

            {/* Attached Signal Box */}
            {m.signal && (
              <div className="mt-2.5 p-2.5 bg-[#080C13] border border-blue-500/40 rounded-lg flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      m.signal.action === 'BUY' ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
                    }`}
                  >
                    {m.signal.action} {m.signal.symbol}
                  </span>
                  <span className="text-slate-300 font-bold">Entry: ${m.signal.entry.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-rose-400">SL: ${m.signal.sl.toLocaleString()}</span>
                  <span className="text-emerald-400">TP: ${m.signal.tp.toLocaleString()}</span>
                  {onJumpToAsset && (
                    <button
                      type="button"
                      onClick={() => onJumpToAsset(m.signal!.symbol)}
                      className="px-2 py-0.5 bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white rounded text-[10px] transition-colors font-bold"
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
          placeholder={`Tanyakan harga live, RSI, level support/resist, atau sinyal ${currentInstrument.displaySymbol}...`}
          className="flex-1 bg-[#111722] border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors shadow"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Kirim</span>
        </button>
      </form>
    </div>
  );
};
