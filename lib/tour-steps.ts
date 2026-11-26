import type { DriveStep } from "driver.js"

export const tourSteps: Record<string, DriveStep[]> = {
  "/dashboard": [
    { element: "[data-tour='summary-cards']", popover: { title: "Ringkasan Hari Ini", description: "Kartu ini menampilkan total penjualan, jumlah transaksi, dan laba kotor hari ini secara real-time.", side: "bottom" } },
    { element: "[data-tour='sales-chart']",   popover: { title: "Grafik Penjualan",  description: "Tren penjualan 7 hari terakhir. Gunakan untuk memantau pola penjualan harian.", side: "top" } },
    { element: "[data-tour='low-stock']",     popover: { title: "Stok Hampir Habis", description: "Daftar produk yang stoknya di bawah minimum. Segera lakukan pembelian ke supplier.", side: "top" } },
  ],
  "/pos": [
    { element: "[data-tour='product-search']",  popover: { title: "Cari Produk",      description: "Ketik nama produk atau scan barcode untuk menambahkan ke keranjang.", side: "bottom" } },
    { element: "[data-tour='category-tabs']",   popover: { title: "Filter Kategori",  description: "Klik tab kategori untuk menyaring produk yang ditampilkan.", side: "bottom" } },
    { element: "[data-tour='cart']",             popover: { title: "Keranjang Belanja", description: "Item yang dipilih muncul di sini. Edit qty, tambah catatan, atau hapus item.", side: "left" } },
    { element: "[data-tour='payment-btn']",      popover: { title: "Tombol Bayar",    description: "Klik untuk membuka modal pembayaran. Pilih metode: tunai, QRIS, kartu, atau e-wallet.", side: "top" } },
  ],
  "/dashboard/products": [
    { element: "[data-tour='add-product-btn']",  popover: { title: "Tambah Produk",   description: "Klik untuk membuat produk baru dengan SKU, harga jual, harga modal, dan stok awal.", side: "bottom" } },
    { element: "[data-tour='product-search']",   popover: { title: "Cari Produk",     description: "Cari berdasarkan nama atau SKU produk.", side: "bottom" } },
    { element: "[data-tour='product-table']",    popover: { title: "Daftar Produk",   description: "Klik Edit untuk mengubah detail produk. Kolom Aktif menentukan apakah produk muncul di POS.", side: "top" } },
  ],
  "/dashboard/products/new": [
    { element: "[data-tour='product-name']",     popover: { title: "Nama Produk",     description: "Nama yang akan tampil di POS dan struk.", side: "bottom" } },
    { element: "[data-tour='product-sku']",      popover: { title: "SKU",             description: "Kode unik produk untuk identifikasi internal.", side: "bottom" } },
    { element: "[data-tour='product-price']",    popover: { title: "Harga Jual",      description: "Harga yang dibayar pelanggan. Disimpan dalam sen (integer).", side: "bottom" } },
    { element: "[data-tour='product-cost']",     popover: { title: "Harga Modal",     description: "Biaya beli/produksi. Digunakan untuk menghitung laba kotor.", side: "bottom" } },
    { element: "[data-tour='product-stock']",    popover: { title: "Stok & Min Stok", description: "Stok awal produk. Alert otomatis muncul jika stok ≤ minimum.", side: "bottom" } },
  ],
  "/dashboard/categories": [
    { element: "[data-tour='add-category-btn']", popover: { title: "Tambah Kategori", description: "Buat kategori baru untuk mengelompokkan produk di POS.", side: "bottom" } },
    { element: "[data-tour='category-table']",   popover: { title: "Daftar Kategori", description: "Edit atau hapus kategori. Kategori yang sudah memiliki produk tidak bisa dihapus.", side: "top" } },
  ],
  "/dashboard/customers": [
    { element: "[data-tour='add-customer-btn']", popover: { title: "Tambah Pelanggan", description: "Daftarkan pelanggan baru untuk program loyalitas dan riwayat transaksi.", side: "bottom" } },
    { element: "[data-tour='customer-table']",   popover: { title: "Daftar Pelanggan", description: "Klik nama pelanggan untuk melihat detail, riwayat transaksi, dan poin loyalitas.", side: "top" } },
  ],
  "/dashboard/transactions": [
    { element: "[data-tour='transaction-filter']", popover: { title: "Filter Transaksi", description: "Filter berdasarkan tanggal, kasir, status, atau metode pembayaran.", side: "bottom" } },
    { element: "[data-tour='transaction-table']",  popover: { title: "Riwayat Transaksi", description: "Klik baris untuk melihat detail transaksi, cetak ulang struk, atau proses refund.", side: "top" } },
  ],
  "/dashboard/inventory": [
    { element: "[data-tour='low-stock-alert']",   popover: { title: "Alert Stok Rendah", description: "Produk dengan stok di bawah minimum. Segera restok sebelum kehabisan.", side: "bottom" } },
    { element: "[data-tour='adjust-stock-btn']",  popover: { title: "Penyesuaian Stok",  description: "Lakukan koreksi stok manual: penambahan, pengurangan, atau penyesuaian karena kerusakan.", side: "bottom" } },
    { element: "[data-tour='stock-table']",       popover: { title: "Overview Stok",     description: "Daftar semua produk dengan stok, nilai stok, dan status stok saat ini.", side: "top" } },
  ],
  "/dashboard/suppliers": [
    { element: "[data-tour='add-supplier-btn']",  popover: { title: "Tambah Supplier",  description: "Daftarkan supplier baru untuk pembuatan purchase order.", side: "bottom" } },
    { element: "[data-tour='supplier-table']",    popover: { title: "Daftar Supplier",  description: "Edit info kontak supplier atau hapus supplier yang tidak aktif.", side: "top" } },
  ],
  "/dashboard/purchases": [
    { element: "[data-tour='create-po-btn']",     popover: { title: "Buat Purchase Order", description: "Buat PO baru untuk pembelian stok dari supplier. Status dimulai dari Draft.", side: "bottom" } },
    { element: "[data-tour='po-list']",           popover: { title: "Daftar PO",           description: "Klik PO untuk melihat detail. Ubah status: Draft → Dipesan → Diterima. Stok otomatis bertambah saat diterima.", side: "top" } },
  ],
  "/dashboard/purchases/new": [
    { element: "[data-tour='po-supplier']",       popover: { title: "Pilih Supplier",     description: "Pilih supplier yang akan dipesan. Pastikan supplier sudah terdaftar.", side: "bottom" } },
    { element: "[data-tour='po-add-item']",       popover: { title: "Tambah Item",        description: "Pilih produk, masukkan qty dan harga modal. Harga modal otomatis terisi dari data produk.", side: "bottom" } },
  ],
  "/dashboard/reports": [
    { element: "[data-tour='date-filter']",       popover: { title: "Filter Tanggal",    description: "Pilih rentang tanggal untuk laporan. Default: 30 hari terakhir.", side: "bottom" } },
    { element: "[data-tour='sales-chart']",       popover: { title: "Grafik Penjualan",  description: "Visualisasi tren penjualan harian dalam rentang yang dipilih.", side: "top" } },
    { element: "[data-tour='report-nav']",        popover: { title: "Sub-Laporan",       description: "Akses laporan lebih detail: per produk, kategori, kasir, dan laba rugi.", side: "right" } },
  ],
  "/dashboard/reports/products": [
    { element: "[data-tour='top-products']",      popover: { title: "Top Terlaris",      description: "10 produk dengan revenue tertinggi. Perhatikan margin — bukan hanya qty.", side: "top" } },
    { element: "[data-tour='bottom-products']",   popover: { title: "Penjualan Terendah", description: "Produk yang jarang terjual. Pertimbangkan untuk dinonaktifkan atau dipromosikan.", side: "top" } },
  ],
  "/dashboard/reports/categories": [
    { element: "[data-tour='category-pie']",      popover: { title: "Distribusi Kategori", description: "Proporsi penjualan per kategori. Kategori dominan = fokus stok utama.", side: "right" } },
    { element: "[data-tour='category-bar']",      popover: { title: "Revenue per Kategori", description: "Perbandingan revenue antar kategori dalam periode yang dipilih.", side: "left" } },
  ],
  "/dashboard/reports/cashiers": [
    { element: "[data-tour='cashier-table']",     popover: { title: "Performa Kasir",    description: "Ranking kasir berdasarkan total penjualan, jumlah transaksi, dan rata-rata per transaksi.", side: "top" } },
  ],
  "/dashboard/reports/profit": [
    { element: "[data-tour='profit-summary']",    popover: { title: "Ringkasan Laba Rugi", description: "Revenue dikurangi COGS (harga modal) dan pengeluaran operasional = net profit.", side: "bottom" } },
    { element: "[data-tour='profit-chart']",      popover: { title: "Grafik Laba Rugi",   description: "Tren revenue, biaya, dan laba bersih secara visual per periode.", side: "top" } },
  ],
  "/dashboard/expenses": [
    { element: "[data-tour='add-expense-btn']",   popover: { title: "Catat Pengeluaran",  description: "Input pengeluaran operasional: sewa, listrik, gaji, dll. Masuk ke laporan laba rugi.", side: "bottom" } },
    { element: "[data-tour='expense-table']",     popover: { title: "Riwayat Pengeluaran", description: "Semua pengeluaran tercatat di sini. Filter berdasarkan kategori atau periode.", side: "top" } },
  ],
  "/dashboard/shifts": [
    { element: "[data-tour='open-shift-btn']",    popover: { title: "Buka Shift",         description: "Kasir harus membuka shift sebelum mulai transaksi. Input saldo kas awal.", side: "bottom" } },
    { element: "[data-tour='shift-table']",       popover: { title: "Riwayat Shift",      description: "Rekap semua shift: total penjualan, per metode bayar, dan selisih kas.", side: "top" } },
  ],
  "/dashboard/users": [
    { element: "[data-tour='add-user-btn']",      popover: { title: "Tambah Pengguna",    description: "Buat akun kasir atau manager baru. Role Admin tidak bisa dibuat di sini.", side: "bottom" } },
    { element: "[data-tour='user-table']",        popover: { title: "Daftar Pengguna",    description: "Edit data pengguna, ubah role, atau reset PIN kasir.", side: "top" } },
  ],
  "/dashboard/settings": [
    { element: "[data-tour='settings-store']",    popover: { title: "Info Toko",          description: "Nama toko, alamat, dan nomor telepon yang tampil di struk.", side: "right" } },
    { element: "[data-tour='settings-tax']",      popover: { title: "Pengaturan Pajak",   description: "Aktifkan/nonaktifkan pajak, atur persentase, dan pilih inclusive/exclusive.", side: "right" } },
    { element: "[data-tour='settings-receipt']",  popover: { title: "Format Struk",       description: "Atur teks header dan footer struk, tampilkan logo, dan format thermal/A4.", side: "right" } },
  ],
  "/dashboard/discounts": [
    { element: "[data-tour='add-discount-btn']",  popover: { title: "Tambah Diskon",      description: "Buat promo baru: persentase atau nominal. Bisa dibatasi tanggal dan pemakaian.", side: "bottom" } },
    { element: "[data-tour='discount-list']",     popover: { title: "Daftar Promo",       description: "Aktifkan/nonaktifkan promo, edit, atau hapus. Kode promo bisa diinput di POS.", side: "top" } },
  ],
  "/dashboard/notifications": [
    { element: "[data-tour='notif-count']",       popover: { title: "Jumlah Notifikasi",  description: "Notifikasi yang belum dibaca. Stok rendah otomatis muncul di sini.", side: "bottom" } },
    { element: "[data-tour='notif-list']",        popover: { title: "Daftar Notifikasi",  description: "Klik centang untuk tandai dibaca, atau hapus notifikasi yang sudah selesai ditangani.", side: "top" } },
  ],
}
