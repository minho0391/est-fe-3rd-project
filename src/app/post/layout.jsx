// [게시글 공통 레이아웃]
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { SITE_NAME, buildOpenGraph } from "@/lib/site";

const TITLE = "커뮤니티";
const DESCRIPTION =
  "모임에서 실제로 통했던 대화 소재와 후기를 나누는 공간입니다. AI가 만든 가이드를 다듬어 공유하고 다른 사람의 방법도 살펴보세요.";

// default: /post 자체에 쓰이는 title (루트 template 이 사이트명을 붙여줍니다)
// template: 하위 페이지(/post/write 등)에도 사이트명이 붙도록 다시 선언합니다.
//           중간 layout 이 title 을 문자열로 두면 루트 template 이 하위로 전파되지 않습니다.
export const metadata = {
  title: {
    default: TITLE,
    template: `%s | ${SITE_NAME}`,
  },
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
