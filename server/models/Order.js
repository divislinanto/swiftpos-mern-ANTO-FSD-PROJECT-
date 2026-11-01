const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: false,
    },
    name: {
      type: String,
      required: true,
    },
    barcode: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    discount: {
      type: Number,
      default: 0,
    },
    subtotal: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    cashierName: {
      type: String,
      default: 'Cashier Staff',
    },
    customerName: {
      type: String,
      default: 'Walk-in Customer',
    },
    customerPhone: {
      type: String,
      default: '',
    },
    items: [orderItemSchema],
    itemCount: {
      type: Number,
      default: 0,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    taxRate: {
      type: Number,
      default: 0.08,
    },
    taxAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['CASH', 'CARD', 'UPI', 'SPLIT'],
      default: 'CASH',
    },
    paymentDetails: {
      cashTendered: { type: Number, default: 0 },
      changeDue: { type: Number, default: 0 },
      cardLast4: { type: String, default: '' },
      transactionRef: { type: String, default: '' },
      notes: { type: String, default: '' },
    },
    status: {
      type: String,
      enum: ['COMPLETED', 'REFUNDED', 'HELD'],
      default: 'COMPLETED',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Order', orderSchema);
