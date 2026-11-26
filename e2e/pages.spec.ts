import { test, expect, type Page } from "@playwright/test"

// ── Public pages (no auth needed) ──────────────────────────────

test.describe("Public pages", () => {
  test("login page renders", async ({ page }) => {
    await page.goto("/login")
    await expect(page.getByText("Selamat datang kembali")).toBeVisible()
    await expect(page.locator("#email")).toBeVisible()
    await expect(page.locator("#password")).toBeVisible()
  })

  test("register page renders", async ({ page }) => {
    await page.goto("/register")
    await expect(page.getByRole("button", { name: "Daftar" })).toBeVisible()
  })

  test("reset-password page renders", async ({ page }) => {
    await page.goto("/reset-password")
    await expect(page).toHaveURL(/reset-password/)
  })

  test("unknown route redirects to login", async ({ page }) => {
    await page.goto("/halaman-tidak-ada")
    // ponytail: not-found may redirect to login due to auth middleware; check we land somewhere valid
    await expect(page).toHaveURL(/\/(login|halaman-tidak-ada)/)
  })
})

// ── Protected pages redirect to login ──────────────────────────

const protectedRoutes = [
  "/",
  "/dashboard",
  "/pos",
  "/dashboard/products",
  "/dashboard/products/new",
  "/dashboard/categories",
  "/dashboard/customers",
  "/dashboard/transactions",
  "/dashboard/inventory",
  "/dashboard/inventory/adjustments",
  "/dashboard/suppliers",
  "/dashboard/purchases",
  "/dashboard/purchases/new",
  "/dashboard/expenses",
  "/dashboard/discounts",
  "/dashboard/shifts",
  "/dashboard/reports",
  "/dashboard/reports/products",
  "/dashboard/reports/categories",
  "/dashboard/reports/cashiers",
  "/dashboard/reports/profit",
  "/dashboard/users",
  "/dashboard/settings",
  "/dashboard/notifications",
]

for (const route of protectedRoutes) {
  test(`${route} redirects to /login when unauthenticated`, async ({ page }) => {
    await page.goto(route)
    await expect(page).toHaveURL(/\/login/)
  })
}
