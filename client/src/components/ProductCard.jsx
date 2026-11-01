import React from 'react';
import { Plus, AlertTriangle, Check, Barcode } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export const ProductCard = ({ product, onAddToCart, inCartQty = 0 }) => {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= (product.minStockAlert || 5);
  const remainingStock = Math.max(0, product.stock - inCartQty);

  const handleClick = () => {
    if (remainingStock <= 0) return;
    onAddToCart(product);
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative rounded-2xl p-4 transition-all duration-200 select-none flex flex-col justify-between border ${
        isOutOfStock
          ? 'bg-slate-900/40 border-slate-800 opacity-60 cursor-not-allowed'
          : remainingStock <= 0
          ? 'bg-slate-900/60 border-amber-900/50 cursor-not-allowed'
          : 'bg-slate-900/80 hover:bg-slate-800/90 border-slate-800 hover:border-sky-500/50 hover:shadow-xl hover:shadow-sky-500/5 cursor-pointer active:scale-[0.98]'
      }`}
    >
      {/* Top row: Category tag & in-cart badge */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          {product.category}
        </span>

        {inCartQty > 0 && (
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-sky-500 text-white flex items-center gap-1 shadow-md shadow-sky-500/20">
            <Check className="w-3 h-3 stroke-[3]" /> {inCartQty} in cart
          </span>
        )}
      </div>

      {/* Middle row: Icon & Title */}
      <div className="flex items-center gap-3 my-2">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner border border-white/10 shrink-0"
          style={{ backgroundColor: `${product.color || '#3b82f6'}25` }}
        >
          {product.image || '🏷️'}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-100 text-sm leading-tight line-clamp-2 group-hover:text-sky-300 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1 font-mono">
            <Barcode className="w-3 h-3 text-slate-500" />
            <span>{product.barcode}</span>
          </div>
        </div>
      </div>

      {/* Bottom row: Price & Stock Badge */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
        <div>
          <span className="text-base font-extrabold text-white tracking-tight">
            {formatCurrency(product.price)}
          </span>
          <span className="text-[10px] text-slate-500 ml-1">/{product.unit || 'pcs'}</span>
        </div>

        <div>
          {isOutOfStock || remainingStock <= 0 ? (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
              Out of stock
            </span>
          ) : isLowStock ? (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {remainingStock} left
            </span>
          ) : (
            <span className="text-[11px] text-emerald-400/90 font-medium">
              {remainingStock} in stock
            </span>
          )}
        </div>
      </div>

      {/* Quick Add Plus Pill (visible on hover) */}
      {!isOutOfStock && remainingStock > 0 && (
        <button
          title="Add to cart"
          className="absolute bottom-3 right-3 w-8 h-8 rounded-lg bg-sky-500 hover:bg-sky-400 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg shadow-sky-500/30"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
        </button>
      )}
    </div>
  );
};
