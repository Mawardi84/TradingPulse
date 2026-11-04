import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-3 left-3 z-50 flex items-center gap-2 bg-yellow-500 text-black px-3 py-1.5 font-mono text-[11px] font-bold border border-black shadow-2xl animate-pulse">
      <WifiOff className="w-4 h-4 stroke-[2.5]" />
      <span>OFFLINE MODE — MENGGUNAKAN DATA CACHED PWA</span>
    </div>
  );
};
