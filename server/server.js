const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// API Routes
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// Health & System Info Route
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  const mongoStates = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];
  const stateIndex = mongoose.connection.readyState;

  res.json({
    status: 'online',
    system: 'SwiftPOS Retail Engine',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())} seconds`,
    mongoState: mongoStates[stateIndex] || 'Unknown',
    mongoHost: mongoose.connection.host || '127.0.0.1',
    mongoDbName: mongoose.connection.name || 'pos_db',
    mongoCompassUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pos_db',
  });
});

// Serve Frontend Static Files in Production (Single Localhost Link mode)
const clientBuildPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientBuildPath));

app.get('*', (req, res) => {
  // If request is not an API call, serve the index.html from React build
  if (!req.path.startsWith('/api')) {
    const indexPath = path.join(clientBuildPath, 'index.html');
    res.sendFile(indexPath, (err) => {
      if (err) {
        res.status(200).send(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>SwiftPOS Retail Server</title>
              <style>
                body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; padding: 40px; text-align: center; }
                .card { max-width: 600px; margin: 40px auto; background: #1e293b; padding: 30px; border-radius: 16px; border: 1px solid #334155; }
                h1 { color: #38bdf8; margin-bottom: 8px; }
                p { color: #94a3b8; line-height: 1.6; }
                code { background: #0f172a; padding: 4px 8px; border-radius: 6px; color: #34d399; }
                a { color: #38bdf8; text-decoration: none; font-weight: bold; }
              </style>
            </head>
            <body>
              <div class="card">
                <h1>⚡ SwiftPOS API Server is Running!</h1>
                <p>The Express backend is live on port <code>${PORT}</code>.</p>
                <p>To view the React POS interface here, build the client using: <br/><code>npm run build</code></p>
                <p>Or in development mode, run: <br/><code>npm run dev</code></p>
                <hr style="border-color: #334155; margin: 20px 0;" />
                <p>Check API health at: <a href="/api/health">/api/health</a></p>
                <p>MongoDB Compass URI: <code>${process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pos_db'}</code></p>
              </div>
            </body>
          </html>
        `);
      }
    });
  } else {
    res.status(404).json({ success: false, message: 'API Route Not Found' });
  }
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

app.listen(PORT, () => {
  console.log('\n=============================================================');
  console.log('🚀 SwiftPOS Retail Checkout Engine Started Successfully!');
  console.log(`🌐 SINGLE LOCALHOST LINK: \x1b[32m\x1b[1mhttp://localhost:${PORT}\x1b[0m`);
  console.log(`🧭 MongoDB Compass URI:   \x1b[36m${process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pos_db'}\x1b[0m`);
  console.log(`📡 API Health Endpoint:   http://localhost:${PORT}/api/health`);
  console.log('=============================================================\n');
});
