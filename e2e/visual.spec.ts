import { test, expect } from "@playwright/test"

// Visual regression tests — first run creates baseline screenshots,
// subsequent runs compare pixel-by-pixel.

// ── Public pages ───────────────────────────────────────────────

test.describe("Visual: public pages", () => {
  // Login & register have a random captcha SVG — allow small pixel diff
  test("login page", async ({ page }) => {
    await page.goto("/login")
    await page.waitForLoadState("networkidle")
    await expect(page).toHaveScreenshot("login.png", { fullPage: true, maxDiffPixelRatio: 0.02 })
  })

  test("register page", async ({ page }) => {
    await page.goto("/register")
    await page.waitForLoadState("networkidle")
    await expect(page).toHaveScreenshot("register.png", { fullPage: true, maxDiffPixelRatio: 0.02 })
  })

  test("reset password page", async ({ page }) => {
    await page.goto("/reset-password")
    await expect(page).toHaveScreenshot("reset-password.png", { fullPage: true })
  })
})
