# ⚡ SwiftPOS - High-Performance Retail Point of Sale System

> **A fast-paced checkout web application for retail cashiers to scan products, process payments, and sync inventory counts live.**  
> Built strictly using the **MERN stack** (MongoDB, Express, React, Node.js) with instant **MongoDB Compass** integration and a **single localhost link** experience.

---

## 🌟 Key Features & Highlights

- **⚡ Blazing Fast Checkout Workflow:**
  - Designed for real-world retail speed — add items in milliseconds via barcode gun, keyboard shortcuts, or quick-tap category cards.
  - Keyboard shortcuts: `F2` or `/` to focus barcode scanner, `F4` to view held carts, `Esc` to close modals.
- **🏷️ Instant Barcode Scanning:**
  - Compatible with physical USB / Bluetooth barcode scanners (sends barcode + `Enter`).
  - Virtual barcode scan simulator with 1-click test buttons for rapid demonstration.
- **📦 Live Inventory Synchronization:**
  - Real-time stock counts decrement atomically on checkout directly in MongoDB.
  - Low-stock warning badges (`≤ 5 items`) and automatic "Sold Out" protection.
  - In-app Inventory Manager with 1-click restock (`+5`, `+10`, `+25`) and new product registration.
- **💳 Multi-Method Payment Terminal:**
  - **Cash Tender:** Large touch-screen virtual Numpad, quick bill presets ($10, $20, $50, $100, Exact), and live change calculator.
  - **Credit/Debit Card:** EMV chip card visualizer with approval simulation.
  - **Digital / UPI QR:** Dynamic QR code display for mobile payment.
  - **Split Pay:** Custom division between cash and card.
- **🧾 Authentic Thermal Receipt Printing:**
  - Styled as an 80mm standard retail thermal paper receipt with jagged edges, simulated barcode, tax breakdown, and cashier info.
  - 1-click `@media print` optimized output for real thermal receipt printers.
- **⏸️ Hold & Resume Carts:**
  - Put transactions on hold when a customer steps aside and recall them instantly with zero lost data.
- **📊 Daily Register Analytics:**
  - Live shift revenue, total transactions, average ticket size, tender breakdown charts, and top-selling products leaderboard.
- **🔊 Web Audio API Sound Effects:**
  - Realistic barcode scanner chirps, cash drawer clicks, and success chimes synthesized in browser with zero external audio files.

---

## 🏗️ Strictly MERN Stack Architecture

| Layer | Technology | Role |
|---|---|---|
| **M** | **MongoDB** + Mongoose | Live inventory storage, product indexing, order ledger, MongoDB Compass sync |
| **E** | **Express.js** | RESTful API endpoints for catalog, checkout transactions, inventory, and analytics |
| **R** | **React 18** + Vite + Tailwind CSS | Ultra-responsive POS cashier UI with Lucide icons, glassmorphism, and print styles |
| **N** | **Node.js** | Unified server runtime serving both API and compiled React frontend on a **single port** |

---

## 🧭 Linking with MongoDB Compass

SwiftPOS is designed to connect seamlessly to **MongoDB Compass**:

1. **Launch MongoDB Compass** on your computer.
2. In the "New Connection" screen, enter the connection URI:
   ```text
   mongodb://127.0.0.1:27017/pos_db
   ```
3. Click **Connect**.
4. You will see the database named **`pos_db`** with two collections:
   - **`products`**: Contains retail inventory, prices, barcodes, categories, and live stock counts.
   - **`orders`**: Contains all completed sales receipts, item breakdowns, payment methods, and timestamps.
5. As cashiers ring up sales in the web app, click the **Refresh** button in MongoDB Compass to watch stock counts decrease and new order documents appear live!

---

## 🚀 Running in VS Code (Single Localhost Link)

SwiftPOS serves both the backend API and the compiled React frontend from a single Express server on **Port 5000**. You only need to open one link in your browser!

