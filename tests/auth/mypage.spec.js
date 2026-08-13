import { expect, test } from "@playwright/test";

test("로그인 상태로 마이페이지가 열린다", async ({ page }) => {
  await page.goto("/post/mypage");

  await expect(page.getByRole("heading", { name: "나의 마이페이지" })).toBeVisible();

  // 닉네임은 헤더 계정 메뉴에도 있어서, 프로필 카드 쪽으로 좁혀서 확인합니다.
  await expect(page.locator(".mypage-profileName")).toHaveText("e2e테스터");
});

test("헤더에 닉네임이 보인다", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "내 계정 메뉴" })).toContainText("e2e테스터");
});

test("글쓰기 화면이 로그인 페이지로 튕기지 않는다", async ({ page }) => {
  await page.goto("/post/write");

  await expect(page).not.toHaveURL(/sign-in/);
  await expect(page.getByRole("heading", { name: "커뮤니티 글 작성" })).toBeVisible();
});
