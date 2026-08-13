import { test, expect } from "@playwright/test";

// 카드가 같은 줄에 있는지는 y 좌표로 판단합니다.
// CSS 값을 직접 비교하면 스타일을 조금만 고쳐도 깨져서, 화면에 보이는 결과만 확인합니다.
const topOf = async locator => {
  const box = await locator.boundingBox();
  return Math.round(box.y);
};

test.describe("모바일 375", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("헤더는 햄버거만 보이고 가로 메뉴는 숨는다", async ({ page }) => {
    await page.goto("/");

    const header = page.locator("header");
    await expect(header.getByRole("button", { name: "메뉴 열기" })).toBeVisible();
    await expect(header.getByRole("link", { name: "대화 생성" })).toBeHidden();
  });

  test("햄버거를 누르면 메뉴 항목이 나온다", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "메뉴 열기" }).click();

    await expect(page.getByRole("menuitem", { name: "대화 생성" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "커뮤니티" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "카드 뒤집기" })).toBeVisible();
  });

  test("프리셋 카드는 2열, 게임 카드는 1열", async ({ page }) => {
    await page.goto("/");

    // 2열이면 1번째와 2번째가 같은 줄, 3번째는 아랫줄입니다.
    expect(await topOf(page.getByRole("link", { name: /회식/ }))).toBe(
      await topOf(page.getByRole("link", { name: /소개팅/ })),
    );
    expect(await topOf(page.getByRole("link", { name: /신입 OT/ }))).toBeGreaterThan(
      await topOf(page.getByRole("link", { name: /회식/ })),
    );

    // 1열이면 게임 카드끼리 줄이 전부 다릅니다.
    expect(await topOf(page.getByRole("link", { name: /랜덤 픽/ }))).toBeGreaterThan(
      await topOf(page.getByRole("link", { name: /카드 뒤집기/ })),
    );
  });
});

test.describe("태블릿 768", () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test("가로 메뉴가 돌아오고 햄버거는 숨는다", async ({ page }) => {
    await page.goto("/");

    const header = page.locator("header");
    await expect(header.getByRole("link", { name: "대화 생성" })).toBeVisible();
    await expect(header.getByRole("button", { name: "메뉴 열기" })).toBeHidden();
  });

  test("게임 카드는 3열", async ({ page }) => {
    await page.goto("/");

    const first = await topOf(page.getByRole("link", { name: /카드 뒤집기/ }));
    expect(await topOf(page.getByRole("link", { name: /랜덤 픽/ }))).toBe(first);
    expect(await topOf(page.getByRole("link", { name: /초성 퀴즈/ }))).toBe(first);
  });
});

test.describe("PC 1280", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test("프리셋 카드 4개가 한 줄에 놓인다", async ({ page }) => {
    await page.goto("/");

    const first = await topOf(page.getByRole("link", { name: /회식/ }));
    expect(await topOf(page.getByRole("link", { name: /소개팅/ }))).toBe(first);
    expect(await topOf(page.getByRole("link", { name: /신입 OT/ }))).toBe(first);
    expect(await topOf(page.getByRole("link", { name: /MT/ }))).toBe(first);
  });
});
