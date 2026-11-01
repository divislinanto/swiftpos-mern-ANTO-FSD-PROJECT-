const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');

// Helper to generate unique order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `POS-${timestamp}-${random}`;
};

// POST /api/orders - Process checkout transaction with live inventory deduction
router.post('/', async (req, res) => {
  try {
    const {
      items,
      cashierName = 'Cashier Staff',
      customerName = 'Walk-in Customer',
      customerPhone = '',
      subtotal,
      taxRate = 0.08,
      taxAmount,
      discountAmount = 0,
      totalAmount,
      paymentMethod = 'CASH',
      paymentDetails = {},
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot process empty checkout cart',
      });
    }

    // 1. Verify stock availability for all items first
    for (const item of items) {
      if (item.product) {
        const product = await Product.findById(item.product);
        if (!product) {
          return res.status(404).json({
            success: false,
            message: `Product "${item.name}" no longer exists in inventory`,
          });
        }
        if (product.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for "${item.name}". Only ${product.stock} available.`,
          });
        }
      }
    }

    // 2. Decrement stock counts live in MongoDB
    const updatedProducts = [];
    for (const item of items) {
      if (item.product) {
        const updated = await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: -item.quantity } },
          { new: true }
        );
        if (updated) {
          updatedProducts.push({
            _id: updated._id,
            barcode: updated.barcode,
            name: updated.name,
            newStock: updated.stock,
            isLowStock: updated.stock <= updated.minStockAlert,
          });
        }
      }
    }

    // 3. Create and save order
    const orderNumber = generateOrderNumber();
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    const order = await Order.create({
      orderNumber,
      cashierName,
      customerName,
      customerPhone,
      items,
      itemCount,
      subtotal,
      taxRate,
      taxAmount,
      discountAmount,
      totalAmount,
      paymentMethod,
      paymentDetails,
      status: 'COMPLETED',
    });

    res.status(201).json({
      success: true,
      message: 'Transaction completed successfully',
      data: order,
      inventoryUpdates: updatedProducts,
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error processing checkout transaction',
    });
  }
});

// GET /api/orders - Get recent orders
router.get('/', async (req, res) => {
  try {
    const { limit = 30, status, search } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
      ];
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/orders/:id - Get single order (by id or orderNumber)
router.get('/:id', async (req, res) => {
  try {
    let order;
    if (req.params.id.startsWith('POS-')) {
      order = await Order.findOne({ orderNumber: req.params.id });
    } else {
      order = await Order.findById(req.params.id);
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/orders/:id/refund - Process refund & restock inventory
router.post('/:id/refund', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status === 'REFUNDED') {
      return res.status(400).json({ success: false, message: 'Order has already been refunded' });
    }

    // Restock items back to inventory
    for (const item of order.items) {
      if (item.product) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }
    }

    order.status = 'REFUNDED';
    await order.save();

    res.json({
      success: true,
      message: `Order ${order.orderNumber} refunded and items returned to stock`,
      data: order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
