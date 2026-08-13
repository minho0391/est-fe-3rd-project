// @ts-check
import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

// Playwright 는 .env.local 을 자동으로 읽지 않으므로 직접 불러옵니다.
dotenv.config({ path: ".env.local" });

// 로그인 한 번으로 얻은 세션을 여기 저장해 두고 인증 테스트가 재사용합니다.
export const STORAGE_STATE = "playwright/.auth/user.json";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },

  projects: [
    // 로그인해서 세션을 파일로 저장하는 준비 단계
    { name: "setup", testMatch: /auth\.setup\.js/ },

    // 로그인이 필요 없는 화면
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: [/auth\.setup\.js/, /auth\/.*/],
    },

    // 로그인 상태로 도는 화면
    {
      name: "chromium-logged-in",
      use: { ...devices["Desktop Chrome"], storageState: STORAGE_STATE },
      testMatch: /auth\/.*\.spec\.js/,
      dependencies: ["setup"],
    },
  ],

  // 테스트 시작 시 dev 서버를 알아서 켜고, 이미 켜져 있으면 그대로 씁니다.
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
