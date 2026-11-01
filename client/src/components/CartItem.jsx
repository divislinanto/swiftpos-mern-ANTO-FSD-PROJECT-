import React from 'react';
import { Minus, Plus, Trash2, Tag } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const isAtMaxStock = item.quantity >= item.stock;

  return (
    <div className="group relative p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col gap-2">
      {/* Top line: Name & Delete */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-base shrink-0">{item.image || '🏷️'}</span>
            <h4 className="font-semibold text-xs text-white truncate leading-tight">
              {item.name}
            </h4>
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5 ml-5">
            {formatCurrency(item.price)} each • <span className="text-slate-500">#{item.barcode}</span>
          </div>
        </div>

        <button
          onClick={() => onRemove(item._id)}
          title="Remove from cart"
          className="text-slate-500 hover:text-rose-400 p-1 rounded-md hover:bg-rose-500/10 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bottom line: Stepper & Line Total */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-800/50">
        {/* Quantity Controls */}
        <div className="flex items-center bg-slate-950 rounded-lg border border-slate-800 p-0.5">
          <button
            onClick={() => onUpdateQuantity(item._id, item.quantity - 1)}
            title="Decrease quantity"
            className="w-6 h-6 flex items-center justify-center rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <Minus className="w-3 h-3" />
          </button>

          <span className="w-8 text-center text-xs font-bold font-mono text-white">
            {item.quantity}
          </span>

          <button
            onClick={() => onUpdateQuantity(item._id, item.quantity + 1)}
            disabled={isAtMaxStock}
            title={isAtMaxStock ? 'Maximum available stock reached' : 'Increase quantity'}
            className={`w-6 h-6 flex items-center justify-center rounded-md transition-colors ${
              isAtMaxStock
                ? 'bg-slate-900 text-slate-600 cursor-not-allowed'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        {/* Line Total */}
        <div className="text-right">
          <span className="text-sm font-extrabold text-sky-400 font-mono">
            {formatCurrency(item.price * item.quantity)}
          </span>
        </div>
      </div>
    </div>
  );
};
