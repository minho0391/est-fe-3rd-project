import { test, expect } from "@playwright/test";

// 강사님 시나리오: 댓글 → 답글 → 좋아요 → 삭제 후 댓글 수 정상 반영
// 댓글 수는 최상위 댓글 + 답글을 모두 포함한 값입니다.

const fillEditor = async (page, text) => {
  const editor = page.locator(".ql-editor");
  await editor.click();
  await page.keyboard.type(text);
  await expect(editor).toContainText(text);
};

const selectBoard = async (page, name) => {
  const select = page.locator("select.write-select");
  await expect(select.locator("option")).not.toHaveCount(0);
  await select.selectOption({ label: name });
};

// 테스트용 글을 하나 만들고 그 주소를 돌려줍니다.
const createPost = async (page, title) => {
  await page.goto("/post/write");
  await expect(page.getByRole("button", { name: "등록" })).toBeVisible();

  await selectBoard(page, "자유게시판");
  await page.getByPlaceholder("제목을 입력해 주세요.").fill(title);
  await fillEditor(page, "댓글 테스트용 본문입니다.");
  await page.getByRole("button", { name: "등록" }).click();

  await expect(page).toHaveURL(/\/post\/\d+$/);
  return page.url();
};

const commentCount = page => page.locator(".comments-count");

test("댓글과 답글을 달고 좋아요를 누른 뒤 삭제하면 댓글 수가 맞게 줄어든다", async ({ page }) => {
  page.on("dialog", dialog => dialog.accept());

  const postUrl = await createPost(page, `E2E 댓글 ${Date.now()}`);

  // 1. 댓글 등록
  await page.getByPlaceholder("내용을 입력해주세요.").fill("첫 댓글입니다.");
  await page.locator(".comments-inputActionRow").getByRole("button", { name: "등록" }).click();

  await expect(page.getByText("첫 댓글입니다.")).toBeVisible();
  await expect(commentCount(page)).toHaveText("1");

  // 2. 답글 등록
  await page.getByRole("button", { name: "답글" }).first().click();
  await page.getByPlaceholder("답글을 입력해주세요.").fill("답글입니다.");
  await page.locator(".comments-replyForm").getByRole("button", { name: "등록" }).click();

  await expect(page.getByText("답글입니다.")).toBeVisible();
  await expect(commentCount(page)).toHaveText("2");

  // 3. 좋아요 — 누르면 숫자가 1 올라갑니다.
  const likeButton = page.getByRole("button", { name: /좋아요 \d+/ }).first();
  await likeButton.click();
  await expect(likeButton).toHaveText(/좋아요 1/);

  // 4. 답글 삭제 → 댓글 수가 1로 줄어야 합니다.
  await page.getByRole("button", { name: "댓글 더보기" }).last().click();
  await page.getByRole("button", { name: "삭제하기" }).click();

  await expect(page.getByText("답글입니다.")).toHaveCount(0);
  await expect(commentCount(page)).toHaveText("1");

  // 뒷정리 — 만든 글을 지웁니다.
  await page.goto(postUrl);
  await page.getByRole("button", { name: "게시글 더보기" }).click();
  await page.getByRole("menuitem", { name: "삭제하기" }).click();
  await expect(page).toHaveURL(/\/post\/list/);
});
