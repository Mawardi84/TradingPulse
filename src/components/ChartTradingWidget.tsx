import React, { useState } from 'react';
import { Instrument } from '../types/market';
import { TrendingUp, TrendingDown, DollarSign, X, CheckCircle, AlertCircle, ShoppingCart } from 'lucide-react';

export interface Position {
  id: string;
  symbol: string;
  displaySymbol: string;
  type: 'BUY' | 'SELL';
  lots: number;
  openPrice: number;
  currentPrice: number;
  sl: number;
  tp: number;
  openTime: string;
  pnl: number;
  pnlPercent: number;
}

export const ChartTradingWidget: React.FC<{
  instrument: Instrument;
  allInstruments?: Instrument[];
}> = ({ instrument, allInstruments = [] }) => {
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [lots, setLots] = useState<number>(0.1);
  const [slPrice, setSlPrice] = useState<string>('');
  const [tpPrice, setTpPrice] = useState<string>('');
  const [limitPrice, setLimitPrice] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'ticket' | 'positions' | 'history'>('ticket');

  const [balance, setBalance] = useState<number>(50000.0);
  const [positions, setPositions] = useState<Position[]>([
    {
      id: 'pos-1',
      symbol: 'XAUUSD',
      displaySymbol: 'XAU/USD',
      type: 'BUY',
      lots: 0.2,
      openPrice: 4008.50,
      currentPrice: 4015.20,
      sl: 3985.00,
      tp: 4070.00,
      openTime: '10:45:12',
      pnl: 134.00,
      pnlPercent: 0.17,
    },
    {
      id: 'pos-2',
      symbol: 'EURUSD',
      displaySymbol: 'EUR/USD',
      type: 'SELL',
      lots: 0.5,
      openPrice: 1.087,
      currentPrice: 1.0845,
      sl: 1.091,
      tp: 1.078,
      openTime: '12:15:40',
      pnl: 125.0,
      pnlPercent: 0.23,
    },
  ]);

  // Dynamically update position current prices and unrealized PnL on every live market tick
  React.useEffect(() => {
    setPositions((prev) =>
      prev.map((p) => {
        const match =
          allInstruments.find((i) => i.symbol === p.symbol) ||
          (p.symbol === instrument.symbol ? instrument : null);
        if (!match) return p;

        const currentPrice = match.price;
        const priceDiff = p.type === 'BUY' ? currentPrice - p.openPrice : p.openPrice - currentPrice;
        const multiplier = p.symbol.includes('XAU')
          ? 100
          : p.symbol.includes('USDT')
          ? 1
          : p.symbol.includes('JPY')
          ? 1000
          : 100000;
        const pnl = Number((priceDiff * p.lots * (multiplier > 1000 ? 1000 : multiplier)).toFixed(2));
        const pnlPercent = Number(((priceDiff / p.openPrice) * 100).toFixed(2));

        return {
          ...p,
          currentPrice,
          pnl,
          pnlPercent,
        };
      })
    );
  }, [instrument.price, allInstruments]);
  const [closedTrades, setClosedTrades] = useState<
    { id: string; symbol: string; type: 'BUY' | 'SELL'; lots: number; pnl: number; closeTime: string }[]
  >([
    { id: 'c-1', symbol: 'BTCUSDT', type: 'BUY', lots: 0.05, pnl: 412.5, closeTime: '09:20 WIB' },
    { id: 'c-2', symbol: 'NVDA', type: 'BUY', lots: 20, pnl: 184.0, closeTime: '08:14 WIB' },
  ]);

  const totalUnrealizedPnL = positions.reduce((acc, p) => acc + p.pnl, 0);
  const equity = balance + totalUnrealizedPnL;
  const marginUsed = positions.reduce((acc, p) => acc + p.lots * 1000, 0);
  const freeMargin = equity - marginUsed;

  const handleExecuteOrder = (action: 'BUY' | 'SELL') => {
    const entryPrice = orderType === 'market' ? instrument.price : parseFloat(limitPrice) || instrument.price;
    const sl = parseFloat(slPrice) || Number((entryPrice * (action === 'BUY' ? 0.992 : 1.008)).toFixed(instrument.decimals));
    const tp = parseFloat(tpPrice) || Number((entryPrice * (action === 'BUY' ? 1.018 : 0.982)).toFixed(instrument.decimals));

    const newPos: Position = {
      id: `pos-${Date.now()}`,
      symbol: instrument.symbol,
      displaySymbol: instrument.displaySymbol,
      type: action,
      lots,
      openPrice: entryPrice,
      currentPrice: instrument.price,
      sl,
      tp,
      openTime: new Date().toLocaleTimeString(),
      pnl: 0,
      pnlPercent: 0,
    };

    setPositions((prev) => [newPos, ...prev]);
    setActiveTab('positions');
  };

  const handleClosePosition = (id: string) => {
    const pos = positions.find((p) => p.id === id);
    if (!pos) return;

    setBalance((prev) => prev + pos.pnl);
    setClosedTrades((prev) => [
      {
        id: `closed-${Date.now()}`,
        symbol: pos.displaySymbol,
        type: pos.type,
        lots: pos.lots,
        pnl: pos.pnl,
        closeTime: new Date().toLocaleTimeString(),
      },
      ...prev,
    ]);
    setPositions((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="bg-[#111722] border border-slate-800 rounded-lg shadow-xl overflow-hidden font-mono text-xs">
      {/* Wallet / Account Bar */}
      <div className="p-3 bg-[#0B0F17] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-[11px]">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-slate-500">Saldo Akun:</span>
            <span className="text-white font-bold ml-1.5">${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div>
            <span className="text-slate-500">Ekuitas:</span>
            <span className="text-white font-bold ml-1.5">${equity.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div>
            <span className="text-slate-500">Margin Bebas:</span>
            <span className="text-emerald-400 font-bold ml-1.5">${freeMargin.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400">Floating PnL:</span>
          <span className={`px-2 py-0.5 rounded font-bold ${totalUnrealizedPnL >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
            {totalUnrealizedPnL >= 0 ? `+$${totalUnrealizedPnL.toFixed(2)}` : `-$${Math.abs(totalUnrealizedPnL).toFixed(2)}`}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 text-xs">
        <button
          onClick={() => setActiveTab('ticket')}
          className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
            activeTab === 'ticket' ? 'border-blue-500 text-blue-400 bg-blue-500/5' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Tiket Order ({instrument.displaySymbol})
        </button>
        <button
          onClick={() => setActiveTab('positions')}
          className={`px-4 py-2 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'positions' ? 'border-blue-500 text-blue-400 bg-blue-500/5' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <span>Posisi Aktif</span>
          <span className="px-1.5 py-0.2 bg-blue-600 text-white rounded-full text-[10px]">{positions.length}</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
            activeTab === 'history' ? 'border-blue-500 text-blue-400 bg-blue-500/5' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Riwayat Transaksi
        </button>
      </div>

      {/* Tab 1: Ticket Order */}
      {activeTab === 'ticket' && (
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-xs">Tipe Eksekusi:</span>
              <div className="flex bg-[#0B0F17] p-0.5 rounded border border-slate-800">
                <button
                  onClick={() => setOrderType('market')}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    orderType === 'market' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Pasar (Market)
                </button>
                <button
                  onClick={() => setOrderType('limit')}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    orderType === 'limit' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Limit Pending
                </button>
              </div>
            </div>

            <span className="text-slate-400">
              Harga Spot: <strong className="text-white">${instrument.price.toLocaleString(undefined, { minimumFractionDigits: instrument.decimals })}</strong>
            </span>
          </div>

          {/* Lot Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-slate-400 text-[10px] mb-1">Volume (Lots / Qty):</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={lots}
                  onChange={(e) => setLots(parseFloat(e.target.value) || 0.01)}
                  className="w-full bg-[#0B0F17] border border-slate-800 rounded p-1.5 text-white font-bold text-center focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {orderType === 'limit' && (
              <div>
                <label className="block text-slate-400 text-[10px] mb-1">Harga Limit:</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder={instrument.price.toString()}
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  className="w-full bg-[#0B0F17] border border-slate-800 rounded p-1.5 text-white font-bold focus:outline-none focus:border-blue-500"
                />
              </div>
            )}

            <div>
              <label className="block text-slate-400 text-[10px] mb-1">Stop Loss (SL):</label>
              <input
                type="number"
                step="0.01"
                placeholder="Optional"
                value={slPrice}
                onChange={(e) => setSlPrice(e.target.value)}
                className="w-full bg-[#0B0F17] border border-slate-800 rounded p-1.5 text-rose-300 font-bold focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-[10px] mb-1">Take Profit (TP):</label>
              <input
                type="number"
                step="0.01"
                placeholder="Optional"
                value={tpPrice}
                onChange={(e) => setTpPrice(e.target.value)}
                className="w-full bg-[#0B0F17] border border-slate-800 rounded p-1.5 text-emerald-300 font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Quick Buy / Sell Buttons */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <button
              onClick={() => handleExecuteOrder('SELL')}
              className="p-3 bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-600 hover:to-rose-500 text-white rounded-lg font-bold flex flex-col items-center justify-center transition-all shadow-lg active:scale-98"
            >
              <div className="flex items-center gap-1.5 text-sm uppercase">
                <TrendingDown className="w-4 h-4" />
                <span>SELL (JUAL)</span>
              </div>
              <span className="text-[11px] opacity-90 mt-0.5">
                ${(instrument.price * 0.9999).toFixed(instrument.decimals)}
              </span>
            </button>

            <button
              onClick={() => handleExecuteOrder('BUY')}
              className="p-3 bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white rounded-lg font-bold flex flex-col items-center justify-center transition-all shadow-lg active:scale-98"
            >
              <div className="flex items-center gap-1.5 text-sm uppercase">
                <TrendingUp className="w-4 h-4" />
                <span>BUY (BELI)</span>
              </div>
              <span className="text-[11px] opacity-90 mt-0.5">
                ${(instrument.price * 1.0001).toFixed(instrument.decimals)}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Positions Table */}
      {activeTab === 'positions' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#0B0F17] border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="p-2.5">Simbol</th>
                <th className="p-2.5">Tipe</th>
                <th className="p-2.5 text-right">Lots</th>
                <th className="p-2.5 text-right">Harga Buka</th>
                <th className="p-2.5 text-right">Harga Saat Ini</th>
                <th className="p-2.5 text-right">SL / TP</th>
                <th className="p-2.5 text-right">PnL ($)</th>
                <th className="p-2.5 text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {positions.map((pos) => {
                const isProfitable = pos.pnl >= 0;
                return (
                  <tr key={pos.id} className="hover:bg-slate-800/40">
                    <td className="p-2.5 font-bold text-white">{pos.displaySymbol}</td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${pos.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                        {pos.type}
                      </span>
                    </td>
                    <td className="p-2.5 text-right font-bold">{pos.lots}</td>
                    <td className="p-2.5 text-right text-slate-400">${pos.openPrice.toLocaleString()}</td>
                    <td className="p-2.5 text-right text-white font-bold">${pos.currentPrice.toLocaleString()}</td>
                    <td className="p-2.5 text-right text-slate-400 text-[10px]">
                      {pos.sl} / {pos.tp}
                    </td>
                    <td className={`p-2.5 text-right font-bold ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isProfitable ? `+$${pos.pnl.toFixed(2)}` : `-$${Math.abs(pos.pnl).toFixed(2)}`}
                    </td>
                    <td className="p-2.5 text-center">
                      <button
                        onClick={() => handleClosePosition(pos.id)}
                        className="px-2 py-1 bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white rounded border border-rose-500/30 text-[10px] transition-colors"
                      >
                        Tutup
                      </button>
                    </td>
                  </tr>
                );
              })}
              {positions.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-500">
                    Tidak ada posisi aktif saat ini. Buka posisi baru melalui Tiket Order.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: History */}
      {activeTab === 'history' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#0B0F17] border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="p-2.5">Simbol</th>
                <th className="p-2.5">Aksi</th>
                <th className="p-2.5 text-right">Volume</th>
                <th className="p-2.5 text-right">Profit Bersih</th>
                <th className="p-2.5 text-right">Waktu Tutup</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {closedTrades.map((t) => (
                <tr key={t.id} className="hover:bg-slate-800/40">
                  <td className="p-2.5 font-bold text-white">{t.symbol}</td>
                  <td className="p-2.5">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${t.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                      {t.type}
                    </span>
                  </td>
                  <td className="p-2.5 text-right">{t.lots}</td>
                  <td className={`p-2.5 text-right font-bold ${t.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {t.pnl >= 0 ? `+$${t.pnl.toFixed(2)}` : `-$${Math.abs(t.pnl).toFixed(2)}`}
                  </td>
                  <td className="p-2.5 text-right text-slate-400">{t.closeTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
