import { SITE_NAME, buildOpenGraph } from "@/lib/site";

const TITLE = "대화 형식 한눈에 보기";
const DESCRIPTION =
  "질문·밸런스·대화주제·미션·유머·퀴즈·게임·벌칙 여덟 가지 형식을 한 곳에서 살펴보고, 모임 분위기에 맞는 대화 소재를 골라 보세요.";

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: buildOpenGraph({
    title: `${TITLE} | ${SITE_NAME}`,
    description: "여덟 가지 대화 형식을 한눈에 살펴보세요.",
  }),
};

export default function FormatsLayout({ children }) {
  return children;
}
