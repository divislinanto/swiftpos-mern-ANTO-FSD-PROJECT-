import React, { useState } from 'react';
import {
  X,
  Package,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  PlusCircle,
  Barcode,
  Save,
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { sound } from '../utils/sound';

export const InventoryModal = ({
  isOpen,
  onClose,
  products,
  onRestock,
  onAddProduct,
  isLoading,
}) => {
  if (!isOpen) return null;

  const [searchTerm, setSearchTerm] = useState('');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // New product form state
  const [newProduct, setNewProduct] = useState({
    name: '',
    barcode: '',
    sku: '',
    category: 'Groceries',
    price: '',
    costPrice: '',
    stock: '',
    minStockAlert: 5,
    image: '📦',
    unit: 'pcs',
  });

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode.includes(searchTerm) ||
      (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesLowStock = !filterLowStockOnly || p.stock <= p.minStockAlert;
    return matchesSearch && matchesLowStock;
  });

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.barcode || !newProduct.price) {
      alert('Please fill in product name, barcode and retail price.');
      return;
    }

    await onAddProduct({
      ...newProduct,
      price: parseFloat(newProduct.price),
      costPrice: parseFloat(newProduct.costPrice) || 0,
      stock: parseInt(newProduct.stock) || 0,
      minStockAlert: parseInt(newProduct.minStockAlert) || 5,
    });

    sound.playSuccess();
    setIsAddingNew(false);
    setNewProduct({
      name: '',
      barcode: '',
      sku: '',
      category: 'Groceries',
      price: '',
      costPrice: '',
      stock: '',
      minStockAlert: 5,
      image: '📦',
      unit: 'pcs',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Live Inventory & Stock Manager</h3>
              <p className="text-xs text-slate-400">
                Connected to MongoDB Compass database: <span className="text-emerald-400 font-mono">pos_db</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddingNew(!isAddingNew)}
              className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-sky-500/20 active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isAddingNew ? 'View List' : 'Add New Product'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* New Product Form (Collapsible) */}
        {isAddingNew ? (
          <form onSubmit={handleCreateProduct} className="p-6 overflow-y-auto space-y-4">
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-sky-400" />
              Register New Retail Product
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Almond Milk (1L)"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">
                  Barcode (Unique) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 8907001"
                  value={newProduct.barcode}
                  onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Category</label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-sky-500"
                >
                  <option value="Groceries">Groceries</option>
                  <option value="Beverages">Beverages</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Bakery">Bakery</option>
                  <option value="Dairy">Dairy</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Personal Care">Personal Care</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">
                  Retail Price ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 4.99"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">
                  Cost Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 2.50"
                  value={newProduct.costPrice}
                  onChange={(e) => setNewProduct({ ...newProduct, costPrice: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">
                  Initial Stock Count
                </label>
                <input
                  type="number"
                  placeholder="e.g. 20"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">
                  Display Emoji / Icon
                </label>
                <input
                  type="text"
                  placeholder="e.g. 🥛"
                  value={newProduct.image}
                  onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Unit</label>
                <input
                  type="text"
                  placeholder="e.g. bottle, pack, pcs"
                  value={newProduct.unit}
                  onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-xs text-white font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
              >
                <Save className="w-4 h-4" />
                <span>Save to MongoDB</span>
              </button>
            </div>
          </form>
        ) : (
          /* Inventory Table View */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Filter Bar */}
            <div className="p-3 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter inventory by name or barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all ${
                    filterLowStockOnly
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Low Stock Only</span>
                </button>
              </div>
            </div>

            {/* Scrollable Table */}
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 sticky top-0 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4">Item</th>
                    <th className="py-2.5 px-3">Barcode</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-right">Price</th>
                    <th className="py-2.5 px-4 text-center">Live Stock</th>
                    <th className="py-2.5 px-4 text-right">Quick Restock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredProducts.map((p) => {
                    const isLow = p.stock <= p.minStockAlert;
                    return (
                      <tr key={p._id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-4 font-sans flex items-center gap-2">
                          <span className="text-base">{p.image || '🏷️'}</span>
                          <span className="font-semibold text-white">{p.name}</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 font-mono">{p.barcode}</td>
                        <td className="py-2.5 px-3 font-sans">
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300">
                            {p.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">
                          {formatCurrency(p.price)}
                        </td>
                        <td className="py-2.5 px-4 text-center font-bold">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs inline-block ${
                              p.stock === 0
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : isLow
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}
                          >
                            {p.stock} {p.unit || 'pcs'}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 font-sans">
                            <button
                              onClick={() => {
                                onRestock(p._id, 5);
                                sound.playSuccess();
                              }}
                              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 text-[11px] font-bold border border-slate-700 transition-colors"
                            >
                              +5
                            </button>
                            <button
                              onClick={() => {
                                onRestock(p._id, 10);
                                sound.playSuccess();
                              }}
                              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 text-[11px] font-bold border border-slate-700 transition-colors"
                            >
                              +10
                            </button>
                            <button
                              onClick={() => {
                                onRestock(p._id, 25);
                                sound.playSuccess();
                              }}
                              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 text-[11px] font-bold border border-slate-700 transition-colors"
                            >
                              +25
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
