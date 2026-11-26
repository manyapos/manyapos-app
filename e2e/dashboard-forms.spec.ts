import { test, expect } from "@playwright/test"

// All tests run as authenticated admin (via auth.setup.ts + storageState)

// ── Categories ─────────────────────────────────────────────────

test.describe("Categories form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/categories")
  })

  test("page loads with table", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Kategori" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Tambah Kategori" })).toBeVisible()
  })

  test("open add dialog and validate required name", async ({ page }) => {
    await page.getByRole("button", { name: "Tambah Kategori" }).click()
    await expect(page.getByText("Tambah Kategori").nth(1)).toBeVisible()
    await page.getByRole("button", { name: "Simpan" }).click()
    await expect(page.getByText("Nama wajib diisi")).toBeVisible()
  })

  test("fill and submit add category", async ({ page }) => {
    const unique = Date.now()
    await page.getByRole("button", { name: "Tambah Kategori" }).click()
    await page.getByPlaceholder("Nama kategori").fill(`Kategori E2E ${unique}`)
    await page.getByPlaceholder("Deskripsi (opsional)").fill("Deskripsi test")
    await page.getByRole("button", { name: "Simpan" }).click()
    await expect(page.getByText("Kategori ditambahkan")).toBeVisible({ timeout: 10_000 })
  })
})

// ── Customers ──────────────────────────────────────────────────

test.describe("Customers form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/customers")
  })

  test("page loads", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Tambah Pelanggan" })).toBeVisible()
  })

  test("validate required name", async ({ page }) => {
    await page.getByRole("button", { name: "Tambah Pelanggan" }).click()
    await page.getByRole("button", { name: "Simpan" }).click()
    await expect(page.getByText("Nama wajib diisi")).toBeVisible()
  })

  test("email field accepts valid or empty email", async ({ page }) => {
    await page.getByRole("button", { name: "Tambah Pelanggan" }).click()
    await page.getByPlaceholder("Nama pelanggan").fill("Test Customer")
    // Optional email with .or(z.literal("")) — empty is valid, bad format blocks submit
    await page.getByPlaceholder("Email (opsional)").fill("bad-email")
    await page.getByRole("button", { name: "Simpan" }).click()
    // Form should not submit successfully with invalid email — dialog stays open
    await expect(page.getByRole("dialog")).toBeVisible()
  })

  test("fill and submit customer", async ({ page }) => {
    await page.getByRole("button", { name: "Tambah Pelanggan" }).click()
    await page.getByPlaceholder("Nama pelanggan").fill("Pelanggan Test E2E")
    await page.getByPlaceholder("Nomor telepon").fill("081234567890")
    await page.getByRole("button", { name: "Simpan" }).click()
    await expect(page.getByText("Pelanggan ditambahkan")).toBeVisible({ timeout: 10_000 })
  })
})

// ── Suppliers ──────────────────────────────────────────────────

test.describe("Suppliers form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/suppliers")
  })

  test("page loads", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Tambah Supplier" })).toBeVisible()
  })

  test("validate required name", async ({ page }) => {
    await page.getByRole("button", { name: "Tambah Supplier" }).click()
    await page.getByRole("button", { name: "Simpan" }).click()
    await expect(page.getByText("Nama wajib diisi")).toBeVisible()
  })

  test("fill and submit supplier", async ({ page }) => {
    await page.getByRole("button", { name: "Tambah Supplier" }).click()
    // Labels without htmlFor — use placeholder or nth-matching inside dialog
    const dialog = page.locator("[role=dialog]")
    await dialog.locator("input").first().fill("Supplier Test E2E")
    await page.getByRole("button", { name: "Simpan" }).click()
    await expect(page.getByText("Supplier ditambahkan")).toBeVisible({ timeout: 10_000 })
  })
})

// ── Expenses ───────────────────────────────────────────────────

