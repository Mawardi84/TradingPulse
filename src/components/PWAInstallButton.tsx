import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-yellow-400 text-black border border-black hover:bg-yellow-300 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
        title="Install AstraView Terminal PWA"
      >
        <Download className="w-3 h-3 stroke-[2.5]" />
        <span>INSTALL APP</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-yellow-400 text-black border border-black hover:bg-yellow-300 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
        >
          <Smartphone className="w-3 h-3 stroke-[2.5]" />
          <span>INSTALL iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 font-mono text-xs">
            <div className="w-full max-w-sm border border-yellow-400 bg-black p-5 shadow-2xl text-white space-y-4">
              <div className="flex items-center justify-between border-b border-white pb-2">
                <h3 className="font-bold text-yellow-400 uppercase tracking-wider text-xs">
                  INSTALL ON IPHONE / IPAD
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-white hover:bg-zinc-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                1. Ketuk tombol <strong className="text-yellow-400">Bagikan (Share)</strong> di baris navigasi Safari.<br />
                2. Gulir ke bawah lalu pilih <strong className="text-yellow-400">Tambah ke Layar Utama (Add to Home Screen)</strong>.
              </p>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-1.5 bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold uppercase border border-black cursor-pointer text-xs"
              >
                TUTUP
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback for browsers that support manual PWA prompt
  return (
    <button
      type="button"
      onClick={() => {
        alert('Untuk meng-install AstraView PWA di browser ini:\n1. Buka menu titik tiga di kanan atas browser.\n2. Pilih "Simpan dan bagikan" -> "Install AstraView" atau "Add to Home Screen".');
      }}
      className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-yellow-400 border border-yellow-400 hover:bg-yellow-400 hover:text-black transition-colors flex items-center gap-1 cursor-pointer shrink-0"
    >
      <Download className="w-3 h-3 stroke-[2.5]" />
      <span className="hidden sm:inline">PWA APP</span>
    </button>
  );
};
