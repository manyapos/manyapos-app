import { test, expect, type Page } from "@playwright/test"

// ── Captcha bypass ─────────────────────────────────────────────
// Intercept captcha endpoints so forms can submit without solving math.

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

async function fillCaptcha(page: Page) {
  await page.locator('input[maxlength="2"]').fill(CAPTCHA_ANSWER)
}

// ── Login form ─────────────────────────────────────────────────

test.describe("Login form", () => {
  test.beforeEach(async ({ page }) => {
    await bypassCaptcha(page)
    await page.goto("/login")
  })

  test("submit disabled when form empty", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Masuk" })).toBeDisabled()
  })

  test("email validation error", async ({ page }) => {
    await page.locator("#email").fill("bukan-email")
    await page.locator("#password").click()
    await expect(page.getByText("Format email tidak valid")).toBeVisible()
  })

  test("password required — type then clear", async ({ page }) => {
    await page.locator("#password").fill("x")
    await page.locator("#password").fill("")
    await expect(page.getByText("Password wajib diisi")).toBeVisible()
  })

  test("enables submit when valid", async ({ page }) => {
    await page.locator("#email").fill("admin@manya.com")
    await page.locator("#password").fill("admin123")
    await fillCaptcha(page)
    await expect(page.getByRole("button", { name: "Masuk" })).toBeEnabled()
  })

  test("wrong credentials shows error", async ({ page }) => {
    await page.locator("#email").fill("wrong@email.com")
    await page.locator("#password").fill("wrongpassword")
    await fillCaptcha(page)
    await page.getByRole("button", { name: "Masuk" }).click()
    await expect(page.getByText("Email atau password salah")).toBeVisible()
  })

  test("successful login redirects", async ({ page }) => {
    await page.locator("#email").fill("admin@manya.com")
    await page.locator("#password").fill("admin123")
    await fillCaptcha(page)
    await page.getByRole("button", { name: "Masuk" }).click()
    await page.waitForURL((url) => !url.pathname.includes("/login"), {
      timeout: 10_000,
    })
    expect(page.url()).not.toContain("/login")
  })

  test("toggle password visibility", async ({ page }) => {
    const pw = page.locator("#password")
    await expect(pw).toHaveAttribute("type", "password")
    await page.locator("#password ~ button").click()
    await expect(pw).toHaveAttribute("type", "text")
  })

  test("forgot password link opens form", async ({ page }) => {
    await page.getByText("Lupa password?").click()
    await expect(page.getByText("Lupa Password?")).toBeVisible()
    await expect(page.locator("#forgot-email")).toBeVisible()
  })
})

// ── Register form ──────────────────────────────────────────────

test.describe("Register form", () => {
  test.beforeEach(async ({ page }) => {
    await bypassCaptcha(page)
    await page.goto("/register")
  })

  test("submit disabled when empty", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Daftar" })).toBeDisabled()
  })

  test("email format error", async ({ page }) => {
    await page.locator("#email").fill("bukan-email")
    await page.locator("#name").click()
    await expect(page.getByText("Email tidak valid")).toBeVisible()
  })

  test("password mismatch keeps submit disabled", async ({ page }) => {
    await page.locator("#name").fill("Test")
    await page.locator("#email").fill("t@t.com")
    await page.locator("#password").fill("password123")
    await page.locator("#confirm-password").fill("different1")
    await fillCaptcha(page)
    // refine runs after all field validations pass; mismatch keeps form invalid
    await expect(page.getByRole("button", { name: "Daftar" })).toBeDisabled()
  })

  test("password min length error", async ({ page }) => {
    await page.locator("#password").fill("123")
    await page.locator("#name").click()
    await expect(page.getByText("Password minimal 6 karakter")).toBeVisible()
  })

  test("enables submit when valid", async ({ page }) => {
    await page.locator("#name").fill("New User")
    await page.locator("#email").fill("new@test.com")
    await page.locator("#password").fill("password123")
    await page.locator("#confirm-password").fill("password123")
    await fillCaptcha(page)
    await expect(page.getByRole("button", { name: "Daftar" })).toBeEnabled()
  })

  test("toggle password visibility", async ({ page }) => {
    const pw = page.locator("#password")
    await expect(pw).toHaveAttribute("type", "password")
    await page.locator("#password ~ button").click()
    await expect(pw).toHaveAttribute("type", "text")
  })

  test("link to login", async ({ page }) => {
    const link = page.getByRole("link", { name: "Masuk" })
    await expect(link).toHaveAttribute("href", "/login")
  })
})

// ── Forgot password form ───────────────────────────────────────

test.describe("Forgot password form", () => {
  test.beforeEach(async ({ page }) => {
    await bypassCaptcha(page)
    await page.goto("/login")
    await page.getByText("Lupa password?").click()
  })

  test("email validation error", async ({ page }) => {
    await page.locator("#forgot-email").fill("bad")
    await page.locator("#forgot-email").blur()
    await expect(page.getByText("Format email tidak valid")).toBeVisible()
  })

  test("submits and shows confirmation", async ({ page }) => {
    await page.route("**/api/auth/forgot-password", (route) =>
      route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
      })
    )
    await page.locator("#forgot-email").fill("admin@manya.com")
    await page.getByRole("button", { name: "Kirim Link Reset" }).click()
    await expect(page.getByText("Email terkirim!")).toBeVisible()
  })

  test("back button returns to login", async ({ page }) => {
    await page.getByText("Kembali").click()
    await expect(page.getByText("Selamat datang kembali")).toBeVisible()
  })
})
