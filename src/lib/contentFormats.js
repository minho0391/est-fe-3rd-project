// 콘텐츠 형식 코드와 화면에 보여줄 이름.
// options 테이블의 category = 'format' 코드값과 같습니다.
// default_contents 를 쓰는 화면(랜덤 픽, 카드 뒤집기)이 함께 씁니다.

export const CONTENT_FORMATS = [
  "question",
  "topic",
  "mission",
  "humor",
  "balance",
  "quiz",
  "game",
  "penalty",
];

export const FORMAT_LABELS = {
  question: "질문",
  topic: "대화주제",
  mission: "미션",
  humor: "유머",
  balance: "밸런스",
  quiz: "퀴즈",
  game: "게임",
  penalty: "벌칙",
};

// default_contents 의 title 과 scripts 는 행마다 쓰임이 다릅니다.
//   (1) scripts 가 완결된 문장  → title 은 카테고리(관계·진행 등)
//   (2) scripts 가 키워드 목록  → title 이 주제 ("여행 이야기" + 가본 멋진 곳 …)
//   (3) scripts 가 비어 있음    → title 이 곧 본문
// 아래 두 함수가 세 경우를 한곳에서 판단합니다.

/** 본문으로 보여줄 줄 목록. scripts 가 비면 title 을 본문으로 씁니다. */
export const toContentLines = content => {
  const scripts = content?.scripts ?? [];
  return scripts.length > 0 ? scripts : [content?.title].filter(Boolean);
};

/** 본문 위에 title 을 주제로 함께 보여줄지 여부. */
export const needsContentTitle = content => {
  const scripts = content?.scripts ?? [];
  return scripts.length > 0 && scripts.every(script => script.length <= 20);
};
