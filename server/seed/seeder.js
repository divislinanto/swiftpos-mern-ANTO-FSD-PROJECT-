const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Product = require('../models/Product');
const Order = require('../models/Order');
const seedProducts = require('./seedData');

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pos_db';

const seedDatabase = async () => {
  try {
    console.log(`Connecting to MongoDB at: ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 6000,
    });
    console.log('✔ Connected to MongoDB!');

    console.log('Clearing existing product & sample order data...');
    await Product.deleteMany({});
    await Order.deleteMany({});

    console.log(`Inserting ${seedProducts.length} retail products with barcodes & stock...`);
    const inserted = await Product.insertMany(seedProducts);
    console.log(`✔ Successfully inserted ${inserted.length} products!`);

    // Add a couple of realistic demo orders so the analytics and transaction history have immediate rich data
    const sampleOrders = [
      {
        orderNumber: 'POS-890123-1001',
        cashierName: 'Cashier Staff',
        customerName: 'Sarah Jenkins',
        customerPhone: '+1-555-0192',
        items: [
          {
            product: inserted[0]._id,
            name: inserted[0].name,
            barcode: inserted[0].barcode,
            price: inserted[0].price,
            quantity: 2,
            discount: 0,
            subtotal: inserted[0].price * 2,
          },
          {
            product: inserted[9]._id,
            name: inserted[9].name,
            barcode: inserted[9].barcode,
            price: inserted[9].price,
            quantity: 2,
            discount: 0,
            subtotal: inserted[9].price * 2,
          },
        ],
        itemCount: 4,
        subtotal: 14.50,
        taxRate: 0.08,
        taxAmount: 1.16,
        discountAmount: 0,
        totalAmount: 15.66,
        paymentMethod: 'CARD',
        paymentDetails: {
          cardLast4: '4242',
          transactionRef: 'AUTH-TX-9901',
        },
        status: 'COMPLETED',
      },
      {
        orderNumber: 'POS-890124-1002',
        cashierName: 'Cashier Staff',
        customerName: 'Alex Rivera',
        customerPhone: '+1-555-0481',
        items: [
          {
            product: inserted[17]._id,
            name: inserted[17].name,
            barcode: inserted[17].barcode,
            price: inserted[17].price,
            quantity: 1,
            discount: 0,
            subtotal: inserted[17].price,
          },
        ],
        itemCount: 1,
        subtotal: 12.99,
        taxRate: 0.08,
        taxAmount: 1.04,
        discountAmount: 0,
        totalAmount: 14.03,
        paymentMethod: 'CASH',
        paymentDetails: {
          cashTendered: 20.00,
          changeDue: 5.97,
        },
        status: 'COMPLETED',
      },
    ];

    await Order.insertMany(sampleOrders);
    console.log('✔ Successfully created demo order transactions!');

    console.log('\n======================================================');
    console.log('🎉 SEEDING COMPLETE!');
    console.log('  Database: pos_db');
    console.log(`  Compass Link: ${MONGO_URI}`);
    console.log('  View in MongoDB Compass:');
    console.log('    1. Open MongoDB Compass');
    console.log(`    2. Paste connection string: ${MONGO_URI}`);
    console.log('    3. Click "Connect" -> Find "pos_db"');
    console.log('    4. Explore "products" and "orders" collections');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('✖ Error seeding database:', error.message);
    console.log('Tip: Ensure MongoDB is running on port 27017 or check MONGO_URI.');
    process.exit(1);
  }
};

seedDatabase();
