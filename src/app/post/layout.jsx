// [게시글 공통 레이아웃]
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { SITE_NAME, buildOpenGraph } from "@/lib/site";

const TITLE = "커뮤니티";
const DESCRIPTION =
  "모임에서 실제로 통했던 대화 소재와 후기를 나누는 공간입니다. AI가 만든 가이드를 다듬어 공유하고 다른 사람의 방법도 살펴보세요.";

// 하위 페이지가 자체 layout 에서 title 을 선언하면 그쪽이 우선합니다.
export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: buildOpenGraph({
    title: `${TITLE} | ${SITE_NAME}`,
    description: "모임에서 통했던 대화 소재와 후기를 나누는 공간입니다.",
  }),
};

export default function PostLayout({ children }) {
  return (
    <>
      <Header />

      {children}

      <Footer />
    </>
  );
}
