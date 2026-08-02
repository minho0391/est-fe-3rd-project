export const balls = [
  { id: "ball1" },
  { id: "ball2" },
  { id: "ball3" },
  { id: "ball4" },
  { id: "ball5" },
];

// 랜덤픽이 뽑아올 형식.
// balance는 scripts가 2개(A/B), quiz는 정답 노출 UI가 필요해서 제외
export const RANDOM_PICK_FORMATS = ["question", "topic", "mission", "humor"];

export const FORMAT_LABELS = {
  question: "질문",
  topic: "대화주제",
  mission: "미션",
  humor: "유머",
};
