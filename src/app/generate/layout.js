import { SITE_NAME, buildOpenGraph } from "@/lib/site";

const TITLE = "AI 대화 소재 생성";
const DESCRIPTION =
  "첫 만남·회식·소개팅·MT 등 상황과 형식을 고르면 AI가 그 자리에 어울리는 대화 소재와 추천 대화문을 만들어 드립니다.";

// default: /generate 자체에 쓰이는 title (루트 template 이 사이트명을 붙여줍니다)
// template: 하위 페이지(/generate/loading·result)에도 사이트명이 붙도록 다시 선언합니다.
//           중간 layout 이 title 을 문자열로 두면 루트 template 이 하위로 전파되지 않습니다.
export const metadata = {
  title: {
    default: TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  openGraph: buildOpenGraph({
    title: `${TITLE} | ${SITE_NAME}`,
    description: "상황과 형식만 고르면 AI가 대화 소재를 만들어 드려요.",
  }),
};

export default function GenerateLayout({ children }) {
  return children;
}