### Step 1: Open VS Code Terminal
Open the project directory in VS Code, then open the terminal (`Ctrl + ~` or ``Ctrl + ` ``).

### Step 2: Install Dependencies (First time only)
```bash
npm run install-all
```

### Step 3: Seed Products to MongoDB pos_db
```bash
npm run seed
```
*(This seeds 22+ retail products across Beverages, Snacks, Groceries, Bakery, Electronics, and Personal Care)*

### Step 4: Build Frontend & Start Single Localhost Server
```bash
npm run build
npm start
```

### 🌐 Access Your Single Localhost Link:
👉 **[http://localhost:5000](http://localhost:5000)**

---

## 💡 Quick 1-Click Launchers (Alternative)

For maximum convenience, you can also launch the entire system with one command:

### On Windows PowerShell:
```powershell
.\scripts\run-pos.ps1
```

### On Windows Command Prompt / Double-Click:
```cmd
.\scripts\run-pos.bat
```
*This automatically checks MongoDB, builds the client, seeds data if needed, launches your browser to `http://localhost:5000`, and starts the server!*

---

## 💻 Development Mode (With Hot Reloading)

If you wish to make code changes with Vite hot reloading:
```bash
npm run dev
```
- Frontend dev server: `http://localhost:3000` (proxies API to port 5000)
- Backend API server: `http://localhost:5000`

---

## 📖 How to Use the POS Application

### 1. Ringing Up Products
- **Barcode Scanner:** Click into the top search bar (or press `F2`), type any barcode (e.g. `8901001` for Cold Brew Coffee or `8902001` for Potato Chips) and press `Enter`.
- **Quick Demo Barcodes:** Click any pill in the "Quick Scan Demo" bar under the search box.
- **Touch / Tap Grid:** Filter by category (e.g., *Beverages*, *Snacks*, *Bakery*) and click any product card.
- **Barcode Gun:** Plug in any standard USB barcode scanner. Scan any product barcode directly.

### 2. Managing the Cart
- Adjust quantities with the `+` and `-` buttons.
- Apply a quick discount: choose `0%`, `5%`, `10%`, or `15%`.
- Assign customer name or loyalty phone number by clicking **Edit** next to "Walk-in Customer".

### 3. Placing Cart on Hold
- If a customer needs to fetch their wallet, click the **Hold** button.
- The cart is saved safely. Ring up other customers.
- When the customer returns, click **Hold Cart** in the top navbar (or press `F4`) and click **Resume**.

### 4. Processing Checkout & Payments
- Click the big green **⚡ PAY NOW** button.
- Choose your tender method:
  - **Cash:** Use the touch Numpad or quick bill buttons ($10, $20, $50, $100). The green badge calculates exact change to return to the customer.
  - **Card:** Enter the last 4 digits and click complete.
  - **UPI / QR:** Scan the digital QR code.
  - **Split:** Specify cash and card amounts.
- Click **Complete Sale & Print**.

### 5. Thermal Receipt Printing
- The thermal receipt pop-up opens with an authentic paper look and simulated barcode.
- Click **Print Receipt** (triggers a clean 80mm thermal receipt printer layout).
- Press `Enter` or click **Next Customer** to start a new sale immediately!

### 6. Live Inventory & Restock
- Click **Inventory** in the top navbar.
- Filter by "Low Stock Only" to see items that need replenishment.
- Click `+5`, `+10`, or `+25` to instantly update stock in MongoDB.
- Click **Add New Product** to introduce new items to the catalog.

### 7. Daily Register Analytics
- Click **Analytics** in the top navbar.
- Inspect gross sales, payment breakdown graphs, average ticket size, and the top-selling items leaderboard.

---

## 📦 Creating the Zip File for VS Code

To package the entire project into a portable `.zip` file for distribution or submission (excluding heavy `node_modules`):

```bash
npm run zip
```
Or run directly:
```powershell
powershell -ExecutionPolicy Bypass -File ./scripts/create-zip.ps1
```
This generates **`swiftpos-mern-project.zip`** in the project root directory, ready to extract and run on any machine!

---

## 🚢 Production Deployment

### Option 1: Docker & Docker Compose (Recommended)
SwiftPOS includes a multi-stage `Dockerfile` and `docker-compose.yml`:
```bash
# Build and start both MongoDB and SwiftPOS
docker-compose up --build -d
```
- Web Application: `http://localhost:5000`
- MongoDB for Compass: `mongodb://localhost:27017/pos_db`

### Option 2: Render.com Cloud Deployment
1. Push this repository to GitHub.
2. In [Render.com](https://render.com), click **New +** -> **Blueprint** and select your repository (`render.yaml` will auto-configure).
3. Set the `MONGO_URI` environment variable to your free MongoDB Atlas connection string:
   ```text
   mongodb+srv://<user>:<password>@cluster0.mongodb.net/pos_db?retryWrites=true&w=majority
   ```
4. Deploy! Render will build the client and host the single-port server live on the web.

---

## 📁 Project Structure

```
Anto FSD project/
├── client/                     # React 18 + Vite + Tailwind CSS Frontend
│   ├── dist/                   # Production compiled assets
│   ├── src/
│   │   ├── components/         # Modular POS UI Components
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProductGrid.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── CartItem.jsx
│   │   │   ├── PaymentModal.jsx
│   │   │   ├── ReceiptModal.jsx
│   │   │   ├── InventoryModal.jsx
│   │   │   ├── AnalyticsModal.jsx
│   │   │   ├── OrderHistoryModal.jsx
│   │   │   └── HeldCartsModal.jsx
│   │   ├── services/
│   │   │   └── api.js          # REST Client for Express API
│   │   ├── utils/
│   │   │   ├── sound.js        # Web Audio API Synthesizer (Zero MP3s)
│   │   │   └── formatters.js   # Currency & Date Formatters
│   │   ├── App.jsx             # Main POS Workspace State & Layout
│   │   ├── index.css           # Thermal Print Styles & Theme
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/                     # Node.js + Express.js Backend
│   ├── config/
│   │   └── db.js               # MongoDB Connection Manager
│   ├── models/
│   │   ├── Product.js          # Mongoose Product & Stock Model
│   │   └── Order.js            # Mongoose Order & Receipt Model
│   ├── routes/
│   │   ├── productRoutes.js    # Catalog, Barcode Lookup, Restock
│   │   ├── orderRoutes.js      # Atomic Checkout & Refunds
│   │   └── analyticsRoutes.js  # Register Metrics & Tender Breakdown
│   ├── seed/
│   │   ├── seedData.js         # 22+ Seed Retail Products
│   │   └── seeder.js           # Database Population Script
│   ├── server.js               # Express Server & Single Localhost Link Router
│   └── package.json
├── scripts/
│   ├── run-pos.bat             # 1-Click Windows Batch Launcher
│   ├── run-pos.ps1             # 1-Click PowerShell Launcher
│   └── create-zip.ps1          # Project Zip Packager
├── Dockerfile                  # Multi-Stage Production Container
├── docker-compose.yml          # Unified MongoDB + App Composition
├── render.yaml                 # Cloud Blueprint Configuration
├── package.json                # Root Runner Scripts
├── .env.example
└── README.md
```

---

## 🛡️ License

MIT License © 2026 Anto FSD Project. Built with ❤️ for fast, intuitive retail checkout experiences.
