import { test, expect } from "@playwright/test";

// 생성 실패 화면은 ?forceError=true 로 바로 들어갈 수 있어 로그인이 필요 없습니다.
const hasHorizontalOverflow = page =>
  page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);

test.describe("생성 실패 화면 - 모바일 375", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("가로 스크롤이 없다", async ({ page }) => {
    await page.goto("/generate/loading?forceError=true");
    await page.waitForLoadState("networkidle");

    expect(await hasHorizontalOverflow(page)).toBe(false);
  });
});
