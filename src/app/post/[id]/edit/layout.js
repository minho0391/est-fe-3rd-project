// 작성자 본인만 쓰는 화면이라 색인 대상이 아닙니다.
export const metadata = {
  title: "게시글 수정",
  robots: { index: false, follow: false },
};

export default function PostEditLayout({ children }) {
  return children;
}
