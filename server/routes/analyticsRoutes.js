const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');

// GET /api/analytics/dashboard - Register summary & stats
router.get('/dashboard', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Order stats (today and total)
    const completedOrders = await Order.find({ status: 'COMPLETED' });
    const todayOrders = completedOrders.filter((o) => new Date(o.createdAt) >= today);

    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalTransactions = completedOrders.length;
    const todayTransactions = todayOrders.length;
    const avgOrderValue = todayTransactions > 0 ? todayRevenue / todayTransactions : 0;

    // Payment breakdown
    const paymentBreakdown = {
      CASH: todayOrders.filter((o) => o.paymentMethod === 'CASH').reduce((sum, o) => sum + o.totalAmount, 0),
      CARD: todayOrders.filter((o) => o.paymentMethod === 'CARD').reduce((sum, o) => sum + o.totalAmount, 0),
      UPI: todayOrders.filter((o) => o.paymentMethod === 'UPI').reduce((sum, o) => sum + o.totalAmount, 0),
      SPLIT: todayOrders.filter((o) => o.paymentMethod === 'SPLIT').reduce((sum, o) => sum + o.totalAmount, 0),
    };

    // 2. Inventory stats
    const allProducts = await Product.find({ isActive: true });
    const totalProducts = allProducts.length;
    const totalStockUnits = allProducts.reduce((sum, p) => sum + p.stock, 0);
    const lowStockProducts = allProducts.filter((p) => p.stock <= p.minStockAlert);
    const outOfStockProducts = allProducts.filter((p) => p.stock === 0);

    const inventoryValue = allProducts.reduce((sum, p) => sum + p.price * p.stock, 0);
    const inventoryCost = allProducts.reduce((sum, p) => sum + (p.costPrice || p.price * 0.6) * p.stock, 0);

    // 3. Top selling items
    const productSalesMap = {};
    for (const order of completedOrders) {
      for (const item of order.items) {
        const key = item.barcode || item.name;
        if (!productSalesMap[key]) {
          productSalesMap[key] = {
            name: item.name,
            barcode: item.barcode,
            quantity: 0,
            revenue: 0,
          };
        }
        productSalesMap[key].quantity += item.quantity;
        productSalesMap[key].revenue += item.subtotal;
      }
    }

    const topSellingProducts = Object.values(productSalesMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        todayRevenue: Number(todayRevenue.toFixed(2)),
        totalRevenue: Number(totalRevenue.toFixed(2)),
        todayTransactions,
        totalTransactions,
        avgOrderValue: Number(avgOrderValue.toFixed(2)),
        paymentBreakdown,
        totalProducts,
        totalStockUnits,
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts.length,
        lowStockList: lowStockProducts.slice(0, 8),
        inventoryValue: Number(inventoryValue.toFixed(2)),
        inventoryCost: Number(inventoryCost.toFixed(2)),
        potentialProfit: Number((inventoryValue - inventoryCost).toFixed(2)),
        topSellingProducts,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
