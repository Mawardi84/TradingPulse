import React, { useState, useEffect, useMemo } from 'react';
import { Candle, Instrument, SupplyDemandZone } from '../types/market';
import { findSupplyDemandZones } from '../utils/indicators';
import {
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Activity,
  Plus,
  Trash2,
  Edit3,
  Bookmark,
  X,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export interface ManualSDZone {
  id: string;
  symbol: string;
  type: 'supply' | 'demand';
  top: number;
  bottom: number;
  label: string;
  createdAt: string;
  isCustomManual: boolean;
}

export interface SupplyDemandOverlayPanelProps {
  instrument: Instrument;
  candles: Candle[];
}

export const SupplyDemandOverlayPanel: React.FC<SupplyDemandOverlayPanelProps> = ({
  instrument,
  candles,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [copiedZoneId, setCopiedZoneId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Manual Zones State (Persisted in localStorage)
  const [manualZones, setManualZones] = useState<ManualSDZone[]>([]);

  // Form State for Adding/Editing Manual Zone
  const [formType, setFormType] = useState<'supply' | 'demand'>('supply');
  const [formTop, setFormTop] = useState<string>('');
  const [formBottom, setFormBottom] = useState<string>('');
  const [formLabel, setFormLabel] = useState<string>('');

  const currentPrice = instrument.price;
  const dec = instrument.decimals;
  const storageKey = `astraview_manual_sd_zones_${instrument.symbol}`;

  // Load manual zones from localStorage when instrument changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setManualZones(JSON.parse(saved));
      } else {
        setManualZones([]);
      }
    } catch {
      setManualZones([]);
    }
  }, [instrument.symbol, storageKey]);

  // Save manual zones to localStorage whenever manualZones changes
  const saveManualZonesToStorage = (updated: ManualSDZone[]) => {
    setManualZones(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save manual S&D zones to localStorage:', e);
    }
  };

  // Automatic Zones calculated from candle structure
  const autoZones = useMemo(() => {
    return findSupplyDemandZones(candles);
  }, [candles]);

  // Combine Manual Zones (Rendered ON TOP) with Auto Zones
  const manualSupply = useMemo(
    () => manualZones.filter((z) => z.type === 'supply'),
    [manualZones]
  );

  const manualDemand = useMemo(
    () => manualZones.filter((z) => z.type === 'demand'),
    [manualZones]
  );

  const autoSupply = useMemo(
    () => autoZones.filter((z) => z.type === 'supply').sort((a, b) => a.bottom - b.bottom),
    [autoZones]
  );

  const autoDemand = useMemo(
    () => autoZones.filter((z) => z.type === 'demand').sort((a, b) => b.top - a.top),
    [autoZones]
  );

  const handleOpenAddModal = (defaultType: 'supply' | 'demand' = 'supply') => {
    setFormType(defaultType);
    const p = currentPrice;
    if (defaultType === 'supply') {
      setFormTop((p * 1.008).toFixed(dec));
      setFormBottom((p * 1.002).toFixed(dec));
      setFormLabel(`Supply Retest Manual ${instrument.displaySymbol}`);
    } else {
      setFormTop((p * 0.998).toFixed(dec));
      setFormBottom((p * 0.992).toFixed(dec));
      setFormLabel(`Demand Support Manual ${instrument.displaySymbol}`);
    }
    setShowAddModal(true);
  };

  const handleSaveManualZone = (e: React.FormEvent) => {
    e.preventDefault();
    const topVal = parseFloat(formTop);
    const bottomVal = parseFloat(formBottom);

    if (isNaN(topVal) || isNaN(bottomVal) || topVal <= bottomVal) {
      alert('Mohon masukkan harga Batas Atas yang lebih besar dari Batas Bawah!');
      return;
    }

    const newZone: ManualSDZone = {
      id: `manual-${Date.now()}`,
      symbol: instrument.symbol,
      type: formType,
      top: topVal,
      bottom: bottomVal,
      label: formLabel.trim() || `Zona ${formType.toUpperCase()} Manual`,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isCustomManual: true,
    };

    saveManualZonesToStorage([newZone, ...manualZones]);
    setShowAddModal(false);
  };

  const handleDeleteManualZone = (id: string) => {
    const updated = manualZones.filter((z) => z.id !== id);
    saveManualZonesToStorage(updated);
  };

  const handleCopyZoneText = (zone: SupplyDemandZone | ManualSDZone) => {
    const isManual = 'isCustomManual' in zone && zone.isCustomManual;
    const text = `📌 ZONA S&D ${isManual ? 'MANUAL PENGGUNA' : 'OTOMATIS'} (${zone.type.toUpperCase()})
Instrumen: ${instrument.displaySymbol}
Tipe: ${zone.type === 'supply' ? 'ZONA SUPPLY (RESISTANSI / ORDER BLOCK MERAH)' : 'ZONA DEMAND (SUPPORT / ORDER BLOCK HIJAU)'}
Label: ${zone.label || zone.type}
Batas Atas: ${zone.top.toFixed(dec)}
Batas Bawah: ${zone.bottom.toFixed(dec)}
Harga Live: ${currentPrice.toFixed(dec)}`;

    navigator.clipboard.writeText(text);
    setCopiedZoneId(zone.id);
    setTimeout(() => setCopiedZoneId(null), 2000);
  };

  return (
    <div className="bg-[#0B0F17] border border-slate-800 rounded-xl overflow-hidden shadow-xl transition-all">
      {/* Header Banner Toggle & Controls */}
      <div className="px-4 py-3 bg-[#111722] hover:bg-[#161d2a] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 transition-colors">
        <div
          onClick={() => setIsExpanded((prev) => !prev)}
          className="flex items-center gap-2.5 cursor-pointer flex-1"
        >
          <div className="w-7 h-7 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800 flex items-center justify-center font-bold shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs font-bold text-white font-mono tracking-wide">
                Indikator Supply & Demand (Otomatis + Manual)
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                ● LIVE DETECT
              </span>
              {manualZones.length > 0 && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-800 font-bold flex items-center gap-1">
                  <Bookmark className="w-3 h-3 text-amber-400" />
                  {manualZones.length} Zona Manual Tersimpan
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Zona manual buatan pengguna diprioritaskan di atas indikator otomatis
            </p>
          </div>
        </div>

        {/* Right Header Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleOpenAddModal('supply')}
            className="px-3 py-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-200 text-xs font-mono font-bold transition-all flex items-center gap-1 shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Supply Manual</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenAddModal('demand')}
            className="px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-200 text-xs font-mono font-bold transition-all flex items-center gap-1 shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Demand Manual</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="p-1.5 rounded text-slate-400 hover:text-white bg-slate-800/60"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Zone Detail Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* SUPPLY ZONES SECTION (Manual + Auto) */}
            <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-3">
              <div className="flex items-center justify-between border-b border-rose-500/20 pb-2">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs font-mono">
                  <ArrowDownRight className="w-4 h-4" />
                  <span>ZONA SUPPLY / ORDER BLOCK MERAH</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-mono">
                  <span className="text-amber-400 font-bold">{manualSupply.length} Manual</span>
                  <span className="text-slate-600">|</span>
                  <span className="text-rose-400">{autoSupply.length} Auto</span>
                </div>
              </div>

              <div className="space-y-2.5">
                {/* 1. MANUAL SUPPLY ZONES (Rendered ON TOP) */}
                {manualSupply.map((z) => {
                  const distPercent = (((z.bottom - currentPrice) / currentPrice) * 100).toFixed(2);
                  const isCopied = copiedZoneId === z.id;

                  return (
                    <div
                      key={z.id}
                      className="p-3 bg-[#0D121F] rounded-lg border-2 border-amber-500/60 shadow-lg shadow-amber-500/10 flex items-center justify-between gap-2 relative overflow-hidden"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-amber-300 font-mono flex items-center gap-1">
                            <Bookmark className="w-3 h-3 text-amber-400 fill-amber-400" />
                            {z.label}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-700 font-mono font-bold">
                            ★ MANUAL PENGGUNA
                          </span>
                        </div>
                        <div className="text-sm font-bold font-mono text-white">
                          {z.bottom.toFixed(dec)} — {z.top.toFixed(dec)}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2">
                          <span>Jarak ke Live:</span>
                          <strong className="text-rose-400 font-bold">+{distPercent}%</strong>
                          <span>• Dibuat: {z.createdAt}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopyZoneText(z)}
                          title="Salin Level"
                          className={`p-1.5 rounded font-mono text-xs font-bold transition-colors ${
                            isCopied ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
                          }`}
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteManualZone(z.id)}
                          title="Hapus Zona Manual Ini"
                          className="p-1.5 rounded bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* 2. AUTOMATIC SUPPLY ZONES */}
                {autoSupply.map((z, idx) => {
                  const distPercent = (((z.bottom - currentPrice) / currentPrice) * 100).toFixed(2);
                  const isCopied = copiedZoneId === z.id;

                  return (
                    <div
                      key={z.id || idx}
                      className="p-3 bg-[#080B11] rounded-lg border border-rose-900/50 hover:border-rose-500/50 transition-all flex items-center justify-between gap-2"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-rose-300 font-mono">
                            {z.label || `Supply Area #${idx + 1}`}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-950 text-rose-400 border border-rose-800 font-mono font-bold">
                            OTOMATIS ({z.strength})
                          </span>
                        </div>
                        <div className="text-sm font-bold font-mono text-white">
                          {z.bottom.toFixed(dec)} — {z.top.toFixed(dec)}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2">
                          <span>Jarak ke Live:</span>
                          <strong className="text-rose-400 font-bold">+{distPercent}%</strong>
                          <span>({z.testCount}x Retest)</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopyZoneText(z)}
                        title="Salin Level"
                        className={`p-2 rounded font-mono text-xs font-bold transition-colors shrink-0 flex items-center gap-1 ${
                          isCopied
                            ? 'bg-emerald-600 text-white'
                            : 'bg-rose-950 text-rose-300 hover:bg-rose-900 border border-rose-800'
                        }`}
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline">{isCopied ? 'Tersalin' : 'Salin'}</span>
                      </button>
                    </div>
                  );
                })}

                {manualSupply.length === 0 && autoSupply.length === 0 && (
                  <div className="text-xs text-slate-400 font-mono italic p-2 text-center">
                    Belum ada zona supply terdeteksi. Klik + Supply Manual untuk membuat zona baru.
                  </div>
                )}
              </div>
            </div>

            {/* DEMAND ZONES SECTION (Manual + Auto) */}
            <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs font-mono">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>ZONA DEMAND / ORDER BLOCK HIJAU</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-mono">
                  <span className="text-amber-400 font-bold">{manualDemand.length} Manual</span>
                  <span className="text-slate-600">|</span>
                  <span className="text-emerald-400">{autoDemand.length} Auto</span>
                </div>
              </div>

              <div className="space-y-2.5">
                {/* 1. MANUAL DEMAND ZONES (Rendered ON TOP) */}
                {manualDemand.map((z) => {
                  const distPercent = (((currentPrice - z.top) / currentPrice) * 100).toFixed(2);
                  const isCopied = copiedZoneId === z.id;

                  return (
                    <div
                      key={z.id}
                      className="p-3 bg-[#0D121F] rounded-lg border-2 border-amber-500/60 shadow-lg shadow-amber-500/10 flex items-center justify-between gap-2 relative overflow-hidden"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-amber-300 font-mono flex items-center gap-1">
                            <Bookmark className="w-3 h-3 text-amber-400 fill-amber-400" />
                            {z.label}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-700 font-mono font-bold">
                            ★ MANUAL PENGGUNA
                          </span>
                        </div>
                        <div className="text-sm font-bold font-mono text-white">
                          {z.bottom.toFixed(dec)} — {z.top.toFixed(dec)}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2">
                          <span>Jarak ke Live:</span>
                          <strong className="text-emerald-400 font-bold">-{distPercent}%</strong>
                          <span>• Dibuat: {z.createdAt}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopyZoneText(z)}
                          title="Salin Level"
                          className={`p-1.5 rounded font-mono text-xs font-bold transition-colors ${
                            isCopied ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
                          }`}
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteManualZone(z.id)}
                          title="Hapus Zona Manual Ini"
                          className="p-1.5 rounded bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* 2. AUTOMATIC DEMAND ZONES */}
                {autoDemand.map((z, idx) => {
                  const distPercent = (((currentPrice - z.top) / currentPrice) * 100).toFixed(2);
                  const isCopied = copiedZoneId === z.id;

                  return (
                    <div
                      key={z.id || idx}
                      className="p-3 bg-[#080B11] rounded-lg border border-emerald-900/50 hover:border-emerald-500/50 transition-all flex items-center justify-between gap-2"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-emerald-300 font-mono">
                            {z.label || `Demand Area #${idx + 1}`}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono font-bold">
                            OTOMATIS ({z.strength})
                          </span>
                        </div>
                        <div className="text-sm font-bold font-mono text-white">
                          {z.bottom.toFixed(dec)} — {z.top.toFixed(dec)}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2">
                          <span>Jarak ke Live:</span>
                          <strong className="text-emerald-400 font-bold">-{distPercent}%</strong>
                          <span>({z.testCount}x Retest)</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopyZoneText(z)}
                        title="Salin Level"
                        className={`p-2 rounded font-mono text-xs font-bold transition-colors shrink-0 flex items-center gap-1 ${
                          isCopied
                            ? 'bg-emerald-600 text-white'
                            : 'bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-800'
                        }`}
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline">{isCopied ? 'Tersalin' : 'Salin'}</span>
                      </button>
                    </div>
                  );
                })}

                {manualDemand.length === 0 && autoDemand.length === 0 && (
                  <div className="text-xs text-slate-400 font-mono italic p-2 text-center">
                    Belum ada zona demand terdeteksi. Klik + Demand Manual untuk membuat zona baru.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Practical Guidance Footer */}
          <div className="p-3 bg-[#111722] border border-slate-800 rounded-lg flex items-center justify-between gap-3 text-xs font-mono text-slate-300">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong className="text-white">Zona Manual Tersimpan:</strong> Zona manual yang Anda buat tersimpan otomatis per aset (<strong className="text-amber-300">{instrument.displaySymbol}</strong>) dan akan selalu muncul diprioritaskan di atas indikator otomatis.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form: Draw & Save Manual S&D Zone */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111722] border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white font-mono">
                  Tambah Zona Supply & Demand Manual
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveManualZone} className="space-y-4">
              {/* Type Switcher */}
              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-400 font-semibold">Tipe Zona:</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-[#0B0F17] rounded-lg border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setFormType('supply')}
                    className={`py-2 text-xs font-mono font-bold rounded-md transition-all ${
                      formType === 'supply'
                        ? 'bg-rose-600 text-white shadow-lg'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🔴 Supply (Resistansi / Jual)
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormType('demand')}
                    className={`py-2 text-xs font-mono font-bold rounded-md transition-all ${
                      formType === 'demand'
                        ? 'bg-emerald-600 text-white shadow-lg'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🟢 Demand (Support / Beli)
                  </button>
                </div>
              </div>

              {/* Price Range Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-400">Batas Atas (Top Price):</label>
                  <input
                    type="number"
                    step="any"
                    value={formTop}
                    onChange={(e) => setFormTop(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-[#0B0F17] border border-slate-800 focus:border-blue-500 rounded-lg text-sm font-mono text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-400">Batas Bawah (Bottom Price):</label>
                  <input
                    type="number"
                    step="any"
                    value={formBottom}
                    onChange={(e) => setFormBottom(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-[#0B0F17] border border-slate-800 focus:border-blue-500 rounded-lg text-sm font-mono text-white outline-none"
                  />
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 bg-[#0B0F17] p-2 rounded-lg border border-slate-800">
                <span>Harga Live Saat Ini: <strong className="text-white">${currentPrice.toFixed(dec)}</strong></span>
                <button
                  type="button"
                  onClick={() => {
                    if (formType === 'supply') {
                      setFormTop((currentPrice * 1.008).toFixed(dec));
                      setFormBottom((currentPrice * 1.002).toFixed(dec));
                    } else {
                      setFormTop((currentPrice * 0.998).toFixed(dec));
                      setFormBottom((currentPrice * 0.992).toFixed(dec));
                    }
                  }}
                  className="text-cyan-400 font-bold hover:underline"
                >
                  Gunakan Offset Live ±0.5%
                </button>
              </div>

              {/* Label / Note Input */}
              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-400">Label / Catatan Tambahan:</label>
                <input
                  type="text"
                  value={formLabel}
                  onChange={(e) => setFormLabel(e.target.value)}
                  placeholder="Contoh: Area Order Block H4 Kunci"
                  className="w-full px-3 py-2 bg-[#0B0F17] border border-slate-800 focus:border-blue-500 rounded-lg text-sm font-mono text-white outline-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 font-bold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Simpan Zona Manual</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
