import RandomPick from "@/components/games/RandomPick";
import { SITE_NAME, buildOpenGraph } from "@/lib/site";

const TITLE = "랜덤 픽";
const DESCRIPTION =
  "공을 뽑아 랜덤으로 대화 소재를 정하는 게임입니다. 질문·밸런스·미션 등 형식별로 골라 뽑을 수 있어요.";

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: buildOpenGraph({
    title: `${TITLE} | ${SITE_NAME}`,
    description: "공을 뽑아 랜덤으로 대화 소재를 정하는 게임입니다.",
  }),
};

export default function RandomPickPage() {
  return <RandomPick />;
}
