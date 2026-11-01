import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { ProductGrid } from './components/ProductGrid';
import { Cart } from './components/Cart';
import { PaymentModal } from './components/PaymentModal';
import { ReceiptModal } from './components/ReceiptModal';
import { InventoryModal } from './components/InventoryModal';
import { AnalyticsModal } from './components/AnalyticsModal';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { HeldCartsModal } from './components/HeldCartsModal';
import { api } from './services/api';
import { sound } from './utils/sound';

export const App = () => {
  // Products & Inventory State
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Cart & Customer State
  const [cartItems, setCartItems] = useState([]);
  const [customer, setCustomer] = useState({ name: 'Walk-in Customer', phone: '' });
  const [discountPercent, setDiscountPercent] = useState(0);
  const [heldCarts, setHeldCarts] = useState(() => {
    try {
      const saved = localStorage.getItem('swiftpos_held_carts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modal States
  const [activeModal, setActiveModal] = useState(null); // 'payment' | 'receipt' | 'inventory' | 'analytics' | 'history' | 'held'
  const [currentReceiptOrder, setCurrentReceiptOrder] = useState(null);
  const [checkoutTotals, setCheckoutTotals] = useState({
    subtotal: 0,
    taxAmount: 0,
    discountAmount: 0,
    grandTotal: 0,
  });

  // Analytics & History
  const [analytics, setAnalytics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [mongoConnected, setMongoConnected] = useState(true);

  // Toast notifications
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // 1. Fetch initial data from Express API
  const fetchProducts = useCallback(async () => {
    setIsLoadingProducts(true);
    try {
      const res = await api.getProducts();
      if (res.success) {
        setProducts(res.data);
      }
    } catch (err) {
      console.warn('API fetch warning:', err);
      showToast('Connecting to MongoDB Server...', 'warning');
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await api.getAnalytics();
      if (res.success) {
        setAnalytics(res.data);
      }
    } catch (err) {}
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await api.getOrders({ limit: 40 });
      if (res.success) {
        setOrders(res.data);
      }
    } catch (err) {}
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchAnalytics();
    fetchOrders();

    // Health check
    api.getHealth()
      .then((h) => setMongoConnected(h.mongoState === 'Connected'))
      .catch(() => setMongoConnected(false));
  }, [fetchProducts, fetchAnalytics, fetchOrders]);

  // Persist held carts to localStorage
  useEffect(() => {
    localStorage.setItem('swiftpos_held_carts', JSON.stringify(heldCarts));
  }, [heldCarts]);

  // 2. Add product to cart handler
  const handleAddToCart = (product) => {
    setCartItems((prevItems) => {
      const existing = prevItems.find((i) => i._id === product._id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          sound.playError();
          showToast(`Max stock reached for ${product.name}`, 'warning');
          return prevItems;
        }
        sound.playBeep();
        return prevItems.map((i) =>
          i._id === product._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        if (product.stock <= 0) {
          sound.playError();
          showToast(`${product.name} is out of stock`, 'error');
          return prevItems;
        }
        sound.playBeep();
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  };

  // 3. Update quantity in cart
  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    const product = products.find((p) => p._id === productId);
    if (product && newQuantity > product.stock) {
      sound.playError();
      showToast(`Cannot exceed available stock (${product.stock})`, 'warning');
      return;
    }

    sound.playBeep();
    setCartItems((prev) =>
      prev.map((i) => (i._id === productId ? { ...i, quantity: newQuantity } : i))
    );
  };

  // 4. Remove item from cart
  const handleRemoveItem = (productId) => {
    setCartItems((prev) => prev.filter((i) => i._id !== productId));
  };

  // 5. Clear Cart
  const handleClearCart = () => {
    if (cartItems.length === 0) return;
    setCartItems([]);
    setDiscountPercent(0);
    setCustomer({ name: 'Walk-in Customer', phone: '' });
    showToast('Cart cleared', 'info');
  };

  // 6. Hold current cart
  const handleHoldCart = () => {
    if (cartItems.length === 0) return;

    const newHeld = {
      id: 'HOLD-' + Date.now(),
      timestamp: new Date().toISOString(),
      customer,
      items: cartItems,
      discountPercent,
    };

    setHeldCarts((prev) => [newHeld, ...prev]);
    setCartItems([]);
    setDiscountPercent(0);
    setCustomer({ name: 'Walk-in Customer', phone: '' });

    sound.playSuccess();
    showToast('Current cart placed on hold (Recall via Hold Cart button)', 'info');
  };

  // 7. Restore a held cart
  const handleRestoreCart = (heldCart) => {
    setCartItems(heldCart.items);
    setCustomer(heldCart.customer);
    setDiscountPercent(heldCart.discountPercent || 0);
    setHeldCarts((prev) => prev.filter((c) => c.id !== heldCart.id));
    setActiveModal(null);

    sound.playSuccess();
    showToast('Held cart restored to register!', 'success');
  };

  const handleDeleteHeldCart = (heldCartId) => {
    setHeldCarts((prev) => prev.filter((c) => c.id !== heldCartId));
  };

  // 8. Barcode Scanner submission handler
  const handleScanBarcode = async (barcode) => {
    // 1st: check if already in loaded products
    const foundProduct = products.find(
      (p) => p.barcode.toLowerCase() === barcode.toLowerCase()
    );

    if (foundProduct) {
      handleAddToCart(foundProduct);
      showToast(`Scanned: ${foundProduct.name}`, 'success');
      return;
    }

    // 2nd: query live backend API for barcode
    try {
      const res = await api.getProductByBarcode(barcode);
      if (res.success && res.data) {
        handleAddToCart(res.data);
        showToast(`Scanned: ${res.data.name}`, 'success');
      }
    } catch (err) {
      sound.playError();
      showToast(`No item found for barcode: "${barcode}"`, 'error');
    }
  };

  // 9. Open checkout payment modal
  const handleOpenCheckout = (totals) => {
    setCheckoutTotals(totals);
    setActiveModal('payment');
  };

  // 10. Complete Sale Transaction & Live Inventory Sync
  const handleCompleteSale = async (paymentDetails) => {
    setIsProcessingPayment(true);

    try {
      const orderPayload = {
        cashierName: 'Cashier Staff #01',
        customerName: customer.name || 'Walk-in Customer',
        customerPhone: customer.phone || '',
        items: cartItems.map((item) => ({
          product: item._id,
          name: item.name,
          barcode: item.barcode,
          price: item.price,
          quantity: item.quantity,
          discount: item.discount || 0,
          subtotal: item.price * item.quantity,
        })),
        subtotal: checkoutTotals.subtotal,
        taxRate: 0.08,
        taxAmount: checkoutTotals.taxAmount,
        discountAmount: checkoutTotals.discountAmount,
        totalAmount: checkoutTotals.grandTotal,
        paymentMethod: paymentDetails.method,
        paymentDetails,
      };

      const res = await api.createOrder(orderPayload);

      if (res.success) {
        // Live inventory update in local state
        if (res.inventoryUpdates && Array.isArray(res.inventoryUpdates)) {
          setProducts((prev) =>
            prev.map((p) => {
              const match = res.inventoryUpdates.find((u) => u._id === p._id);
              return match ? { ...p, stock: match.newStock } : p;
            })
          );
        } else {
          fetchProducts();
        }

        // Save receipt and switch to receipt modal
        setCurrentReceiptOrder(res.data);
        setActiveModal('receipt');

        // Reset cart
        setCartItems([]);
        setDiscountPercent(0);
        setCustomer({ name: 'Walk-in Customer', phone: '' });

        // Refresh stats
        fetchAnalytics();
        fetchOrders();

        showToast(`Sale completed! Receipt: ${res.data.orderNumber}`, 'success');
      }
    } catch (err) {
      sound.playError();
      showToast(err.message || 'Transaction failed. Check stock availability.', 'error');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // 11. Restock Product live
  const handleRestockProduct = async (productId, delta) => {
    try {
      const res = await api.updateStock(productId, { delta });
      if (res.success) {
        setProducts((prev) =>
          prev.map((p) => (p._id === productId ? res.data : p))
        );
        fetchAnalytics();
        showToast(`Stock updated for ${res.data.name} (+${delta})`, 'success');
      }
    } catch (err) {
      showToast('Error updating stock', 'error');
    }
  };

  // 12. Add New Product
  const handleAddNewProduct = async (productData) => {
    try {
      const res = await api.addProduct(productData);
      if (res.success) {
        setProducts((prev) => [res.data, ...prev]);
        fetchAnalytics();
        showToast(`Product "${res.data.name}" added to inventory`, 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to add product', 'error');
    }
  };

  // 13. Refund Order
  const handleRefundOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to refund this order and return items to stock?')) {
      return;
    }

    try {
      const res = await api.refundOrder(orderId);
      if (res.success) {
        sound.playSuccess();
        fetchOrders();
        fetchProducts();
        fetchAnalytics();
        showToast(res.message, 'success');
      }
    } catch (err) {
      sound.playError();
      showToast(err.message || 'Failed to refund order', 'error');
    }
  };

  // Global Keyboard Shortcuts (Escape to close modal, F4 for Held Carts)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveModal(null);
      }
      if (e.key === 'F4') {
        e.preventDefault();
        setActiveModal((prev) => (prev === 'held' ? null : 'held'));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Top Navigation */}
      <Navbar
        onOpenInventory={() => setActiveModal('inventory')}
        onOpenAnalytics={() => setActiveModal('analytics')}
        onOpenHistory={() => setActiveModal('history')}
        onOpenHeldCarts={() => setActiveModal('held')}
        heldCartsCount={heldCarts.length}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(sound.toggleMute())}
        mongoConnected={mongoConnected}
        shiftStats={{
          revenue: analytics?.todayRevenue || 0,
          transactions: analytics?.todayTransactions || 0,
        }}
      />

      {/* Main Retail POS Workspace: Center Product Grid + Right Checkout Cart */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Product Grid Area */}
        <ProductGrid
          products={products}
          onAddToCart={handleAddToCart}
          cartItems={cartItems}
          onScanBarcode={handleScanBarcode}
          isLoading={isLoadingProducts}
          onRefresh={fetchProducts}
        />

        {/* Right Cart Sidebar */}
        <Cart
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
          onHoldCart={handleHoldCart}
          onCheckout={handleOpenCheckout}
          discountPercent={discountPercent}
          onSetDiscountPercent={setDiscountPercent}
          customer={customer}
          onUpdateCustomer={setCustomer}
          taxRate={0.08}
        />
      </main>

      {/* Toast Notification Alert */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl shadow-2xl border text-xs font-semibold flex items-center gap-2 animate-bounce ${
            toast.type === 'error'
              ? 'bg-rose-950/95 text-rose-200 border-rose-500'
              : toast.type === 'warning'
              ? 'bg-amber-950/95 text-amber-200 border-amber-500'
              : toast.type === 'success'
              ? 'bg-emerald-950/95 text-emerald-200 border-emerald-500'
              : 'bg-slate-900/95 text-sky-200 border-sky-500'
          }`}
        >
          <span>{toast.message}</span>
        </div>
      )}

      {/* Modals */}
      <PaymentModal
        isOpen={activeModal === 'payment'}
        onClose={() => setActiveModal(null)}
        totals={checkoutTotals}
        cartItems={cartItems}
        customer={customer}
        onCompleteSale={handleCompleteSale}
        isProcessing={isProcessingPayment}
      />

      <ReceiptModal
        isOpen={activeModal === 'receipt'}
        onClose={() => setActiveModal(null)}
        order={currentReceiptOrder}
      />

      <InventoryModal
        isOpen={activeModal === 'inventory'}
        onClose={() => setActiveModal(null)}
        products={products}
        onRestock={handleRestockProduct}
        onAddProduct={handleAddNewProduct}
        isLoading={isLoadingProducts}
      />

      <AnalyticsModal
        isOpen={activeModal === 'analytics'}
        onClose={() => setActiveModal(null)}
        analytics={analytics}
      />

      <OrderHistoryModal
        isOpen={activeModal === 'history'}
        onClose={() => setActiveModal(null)}
        orders={orders}
        onViewReceipt={(order) => {
          setCurrentReceiptOrder(order);
          setActiveModal('receipt');
        }}
        onRefundOrder={handleRefundOrder}
      />

      <HeldCartsModal
        isOpen={activeModal === 'held'}
        onClose={() => setActiveModal(null)}
        heldCarts={heldCarts}
        onRestoreCart={handleRestoreCart}
        onDeleteHeldCart={handleDeleteHeldCart}
      />
    </div>
  );
};

export default App;
