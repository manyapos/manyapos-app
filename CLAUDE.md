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

- **User** — id, name, email, password (hashed), role (ADMIN/CASHIER/MANAGER), pin (4 digit untuk kasir), avatar, isActive, createdAt
- **Category** — id, name, slug, description, image
- **Product** — id, name, sku, barcode, categoryId, price, costPrice, stock, minStock, unit (pcs/kg/liter/box/dozen), image, isActive, isFavorite, tags, createdAt
- **ProductVariant** — id, productId, name (e.g. "Size L"), sku, price, stock (untuk produk dengan varian)
- **Customer** — id, name, phone, email, address, points, totalSpent, tier (regular/silver/gold/platinum), birthdate, notes, createdAt
- **Supplier** — id, name, phone, email, address, notes, createdAt
- **PurchaseOrder** — id, supplierId, userId, status (draft/ordered/received/cancelled), total, note, createdAt
- **PurchaseOrderItem** — id, purchaseOrderId, productId, productName, quantity, costPrice, subtotal
- **Transaction** — id, invoiceNumber (auto: INV-YYYYMMDD-XXXX), userId, customerId?, tableNumber?, items[], subtotal, discount, discountType (percentage/fixed), tax, total, paymentMethod (cash/qris/card/ewallet/credit), amountPaid, change, note, status (completed/voided/refunded/pending), shiftId?, createdAt
- **TransactionItem** — id, transactionId, productId, variantId?, productName, quantity, price, discount, subtotal, note
- **Expense** — id, category, description, amount, date, userId, receiptImage?, createdAt
- **StockMovement** — id, productId, type (in/out/adjustment/return/damage), quantity, note, userId, purchaseOrderId?, createdAt
- **Shift** — id, userId, startTime, endTime?, openingBalance, closingBalance?, totalCash, totalQris, totalCard, totalEwallet, totalSales, totalTransactions, note, status (open/closed)
- **Discount** — id, name, type (percentage/fixed/buy-x-get-y), value, minPurchase?, productIds[], categoryIds[], startDate?, endDate?, isActive, usageLimit?, usageCount
- **LoyaltyConfig** — id, pointsPerRupiah, minPointsRedeem, pointValue (1 point = Rp X), tierThresholds (JSON)
- **Table** — id, number, name, capacity, status (available/occupied/reserved), qrCode (untuk self-order)
- **KitchenOrder** — id, transactionId, tableNumber?, items[], status (pending/preparing/ready/served), priority, note, createdAt
- **Notification** — id, type (low_stock/shift_end/new_order/etc), message, isRead, userId?, createdAt

### Relations

- Product belongsTo Category
- Product hasMany ProductVariant
- Product belongsTo Supplier (optional)
- Transaction belongsTo User (kasir)
- Transaction belongsTo Customer (optional)
- Transaction belongsTo Shift (optional)
- Transaction hasMany TransactionItem
- TransactionItem belongsTo Product
- TransactionItem belongsTo ProductVariant (optional)
- StockMovement belongsTo Product
- StockMovement belongsTo User
- StockMovement belongsTo PurchaseOrder (optional)
- PurchaseOrder belongsTo Supplier
- PurchaseOrder belongsTo User
- PurchaseOrder hasMany PurchaseOrderItem
- Shift belongsTo User
- KitchenOrder belongsTo Transaction

## Auth and Roles

### Roles

- **ADMIN** — full access: semua halaman, settings, laporan, user management
- **MANAGER** — dashboard, laporan, produk, inventori, pembelian, shift; tidak bisa kelola user
- **CASHIER** — POS screen, transaksi, lihat stok, profil sendiri, shift milik sendiri

### Auth Flow

