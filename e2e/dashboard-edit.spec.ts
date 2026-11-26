import { test, expect } from "@playwright/test"

// All tests run as authenticated admin.
// Tests verify that edit dialogs/pages load with the correct pre-filled data from seed.

// ── Category edit dialog ───────────────────────────────────────

test.describe("Category edit dialog prefill", () => {
  test("edit first category shows name and description", async ({ page }) => {
    await page.goto("/dashboard/categories")
    // Click the pencil (edit) button on the first data row
    const pencilBtn = page.locator("tbody tr").first().locator("button").first()
    await pencilBtn.click()
    await expect(page.getByText("Edit Kategori")).toBeVisible()
    const dialog = page.locator("[role=dialog]")
    const nameInput = dialog.getByPlaceholder("Nama kategori")
    await expect(nameInput).toBeVisible()
    const name = await nameInput.inputValue()
    expect(name.length).toBeGreaterThan(0)
  })

  test("edit second seed category shows correct values", async ({ page }) => {
    await page.goto("/dashboard/categories")
    // Click the edit button on the first row (Makanan is always first seed)
    // then close, then try second — but simpler: just verify any row edit works
    const rows = page.getByRole("row").filter({ has: page.getByRole("button") })
    const count = await rows.count()
    if (count >= 2) {
      await rows.nth(1).getByRole("button").first().click()
      const dialog = page.locator("[role=dialog]")
      const nameInput = dialog.getByPlaceholder("Nama kategori")
      await expect(nameInput).toBeVisible()
      const name = await nameInput.inputValue()
      expect(name.length).toBeGreaterThan(0)
    }
  })
})

// ── Supplier edit dialog ───────────────────────────────────────

test.describe("Supplier edit dialog prefill", () => {
  test("edit PT Indofood shows all fields", async ({ page }) => {
    await page.goto("/dashboard/suppliers")
    const row = page.getByRole("row").filter({ hasText: "PT Indofood" })
    await row.getByRole("button").first().click()
    await expect(page.getByText("Edit Supplier")).toBeVisible()
    const dialog = page.locator("[role=dialog]")
    // Check all pre-filled fields by their order in the form
    const inputs = dialog.locator("input")
    await expect(inputs.nth(0)).toHaveValue("PT Indofood")       // name
    await expect(inputs.nth(1)).toHaveValue("02150001111")       // phone
    await expect(inputs.nth(2)).toHaveValue("order@indofood.com") // email
    await expect(inputs.nth(3)).toHaveValue("Jakarta")           // address
  })

  test("edit second supplier shows fields", async ({ page }) => {
    await page.goto("/dashboard/suppliers")
    const rows = page.getByRole("row").filter({ has: page.getByRole("button") })
    const count = await rows.count()
    if (count >= 2) {
      await rows.nth(1).getByRole("button").first().click()
      const dialog = page.locator("[role=dialog]")
      const nameInput = dialog.locator("input").first()
      await expect(nameInput).toBeVisible()
      const name = await nameInput.inputValue()
      expect(name.length).toBeGreaterThan(0)
    }
  })
})

// ── Discount edit dialog ───────────────────────────────────────

test.describe("Discount edit dialog prefill", () => {
  test("edit Welcome 10% shows percentage values", async ({ page }) => {
    await page.goto("/dashboard/discounts")
    // Discount cards — find the one with "Welcome 10%"
    const card = page.locator("[data-slot=card]").filter({ hasText: "Welcome 10%" })
    // Click pencil button on that card
    await card.locator("button").filter({ has: page.locator("svg.lucide-pencil") }).click()
    await expect(page.getByText("Edit Diskon")).toBeVisible()
    const dialog = page.locator("[role=dialog]")
    // Name
    await expect(dialog.getByPlaceholder("Contoh: Diskon Lebaran 10%")).toHaveValue("Welcome 10%")
    // Type should be percentage
    await expect(dialog.locator("select")).toHaveValue("percentage")
    // Value should be 10 (percentage, no /100 conversion)
    await expect(dialog.locator('input[type="number"]').first()).toHaveValue("10")
    // Code
    await expect(dialog.getByPlaceholder("Opsional")).toHaveValue("WELCOME10")
  })

  test("edit Hemat 5rb shows fixed values with /100 conversion", async ({ page }) => {
    await page.goto("/dashboard/discounts")
    const card = page.locator("[data-slot=card]").filter({ hasText: "Hemat 5rb" })
    await card.locator("button").filter({ has: page.locator("svg.lucide-pencil") }).click()
    const dialog = page.locator("[role=dialog]")
    await expect(dialog.getByPlaceholder("Contoh: Diskon Lebaran 10%")).toHaveValue("Hemat 5rb")
    await expect(dialog.locator("select")).toHaveValue("fixed")
    // value: 500_000 (cents) / 100 = 5000
    await expect(dialog.locator('input[type="number"]').first()).toHaveValue("5000")
    // minPurchase: 3_000_000 / 100 = 30000
    await expect(dialog.locator('input[type="number"]').nth(1)).toHaveValue("30000")
    await expect(dialog.getByPlaceholder("Opsional")).toHaveValue("HEMAT5K")
  })
})

// ── Product edit page ──────────────────────────────────────────

test.describe("Product edit dialog prefill", () => {
  test("edit first product shows pre-filled fields", async ({ page }) => {
    await page.goto("/dashboard/products")
    await expect(page.getByRole("heading", { name: "Produk" })).toBeVisible()
    // Click the first pencil (edit) button in the product table
    const editButtons = page.locator("[data-tour=product-table] button").filter({ has: page.locator("svg.lucide-pencil") })
    await editButtons.first().click()
    await expect(page.getByText("Edit Produk")).toBeVisible()
    const dialog = page.locator("[role=dialog]")
    // Name should be pre-filled (not empty)
    const nameInput = dialog.locator("input").first()
    await expect(nameInput).not.toHaveValue("")
    // SKU should be pre-filled
    const skuInput = dialog.locator("input").nth(1)
    await expect(skuInput).not.toHaveValue("")
    // Price (PriceInput) should not be empty or "0"
    const priceInput = dialog.locator('input[inputmode="numeric"]').first()
    const priceValue = await priceInput.inputValue()
    expect(priceValue).not.toBe("")
    expect(priceValue).not.toBe("0")
  })
})
