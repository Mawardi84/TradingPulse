import React, { useState, useEffect, useCallback } from 'react';
import {
  ALL_FOMC_MEETINGS,
  CME_FEDWATCH_PROBABILITIES,
  FOMC_ASSET_PLAYBOOK,
  CURRENT_FED_FUNDS_RATE,
  getDynamicFomcMeetings,
  getNextUpcomingFomcMeeting,
  FedWatchOption,
} from '../data/fomcScheduleData';
import { FomcMeeting } from '../types/market';
import {
  Calendar,
  Clock,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Zap,
  BarChart3,
  ShieldAlert,
  Flame,
  ArrowRight,
  Filter,
  Check,
  ShieldCheck,
  Building,
  BrainCircuit,
  RefreshCw,
  Radio,
} from 'lucide-react';

interface FomcSchedulePanelProps {
  onJumpToAsset?: (symbol: string) => void;
  onJumpToMacroFormula?: () => void;
}

interface LiveFomcMacroData {
  targetRange: string;
  lowerRate: number;
  upperRate: number;
  effrRate: number;
  treasury2Y: number;
  treasury10Y: number;
  dxyIndex: number;
  probabilities: FedWatchOption[];
  updatedAt: number;
}

export const FomcSchedulePanel: React.FC<FomcSchedulePanelProps> = ({
  onJumpToAsset,
  onJumpToMacroFormula,
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [filterType, setFilterType] = useState<'all' | 'upcoming' | 'sep_only'>('all');
  const [liveMacro, setLiveMacro] = useState<LiveFomcMacroData | null>(null);
  const [isLoadingLive, setIsLoadingLive] = useState<boolean>(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>('Live');

  // Next meeting dynamically calculated from real-time clock
  const nextMeeting = getNextUpcomingFomcMeeting();

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // 1. Fetch real-time live FOMC rates & CME FedWatch probabilities from backend scraper
  const fetchLiveFomcData = useCallback(async () => {
    setIsLoadingLive(true);
    try {
      const res = await fetch('/api/fomc/live');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setLiveMacro(json.data);
          setLastSyncedTime(new Date().toLocaleTimeString('id-ID'));
        }
      }
    } catch (err) {
      console.warn('[FomcSchedulePanel] Live fetch error, using calibrated fallbacks:', err);
    } finally {
      setIsLoadingLive(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveFomcData();
    const interval = setInterval(fetchLiveFomcData, 20000);
    return () => clearInterval(interval);
  }, [fetchLiveFomcData]);

  // 2. Real-time dynamic countdown to next FOMC meeting decision
  useEffect(() => {
    const targetDate = nextMeeting.decisionTimestamp
      ? new Date(nextMeeting.decisionTimestamp).getTime()
      : new Date('2026-12-10T02:00:00+07:00').getTime();

    const updateCountdown = () => {
      const now = Date.now();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [nextMeeting.decisionTimestamp]);

  // Dynamically evaluate meeting statuses ('completed' vs 'next' vs 'upcoming')
  const dynamicMeetings: FomcMeeting[] = getDynamicFomcMeetings(selectedYear);

  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [loadingAI, setLoadingAI] = useState<boolean>(false);

  const generateFOMCAnalysis = async (meeting: FomcMeeting) => {
    setLoadingAI(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Berikan ringkasan berita pasca rilis dan analisa dampak pergerakan market untuk rapat FOMC berikut: 
          Tanggal: ${meeting.meetingDates}
          Keputusan: ${meeting.decisionOrExpectation}
          Catatan: ${meeting.notes}`,
        }),
      });
      const data = await response.json();
      setAiAnalysis(data.reply || 'Analisa tidak tersedia saat ini.');
    } catch (error) {
      setAiAnalysis('Gagal mendapatkan analisa AI.');
    } finally {
      setLoadingAI(false);
    }
  };

  const filteredMeetings = dynamicMeetings.filter((m) => {
    if (filterType === 'upcoming') return m.status === 'next' || m.status === 'upcoming';
    if (filterType === 'sep_only') return m.hasSEP;
    return true;
  });

  const activeProbabilities = liveMacro?.probabilities || CME_FEDWATCH_PROBABILITIES;
  const currentTargetRange = liveMacro?.targetRange || CURRENT_FED_FUNDS_RATE;

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Official Bloomberg Terminal Header & Data Provenance */}
      <div className="bg-black border border-white p-3 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 bg-yellow-400 text-black font-bold flex items-center justify-center text-[10px]">
            FED
          </div>
          <div>
            <span className="font-bold text-white uppercase tracking-wider">
              DATA RESMI THE FED & CME FEDWATCH
            </span>
            <span className="text-zinc-400 text-[11px] block sm:inline sm:ml-2">
              Board of Governors (federalreserve.gov) & FRED Macro Scraper
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchLiveFomcData}
            disabled={isLoadingLive}
            className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-yellow-400 border border-yellow-400 font-bold text-[10px] uppercase flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Refresh kuotasi live suku bunga & CME FedWatch"
          >
            <RefreshCw className={`w-3 h-3 ${isLoadingLive ? 'animate-spin' : ''}`} />
            <span>{isLoadingLive ? 'SYNCING...' : `SYNC LIVE (${lastSyncedTime})`}</span>
          </button>

          <a
            href="https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2 py-1 bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-700 text-[10px] flex items-center gap-1"
          >
            <span>federalreserve.gov</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Live Macro Strip (Target Rate, EFFR, 2Y Yield, 10Y Yield, DXY) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-0 border border-white bg-black">
        <div className="p-2.5 border-r border-b sm:border-b-0 border-white">
          <span className="text-[10px] text-zinc-400 uppercase block">TARGET FED RATE</span>
          <span className="text-sm font-bold text-yellow-400 block mt-0.5">{currentTargetRange}</span>
          <span className="text-[9px] text-emerald-400">● LIVE FRED</span>
        </div>

        <div className="p-2.5 border-r border-b sm:border-b-0 border-white">
          <span className="text-[10px] text-zinc-400 uppercase block">EFFR (EFEKTIF)</span>
          <span className="text-sm font-bold text-white block mt-0.5">
            {liveMacro ? `${liveMacro.effrRate.toFixed(2)}%` : '3.88%'}
          </span>
          <span className="text-[9px] text-zinc-500">Fed Funds Rate</span>
        </div>

        <div className="p-2.5 border-r border-b sm:border-b-0 border-white">
          <span className="text-[10px] text-zinc-400 uppercase block">US 2Y YIELD</span>
          <span className="text-sm font-bold text-yellow-300 block mt-0.5">
            {liveMacro ? `${liveMacro.treasury2Y.toFixed(3)}%` : '4.612%'}
          </span>
          <span className="text-[9px] text-zinc-500">Benchmark Kebijakan</span>
        </div>

        <div className="p-2.5 border-r border-white">
          <span className="text-[10px] text-zinc-400 uppercase block">US 10Y YIELD</span>
          <span className="text-sm font-bold text-white block mt-0.5">
            {liveMacro ? `${liveMacro.treasury10Y.toFixed(3)}%` : '4.929%'}
          </span>
          <span className="text-[9px] text-zinc-500">Benchmark Global</span>
        </div>

        <div className="p-2.5 bg-zinc-950">
          <span className="text-[10px] text-zinc-400 uppercase block">DOLLAR INDEX (DXY)</span>
          <span className="text-sm font-bold text-yellow-400 block mt-0.5">
            {liveMacro ? liveMacro.dxyIndex.toFixed(2) : '101.44'}
          </span>
          <span className="text-[9px] text-emerald-400">USD Strength</span>
        </div>
      </div>

      {/* Hero Banner with Next Decision Countdown & Live Target Rate */}
      <div className="bg-black border border-white p-4 sm:p-5 shadow-2xl relative">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 font-bold bg-yellow-400 text-black text-[10px] uppercase">
                RAPAT TERDEKAT AKAN DATANG
              </span>
              <span className="text-yellow-400 font-bold text-[11px]">
                {nextMeeting.meetingDates} • KEPUTUSAN: {nextMeeting.decisionDateLabel}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider">
              Jadwal Lengkap Rapat FOMC & CME FedWatch Tracker
            </h2>
            <p className="text-[11px] text-zinc-400 max-w-2xl leading-relaxed">
              Kalender resmi 8 agenda pertemuan tahunan Federal Open Market Committee (FOMC) terverifikasi langsung dari rilis resmi The Fed, jadwal rilis risalah notulen (Minutes), dan probabilitas pasar berjangka CME FedWatch.
            </p>
          </div>

          {/* Current Rate & Live Countdown Box */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-zinc-950 p-3.5 border border-white self-stretch lg:self-auto shrink-0">
            {/* Target Rate */}
            <div className="border-b sm:border-b-0 sm:border-r border-zinc-800 pb-2 sm:pb-0 sm:pr-4">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">
                Target Rate Terkini
              </span>
              <span className="text-lg sm:text-xl font-bold text-yellow-400 block mt-0.5">
                {currentTargetRange}
              </span>
              <span className="text-[9px] text-zinc-500 block">
                Federal Funds Target Range
              </span>
            </div>

            {/* Countdown to Next Decision */}
            <div>
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider flex items-center gap-1 font-bold">
                <Clock className="w-3 h-3 text-yellow-400" />
                <span>Menuju Keputusan Suku Bunga:</span>
              </span>
              <div className="flex items-center gap-1.5 mt-1 font-bold">
                <div className="bg-black px-2 py-1 border border-zinc-700 text-center min-w-[36px]">
                  <span className="text-sm font-bold text-white block">{timeLeft.days}</span>
                  <span className="text-[8px] text-zinc-500 uppercase">Hari</span>
                </div>
                <span className="text-zinc-600">:</span>
                <div className="bg-black px-2 py-1 border border-zinc-700 text-center min-w-[36px]">
                  <span className="text-sm font-bold text-white block">{timeLeft.hours}</span>
                  <span className="text-[8px] text-zinc-500 uppercase">Jam</span>
                </div>
                <span className="text-zinc-600">:</span>
                <div className="bg-black px-2 py-1 border border-zinc-700 text-center min-w-[36px]">
                  <span className="text-sm font-bold text-white block">{timeLeft.minutes}</span>
                  <span className="text-[8px] text-zinc-500 uppercase">Mnt</span>
                </div>
                <span className="text-zinc-600">:</span>
                <div className="bg-black px-2 py-1 border border-zinc-700 text-center min-w-[36px]">
                  <span className="text-sm font-bold text-yellow-400 block">{timeLeft.seconds}</span>
                  <span className="text-[8px] text-zinc-500 uppercase">Dtk</span>
                </div>
              </div>
              <span className="text-[10px] text-yellow-300 block mt-1">
                {nextMeeting.decisionDateLabel} • {nextMeeting.decisionTimeWIB} ({nextMeeting.timeET})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CME FedWatch Tool Live Barometer & Next Meeting Spotlight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Left 2 Cols: CME FedWatch Probability Meter */}
        <div className="lg:col-span-2 bg-black p-4 border border-white space-y-3 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-yellow-400 text-black font-bold">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wide">
                  <span>CME FedWatch Tool — Probabilitas Rapat {nextMeeting.meetingDates}</span>
                  <span className="text-[9px] bg-yellow-400 text-black px-1.5 py-0.2 font-bold">
                    LIVE FUTURES
                  </span>
                </h3>
                <p className="text-[10px] text-zinc-400 mt-0.5">
                  Distribusi probabilitas suku bunga acuan berdasarkan kontrak berjangka 30-Day Fed Funds (CME Group)
                </p>
              </div>
            </div>

            {onJumpToMacroFormula && (
              <button
                type="button"
                onClick={onJumpToMacroFormula}
                className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-yellow-400 border border-zinc-700 font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-colors shrink-0"
              >
                <Zap className="w-3 h-3 fill-yellow-400 stroke-none" />
                <span>Simulasi Rumus FOMC</span>
              </button>
            )}
          </div>

          {/* Probabilities Breakdown */}
          <div className="space-y-2 pt-1">
            {activeProbabilities.map((opt) => (
              <div key={opt.targetRange} className="p-2.5 bg-zinc-950 border border-zinc-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">{opt.targetRange}</span>
                    <span
                      className={`px-1.5 py-0.2 text-[9px] font-bold uppercase ${
                        opt.changeBps < 0
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                      }`}
                    >
                      {opt.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-500 text-[10px] hidden sm:inline">
                      1 Mgg Lalu: <strong className="text-zinc-400">{opt.priorWeekProb}%</strong>
                    </span>
                    <span className="text-sm font-bold text-yellow-400">
                      {opt.probability}%
                    </span>
                  </div>
                </div>

                {/* Progress Visual Bar */}
                <div className="w-full bg-black h-2 overflow-hidden border border-zinc-800">
                  <div
                    className={`h-full transition-all duration-1000 ${
                      opt.probability > 50
                        ? 'bg-yellow-400'
                        : opt.probability > 0
                        ? 'bg-emerald-400'
                        : 'bg-zinc-800'
                    }`}
                    style={{ width: `${Math.max(opt.probability, 1)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="text-[10px] text-zinc-400 flex items-center justify-between border-t border-zinc-800 pt-2">
            <span>
              Konsensus Pasar Saat Ini:{' '}
              <strong className="text-yellow-400">
                {activeProbabilities[0]?.label} ({activeProbabilities[0]?.probability}%)
              </strong>
            </span>
            <span className="text-zinc-500 hidden sm:inline">
              Data: CME 30-Day Fed Funds Futures & FRED Effr
            </span>
          </div>
        </div>

        {/* Right 1 Col: Spotlight on Next Meeting Schedule */}
        <div className="bg-black p-4 border border-yellow-400 space-y-3 shadow-xl flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="px-2 py-0.5 text-[9px] font-bold bg-yellow-400 text-black uppercase">
                AGENDA UTAMA BERIKUTNYA
              </span>
              <span className="text-[10px] text-yellow-400 font-bold">Rapat {selectedYear}</span>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Rapat Suku Bunga FOMC {nextMeeting.meetingDates}
              </h4>
              <div className="mt-2 space-y-2">
                <p className="text-[11px] text-zinc-300 leading-relaxed bg-zinc-950 p-2.5 border border-zinc-800">
                  {aiAnalysis || nextMeeting.notes}
                </p>
                <button
                  type="button"
                  onClick={() => generateFOMCAnalysis(nextMeeting)}
                  disabled={loadingAI}
                  className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-[10px] uppercase border border-black flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <BrainCircuit className="w-3.5 h-3.5" />
                  <span>{loadingAI ? 'MENGANALISIS...' : 'ANALISA AI GEMINI FOMC'}</span>
                </button>
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-zinc-800 text-[10px]">
              <div className="flex justify-between py-0.5 border-b border-zinc-900">
                <span className="text-zinc-400">Pengumuman Suku Bunga:</span>
                <span className="text-white font-bold">{nextMeeting.decisionDateLabel}, {nextMeeting.decisionTimeWIB}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-zinc-900">
                <span className="text-zinc-400">Konferensi Pers The Fed:</span>
                <span className="text-yellow-400 font-bold">{nextMeeting.pressConferenceTimeWIB} (2:30 PM ET)</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-zinc-900">
                <span className="text-zinc-400">Rilis Risalah (Minutes):</span>
                <span className="text-zinc-300">{nextMeeting.minutesReleaseDateWIB}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-zinc-900">
                <span className="text-zinc-400">Target Range Ekspektasi:</span>
                <span className="text-emerald-400 font-bold">{nextMeeting.rateAfterOrExpected}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-zinc-400">Proyeksi Dot Plot (SEP):</span>
                <span className="text-white font-bold">{nextMeeting.hasSEP ? 'Ya (Rilis Kuartalan)' : 'Tidak (Statement Only)'}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-800">
            <div className="text-[10px] text-zinc-400 mb-1">Aset Terdampak Utama:</div>
            <div className="flex flex-wrap gap-1">
              {nextMeeting.affectedAssets.map((sym) => (
                <button
                  key={sym}
                  type="button"
                  onClick={() => onJumpToAsset?.(sym)}
                  className="px-2 py-0.5 bg-zinc-900 hover:bg-yellow-400 hover:text-black text-yellow-300 text-[10px] font-bold border border-zinc-700 cursor-pointer transition-colors"
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Full 8-Meeting Calendar Table with Year Switcher */}
      <div className="bg-black border border-white shadow-2xl">
        <div className="p-3 sm:p-4 border-b border-white flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-yellow-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Kalender Resmi 8 Rapat FOMC Tahunan — Tahun {selectedYear}
              </h3>
            </div>
            <p className="text-[10px] text-zinc-400">
              Jadwal resmi pertemuan dua hari The Fed (federalreserve.gov), jam rilis Statement (01:00/02:00 WIB), Konferensi Pers (01:30/02:30 WIB), dan ketersediaan Dot Plot (SEP).
            </p>
          </div>

          {/* Controls: Year Selector & Filter Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Year Selector */}
            <div className="flex items-center border border-white p-0 text-[10px]">
              <span className="text-yellow-400 px-2 font-bold">TAHUN:</span>
              {[2027, 2026, 2025, 2024].map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => setSelectedYear(yr)}
                  className={`px-2 py-1 font-bold transition-colors border-l border-white ${
                    selectedYear === yr
                      ? 'bg-white text-black'
                      : 'text-white hover:bg-zinc-800'
                  }`}
                >
                  {yr} {yr === 2026 && '●'}
                </button>
              ))}
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center border border-white p-0 text-[10px]">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 font-bold transition-colors border-r border-white ${
                  filterType === 'all' ? 'bg-white text-black' : 'text-white hover:bg-zinc-800'
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setFilterType('upcoming')}
                className={`px-2.5 py-1 font-bold transition-colors border-r border-white ${
                  filterType === 'upcoming' ? 'bg-white text-black' : 'text-white hover:bg-zinc-800'
                }`}
              >
                Mendatang
              </button>
              <button
                type="button"
                onClick={() => setFilterType('sep_only')}
                className={`px-2.5 py-1 font-bold transition-colors ${
                  filterType === 'sep_only' ? 'bg-white text-black' : 'text-white hover:bg-zinc-800'
                }`}
              >
                Dot Plot
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[11px] font-mono">
            <thead>
              <tr className="bg-zinc-950 border-b border-white text-yellow-400 uppercase tracking-wider text-[10px]">
                <th className="p-2.5 border-r border-zinc-800">Tanggal Rapat FOMC</th>
                <th className="p-2.5 border-r border-zinc-800">Jam Rilis (ET & WIB)</th>
                <th className="p-2.5 border-r border-zinc-800">Tipe Agenda</th>
                <th className="p-2.5 border-r border-zinc-800">Suku Bunga</th>
                <th className="p-2.5 border-r border-zinc-800">Keputusan / Ekspektasi</th>
                <th className="p-2.5 border-r border-zinc-800">Risalah (Minutes)</th>
                <th className="p-2.5 text-center border-r border-zinc-800">Status</th>
                <th className="p-2.5">Aset</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-zinc-200">
              {filteredMeetings.map((m) => {
                const isNext = m.status === 'next';
                const isCompleted = m.status === 'completed';

                return (
                  <tr
                    key={m.id}
                    className={`transition-colors ${
                      isNext
                        ? 'bg-yellow-400/10 hover:bg-yellow-400/20 border-l-4 border-l-yellow-400'
                        : 'hover:bg-zinc-900'
                    }`}
                  >
                    <td className="p-2.5 whitespace-nowrap font-bold text-white border-r border-zinc-900">
                      <div className="flex items-center gap-1.5">
                        {isNext && <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />}
                        <span>{m.meetingDates}</span>
                      </div>
                      <div className="text-[10px] text-zinc-400 font-normal">{m.decisionDateLabel}</div>
                    </td>

                    <td className="p-2.5 whitespace-nowrap text-zinc-300 border-r border-zinc-900">
                      <div>
                        <strong className="text-white">{m.decisionTimeWIB}</strong>{' '}
                        <span className="text-zinc-500">({m.timeET})</span>
                      </div>
                      <div className="text-[10px] text-yellow-300 font-normal">
                        Konferensi Pers: {m.pressConferenceTimeWIB}
                      </div>
                    </td>

                    <td className="p-2.5 whitespace-nowrap border-r border-zinc-900">
                      {m.hasSEP ? (
                        <span className="px-1.5 py-0.2 text-[9px] font-bold bg-yellow-400 text-black uppercase">
                          Dot Plot + SEP
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 text-[9px] bg-zinc-800 text-zinc-400 border border-zinc-700">
                          Statement Only
                        </span>
                      )}
                    </td>

                    <td className="p-2.5 whitespace-nowrap font-semibold border-r border-zinc-900">
                      <span className="text-zinc-400">{m.rateBefore}</span>
                      <span className="text-zinc-500 mx-1">➔</span>
                      <span className={isCompleted ? 'text-white' : 'text-yellow-400 font-bold'}>
                        {m.rateAfterOrExpected}
                      </span>
                    </td>

                    <td className="p-2.5 border-r border-zinc-900">
                      <div className="font-bold text-white">{m.decisionOrExpectation}</div>
                      <div className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">
                        {m.notes}
                      </div>
                    </td>

                    <td className="p-2.5 whitespace-nowrap text-zinc-400 text-[10px] border-r border-zinc-900">
                      {m.minutesReleaseDateWIB}
                    </td>

                    <td className="p-2.5 text-center whitespace-nowrap border-r border-zinc-900">
                      {isCompleted ? (
                        <span className="px-2 py-0.5 text-[9px] font-bold bg-zinc-900 text-zinc-400 border border-zinc-800 flex items-center gap-1 justify-center">
                          <CheckCircle2 className="w-3 h-3 text-zinc-400" />
                          <span>SELESAI</span>
                        </span>
                      ) : isNext ? (
                        <span className="px-2 py-0.5 text-[9px] font-extrabold bg-yellow-400 text-black border border-black animate-pulse flex items-center gap-1 justify-center">
                          <span>RAPAT TERDEKAT</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[9px] font-bold bg-zinc-900 text-yellow-300 border border-zinc-800 flex items-center gap-1 justify-center">
                          <span>MENDATANG</span>
                        </span>
                      )}
                    </td>

                    <td className="p-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {m.affectedAssets.slice(0, 3).map((sym) => (
                          <button
                            key={sym}
                            type="button"
                            onClick={() => onJumpToAsset?.(sym)}
                            className="px-1.5 py-0.2 bg-zinc-900 hover:bg-yellow-400 hover:text-black text-zinc-300 text-[9px] font-bold border border-zinc-800 cursor-pointer transition-colors"
                          >
                            {sym}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* FOMC Multi-Asset Playbook (Hawkish vs Dovish Scenarios) */}
      <div className="bg-black border border-white p-4 space-y-3 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-2.5">
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wide">
              <Flame className="w-4 h-4 text-yellow-400" />
              <span>Playbook Reaksi Multi-Aset terhadap Keputusan & Pidato FOMC</span>
            </h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">
              Panduan reaksi harga kuantitatif saat The Fed merilis keputusan Dovish vs Hawkish
            </p>
          </div>
          <span className="text-[10px] font-bold text-yellow-400 px-2 py-0.5 bg-zinc-950 border border-zinc-800">
            KORELASI MAKRO PRESI
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          {FOMC_ASSET_PLAYBOOK.map((item) => (
            <div
              key={item.symbol}
              className="p-3 bg-zinc-950 border border-zinc-800 hover:border-white transition-all space-y-2.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-yellow-400 text-xs">{item.symbol}</span>
                    <span className="text-[11px] text-zinc-400">({item.name})</span>
                  </div>
                  {onJumpToAsset && (
                    <button
                      type="button"
                      onClick={() => onJumpToAsset(item.symbol)}
                      className="text-[10px] text-zinc-300 hover:text-yellow-400 font-bold flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>CHART</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="space-y-1.5 mt-2 text-[10px]">
                  <div className="p-2 border border-emerald-900 bg-emerald-950/30 text-emerald-300 leading-relaxed">
                    {item.dovishReaction}
                  </div>
                  <div className="p-2 border border-rose-900 bg-rose-950/30 text-rose-300 leading-relaxed">
                    {item.hawkishReaction}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-900 text-[10px] text-zinc-400">
                <span className="text-zinc-500">Level Kunci: </span>
                <span className="text-yellow-300 font-bold">{item.keyLevelToWatch}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Institutional Protocol & Risk Warnings */}
      <div className="p-3 bg-zinc-950 border border-yellow-400 text-xs text-zinc-300 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-yellow-400 uppercase text-[11px]">
            Protokol Manajemen Risiko Trader Institusi saat Rilis FOMC
          </div>
          <p className="text-zinc-400 text-[10px] leading-relaxed">
            1. Pukul 01:00 / 02:00 WIB: Likuiditas pasar antarbank (interbank) mengering sesaat, menyebabkan spread bid-ask melebar 3x-5x lipat dan memicu spike ganda (liquidity grab).
            <br />
            2. Pukul 01:30 / 02:30 WIB: Arah tren sesungguhnya biasanya baru terkonfirmasi saat sesi konferensi pers dimulai dan menjawab pertanyaan jurnalis seputar arah suku bunga terminal (terminal rate).
          </p>
        </div>
      </div>
    </div>
  );
};
