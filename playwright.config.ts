import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  retries: 1,
  use: {
    baseURL: "http://localhost:3000",
    headless: true,
  },
  projects: [
    { name: "setup", testMatch: "auth.setup.ts" },
    {
      name: "public",
      testMatch: ["pages.spec.ts", "forms.spec.ts"],
      use: { browserName: "chromium" },
    },
    {
      name: "dashboard",
      testMatch: ["dashboard-forms.spec.ts", "dashboard-edit.spec.ts"],
      dependencies: ["setup"],
      use: {
        browserName: "chromium",
        storageState: "e2e/.auth/admin.json",
      },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 60_000,
  },
})
