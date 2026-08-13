import { expect, test } from "@playwright/test";

// 로그인 없이 열리는 화면들이 에러 없이 뜨는지만 확인합니다.
const pages = [
  { path: "/", name: "메인" },
  { path: "/post", name: "커뮤니티 메인" },
  { path: "/post/list", name: "커뮤니티 목록" },
  { path: "/formats", name: "형식 소개" },
  { path: "/generate", name: "대화 생성" },
  { path: "/game/card-game", name: "카드 뒤집기" },
  { path: "/game/random-pick", name: "랜덤 픽" },
  { path: "/game/chosung-quiz", name: "초성 퀴즈" },
];

for (const { path, name } of pages) {
  test(`${name} 화면이 에러 없이 열린다`, async ({ page }) => {
    const pageErrors = [];
    page.on("pageerror", error => pageErrors.push(error.message));

    const response = await page.goto(path);

    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator("footer")).toBeVisible();
    expect(pageErrors).toEqual([]);
  });
}
