import { PrismaClient } from "@prisma/client"
import bcryptjs from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const hash = (pw: string) => bcryptjs.hash(pw, 10)

  // ── Users ──────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: "admin@manya.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@manya.com",
      password: await hash("admin123"),
      role: "ADMIN",
      pin: "0000",
    },
  })
  const manager = await prisma.user.upsert({
    where: { email: "manager@manya.com" },
    update: {},
    create: {
      name: "Budi Manager",
      email: "manager@manya.com",
      password: await hash("manager123"),
      role: "MANAGER",
      pin: "1111",
    },
  })
  const kasir = await prisma.user.upsert({
    where: { email: "kasir@manya.com" },
    update: {},
    create: {
      name: "Siti Kasir",
      email: "kasir@manya.com",
      password: await hash("kasir123"),
      role: "CASHIER",
      pin: "1234",
    },
  })
  console.log("✅ Users")

  // ── Categories ─────────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "makanan" },
      update: {},
      create: {
        name: "Makanan",
        slug: "makanan",
        description: "Aneka makanan",
      },
    }),
    prisma.category.upsert({
      where: { slug: "minuman" },
      update: {},
      create: {
        name: "Minuman",
        slug: "minuman",
        description: "Aneka minuman",
      },
    }),
    prisma.category.upsert({
      where: { slug: "snack" },
      update: {},
      create: {
        name: "Snack",
        slug: "snack",
        description: "Camilan dan snack",
      },
    }),
    prisma.category.upsert({
      where: { slug: "rokok" },
      update: {},
      create: {
        name: "Rokok",
        slug: "rokok",
        description: "Rokok dan tembakau",
      },
    }),
    prisma.category.upsert({
      where: { slug: "atk" },
      update: {},
      create: { name: "ATK", slug: "atk", description: "Alat tulis kantor" },
    }),
    prisma.category.upsert({
      where: { slug: "kebutuhan-rumah" },
      update: {},
      create: {
        name: "Kebutuhan Rumah",
        slug: "kebutuhan-rumah",
        description: "Sabun, deterjen, dll",
      },
    }),
  ])
  const [makanan, minuman, snack, rokok, atk, rumah] = categories
  console.log("✅ Categories")

  // ── Products ───────────────────────────────────────────────
  // ponytail: harga dalam sen (÷100 = Rupiah). Rp 15.000 = 1_500_000 sen.
  const products = [
    // Makanan
    {
      name: "Nasi Goreng",
      sku: "MKN-001",
      categoryId: makanan.id,
      price: 1_500_000,
      costPrice: 800_000,
      stock: 50,
      unit: "pcs",
    },
    {
      name: "Mie Goreng",
      sku: "MKN-002",
      categoryId: makanan.id,
      price: 1_300_000,
      costPrice: 700_000,
      stock: 50,
      unit: "pcs",
    },
    {
      name: "Indomie Goreng",
      sku: "MKN-003",
      categoryId: makanan.id,
      price: 350_000,
      costPrice: 280_000,
      stock: 200,
      unit: "pcs",
    },
    {
      name: "Roti Tawar Sari Roti",
      sku: "MKN-004",
      categoryId: makanan.id,
      price: 1_600_000,
      costPrice: 1_300_000,
      stock: 30,
      unit: "pcs",
    },
    {
      name: "Telur Ayam 1kg",
      sku: "MKN-005",
      categoryId: makanan.id,
      price: 2_800_000,
      costPrice: 2_400_000,
      stock: 20,
      unit: "kg",
    },
    {
      name: "Beras 5kg",
      sku: "MKN-006",
      categoryId: makanan.id,
      price: 7_500_000,
      costPrice: 6_500_000,
      stock: 15,
      unit: "pcs",
    },
    {
      name: "Minyak Goreng Bimoli 1L",
      sku: "MKN-007",
      categoryId: makanan.id,
      price: 2_000_000,
      costPrice: 1_700_000,
      stock: 40,
      unit: "pcs",
    },
    {
      name: "Gula Pasir 1kg",
      sku: "MKN-008",
      categoryId: makanan.id,
      price: 1_800_000,
      costPrice: 1_500_000,
      stock: 25,
      unit: "kg",
    },
    // Minuman
    {
      name: "Aqua 600ml",
      sku: "MNM-001",
      categoryId: minuman.id,
      price: 400_000,
      costPrice: 250_000,
      stock: 100,
      unit: "pcs",
    },
    {
      name: "Teh Botol Sosro 450ml",
      sku: "MNM-002",
      categoryId: minuman.id,
      price: 500_000,
      costPrice: 350_000,
      stock: 80,
      unit: "pcs",
    },
    {
      name: "Kopi Kapal Api Sachet",
      sku: "MNM-003",
      categoryId: minuman.id,
      price: 200_000,
      costPrice: 150_000,
      stock: 150,
      unit: "pcs",
    },
    {
      name: "Susu Ultra 250ml",
      sku: "MNM-004",
      categoryId: minuman.id,
      price: 600_000,
      costPrice: 450_000,
      stock: 60,
      unit: "pcs",
    },
    {
      name: "Es Teh Manis",
      sku: "MNM-005",
      categoryId: minuman.id,
      price: 500_000,
      costPrice: 150_000,
      stock: 100,
      unit: "pcs",
    },
    {
      name: "Pocari Sweat 500ml",
      sku: "MNM-006",
      categoryId: minuman.id,
      price: 800_000,
      costPrice: 600_000,
      stock: 48,
      unit: "pcs",
    },
    {
      name: "Coca Cola 390ml",
      sku: "MNM-007",
      categoryId: minuman.id,
      price: 700_000,
      costPrice: 500_000,
      stock: 60,
      unit: "pcs",
    },
    // Snack
    {
      name: "Chitato 68g",
      sku: "SNK-001",
      categoryId: snack.id,
      price: 1_100_000,
      costPrice: 850_000,
      stock: 40,
      unit: "pcs",
    },
    {
      name: "Oreo 133g",
      sku: "SNK-002",
      categoryId: snack.id,
      price: 1_000_000,
      costPrice: 750_000,
      stock: 35,
      unit: "pcs",
    },
    {
      name: "Tango Wafer 130g",
      sku: "SNK-003",
      categoryId: snack.id,
      price: 800_000,
      costPrice: 600_000,
      stock: 45,
      unit: "pcs",
    },
    {
      name: "Kacang Garuda 100g",
      sku: "SNK-004",
      categoryId: snack.id,
      price: 1_200_000,
      costPrice: 900_000,
      stock: 30,
      unit: "pcs",
    },
    {
      name: "Sukro Oven 80g",
      sku: "SNK-005",
      categoryId: snack.id,
      price: 500_000,
      costPrice: 350_000,
      stock: 50,
      unit: "pcs",
    },
    // Rokok
    {
      name: "Gudang Garam Surya 16",
      sku: "RKK-001",
      categoryId: rokok.id,
      price: 3_000_000,
      costPrice: 2_700_000,
      stock: 50,
      unit: "pcs",
    },
    {
      name: "Sampoerna Mild 16",
      sku: "RKK-002",
      categoryId: rokok.id,
      price: 3_200_000,
      costPrice: 2_850_000,
      stock: 50,
      unit: "pcs",
    },
    {
      name: "Djarum Super 12",
      sku: "RKK-003",
      categoryId: rokok.id,
      price: 2_200_000,
      costPrice: 1_950_000,
      stock: 40,
      unit: "pcs",
    },
    {
      name: "Surya Pro Mild 16",
      sku: "RKK-004",
      categoryId: rokok.id,
      price: 2_700_000,
      costPrice: 2_400_000,
      stock: 35,
      unit: "pcs",
    },
    // ATK
    {
      name: "Pulpen Pilot",
      sku: "ATK-001",
      categoryId: atk.id,
      price: 500_000,
      costPrice: 300_000,
      stock: 100,
      unit: "pcs",
    },
    {
      name: "Buku Tulis Sidu 58 Lbr",
      sku: "ATK-002",
      categoryId: atk.id,
      price: 600_000,
      costPrice: 400_000,
      stock: 60,
      unit: "pcs",
    },
    {
      name: "Pensil 2B Faber Castell",
      sku: "ATK-003",
      categoryId: atk.id,
      price: 350_000,
      costPrice: 200_000,
      stock: 80,
      unit: "pcs",
    },
    // Kebutuhan Rumah
    {
      name: "Rinso Sachet 45g",
      sku: "RMH-001",
      categoryId: rumah.id,
      price: 200_000,
      costPrice: 150_000,
      stock: 200,
      unit: "pcs",
    },
    {
      name: "Sabun Lifebuoy 75g",
      sku: "RMH-002",
      categoryId: rumah.id,
      price: 400_000,
      costPrice: 300_000,
      stock: 80,
      unit: "pcs",
    },
    {
      name: "Pepsodent 120g",
      sku: "RMH-003",
      categoryId: rumah.id,
      price: 900_000,
      costPrice: 700_000,
      stock: 50,
      unit: "pcs",
    },
    {
      name: "Molto Sachet 20ml",
      sku: "RMH-004",
      categoryId: rumah.id,
      price: 100_000,
      costPrice: 70_000,
      stock: 150,
      unit: "pcs",
    },
    {
      name: "Baygon Aerosol 600ml",
      sku: "RMH-005",
      categoryId: rumah.id,
      price: 4_500_000,
      costPrice: 3_800_000,
      stock: 20,
      unit: "pcs",
    },
  ]

  for (const p of products) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: p,
    })
  }
  console.log("✅ Products")

  // ── Customers ──────────────────────────────────────────────
  const customers = [
    {
      name: "Pak Joko",
      phone: "081234567890",
      email: "joko@email.com",
      address: "Jl. Merdeka 10",
    },
    {
      name: "Bu Ani",
      phone: "081298765432",
      email: "ani@email.com",
      address: "Jl. Sudirman 25",
    },
    { name: "Dimas", phone: "085612345678" },
    { name: "Rina Sari", phone: "087811223344", email: "rina@email.com" },
  ]

  const createdCustomers = []
  for (const c of customers) {
    const cust = await prisma.customer
      .upsert({
        where: { id: c.name }, // won't match, forces create
        update: {},
        create: c,
      })
      .catch(() => prisma.customer.create({ data: c }))
    createdCustomers.push(cust)
  }
  console.log("✅ Customers")

  // ── Suppliers ──────────────────────────────────────────────
  await Promise.all([
    prisma.supplier.create({
      data: {
        name: "PT Indofood",
        phone: "02150001111",
        email: "order@indofood.com",
        address: "Jakarta",
      },
    }),
    prisma.supplier.create({
      data: {
        name: "CV Maju Jaya",
        phone: "02150002222",
        email: "majujaya@email.com",
        address: "Bandung",
      },
    }),
    prisma.supplier.create({
      data: { name: "UD Berkah", phone: "02150003333", address: "Surabaya" },
    }),
  ]).catch(() => {}) // skip if already exists
  console.log("✅ Suppliers")

  // ── Settings ───────────────────────────────────────────────
  const settings = [
    { key: "store_name", value: "Toko Manya" },
    { key: "store_address", value: "Jl. Contoh No. 123, Jakarta" },
    { key: "store_phone", value: "021-12345678" },
    { key: "tax_rate", value: "11" },
    { key: "currency", value: "IDR" },
    { key: "receipt_footer", value: "Terima kasih telah berbelanja!" },
  ]
  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    })
  }
  console.log("✅ Settings")

  // ── Discounts ──────────────────────────────────────────────
  await prisma.discount.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      name: "Welcome 10%",
      type: "percentage",
      value: 10, // persen, bukan sen
      minPurchase: 5_000_000, // Rp 50.000
      code: "WELCOME10",
      isActive: true,
    },
  })
  await prisma.discount.upsert({
    where: { code: "HEMAT5K" },
    update: {},
    create: {
      name: "Hemat 5rb",
      type: "fixed",
      value: 500_000, // Rp 5.000
      minPurchase: 3_000_000, // Rp 30.000
      code: "HEMAT5K",
      isActive: true,
    },
  })
  console.log("✅ Discounts")

  console.log("\n🎉 Seed selesai!")
  console.log("   Admin   : admin@manya.com / admin123")
  console.log("   Manager : manager@manya.com / manager123")
  console.log("   Kasir   : kasir@manya.com / kasir123")
}

main().finally(() => prisma.$disconnect())
