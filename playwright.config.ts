import { defineConfig } from "@playwright/test";
const existingService = process.env.PLAYWRIGHT_BASE_URL;
export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  workers: 1,
  use: { baseURL: existingService || "http://127.0.0.1:3100", headless: true },
  webServer: existingService
    ? undefined
    : {
        command: "npm run start -- --port 3100",
        url: "http://127.0.0.1:3100",
        reuseExistingServer: false,
        timeout: 60000,
      },
});
