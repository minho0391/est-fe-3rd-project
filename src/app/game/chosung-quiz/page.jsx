import ChosungQuiz from "@/components/games/ChosungQuiz";
import { SITE_NAME, buildOpenGraph } from "@/lib/site";

const TITLE = "초성 퀴즈";
const DESCRIPTION = "직접 문제를 내고 초성 힌트로 맞히는 퀴즈 게임입니다.";

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: buildOpenGraph({
    title: `${TITLE} | ${SITE_NAME}`,
    description: DESCRIPTION,
  }),
};

export default function ChosungQuizPage() {
  return <ChosungQuiz />;
}
