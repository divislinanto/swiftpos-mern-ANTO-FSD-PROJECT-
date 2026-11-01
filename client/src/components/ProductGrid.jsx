import React, { useState, useRef, useEffect } from 'react';
import { Search, Barcode, Sparkles, X, Filter, Zap, RefreshCw } from 'lucide-react';
import { ProductCard } from './ProductCard';

export const ProductGrid = ({
  products,
  onAddToCart,
  cartItems,
  onScanBarcode,
  isLoading,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [barcodeInput, setBarcodeInput] = useState('');
  const barcodeInputRef = useRef(null);

  // Extract unique categories
  const categories = ['All', ...new Set(products.map((p) => p.category))];

  // Focus barcode input on mount and on shortcut (F2 or /)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F2' || (e.key === '/' && document.activeElement !== barcodeInputRef.current)) {
        e.preventDefault();
        barcodeInputRef.current?.focus();
        barcodeInputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle barcode submit
  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    const code = barcodeInput.trim();
    if (!code) return;

    onScanBarcode(code);
    setBarcodeInput('');
  };

  // Filter products by category and search
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === 'All' || product.category === selectedCategory;

    const matchesSearch =
      searchQuery === '' ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.barcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Calculate cart qty map for quick lookup
  const cartQtyMap = cartItems.reduce((acc, item) => {
    acc[item._id] = item.quantity;
    return acc;
  }, {});

  // Demo sample barcodes for fast testing
  const sampleBarcodes = [
    { code: '8901001', label: 'Coffee' },
    { code: '8902001', label: 'Crisps' },
    { code: '8903001', label: 'Croissant' },
    { code: '8905001', label: 'USB Cable' },
    { code: '8901004', label: 'Low Stock Energy' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-4">
      {/* Top Controls: Barcode Scanning Gun & Text Search */}
      <div className="flex flex-col lg:flex-row gap-3 mb-4">
        {/* Fast Barcode Scanner Input */}
        <form
          onSubmit={handleBarcodeSubmit}
          className="relative flex-1 flex items-center"
        >
          <div className="absolute left-3.5 flex items-center gap-1.5 pointer-events-none text-sky-400">
            <Barcode className="w-5 h-5" />
          </div>
          <input
            ref={barcodeInputRef}
            type="text"
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            placeholder="Scan barcode or type & press Enter (Press F2 to focus)..."
            className="w-full bg-slate-900 border-2 border-slate-700/80 focus:border-sky-500 rounded-xl pl-11 pr-24 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all font-mono shadow-inner shadow-black/40"
          />
          <div className="absolute right-2 flex items-center gap-1">
            {barcodeInput && (
              <button
                type="button"
                onClick={() => setBarcodeInput('')}
                className="p-1 rounded-md text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="px-3 py-1 bg-sky-500 hover:bg-sky-400 text-white rounded-lg text-xs font-semibold shadow-md shadow-sky-500/20 active:scale-95 transition-all flex items-center gap-1"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              Scan
            </button>
          </div>
        </form>

        {/* Search Input & Refresh */}
        <div className="flex items-center gap-2 lg:w-80">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items, SKU..."
              className="w-full bg-slate-900 border border-slate-800 focus:border-slate-700 rounded-xl pl-9 pr-8 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={onRefresh}
            title="Refresh Live Inventory"
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-sky-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Quick Test Barcode Bar */}
      <div className="flex items-center gap-2 mb-3 text-xs text-slate-400 overflow-x-auto pb-1">
        <span className="shrink-0 font-medium text-slate-500 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Quick Scan Demo:
        </span>
        {sampleBarcodes.map((item) => (
          <button
            key={item.code}
            type="button"
            onClick={() => onScanBarcode(item.code)}
            className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-sky-950/60 text-slate-300 hover:text-sky-300 border border-slate-800 hover:border-sky-500/40 font-mono transition-all flex items-center gap-1"
          >
            <span>{item.label}</span>
            <span className="text-[10px] text-slate-500">({item.code})</span>
          </button>
        ))}
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          const count =
            cat === 'All'
              ? products.length
              : products.filter((p) => p.category === cat).length;

          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                isSelected
                  ? 'bg-sky-500 border-sky-400 text-white shadow-lg shadow-sky-500/20'
                  : 'bg-slate-900/70 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span>{cat}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Product Cards Grid */}
      <div className="flex-1 overflow-y-auto pr-1">
        {filteredProducts.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-8 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800">
            <Filter className="w-10 h-10 text-slate-600 mb-3" />
            <h4 className="font-semibold text-slate-300 text-base">No products match your criteria</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Try searching with a different term, clearing the category filter, or scanning a valid product barcode.
            </p>
            {(searchQuery || selectedCategory !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="mt-4 px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-sky-400 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                inCartQty={cartQtyMap[product._id] || 0}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
