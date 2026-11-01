import React, { useState } from 'react';
import {
  X,
  History,
  Search,
  Eye,
  RotateCcw,
  CheckCircle2,
  Receipt,
  User,
  CreditCard,
  Banknote,
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '../utils/formatters';

export const OrderHistoryModal = ({
  isOpen,
  onClose,
  orders,
  onViewReceipt,
  onRefundOrder,
}) => {
  if (!isOpen) return null;

  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrders = orders.filter((o) => {
    return (
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.customerName && o.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Transaction History & Receipts</h3>
              <p className="text-xs text-slate-400">View past sales, reprint thermal receipts, and issue refunds</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 bg-slate-950/40 border-b border-slate-800">
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search receipt # or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* Orders Table */}
        <div className="flex-1 overflow-y-auto">
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              No transaction history found matching your search.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 sticky top-0 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Receipt #</th>
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Items</th>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredOrders.map((o) => (
                  <tr key={o._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-white font-mono">{o.orderNumber}</td>
                    <td className="py-3 px-3 text-slate-400 text-[11px] font-sans">
                      {formatDateTime(o.createdAt)}
                    </td>
                    <td className="py-3 px-3 font-sans text-slate-300">
                      {o.customerName || 'Walk-in'}
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-mono">
                      {o.itemCount || o.items?.length || 0}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                        {o.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-extrabold text-emerald-400">
                      {formatCurrency(o.totalAmount)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          o.status === 'REFUNDED'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 font-sans">
                        <button
                          onClick={() => onViewReceipt(o)}
                          title="View and reprint thermal receipt"
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-white text-xs font-semibold flex items-center gap-1 border border-slate-700"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>Receipt</span>
                        </button>

                        {o.status !== 'REFUNDED' && (
                          <button
                            onClick={() => onRefundOrder(o._id)}
                            title="Refund transaction and return items to stock"
                            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 text-xs font-semibold flex items-center gap-1 border border-slate-700"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Refund</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
