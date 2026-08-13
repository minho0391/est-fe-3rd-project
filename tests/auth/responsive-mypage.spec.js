import { test, expect } from "@playwright/test";

// 로그인이 필요한 화면의 반응형 점검입니다.
// 세션은 playwright/.auth/user.json 을 재사용합니다.
const hasHorizontalOverflow = page =>
  page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);

// 닉네임은 헤더 계정 메뉴에도 있어 프로필 카드 쪽으로 좁힙니다.
const waitForMypage = async page => {
  await page.goto("/post/mypage");
  await expect(page.locator(".mypage-profileName")).toBeVisible();
  await page.waitForLoadState("networkidle");
};

// 모달 제목도 "회원정보 수정" 이라 이름으로 잡으면 겹칩니다. 메뉴 버튼으로 좁힙니다.
const openProfileEditor = async page => {
  await page.locator("button.mypage-menuItem", { hasText: "회원정보 수정" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
};

test.describe("마이페이지 - 모바일 375", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("마이페이지에 가로 스크롤이 없다", async ({ page }) => {
    await waitForMypage(page);

    expect(await hasHorizontalOverflow(page)).toBe(false);
  });

  test("글쓰기 화면에 가로 스크롤이 없다", async ({ page }) => {
    await page.goto("/post/write");

    await expect(page.getByRole("textbox").first()).toBeVisible();
    await page.waitForLoadState("networkidle");

    expect(await hasHorizontalOverflow(page)).toBe(false);
  });

  test("회원정보 수정 모달이 화면을 넘지 않는다", async ({ page }) => {
    await waitForMypage(page);
    await openProfileEditor(page);

    // 폭만 재면 overflow: hidden 에 가려 통과할 수 있어,
    // 실제로 조작할 수 있는지까지 봅니다.
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("button", { name: "저장" })).toBeVisible();
    await expect(dialog.getByRole("button", { name: "취소" })).toBeVisible();

    expect(await hasHorizontalOverflow(page)).toBe(false);
  });
});

test.describe("마이페이지 - 태블릿 768", () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test("마이페이지에 가로 스크롤이 없다", async ({ page }) => {
    await waitForMypage(page);

    expect(await hasHorizontalOverflow(page)).toBe(false);
  });

  test("회원정보 수정 모달이 화면을 넘지 않는다", async ({ page }) => {
    await waitForMypage(page);
    await openProfileEditor(page);

    expect(await hasHorizontalOverflow(page)).toBe(false);
  });
});
