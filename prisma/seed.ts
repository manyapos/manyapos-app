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
  const products = [
    // Makanan
    {
      name: "Nasi Goreng",
      sku: "MKN-001",
      categoryId: makanan.id,
      price: 15000,
      costPrice: 8000,
      stock: 50,
      unit: "pcs",
    },
    {
      name: "Mie Goreng",
      sku: "MKN-002",
      categoryId: makanan.id,
      price: 13000,
      costPrice: 7000,
      stock: 50,
      unit: "pcs",
    },
    {
      name: "Indomie Goreng",
      sku: "MKN-003",
      categoryId: makanan.id,
      price: 3500,
      costPrice: 2800,
      stock: 200,
      unit: "pcs",
    },
    {
      name: "Roti Tawar Sari Roti",
      sku: "MKN-004",
      categoryId: makanan.id,
      price: 16000,
      costPrice: 13000,
      stock: 30,
      unit: "pcs",
    },
    {
      name: "Telur Ayam 1kg",
      sku: "MKN-005",
      categoryId: makanan.id,
      price: 28000,
      costPrice: 24000,
      stock: 20,
      unit: "kg",
    },
    // Minuman
    {
      name: "Aqua 600ml",
      sku: "MNM-001",
      categoryId: minuman.id,
      price: 4000,
      costPrice: 2500,
      stock: 100,
      unit: "pcs",
    },
    {
      name: "Teh Botol Sosro",
      sku: "MNM-002",
      categoryId: minuman.id,
      price: 5000,
      costPrice: 3500,
      stock: 80,
      unit: "pcs",
    },
    {
      name: "Kopi Kapal Api Sachet",
      sku: "MNM-003",
      categoryId: minuman.id,
      price: 2000,
      costPrice: 1500,
      stock: 150,
      unit: "pcs",
    },
    {
      name: "Susu Ultra 250ml",
      sku: "MNM-004",
      categoryId: minuman.id,
      price: 6000,
      costPrice: 4500,
      stock: 60,
      unit: "pcs",
    },
    {
      name: "Es Teh Manis",
      sku: "MNM-005",
      categoryId: minuman.id,
      price: 5000,
      costPrice: 1500,
      stock: 100,
      unit: "pcs",
    },
    // Snack
    {
      name: "Chitato 68g",
      sku: "SNK-001",
      categoryId: snack.id,
      price: 11000,
      costPrice: 8500,
      stock: 40,
      unit: "pcs",
    },
    {
      name: "Oreo 133g",
      sku: "SNK-002",
      categoryId: snack.id,
      price: 10000,
      costPrice: 7500,
      stock: 35,
      unit: "pcs",
    },
    {
      name: "Tango Wafer",
      sku: "SNK-003",
      categoryId: snack.id,
      price: 8000,
      costPrice: 6000,
      stock: 45,
      unit: "pcs",
    },
    {
      name: "Kacang Garuda 100g",
      sku: "SNK-004",
      categoryId: snack.id,
      price: 12000,
      costPrice: 9000,
      stock: 30,
      unit: "pcs",
    },
    // Rokok
    {
      name: "Gudang Garam Surya 16",
      sku: "RKK-001",
      categoryId: rokok.id,
      price: 30000,
      costPrice: 27000,
      stock: 50,
      unit: "pcs",
    },
    {
      name: "Sampoerna Mild 16",
      sku: "RKK-002",
      categoryId: rokok.id,
      price: 32000,
      costPrice: 28500,
      stock: 50,
      unit: "pcs",
    },
    // ATK
    {
      name: "Pulpen Pilot",
      sku: "ATK-001",
      categoryId: atk.id,
      price: 5000,
      costPrice: 3000,
      stock: 100,
      unit: "pcs",
    },
    {
      name: "Buku Tulis Sidu 58 Lembar",
      sku: "ATK-002",
      categoryId: atk.id,
      price: 6000,
      costPrice: 4000,
      stock: 60,
      unit: "pcs",
    },
    // Kebutuhan Rumah
    {
      name: "Rinso Sachet 45g",
      sku: "RMH-001",
      categoryId: rumah.id,
      price: 2000,
      costPrice: 1500,
      stock: 200,
      unit: "pcs",
    },
    {
      name: "Sabun Lifebuoy 75g",
      sku: "RMH-002",
      categoryId: rumah.id,
      price: 4000,
      costPrice: 3000,
      stock: 80,
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
      value: 10,
      minPurchase: 50000,
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
      value: 5000,
      minPurchase: 30000,
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
