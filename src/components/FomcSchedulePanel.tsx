import React, { useState, useEffect } from 'react';
import {
  FOMC_MEETINGS_2026,
  CME_FEDWATCH_PROBABILITIES,
  FOMC_ASSET_PLAYBOOK,
  CURRENT_FED_FUNDS_RATE,
  NEXT_FOMC_DATE_TIMESTAMP,
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
} from 'lucide-react';

interface FomcSchedulePanelProps {
  onJumpToAsset?: (symbol: string) => void;
  onJumpToMacroFormula?: () => void;
}

export const FomcSchedulePanel: React.FC<FomcSchedulePanelProps> = ({
  onJumpToAsset,
  onJumpToMacroFormula,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'upcoming' | 'sep_only'>('all');
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 8, hours: 14, minutes: 41, seconds: 52 });

  // Live countdown calculation to next FOMC decision
  useEffect(() => {
    const targetDate = new Date(NEXT_FOMC_DATE_TIMESTAMP).getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
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
  }, []);

  const nextMeeting = FOMC_MEETINGS_2026.find((m) => m.status === 'next') || FOMC_MEETINGS_2026[6];

  const filteredMeetings = FOMC_MEETINGS_2026.filter((m) => {
    if (filterType === 'upcoming') return m.status === 'next' || m.status === 'upcoming';
    if (filterType === 'sep_only') return m.hasSEP;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Hero Banner with Next Decision Countdown & Live Rate */}
      <div className="bg-gradient-to-br from-[#111722] via-[#0E1420] to-[#151D2C] p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800">
                FEDERAL RESERVE OFFICIAL CALENDAR
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                RAPAT TERDEKAT: 4-5 NOV 2026
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
              Jadwal Lengkap Rapat FOMC & CME FedWatch Tracker
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Kalender resmi seluruh 8 agenda rapat tahunan Federal Open Market Committee (FOMC), probabilitas konsensus pasar berjangka suku bunga, dan implikasi multi-aset.
            </p>
          </div>

          {/* Current Rate & Countdown Card */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-[#0B0F17]/90 p-4 rounded-xl border border-slate-800/90 shadow-xl self-stretch lg:self-auto shrink-0">
            {/* Current Target Rate */}
            <div className="border-b sm:border-b-0 sm:border-r border-slate-800 pb-3 sm:pb-0 sm:pr-4">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Target Rate Saat Ini
              </span>
              <span className="text-lg sm:text-xl font-bold text-emerald-400 font-mono">
                {CURRENT_FED_FUNDS_RATE}
              </span>
              <span className="text-[10px] text-slate-500 block font-mono mt-0.5">
                Effective Fed Funds (EFFR)
              </span>
            </div>

            {/* Live Countdown */}
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" />
                Menuju Keputusan Suku Bunga:
              </span>
              <div className="flex items-center gap-1.5 mt-1 font-mono">
                <div className="bg-slate-900 px-2 py-1 rounded border border-slate-800 text-center min-w-[38px]">
                  <span className="text-base font-bold text-white block">{timeLeft.days}</span>
                  <span className="text-[9px] text-slate-500 uppercase">Hari</span>
                </div>
                <span className="text-slate-600 font-bold">:</span>
                <div className="bg-slate-900 px-2 py-1 rounded border border-slate-800 text-center min-w-[38px]">
                  <span className="text-base font-bold text-white block">{timeLeft.hours}</span>
                  <span className="text-[9px] text-slate-500 uppercase">Jam</span>
                </div>
                <span className="text-slate-600 font-bold">:</span>
                <div className="bg-slate-900 px-2 py-1 rounded border border-slate-800 text-center min-w-[38px]">
                  <span className="text-base font-bold text-white block">{timeLeft.minutes}</span>
                  <span className="text-[9px] text-slate-500 uppercase">Mnt</span>
                </div>
                <span className="text-slate-600 font-bold">:</span>
                <div className="bg-slate-900 px-2 py-1 rounded border border-slate-800 text-center min-w-[38px]">
                  <span className="text-base font-bold text-amber-400 block">{timeLeft.seconds}</span>
                  <span className="text-[9px] text-slate-500 uppercase">Dtk</span>
                </div>
              </div>
              <span className="text-[10px] text-cyan-400 font-mono block mt-1">
                Kamis, 6 Nov 2026 • 01:00 WIB
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CME FedWatch Tool Live Barometer & Next Meeting Spotlight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: CME FedWatch Probability Meter */}
        <div className="lg:col-span-2 bg-[#111722] p-5 rounded-xl border border-slate-800 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                  <span>CME FedWatch Tool — Probabilitas Rapat {nextMeeting.meetingDates}</span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.2 rounded font-sans font-semibold">
                    Live Fed Funds Futures
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Distribusi probabilitas suku bunga acuan berdasarkan kontrak berjangka 30-Day Fed Funds (CME Group)
                </p>
              </div>
            </div>

            {onJumpToMacroFormula && (
              <button
                type="button"
                onClick={onJumpToMacroFormula}
                className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition-colors self-start sm:self-auto shrink-0"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Simulasi Rumus FOMC</span>
              </button>
            )}
          </div>

          {/* Probabilities Breakdown */}
          <div className="space-y-3 pt-1">
            {CME_FEDWATCH_PROBABILITIES.map((opt) => (
              <div key={opt.targetRange} className="p-3.5 bg-[#0B0F17] rounded-xl border border-slate-800/90 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{opt.targetRange}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        opt.changeBps < 0
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {opt.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 text-[11px] hidden sm:inline">
                      1 Minggu Lalu: <strong className="text-slate-400">{opt.priorWeekProb}%</strong>
                    </span>
                    <span className="text-lg font-bold font-mono text-emerald-400">
                      {opt.probability}%
                    </span>
                  </div>
                </div>

                {/* Progress Visual Bar */}
                <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      opt.probability > 50
                        ? 'bg-gradient-to-r from-blue-600 to-emerald-500'
                        : opt.probability > 0
                        ? 'bg-amber-500'
                        : 'bg-slate-800'
                    }`}
                    style={{ width: `${Math.max(opt.probability, 1)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between border-t border-slate-800/80 pt-3">
            <span>Konsensus Pasar Saat Ini: <strong className="text-emerald-400">Pemangkasan 25 bps (94.8%)</strong></span>
            <span className="text-slate-500 hidden sm:inline">Sumber: CME Group (30-Day Fed Funds Futures)</span>
          </div>
        </div>

        {/* Right 1 Col: Spotlight on Next Meeting Schedule */}
        <div className="bg-[#111722] p-5 rounded-xl border border-amber-500/40 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                AGENDA UTAMA MENDATANG
              </span>
              <span className="text-xs font-mono text-cyan-400">Pertemuan ke-7 (2026)</span>
            </div>

            <div>
              <h4 className="text-base font-bold text-white font-mono">
                Rapat Suku Bunga FOMC 4-5 Nov 2026
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {nextMeeting.notes}
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Pengumuman Suku Bunga:</span>
                <span className="text-white font-bold">{nextMeeting.decisionDateLabel}, {nextMeeting.decisionTimeWIB}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Konferensi Pers Powell:</span>
                <span className="text-cyan-400 font-bold">{nextMeeting.pressConferenceTimeWIB}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Suku Bunga Ekspektasi:</span>
                <span className="text-emerald-400 font-bold">{nextMeeting.rateAfterOrExpected}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Rilis Dot Plot (SEP):</span>
                <span className="text-slate-300 font-bold">Tidak (Jadwal Des 2026)</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <div className="text-[10px] text-slate-400 mb-1.5 font-mono">Aset Terdampak Utama:</div>
            <div className="flex flex-wrap gap-1">
              {nextMeeting.affectedAssets.map((sym) => (
                <button
                  key={sym}
                  type="button"
                  onClick={() => onJumpToAsset?.(sym)}
                  className="px-2 py-0.5 bg-blue-600/20 hover:bg-blue-600 hover:text-white text-blue-300 text-[10px] font-mono font-bold rounded transition-colors"
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Full 8-Meeting Calendar Table */}
      <div className="bg-[#111722] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              <span>Jadwal Resmi Seluruh Rapat FOMC 2026 (8 Pertemuan Tahunan)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Jadwal resmi pertemuan dua hari The Fed beserta ketersediaan proyeksi ekonomi kuartalan (SEP & Dot Plot)
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center gap-1.5 bg-[#0B0F17] p-1 rounded-lg border border-slate-800 text-xs font-mono">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded transition-colors ${
                filterType === 'all'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Semua (8)
            </button>
            <button
              type="button"
              onClick={() => setFilterType('upcoming')}
              className={`px-3 py-1 rounded transition-colors ${
                filterType === 'upcoming'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Rapat Mendatang
            </button>
            <button
              type="button"
              onClick={() => setFilterType('sep_only')}
              className={`px-3 py-1 rounded transition-colors ${
                filterType === 'sep_only'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Dengan Dot Plot (SEP)
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-[#0B0F17] border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                <th className="p-3.5">Tanggal Rapat FOMC</th>
                <th className="p-3.5">Pengumuman (WIB)</th>
                <th className="p-3.5">Tipe Agenda</th>
                <th className="p-3.5">Perubahan Suku Bunga</th>
                <th className="p-3.5">Hasil / Konsensus</th>
                <th className="p-3.5">Prob. Cut / Hold</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {filteredMeetings.map((m) => {
                const isNext = m.status === 'next';
                const isCompleted = m.status === 'completed';

                return (
                  <tr
                    key={m.id}
                    className={`transition-colors ${
                      isNext
                        ? 'bg-amber-500/5 hover:bg-amber-500/10 border-l-4 border-l-amber-500'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="p-3.5 whitespace-nowrap font-bold text-white">
                      <div className="flex items-center gap-1.5">
                        {isNext && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />}
                        <span>{m.meetingDates}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-normal">{m.decisionDateLabel}</div>
                    </td>

                    <td className="p-3.5 whitespace-nowrap text-slate-300">
                      <div>{m.decisionTimeWIB} (Statement)</div>
                      <div className="text-[10px] text-cyan-400">{m.pressConferenceTimeWIB} (Konferensi Pers)</div>
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      {m.hasSEP ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800 flex items-center gap-1 w-fit">
                          <span>Dot Plot + SEP</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400">
                          Statement Only
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 whitespace-nowrap font-semibold">
                      <span className="text-slate-400">{m.rateBefore}</span>
                      <span className="text-slate-500 mx-1.5">➔</span>
                      <span className={isCompleted ? 'text-white' : 'text-emerald-400 font-bold'}>
                        {m.rateAfterOrExpected}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <div className="font-bold text-white">{m.decisionOrExpectation}</div>
                      <div className="text-[10px] text-slate-400 font-sans line-clamp-1 mt-0.5">
                        {m.notes}
                      </div>
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      <div className="text-emerald-400 font-bold">Cut: {m.fedWatchCutProb}%</div>
                      <div className="text-slate-500 text-[10px]">Hold: {m.fedWatchHoldProb}%</div>
                    </td>

                    <td className="p-3.5 text-center whitespace-nowrap">
                      {isCompleted ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 flex items-center gap-1 justify-center">
                          <CheckCircle2 className="w-3 h-3 text-slate-400" />
                          <span>Selesai</span>
                        </span>
                      ) : isNext ? (
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse flex items-center gap-1 justify-center">
                          <span>Rapat Terdekat</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800 flex items-center gap-1 justify-center">
                          <span>Mendatang</span>
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {m.affectedAssets.slice(0, 2).map((sym) => (
                          <button
                            key={sym}
                            type="button"
                            onClick={() => onJumpToAsset?.(sym)}
                            className="px-1.5 py-0.5 bg-blue-600/20 hover:bg-blue-600 hover:text-white text-blue-300 text-[10px] font-mono rounded transition-colors"
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
      <div className="bg-[#111722] p-5 sm:p-6 rounded-xl border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Playbook Reaksi Multi-Aset terhadap Keputusan & Pidato FOMC</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Panduan reaksi harga kuantitatif saat The Fed merilis keputusan Dovish vs Hawkish
            </p>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 px-2 py-1 bg-emerald-950 rounded border border-emerald-800">
            Korelasi Makro Presisi
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          {FOMC_ASSET_PLAYBOOK.map((item) => (
            <div
              key={item.symbol}
              className="p-4 bg-[#0B0F17] rounded-xl border border-slate-800 hover:border-slate-700 transition-all space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white text-sm">{item.symbol}</span>
                    <span className="text-xs text-slate-400 font-sans">({item.name})</span>
                  </div>
                  {onJumpToAsset && (
                    <button
                      type="button"
                      onClick={() => onJumpToAsset(item.symbol)}
                      className="text-[11px] text-blue-400 hover:text-blue-300 font-mono font-semibold flex items-center gap-0.5"
                    >
                      <span>Chart</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="space-y-2 mt-2.5 text-xs font-sans">
                  <div className="p-2 rounded bg-emerald-950/20 border border-emerald-900/30 text-emerald-300 text-[11px] leading-relaxed">
                    {item.dovishReaction}
                  </div>
                  <div className="p-2 rounded bg-rose-950/20 border border-rose-900/30 text-rose-300 text-[11px] leading-relaxed">
                    {item.hawkishReaction}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400">
                <span className="text-slate-500">Level Kunci: </span>
                <span className="text-amber-300">{item.keyLevelToWatch}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Institutional Protocol & Risk Warnings */}
      <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl text-xs font-mono text-slate-300 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-amber-300 text-sm">
            Protokol Manajemen Risiko Trader Institusi saat Rilis FOMC
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            1. Pukul 01:00 WIB: Likuiditas pasar antarbank (interbank) seringkali mengering sesaat, menyebabkan spread bid-ask melebar 3x-5x lipat dan memicu spike ganda (liquidity grab).
            <br />
            2. Pukul 01:30 WIB: Arah tren sesungguhnya biasanya baru dikonfirmasi saat Ketua Jerome Powell memulai sesi konferensi pers dan menjawab pertanyaan jurnalis seputar arah suku bunga terminal (terminal rate).
          </p>
        </div>
      </div>
    </div>
  );
};
