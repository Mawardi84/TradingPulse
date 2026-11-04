import React from 'react';
import { useFirebase } from '../hooks/useFirebase';
import { Shield, Zap, BarChart2, Globe2, Cpu, ArrowRight, LogIn } from 'lucide-react';

export const LandingAuthScreen: React.FC = () => {
  const { login, loading } = useFirebase();

  return (
    <div className="min-h-screen bg-black text-white font-mono flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-96 h-96 bg-yellow-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[10%] w-96 h-96 bg-blue-500/20 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-4xl w-full z-10 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-yellow-500 border border-black flex items-center justify-center font-bold text-black text-xl shadow-[0_0_20px_rgba(234,179,8,0.3)]">AV</div>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tighter uppercase">AstraView Terminal <span className="text-yellow-500">v2.5</span></h1>
          </div>
          <p className="text-zinc-400 text-lg sm:text-xl max-w-2xl mx-auto font-sans">
            Terminal analisis multi-aset tingkat institusional. Pantau market, jalankan algoritma AI, dan simpan portofolio Anda di cloud secara aman.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: <Globe2 className="w-6 h-6 text-blue-400" />, title: "Multi-Asset Live", desc: "Crypto, Forex, Saham US & IDX, Komoditas real-time." },
            { icon: <Cpu className="w-6 h-6 text-yellow-400" />, title: "AI Quant Engine", desc: "Smart Money Concepts (SMC) & FVG detection otomatis." },
            { icon: <Shield className="w-6 h-6 text-emerald-400" />, title: "Cloud Persistence", desc: "Data watchlist & portofolio tersimpan di database aman." }
          ].map((feat, i) => (
            <div key={i} className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl hover:border-zinc-700 transition-colors group">
              <div className="mb-4">{feat.icon}</div>
              <h3 className="font-bold text-white mb-2 uppercase tracking-wide">{feat.title}</h3>
              <p className="text-zinc-500 text-xs font-sans leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>

        {/* Login CTA */}
        <div className="flex flex-col items-center gap-6 pt-8 border-t border-zinc-800/50">
          <div className="bg-[#111722] border border-slate-800 p-8 rounded-2xl w-full max-w-md shadow-2xl text-center space-y-6">
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">Akses Terminal</h2>
            <p className="text-zinc-400 text-sm font-sans">Login dengan akun Google Anda untuk memulai sinkronisasi cloud.</p>
            
            <button
              onClick={login}
              disabled={loading}
              className="w-full py-4 bg-white text-black font-extrabold rounded-lg flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all cursor-pointer shadow-[0_0_30px_rgba(255,255,255,0.1)] active:scale-[0.98]"
            >
              {loading ? (
                <Zap className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>MASUK DENGAN GOOGLE</span>
                </>
              )}
            </button>
            
            <div className="flex items-center gap-2 justify-center text-[10px] text-zinc-500">
              <Shield className="w-3 h-3" />
              <span>Layanan Autentikasi Terenkripsi via Google Firebase</span>
            </div>
          </div>
          
          <p className="text-zinc-600 text-[10px] text-center max-w-xs uppercase tracking-widest leading-loose">
            Enterprise Grade Infrastructure • Zero-Trust Policy • Real-time Data Integrity
          </p>
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="absolute bottom-6 text-[10px] text-zinc-700 uppercase tracking-widest">
        AstraView TradePulse Pro &copy; 2026 Institutional Systems
      </div>
    </div>
  );
};
