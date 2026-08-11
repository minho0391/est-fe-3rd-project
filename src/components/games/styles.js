// 게임 화면 공용 sx
//
// 여러 게임 컴포넌트가 함께 쓰는 값만 모읍니다.
// 앱 전체가 쓰는 색·타이포·버튼 규격은 src/lib/theme.js 에 있고,
// 한 파일 안에서만 반복되는 건 그 파일의 지역 상수로 둡니다.

// 카드 앞뒷면 공통 크기 (뒷면 GameCardBack, 앞면 콘텐츠/조커 카드)
export const CARD_WIDTH = 220;
export const CARD_HEIGHT = 300;

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

/** 안내 문구 + 카드 줄 + 버튼을 감싸는 바깥 영역 */
export const playAreaSx = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 6,
};

/** 카드가 나란히 놓이는 줄 */
export const cardRowSx = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  width: "100%",
  px: 4,
  perspective: "1200px",
};

/** 게임 화면 단독 액션 버튼 ("다시 시작", 결과 모달 "확인") */
export const gameButtonSx = { width: 240 };

/** 결과 모달 공통 백드롭 */
export const dialogBackdropSx = { bgcolor: "rgba(0, 0, 0, 0.7)" };

/** 결과 모달 paper 공통 규격 (배경·여백은 각 모달에서 덧붙입니다) */
export const dialogPaperBaseSx = {
  width: 448,
  maxWidth: "100%",
  m: 3,
};

/** 카드 자체를 그리는 모달 — paper 는 투명하게 두고 안쪽에서 그립니다 */
export const transparentPaperSx = {
  ...dialogPaperBaseSx,
  bgcolor: "transparent",
  boxShadow: "none",
  overflow: "visible",
};

/** 닫기 / 다음 두 버튼을 반반으로 놓는 줄 */
export const dialogActionRowSx = {
  display: "flex",
  gap: 2,
  justifyContent: "center",
  width: "100%",
  "& > *": { flex: "1 0 0", minWidth: 0 },
};

/** 한글 줄바꿈이 어색해지지 않도록 */
export const keepAllSx = { wordBreak: "keep-all" };
