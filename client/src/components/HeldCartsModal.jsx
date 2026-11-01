import React from 'react';
import { X, PauseCircle, Play, Trash2, Clock, User } from 'lucide-react';
import { formatCurrency, formatDateTime } from '../utils/formatters';

export const HeldCartsModal = ({
  isOpen,
  onClose,
  heldCarts,
  onRestoreCart,
  onDeleteHeldCart,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <PauseCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Held Shopping Carts</h3>
              <p className="text-xs text-slate-400">
                {heldCarts.length} {heldCarts.length === 1 ? 'cart' : 'carts'} currently on hold
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {heldCarts.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              No carts are currently on hold. Use "Hold" in checkout when a customer steps aside!
            </div>
          ) : (
            heldCarts.map((cart) => {
              const subtotal = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
              const itemCount = cart.items.reduce((s, i) => s + i.quantity, 0);

              return (
                <div
                  key={cart.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">
                        {cart.customer?.name || 'Walk-in Customer'}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        ({itemCount} items)
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {formatDateTime(cart.timestamp)}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 font-mono pt-1">
                      {cart.items.map((i) => `${i.name} (x${i.quantity})`).slice(0, 3).join(', ')}
                      {cart.items.length > 3 && ` +${cart.items.length - 3} more`}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="text-right font-mono mr-2">
                      <span className="text-xs text-slate-400 block font-sans">Total</span>
                      <span className="text-lg font-black text-sky-400">
                        {formatCurrency(subtotal)}
                      </span>
                    </div>

                    <button
                      onClick={() => onDeleteHeldCart(cart.id)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Discard held cart"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onRestoreCart(cart)}
                      className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-sky-500/20 active:scale-95 transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Resume</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
