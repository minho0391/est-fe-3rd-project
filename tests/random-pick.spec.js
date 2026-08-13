import { expect, test } from "@playwright/test";

test("공을 고르면 결과 모달이 뜬다", async ({ page }) => {
  await page.goto("/game/random-pick");

  // 섞는 애니메이션이 끝나고 DB 조회가 완료되면 공이 눌립니다.
  const ball = page.getByRole("button", { name: "1번 공 선택" });
  await expect(ball).toBeEnabled({ timeout: 20000 });
  await ball.click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "다시 뽑기" })).toBeVisible();
});

test("형식 칩을 고르면 그 형식으로 뽑힌다", async ({ page }) => {
  await page.goto("/game/random-pick");

  await page.getByText("퀴즈", { exact: true }).click();

  const ball = page.getByRole("button", { name: "1번 공 선택" });
  await expect(ball).toBeEnabled({ timeout: 20000 });
  await ball.click();

  await expect(page.getByRole("dialog").getByText("퀴즈")).toBeVisible();
});
