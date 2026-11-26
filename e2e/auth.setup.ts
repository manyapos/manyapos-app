import { test as setup, type Page } from "@playwright/test"

const FAKE_TOKEN = "test-token"
const CAPTCHA_ANSWER = "42"

async function bypassCaptcha(page: Page) {
  await page.route("**/api/captcha", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        svg: '<svg width="100" height="30"><text x="10" y="20">0+42</text></svg>',
        token: FAKE_TOKEN,
      }),
    })
  )
  await page.route("**/api/auth/verify-captcha", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    })
  )
}

setup("authenticate as admin", async ({ page }) => {
  await bypassCaptcha(page)
  await page.goto("/login")
  await page.locator("#email").fill("admin@manya.com")
  await page.locator("#password").fill("admin123")
  await page.locator('input[maxlength="2"]').fill(CAPTCHA_ANSWER)
  await page.getByRole("button", { name: "Masuk" }).click()
  await page.waitForURL((url) => !url.pathname.includes("/login"), {
    timeout: 10_000,
  })
  await page.context().storageState({ path: "e2e/.auth/admin.json" })
})
