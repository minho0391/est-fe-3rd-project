export const presets = [
  { id: "hoesik", label: "회식", image: "/preset-hoesik.webp" },
  { id: "sogaeting", label: "소개팅", image: "/preset-sogaeting.webp" },
  { id: "ot", label: "신입 OT", image: "/preset-ot.webp" },
  { id: "mt", label: "MT", image: "/preset-mt.webp" },
];

export const types = [
  {
    id: "question",
    title: "질문",
    description: "가벼운 아이스브레이킹용",
    icon: "/type-question.svg",
  },
  {
    id: "balance",
    title: "밸런스",
    description: "호불호가 확실한 선택지",
    icon: "/type-balance.svg",
  },
  { id: "topic", title: "대화주제", description: "깊이 있는 대화를 위한", icon: "/type-topic.svg" },
  {
    id: "mission",
    title: "미션",
    description: "함께 수행하는 재미있는 행동",
    icon: "/type-mission.svg",
  },
];

export const games = [
  {
    id: "cardflip",
    href: "/game/card-game",
    title: "카드 뒤집기",
    description: "어떤 대화가 나올지 모르는 스릴 넘치는 카드 선택",
    icon: "/game-cardflip.svg",
  },
  {
    id: "randompick",
    href: "/game/random-pick",
    title: "랜덤 픽",
    description: "AI가 무작위로 선정하는 오늘의 가장 뜨거운 주제",
    icon: "/game-randompick.svg",
  },
  {
    id: "chosung",
    href: "/game/chosung-quiz",
    title: "초성 퀴즈",
    description: "두뇌 풀가동! 상황별 키워드를 초성으로 맞혀보세요",
    icon: "/game-chosung.svg",
  },
];
