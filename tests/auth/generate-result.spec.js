import { test, expect } from "@playwright/test";

// 앨런 호출은 10~60초라 테스트에서 새로 생성하지 않고,
// e2e테스터 계정으로 미리 만들어 둔 결과를 재사용합니다.
// generations RLS 가 "본인만" 이라 이 파일은 로그인 세션이 필요합니다.
//
// [주의] 이 행이 지워지면 테스트가 깨집니다. 계정·데이터 정리 시 함께 지우지 마세요.
const GENERATION_ID = "8674e326-9bf1-44d0-a1d2-2b8adc010bba";

const hasHorizontalOverflow = page =>
  page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);

const openResult = async page => {
  await page.goto(`/generate/result?id=${GENERATION_ID}`);

  // 결과 카드가 그려질 때까지 기다립니다.
  await expect(page.getByRole("button", { name: /가이드 저장/ })).toBeVisible();
  await page.waitForLoadState("networkidle");
};

test.describe("결과 화면 - 모바일 375", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("가로 스크롤이 없다", async ({ page }) => {
    await openResult(page);

    expect(await hasHorizontalOverflow(page)).toBe(false);
  });
});

test.describe("결과 화면 - 태블릿 768", () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test("가로 스크롤이 없다", async ({ page }) => {
    await openResult(page);

    expect(await hasHorizontalOverflow(page)).toBe(false);
  });
});

test.describe("결과 화면 - PC 1280", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test("가로 스크롤이 없다", async ({ page }) => {
    await openResult(page);

    expect(await hasHorizontalOverflow(page)).toBe(false);
  });
});
