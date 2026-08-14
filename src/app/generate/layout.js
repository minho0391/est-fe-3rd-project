import { SITE_NAME, buildOpenGraph } from "@/lib/site";

const TITLE = "AI 대화 소재 생성";
const DESCRIPTION =
  "첫 만남·회식·소개팅·MT 등 상황과 형식을 고르면 AI가 그 자리에 어울리는 대화 소재와 추천 대화문을 만들어 드립니다.";

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: buildOpenGraph({
    title: `${TITLE} | ${SITE_NAME}`,
    description: "상황과 형식만 고르면 AI가 대화 소재를 만들어 드려요.",
  }),
};

export default function GenerateLayout({ children }) {
  return children;
}
