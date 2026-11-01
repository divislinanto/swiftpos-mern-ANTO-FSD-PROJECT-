import React, { useState } from 'react';
import {
  ShoppingCart,
  Trash2,
  PauseCircle,
  CreditCard,
  User,
  Percent,
  Check,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { CartItem } from './CartItem';
import { formatCurrency } from '../utils/formatters';

export const Cart = ({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onHoldCart,
  onCheckout,
  discountPercent,
  onSetDiscountPercent,
  customer,
  onUpdateCustomer,
  taxRate = 0.08,
}) => {
  const [showCustomerEdit, setShowCustomerEdit] = useState(false);

  // Calculations
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = taxableAmount * taxRate;
  const grandTotal = taxableAmount + taxAmount;

  const quickDiscounts = [0, 5, 10, 15];

  return (
    <aside className="w-full lg:w-96 xl:w-[420px] bg-slate-900 border-l border-slate-800 flex flex-col h-full select-none">
      {/* Header: Customer Info & Status */}
      <div className="p-3.5 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-white">
                {customer.name || 'Walk-in Customer'}
              </span>
              <button
                onClick={() => setShowCustomerEdit(!showCustomerEdit)}
                className="text-[10px] text-sky-400 hover:text-sky-300 underline"
              >
                {showCustomerEdit ? 'Done' : 'Edit'}
              </button>
            </div>
            <p className="text-[10px] text-slate-500 font-mono">
              {customer.phone || 'No phone recorded'}
            </p>
          </div>
        </div>

        {/* Clear Cart button */}
        {cartItems.length > 0 && (
          <button
            onClick={onClearCart}
            title="Clear all items in cart"
            className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1 rounded-md hover:bg-rose-500/10 transition-colors flex items-center gap-1 font-medium"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Customer Quick Edit drawer */}
      {showCustomerEdit && (
        <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex flex-col gap-2">
          <input
            type="text"
            placeholder="Customer Name..."
            value={customer.name}
            onChange={(e) => onUpdateCustomer({ ...customer, name: e.target.value })}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-sky-500"
          />
          <input
            type="text"
            placeholder="Customer Phone / Loyalty ID..."
            value={customer.phone}
            onChange={(e) => onUpdateCustomer({ ...customer, phone: e.target.value })}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-sky-500 font-mono"
          />
        </div>
      )}

      {/* Items List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {cartItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <div className="w-16 h-16 rounded-2xl bg-slate-950 flex items-center justify-center mb-3 border border-slate-800/80 text-slate-600">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <h4 className="font-semibold text-slate-300 text-sm">Register is Ready</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
              Scan barcodes or tap product cards to ring up checkout items.
            </p>
          </div>
        ) : (
          cartItems.map((item) => (
            <CartItem
              key={item._id}
              item={item}
              onUpdateQuantity={onUpdateQuantity}
              onRemove={onRemoveItem}
            />
          ))
        )}
      </div>

      {/* Bottom Summary & Pay Bar */}
      <div className="p-3.5 bg-slate-950/90 border-t border-slate-800 space-y-3">
        {/* Discount Selector */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="text-slate-400 flex items-center gap-1 font-medium">
            <Percent className="w-3.5 h-3.5 text-amber-400" /> Discount:
          </span>
          <div className="flex items-center gap-1">
            {quickDiscounts.map((pct) => (
              <button
                key={pct}
                onClick={() => onSetDiscountPercent(pct)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                  discountPercent === pct
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="space-y-1.5 text-xs text-slate-400 font-mono pt-1 border-t border-slate-800/60">
          <div className="flex justify-between">
            <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'}):</span>
            <span className="text-slate-200">{formatCurrency(subtotal)}</span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-amber-400">
              <span>Discount ({discountPercent}%):</span>
              <span>-{formatCurrency(discountAmount)}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span>Sales Tax ({(taxRate * 100).toFixed(0)}%):</span>
            <span className="text-slate-200">{formatCurrency(taxAmount)}</span>
          </div>

          <div className="flex justify-between items-baseline pt-2 border-t border-slate-800">
            <span className="text-xs uppercase tracking-wider font-bold text-white font-sans">
              Total Due:
            </span>
            <span className="text-2xl font-black text-sky-400 font-mono tracking-tight">
              {formatCurrency(grandTotal)}
            </span>
          </div>
        </div>

        {/* Action Buttons: Hold & Checkout */}
        <div className="grid grid-cols-4 gap-2 pt-1">
          {/* Hold Cart button */}
          <button
            onClick={onHoldCart}
            disabled={cartItems.length === 0}
            title="Save current cart to hold"
            className="col-span-1 py-3 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 font-semibold text-xs flex flex-col items-center justify-center gap-1 border border-slate-700 transition-all active:scale-95"
          >
            <PauseCircle className="w-4 h-4 text-amber-400" />
            <span className="text-[10px]">Hold</span>
          </button>

          {/* Primary Pay Button */}
          <button
            onClick={() => onCheckout({ subtotal, taxAmount, discountAmount, grandTotal })}
            disabled={cartItems.length === 0}
            className="col-span-3 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white font-extrabold text-base flex items-center justify-between shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all group"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
              <span>PAY NOW</span>
            </div>
            <span className="font-mono text-lg font-black bg-emerald-700/60 px-2 py-0.5 rounded-lg border border-white/20">
              {formatCurrency(grandTotal)}
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
};
