import CardGame from "@/components/games/CardGame";
import { SITE_NAME, buildOpenGraph } from "@/lib/site";

const TITLE = "카드 뒤집기";
const DESCRIPTION =
  "카드를 뒤집어 대화 소재를 뽑고, 조커를 밟으면 벌칙을 수행하는 모임 게임입니다. 질문·밸런스·퀴즈 등 형식을 골라서 즐길 수 있어요.";

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: buildOpenGraph({
    title: `${TITLE} | ${SITE_NAME}`,
    description: "카드를 뒤집어 대화 소재를 뽑는 모임 게임입니다.",
  }),
};

export default function CardGamePage() {
  return <CardGame />;
}
