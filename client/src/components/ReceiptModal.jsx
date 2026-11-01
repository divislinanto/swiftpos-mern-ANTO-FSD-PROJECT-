import React, { useEffect } from 'react';
import { Printer, CheckCircle, ArrowRight, Download, Share2 } from 'lucide-react';
import { formatCurrency, formatDateTime } from '../utils/formatters';

export const ReceiptModal = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  // Listen for Enter key to start new transaction
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none animate-fadeIn overflow-y-auto">
      <div className="w-full max-w-md my-auto flex flex-col items-center">
        {/* Printable Thermal Receipt Card */}
        <div
          id="printable-receipt"
          className="receipt-paper w-full rounded-2xl p-6 text-slate-900 border border-slate-300 shadow-2xl relative font-mono text-xs"
        >
          {/* Header */}
          <div className="text-center space-y-1 pb-4 border-b border-dashed border-slate-400">
            <h2 className="text-base font-black tracking-wider text-slate-950 font-sans">
              SWIFTPOS RETAIL MART
            </h2>
            <p className="text-[11px] text-slate-600">Store #104 • Flagship Retail</p>
            <p className="text-[10px] text-slate-500">742 Evergreen Terrace, Retail Hub</p>
            <p className="text-[10px] text-slate-500">Tel: +1 (800) 555-0199</p>

            <div className="pt-2 text-[10px] text-slate-600 flex justify-between font-mono">
              <span>Date: {formatDateTime(order.createdAt || new Date())}</span>
              <span className="font-bold text-slate-900">{order.cashierName || 'Cashier 01'}</span>
            </div>
          </div>

          {/* Order Info & Simulated Barcode */}
          <div className="py-2.5 border-b border-dashed border-slate-400 flex flex-col items-center">
            <div className="flex justify-between w-full text-[11px] font-semibold text-slate-800">
              <span>Receipt #:</span>
              <span className="font-bold text-slate-950">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between w-full text-[10px] text-slate-600 mt-0.5">
              <span>Customer:</span>
              <span>{order.customerName || 'Walk-in Customer'}</span>
            </div>

            {/* Visual Barcode Graphic */}
            <div className="my-2 py-1 px-4 bg-white border border-slate-200 rounded flex flex-col items-center w-full">
              <div className="h-9 w-full flex items-center justify-center gap-0.5 overflow-hidden">
                {[1,3,2,1,4,2,1,3,1,2,4,1,2,3,2,1,4,1,2,3,1,2,4,2,1,3].map((w, idx) => (
                  <div
                    key={idx}
                    className="bg-black h-8"
                    style={{ width: `${w * 1.5}px` }}
                  />
                ))}
              </div>
              <span className="text-[9px] tracking-widest text-slate-600 mt-0.5 font-mono">
                *{order.orderNumber}*
              </span>
            </div>
          </div>

          {/* Line Items */}
          <div className="py-3 border-b border-dashed border-slate-400 space-y-2">
            <div className="grid grid-cols-12 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-200 pb-1">
              <span className="col-span-6">Item</span>
              <span className="col-span-2 text-center">Qty</span>
              <span className="col-span-2 text-right">Price</span>
              <span className="col-span-2 text-right">Total</span>
            </div>

            {order.items?.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 text-[11px] text-slate-800 items-center">
                <span className="col-span-6 truncate font-medium text-slate-950">
                  {item.name}
                </span>
                <span className="col-span-2 text-center text-slate-600">
                  {item.quantity}
                </span>
                <span className="col-span-2 text-right text-slate-600 font-mono">
                  ${item.price.toFixed(2)}
                </span>
                <span className="col-span-2 text-right font-bold text-slate-950 font-mono">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Financial Breakdown */}
          <div className="py-2.5 border-b border-dashed border-slate-400 space-y-1 text-[11px]">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>

            {order.discountAmount > 0 && (
              <div className="flex justify-between text-slate-700">
                <span>Discount Applied:</span>
                <span>-{formatCurrency(order.discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600">
              <span>Sales Tax (8%):</span>
              <span>{formatCurrency(order.taxAmount)}</span>
            </div>

            <div className="flex justify-between text-sm font-extrabold text-slate-950 pt-1 border-t border-slate-300">
              <span>TOTAL PAID:</span>
              <span>{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>

          {/* Payment Method Details */}
          <div className="py-2 text-[10px] text-slate-600 space-y-0.5 border-b border-dashed border-slate-400">
            <div className="flex justify-between">
              <span>Payment Type:</span>
              <span className="font-bold text-slate-900">{order.paymentMethod}</span>
            </div>

            {order.paymentMethod === 'CASH' && (
              <>
                <div className="flex justify-between">
                  <span>Cash Tendered:</span>
                  <span>{formatCurrency(order.paymentDetails?.cashTendered || order.totalAmount)}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-950">
                  <span>Change Given:</span>
                  <span>{formatCurrency(order.paymentDetails?.changeDue || 0)}</span>
                </div>
              </>
            )}

            {order.paymentMethod === 'CARD' && (
              <div className="flex justify-between">
                <span>Card (Ending in):</span>
                <span>•••• {order.paymentDetails?.cardLast4 || '4242'}</span>
              </div>
            )}
          </div>

          {/* Footer Note */}
          <div className="pt-3 text-center space-y-1 text-[9px] text-slate-500">
            <p className="font-semibold text-slate-700">THANK YOU FOR YOUR BUSINESS!</p>
            <p>Exchange or returns accepted within 14 days with original receipt</p>
            <p className="text-[8px] text-slate-400 font-mono">Powered by SwiftPOS MERN Terminal</p>
          </div>
        </div>

        {/* Modal Action Controls (Not printed) */}
        <div className="w-full mt-4 flex items-center justify-between gap-3 no-print">
          <button
            onClick={handlePrint}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700 shadow-lg active:scale-95 transition-all"
          >
            <Printer className="w-4 h-4 text-sky-400" />
            <span>Print Receipt</span>
          </button>

          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 active:scale-95 transition-all"
          >
            <span>Next Customer</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
