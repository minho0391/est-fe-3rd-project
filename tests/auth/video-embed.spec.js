import { test, expect } from "@playwright/test";

// 영상/링크 삽입은 window.prompt 와 window.alert 로 동작합니다.
// prompt 에는 입력값을 넣어주고, alert 문구는 모아서 검증에 씁니다.
const runToolbarAction = async (page, buttonSelector, inputValue) => {
  const messages = [];
  let alertSeen = false;

  const handleDialog = async dialog => {
    if (dialog.type() === "prompt") {
      await dialog.accept(inputValue);
      return;
    }

    messages.push(dialog.message());
    if (dialog.type() === "alert") alertSeen = true;
    await dialog.accept();
  };

  page.on("dialog", handleDialog);

  await page.locator(".ql-editor").click();
  await page.locator(buttonSelector).click();
  await page.waitForTimeout(300);

  page.off("dialog", handleDialog);

  return { messages, alertSeen };
};

const insertVideo = (page, url) => runToolbarAction(page, "button.ql-video", url);

const insertLink = (page, url) => runToolbarAction(page, "button.ql-link", url);

test.beforeEach(async ({ page }) => {
  await page.goto("/post/write");
  await expect(page.locator(".ql-editor")).toBeVisible();
});

test("YouTube 일반 주소는 embed 주소로 바뀌어 삽입된다", async ({ page }) => {
  await insertVideo(page, "https://www.youtube.com/watch?v=dQw4w9WgXcQ");

  await expect(page.locator(".ql-editor iframe")).toHaveAttribute(
    "src",
    /youtube\.com\/embed\/dQw4w9WgXcQ/,
  );
});

test("youtu.be 단축 주소도 embed 주소로 바뀐다", async ({ page }) => {
  await insertVideo(page, "https://youtu.be/dQw4w9WgXcQ");

  await expect(page.locator(".ql-editor iframe")).toHaveAttribute(
    "src",
    /youtube\.com\/embed\/dQw4w9WgXcQ/,
  );
});

test("YouTube Shorts 주소도 embed 주소로 바뀐다", async ({ page }) => {
  await insertVideo(page, "https://www.youtube.com/shorts/dQw4w9WgXcQ");

  await expect(page.locator(".ql-editor iframe")).toHaveAttribute(
    "src",
    /youtube\.com\/embed\/dQw4w9WgXcQ/,
  );
});

test("YouTube 라이브 주소도 embed 주소로 바뀐다", async ({ page }) => {
  await insertVideo(page, "https://www.youtube.com/live/dQw4w9WgXcQ");

  await expect(page.locator(".ql-editor iframe")).toHaveAttribute(
    "src",
    /youtube\.com\/embed\/dQw4w9WgXcQ/,
  );
});

test("Vimeo 주소는 플레이어 주소로 바뀌어 삽입된다", async ({ page }) => {
  await insertVideo(page, "https://vimeo.com/76979871");

  await expect(page.locator(".ql-editor iframe")).toHaveAttribute(
    "src",
    /player\.vimeo\.com\/video\/76979871/,
  );
});

test("player.vimeo.com 주소도 그대로 허용된다", async ({ page }) => {
  await insertVideo(page, "https://player.vimeo.com/video/76979871");

  await expect(page.locator(".ql-editor iframe")).toHaveAttribute(
    "src",
    /player\.vimeo\.com\/video\/76979871/,
  );
});

test("YouTube·Vimeo 가 아닌 일반 주소는 안내를 띄우고 삽입하지 않는다", async ({ page }) => {
  const { messages, alertSeen } = await insertVideo(page, "https://www.naver.com");

  expect(alertSeen).toBe(true);
  expect(messages.some(message => message.includes("YouTube 또는 Vimeo"))).toBe(true);

  await expect(page.locator(".ql-editor iframe")).toHaveCount(0);
});

test("주소 형식이 아니면 안내를 띄우고 삽입하지 않는다", async ({ page }) => {
  const { messages, alertSeen } = await insertVideo(page, "그냥 텍스트");

  expect(alertSeen).toBe(true);
  expect(messages.some(message => message.includes("YouTube 또는 Vimeo"))).toBe(true);

  await expect(page.locator(".ql-editor iframe")).toHaveCount(0);
});

test("링크 버튼에 mailto 주소를 넣으면 안내를 띄우고 링크를 걸지 않는다", async ({ page }) => {
  const { alertSeen } = await insertLink(page, "mailto:test@test.com");

  expect(alertSeen).toBe(true);
  await expect(page.locator(".ql-editor a")).toHaveCount(0);
});

test("링크 버튼에 도메인만 넣으면 https 가 붙어 링크가 걸린다", async ({ page }) => {
  await insertLink(page, "naver.com");

  await expect(page.locator(".ql-editor a")).toHaveAttribute("href", /^https:\/\/naver\.com/);
});
