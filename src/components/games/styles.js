// 게임 화면 공용 sx
//
// 여러 게임 컴포넌트가 함께 쓰는 값만 모읍니다.
// 앱 전체가 쓰는 색·타이포·버튼 규격은 src/lib/theme.js 에 있고,
// 한 파일 안에서만 반복되는 건 그 파일의 지역 상수로 둡니다.

import { layout } from "@/lib/layout";

// 카드 앞뒷면 공통 크기 (뒷면 GameCardBack, 앞면 콘텐츠/조커 카드)
// 피그마: PC 220x300 / 태블릿·모바일 134x183
export const CARD_WIDTH = { xs: 134, lg: 220 };
export const CARD_HEIGHT = { xs: 183, lg: 300 };

// 카드 앞면이 나타날 때 살짝 뒤집히는 모션
export const FLIP_DURATION = 200;

const flipInSx = {
  "@keyframes flipIn": {
    from: { transform: "rotateY(-70deg)", opacity: 0 },
    to: { transform: "rotateY(0deg)", opacity: 1 },
  },
  animation: `flipIn ${FLIP_DURATION}ms cubic-bezier(0.2, 0.8, 0.3, 1)`,
  "@media (prefers-reduced-motion: reduce)": {
    animation: "none",
  },
};

/**
 * 게임 화면 바깥 영역 — 카드 뒤집기·랜덤 픽·초성 퀴즈가 함께 씁니다.
 * 세로 여백만 화면마다 달라서 py 는 각 화면에서 덧붙입니다.
 */
export const gamePageSx = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  flex: 1,
  width: "100%",
  px: layout.pagePx,
};

/** 위 영역 안쪽에서 최대 폭을 잡아주는 묶음 */
export const gameContentSx = {
  width: "100%",
  maxWidth: `${layout.maxWidth}px`,
};

/** 안내 문구 + 카드 줄 + 버튼을 감싸는 놀이 영역 */
export const playAreaSx = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: { xs: 4, lg: 6 },
};

/** 안내 문구와 칩 줄을 묶는 머리 영역 */
export const headGroupSx = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 2,
  width: "100%",
};

/** 뒤집힌 카드 앞면 공통 (테두리·여백은 각 화면에서 덧붙입니다) */
export const cardFaceSx = {
  display: "flex",
  flexDirection: "column",
  width: CARD_WIDTH,
  height: CARD_HEIGHT,
  flexShrink: 0,
  bgcolor: "background.paper",
  borderRadius: "20px",
  ...flipInSx,
};

/** 카드가 나란히 놓이는 줄 — 모바일에서는 2x2 로 접힙니다 */
export const cardRowSx = {
  display: "flex",
  flexWrap: { xs: "wrap", lg: "nowrap" },
  alignItems: "flex-start",
  justifyContent: { xs: "center", lg: "space-between" },
  gap: 2,
  width: "100%",
  px: { xs: 0, lg: 4 },
  perspective: "1200px",
};

/** 게임 화면 단독 액션 버튼 ("다시 시작", 결과 모달 "확인") */
export const gameButtonSx = { width: 240, maxWidth: "100%" };

/** 결과 모달 공통 백드롭 */
export const dialogBackdropSx = { bgcolor: "rgba(0, 0, 0, 0.7)" };

/** 결과 모달 paper 공통 규격 (배경·여백은 각 모달에서 덧붙입니다) */
export const dialogPaperBaseSx = {
  width: 448,
  maxWidth: "100%",
  m: { xs: 2, lg: 3 },
};

/** 카드 자체를 그리는 모달 — paper 는 투명하게 두고 안쪽에서 그립니다 */
export const transparentPaperSx = {
  ...dialogPaperBaseSx,
  bgcolor: "transparent",
  boxShadow: "none",
  overflow: "visible",
};

/** 닫기 / 다음 두 버튼을 놓는 줄 — 모바일에서는 세로로 쌓습니다 */
export const dialogActionRowSx = {
  display: "flex",
  flexDirection: { xs: "column", sm: "row" },
  gap: 2,
  justifyContent: "center",
  width: "100%",
  "& > *": { flex: "1 0 0", minWidth: 0 },
};

/** 한글 줄바꿈이 어색해지지 않도록 */
export const keepAllSx = { wordBreak: "keep-all" };

/** 형식 선택 칩이 놓이는 줄 */
export const formatFilterRowSx = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  gap: 1,
};

/** 형식 선택 칩 (전체 / 질문 / 밸런스 …) */
export const formatChipSx = { borderRadius: 5, px: 1, py: 2 };
