const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    barcode: {
      type: String,
      required: [true, 'Barcode is required'],
      unique: true,
      trim: true,
      index: true,
    },
    sku: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      default: 'General',
      index: true,
    },
    price: {
      type: Number,
      required: [true, 'Retail price is required'],
      min: [0, 'Price must be positive'],
    },
    costPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    minStockAlert: {
      type: Number,
      default: 5,
    },
    image: {
      type: String,
      default: '',
    },
    color: {
      type: String,
      default: '#3b82f6',
    },
    unit: {
      type: String,
      default: 'pcs',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for low stock detection
productSchema.virtual('isLowStock').get(function () {
  return this.stock <= this.minStockAlert;
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
