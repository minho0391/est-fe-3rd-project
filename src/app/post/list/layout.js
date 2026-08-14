import { SITE_NAME, buildOpenGraph } from "@/lib/site";

const TITLE = "게시글 목록";
const DESCRIPTION =
  "자유게시판·질문게시판·후기게시판에 올라온 글을 모아 봅니다. 최신순·조회순·좋아요순으로 정렬해 원하는 글을 찾아보세요.";

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: buildOpenGraph({
    title: `${TITLE} | ${SITE_NAME}`,
    description: "커뮤니티에 올라온 글을 모아 봅니다.",
  }),
};

export default function PostListLayout({ children }) {
  return children;
}
