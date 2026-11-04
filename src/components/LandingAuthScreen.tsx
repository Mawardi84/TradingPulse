import React, { useState } from 'react';
import { useFirebase } from '../hooks/useFirebase';
import { 
  Shield, 
  Zap, 
  Globe2, 
  Cpu, 
  LogIn, 
  AlertTriangle, 
  Copy, 
  Check, 
  ExternalLink, 
  ArrowRight,
  HelpCircle,
  RefreshCw
} from 'lucide-react';

export const LandingAuthScreen: React.FC = () => {
  const { login, loginRedirect, loading, error, clearError } = useFirebase();
  const [localError, setLocalError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [showVercelGuide, setShowVercelGuide] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : 'your-domain.vercel.app';
  const isVercelDomain = currentHostname.includes('vercel.app');

  const handlePopupLogin = async () => {
    setLocalError(null);
    setErrorCode(null);
    clearError();
    try {
      await login();
    } catch (err: any) {
      console.error('Login action error:', err);
      const code = err?.code || '';
      const msg = err?.message || 'Gagal melakukan autentikasi dengan Google.';
      setErrorCode(code);
      setLocalError(msg);
      if (code === 'auth/unauthorized-domain') {
        setShowVercelGuide(true);
      }
    }
  };

  const handleRedirectLogin = async () => {
    setLocalError(null);
    setErrorCode(null);
    setIsRedirecting(true);
    clearError();
    try {
      await loginRedirect();
    } catch (err: any) {
      setIsRedirecting(false);
      console.error('Redirect action error:', err);
      const code = err?.code || '';
      const msg = err?.message || 'Gagal memulai redirect login.';
      setErrorCode(code);
      setLocalError(msg);
      if (code === 'auth/unauthorized-domain') {
        setShowVercelGuide(true);
      }
    }
  };

  const copyDomain = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(currentHostname);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const activeError = localError || (error?.message ? error.message : null);
  const activeCode = errorCode || (error?.code ? error.code : null);
  const isUnauthorizedDomain = activeCode === 'auth/unauthorized-domain' || activeError?.includes('unauthorized-domain');
  const isPopupBlocked = activeCode === 'auth/popup-blocked';

  return (
    <div className="min-h-screen bg-black text-white font-mono flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-x-hidden">
      {/* Background Subtle Ambience */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-96 h-96 bg-yellow-500/20 blur-[140px]" />
        <div className="absolute bottom-[10%] right-[10%] w-96 h-96 bg-blue-500/20 blur-[140px]" />
      </div>

      <div className="max-w-4xl w-full z-10 space-y-8 my-auto">
        {/* Terminal Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-500 border border-black flex items-center justify-center font-bold text-black text-lg sm:text-xl shadow-[0_0_20px_rgba(234,179,8,0.3)]">
              AV
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tighter uppercase">
              AstraView Terminal <span className="text-yellow-500">v2.5</span>
            </h1>
          </div>
          <p className="text-zinc-400 text-xs sm:text-sm max-w-xl mx-auto font-sans leading-relaxed">
            Institutional Quantitative & Multi-Asset Trading Workstation. Real-time Order Flow, SMC S&D Engine, & Cloud Persistence.
          </p>
        </div>

        {/* Diagnostic Alert Box for Vercel / Auth Failures */}
        {(activeError || isUnauthorizedDomain || showVercelGuide) && (
          <div className="bg-zinc-950 border-2 border-yellow-500 p-5 shadow-[0_0_30px_rgba(234,179,8,0.2)] text-left space-y-4 max-w-2xl mx-auto animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div className="flex items-center gap-2 text-yellow-400 font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 shrink-0 animate-bounce" />
                <span>
                  {isUnauthorizedDomain
                    ? 'PENYEBAB UTAMA: DOMAIN VERCEL BELUM DIIZINKAN DI FIREBASE'
                    : isPopupBlocked
                    ? 'POPUP LOGIN DIBLOKIR BROWSER'
                    : 'KENDALA AUTENTIKASI GOOGLE'}
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">
                {activeCode || 'DIAGNOSTIC'}
              </span>
            </div>

            {isUnauthorizedDomain ? (
              <div className="space-y-3 text-xs font-sans text-zinc-300">
                <p className="text-white font-medium">
                  Google Firebase secara default hanya mengizinkan login dari <code className="text-yellow-400 bg-zinc-900 px-1 py-0.5 border border-zinc-800">localhost</code>. 
                  Domain Vercel Anda belum didaftarkan di <strong>Authorized Domains</strong> Firebase Console.
                </p>

                <div className="bg-black border border-zinc-800 p-3 space-y-2">
                  <div className="text-[11px] text-zinc-400 uppercase font-mono font-bold">Domain Vercel Anda Saat Ini:</div>
                  <div className="flex items-center justify-between gap-2 bg-zinc-900 border border-zinc-700 p-2 font-mono text-yellow-300 text-xs select-all">
                    <span className="truncate">{currentHostname}</span>
                    <button
                      type="button"
                      onClick={copyDomain}
                      className="px-2.5 py-1 bg-yellow-500 hover:bg-yellow-400 text-black font-mono font-bold text-[10px] uppercase flex items-center gap-1 shrink-0 cursor-pointer transition-colors"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? 'TERSALIN' : 'SALIN'}</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-zinc-400 text-xs">
                  <div className="font-bold text-white uppercase text-[11px] font-mono">Langkah Perbaikan (Hanya 1 Menit):</div>
                  <ol className="list-decimal list-inside space-y-1 pl-1">
                    <li>
                      Buka Firebase Console: <strong className="text-white">Authentication &gt; Settings &gt; Authorized domains</strong>
                    </li>
                    <li>
                      Klik tombol <strong className="text-yellow-400 font-mono">+ Add domain</strong>
                    </li>
                    <li>
                      Tempel/paste domain Anda: <code className="text-yellow-300 bg-zinc-900 px-1">{currentHostname}</code> lalu klik <strong>Save</strong>
                    </li>
                    <li>
                      Kembali ke halaman ini dan tekan tombol <strong>Masuk dengan Google</strong> lagi. Selesai!
                    </li>
                  </ol>
                </div>

                <div className="pt-2 flex flex-wrap gap-2">
                  <a
                    href="https://console.firebase.google.com/project/hidef-hook-pj1d7/authentication/settings"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-mono font-bold text-xs uppercase flex items-center gap-1.5 transition-colors border border-black shadow"
                  >
                    <span>Buka Firebase Console Sekarang</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setLocalError(null);
                      clearError();
                    }}
                    className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-mono text-xs uppercase border border-zinc-700 cursor-pointer"
                  >
                    Tutup Peringatan
                  </button>
                </div>
              </div>
            ) : isPopupBlocked ? (
              <div className="space-y-3 text-xs font-sans text-zinc-300">
                <p>
                  Browser Anda (terutama Chrome Android atau Safari iOS) memblokir jendela popup Google. 
                  Silakan gunakan mode <strong>Masuk via Redirect</strong> di bawah ini agar halaman beralih secara langsung ke akun Google Anda.
                </p>
                <button
                  type="button"
                  onClick={handleRedirectLogin}
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-mono font-bold text-xs uppercase flex items-center gap-2 cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>Lanjutkan dengan Redirect</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2 text-xs font-sans text-zinc-300">
                <p className="text-rose-400 font-mono">{activeError}</p>
                <p className="text-zinc-500 text-[11px]">
                  Jika menggunakan browser mobile atau aplikasi pihak ketiga (in-app browser), coba gunakan mode Redirect atau buka di browser Chrome/Safari asli.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          {[
            {
              icon: <Globe2 className="w-5 h-5 text-blue-400" />,
              title: 'Multi-Asset Live',
              desc: 'Crypto, Forex, US & IDX Stocks dengan WebSocket data feed berkecepatan tinggi.',
            },
            {
              icon: <Cpu className="w-5 h-5 text-yellow-400" />,
              title: 'AI Quant Protocol',
              desc: 'Deteksi Fair Value Gap (FVG), SMC Order Blocks, dan sinyal konfluensi otomatis.',
            },
            {
              icon: <Shield className="w-5 h-5 text-emerald-400" />,
              title: 'Cloud Persistence',
              desc: 'Portfolio & quant script tersinkronisasi otomatis dengan Google Firebase Cloud.',
            },
          ].map((feat, i) => (
            <div
              key={i}
              className="bg-zinc-950 border border-zinc-800 p-4 hover:border-zinc-700 transition-colors"
            >
              <div className="mb-3">{feat.icon}</div>
              <h3 className="font-bold text-white text-xs mb-1 uppercase tracking-wider">
                {feat.title}
              </h3>
              <p className="text-zinc-500 text-[11px] font-sans leading-relaxed">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Login Card */}
        <div className="bg-zinc-950 border border-zinc-800 p-6 sm:p-8 max-w-md w-full mx-auto text-center space-y-5 shadow-2xl">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">
              Akses Terminal Institusional
            </h2>
            <p className="text-zinc-400 text-xs font-sans">
              Autentikasi terenkripsi via Google Identity Service
            </p>
          </div>

          <div className="space-y-2.5">
            {/* Primary Popup Sign-In Button */}
            <button
              type="button"
              onClick={handlePopupLogin}
              disabled={loading || isRedirecting}
              className="w-full py-3.5 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold uppercase text-xs tracking-wider flex items-center justify-center gap-2 border border-black cursor-pointer transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
            >
              {loading && !isRedirecting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Memproses Login...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Masuk dengan Google (Popup)</span>
                </>
              )}
            </button>

            {/* Alternative Mobile-Friendly Redirect Sign-In Button */}
            <button
              type="button"
              onClick={handleRedirectLogin}
              disabled={loading || isRedirecting}
              className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white font-bold uppercase text-[11px] tracking-wider flex items-center justify-center gap-2 border border-zinc-700 cursor-pointer transition-all disabled:opacity-50"
              title="Gunakan ini jika popup diblokir atau membuka dari ponsel / Vercel"
            >
              {isRedirecting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-yellow-400" />
                  <span>Mengalihkan ke Google...</span>
                </>
              ) : (
                <>
                  <Globe2 className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Masuk via Redirect (Mobile / Vercel)</span>
                </>
              )}
            </button>
          </div>

          {/* Current Domain Badge & Help */}
          <div className="pt-2 border-t border-zinc-900 flex flex-col items-center gap-2 text-[10px] text-zinc-500 font-mono">
            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              <span>Domain saat ini:</span>
              <span className="text-zinc-300 font-bold bg-zinc-900 px-1.5 py-0.5 border border-zinc-800">
                {currentHostname}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowVercelGuide((prev) => !prev)}
              className="text-yellow-500 hover:text-yellow-400 underline cursor-pointer flex items-center gap-1"
            >
              <HelpCircle className="w-3 h-3" />
              <span>Panduan Setup Vercel & Firebase</span>
            </button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-[10px] text-zinc-600 uppercase tracking-widest text-center">
          AstraView TradePulse Pro &bull; Zero-Trust Protocol &bull; Project ID: hidef-hook-pj1d7
        </div>
      </div>
    </div>
  );
};

