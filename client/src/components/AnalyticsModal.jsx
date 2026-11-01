import React from 'react';
import {
  X,
  BarChart3,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Database,
  Copy,
  Check,
  CreditCard,
  Banknote,
  QrCode,
  Layers,
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export const AnalyticsModal = ({ isOpen, onClose, analytics, onRestockProduct }) => {
  if (!isOpen || !analytics) return null;

  const [copied, setCopied] = React.useState(false);

  const compassUri = 'mongodb://127.0.0.1:27017/pos_db';

  const copyCompassUri = () => {
    navigator.clipboard.writeText(compassUri);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const paymentBreakdown = analytics.paymentBreakdown || { CASH: 0, CARD: 0, UPI: 0, SPLIT: 0 };
  const totalRev = analytics.todayRevenue || 1; // avoid / 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Daily POS Register & Sales Analytics</h3>
              <p className="text-xs text-slate-400">Live retail metrics synced with MongoDB database</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Shift Revenue</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400 font-mono mt-2">
                {formatCurrency(analytics.todayRevenue || 0)}
              </div>
              <span className="text-[10px] text-slate-500 mt-1">Today's completed sales</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Transactions</span>
                <ShoppingBag className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-2xl font-black text-sky-400 font-mono mt-2">
                {analytics.todayTransactions || 0}
              </div>
              <span className="text-[10px] text-slate-500 mt-1">Receipts printed today</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Avg Order Value</span>
                <TrendingUp className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-black text-indigo-400 font-mono mt-2">
                {formatCurrency(analytics.avgOrderValue || 0)}
              </div>
              <span className="text-[10px] text-slate-500 mt-1">Average basket size</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Stock Units</span>
                <Layers className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-400 font-mono mt-2">
                {analytics.totalStockUnits || 0}
              </div>
              <span className="text-[10px] text-slate-500 mt-1">Across {analytics.totalProducts || 0} items</span>
            </div>
          </div>

          {/* Payment Method Breakdown & Top Sellers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tender Breakdown */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <span>Tender Breakdown (Today)</span>
              </h4>

              <div className="space-y-2.5 text-xs font-mono">
                <div>
                  <div className="flex justify-between mb-1 text-slate-300">
                    <span className="flex items-center gap-1.5 font-sans font-medium">
                      <Banknote className="w-3.5 h-3.5 text-emerald-400" /> Cash Tender
                    </span>
                    <span>{formatCurrency(paymentBreakdown.CASH || 0)}</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-400 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(100, ((paymentBreakdown.CASH || 0) / totalRev) * 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1 text-slate-300">
                    <span className="flex items-center gap-1.5 font-sans font-medium">
                      <CreditCard className="w-3.5 h-3.5 text-sky-400" /> Card / POS Terminal
                    </span>
                    <span>{formatCurrency(paymentBreakdown.CARD || 0)}</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-sky-400 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(100, ((paymentBreakdown.CARD || 0) / totalRev) * 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1 text-slate-300">
                    <span className="flex items-center gap-1.5 font-sans font-medium">
                      <QrCode className="w-3.5 h-3.5 text-indigo-400" /> Digital / UPI QR
                    </span>
                    <span>{formatCurrency(paymentBreakdown.UPI || 0)}</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-indigo-400 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(100, ((paymentBreakdown.UPI || 0) / totalRev) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Top 5 Best-Selling Products */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Top-Selling Products (Volume)
              </h4>

              {analytics.topSellingProducts?.length > 0 ? (
                <div className="space-y-2">
                  {analytics.topSellingProducts.map((p, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-900/60 border border-slate-800/60"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-slate-800 text-sky-400 flex items-center justify-center font-bold text-[10px]">
                          #{idx + 1}
                        </span>
                        <span className="font-medium text-slate-200 truncate max-w-[160px]">
                          {p.name}
                        </span>
                      </div>
                      <div className="text-right font-mono">
                        <span className="font-bold text-white">{p.quantity} sold</span>
                        <span className="text-slate-500 block text-[10px]">{formatCurrency(p.revenue)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-4 text-center">
                  No sales recorded yet today. Complete a checkout to see top items!
                </p>
              )}
            </div>
          </div>

          {/* MongoDB Compass Connection Instructions Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-950 border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <Database className="w-4 h-4" />
                <span>MongoDB Compass Connection Link</span>
              </div>
              <button
                onClick={copyCompassUri}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-mono flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied URI' : 'Copy Compass URI'}</span>
              </button>
            </div>
            <p className="text-xs text-slate-300">
              Open MongoDB Compass on your computer, paste{' '}
              <code className="text-emerald-300 bg-slate-900 px-1.5 py-0.5 rounded font-mono font-bold">
                {compassUri}
              </code>{' '}
              and click <strong>Connect</strong> to view live sales and product documents updating in real time!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
