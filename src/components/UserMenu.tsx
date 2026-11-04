import React, { useState } from 'react';
import { useFirebase } from '../hooks/useFirebase';
import { LogOut, User, Settings, ShieldCheck, ChevronDown } from 'lucide-react';

export const UserMenu: React.FC = () => {
  const { user, logout } = useFirebase();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1 bg-[#0B0F17] border border-slate-800 rounded hover:bg-slate-800 transition-colors cursor-pointer"
      >
        {user.photoURL ? (
          <img src={user.photoURL} alt="" className="w-5 h-5 rounded-full border border-yellow-500/50" />
        ) : (
          <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center text-black font-bold text-[10px]">
            {user.displayName?.charAt(0) || user.email?.charAt(0)}
          </div>
        )}
        <span className="hidden sm:inline text-[11px] font-bold text-white max-w-[100px] truncate">
          {user.displayName || user.email}
        </span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-1.5 w-48 bg-[#111722] border border-slate-800 shadow-2xl z-50 py-1 font-mono text-[11px]">
            <div className="px-3 py-2 border-b border-slate-800">
              <div className="text-white font-bold truncate">{user.displayName}</div>
              <div className="text-slate-500 text-[9px] truncate">{user.email}</div>
              {user.emailVerified && (
                <div className="flex items-center gap-1 mt-1 text-emerald-400 text-[9px]">
                  <ShieldCheck className="w-2.5 h-2.5" /> Verified Account
                </div>
              )}
            </div>
            
            <button className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2 cursor-pointer">
              <User className="w-3.5 h-3.5" /> Profil Trading
            </button>
            <button className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2 cursor-pointer">
              <Settings className="w-3.5 h-3.5" /> Pengaturan Cloud
            </button>
            
            <div className="border-t border-slate-800 my-1" />
            
            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-rose-400 hover:bg-rose-950/30 flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Keluar Terminal
            </button>
          </div>
        </>
      )}
    </div>
  );
};
