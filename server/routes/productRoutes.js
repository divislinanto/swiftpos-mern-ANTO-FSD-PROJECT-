const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET /api/products - Get all products with optional filters
router.get('/', async (req, res) => {
  try {
    const { category, search, barcode, lowStock } = req.query;
    let query = { isActive: true };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (barcode) {
      query.barcode = barcode;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    let products = await Product.find(query).sort({ category: 1, name: 1 });

    if (lowStock === 'true') {
      products = products.filter((p) => p.stock <= p.minStockAlert);
    }

    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/products/categories - Distinct categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category', { isActive: true });
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/products/barcode/:barcode - Fast barcode scan lookup
router.get('/barcode/:barcode', async (req, res) => {
  try {
    const product = await Product.findOne({
      barcode: req.params.barcode.trim(),
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with barcode "${req.params.barcode}" not found in inventory`,
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/products/:id - Single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/products - Create new product
router.post('/', async (req, res) => {
  try {
    const existing = await Product.findOne({ barcode: req.body.barcode });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `A product with barcode "${req.body.barcode}" already exists (${existing.name})`,
      });
    }

    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT /api/products/:id - Update product
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PATCH /api/products/:id/stock - Live restock / count adjustment
router.patch('/:id/stock', async (req, res) => {
  try {
    const { delta, exactStock } = req.body;
    let update;

    if (typeof exactStock === 'number') {
      update = { $set: { stock: Math.max(0, exactStock) } };
    } else if (typeof delta === 'number') {
      update = { $inc: { stock: delta } };
    } else {
      return res.status(400).json({
        success: false,
        message: 'Provide either delta (+/- number) or exactStock (number)',
      });
    }

    const product = await Product.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE /api/products/:id - Soft delete
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, message: 'Product removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
