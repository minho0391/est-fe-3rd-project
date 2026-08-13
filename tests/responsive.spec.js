import { test, expect } from "@playwright/test";

// 카드가 같은 줄에 있는지는 y 좌표로 판단합니다.
// CSS 값을 직접 비교하면 스타일을 조금만 고쳐도 깨져서, 화면에 보이는 결과만 확인합니다.
const topOf = async locator => {
  const box = await locator.boundingBox();
  return Math.round(box.y);
};

// 카드에 hover 모션(translateY)이 걸려 있어 좌표가 몇 px 흔들립니다.
// 같은 줄인지만 보면 되므로 약간의 오차는 허용합니다.
const ROW_TOLERANCE = 12;

const expectSameRow = (a, b) => expect(Math.abs(a - b)).toBeLessThanOrEqual(ROW_TOLERANCE);
const expectLowerRow = (lower, upper) => expect(lower - upper).toBeGreaterThan(ROW_TOLERANCE);

// 가로 스크롤이 생기면 문서 폭이 화면보다 커집니다.
const hasHorizontalOverflow = page =>
  page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);

// 콘텐츠 카드 모드로 들어갑니다.
// 콘텐츠를 다 받아오면 안내 문구가 바뀌고 형식 칩 줄이 새로 생기면서 카드가 아래로 밀립니다.
// 좌표를 재기 전에 화면이 자리를 잡을 때까지 기다려야 합니다.
const openContentMode = async page => {
  await page.goto("/game/card-game");
  await page.getByRole("button", { name: /콘텐츠 카드/ }).click();

  await expect(page.getByRole("heading", { name: "카드를 뒤집으면 질문이 나와요" })).toBeVisible();
  await expect(page.getByRole("button", { name: "전체" })).toBeVisible();
  await expect(page.getByRole("button", { name: "M" })).toHaveCount(4);

  // 클릭한 자리에 커서가 남아 카드에 hover 가 걸리므로 치워둡니다.
  await page.mouse.move(0, 0);
};

// 초성 퀴즈 출제를 마치고 플레이 화면까지 들어갑니다.
const openQuizPlay = async page => {
  await page.goto("/game/chosung-quiz");

  await page.getByRole("textbox", { name: "정답 단어" }).fill("소개팅");
  await page.getByRole("button", { name: "문제 내기" }).click();

  await expect(page.getByRole("button", { name: "정답 공개" })).toBeVisible();
};

// 랜덤 픽은 공 섞기가 2.4초 걸려서 건너뛰기로 줄입니다.
const openRandomPick = async page => {
  await page.goto("/game/random-pick");

  const skip = page.getByRole("button", { name: "건너뛰기" });
  if (await skip.isVisible()) await skip.click();

  await expect(page.getByRole("heading", { name: "마음에 드는 공을 하나 고르세요" })).toBeVisible();
  await page.mouse.move(0, 0);
};

// 팀원 화면(커뮤니티·인증·대화 생성)은 CSS 미디어쿼리나 MUI 로 반응형이 이미 잡혀 있어
// 열 수를 세는 대신 가로 스크롤만 훑습니다. 깨지는 화면이 있으면 여기서 걸립니다.
const PUBLIC_PAGES = [
  { path: "/post", label: "커뮤니티 홈" },
  { path: "/post/list", label: "게시글 목록" },
  { path: "/sign-in", label: "로그인" },
  { path: "/sign-up", label: "회원가입" },
  { path: "/generate", label: "대화 생성" },
];

// 데이터가 늦게 도착하면서 폭이 늘어날 수 있어 본문이 다 그려질 때까지 기다립니다.
const gotoAndSettle = async (page, path) => {
  await page.goto(path);
  await page.waitForLoadState("networkidle");
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
    expectSameRow(
      await topOf(page.getByRole("link", { name: /회식/ })),
      await topOf(page.getByRole("link", { name: /소개팅/ })),
    );
    expectLowerRow(
      await topOf(page.getByRole("link", { name: /신입 OT/ })),
      await topOf(page.getByRole("link", { name: /회식/ })),
    );

    // 1열이면 게임 카드끼리 줄이 전부 다릅니다.
    expectLowerRow(
      await topOf(page.getByRole("link", { name: /랜덤 픽/ })),
      await topOf(page.getByRole("link", { name: /카드 뒤집기/ })),
    );
  });

  test("메인 페이지에 가로 스크롤이 없다", async ({ page }) => {
    await page.goto("/");
    expect(await hasHorizontalOverflow(page)).toBe(false);
  });

  test("형식 전체 보기는 2열이다", async ({ page }) => {
    await page.goto("/formats");

    const first = page.getByRole("link", { name: /질문/ });
    const second = page.getByRole("link", { name: /밸런스/ });
    const third = page.getByRole("link", { name: /대화주제/ });

    await expect(first).toBeVisible();

    expectSameRow(await topOf(first), await topOf(second));
    expectLowerRow(await topOf(third), await topOf(first));
    expect(await hasHorizontalOverflow(page)).toBe(false);
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
    expectSameRow(await topOf(page.getByRole("link", { name: /랜덤 픽/ })), first);
    expectSameRow(await topOf(page.getByRole("link", { name: /초성 퀴즈/ })), first);
  });
});

