import React from "react";
import { 
  Truck, 
  Zap,
  LogOut
} from "lucide-react";

interface HeaderProps {
  currentUser?: any;
  onLogout?: () => void;
}

export default function Header({ currentUser, onLogout }: HeaderProps) {
  return (
    <header className="bg-slate-900 border-b border-[#1e293b] p-4 sm:p-5 shadow-lg" id="app-header">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        
        {/* Brand logo details block */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500 rounded-2xl flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/10">
            <Truck className="w-7 h-7 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-display font-black tracking-tight text-white uppercase">
                Load<span className="text-amber-400">Mitra</span>
              </h1>
              <span className="bg-emerald-950 text-emerald-400 text-[10px] uppercase tracking-widest font-mono font-black px-2 py-0.5 rounded border border-emerald-800">
                LIVEMARKET
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Transparent, Broker-Free Digital Freight Transport connecting Transporters & Shippers
            </p>
          </div>
        </div>

        {/* Global direct stats overview block */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-6 self-stretch md:self-auto justify-between border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
          <div className="flex items-center gap-2 text-left">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping shrink-0" />
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-mono tracking-wider font-semibold">Active Trucks</span>
              <span className="font-mono text-xs font-bold text-slate-200">2,812 Drivers</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-left">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-mono tracking-wider font-semibold">Instant Quote Bids</span>
              <span className="font-mono text-xs font-bold text-slate-200">14-Secs Avg</span>
            </div>
          </div>

          {/* User Sign-out display block */}
          {currentUser && onLogout && (
            <div className="flex items-center gap-3 bg-slate-950/60 p-2 px-3.5 rounded-xl border border-slate-850 shrink-0 text-left">
              <div>
                <span className="text-[9px] text-emerald-400 uppercase tracking-widest font-bold font-mono block">Mitra Session</span>
                <span className="text-xs text-slate-300 font-semibold block truncate max-w-[130px]">{currentUser.email || "Trial Driver Account"}</span>
              </div>
              <button
                onClick={onLogout}
                className="bg-slate-800 hover:bg-red-950/40 text-slate-400 hover:text-red-400 p-2 rounded-lg border border-slate-700 hover:border-red-900 transition flex items-center justify-center cursor-pointer"
                title="Logout Gate"
                id="header-logout-btn"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