test.describe("Expenses form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/expenses")
  })

  test("page loads", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Tambah Pengeluaran" })).toBeVisible()
  })

  test("validate required description", async ({ page }) => {
    await page.getByRole("button", { name: "Tambah Pengeluaran" }).click()
    await page.getByPlaceholder("Deskripsi").fill("")
    await page.getByRole("button", { name: "Simpan" }).click()
    await expect(page.getByText("Deskripsi wajib diisi")).toBeVisible()
  })

  test("fill and submit expense", async ({ page }) => {
    await page.getByRole("button", { name: "Tambah Pengeluaran" }).click()
    await page.getByPlaceholder("Deskripsi").fill("Belanja bahan test")
    // PriceInput renders as text input with inputMode=numeric, placeholder "0"
    const dialog = page.locator("[role=dialog]")
    await dialog.locator('input[inputmode="numeric"]').fill("50000")
    await page.getByRole("button", { name: "Simpan" }).click()
    await expect(page.getByText("Pengeluaran ditambahkan")).toBeVisible({ timeout: 10_000 })
  })
})

// ── Users ──────────────────────────────────────────────────────

test.describe("Users form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/users")
  })

  test("page loads", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Tambah Pengguna" })).toBeVisible()
  })

  test("validate required name on submit", async ({ page }) => {
    await page.getByRole("button", { name: "Tambah Pengguna" }).click()
    await page.getByRole("button", { name: "Simpan" }).click()
    await expect(page.getByText("Nama wajib diisi")).toBeVisible()
  })

  test("fill and submit user", async ({ page }) => {
    const unique = Date.now()
    await page.getByRole("button", { name: "Tambah Pengguna" }).click()
    await page.getByPlaceholder("Nama").fill("Kasir Test E2E")
    await page.getByPlaceholder("Email").fill(`kasir-e2e-${unique}@test.com`)
    await page.getByPlaceholder("Password").fill("password123")
    await page.getByPlaceholder("4 digit").fill("9999")
    await page.getByRole("button", { name: "Simpan" }).click()
    await expect(page.getByText("Pengguna ditambahkan")).toBeVisible({ timeout: 10_000 })
  })
})

// ── Settings ───────────────────────────────────────────────────

test.describe("Settings forms", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/settings")
  })

  test("store info section loads and saves", async ({ page }) => {
    await expect(page.locator("#store_name")).toBeVisible()
    // Save original value to restore after test
    const original = await page.locator("#store_name").inputValue()
    await page.locator("#store_name").fill("Toko Test E2E")
    await page.locator("#store_phone").fill("081234567890")
    await page.locator("#store_email").fill("toko@test.com")
    await page.getByRole("button", { name: "Simpan" }).first().click()
    await expect(page.getByText("Pengaturan disimpan")).toBeVisible({ timeout: 10_000 })
    // Restore original store name
    await page.locator("#store_name").fill(original || "Toko Manya")
    await page.getByRole("button", { name: "Simpan" }).first().click()
    await expect(page.getByText("Pengaturan disimpan")).toBeVisible({ timeout: 10_000 })
  })

  test("tax section loads", async ({ page }) => {
    // Use getByRole button to avoid ambiguity with sidebar tooltip text
    await page.getByRole("button", { name: "Pajak" }).first().click()
    await expect(page.locator("#tax_name")).toBeVisible()
    await expect(page.locator("#tax_rate")).toBeVisible()
  })

  test("receipt section loads", async ({ page }) => {
    await page.getByRole("button", { name: "Struk" }).first().click()
    await expect(page.locator("#receipt_header")).toBeVisible()
    await expect(page.locator("#receipt_footer")).toBeVisible()
  })

  test("currency section loads", async ({ page }) => {
    await page.getByRole("button", { name: "Mata Uang" }).first().click()
    await expect(page.locator("#currency_code")).toBeVisible()
    await expect(page.locator("#currency_symbol")).toBeVisible()
  })

  test("shift section loads", async ({ page }) => {
    await page.getByRole("button", { name: "Shift" }).first().click()
    await expect(page.locator("#shift_enabled")).toBeVisible()
  })
})

// ── Products (new page) ────────────────────────────────────────

test.describe("Product form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/products/new")
  })

  test("page loads with form", async ({ page }) => {
    await expect(page.locator("#name")).toBeVisible()
    await expect(page.locator("#sku")).toBeVisible()
  })

  test("validate required fields", async ({ page }) => {
    await page.getByRole("button", { name: "Tambah" }).click()
    await expect(page.getByText("Nama wajib diisi")).toBeVisible()
    await expect(page.getByText("SKU wajib diisi")).toBeVisible()
  })

  test("cancel button navigates back", async ({ page }) => {
    await page.getByRole("button", { name: "Batal" }).click()
    await expect(page).not.toHaveURL(/\/new/)
  })
})
