import { expect, test as setup } from "@playwright/test";
import { STORAGE_STATE } from "../playwright.config.js";

setup("로그인 후 세션 저장", async ({ page }) => {
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;

  if (!email || !password) {
    throw new Error("E2E_EMAIL / E2E_PASSWORD 환경변수가 없습니다. .env.local 을 확인하세요.");
  }

  await page.goto("/sign-in");
  await page.getByPlaceholder("이메일을 입력하세요").fill(email);
  await page.getByPlaceholder("비밀번호를 입력하세요").fill(password);
  await page.getByRole("button", { name: "로그인", exact: true }).click();

  // 로그인이 끝나면 헤더에 닉네임이 나타납니다.
  await expect(page.getByText("e2e테스터")).toBeVisible({ timeout: 15000 });

  await page.context().storageState({ path: STORAGE_STATE });
});
