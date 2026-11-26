import { test, expect } from "@playwright/test"

// Visual regression tests for authenticated dashboard pages.
// Screenshots capture the main content area to avoid sidebar toggle flakiness.

async function screenshotMain(page: import("@playwright/test").Page, name: string, opts?: { maxDiffPixelRatio?: number }) {
  const main = page.locator("main").first()
  await expect(main).toBeVisible()
  await expect(main).toHaveScreenshot(name, { ...opts })
}

test.describe("Visual: dashboard pages", () => {
  test("dashboard home", async ({ page }) => {
    await page.goto("/dashboard")
    await page.waitForLoadState("networkidle")
    await screenshotMain(page, "dashboard-home.png")
  })

  test("products list", async ({ page }) => {
    await page.goto("/dashboard/products")
    await page.waitForLoadState("networkidle")
    await screenshotMain(page, "products-list.png")
  })

  test("products new", async ({ page }) => {
    await page.goto("/dashboard/products/new")
    await page.waitForLoadState("networkidle")
    await screenshotMain(page, "products-new.png", { maxDiffPixelRatio: 0.02 })
  })

  test("categories", async ({ page }) => {
    await page.goto("/dashboard/categories")
    await page.waitForLoadState("networkidle")
    await screenshotMain(page, "categories.png")
  })

  test("customers", async ({ page }) => {
    await page.goto("/dashboard/customers")
    await page.waitForLoadState("networkidle")
    await screenshotMain(page, "customers.png")
  })

  test("suppliers", async ({ page }) => {
    await page.goto("/dashboard/suppliers")
    await page.waitForLoadState("networkidle")
    await screenshotMain(page, "suppliers.png")
  })

  test("expenses", async ({ page }) => {
    await page.goto("/dashboard/expenses")
    await page.waitForLoadState("networkidle")
    await screenshotMain(page, "expenses.png")
  })

  test("discounts", async ({ page }) => {
    await page.goto("/dashboard/discounts")
    await page.waitForLoadState("networkidle")
    await screenshotMain(page, "discounts.png")
  })

  test("inventory stock", async ({ page }) => {
    await page.goto("/dashboard/inventory")
    await page.waitForLoadState("networkidle")
    await screenshotMain(page, "inventory-stock.png")
  })

  test("transactions", async ({ page }) => {
    await page.goto("/dashboard/transactions")
    await page.waitForLoadState("networkidle")
    await screenshotMain(page, "transactions.png")
  })

  test("purchases", async ({ page }) => {
    await page.goto("/dashboard/purchases")
    await page.waitForLoadState("networkidle")
    await screenshotMain(page, "purchases.png")
  })

  test("purchases new", async ({ page }) => {
    await page.goto("/dashboard/purchases/new")
    await screenshotMain(page, "purchases-new.png")
  })

  test("users", async ({ page }) => {
    await page.goto("/dashboard/users")
    await page.waitForLoadState("networkidle")
    await screenshotMain(page, "users.png")
  })

  test("shifts", async ({ page }) => {
    await page.goto("/dashboard/shifts")
    await page.waitForLoadState("networkidle")
    await screenshotMain(page, "shifts.png")
  })

  test("notifications", async ({ page }) => {
    await page.goto("/dashboard/notifications")
    await page.waitForLoadState("networkidle")
    await screenshotMain(page, "notifications.png")
  })

  test("reports", async ({ page }) => {
    await page.goto("/dashboard/reports")
    await page.waitForLoadState("networkidle")
    await screenshotMain(page, "reports.png")
  })

  test("settings - store info", async ({ page }) => {
    await page.goto("/dashboard/settings")
    await screenshotMain(page, "settings-store.png")
  })

  test("POS page", async ({ page }) => {
    await page.goto("/pos")
    await page.waitForLoadState("networkidle")
    await expect(page).toHaveScreenshot("pos.png", { fullPage: true })
  })
})
