import React, { useState } from 'react';
import {
  X,
  Banknote,
  CreditCard,
  QrCode,
  Split,
  CheckCircle2,
  AlertCircle,
  Delete,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatCurrency } from '../utils/formatters';
import { sound } from '../utils/sound';

export const PaymentModal = ({
  isOpen,
  onClose,
  totals,
  cartItems,
  customer,
  onCompleteSale,
  isProcessing,
}) => {
  if (!isOpen) return null;

  const { grandTotal, subtotal, taxAmount, discountAmount } = totals;

  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [cashTendered, setCashTendered] = useState(grandTotal.toFixed(2));
  const [cardLast4, setCardLast4] = useState('4242');
  const [cardType, setCardType] = useState('Visa');
  const [upiRef, setUpiRef] = useState('UPI-' + Math.floor(100000 + Math.random() * 900000));
  const [splitCash, setSplitCash] = useState((grandTotal / 2).toFixed(2));

  const tenderedNum = parseFloat(cashTendered) || 0;
  const changeDue = Math.max(0, tenderedNum - grandTotal);
  const remainingDue = Math.max(0, grandTotal - tenderedNum);

  // Quick cash bill buttons
  const quickCashOptions = [
    { label: 'Exact', value: grandTotal },
    { label: '$10', value: 10 },
    { label: '$20', value: 20 },
    { label: '$50', value: 50 },
    { label: '$100', value: 100 },
  ];

  // Numpad input handler
  const handleNumpad = (val) => {
    sound.playDrawer();
    if (val === 'C') {
      setCashTendered('0');
    } else if (val === 'BACK') {
      setCashTendered((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
    } else if (val === '.') {
      if (!cashTendered.includes('.')) {
        setCashTendered((prev) => prev + '.');
      }
    } else {
      setCashTendered((prev) => {
        if (prev === '0') return String(val);
        return prev + String(val);
      });
    }
  };

  // Submit payment
  const handleSubmit = () => {
    if (paymentMethod === 'CASH' && tenderedNum < grandTotal) {
      sound.playError();
      return;
    }

    // Play sounds & trigger confetti
    sound.playDrawer();
    setTimeout(() => sound.playSuccess(), 80);

    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
    });

    const paymentDetails = {
      method: paymentMethod,
      cashTendered: paymentMethod === 'CASH' ? tenderedNum : grandTotal,
      changeDue: paymentMethod === 'CASH' ? changeDue : 0,
      cardLast4: paymentMethod === 'CARD' ? cardLast4 : '',
      transactionRef:
        paymentMethod === 'UPI'
          ? upiRef
          : paymentMethod === 'CARD'
          ? `AUTH-${Math.floor(100000 + Math.random() * 900000)}`
          : '',
      splitDetails:
        paymentMethod === 'SPLIT'
          ? {
              cash: parseFloat(splitCash) || 0,
              card: Math.max(0, grandTotal - (parseFloat(splitCash) || 0)),
            }
          : null,
    };

    onCompleteSale(paymentDetails);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
              $
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Process Checkout Payment</h3>
              <p className="text-xs text-slate-400">
                Customer: <span className="text-slate-200">{customer.name || 'Walk-in'}</span> • {cartItems.length} items
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block font-sans">Amount Due</span>
            <span className="text-2xl font-black text-sky-400 font-mono tracking-tight">
              {formatCurrency(grandTotal)}
            </span>
          </div>
        </div>

        {/* Payment Method Selector Tabs */}
        <div className="grid grid-cols-4 gap-2 p-3 bg-slate-950/40 border-b border-slate-800">
          {[
            { id: 'CASH', label: 'Cash Tender', icon: Banknote },
            { id: 'CARD', label: 'Credit / Debit', icon: CreditCard },
            { id: 'UPI', label: 'Digital / QR', icon: QrCode },
            { id: 'SPLIT', label: 'Split Pay', icon: Split },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = paymentMethod === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setPaymentMethod(tab.id)}
                className={`py-2.5 px-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1.5 transition-all border ${
                  isSelected
                    ? 'bg-sky-500/20 border-sky-400 text-sky-300 shadow-md shadow-sky-500/10'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Method Specific Content Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* 1. CASH PAYMENT */}
          {paymentMethod === 'CASH' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column: Quick Bills & Change Display */}
              <div className="flex flex-col justify-between space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-2">
                    Quick Cash Tender
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {quickCashOptions.map((opt) => (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => {
                          setCashTendered(opt.value.toFixed(2));
                          sound.playDrawer();
                        }}
                        className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-mono text-xs font-bold border border-slate-700/80 transition-all active:scale-95"
                      >
                        {opt.label === 'Exact' ? 'Exact' : opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tendered Input Display */}
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <div className="text-[11px] text-slate-400 uppercase font-semibold mb-1">
                    Cash Received
                  </div>
                  <div className="text-3xl font-black text-white font-mono flex items-center justify-between">
                    <span>$</span>
                    <span>{cashTendered || '0.00'}</span>
                  </div>
                </div>

                {/* Live Change Calculator Banner */}
                <div
                  className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                    tenderedNum >= grandTotal
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {tenderedNum >= grandTotal ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-rose-400" />
                    )}
                    <div>
                      <div className="text-xs font-bold">
                        {tenderedNum >= grandTotal ? 'Change Due' : 'Short / Balance Due'}
                      </div>
                      <div className="text-[10px] opacity-80">
                        {tenderedNum >= grandTotal ? 'Hand cash change to customer' : 'Awaiting additional cash'}
                      </div>
                    </div>
                  </div>

                  <span className="text-2xl font-black font-mono">
                    {tenderedNum >= grandTotal
                      ? formatCurrency(changeDue)
                      : formatCurrency(remainingDue)}
                  </span>
                </div>
              </div>

              {/* Right Column: Virtual Touch Numpad */}
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleNumpad(num)}
                      className="h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-mono text-base font-bold border border-slate-800/80 active:scale-95 transition-all shadow-sm flex items-center justify-center"
                    >
                      {num}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => handleNumpad('BACK')}
                    className="h-12 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-rose-400 font-mono text-xs font-bold border border-slate-800/80 active:scale-95 transition-all flex items-center justify-center"
                  >
                    <Delete className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => handleNumpad('00')}
                    className="py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs font-bold border border-slate-800"
                  >
                    00
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNumpad('C')}
                    className="py-2.5 rounded-xl bg-slate-900 hover:bg-rose-900/40 text-rose-400 font-mono text-xs font-bold border border-slate-800"
                  >
                    Clear (C)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. CARD PAYMENT */}
          {paymentMethod === 'CARD' && (
            <div className="space-y-4 py-2">
              {/* Virtual EMV Chip Card */}
              <div className="w-full max-w-sm mx-auto h-48 rounded-2xl p-5 bg-gradient-to-tr from-indigo-900 via-sky-900 to-slate-900 border border-sky-400/30 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-7 rounded bg-amber-400/80 border border-amber-300 flex items-center justify-center shadow-inner">
                    <div className="w-6 h-4 border border-amber-600/60 rounded-sm"></div>
                  </div>
                  <span className="font-bold tracking-wider text-sky-300 text-sm">SwiftPOS Pay</span>
                </div>

                <div className="space-y-1">
                  <div className="text-lg font-mono tracking-widest text-slate-200">
                    •••• •••• •••• {cardLast4 || '4242'}
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                    Valid Thru 12/28
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <div className="text-xs uppercase font-medium text-slate-300">
                    {customer.name || 'VALUED CUSTOMER'}
                  </div>
                  <span className="font-black italic text-lg tracking-wider text-sky-400">VISA</span>
                </div>
              </div>

              {/* Card Terminal Controls */}
              <div className="max-w-md mx-auto space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2 text-xs text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Integrated POS EMV Terminal Ready</span>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-[11px] text-slate-400 block mb-1">Card Last 4 Digits</label>
                    <input
                      type="text"
                      maxLength={4}
                      value={cardLast4}
                      onChange={(e) => setCardLast4(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-sky-500 outline-none"
                    />
                  </div>

                  <div className="w-32">
                    <label className="text-[11px] text-slate-400 block mb-1">Network</label>
                    <select
                      value={cardType}
                      onChange={(e) => setCardType(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-2 text-xs text-white outline-none focus:border-sky-500"
                    >
                      <option value="Visa">Visa</option>
                      <option value="Mastercard">Mastercard</option>
                      <option value="Amex">Amex</option>
                      <option value="RuPay">RuPay</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. DIGITAL / UPI QR */}
          {paymentMethod === 'UPI' && (
            <div className="flex flex-col items-center justify-center space-y-4 py-2">
              <div className="bg-white p-4 rounded-2xl shadow-xl flex flex-col items-center border-4 border-sky-500/20">
                {/* SVG QR Code Simulation */}
                <svg className="w-44 h-44" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="1.5">
                  <rect x="2" y="2" width="6" height="6" rx="1" fill="#0f172a" />
                  <rect x="16" y="2" width="6" height="6" rx="1" fill="#0f172a" />
                  <rect x="2" y="16" width="6" height="6" rx="1" fill="#0f172a" />
                  <path d="M10 2h4M10 6h4M10 10h4M2 10h4M6 14h2M14 14h2M18 10h4M14 18h2M18 18h4" strokeLinecap="round" />
                  <circle cx="12" cy="12" r="2" fill="#0284c7" />
                </svg>
                <div className="text-center mt-2 font-mono text-[11px] text-slate-700 font-bold">
                  UPI: swiftpos.retail@okaxis
                </div>
              </div>

              <div className="w-full max-w-sm space-y-2">
                <label className="text-xs text-slate-400 block">Transaction Reference ID</label>
                <input
                  type="text"
                  value={upiRef}
                  onChange={(e) => setUpiRef(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-sky-500"
                />
              </div>
            </div>
          )}

          {/* 4. SPLIT PAYMENT */}
          {paymentMethod === 'SPLIT' && (
            <div className="max-w-md mx-auto space-y-4 py-2">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Cash Portion ($)</label>
                  <input
                    type="number"
                    value={splitCash}
                    onChange={(e) => setSplitCash(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-sky-500 outline-none"
                  />
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Card Portion ($):</span>
                  <span className="text-sky-400 font-bold">
                    {formatCurrency(Math.max(0, grandTotal - (parseFloat(splitCash) || 0)))}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer: Cancel & Confirm Buttons */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
          >
            Cancel / Back
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isProcessing || (paymentMethod === 'CASH' && tenderedNum < grandTotal)}
            className="flex-1 max-w-xs px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
          >
            {isProcessing ? (
              <span>Updating MongoDB Live...</span>
            ) : (
              <>
                <span>Complete Sale & Print</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
