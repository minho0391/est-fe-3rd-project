import { expect, test } from "@playwright/test";

// 덮여 있는 카드 뒷면. 앞면으로 뒤집히면 이 이름에서 빠집니다.
// 결과 모달이 열려 있으면 뒤쪽 화면이 aria-hidden 처리되어 0으로 세지므로,
// 카드 수를 셀 때는 반드시 모달을 닫은 뒤에 확인합니다.
const coveredCards = page => page.getByRole("button", { name: "M", exact: true });

test.describe("콘텐츠 카드 모드", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/game/card-game");
    await page.getByRole("button", { name: "콘텐츠 카드" }).click();
  });

  test("카드를 뒤집으면 결과 모달이 뜬다", async ({ page }) => {
    const card = coveredCards(page).first();
    await expect(card).toBeEnabled({ timeout: 20000 });
    await card.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("button", { name: "닫기" })).toBeVisible();
  });

  test("다음 카드를 누르면 뒤에서 한 장씩 뒤집힌다", async ({ page }) => {
    const card = coveredCards(page).first();
    await expect(card).toBeEnabled({ timeout: 20000 });
    await card.click();

    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: "다음 카드" }).click();
    await dialog.getByRole("button", { name: "닫기" }).click();

    // 직접 한 장 + 모달에서 한 장 = 두 장이 뒤집혀 두 장만 남습니다.
    await expect(coveredCards(page)).toHaveCount(2);
  });

  test("네 장을 다 뒤집으면 다음 카드 버튼이 사라진다", async ({ page }) => {
    const card = coveredCards(page).first();
    await expect(card).toBeEnabled({ timeout: 20000 });
    await card.click();

    const dialog = page.getByRole("dialog");
    const nextButton = dialog.getByRole("button", { name: "다음 카드" });

    // 남은 세 장을 모달에서 이어서 뒤집습니다.
    for (let i = 0; i < 3; i += 1) await nextButton.click();

    await expect(nextButton).toHaveCount(0);

    await dialog.getByRole("button", { name: "닫기" }).click();
    await expect(coveredCards(page)).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "카드를 모두 뒤집었어요" })).toBeVisible();
  });

  test("형식을 바꾸면 뒤집은 카드가 다시 덮인다", async ({ page }) => {
    const card = coveredCards(page).first();
    await expect(card).toBeEnabled({ timeout: 20000 });
    await card.click();
    await page.getByRole("dialog").getByRole("button", { name: "닫기" }).click();

    await expect(coveredCards(page)).toHaveCount(3);

    await page.getByText("퀴즈", { exact: true }).click();
    await expect(coveredCards(page)).toHaveCount(4);
  });
});

test.describe("조커 찾기 모드", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/game/card-game");
    await page.getByRole("button", { name: "조커 찾기" }).click();
  });

  test("이번 판 벌칙이 화면에 보인다", async ({ page }) => {
    await expect(page.getByText("이번 판 벌칙")).toBeVisible({ timeout: 20000 });
  });

  test("조커를 밟으면 벌칙 모달이 뜬다", async ({ page }) => {
    await expect(page.getByText("이번 판 벌칙")).toBeVisible({ timeout: 20000 });

    const dialog = page.getByRole("dialog");

    // 조커는 네 장 중 하나이므로 최대 네 번 안에 나옵니다.
    for (let i = 0; i < 4; i += 1) {
      const covered = coveredCards(page);
      if ((await covered.count()) === 0) break;

      const first = covered.first();
      if (!(await first.isEnabled())) break;

      await first.click();
      await page.waitForTimeout(300);
      if (await dialog.isVisible()) break;
    }

    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("조커! 벌칙 당첨")).toBeVisible();
    await expect(dialog.getByRole("button", { name: "확인" })).toBeVisible();
  });
});
