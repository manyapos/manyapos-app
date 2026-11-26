# Manya POS

## Tech Stack
- Next.js 15 App Router (TypeScript)
- Tailwind CSS + shadcn/ui
- Prisma + SQLite (dev) / PostgreSQL (prod)
- NextAuth.js (auth)
- Zustand (client state)
- React Hook Form + Zod (form validation)
- Recharts (charts/dashboard)
- date-fns (date formatting)
- Sonner (toast notifications)
- jspdf (PDF export)
- react-to-print (thermal receipt printing)
- html5-qrcode (barcode scanning)
- Lucide React (icons)

## Database Schema (Prisma)

### Models
- **User** — id, name, email, password (hashed), role (ADMIN/CASHIER), pin (4 digit untuk kasir), avatar, createdAt
- **Category** — id, name, slug, description, image
- **Product** — id, name, sku, barcode, categoryId, price, costPrice, stock, minStock, unit (pcs/kg/liter), image, isActive, createdAt
- **Customer** — id, name, phone, email, address, points, totalSpent, createdAt
- **Transaction** — id, invoiceNumber (auto: INV-YYYYMMDD-XXXX), userId, customerId?, items[], subtotal, discount, discountType (percentage/fixed), tax, total, paymentMethod (cash/qris/card/ewallet), amountPaid, change, note, status (completed/voided/refunded), createdAt
- **TransactionItem** — id, transactionId, productId, productName, quantity, price, discount, subtotal
- **Expense** — id, category, description, amount, date, userId, createdAt
- **StockMovement** — id, productId, type (in/out/adjustment), quantity, note, userId, createdAt

### Relations
- Product belongsTo Category
- Transaction belongsTo User (kasir)
- Transaction belongsTo Customer (optional)
- Transaction hasMany TransactionItem
- TransactionItem belongsTo Product
- StockMovement belongsTo Product
- StockMovement belongsTo User

## Auth and Roles

### Roles
- **ADMIN** — full access: dashboard, laporan, kelola produk, kelola user, settings
- **CASHIER** — POS screen, transaksi, lihat stok (no edit), profil sendiri

### Auth Flow
- Login with email + password
- Optional: PIN-based quick login for cashier shift change
- Session-based via NextAuth
- Middleware protects /dashboard/* routes

## Pages and Routes

### Public
- `/login` — Login page

### Protected (requires auth)
- `/` — Redirect to /pos (cashier) or /dashboard (admin)
- `/pos` — POS/kasir screen (main cashier interface)
- `/dashboard` — Admin dashboard (summary cards, charts)
- `/dashboard/products` — Product list (CRUD, search, filter by category)
- `/dashboard/products/new` — Add product form
- `/dashboard/products/[id]` — Edit product
- `/dashboard/categories` — Category management
- `/dashboard/customers` — Customer list
- `/dashboard/customers/[id]` — Customer detail + transaction history
- `/dashboard/transactions` — Transaction history (filter by date, cashier, status)
- `/dashboard/transactions/[id]` — Transaction detail + reprint receipt
- `/dashboard/inventory` — Stock overview, low stock alerts
- `/dashboard/inventory/adjustments` — Stock adjustment form
- `/dashboard/reports` — Sales reports (daily, weekly, monthly, custom range)
- `/dashboard/reports/products` — Product performance report
- `/dashboard/reports/cashiers` — Cashier performance report
- `/dashboard/expenses` — Expense tracking
- `/dashboard/users` — User management (admin only)
- `/dashboard/settings` — Store settings (name, address, receipt template, tax rate)

## POS Features
- Search product by name or scan barcode
- Filter by category tabs
- Click product to add to cart (quantity++)
- Edit quantity, remove item from cart
- Apply discount (percentage or fixed amount)
- Select or add customer
- Payment modal: cash (with change calculation), QRIS, card, e-wallet
- Print receipt after payment
- Hold and recall transaction (park order)
- Void transaction (admin PIN required)

## Dashboard Cards
- Total Penjualan Hari Ini (Rp)
- Jumlah Transaksi Hari Ini
- Rata-rata per Transaksi
- Produk Terjual Hari Ini

## Reports
- Penjualan: grafik harian/mingguan/bulanan, filter date range
- Produk: top selling, low selling, profit margin
- Kasir: penjualan per kasir, jumlah transaksi
- Kategori: penjualan per kategori (pie chart)
- Export ke PDF dan CSV

## Store Settings
- Nama toko, Alamat, Nomor telepon, Logo (upload)
- Pajak (persen atau fixed, on/off)
- Format struk (header, footer text)
- Mata uang (default: IDR)

## Key Implementation Notes
- Use Zustand store for cart state (persist across page navigations)
- Server Actions for all mutations (create transaction, update product, etc.)
- Optimistic updates on cart operations
- Debounced product search
- Barcode scanner via html5-qrcode (camera-based)
- Receipt printing via react-to-print (thermal printer compatible)
- All money values stored as integers (sen) to avoid floating point issues
- Invoice number auto-generated: INV-YYYYMMDD-XXXX (sequential per day)
- Stock auto-decremented on completed transaction
- Stock auto-restored on voided/refunded transaction
- Low stock alert when product.stock <= product.minStock
