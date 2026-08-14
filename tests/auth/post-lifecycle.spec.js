import { test, expect } from "@playwright/test";

// 강사님 시나리오: 게시글 작성 → 수정 → 삭제
// 테스트가 만든 글은 마지막에 스스로 지웁니다.

// Quill 은 contenteditable 이라 fill() 이 안 먹는 경우가 있어 직접 입력합니다.
const fillEditor = async (page, text) => {
  const editor = page.locator(".ql-editor");
  await editor.click();
  await page.keyboard.type(text);
  await expect(editor).toContainText(text);
};

// 게시판 목록은 DB 에서 늦게 도착하므로 옵션이 채워질 때까지 기다립니다.
const selectBoard = async (page, name) => {
  const select = page.locator("select.write-select");
  await expect(select.locator("option")).not.toHaveCount(0);
  await select.selectOption({ label: name });
};

// 등록/수정이 막히면 화면에 사유가 뜹니다. 그걸 먼저 확인해야 원인을 알 수 있습니다.
const expectNoSubmitError = async page => {
  const error = page.locator(".write-submitError");
  if (await error.count()) {
    expect(await error.textContent()).toBeNull();
  }
};

test("게시글을 작성하고 수정한 뒤 삭제할 수 있다", async ({ page }) => {
  const title = `E2E 게시글 ${Date.now()}`;
  const editedTitle = `${title} (수정됨)`;

  // 1. 작성
  await page.goto("/post/write");
  await expect(page.getByRole("button", { name: "등록" })).toBeVisible();

  await selectBoard(page, "자유게시판");
  await page.getByPlaceholder("제목을 입력해 주세요.").fill(title);
  await page
    .getByPlaceholder("게시글에 대한 간단한 설명을 입력해 주세요.")
    .fill("E2E 테스트로 작성한 글입니다.");
  await fillEditor(page, "본문 내용입니다.");

  await page.getByRole("button", { name: "등록" }).click();

  await expectNoSubmitError(page);

  // 등록에 성공하면 상세 페이지로 이동합니다.
  await expect(page).toHaveURL(/\/post\/\d+$/);
  await expect(page.getByRole("heading", { name: title })).toBeVisible();

  const postUrl = page.url();

  // 2. 수정
  await page.goto(`${postUrl}/edit`);
  await expect(page.getByRole("button", { name: "수정하기" })).toBeVisible();

  await page.getByPlaceholder("제목을 입력해 주세요.").fill(editedTitle);
  await page.getByRole("button", { name: "수정하기" }).click();

  await expectNoSubmitError(page);
  await expect(page).toHaveURL(postUrl);
  await expect(page.getByRole("heading", { name: editedTitle })).toBeVisible();

  // 3. 삭제 — confirm 창을 수락합니다.
  page.on("dialog", dialog => dialog.accept());

  await page.getByRole("button", { name: "게시글 더보기" }).click();
  await page.getByRole("menuitem", { name: "삭제하기" }).click();

  // 삭제하면 목록으로 이동하고, 지운 글은 더 이상 보이지 않습니다.
  await expect(page).toHaveURL(/\/post\/list/);
  await expect(page.getByText(editedTitle)).toHaveCount(0);
});