test.describe("PC 1280", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test("프리셋 카드 4개가 한 줄에 놓인다", async ({ page }) => {
    await page.goto("/");

    const first = await topOf(page.getByRole("link", { name: /회식/ }));
    expectSameRow(await topOf(page.getByRole("link", { name: /소개팅/ })), first);
    expectSameRow(await topOf(page.getByRole("link", { name: /신입 OT/ })), first);
    expectSameRow(await topOf(page.getByRole("link", { name: /MT/ })), first);
  });
});

test.describe("카드 뒤집기 - 모바일 375", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("모드 선택 카드는 세로로 쌓인다", async ({ page }) => {
    await page.goto("/game/card-game");

    const content = page.getByRole("button", { name: /콘텐츠 카드/ });
    const joker = page.getByRole("button", { name: /조커 찾기/ });

    expectLowerRow(await topOf(joker), await topOf(content));
  });

  test("게임 카드 4장이 2x2 로 접힌다", async ({ page }) => {
    await openContentMode(page);

    const cards = page.getByRole("button", { name: "M" });

    const tops = [];
    for (let i = 0; i < 4; i += 1) tops.push(await topOf(cards.nth(i)));

    // 2x2 면 앞 두 장이 같은 줄, 뒤 두 장이 아랫줄입니다.
    expectSameRow(tops[0], tops[1]);
    expectSameRow(tops[2], tops[3]);
    expectLowerRow(tops[2], tops[0]);
  });

  test("카드 화면에 가로 스크롤이 없다", async ({ page }) => {
    await openContentMode(page);

    expect(await hasHorizontalOverflow(page)).toBe(false);
  });
});

test.describe("카드 뒤집기 - PC 1280", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test("게임 카드 4장이 한 줄에 놓인다", async ({ page }) => {
    await openContentMode(page);

    const cards = page.getByRole("button", { name: "M" });
    const first = await topOf(cards.nth(0));

    for (let i = 1; i < 4; i += 1) {
      expectSameRow(await topOf(cards.nth(i)), first);
    }
  });
});

test.describe("초성 퀴즈 - 모바일 375", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("힌트 두 칸이 세로로 쌓인다", async ({ page }) => {
    await page.goto("/game/chosung-quiz");

    const hint1 = page.getByRole("textbox", { name: "힌트 1" });
    const hint2 = page.getByRole("textbox", { name: "힌트 2" });

    await expect(hint1).toBeVisible();
    expectLowerRow(await topOf(hint2), await topOf(hint1));
  });

  test("출제 화면에 가로 스크롤이 없다", async ({ page }) => {
    await page.goto("/game/chosung-quiz");

    await expect(page.getByRole("button", { name: "문제 내기" })).toBeVisible();
    expect(await hasHorizontalOverflow(page)).toBe(false);
  });

  test("초성이 화면 밖으로 넘치지 않는다", async ({ page }) => {
    await openQuizPlay(page);

    expect(await hasHorizontalOverflow(page)).toBe(false);
  });

  test("정답 화면에도 가로 스크롤이 없다", async ({ page }) => {
    await openQuizPlay(page);
    await page.getByRole("button", { name: "정답 공개" }).click();

    await expect(page.getByRole("button", { name: "다음 문제" })).toBeVisible();
    expect(await hasHorizontalOverflow(page)).toBe(false);
  });
});

test.describe("초성 퀴즈 - PC 1280", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test("힌트 두 칸이 한 줄에 놓인다", async ({ page }) => {
    await page.goto("/game/chosung-quiz");

    const hint1 = page.getByRole("textbox", { name: "힌트 1" });
    const hint2 = page.getByRole("textbox", { name: "힌트 2" });

    await expect(hint1).toBeVisible();
    expectSameRow(await topOf(hint1), await topOf(hint2));
  });
});

test.describe("랜덤 픽 - 모바일 375", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("공 5개가 한 줄에 놓인다", async ({ page }) => {
    await openRandomPick(page);

    const balls = page.getByRole("button", { name: /번 공 선택$/ });
    await expect(balls).toHaveCount(5);

    const first = await topOf(balls.nth(0));
    for (let i = 1; i < 5; i += 1) {
      expectSameRow(await topOf(balls.nth(i)), first);
    }
  });

  test("가로 스크롤이 없다", async ({ page }) => {
    await openRandomPick(page);

    expect(await hasHorizontalOverflow(page)).toBe(false);
  });
});

test.describe("팀원 화면 - 모바일 375", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  for (const { path, label } of PUBLIC_PAGES) {
    test(`${label}에 가로 스크롤이 없다`, async ({ page }) => {
      await gotoAndSettle(page, path);

      expect(await hasHorizontalOverflow(page)).toBe(false);
    });
  }
});

test.describe("팀원 화면 - 태블릿 768", () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  for (const { path, label } of PUBLIC_PAGES) {
    test(`${label}에 가로 스크롤이 없다`, async ({ page }) => {
      await gotoAndSettle(page, path);

      expect(await hasHorizontalOverflow(page)).toBe(false);
    });
  }
});
