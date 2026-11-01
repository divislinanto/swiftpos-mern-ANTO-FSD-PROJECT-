import React, { useState, useEffect } from 'react';
import {
  Store,
  Clock,
  Package,
  BarChart3,
  History,
  Volume2,
  VolumeX,
  PauseCircle,
  Database,
  Sparkles,
  Zap,
} from 'lucide-react';
import { formatShortTime } from '../utils/formatters';

export const Navbar = ({
  onOpenInventory,
  onOpenAnalytics,
  onOpenHistory,
  onOpenHeldCarts,
  heldCartsCount = 0,
  isMuted,
  onToggleMute,
  mongoConnected,
  shiftStats = { revenue: 0, transactions: 0 },
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-2.5 sticky top-0 z-30 select-none">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Brand & Store details */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20 ring-1 ring-white/20">
            <Zap className="w-6 h-6 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                Swift<span className="text-sky-400">POS</span>
              </h1>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live MERN
              </span>
            </div>
            <p className="text-xs text-slate-400">Main Retail Terminal #01</p>
          </div>
        </div>

        {/* Center: Shift Metrics & Live Clock */}
        <div className="hidden lg:flex items-center gap-4 bg-slate-950/60 border border-slate-800/80 px-4 py-1.5 rounded-xl">
          <div className="flex items-center gap-2 border-r border-slate-800 pr-4">
            <Clock className="w-4 h-4 text-sky-400" />
            <div className="text-xs font-mono font-medium text-slate-300">
              {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              <span className="mx-1 text-slate-600">|</span>
              <span className="text-white font-bold">{currentTime.toLocaleTimeString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-slate-400">Shift Sales:</span>{' '}
              <span className="font-bold text-emerald-400 font-mono">
                ${shiftStats.revenue.toFixed(2)}
              </span>
            </div>
            <div className="border-r border-slate-800 h-3"></div>
            <div>
              <span className="text-slate-400">Orders:</span>{' '}
              <span className="font-bold text-sky-400 font-mono">
                {shiftStats.transactions}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions & Tools */}
        <div className="flex items-center gap-2">
          {/* Held Carts Button */}
          <button
            onClick={onOpenHeldCarts}
            title="Recall Held Carts (F4)"
            className="relative px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs font-medium flex items-center gap-1.5 border border-slate-700/60"
          >
            <PauseCircle className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Hold Cart</span>
            {heldCartsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 animate-pulse">
                {heldCartsCount}
              </span>
            )}
          </button>

          {/* Inventory Manager */}
          <button
            onClick={onOpenInventory}
            title="Live Stock & Inventory Manager"
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs font-medium flex items-center gap-1.5 border border-slate-700/60"
          >
            <Package className="w-4 h-4 text-sky-400" />
            <span className="hidden md:inline">Inventory</span>
          </button>

          {/* Daily Analytics */}
          <button
            onClick={onOpenAnalytics}
            title="Daily Register & POS Analytics"
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs font-medium flex items-center gap-1.5 border border-slate-700/60"
          >
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            <span className="hidden md:inline">Analytics</span>
          </button>

          {/* Order History */}
          <button
            onClick={onOpenHistory}
            title="Transaction History & Refunds"
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs font-medium flex items-center gap-1.5 border border-slate-700/60"
          >
            <History className="w-4 h-4 text-teal-400" />
            <span className="hidden sm:inline">History</span>
          </button>

          {/* MongoDB Compass Status Badge */}
          <div
            title="MongoDB Compass connected to mongodb://127.0.0.1:27017/pos_db"
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 text-xs font-mono"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Compass: pos_db</span>
          </div>

          {/* Sound Mute Toggle */}
          <button
            onClick={onToggleMute}
            title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700/60"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