- Login with email + password
- Optional: PIN-based quick login for cashier shift change
- Session-based via NextAuth
- Middleware protects /dashboard/* routes
- Role-based access per route

## Pages and Routes

### Public

- `/login` — Login page

### Protected (requires auth)

- `/` — Redirect to /pos (cashier) or /dashboard (admin/manager)
- `/pos` — POS/kasir screen (main cashier interface)
- `/dashboard` — Admin dashboard (summary cards, charts)
- `/dashboard/products` — Product list (CRUD, search, filter by category)
- `/dashboard/products/new` — Add product form
- `/dashboard/products/[id]` — Edit product + varian management
- `/dashboard/categories` — Category management
- `/dashboard/customers` — Customer list + loyalty tier badges
- `/dashboard/customers/[id]` — Customer detail + transaction history + points log
- `/dashboard/transactions` — Transaction history (filter by date, cashier, status, payment method)
- `/dashboard/transactions/[id]` — Transaction detail + reprint receipt + refund action
- `/dashboard/inventory` — Stock overview, low stock alerts, stock value summary
- `/dashboard/inventory/adjustments` — Stock adjustment form
- `/dashboard/inventory/movements` — Riwayat mutasi stok lengkap
- `/dashboard/purchases` — Purchase order list (dari supplier)
- `/dashboard/purchases/new` — Buat PO baru
- `/dashboard/purchases/[id]` — Detail PO + receive items (update stok otomatis)
- `/dashboard/suppliers` — Supplier management (CRUD)
- `/dashboard/reports` — Sales reports (daily, weekly, monthly, custom range)
- `/dashboard/reports/products` — Product performance report (top/low selling, margin)
- `/dashboard/reports/cashiers` — Cashier performance report
- `/dashboard/reports/categories` — Penjualan per kategori
- `/dashboard/reports/profit` — Laporan laba rugi (revenue - COGS - expenses)
- `/dashboard/expenses` — Expense tracking + kategori + upload struk
- `/dashboard/shifts` — Riwayat shift semua kasir
- `/dashboard/shifts/[id]` — Detail shift: rekap per payment method, selisih kas
- `/dashboard/discounts` — Manajemen promo & diskon
- `/dashboard/tables` — Manajemen meja (untuk restoran/kafe)
- `/dashboard/kitchen` — Kitchen display: order masuk, status masak
- `/dashboard/users` — User management (admin only)
- `/dashboard/settings` — Store settings (nama, alamat, struk, pajak, loyalty, integrasi)
- `/dashboard/notifications` — Notifikasi sistem (stok habis, shift, dll)

## POS Features

- Search product by name or scan barcode
- Filter by category tabs + favorites tab
- Click product to add to cart (quantity++)
- Pilih varian produk (size, rasa, dll) via modal
- Edit quantity, remove item from cart
- Per-item note (e.g. "tanpa bawang")
- Apply discount per item atau per transaksi (percentage / fixed / promo code)
- Redeem loyalty points pelanggan
- Select or add customer (dengan autocomplete)
- Payment modal: cash (with change calculation), QRIS, card, e-wallet, split payment
- Print receipt after payment (thermal & A4)
- Hold and recall transaction (park order) — bisa simpan multiple
- Void transaction (admin PIN required)
- Refund partial atau full
- Shift management: buka/tutup shift, input saldo awal kas
- Kirim order ke kitchen display (KDS)
- Pilih nomor meja

## Dashboard Cards

- Total Penjualan Hari Ini (Rp)
- Jumlah Transaksi Hari Ini
- Rata-rata per Transaksi
- Produk Terjual Hari Ini
- Laba Kotor Hari Ini
- Total Pengeluaran Bulan Ini
- Pelanggan Baru Bulan Ini
- Stok Hampir Habis (alert count)

## Reports

- Penjualan: grafik harian/mingguan/bulanan, filter date range
- Produk: top selling, low selling, profit margin per produk
- Kasir: penjualan per kasir, jumlah transaksi, rata-rata per transaksi
- Kategori: penjualan per kategori (pie chart + bar)
- Laba Rugi: revenue - COGS - expenses = net profit, per periode
- Shift: rekap penjualan per shift, selisih kas
- Pelanggan: top spender, retention, tier distribution
- Export ke PDF dan CSV

## Loyalty & CRM

- Sistem poin: konfigurasi berapa poin per Rp X transaksi
- Tier pelanggan: Regular / Silver / Gold / Platinum (threshold konfigurasi)
- Redeem poin saat transaksi (1 poin = Rp X, konfigurasi)
- Riwayat poin per pelanggan (earned / redeemed)
- Filter & segment pelanggan berdasarkan tier, total spend, last purchase

## Inventory & Purchasing

- Stock alert otomatis ketika stok <= minStock
- Purchase order ke supplier: draft → ordered → received
- Receive PO: input qty terima, stok auto-update, catat selisih
- Riwayat mutasi stok: in/out/adjustment/return/damage + siapa yang edit
- Stock valuation: total nilai stok berdasarkan harga modal
- Multi-lokasi stok (opsional, konfigurasi)

## Shift Management

- Kasir buka shift: input saldo kas awal
- Semua transaksi dalam shift tercatat ke shift aktif
- Kasir tutup shift: hitung kas aktual, bandingkan dengan sistem
- Rekap shift: total per payment method, total penjualan, selisih kas
- Admin bisa lihat semua shift history

## Discount & Promo

- Diskon flat atau persentase per produk / kategori / semua
- Buy X Get Y (beli 2 gratis 1, dll)
- Promo code / voucher yang bisa diinput di POS
- Batas minimal pembelian
- Batas tanggal berlaku
- Batas jumlah pemakaian

## Kitchen Display (KDS)

- Order masuk otomatis tampil di /dashboard/kitchen
- Status: Pending → Preparing → Ready → Served
- Prioritas order
- Notifikasi bunyi saat order baru masuk
- Per-item note dari kasir terlihat jelas

## Store Settings

- Nama toko, Alamat, Nomor telepon, Logo (upload)
- Pajak (persen atau fixed, on/off, inclusive/exclusive)
- Format struk (header, footer text, tampilkan logo, tampilkan poin)
- Mata uang (default: IDR)
- Konfigurasi loyalty points
- Konfigurasi tier pelanggan
- Nomor meja (aktifkan/nonaktifkan fitur meja)
- Kitchen display (aktifkan/nonaktifkan)
- Multi-kasir / shift (aktifkan/nonaktifkan)

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
- Shift harus aktif sebelum kasir bisa mulai transaksi (konfigurasi on/off)
- Notifikasi low stock via Notification model + badge di sidebar
- KDS polling setiap 10 detik (atau pakai Server-Sent Events)
- Points calculation di server saat transaction complete
- Semua laporan menggunakan agregasi di Prisma (bukan di client)
- PDF export via jspdf, CSV export via native string generation
